"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT } from "@/lib/config";
import { formatRupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import type { PaymentMethod } from "@/types/database";

export function PaymentForm() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("BCA");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const total = subtotal();

  async function submit() {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("place_order", {
        p_payment_method: method,
        p_items: items.map((i) => ({ product_id: i.productId, quantity: i.qty })),
        p_note: note || null,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      const orderId = data as string;

      if (file) {
        const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const path = `${user.id}/${orderId}.${ext}`;
          const up = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: true });
          if (up.error) {
            toast.error("Pesanan dibuat, tetapi upload bukti gagal. Unggah ulang di detail pesanan.");
          } else {
            await supabase
              .from("orders")
              .update({ payment_proof_url: path, status: "verifying" })
              .eq("id", orderId);
          }
        }
      }

      clear();
      toast.success("Pesanan dibuat.");
      router.push(`/account/orders/${orderId}`);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Keranjang kosong</h1>
        <p className="mt-2 text-sm text-slate-500">Tambahkan produk sebelum checkout.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_22rem]">
      <div>
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-1 text-sm text-slate-500">Pilih BCA atau DANA, lalu buat pesanan. Bukti transfer bisa diunggah sekarang atau nanti.</p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => setMethod("BCA")}
            className={cn(
              "flex w-full items-start gap-4 rounded-2xl border p-4 text-left",
              method === "BCA" ? "border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/15" : "border-slate-200 bg-white",
            )}
          >
            <Building2 className="mt-0.5 h-5 w-5 text-teal-700" />
            <div className="flex-1">
              <p className="font-semibold">Transfer Bank BCA</p>
              <p className="mt-1 font-mono text-lg tracking-wide">{PAYMENT.bca.number}</p>
              <p className="text-sm text-slate-500">a.n. {PAYMENT.bca.name}</p>
              <CopyButton className="mt-2" value={PAYMENT.bca.number} label="Salin nomor rekening" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethod("DANA")}
            className={cn(
              "flex w-full items-start gap-4 rounded-2xl border p-4 text-left",
              method === "DANA" ? "border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/15" : "border-slate-200 bg-white",
            )}
          >
            <Wallet className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold">E-Wallet DANA</p>
              <p className="mt-1 font-mono text-lg tracking-wide">{PAYMENT.dana.phone}</p>
              <p className="text-sm text-slate-500">a.n. {PAYMENT.dana.name}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <CopyButton value={PAYMENT.dana.phone} label="Salin nomor DANA" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/shop/qris-dana.svg" alt="QRIS DANA" className="h-28 w-28 rounded-xl border border-slate-200 bg-white p-1" />
              </div>
            </div>
          </button>
        </div>

        <label className="mt-6 block text-sm font-medium">Catatan (opsional)</label>
        <Textarea className="mt-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Jadwal maintenance, email akun, dll." />

        <label className="mt-6 block text-sm font-medium">Bukti transfer (opsional sekarang)</label>
        <input type="file" accept="image/*" className="mt-2 block w-full text-sm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>

      <aside className="surface h-fit p-5">
        <h2 className="font-semibold">Ringkasan</h2>
        <ul className="mt-4 space-y-3">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3 text-sm">
              <span className="text-slate-600">
                {i.title} × {i.qty}
              </span>
              <span className="font-medium">{formatRupiah(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">
          <span>Total</span>
          <span className="text-lg font-bold">{formatRupiah(total)}</span>
        </div>
        <Button className="mt-5 w-full" size="lg" disabled={loading} onClick={submit}>
          {loading ? "Memproses..." : "Buat pesanan"}
        </Button>
      </aside>
    </div>
  );
}
