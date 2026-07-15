import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { StoredWebhookRequest, WebhookStorage } from "./storage.interface";

@Injectable()
export class SqliteStorageService implements WebhookStorage, OnModuleDestroy {
  private readonly db: Database.Database;

  constructor() {
    const dbPath = resolve(process.env.SQLITE_PATH ?? "./data/webhook-inspector.db");
    mkdirSync(dirname(dbPath), { recursive: true });

    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        webhook_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        payload TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_requests_webhook_timestamp ON requests (webhook_id, timestamp DESC);
    `);
  }

  async addRequest(record: StoredWebhookRequest): Promise<void> {
    this.db
      .prepare("INSERT INTO requests (id, webhook_id, timestamp, payload) VALUES (?, ?, ?, ?)")
      .run(record.id, record.webhookId, record.timestamp, JSON.stringify(record));
  }

  async listRequests(webhookId: string, since: number, limit: number): Promise<StoredWebhookRequest[]> {
    const rows = this.db
      .prepare(
        "SELECT payload FROM requests WHERE webhook_id = ? AND timestamp >= ? ORDER BY timestamp DESC LIMIT ?",
      )
      .all(webhookId, since, limit) as { payload: string }[];

    return rows
      .map((row) => this.safeParseRequest(row.payload))
      .filter((item): item is StoredWebhookRequest => Boolean(item));
  }

  async clearRequests(webhookId: string): Promise<number> {
    const result = this.db.prepare("DELETE FROM requests WHERE webhook_id = ?").run(webhookId);
    return result.changes;
  }

  async deleteRequest(webhookId: string, requestId: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM requests WHERE webhook_id = ? AND id = ?").run(webhookId, requestId);
    return result.changes > 0;
  }

  onModuleDestroy(): void {
    this.db.close();
  }

  private safeParseRequest(payload: string): StoredWebhookRequest | null {
    try {
      return JSON.parse(payload) as StoredWebhookRequest;
    } catch {
      return null;
    }
  }
}
