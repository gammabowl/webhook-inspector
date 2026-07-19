import { useEffect } from "react";

const SITE_NAME = "Webhook Inspector — Test and debug webhooks";
const DEFAULT_DESCRIPTION = "Create a unique URL to receive, inspect, and debug webhook requests in real time.";

function setMeta(name: string, content: string): void {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }

  element.content = content;
}

export function usePageMetadata({
  title = SITE_NAME,
  description = DEFAULT_DESCRIPTION,
  indexable = true,
}: {
  title?: string;
  description?: string;
  indexable?: boolean;
} = {}): void {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("robots", indexable ? "index, follow" : "noindex, nofollow");
  }, [description, indexable, title]);
}
