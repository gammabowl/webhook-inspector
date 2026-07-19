import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import { isWebhookId } from "../lib/webhookId";
import { usePageMetadata } from "../lib/seo";
import { Bug, Lightbulb, Monitor, Code } from "lucide-react";

const STORAGE_KEY = "webhook-inspector.webhook-id";
const OPENDEVUTILS_URL = "https://www.opendevutils.com";
const SOURCE_URL = "https://github.com/gammabowl/webhook-inspector";
const FEATURE_REQUEST_URL = "https://github.com/gammabowl/webhook-inspector/issues/new?template=feature_request.md";
const BUG_REPORT_URL = "https://github.com/gammabowl/webhook-inspector/issues/new?template=bug_report.md";

export default function Home() {
  usePageMetadata();
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
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200/40 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-1 sm:gap-2">
            <a href="/" className="flex items-center gap-1 sm:gap-2 transition-opacity hover:opacity-80">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/90 shadow-sm sm:h-9 sm:w-9">
                <img src="/favicon.svg" alt="Webhook Inspector logo" className="h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-slate-950 sm:text-2xl">Webhook Inspector</h1>
                <p className="hidden text-[11px] uppercase tracking-[0.22em] text-slate-500/80 lg:block">
                  webhook testing utility
                </p>
              </div>
            </a>

            <div className="ml-auto flex items-center gap-1">
              <a
                href={OPENDEVUTILS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-md border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-950 sm:inline-flex"
                title="Back to OpenDevUtils"
              >
                OpenDevUtils
              </a>
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-slate-500 transition-colors hover:text-slate-950"
                title="View source on GitHub"
                aria-label="View source on GitHub"
              >
                <GitHubIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft md:p-10">
          <div className="space-y-4">
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
              className="rounded-2xl border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-white/70 disabled:text-slate-400 disabled:opacity-100"
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

      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex items-center gap-2 text-sm text-slate-600 md:gap-6">
            <span className="font-medium text-xs md:hidden">Open source . Self-hostable</span>
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 transition-colors hover:text-slate-900 md:flex"
              title="Open source on GitHub"
            >
              <Code className="h-4 w-4 text-violet-600" />
              <span className="font-medium">Open source on GitHub</span>
            </a>
            <div className="hidden items-center gap-1.5 md:flex" title="Use your own deployment">
              <Monitor className="h-4 w-4 text-sky-600" />
              <span className="font-medium">Self-hostable</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <a
              href={FEATURE_REQUEST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Feature Request
            </a>
            <a
              href={BUG_REPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <Bug className="h-4 w-4 text-red-500" />
              Report Bug
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}
