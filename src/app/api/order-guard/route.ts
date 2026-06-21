import { NextRequest, NextResponse } from "next/server";

// Environment variables
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
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "212716296177";

interface OrderGuardRequest {
  fullName: string;
  phone: string;
  city: string;
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
 * Build WhatsApp URL with order details
 */
function buildWhatsappUrl(
  fullName: string,
  phone: string,
  city: string,
  offerLabel: string,
  offerPrice: string
): string {
  const cityLine = city.trim() ? `\nالمدينة: ${city}` : "";

  const message = `السلام عليكم، أريد تأكيد طلب موزع روائح بتأثير اللهب من ORLAVIQ.

الطلب: ${offerLabel}
السعر: ${offerPrice}

الاسم الشخصي: ${fullName}
رقم الجوال: ${phone}${cityLine}

طريقة الدفع: الدفع عند الاستلام`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
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
    throw new Error(`MaxMind API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Main POST handler for order guard
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: OrderGuardRequest = await request.json();
    const { fullName, phone, city, offerLabel, offerPrice } = body;

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

    // Get client IP
    const clientIp = getClientIp(request);

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);

    // Check if phone is whitelisted
    const whitelistedPhones = ORDER_PHONE_WHITELIST.split(",").map((p) =>
      normalizePhone(p.trim())
    );

    if (whitelistedPhones.includes(normalizedPhone)) {
      const whatsappUrl = buildWhatsappUrl(
        fullName,
        phone,
        city,
        offerLabel,
        offerPrice
      );

      return NextResponse.json({
        allowed: true,
        reason: "WHITELISTED_TEST_NUMBER",
        whatsappUrl,
      });
    }

    // Check if MaxMind credentials are configured
    if (!MAXMIND_ACCOUNT_ID || !MAXMIND_LICENSE_KEY) {
      console.warn(
        "MaxMind credentials not configured. Allowing order by default."
      );
      const whatsappUrl = buildWhatsappUrl(
        fullName,
        phone,
        city,
        offerLabel,
        offerPrice
      );

      return NextResponse.json({
        allowed: true,
        reason: "MAXMIND_NOT_CONFIGURED",
        whatsappUrl,
      });
    }

    // Extract numeric price
    const numericPrice = extractNumericPrice(offerPrice);

    // Generate order ID
    const orderId = generateOrderId();

    // Call MaxMind minFraud Score API
    let maxmindResponse: MaxMindResponse;
    try {
      maxmindResponse = await checkMaxMindFraud(
        clientIp,
        orderId,
        normalizedPhone,
        city,
        numericPrice
      );
    } catch (error) {
      console.error("MaxMind API error:", error);
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
    // MaxMind may provide risk reasons that indicate anonymization
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
    const whatsappUrl = buildWhatsappUrl(
      fullName,
      phone,
      city,
      offerLabel,
      offerPrice
    );

    return NextResponse.json({
      allowed: true,
      reason: "APPROVED",
      whatsappUrl,
    });
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
