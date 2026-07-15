import { CloudflareEnv } from "./env";

const CREATE_REQUESTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  webhook_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  payload TEXT NOT NULL
)
`;

const CREATE_REQUESTS_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_requests_webhook_timestamp
ON requests (webhook_id, timestamp DESC)
`;

let schemaReady: Promise<void> | null = null;

export async function ensureSchema(env: CloudflareEnv): Promise<void> {
  if (!schemaReady) {
    schemaReady = env.DB
      .batch([
        env.DB.prepare(CREATE_REQUESTS_TABLE_SQL),
        env.DB.prepare(CREATE_REQUESTS_INDEX_SQL),
      ])
      .then(() => undefined);
  }

  return schemaReady;
}
