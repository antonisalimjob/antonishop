import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/config";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Semua pesanan</h1>
      <ul className="mt-6 space-y-2">
        {((orders as Order[]) ?? []).map((o) => (
          <li key={o.id}>
            <Link href={`/admin/pesanan/${o.id}`} className="surface flex items-center justify-between p-4">
              <div>
                <p className="font-mono font-medium">{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-slate-500">{formatDateTime(o.created_at)}</p>
              </div>
              <div className="text-right">
                <Badge>{STATUS_LABEL[o.status]}</Badge>
                <p className="mt-1 text-sm font-semibold">{formatRupiah(o.total_amount)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
