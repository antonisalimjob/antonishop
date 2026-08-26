"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { accentClass } from "@/lib/product";
import { useCart } from "@/store/cart";

export function CartDrawer() {
  const { items, open, setOpen, updateQty, remove, subtotal } = useCart();
  const total = subtotal();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Tutup keranjang"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-teal-700" />
            <h2 className="font-semibold">Keranjang</h2>
            <span className="text-sm text-slate-500">({items.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-sm text-slate-500">
              <div>
                <p>Keranjang masih kosong.</p>
                <Link href="/katalog" onClick={() => setOpen(false)} className="mt-2 inline-block text-teal-700">
                  Lihat katalog
                </Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <div className={`h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br ${accentClass(item.accent)}`} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produk/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-sm font-medium hover:text-teal-800"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 text-sm font-semibold">{formatRupiah(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200"
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200"
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="ml-auto grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                        onClick={() => remove(item.productId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 p-5">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-lg font-bold">{formatRupiah(total)}</span>
          </div>
          <Link href="/checkout" onClick={() => setOpen(false)}>
            <Button className="w-full" size="lg" disabled={items.length === 0}>
              Checkout
            </Button>
          </Link>
          <p className="mt-2 text-center text-[11px] text-slate-400">Checkout hanya dengan akun Google.</p>
        </div>
      </aside>
    </div>
  );
}
