import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";
const GOOGLE_SHEETS_WEBHOOK_SECRET =
  process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  if (!GOOGLE_SHEETS_WEBHOOK_URL || !GOOGLE_SHEETS_WEBHOOK_SECRET) {
    console.error(
      "CRITICAL: GOOGLE_SHEETS_WEBHOOK_URL or GOOGLE_SHEETS_WEBHOOK_SECRET is not set."
    );
    return NextResponse.json(
      {
        ok: false,
        reason: "SERVER_CONFIGURATION_ERROR",
        message: "Google Sheets integration is not configured.",
      },
      { status: 500 }
    );
  }

  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { ok: false, reason: "MISSING_ORDER_ID" },
        { status: 400 }
      );
    }

    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: GOOGLE_SHEETS_WEBHOOK_SECRET,
        action: "confirm_whatsapp",
        orderId,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      console.error(
        "Failed to confirm WhatsApp in Google Sheets",
        { status: response.status, data }
      );
      return NextResponse.json(
        {
          ok: false,
          reason: "PERSISTENCE_ERROR",
          message: "Failed to update Google Sheets.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Confirm WhatsApp error:", error);
    return NextResponse.json(
      { ok: false, reason: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
