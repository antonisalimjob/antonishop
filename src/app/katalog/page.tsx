import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/queries";

export const metadata = { title: "Katalog" };

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;
  const products = await getProducts({ q, kind: type });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Katalog</h1>
      <p className="mt-1 text-sm text-slate-500">Filter barang, akun game, atau jasa IT.</p>
      <form className="mt-6 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari produk..."
          className="h-11 w-full max-w-sm rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-teal-600"
        />
        <select name="type" defaultValue={type ?? ""} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
          <option value="">Semua tipe</option>
          <option value="physical">Barang fisik</option>
          <option value="digital_account">Akun game</option>
          <option value="service">Jasa</option>
        </select>
        <button className="h-11 rounded-xl bg-teal-700 px-4 text-sm font-medium text-white">Cari</button>
      </form>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {products.length === 0 && <p className="mt-12 text-center text-sm text-slate-500">Tidak ada produk.</p>}
    </div>
  );
}
