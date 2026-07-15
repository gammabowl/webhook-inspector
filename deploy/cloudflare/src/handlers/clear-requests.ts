import { CloudflareEnv } from "../env";
import { json } from "../responses";
import { D1Storage } from "../storage/d1-storage";

export async function clearRequestsHandler(env: CloudflareEnv, webhookId: string): Promise<Response> {
  const storage = new D1Storage(env);
  const cleared = await storage.clearRequests(webhookId);

  return json({ ok: true, cleared });
}
