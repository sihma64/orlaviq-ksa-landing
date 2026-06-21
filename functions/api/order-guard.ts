type Env = {
  MAXMIND_ACCOUNT_ID?: string;
  MAXMIND_LICENSE_KEY?: string;
  MAXMIND_MINFRAUD_ENDPOINT?: string;
  ORDER_ALLOWED_COUNTRY?: string;
  ORDER_MAX_RISK_SCORE?: string;
  ORDER_PHONE_WHITELIST?: string;
  WHATSAPP_NUMBER?: string;
};

type OrderGuardRequest = {
  fullName: string;
  phone: string;
  city: string;
  offerLabel: string;
  offerPrice: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
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

  return Array.from(
    new Set(
      [
        cleaned,
        withoutCountry,
        withoutLeadingZero,
        `0${withoutLeadingZero}`,
        `966${withoutLeadingZero}`,
        `+966${withoutLeadingZero}`,
        `00966${withoutLeadingZero}`,
      ].filter(Boolean)
    )
  );
}

function isWhitelistedPhone(phone: string, whitelistRaw: string): boolean {
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

function extractNumericPrice(priceString: string): number {
  const match = String(priceString || "").match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function buildWhatsappUrl(
  whatsappNumber: string,
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

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

async function callMaxMind(
  env: Env,
  clientIp: string,
  phone: string,
  city: string,
  offerPrice: string
): Promise<any> {
  const endpoint =
    env.MAXMIND_MINFRAUD_ENDPOINT ||
    "https://minfraud.maxmind.com/minfraud/v2.0/score";

  const accountId = env.MAXMIND_ACCOUNT_ID || "";
  const licenseKey = env.MAXMIND_LICENSE_KEY || "";

  if (!accountId || !licenseKey) {
    throw new Error("MAXMIND_NOT_CONFIGURED");
  }

  const auth = btoa(`${accountId}:${licenseKey}`);

  const payload = {
    device: {
      ip_address: clientIp,
    },
    event: {
      transaction_id: `ORD-${Date.now()}`,
      type: "order",
    },
    order: {
      amount: extractNumericPrice(offerPrice),
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

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`MAXMIND_ERROR_${response.status}`);
  }

  return response.json();
}

function detectCountry(response: any): string | undefined {
  return (
    response?.country?.iso_code ||
    response?.ip_address?.country?.iso_code ||
    response?.device?.country?.iso_code
  );
}

function hasVpnOrProxySignal(response: any): boolean {
  const traits = response?.ip_address?.traits || {};
  const reasons = response?.ip_address_risk_reasons || [];

  const traitBlocked =
    traits.is_anonymous ||
    traits.is_anonymous_vpn ||
    traits.is_hosting_provider ||
    traits.is_public_proxy ||
    traits.is_tor_exit_node ||
    traits.is_residential_proxy;

  const reasonBlocked = Array.isArray(reasons)
    ? reasons.some((reason: string) => {
        const upper = String(reason).toUpperCase();
        return (
          upper.includes("VPN") ||
          upper.includes("PROXY") ||
          upper.includes("TOR") ||
          upper.includes("ANONYMOUS") ||
          upper.includes("HOSTING")
        );
      })
    : false;

  return Boolean(traitBlocked || reasonBlocked);
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const env = context.env;
    const body = (await context.request.json()) as OrderGuardRequest;

    const { fullName, phone, city, offerLabel, offerPrice } = body;

    if (!fullName || !phone || !offerLabel || !offerPrice) {
      return json(
        {
          allowed: false,
          reason: "MISSING_REQUIRED_FIELDS",
        },
        400
      );
    }

    const whatsappNumber = env.WHATSAPP_NUMBER || "212716296177";
    const whitelist = env.ORDER_PHONE_WHITELIST || "0550000000";

    const whatsappUrl = buildWhatsappUrl(
      whatsappNumber,
      fullName,
      phone,
      city || "",
      offerLabel,
      offerPrice
    );

    if (isWhitelistedPhone(phone, whitelist)) {
      return json({
        allowed: true,
        reason: "WHITELISTED_TEST_NUMBER",
        whatsappUrl,
      });
    }

    const clientIp = getClientIp(context.request);
    const allowedCountry = env.ORDER_ALLOWED_COUNTRY || "SA";
    const maxRiskScore = parseInt(env.ORDER_MAX_RISK_SCORE || "20", 10);

    let maxmindResponse: any;

    try {
      maxmindResponse = await callMaxMind(
        env,
        clientIp,
        phone,
        city || "",
        offerPrice
      );
    } catch (error) {
      console.error("ORDER_GUARD_MAXMIND_ERROR", String(error));

      return json({
        allowed: false,
        reason: "MAXMIND_ERROR",
      });
    }

    const country = detectCountry(maxmindResponse);

    if (country && country !== allowedCountry) {
      return json({
        allowed: false,
        reason: "OUTSIDE_KSA",
      });
    }

    const riskScore = Number(maxmindResponse?.risk_score ?? 0);
    const ipRisk = Number(maxmindResponse?.ip_address?.risk ?? 0);

    if (riskScore >= maxRiskScore) {
      return json({
        allowed: false,
        reason: "HIGH_RISK_SCORE",
      });
    }

    if (ipRisk >= maxRiskScore) {
      return json({
        allowed: false,
        reason: "HIGH_RISK_IP",
      });
    }

    if (hasVpnOrProxySignal(maxmindResponse)) {
      return json({
        allowed: false,
        reason: "VPN_OR_PROXY_DETECTED",
      });
    }

    return json({
      allowed: true,
      reason: "APPROVED",
      whatsappUrl,
    });
  } catch (error) {
    console.error("ORDER_GUARD_SERVER_ERROR", String(error));

    return json(
      {
        allowed: false,
        reason: "SERVER_ERROR",
      },
      500
    );
  }
}

export async function onRequestGet(): Promise<Response> {
  return json(
    {
      allowed: false,
      reason: "METHOD_NOT_ALLOWED_USE_POST",
    },
    405
  );
}