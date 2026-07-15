import { CloudflareEnv, getCorsOrigin } from "./env";

export function applyCors(response: Response, env: CloudflareEnv): Response {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", getCorsOrigin(env));
  headers.set("access-control-allow-methods", "GET,POST,OPTIONS,PUT,PATCH,DELETE,HEAD");
  headers.set("access-control-allow-headers", "*");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function preflight(env: CloudflareEnv): Response {
  return applyCors(new Response(null, { status: 204 }), env);
}
