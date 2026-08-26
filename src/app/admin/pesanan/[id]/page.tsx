import { notFound } from "next/navigation";
import { TransactionDetail } from "@/components/transaction-detail";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/types/database";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();
  const { data: items } = await supabase.from("order_items").select("*, products(title, slug)").eq("order_id", id);
  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">User: {order.user_id}</p>
      <TransactionDetail initial={order as Order} items={(items as OrderItem[]) ?? []} admin />
    </div>
  );
}
