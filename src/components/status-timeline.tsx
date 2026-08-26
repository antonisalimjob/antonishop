import { STATUS_FLOW, STATUS_LABEL } from "@/lib/config";
import { cn } from "@/lib/utils";

export function StatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        Pesanan dibatalkan.
      </div>
    );
  }
  const current = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number]);
  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {STATUS_FLOW.map((s, i) => {
        const done = current >= i;
        return (
          <li
            key={s}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-xs",
              done ? "border-teal-200 bg-teal-50 text-teal-900" : "border-slate-200 bg-white text-slate-400",
              current === i && "ring-2 ring-teal-600/20",
            )}
          >
            <div className="font-semibold">
              {i + 1}. {STATUS_LABEL[s]}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
