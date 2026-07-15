import { json } from "../responses";

export function healthHandler(): Response {
  return json({ ok: true });
}
