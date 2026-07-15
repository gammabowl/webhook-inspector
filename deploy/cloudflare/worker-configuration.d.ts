declare interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

declare interface D1ExecResult {
  count?: number;
  duration?: number;
}

declare interface D1Meta {
  changes?: number;
  duration?: number;
  last_row_id?: number;
  rows_read?: number;
  rows_written?: number;
}

declare interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success?: boolean;
  meta: D1Meta;
}

declare interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

declare interface D1Database {
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<Array<D1Result<T>>>;
  exec(query: string): Promise<D1ExecResult>;
  prepare(query: string): D1PreparedStatement;
}

declare interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  CORS_ORIGIN?: string;
}
