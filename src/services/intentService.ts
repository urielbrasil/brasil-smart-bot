import { BookingRequest } from "../types.js";

function inferDate(message: string): string {
  const lower = message.toLowerCase();
  const today = new Date();

  if (lower.includes("amanha")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }

  const isoMatch = message.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    return isoMatch[1];
  }

  return today.toISOString().slice(0, 10);
}

function inferTime(message: string): string | undefined {
  const match = message.match(/\b(\d{1,2}:\d{2})\b/);
  return match?.[1];
}

export function buildBookingRequest(params: {
  customerName?: string;
  customerPhone: string;
  customerMessage: string;
}): BookingRequest {
  return {
    customerName: params.customerName ?? "Cliente",
    customerPhone: params.customerPhone,
    requestedDate: inferDate(params.customerMessage),
    requestedTime: inferTime(params.customerMessage)
  };
}
