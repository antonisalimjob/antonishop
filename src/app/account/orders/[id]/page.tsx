import { notFound, redirect } from "next/navigation";
import { TransactionDetail } from "@/components/transaction-detail";
import { hasSupabaseEnv } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/types/database";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) redirect("/login");
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();
  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(title, slug)")
    .eq("order_id", id);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <TransactionDetail initial={order as Order} items={(items as OrderItem[]) ?? []} />
    </div>
  );
}
