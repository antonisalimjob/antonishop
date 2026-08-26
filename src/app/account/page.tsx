import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { hasSupabaseEnv, STATUS_LABEL } from "@/lib/config";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";

const tone: Record<string, "amber" | "blue" | "teal" | "green" | "red" | "yellow"> = {
  pending_payment: "amber",
  verifying: "yellow",
  processing: "blue",
  completed: "green",
  cancelled: "red",
};

export default async function AccountPage() {
  if (!hasSupabaseEnv()) redirect("/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const list = (orders as Order[] | null) ?? [];
  const active = list.filter((o) => ["pending_payment", "verifying", "processing"].includes(o.status));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="surface flex items-center gap-4 p-6">
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-xl font-bold text-teal-800">
            {(profile?.full_name ?? user.email ?? "U")[0]}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold">{profile?.full_name ?? "Pengguna"}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
          <Badge className="mt-2" tone="teal">
            {profile?.role === "admin" ? "Admin" : "Customer"}
          </Badge>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Transaksi aktif</h2>
      <ul className="mt-3 space-y-3">
        {active.map((o) => (
          <li key={o.id}>
            <Link href={`/account/orders/${o.id}`} className="surface flex items-center justify-between p-4">
              <div>
                <p className="font-mono text-sm font-medium">{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-slate-500">{formatDateTime(o.created_at)}</p>
              </div>
              <div className="text-right">
                <Badge tone={tone[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                <p className="mt-1 text-sm font-semibold">{formatRupiah(o.total_amount)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {active.length === 0 && <p className="mt-3 text-sm text-slate-500">Tidak ada transaksi berjalan.</p>}
      <Link href="/account/orders" className="mt-6 inline-block text-sm font-medium text-teal-700 hover:underline">
        Semua riwayat pesanan
      </Link>
    </div>
  );
}
