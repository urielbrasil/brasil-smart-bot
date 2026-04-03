import { requireSecret } from "../config.js";
import { sendWhatsAppText } from "../services/whatsappService.js";

const to = process.argv[2];
const body =
  process.argv.slice(3).join(" ").trim() ||
  [
    "Teste do WhatsAppBot: a integracao com o WhatsApp esta funcionando.",
    "Envie 1, 2, 3, 4, 5, 6 ou 7 para iniciar a simulacao de vendas."
  ].join(" ");

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
