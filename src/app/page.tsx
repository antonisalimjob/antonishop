import Link from "next/link";
import { Gamepad2, Monitor, Package, ShieldCheck, Wrench } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { hasSupabaseEnv } from "@/lib/config";
import { getFeaturedProducts } from "@/lib/queries";

const CATS = [
  { href: "/kategori/komputer-aksesoris", title: "Komputer & Aksesori", desc: "Laptop, hardware, peripheral", icon: Monitor },
  { href: "/kategori/other-items", title: "Other Items", desc: "Tas, hub, kabel, cooling pad", icon: Package },
  { href: "/kategori/akun-game", title: "Akun Game", desc: "MLBB, Honor of Kings, dll.", icon: Gamepad2 },
  { href: "/kategori/jasa-it-support", title: "Jasa IT Support", desc: "Install, maintenance, jaringan", icon: Wrench },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      <section className="hero-grid border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              antonihost.my.id/shop
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Hardware, akun game, dan jasa IT dalam satu tempat.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 md:text-base">
              Belanja laptop hingga paket maintenance. Checkout BCA atau DANA, unggah bukti ke Storage, pantau status realtime.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/katalog">
                <Button size="lg">Lihat katalog</Button>
              </Link>
              <Link href="/kategori/jasa-it-support">
                <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Jasa IT Support
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-teal-300" />
              Masuk hanya dengan Google · Supabase Auth
            </div>
            {!hasSupabaseEnv() && (
              <p className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                Isi NEXT_PUBLIC_SUPABASE_URL dan ANON_KEY di .env.local, lalu jalankan supabase/schema.sql.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CATS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur hover:bg-white/10"
              >
                <c.icon className="mb-3 h-6 w-6 text-teal-300" />
                <h2 className="text-sm font-semibold">{c.title}</h2>
                <p className="mt-1 text-xs text-slate-400">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Pilihan unggulan</h2>
            <p className="mt-1 text-sm text-slate-500">Produk dan jasa yang paling sering dicari.</p>
          </div>
          <Link href="/katalog" className="text-sm font-medium text-teal-700 hover:underline">
            Semua produk
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="text-sm text-slate-500">Katalog kosong — jalankan seed di supabase/schema.sql setelah project Supabase siap.</p>
        )}
      </section>
    </div>
  );
}
