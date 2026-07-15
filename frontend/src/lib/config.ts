function normaliseBaseUrl(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getApiBaseUrl(): string {
  const explicitBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (explicitBaseUrl) {
    return normaliseBaseUrl(explicitBaseUrl);
  }

  return "http://localhost:3000";
}
