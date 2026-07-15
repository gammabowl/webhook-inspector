import { WebhookRequestRecord } from "./types";

function toHeaderObject(headers: Headers): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }

  return result;
}

function toQueryObject(url: URL): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of url.searchParams.entries()) {
    if (key in result) {
      const current = result[key];
      result[key] = Array.isArray(current) ? [...current, value] : [current, value];
      continue;
    }

    result[key] = value;
  }

  return result;
}

function decodeUtf8(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

function parseBody(contentType: string | null, rawBody: string): unknown {
  if (!rawBody) {
    return null;
  }

  if (contentType?.includes("application/json") || contentType?.includes("+json")) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return rawBody;
    }
  }

  if (contentType === "application/x-www-form-urlencoded") {
    const form = new URLSearchParams(rawBody);
    const body: Record<string, string | string[]> = {};

    for (const [key, value] of form.entries()) {
      if (key in body) {
        const current = body[key];
        body[key] = Array.isArray(current) ? [...current, value] : [current, value];
        continue;
      }

      body[key] = value;
    }

    return body;
  }

  if (
    contentType?.startsWith("text/") ||
    contentType?.includes("xml") ||
    contentType?.includes("graphql")
  ) {
    return rawBody;
  }

  return null;
}

export async function buildWebhookRequestRecord(request: Request, webhookId: string): Promise<WebhookRequestRecord> {
  const timestamp = Date.now();
  const url = new URL(request.url);
  const contentType = request.headers.get("content-type");
  const rawBody = decodeUtf8(await request.arrayBuffer());

  return {
    id: crypto.randomUUID(),
    webhookId,
    method: request.method.toUpperCase(),
    path: `${url.pathname}${url.search}`,
    timestamp,
    isoTimestamp: new Date(timestamp).toISOString(),
    headers: toHeaderObject(request.headers),
    query: toQueryObject(url),
    body: parseBody(contentType, rawBody),
    rawBody,
    contentType,
  };
}
