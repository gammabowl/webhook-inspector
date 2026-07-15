import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteRequest, fetchRequests } from "../lib/api";
import { WebhookRequest } from "../lib/types";
import SidebarRequestList from "../components/SidebarRequestList";
import RequestViewer from "../components/RequestViewer";
import CopyButton from "../components/CopyButton";
import { getApiBaseUrl } from "../lib/config";

const POLL_INTERVAL = 1500;
const MAX_REQUESTS = 50;
const API_ORIGIN = new URL(getApiBaseUrl()).origin;
const STORAGE_KEY = "webhook-inspector.webhook-id";

export default function WebhookPage() {
  const { webhookId = "" } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [pollNonce, setPollNonce] = useState(0);
  const latestTimestampRef = useRef(0);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedId) ?? requests[0] ?? null,
    [requests, selectedId],
  );

  useEffect(() => {
    if (!selectedId && requests.length > 0) {
      setSelectedId(requests[0].id);
    }
  }, [requests, selectedId]);

  useEffect(() => {
    latestTimestampRef.current = requests.reduce((latest, request) => Math.max(latest, request.timestamp), 0);
  }, [requests]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, webhookId);
    latestTimestampRef.current = 0;
    let active = true;
    let timeoutId: number | undefined;

    const load = async (): Promise<void> => {
      try {
        const response = await fetchRequests(webhookId, latestTimestampRef.current, MAX_REQUESTS);

        if (!active) {
          return;
        }

        setRequests((current) => mergeRequests(current, response.requests));
        setLastUpdated(Date.now());
        setStatus("live");
      } catch {
        if (active) {
          setStatus("error");
        }
      } finally {
        if (active) {
          timeoutId = window.setTimeout(load, POLL_INTERVAL);
        }
      }
    };

    setRequests([]);
    setSelectedId(null);
    setStatus("loading");
    setLastUpdated(null);
    void load();

    return () => {
      active = false;
      if (typeof timeoutId !== "undefined") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [webhookId, pollNonce]);

  const webhookUrl = `${API_ORIGIN}/${webhookId}`;

  const createNewWebhook = (): void => {
    const nextId = window.crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, nextId);
    navigate(`/${nextId}`);
  };

  const handleDeleteRequest = async (requestId: string): Promise<void> => {
    const confirmed = window.confirm("Delete this webhook request?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await deleteRequest(webhookId, requestId);
      if (!response.deleted) {
        return;
      }

      setRequests((current) => current.filter((request) => request.id !== requestId));
      setSelectedId((current) => (current === requestId ? null : current));
      setPollNonce((current) => current + 1);
      setStatus("live");
      setLastUpdated(Date.now());
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="h-full px-4 py-4">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-4">
        <header className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-soft backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Webhook URL</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                  <span className="data-mono min-w-0 break-all text-sm text-slate-700">{webhookUrl}</span>
                  <CopyButton value={webhookUrl} ariaLabel="Copy webhook URL" />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    status === "live" ? "bg-emerald-50 text-emerald-700" : status === "error" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {status === "live" ? "Polling" : status === "error" ? "Reconnecting" : "Loading"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={createNewWebhook}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                New URL
              </button>
              <Link
                to="/"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                Home
              </Link>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>{lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : "Waiting for the first request"}</span>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(300px,30%)_minmax(0,70%)]">
          <aside className="min-h-0">
            <SidebarRequestList
              requests={requests}
              selectedId={selectedRequest?.id ?? null}
              onSelect={setSelectedId}
              onDelete={handleDeleteRequest}
            />
          </aside>
          <section className="min-h-0">
            <RequestViewer request={selectedRequest} />
          </section>
        </section>
      </div>
    </main>
  );
}

function mergeRequests(current: WebhookRequest[], incoming: WebhookRequest[]): WebhookRequest[] {
  const map = new Map<string, WebhookRequest>();

  for (const request of [...current, ...incoming]) {
    map.set(request.id, request);
  }

  return Array.from(map.values())
    .sort((left, right) => right.timestamp - left.timestamp || right.id.localeCompare(left.id))
    .slice(0, MAX_REQUESTS);
}
