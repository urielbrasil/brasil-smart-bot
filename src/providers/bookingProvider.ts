import { BookingRequest, AvailabilitySnapshot } from "../types.js";

export interface BookingProvider {
  checkAvailability(request: BookingRequest): Promise<AvailabilitySnapshot>;
}

export class MockBookingProvider implements BookingProvider {
  async checkAvailability(request: BookingRequest): Promise<AvailabilitySnapshot> {
    const nights = request.stayNights ?? 1;
    const date = request.requestedDate;

    return {
      summary: `Booking mock consultado para check-in em ${date} com ${nights} noite(s). Ha pelo menos uma opcao disponivel.`,
      slots: [
        {
          startIso: `${date}T15:00:00-03:00`,
          endIso: `${date}T23:59:00-03:00`,
          source: "booking",
          notes: "Quarto standard com cancelamento flexivel"
        }
      ]
    };
  }
}
