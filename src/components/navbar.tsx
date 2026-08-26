"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_NAV } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useSessionStore } from "@/store/session";

export function Navbar() {
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user);
  const profile = useSessionStore((s) => s.profile);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [menu, setMenu] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenu(false), [pathname]);

  const count = mounted ? items.reduce((n, i) => n + i.qty, 0) : 0;

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/shop";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-sm font-bold text-white">
            A
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight">AntoniHost</span>
            <span className="block text-[11px] text-slate-500">Shop · IT · Game · Jasa</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {CATEGORY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                pathname.startsWith(item.href) && "bg-teal-50 font-medium text-teal-800",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100"
            aria-label="Keranjang"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-teal-700 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserOpen((v) => !v)}
                className="flex h-10 items-center gap-2 rounded-xl px-2 hover:bg-slate-100"
              >
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200">
                    <User className="h-4 w-4" />
                  </span>
                )}
              </button>
              {userOpen && (
                <div className="absolute right-0 mt-1 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <p className="truncate px-2 py-1 text-sm font-medium">{profile?.full_name ?? user.email}</p>
                  <p className="truncate px-2 pb-2 text-xs text-slate-500">{user.email}</p>
                  <Link href="/account" className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-50">
                    Akun & pesanan
                  </Link>
                  {profile?.role === "admin" && (
                    <Link href="/admin" className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-50">
                      Panel admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full rounded-lg px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Masuk Google</Button>
            </Link>
          )}

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100 md:hidden"
            onClick={() => setMenu((v) => !v)}
            aria-label="Menu"
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menu && (
        <div className="border-t border-slate-100 px-4 py-3 md:hidden">
          {CATEGORY_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-50">
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
