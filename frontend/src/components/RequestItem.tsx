import { WebhookRequest } from "../lib/types";
import { methodTone, toPreview } from "../lib/format";
import { timeAgo } from "../lib/time";

interface RequestItemProps {
  request: WebhookRequest;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function RequestItem({ request, selected, onSelect, onDelete }: RequestItemProps) {
  return (
    <div
      className={`group w-full rounded-2xl border p-3 text-left transition ${
        selected
          ? "border-slate-900 bg-slate-900/5 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => onSelect(request.id)} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ${methodTone(request.method)}`}>
              {request.method}
            </span>
            <span className="shrink-0 text-xs text-slate-400">{timeAgo(request.timestamp)}</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 data-mono">{request.path}</div>
          <p
            className="mt-2 text-sm leading-5 text-slate-700"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {toPreview(request.body ?? request.rawBody)}
          </p>
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(request.id);
          }}
          className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-700 group-hover:opacity-100"
          aria-label="Delete request"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
