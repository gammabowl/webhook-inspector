export interface WebhookRequestRecord {
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
