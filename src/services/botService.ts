import { createBookingProvider, createCalendarProvider } from "../providers/index.js";
import { buildBookingRequest } from "./intentService.js";
import { generateReceptionistReply } from "./openaiService.js";

const calendarProvider = createCalendarProvider();
const bookingProvider = createBookingProvider();

export async function handleReceptionistMessage(input: {
  customerName?: string;
  customerPhone: string;
  customerMessage: string;
}): Promise<string> {
  const bookingRequest = buildBookingRequest(input);

  const [calendarAvailability, bookingAvailability] = await Promise.all([
    calendarProvider.checkAvailability(bookingRequest),
    bookingProvider.checkAvailability(bookingRequest)
  ]);

  return generateReceptionistReply({
    customerMessage: input.customerMessage,
    bookingRequest,
    calendarAvailability,
    bookingAvailability
  });
}
