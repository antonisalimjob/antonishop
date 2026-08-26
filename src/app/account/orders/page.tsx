import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { hasSupabaseEnv, STATUS_LABEL } from "@/lib/config";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";

export const metadata = { title: "Pesanan" };

export default async function OrdersHistoryPage() {
  if (!hasSupabaseEnv()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const list = (orders as Order[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Riwayat pesanan</h1>
      <ul className="mt-8 space-y-3">
        {list.map((o) => (
          <li key={o.id}>
            <Link href={`/account/orders/${o.id}`} className="surface block p-4 hover:border-teal-200">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-semibold">{o.id.slice(0, 8).toUpperCase()}</p>
                <Badge>{STATUS_LABEL[o.status]}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {o.payment_method} · {formatDateTime(o.created_at)}
              </p>
              <p className="mt-2 font-medium">{formatRupiah(o.total_amount)}</p>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-10 text-sm text-slate-500">Belum ada pesanan.</p>}
    </div>
  );
}
