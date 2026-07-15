import { CloudflareEnv } from "../env";
import { ensureSchema } from "../schema";
import { WebhookRequestRecord } from "../types";

export class D1Storage {
  constructor(private readonly env: CloudflareEnv) {}

  async addRequest(record: WebhookRequestRecord): Promise<void> {
    await ensureSchema(this.env);
    await this.env.DB.prepare("INSERT INTO requests (id, webhook_id, timestamp, payload) VALUES (?, ?, ?, ?)")
      .bind(record.id, record.webhookId, record.timestamp, JSON.stringify(record))
      .run();
  }

  async listRequests(webhookId: string, since: number, limit: number): Promise<WebhookRequestRecord[]> {
    await ensureSchema(this.env);

    const result = await this.env.DB.prepare(
      "SELECT payload FROM requests WHERE webhook_id = ? AND timestamp >= ? ORDER BY timestamp DESC LIMIT ?",
    )
      .bind(webhookId, since, limit)
      .all<{ payload: string }>();

    return (result.results ?? [])
      .map((row) => this.safeParseRequest(row.payload))
      .filter((item): item is WebhookRequestRecord => Boolean(item));
  }

  async clearRequests(webhookId: string): Promise<number> {
    await ensureSchema(this.env);
    const result = await this.env.DB.prepare("DELETE FROM requests WHERE webhook_id = ?").bind(webhookId).run();
    return Number(result.meta.changes ?? 0);
  }

  async deleteRequest(webhookId: string, requestId: string): Promise<boolean> {
    await ensureSchema(this.env);
    const result = await this.env.DB.prepare("DELETE FROM requests WHERE webhook_id = ? AND id = ?")
      .bind(webhookId, requestId)
      .run();

    return Number(result.meta.changes ?? 0) > 0;
  }

  private safeParseRequest(payload: string): WebhookRequestRecord | null {
    try {
      return JSON.parse(payload) as WebhookRequestRecord;
    } catch {
      return null;
    }
  }
}
