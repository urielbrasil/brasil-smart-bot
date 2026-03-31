import { config } from "../config.js";
import { AvailabilitySnapshot, BookingRequest } from "../types.js";
import {
  CalendarProvider,
  MockCalendarProvider
} from "./calendarProvider.js";
import {
  BookingProvider,
  MockBookingProvider
} from "./bookingProvider.js";

class PlaceholderCalendarProvider implements CalendarProvider {
  async checkAvailability(_request: BookingRequest): Promise<AvailabilitySnapshot> {
    throw new Error(
      "Google Calendar/Cal.com integration not implemented yet. Set CALENDAR_PROVIDER=mock until credentials and API wiring are ready."
    );
  }
}

class PlaceholderBookingProvider implements BookingProvider {
  async checkAvailability(_request: BookingRequest): Promise<AvailabilitySnapshot> {
    throw new Error(
      "Booking.com integration not implemented yet. Set BOOKING_PROVIDER=mock until partner/API access is configured."
    );
  }
}

export function createCalendarProvider(): CalendarProvider {
  if (config.CALENDAR_PROVIDER === "mock") {
    return new MockCalendarProvider();
  }

  return new PlaceholderCalendarProvider();
}

export function createBookingProvider(): BookingProvider {
  if (config.BOOKING_PROVIDER === "mock") {
    return new MockBookingProvider();
  }

  return new PlaceholderBookingProvider();
}
