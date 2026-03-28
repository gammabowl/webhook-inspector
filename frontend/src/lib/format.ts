export function toPreview(value: unknown): string {
  if (value === null || typeof value === "undefined") {
    return "No body";
  }

  if (typeof value === "string") {
    return compress(value, 110);
  }

  try {
    return compress(JSON.stringify(value), 110);
  } catch {
    return "Unserializable payload";
  }
}

export function compress(text: string, limit: number): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= limit) {
    return collapsed;
  }

  return `${collapsed.slice(0, limit - 1)}…`;
}

export function methodTone(method: string): string {
  switch (method.toUpperCase()) {
    case "POST":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "PUT":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "PATCH":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "DELETE":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "GET":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

