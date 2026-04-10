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
  DATABASE_URL: z.string().url().optional(),
  BOT_SERVICE_ID: z.string().min(1).default("brasil-smart-bot"),
  BOT_NAME: z.string().min(1).default("brasil-smart-bot"),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini")
});

export const config = envSchema.parse(process.env);

const requiredSecrets = [
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "OPENAI_API_KEY"
] as const;

type RequiredSecret = (typeof requiredSecrets)[number];

export function getMissingSecrets(): RequiredSecret[] {
  return requiredSecrets.filter((key) => !config[key]);
}

export function hasWebhookVerificationSecret(): boolean {
  return Boolean(config.WHATSAPP_VERIFY_TOKEN);
}

export function requireWebhookVerificationSecret(): string {
  const value = config.WHATSAPP_VERIFY_TOKEN;

  if (!value) {
    throw new Error("Missing required environment variable: WHATSAPP_VERIFY_TOKEN");
  }

  return value;
}

export function hasRequiredSecrets(): boolean {
  return hasWebhookVerificationSecret() && getMissingSecrets().length === 0;
}

export function requireSecret(key: RequiredSecret): string {
  const value = config[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}
