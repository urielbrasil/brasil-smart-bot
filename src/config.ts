import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  APP_BASE_URL: z.string().url().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1).optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  CALENDAR_PROVIDER: z.enum(["mock", "google-calendar", "calcom"]).default("mock"),
  BOOKING_PROVIDER: z.enum(["mock", "booking-com"]).default("mock")
});

export const config = envSchema.parse(process.env);

const requiredSecrets = [
  "WHATSAPP_VERIFY_TOKEN",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "OPENAI_API_KEY"
] as const;

type RequiredSecret = (typeof requiredSecrets)[number];

export function getMissingSecrets(): RequiredSecret[] {
  return requiredSecrets.filter((key) => !config[key]);
}

export function hasRequiredSecrets(): boolean {
  return getMissingSecrets().length === 0;
}

export function requireSecret(key: RequiredSecret): string {
  const value = config[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}
