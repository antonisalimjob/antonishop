import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getCategoryBySlug, getProducts } from "@/lib/queries";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getProducts({ categorySlug: slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Kategori</p>
      <h1 className="mt-1 text-2xl font-semibold">{category.name}</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
