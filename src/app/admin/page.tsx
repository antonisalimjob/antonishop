import Link from "next/link";
import { STATUS_LABEL } from "@/lib/config";
import { formatRupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";

export default async function AdminHome() {
  const supabase = await createClient();
  const [{ count: pending }, { count: processing }, { count: chats }, { data: recent }] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "verifying"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "processing"),
    supabase.from("chat_messages").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Panel admin</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="surface p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Menunggu verifikasi</p>
          <p className="mt-2 text-3xl font-bold">{pending ?? 0}</p>
        </div>
        <div className="surface p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Diproses</p>
          <p className="mt-2 text-3xl font-bold">{processing ?? 0}</p>
        </div>
        <div className="surface p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Pesan chat</p>
          <p className="mt-2 text-3xl font-bold">{chats ?? 0}</p>
        </div>
      </div>
      <h2 className="mt-10 font-semibold">Pesanan terbaru</h2>
      <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {((recent as Order[]) ?? []).map((o) => (
          <li key={o.id}>
            <Link href={`/admin/pesanan/${o.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <p className="font-mono text-sm">{o.id.slice(0, 8).toUpperCase()}</p>
              <div className="text-right text-sm">
                <p>{STATUS_LABEL[o.status]}</p>
                <p className="font-semibold">{formatRupiah(o.total_amount)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
