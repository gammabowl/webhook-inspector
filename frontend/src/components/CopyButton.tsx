import { useState } from "react";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
  ariaLabel?: string;
}

export default function CopyButton({
  value,
  label = "Copy",
  className = "",
  iconOnly = false,
  ariaLabel,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      onClick={handleCopy}
      className={`inline-flex items-center justify-center rounded-lg border shadow-sm transition-all duration-200 active:scale-95 ${
        iconOnly
          ? "h-8 w-8 border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 hover:shadow-md"
          : "border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-900 hover:shadow-md"
      } ${className}`}
    >
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
