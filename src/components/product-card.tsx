"use client";

import Link from "next/link";
import { Gamepad2, Monitor, Package, ShoppingCart, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KIND_LABEL } from "@/lib/config";
import { formatRupiah } from "@/lib/format";
import { accentClass } from "@/lib/product";
import { useCart } from "@/store/cart";
import type { ProductWithCategory } from "@/types/database";

const ICONS = {
  "komputer-aksesoris": Monitor,
  "other-items": Package,
  "akun-game": Gamepad2,
  "jasa-it-support": Wrench,
};

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const add = useCart((s) => s.add);
  const slug = product.categories?.slug ?? "";
  const Icon = ICONS[slug as keyof typeof ICONS] ?? Package;
  const kind = product.metadata?.kind ?? "physical";
  const out = product.stock < 1;

  return (
    <article className="surface group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/80">
      <Link href={`/produk/${product.slug}`} className="block">
        <div
          className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${accentClass(product.metadata?.accent)}`}
        >
          <Icon className="h-14 w-14 text-white/90" />
          {product.metadata?.game && (
            <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              {product.metadata.game}
            </span>
          )}
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-700">
            {KIND_LABEL[kind] ?? kind}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-teal-700">
            {product.categories?.name}
          </p>
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-teal-800">
            {product.title}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{product.description}</p>
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
        <div>
          <div className="text-sm font-bold text-slate-900">{formatRupiah(product.price)}</div>
          {out ? <Badge tone="red">Stok habis</Badge> : <p className="text-[11px] text-slate-500">Stok {product.stock}</p>}
        </div>
        <Button
          size="sm"
          disabled={out}
          onClick={() =>
            add({
              productId: product.id,
              slug: product.slug,
              title: product.title,
              price: product.price,
              accent: product.metadata?.accent ?? "teal",
              kind,
              stock: product.stock,
            })
          }
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Keranjang
        </Button>
      </div>
    </article>
  );
}
