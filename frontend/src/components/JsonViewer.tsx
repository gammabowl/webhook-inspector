import { useMemo, useState } from "react";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

interface JsonViewerProps {
  value: unknown;
  defaultOpenDepth?: number;
}

function isPlainObject(value: unknown): value is Record<string, JsonValue> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function RootValue({
  value,
  depth = 0,
  defaultOpenDepth = 1,
}: {
  value: unknown;
  depth?: number;
  defaultOpenDepth?: number;
}) {
  if (value === null) {
    return <span className="text-slate-400">null</span>;
  }

  if (typeof value === "string") {
    return <span className="text-emerald-700">"{value}"</span>;
  }

  if (typeof value === "number") {
    return <span className="text-sky-700">{value}</span>;
  }

  if (typeof value === "boolean") {
    return <span className="text-violet-700">{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    return <CollectionNode value={value} depth={depth} defaultOpenDepth={defaultOpenDepth} />;
  }

  if (isPlainObject(value)) {
    return <CollectionNode value={value} depth={depth} defaultOpenDepth={defaultOpenDepth} />;
  }

  return <span className="text-slate-400">No data</span>;
}

function CollectionNode({
  value,
  depth,
  defaultOpenDepth = 1,
}: {
  value: JsonValue[] | Record<string, JsonValue>;
  depth: number;
  defaultOpenDepth?: number;
}) {
  const [open, setOpen] = useState(depth < defaultOpenDepth);
  const isArray = Array.isArray(value);
  const entries = useMemo(
    () => (isArray ? value.map((item, index) => [String(index), item] as const) : Object.entries(value)),
    [isArray, value],
  );

  const countLabel = isArray ? `${entries.length} items` : `${entries.length} keys`;

  return (
    <div className="data-mono text-sm leading-6">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 text-left text-slate-700 transition hover:text-slate-950"
      >
        <span className="inline-block w-4 text-slate-400">{open ? "▾" : "▸"}</span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {isArray ? "Array" : "Object"}
        </span>
        <span className="text-xs text-slate-500">{countLabel}</span>
      </button>

      {open ? (
        <div className="mt-2 border-l border-slate-200 pl-4">
          {entries.length === 0 ? (
            <div className="text-slate-400">{isArray ? "[]" : "{}"}</div>
          ) : (
            entries.map(([key, child], index) => (
              <div key={`${key}-${index}`} className="py-0.5">
                <div className="flex items-start gap-2">
                  <span className="min-w-0 shrink-0 text-slate-500">{isArray ? "" : `"${key}"`}</span>
                  {!isArray ? <span className="text-slate-400">:</span> : null}
                  <div className="min-w-0 flex-1">
                    {typeof child === "object" && child !== null ? (
                      <RootValue value={child} depth={depth + 1} defaultOpenDepth={defaultOpenDepth} />
                    ) : typeof child === "string" ? (
                      <span className="break-words text-emerald-700">"{child}"</span>
                    ) : typeof child === "number" ? (
                      <span className="text-sky-700">{child}</span>
                    ) : typeof child === "boolean" ? (
                      <span className="text-violet-700">{String(child)}</span>
                    ) : (
                      <span className="text-slate-400">null</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function JsonViewer({ value, defaultOpenDepth = 1 }: JsonViewerProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
      <RootValue value={value as JsonValue} defaultOpenDepth={defaultOpenDepth} />
    </div>
  );
}
