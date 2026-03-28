import type { WebhookRequest } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchRequests(
  webhookId: string,
  since: number,
  limit = 50,
): Promise<{ webhookId: string; requests: WebhookRequest[] }> {
  const url = new URL(`${API_BASE}/api/requests/${webhookId}`);
  url.searchParams.set("since", String(since));
  url.searchParams.set("limit", String(limit));
  return requestJson(url.toString());
}

export async function clearRequests(webhookId: string): Promise<{ ok: true; cleared: number }> {
  return requestJson(`${API_BASE}/api/requests/${webhookId}`, {
    method: "DELETE",
  });
}

export async function deleteRequest(webhookId: string, requestId: string): Promise<{ ok: true; deleted: boolean }> {
  return requestJson(`${API_BASE}/api/requests/${webhookId}/${requestId}`, {
    method: "DELETE",
  });
}
