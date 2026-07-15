import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import { isWebhookId } from "../lib/webhookId";

const STORAGE_KEY = "webhook-inspector.webhook-id";

export default function Home() {
  const navigate = useNavigate();
  const [webhookId, setWebhookId] = useState<string | null>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && isWebhookId(stored) ? stored : null;
  });

  const currentUrl = useMemo(() => {
    if (!webhookId) {
      return "";
    }

    return `${window.location.origin}/${webhookId}`;
  }, [webhookId]);

  const openCurrent = (): void => {
    if (!webhookId || !isWebhookId(webhookId)) {
      return;
    }

    navigate(`/${webhookId}`);
  };

  const createNew = (): void => {
    const nextId = window.crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, nextId);
    setWebhookId(nextId);
    navigate(`/${nextId}`);
  };

  return (
    <main className="flex min-h-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft md:p-10">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Webhook Inspector</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">A unique URL for testing webhook traffic.</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Create a fresh URL, send webhooks to it, and inspect every request in a clean split-pane view.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={createNew}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Create new URL
          </button>
          <button
            type="button"
            onClick={openCurrent}
            disabled={!webhookId}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Open current URL
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Current URL</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="data-mono min-w-0 flex-1 break-all text-sm text-slate-700">
              {currentUrl || "Create a URL to begin."}
            </code>
            {webhookId ? <CopyButton value={currentUrl} ariaLabel="Copy current URL" /> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
