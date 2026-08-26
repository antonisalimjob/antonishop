"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  accent: string;
  qty: number;
  kind: string;
  stock: number;
};

type CartState = {
  items: CartLine[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (item, qty = 1) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        const digital = item.kind !== "physical";
        if (existing) {
          const nextQty = digital ? 1 : Math.min(item.stock, existing.qty + qty);
          set({
            items: get().items.map((i) =>
              i.productId === item.productId ? { ...i, qty: nextQty } : i,
            ),
            open: true,
          });
          return;
        }
        set({
          items: [...get().items, { ...item, qty: digital ? 1 : Math.min(item.stock, qty) }],
          open: true,
        });
      },
      remove: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      updateQty: (productId, qty) => {
        if (qty < 1) {
          get().remove(productId);
          return;
        }
        set({
          items: get().items.map((i) => {
            if (i.productId !== productId) return i;
            const cap = i.kind === "physical" ? i.stock : 1;
            return { ...i, qty: Math.min(cap, qty) };
          }),
        });
      },
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.price * i.qty, 0),
    }),
    { name: "antonihost-cart" },
  ),
);
