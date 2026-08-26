"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";

export function ProductBuy({
  product,
}: {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    stock: number;
    metadata?: { accent?: string; kind?: string };
  };
}) {
  const add = useCart((s) => s.add);
  const out = product.stock < 1;
  return (
    <Button
      size="lg"
      disabled={out}
      onClick={() => {
        add({
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          accent: product.metadata?.accent ?? "teal",
          kind: product.metadata?.kind ?? "physical",
          stock: product.stock,
        });
        toast.success("Ditambahkan ke keranjang");
      }}
    >
      <ShoppingCart className="h-4 w-4" />
      {out ? "Stok habis" : "Tambah ke keranjang"}
    </Button>
  );
}
