import { neon } from "@neondatabase/serverless";
import { config } from "../config.js";

let schemaReadyPromise: Promise<void> | null = null;

type UserUsageRow = {
  tokens_used: string | number | null;
};

function hasDatabaseConfig() {
  return Boolean(config.DATABASE_URL);
}

function getSql() {
  if (!config.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL for bot token usage logging.");
  }

  return neon(config.DATABASE_URL);
}

function getTodayDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function ensureBotUsageTable() {
  if (!hasDatabaseConfig()) {
    return;
  }

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const sql = getSql();

      await sql`
        CREATE TABLE IF NOT EXISTS bot_token_usage (
          id TEXT PRIMARY KEY,
          usage_date DATE NOT NULL,
          total_tokens INTEGER NOT NULL DEFAULT 0,
          input_tokens INTEGER NOT NULL DEFAULT 0,
          output_tokens INTEGER NOT NULL DEFAULT 0,
          bot_name TEXT NOT NULL,
          bot_id TEXT NOT NULL,
          customer_phone TEXT NOT NULL DEFAULT '',
          customer_name TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL,
          model TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        ALTER TABLE bot_token_usage
        ADD COLUMN IF NOT EXISTS customer_phone TEXT NOT NULL DEFAULT ''
      `;

      await sql`
        ALTER TABLE bot_token_usage
        ADD COLUMN IF NOT EXISTS customer_name TEXT NOT NULL DEFAULT ''
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS bot_token_usage_date_idx
        ON bot_token_usage(usage_date DESC, bot_id)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS bot_token_usage_customer_idx
        ON bot_token_usage(usage_date DESC, customer_phone)
      `;
    })().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }

  await schemaReadyPromise;
}

export async function recordBotTokenUsage(input: {
  totalTokens?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  status: string;
  customerPhone?: string;
  customerName?: string;
}) {
  if (!hasDatabaseConfig()) {
    return;
  }

  try {
    await ensureBotUsageTable();

    const sql = getSql();

    await sql`
      INSERT INTO bot_token_usage (
        id,
        usage_date,
        total_tokens,
        input_tokens,
        output_tokens,
        bot_name,
        bot_id,
        customer_phone,
        customer_name,
        status,
        model
      ) VALUES (
        ${crypto.randomUUID()},
        ${getTodayDateKey()},
        ${Math.max(0, input.totalTokens ?? 0)},
        ${Math.max(0, input.inputTokens ?? 0)},
        ${Math.max(0, input.outputTokens ?? 0)},
        ${config.BOT_NAME},
        ${config.BOT_SERVICE_ID},
        ${input.customerPhone ?? ""},
        ${input.customerName ?? ""},
        ${input.status},
        ${config.OPENAI_MODEL}
      )
    `;
  } catch (error) {
    console.error("Failed to persist bot token usage", error);
  }
}

export async function getDailyUserTokenUsage(customerPhone: string) {
  if (!hasDatabaseConfig()) {
    return 0;
  }

  try {
    await ensureBotUsageTable();
    const sql = getSql();
    const rows = (await sql`
      SELECT COALESCE(SUM(total_tokens), 0) AS tokens_used
      FROM bot_token_usage
      WHERE usage_date = ${getTodayDateKey()}
        AND customer_phone = ${customerPhone}
        AND status IN (${"success"}, ${"limit_exceeded"})
    `) as UserUsageRow[];

    return Number(rows[0]?.tokens_used ?? 0);
  } catch (error) {
    console.error("Failed to read daily user token usage", error);
    return 0;
  }
}

export async function hasReachedDailyUserTokenLimit(customerPhone: string) {
  const tokensUsed = await getDailyUserTokenUsage(customerPhone);
  return tokensUsed >= config.DAILY_USER_TOKEN_LIMIT;
}
