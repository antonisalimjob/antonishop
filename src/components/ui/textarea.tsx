import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes } from "react";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10",
        className,
      )}
      {...props}
    />
  );
}
