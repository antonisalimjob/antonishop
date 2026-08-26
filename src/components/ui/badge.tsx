import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

const styles: Record<string, string> = {
  default: "bg-slate-100 text-slate-700",
  teal: "bg-teal-50 text-teal-800",
  amber: "bg-amber-50 text-amber-800",
  blue: "bg-blue-50 text-blue-800",
  green: "bg-emerald-50 text-emerald-800",
  red: "bg-red-50 text-red-700",
  yellow: "bg-yellow-50 text-yellow-800",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof styles }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[tone],
        className,
      )}
      {...props}
    />
  );
}
