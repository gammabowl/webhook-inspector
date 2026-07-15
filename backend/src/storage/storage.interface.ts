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

export interface WebhookStorage {
  addRequest(record: StoredWebhookRequest): Promise<void>;
  listRequests(webhookId: string, since: number, limit: number): Promise<StoredWebhookRequest[]>;
  clearRequests(webhookId: string): Promise<number>;
  deleteRequest(webhookId: string, requestId: string): Promise<boolean>;
}

export const WEBHOOK_STORAGE = Symbol("WEBHOOK_STORAGE");
