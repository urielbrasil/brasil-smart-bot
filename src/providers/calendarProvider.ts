import { BookingRequest, AvailabilitySnapshot } from "../types.js";

export interface CalendarProvider {
  checkAvailability(request: BookingRequest): Promise<AvailabilitySnapshot>;
}

export class MockCalendarProvider implements CalendarProvider {
  async checkAvailability(request: BookingRequest): Promise<AvailabilitySnapshot> {
    const date = request.requestedDate;

    return {
      summary: `Agenda mock consultada para ${date}. Existem horarios livres no periodo da tarde.`,
      slots: [
        {
          startIso: `${date}T14:00:00-03:00`,
          endIso: `${date}T15:00:00-03:00`,
          source: "calendar",
          notes: "Horario sugerido pela agenda interna"
        },
        {
          startIso: `${date}T16:00:00-03:00`,
          endIso: `${date}T17:00:00-03:00`,
          source: "calendar",
          notes: "Janela alternativa"
        }
      ]
    };
  }
}
