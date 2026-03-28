import { useMemo, useState } from "react";
import { WebhookRequest } from "../lib/types";
import { formatTimestamp, timeAgo } from "../lib/time";
import { methodTone } from "../lib/format";
import CopyButton from "./CopyButton";
import JsonViewer from "./JsonViewer";
import Tabs from "./Tabs";

interface RequestViewerProps {
  request: WebhookRequest | null;
}

function normaliseEntries(source: Record<string, unknown>): Array<[string, unknown]> {
  return Object.entries(source).sort(([a], [b]) => a.localeCompare(b));
}

function searchableEntries(source: Record<string, unknown>, query: string): Array<[string, unknown]> {
  const search = query.trim().toLowerCase();
  const entries = normaliseEntries(source);
  if (!search) {
    return entries;
  }

  return entries.filter(([key, value]) => `${key} ${String(value)}`.toLowerCase().includes(search));
}

export default function RequestViewer({ request }: RequestViewerProps) {
  const [tab, setTab] = useState("Body");
  const [headerFilter, setHeaderFilter] = useState("");
  const [queryFilter, setQueryFilter] = useState("");
  const bodyOpenDepth = useMemo(() => getBodyOpenDepth(request?.body ?? request?.rawBody ?? null), [
    request?.body,
    request?.rawBody,
  ]);

  const payload = useMemo(() => {
    if (!request) {
      return null;
    }

    const serialised = {
      method: request.method,
      path: request.path,
      timestamp: request.timestamp,
      headers: request.headers,
      query: request.query,
      body: request.body,
      rawBody: request.rawBody,
    };

    return JSON.stringify(serialised, null, 2);
  }, [request]);

  if (!request) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="max-w-lg px-6 text-center">
          <div className="mx-auto mb-6 w-full max-w-sm overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
              <span>Ingress standby</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-700">Listening</span>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <svg viewBox="0 0 360 220" className="h-full w-full max-w-[300px]" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="idle-panel" x1="48" y1="34" x2="300" y2="186" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0f172a" />
                    <stop offset="0.55" stopColor="#1e3a8a" />
                    <stop offset="1" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="idle-beacon" x1="188" y1="74" x2="262" y2="150" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38bdf8" />
                    <stop offset="0.55" stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#f472b6" />
                  </linearGradient>
                </defs>

                <rect x="46" y="42" width="268" height="136" rx="24" fill="url(#idle-panel)" />
                <rect x="60" y="56" width="240" height="108" rx="18" fill="#0b1220" opacity="0.88" />
                <rect x="76" y="74" width="108" height="10" rx="5" fill="#e2e8f0" opacity="0.82" />
                <rect x="76" y="96" width="160" height="8" rx="4" fill="#94a3b8" opacity="0.7" />
                <rect x="76" y="112" width="132" height="8" rx="4" fill="#94a3b8" opacity="0.56" />
                <rect x="76" y="128" width="92" height="8" rx="4" fill="#94a3b8" opacity="0.42" />

                <circle cx="246" cy="96" r="22" stroke="url(#idle-beacon)" strokeWidth="4" opacity="0.25">
                  <animate attributeName="r" values="22;32;22" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.02;0.3" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="246" cy="96" r="12" fill="url(#idle-beacon)">
                  <animate attributeName="opacity" values="1;0.6;1" dur="1.6s" repeatCount="indefinite" />
                </circle>
                <path d="M246 74v22M224 96h22M246 96h22M232 82l14 14M232 110l14-14" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" opacity="0.55" />

                <path d="M86 152h188" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
                <path d="M112 78c16-14 34-18 52-18" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                <path d="M114 92c22-10 42-10 64-2" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                <path d="M118 106c18-6 36-6 56 0" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              </svg>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">Capture queue</span>
                <span>idle</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-fuchsia-500 opacity-90 animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Waiting for the first webhook request.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Send a webhook to this URL and it will appear here automatically. The panel will stay quiet until the first request arrives.
          </p>
        </div>
      </div>
    );
  }

  const headerEntries = searchableEntries(request.headers, headerFilter);
  const queryEntries = searchableEntries(request.query, queryFilter);
  const bodyLabel = typeof request.body === "undefined" || request.body === null ? "No parsed body" : undefined;
  const rawCopyValue = typeof request.rawBody === "string" ? request.rawBody : "";
  const bodyCopyValue =
    typeof request.body === "string"
      ? request.body
      : typeof request.body === "undefined" || request.body === null
        ? request.rawBody ?? ""
        : JSON.stringify(request.body, null, 2);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ${methodTone(request.method)}`}>
                {request.method}
              </span>
              <span className="text-sm text-slate-400">{timeAgo(request.timestamp)}</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{request.path}</h2>
            <p className="mt-1 text-xs text-slate-500">{formatTimestamp(request.timestamp)}</p>
          </div>

          <CopyButton value={payload ?? ""} label="Copy request" />
        </div>
      </div>

      <div className="border-b border-slate-200 px-5 py-4">
        <Tabs tabs={["Body", "Headers", "Query", "Raw"]} active={tab} onChange={setTab} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {tab === "Body" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                {bodyLabel ? bodyLabel : "Pretty-printed payload with collapsible nodes."}
              </p>
              <CopyButton value={bodyCopyValue} />
            </div>
            <JsonViewer value={request.body ?? request.rawBody ?? null} defaultOpenDepth={bodyOpenDepth} />
          </div>
        ) : null}

        {tab === "Headers" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <input
                value={headerFilter}
                onChange={(event) => setHeaderFilter(event.target.value)}
                placeholder="Filter headers"
                className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
              />
              <CopyButton value={JSON.stringify(request.headers, null, 2)} />
            </div>
            <KeyValueTable entries={headerEntries} emptyLabel="No headers matched your filter." />
          </div>
        ) : null}

        {tab === "Query" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <input
                value={queryFilter}
                onChange={(event) => setQueryFilter(event.target.value)}
                placeholder="Filter query params"
                className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
              />
              <CopyButton value={JSON.stringify(request.query, null, 2)} />
            </div>
            <KeyValueTable entries={queryEntries} emptyLabel="No query params matched your filter." />
          </div>
        ) : null}

        {tab === "Raw" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">Monospace raw payload with a single-click copy action.</p>
              <CopyButton value={rawCopyValue} />
            </div>
            <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100 shadow-sm">
              <code className="data-mono">{request.rawBody || ""}</code>
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function KeyValueTable({ entries, emptyLabel }: { entries: Array<[string, unknown]>; emptyLabel: string }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-500">Key</th>
            <th className="px-4 py-3 font-medium text-slate-500">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {entries.map(([key, value]) => (
            <tr key={key} className="align-top">
              <td className="data-mono px-4 py-3 text-slate-700">{key}</td>
              <td className="data-mono px-4 py-3 text-slate-500">{formatCell(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value === null) {
    return "null";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getBodyOpenDepth(value: unknown): number {
  const size = estimatePayloadSize(value);
  if (size > 7000) {
    return 1;
  }

  if (size > 2500) {
    return 2;
  }

  return 4;
}

function estimatePayloadSize(value: unknown): number {
  if (typeof value === "string") {
    return value.length;
  }

  try {
    return JSON.stringify(value)?.length ?? 0;
  } catch {
    return 0;
  }
}
