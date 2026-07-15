import { CloudflareEnv } from "../env";
import { json } from "../responses";
import { D1Storage } from "../storage/d1-storage";

export async function deleteRequestHandler(
  env: CloudflareEnv,
  webhookId: string,
  requestId: string,
): Promise<Response> {
  const storage = new D1Storage(env);
  const deleted = await storage.deleteRequest(webhookId, requestId);

  return json({ ok: true, deleted });
}
