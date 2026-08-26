"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { StatusTimeline } from "@/components/status-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYMENT, STATUS_HELP, STATUS_LABEL } from "@/lib/config";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderItem } from "@/types/database";

const tone: Record<string, "amber" | "blue" | "teal" | "green" | "red" | "yellow"> = {
  pending_payment: "amber",
  verifying: "yellow",
  processing: "blue",
  completed: "green",
  cancelled: "red",
};

export function TransactionDetail({
  initial,
  items,
  admin = false,
}: {
  initial: Order;
  items: OrderItem[];
  admin?: boolean;
}) {
  const [order, setOrder] = useState(initial);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (order.payment_proof_url) {
      supabase.storage
        .from("payment-proofs")
        .createSignedUrl(order.payment_proof_url, 3600)
        .then(({ data }) => setProofUrl(data?.signedUrl ?? null));
    }
    const channel = supabase
      .channel(`order:${order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload) => setOrder(payload.new as Order),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id, order.payment_proof_url]);

  async function uploadProof() {
    if (!file) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const ext = file.type === "image/png" ? "png" : "jpg";
      const path = `${order.user_id}/${order.id}.${ext}`;
      const up = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: true });
      if (up.error) {
        toast.error(up.error.message);
        return;
      }
      const { error } = await supabase
        .from("orders")
        .update({ payment_proof_url: path, status: "verifying" })
        .eq("id", order.id);
      if (error) toast.error(error.message);
      else toast.success("Bukti terkirim.");
    } finally {
      setBusy(false);
    }
  }

  async function adminSet(status: Order["status"]) {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
      if (error) toast.error(error.message);
      else toast.success("Status diperbarui");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Transaksi</p>
          <h1 className="mt-1 font-mono text-xl font-semibold">{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-slate-500">{formatDateTime(order.created_at)}</p>
        </div>
        <Badge tone={tone[order.status] ?? "default"}>{STATUS_LABEL[order.status]}</Badge>
      </div>
      <StatusTimeline status={order.status} />
      <p className="text-sm text-slate-500">{STATUS_HELP[order.status]}</p>

      <div className="surface p-5">
        <h2 className="font-semibold">Item</h2>
        <ul className="mt-3 space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between text-sm">
              <span>
                {i.products?.title ?? i.product_id} × {i.quantity}
              </span>
              <span className="font-medium">{formatRupiah(i.price_at_purchase * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 font-semibold">
          <span>Total</span>
          <span>{formatRupiah(order.total_amount)}</span>
        </div>
      </div>

      {(order.status === "pending_payment" || order.status === "verifying") && (
        <div className="surface p-5">
          <h2 className="font-semibold">{order.payment_method === "BCA" ? "Transfer Bank BCA" : "E-Wallet DANA"}</h2>
          {order.payment_method === "BCA" ? (
            <div className="mt-3">
              <p className="font-mono text-xl tracking-wide">{PAYMENT.bca.number}</p>
              <p className="text-sm text-slate-500">a.n. {PAYMENT.bca.name}</p>
              <CopyButton className="mt-2" value={PAYMENT.bca.number} label="Salin nomor rekening" />
            </div>
          ) : (
            <div className="mt-3">
              <p className="font-mono text-xl tracking-wide">{PAYMENT.dana.phone}</p>
              <p className="text-sm text-slate-500">a.n. {PAYMENT.dana.name}</p>
              <CopyButton className="mt-2" value={PAYMENT.dana.phone} label="Salin nomor DANA" />
            </div>
          )}
        </div>
      )}

      {proofUrl && (
        <div className="surface p-5">
          <p className="font-semibold">Bukti pembayaran</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proofUrl} alt="Bukti" className="mt-3 max-h-72 rounded-xl border border-slate-200" />
        </div>
      )}

      {!admin && order.status === "pending_payment" && (
        <div className="surface p-5">
          <h2 className="font-semibold">Unggah bukti (Supabase Storage)</h2>
          <input type="file" accept="image/*" className="mt-3 block w-full text-sm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button className="mt-4" disabled={!file || busy} onClick={uploadProof}>
            Kirim bukti
          </Button>
        </div>
      )}

      {admin && order.status !== "completed" && order.status !== "cancelled" && (
        <div className="flex flex-wrap gap-2">
          {order.status === "verifying" && (
            <Button disabled={busy} onClick={() => adminSet("processing")}>
              Verifikasi & proses
            </Button>
          )}
          {order.status === "processing" && (
            <Button disabled={busy} onClick={() => adminSet("completed")}>
              Tandai selesai
            </Button>
          )}
          <Button variant="danger" disabled={busy} onClick={() => adminSet("cancelled")}>
            Batalkan
          </Button>
        </div>
      )}
    </div>
  );
}
