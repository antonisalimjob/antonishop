"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50",
        className,
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-teal-700" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Tersalin" : label ?? "Salin"}
    </button>
  );
}
