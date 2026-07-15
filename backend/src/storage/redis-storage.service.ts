import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { StoredWebhookRequest, WebhookStorage } from "./storage.interface";

@Injectable()
export class RedisStorageService implements WebhookStorage, OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
    this.client = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  async addRequest(record: StoredWebhookRequest): Promise<void> {
    await this.client.zadd(this.requestsKey(record.webhookId), record.timestamp, JSON.stringify(record));
  }

  async listRequests(webhookId: string, since: number, limit: number): Promise<StoredWebhookRequest[]> {
    const min = since > 0 ? `${since}` : "-inf";

    const raw = await this.client.zrevrangebyscore(this.requestsKey(webhookId), "+inf", min, "LIMIT", 0, limit);

    return raw
      .map((value) => this.safeParseRequest(value))
      .filter((item): item is StoredWebhookRequest => Boolean(item));
  }

  async clearRequests(webhookId: string): Promise<number> {
    return this.client.del(this.requestsKey(webhookId));
  }

  async deleteRequest(webhookId: string, requestId: string): Promise<boolean> {
    const key = this.requestsKey(webhookId);
    const rawRequests = await this.client.zrange(key, 0, -1);
    const match = rawRequests.find((value) => this.safeParseRequest(value)?.id === requestId);

    if (!match) {
      return false;
    }

    const removed = await this.client.zrem(key, match);
    return removed > 0;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== "end") {
      await this.client.quit();
    }
  }

  private requestsKey(webhookId: string): string {
    return `requests:${webhookId}`;
  }

  private safeParseRequest(payload: string): StoredWebhookRequest | null {
    try {
      return JSON.parse(payload) as StoredWebhookRequest;
    } catch {
      return null;
    }
  }
}
