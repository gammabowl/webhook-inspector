import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Request } from "express";
import { RedisService } from "../redis/redis.service";

export interface StoredWebhookRequest {
  id: string;
  webhookId: string;
  method: string;
  path: string;
  timestamp: number;
  isoTimestamp: string;
  headers: Record<string, unknown>;
  query: Record<string, unknown>;
  body: unknown;
  rawBody: string;
  contentType: string | null;
}

@Injectable()
export class WebhookService {
  constructor(private readonly redisService: RedisService) {}

  async storeWebhookRequest(webhookId: string, req: Request): Promise<StoredWebhookRequest> {
    const timestamp = Date.now();
    const record: StoredWebhookRequest = {
      id: randomUUID(),
      webhookId,
      method: req.method.toUpperCase(),
      path: req.originalUrl,
      timestamp,
      isoTimestamp: new Date(timestamp).toISOString(),
      headers: this.sanitiseHeaders(req.headers),
      query: this.sanitiseObject(req.query),
      body: req.body ?? null,
      rawBody: req.rawBody ?? this.stringifyBody(req.body),
      contentType: this.firstHeaderValue(req.headers["content-type"]) ?? null,
    };

    await this.redisService.redis.zadd(this.requestsKey(webhookId), timestamp, JSON.stringify(record));
    return record;
  }

  async listRequests(webhookId: string, since = 0, limit = 50): Promise<StoredWebhookRequest[]> {
    const cappedLimit = Math.min(Math.max(Number(limit) || 50, 1), 50);
    const min = Number.isFinite(since) && since > 0 ? `${since}` : "-inf";
    const max = "+inf";

    const raw = await this.redisService.redis.zrevrangebyscore(
      this.requestsKey(webhookId),
      max,
      min,
      "LIMIT",
      0,
      cappedLimit,
    );

    return raw
      .map((value) => this.safeParseRequest(value))
      .filter((item): item is StoredWebhookRequest => Boolean(item));
  }

  async clearRequests(webhookId: string): Promise<number> {
    return this.redisService.redis.del(this.requestsKey(webhookId));
  }

  async deleteRequest(webhookId: string, requestId: string): Promise<boolean> {
    const key = this.requestsKey(webhookId);
    const rawRequests = await this.redisService.redis.zrange(key, 0, -1);
    const match = rawRequests.find((value) => this.safeParseRequest(value)?.id === requestId);

    if (!match) {
      return false;
    }

    const removed = await this.redisService.redis.zrem(key, match);
    return removed > 0;
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

  private sanitiseHeaders(headers: Request["headers"]): Record<string, unknown> {
    return Object.entries(headers).reduce<Record<string, unknown>>((acc, [key, value]) => {
      if (typeof value === "undefined") {
        return acc;
      }

      acc[key] = value;
      return acc;
    }, {});
  }

  private sanitiseObject(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, current]) => {
      acc[key] = current;
      return acc;
    }, {});
  }

  private stringifyBody(body: unknown): string {
    if (typeof body === "string") {
      return body;
    }

    if (Buffer.isBuffer(body)) {
      return body.toString("utf8");
    }

    if (body === null || typeof body === "undefined") {
      return "";
    }

    try {
      return JSON.stringify(body, null, 2);
    } catch {
      return String(body);
    }
  }

  private firstHeaderValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }
}
