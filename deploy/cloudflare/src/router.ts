import { CloudflareEnv } from "./env";
import { clearRequestsHandler } from "./handlers/clear-requests";
import { deleteRequestHandler } from "./handlers/delete-request";
import { healthHandler } from "./handlers/health";
import { ingestWebhookHandler } from "./handlers/ingest-webhook";
import { listRequestsHandler } from "./handlers/list-requests";
import { errorJson } from "./responses";

const WEBHOOK_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function matchWebhookId(value: string | undefined): string | null {
  if (!value || !WEBHOOK_ID_PATTERN.test(value)) {
    return null;
  }

  return value;
}

export async function routeRequest(request: Request, env: CloudflareEnv): Promise<Response> {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);

  if (request.method === "GET" && url.pathname === "/health") {
    return healthHandler();
  }

  if (segments[0] === "api" && segments[1] === "requests") {
    const webhookId = matchWebhookId(segments[2]);
    if (!webhookId) {
      return errorJson(404, "Not found");
    }

    if (request.method === "GET" && segments.length === 3) {
      return listRequestsHandler(request, env, webhookId);
    }

    if (request.method === "DELETE" && segments.length === 3) {
      return clearRequestsHandler(env, webhookId);
    }

    const requestId = matchWebhookId(segments[3]);
    if (request.method === "DELETE" && segments.length === 4 && requestId) {
      return deleteRequestHandler(env, webhookId, requestId);
    }

    return errorJson(404, "Not found");
  }

  if (segments[0] === "webhook") {
    const webhookId = matchWebhookId(segments[1]);
    if (!webhookId || segments.length !== 2) {
      return errorJson(404, "Not found");
    }

    return ingestWebhookHandler(request, env, webhookId);
  }

  if (segments.length === 1) {
    const webhookId = matchWebhookId(segments[0]);
    if (webhookId) {
      return ingestWebhookHandler(request, env, webhookId);
    }
  }

  return errorJson(404, "Not found");
}
