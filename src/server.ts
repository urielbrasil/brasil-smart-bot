import express from "express";
import {
  config,
  getMissingSecrets,
  hasRequiredSecrets,
  hasWebhookVerificationSecret,
  requireWebhookVerificationSecret,
  requireSecret
} from "./config.js";
import { handleBotMessage } from "./services/botService.js";
import { sendWhatsAppText } from "./services/whatsappService.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  const missingSecrets = getMissingSecrets();

  res.json({
    ok: missingSecrets.length === 0,
    service: "whatsapp-bot",
    missingSecrets
  });
});

app.get("/webhooks/whatsapp", (req, res) => {
  if (!hasWebhookVerificationSecret()) {
    return res.status(503).json({
      ok: false,
      error: "Service is missing WHATSAPP_VERIFY_TOKEN."
    });
  }

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === requireWebhookVerificationSecret()) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhooks/whatsapp", async (req, res) => {
  res.sendStatus(200);

  try {
    console.log("Incoming WhatsApp webhook", JSON.stringify(req.body));

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
      console.log("Ignoring non-text or empty webhook event");
      return;
    }

    const customerPhone = message.from;
    const customerName = value?.contacts?.[0]?.profile?.name;
    const customerMessage = message.text?.body ?? "";

    const reply = await handleBotMessage({
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

    console.log("WhatsApp reply sent", {
      to: customerPhone
    });
  } catch (error) {
    console.error("Failed to process WhatsApp webhook", error);
  }
});

app.listen(config.PORT, () => {
  console.log(`whatsapp-bot listening on port ${config.PORT}`);
});
