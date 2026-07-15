import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Request } from "express";
import { StoredWebhookRequest, WEBHOOK_STORAGE, WebhookStorage } from "../storage/storage.interface";

export { StoredWebhookRequest } from "../storage/storage.interface";

@Injectable()
export class WebhookService {
  constructor(@Inject(WEBHOOK_STORAGE) private readonly storage: WebhookStorage) {}

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

    await this.storage.addRequest(record);
    return record;
  }

  async listRequests(webhookId: string, since = 0, limit = 50): Promise<StoredWebhookRequest[]> {
    const cappedLimit = Math.min(Math.max(Number(limit) || 50, 1), 50);
    const cappedSince = Number.isFinite(since) && since > 0 ? since : 0;

    return this.storage.listRequests(webhookId, cappedSince, cappedLimit);
  }

  async clearRequests(webhookId: string): Promise<number> {
    return this.storage.clearRequests(webhookId);
  }

  async deleteRequest(webhookId: string, requestId: string): Promise<boolean> {
    return this.storage.deleteRequest(webhookId, requestId);
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
