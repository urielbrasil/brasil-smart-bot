export type AvailabilitySlot = {
  startIso: string;
  endIso: string;
  source: "calendar" | "booking";
  notes?: string;
};

export type BookingRequest = {
  customerName: string;
  customerPhone: string;
  partySize?: number;
  requestedDate: string;
  requestedTime?: string;
  stayNights?: number;
};

export type AvailabilitySnapshot = {
  summary: string;
  slots: AvailabilitySlot[];
};
