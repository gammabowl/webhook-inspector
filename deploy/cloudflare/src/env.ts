export interface CloudflareEnv {
  DB: D1Database;
  ASSETS?: Fetcher;
  CORS_ORIGIN?: string;
}

export function getCorsOrigin(env: CloudflareEnv): string {
  return env.CORS_ORIGIN?.trim() || "*";
}
