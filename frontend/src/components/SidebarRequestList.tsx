import { useEffect, useLayoutEffect, useRef } from "react";
import { WebhookRequest } from "../lib/types";
import RequestItem from "./RequestItem";

interface SidebarRequestListProps {
  requests: WebhookRequest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SidebarRequestList({ requests, selectedId, onSelect, onDelete }: SidebarRequestListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const snapshotRef = useRef({ count: 0, firstId: "", scrollTop: 0, scrollHeight: 0 });

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }

    const onScroll = (): void => {
      snapshotRef.current.scrollTop = node.scrollTop;
    };

    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }

    const previous = snapshotRef.current;
    const nextHeight = node.scrollHeight;
    const changedAtTop = requests[0]?.id !== previous.firstId;

    if (changedAtTop) {
      const delta = nextHeight - previous.scrollHeight;
      const nearTop = previous.scrollTop < 16;
      if (!nearTop) {
        node.scrollTop = previous.scrollTop + delta;
      }
    }

    snapshotRef.current = {
      count: requests.length,
      firstId: requests[0]?.id ?? "",
      scrollTop: node.scrollTop,
      scrollHeight: nextHeight,
    };
  }, [requests]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Requests</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{requests.length} received</h2>
          </div>
        </div>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-50 via-cyan-50 to-fuchsia-50 ring-1 ring-sky-100">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <defs>
                    <linearGradient id="pulse-sidebar-gradient" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#0ea5e9" />
                      <stop offset="0.5" stopColor="#06b6d4" />
                      <stop offset="1" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="0" stroke="url(#pulse-sidebar-gradient)" strokeWidth="1.7" opacity="0.9">
                    <animate attributeName="r" calcMode="spline" dur="1.2s" values="0;10" keySplines=".52,.6,.25,.99" repeatCount="indefinite" />
                    <animate attributeName="opacity" calcMode="spline" dur="1.2s" values="1;0" keySplines=".52,.6,.25,.99" repeatCount="indefinite" />
                  </circle>
                  <circle cx="12" cy="12" r="2.1" fill="url(#pulse-sidebar-gradient)" />
                </svg>
              </span>
              <div>
                <p className="font-medium text-slate-700">Waiting for the first webhook request.</p>
                <p className="mt-1 text-xs text-slate-500">Send a request and it will appear here automatically.</p>
              </div>
            </div>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="animate-fadeIn">
              <RequestItem request={request} selected={request.id === selectedId} onSelect={onSelect} onDelete={onDelete} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
