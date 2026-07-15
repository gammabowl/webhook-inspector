import { CloudflareEnv } from "../env";
import { json } from "../responses";
import { D1Storage } from "../storage/d1-storage";

export async function listRequestsHandler(request: Request, env: CloudflareEnv, webhookId: string): Promise<Response> {
  const url = new URL(request.url);
  const since = Number(url.searchParams.get("since") ?? 0);
  const limit = Number(url.searchParams.get("limit") ?? 50);
  const cappedSince = Number.isFinite(since) && since > 0 ? since : 0;
  const cappedLimit = Math.min(Math.max(Number(limit) || 50, 1), 50);

  const storage = new D1Storage(env);
  const requests = await storage.listRequests(webhookId, cappedSince, cappedLimit);

  return json({ webhookId, requests });
}
