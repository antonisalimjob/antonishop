"use client";

import { Toaster } from "sonner";
import { AuthHydrator } from "@/components/auth-hydrator";
import { CartDrawer } from "@/components/cart-drawer";
import { LiveChat } from "@/components/live-chat";
import { Navbar } from "@/components/navbar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthHydrator>
      <Navbar />
      <main className="min-h-[calc(100vh-8rem)]">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AntoniHost Shop — antonihost.my.id/shop</p>
          <p>Pembayaran: BCA · DANA</p>
        </div>
      </footer>
      <CartDrawer />
      <LiveChat />
      <Toaster richColors position="top-center" />
    </AuthHydrator>
  );
}
