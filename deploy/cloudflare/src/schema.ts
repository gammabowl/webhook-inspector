import { CloudflareEnv } from "./env";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  webhook_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  payload TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_requests_webhook_timestamp ON requests (webhook_id, timestamp DESC);
`;

let schemaReady: Promise<void> | null = null;

export async function ensureSchema(env: CloudflareEnv): Promise<void> {
  if (!schemaReady) {
    schemaReady = env.DB.exec(SCHEMA_SQL).then(() => undefined);
  }

  return schemaReady;
}
