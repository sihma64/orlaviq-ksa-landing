import { NextRequest, NextResponse } from "next/server";
import { sendOrderToGoogleSheets } from "../../../lib/googleSheets";

// Environment variables
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";
const GOOGLE_SHEETS_WEBHOOK_SECRET =
  process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || "";
const MAXMIND_ACCOUNT_ID = process.env.MAXMIND_ACCOUNT_ID || "";
const MAXMIND_LICENSE_KEY = process.env.MAXMIND_LICENSE_KEY || "";
const MAXMIND_MINFRAUD_ENDPOINT =
  process.env.MAXMIND_MINFRAUD_ENDPOINT ||
  "https://minfraud.maxmind.com/minfraud/v2.0/score";
const ORDER_ALLOWED_COUNTRY = process.env.ORDER_ALLOWED_COUNTRY || "SA";
const ORDER_MAX_RISK_SCORE = parseInt(
  process.env.ORDER_MAX_RISK_SCORE || "20",
  10
);
const ORDER_PHONE_WHITELIST = process.env.ORDER_PHONE_WHITELIST || "0550000000";
const WHATSAPP_NUMBER = process.env.WHATSAPP_RECEIVER_NUMBER || process.env.WHATSAPP_NUMBER || "212716296177";

interface OrderGuardRequest {
  fullName: string;
  phone: string;
  city: string;
  fullAddress?: string;
  offerLabel: string;
  offerPrice: string;
}

interface MaxMindResponse {
  risk_score?: number;
  ip_address?: {
    risk?: number;
  };
  country?: {
    iso_code?: string;
  };
  // MaxMind may provide these fields for anonymizer/VPN/proxy detection
  ip_address_risk_reasons?: string[];
  disposition?: {
    action?: string;
  };
}

/**
 * Extract real client IP from request headers
 */
function getClientIp(request: NextRequest): string {
  // Priority 1: Cloudflare header
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Priority 2: X-Forwarded-For (take first IP)
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0]) {
      return ips[0];
    }
  }

  // Priority 3: X-Real-IP
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }

  // Fallback for local development
  return "127.0.0.1";
}

/**
 * Normalize phone number (remove spaces, dashes, etc.)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

/**
 * Extract numeric price from string like "99 ريال" or "169 ريال"
 */
function extractNumericPrice(priceString: string): number {
  const match = priceString.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Generate a unique order ID for tracking
 */
function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}


/**
 * Call MaxMind minFraud Score API
 */
async function checkMaxMindFraud(
  clientIp: string,
  orderId: string,
  phone: string,
  city: string,
  numericPrice: number
): Promise<MaxMindResponse> {
  const auth = Buffer.from(
    `${MAXMIND_ACCOUNT_ID}:${MAXMIND_LICENSE_KEY}`
  ).toString("base64");

  const payload = {
    device: {
      ip_address: clientIp,
    },
    event: {
      transaction_id: orderId,
      type: "order",
    },
    order: {
      amount: numericPrice,
      currency: "SAR",
    },
    shipping_address: {
      country: "SA",
      city: city || undefined,
    },
    shipping_phone: {
      number: phone,
      country_code: "SA",
    },
  };

  const response = await fetch(MAXMIND_MINFRAUD_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
  const errorBody = await response.text();

  throw new Error(
    `MAXMIND_ERROR_${response.status}: ${errorBody.slice(0, 300)}`
  );
}

  return response.json();
}


function cleanPhone(phone: string): string {
  return String(phone || "")
    .replace(/[\s\-()]/g, "")
    .replace(/^\+/, "")
    .replace(/^00966/, "966");
}

function getPhoneVariants(phone: string): string[] {
  const cleaned = cleanPhone(phone);

  const withoutCountry = cleaned.startsWith("966")
    ? cleaned.slice(3)
    : cleaned;

  const withoutLeadingZero = withoutCountry.startsWith("0")
    ? withoutCountry.slice(1)
    : withoutCountry;

  const variants = [
    cleaned,
    withoutCountry,
    withoutLeadingZero,
    `0${withoutLeadingZero}`,
    `966${withoutLeadingZero}`,
    `+966${withoutLeadingZero}`,
  ];

  return Array.from(new Set(variants.filter(Boolean)));
}

function isWhitelistedPhone(phone: string): boolean {
  const whitelistRaw = ORDER_PHONE_WHITELIST || "";

  const phoneVariants = getPhoneVariants(phone);

  const whitelistVariants = whitelistRaw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => getPhoneVariants(item));

  const whitelistSet = new Set(whitelistVariants);

  const isWhitelisted = phoneVariants.some((variant) =>
    whitelistSet.has(variant)
  );

  console.log("ORDER_GUARD_PHONE_CHECK", {
    phoneNormalized: phoneVariants[0],
    whitelistNormalized: Array.from(whitelistSet),
    isWhitelisted,
  });

  return isWhitelisted;
}

async function saveOrderAndReturnResponse(
  reason: string,
  orderData: {
    fullName: string;
    phone: string;
    city: string;
    fullAddress: string;
    offerLabel: string;
    offerPrice: string;
    clientIp: string;
    userAgent: string;
  }
) {
  const {
    fullName,
    phone,
    city,
    fullAddress,
    offerLabel,
    offerPrice,
    clientIp,
    userAgent,
  } = orderData;
  const orderId = generateOrderId();

  // Generate Order date and Order time in Asia/Riyadh timezone
  const now = new Date();
  const orderDate = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Riyadh",
  }).format(now);
  const orderTime = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Riyadh",
    hour12: false,
  }).format(now);

  // Extract quantity from offerLabel
  let quantity = 1;
  if (offerLabel.includes("قطعتين")) {
    quantity = 2;
  } else if (offerLabel.includes("3")) {
    quantity = 3;
  }

  const numericPrice = extractNumericPrice(offerPrice);

  const whatsappMessage = `السلام عليكم، أريد تأكيد طلبي من ORLAVIQ.

رقم الطلب: ${orderId}
المنتج: موزع روائح بتأثير اللهب
العرض: ${offerLabel}
السعر الإجمالي: ${offerPrice}
الاسم: ${fullName}
رقم الجوال: ${phone}
المدينة: ${city || 'غير محدد'}
العنوان: ${fullAddress || 'غير محدد'}
طريقة الدفع: الدفع عند الاستلام`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const googleSheetPayload = {
    "Order date": orderDate,
    "Order time": orderTime,
    "Order ID": orderId,
    "Full name*": fullName,
    "Phone*": phone,
    whatsapp_link: whatsappUrl,
    "confirmation by whatsapp": "NO",
    "Country*": "SA",
    City: city,
    "العنوان الكامل - Full Address": fullAddress,
    "SKU*": "ORLAVIQ-FLAME-DIFFUSER",
    "Total quantity*": quantity,
    "Total with customer currency*": numericPrice,
    "Order customer currency*": "SAR",
    Note: "status=new_order; deliveryStatus=pending",
  };

  const googleSheetsResult = await sendOrderToGoogleSheets(googleSheetPayload);

  if (!googleSheetsResult.ok) {
    console.error("Failed to save order to Google Sheets", googleSheetsResult);
    return NextResponse.json(
      {
        allowed: false,
        reason: "PERSISTENCE_ERROR",
        message: "Failed to save order to Google Sheets.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    allowed: true,
    reason,
    whatsappUrl,
    orderId,
  });
}

/**
 * Main POST handler for order guard
 */
export async function POST(request: NextRequest) {
  try {
    // Check for Google Sheets config first
    if (!GOOGLE_SHEETS_WEBHOOK_URL || !GOOGLE_SHEETS_WEBHOOK_SECRET) {
      console.error(
        "CRITICAL: GOOGLE_SHEETS_WEBHOOK_URL or GOOGLE_SHEETS_WEBHOOK_SECRET is not set."
      );
      return NextResponse.json(
        {
          allowed: false,
          reason: "SERVER_CONFIGURATION_ERROR",
          message: "Google Sheets integration is not configured.",
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body: OrderGuardRequest = await request.json();
    const { fullName, phone, city, fullAddress, offerLabel, offerPrice } = body;

    // Validate required fields
    if (!fullName || !phone || !offerLabel || !offerPrice) {
      return NextResponse.json(
        {
          allowed: false,
          reason: "MISSING_REQUIRED_FIELDS",
        },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "";

    const orderData = {
      fullName,
      phone,
      city,
      fullAddress: fullAddress || "",
      offerLabel,
      offerPrice,
      clientIp,
      userAgent,
    };

    // Check if phone is whitelisted
    if (isWhitelistedPhone(phone)) {
      return await saveOrderAndReturnResponse(
        "WHITELISTED_TEST_NUMBER",
        orderData
      );
    }

    // Check if MaxMind credentials are configured
    if (!MAXMIND_ACCOUNT_ID || !MAXMIND_LICENSE_KEY) {
      console.warn(
        "MaxMind credentials not configured. Allowing order by default."
      );
      return await saveOrderAndReturnResponse(
        "MAXMIND_NOT_CONFIGURED",
        orderData
      );
    }

    // Extract numeric price
    const numericPrice = extractNumericPrice(offerPrice);

    // Generate order ID for MaxMind check
    const orderId = generateOrderId();

    // Call MaxMind minFraud Score API
    let maxmindResponse: MaxMindResponse;
    try {
      maxmindResponse = await checkMaxMindFraud(
        clientIp,
        orderId,
        normalizePhone(phone),
        city,
        numericPrice
      );
    } catch (error) {
      const debugMessage =
        error instanceof Error ? error.message : String(error);
      console.error("ORDER_GUARD_MAXMIND_ERROR", debugMessage);
      return NextResponse.json({
        allowed: false,
        reason: "MAXMIND_ERROR",
      });
    }

    // Decision logic based on MaxMind response

    // 1. Check country
    if (
      maxmindResponse.country?.iso_code &&
      maxmindResponse.country.iso_code !== ORDER_ALLOWED_COUNTRY
    ) {
      return NextResponse.json({
        allowed: false,
        reason: "OUTSIDE_KSA",
      });
    }

    // 2. Check overall risk score
    if (
      maxmindResponse.risk_score !== undefined &&
      maxmindResponse.risk_score >= ORDER_MAX_RISK_SCORE
    ) {
      return NextResponse.json({
        allowed: false,
        reason: "HIGH_RISK_SCORE",
      });
    }

    // 3. Check IP address risk
    if (
      maxmindResponse.ip_address?.risk !== undefined &&
      maxmindResponse.ip_address.risk >= ORDER_MAX_RISK_SCORE
    ) {
      return NextResponse.json({
        allowed: false,
        reason: "HIGH_RISK_IP",
      });
    }

    // 4. Check for VPN/Proxy/Anonymizer signals
    if (maxmindResponse.ip_address_risk_reasons) {
      const suspiciousReasons = [
        "ANONYMOUS_IP",
        "HOSTING_PROVIDER",
        "PUBLIC_PROXY",
        "TOR_EXIT_NODE",
        "VPN",
      ];

      const hasSuspiciousReason = maxmindResponse.ip_address_risk_reasons.some(
        (reason) =>
          suspiciousReasons.some((suspicious) =>
            reason.toUpperCase().includes(suspicious)
          )
      );

      if (hasSuspiciousReason) {
        return NextResponse.json({
          allowed: false,
          reason: "VPN_OR_PROXY_DETECTED",
        });
      }
    }

    // All checks passed - allow order
    return await saveOrderAndReturnResponse("APPROVED", orderData);
  } catch (error) {
    console.error("Order guard error:", error);
    return NextResponse.json(
      {
        allowed: false,
        reason: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
