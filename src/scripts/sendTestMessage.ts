import { requireSecret } from "../config.js";
import { sendWhatsAppText } from "../services/whatsappService.js";

const to = process.argv[2];
const body =
  process.argv.slice(3).join(" ").trim() ||
  "Teste do brasil-smart-bot: se voce recebeu esta mensagem, a integracao WhatsApp esta funcionando.";

if (!to) {
  console.error("Usage: npm run test:send -- <phone> [message]");
  process.exit(1);
}

await sendWhatsAppText({
  accessToken: requireSecret("WHATSAPP_ACCESS_TOKEN"),
  phoneNumberId: requireSecret("WHATSAPP_PHONE_NUMBER_ID"),
  to,
  body
});

console.log(`Message sent to ${to}`);
