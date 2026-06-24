type GoogleSheetOrder = {
  "Order date": string;
  "Order time": string;
  "Order ID": string;
  "Full name*": string;
  "Phone*": string;
  whatsapp_link: string;
  "confirmation by whatsapp": string;
  "Country*": string;
  City: string;
  "العنوان الكامل - Full Address": string;
  "SKU*": string;
  "Total quantity*": number;
  "Total with customer currency*": number;
  "Order customer currency*": string;
  Note: string;
};

export async function sendOrderToGoogleSheets(order: GoogleSheetOrder) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

  if (!webhookUrl || !secret) {
    console.warn("Google Sheets webhook not configured.");
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret,
        ...order,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Google Sheets webhook HTTP error:", response.status, data);
      return { ok: false, status: response.status, data };
    }

    return data || { ok: true };
  } catch (error) {
    console.error("Google Sheets webhook failed:", error);
    return { ok: false, error: String(error) };
  }
}
