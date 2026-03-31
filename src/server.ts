import express from "express";
import { config, getMissingSecrets, hasRequiredSecrets, requireSecret } from "./config.js";
import { handleReceptionistMessage } from "./services/botService.js";
import { sendWhatsAppText } from "./services/whatsappService.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  const missingSecrets = getMissingSecrets();

  res.json({
    ok: missingSecrets.length === 0,
    service: "brasil-smart-bot",
    missingSecrets
  });
});

app.get("/webhooks/whatsapp", (req, res) => {
  if (!hasRequiredSecrets()) {
    return res.status(503).json({
      ok: false,
      error: "Service is missing required environment variables.",
      missingSecrets: getMissingSecrets()
    });
  }

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === requireSecret("WHATSAPP_VERIFY_TOKEN")) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhooks/whatsapp", async (req, res) => {
  res.sendStatus(200);

  try {
    if (!hasRequiredSecrets()) {
      console.warn("Webhook received but required environment variables are missing", {
        missingSecrets: getMissingSecrets()
      });
      return;
    }

    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") {
      return;
    }

    const customerPhone = message.from;
    const customerName = value?.contacts?.[0]?.profile?.name;
    const customerMessage = message.text?.body ?? "";

    const reply = await handleReceptionistMessage({
      customerName,
      customerPhone,
      customerMessage
    });

    await sendWhatsAppText({
      accessToken: requireSecret("WHATSAPP_ACCESS_TOKEN"),
      phoneNumberId: requireSecret("WHATSAPP_PHONE_NUMBER_ID"),
      to: customerPhone,
      body: reply
    });
  } catch (error) {
    console.error("Failed to process WhatsApp webhook", error);
  }
});

app.listen(config.PORT, () => {
  console.log(`brasil-smart-bot listening on port ${config.PORT}`);
});
