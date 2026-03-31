import OpenAI from "openai";
import { config } from "../config.js";
import { AvailabilitySnapshot, BookingRequest } from "../types.js";

const client = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

export async function generateReceptionistReply(input: {
  customerMessage: string;
  bookingRequest: BookingRequest;
  calendarAvailability: AvailabilitySnapshot;
  bookingAvailability: AvailabilitySnapshot;
}): Promise<string> {
  const response = await client.responses.create({
    model: config.OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "Voce e um recepcionista virtual brasileiro no WhatsApp. Responda em portugues do Brasil, com tom cordial, objetivo e comercial. Nunca invente disponibilidade: use apenas os dados fornecidos."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              `Mensagem do cliente: ${input.customerMessage}`,
              `Pedido estruturado: ${JSON.stringify(input.bookingRequest)}`,
              `Agenda: ${JSON.stringify(input.calendarAvailability)}`,
              `Booking: ${JSON.stringify(input.bookingAvailability)}`,
              "Monte uma resposta curta oferecendo opcoes disponiveis e pedindo os dados faltantes para fechar a reserva."
            ].join("\n")
          }
        ]
      }
    ]
  });

  return response.output_text.trim();
}
