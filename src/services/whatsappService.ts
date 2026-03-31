const whatsappApiBase = "https://graph.facebook.com/v22.0";

export async function sendWhatsAppText(params: {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  body: string;
}): Promise<void> {
  const response = await fetch(
    `${whatsappApiBase}/${params.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.to,
        type: "text",
        text: {
          body: params.body
        }
      })
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`WhatsApp send failed: ${response.status} ${details}`);
  }
}
