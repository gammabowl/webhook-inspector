import { CloudflareEnv } from "../env";
import { buildWebhookRequestRecord } from "../request-parser";
import { json } from "../responses";
import { D1Storage } from "../storage/d1-storage";

export async function ingestWebhookHandler(request: Request, env: CloudflareEnv, webhookId: string): Promise<Response> {
  const storage = new D1Storage(env);
  const record = await buildWebhookRequestRecord(request, webhookId);
  await storage.addRequest(record);

  return json({ ok: true, id: record.id });
}
