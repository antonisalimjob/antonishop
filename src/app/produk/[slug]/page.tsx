import { notFound } from "next/navigation";
import { ProductBuy } from "@/components/product-buy";
import { Badge } from "@/components/ui/badge";
import { KIND_LABEL } from "@/lib/config";
import { formatRupiah } from "@/lib/format";
import { accentClass } from "@/lib/product";
import { getProductBySlug } from "@/lib/queries";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const specs = product.metadata?.specs ?? [];
  const kind = product.metadata?.kind ?? "physical";

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div className={`flex min-h-72 items-center justify-center rounded-3xl bg-gradient-to-br ${accentClass(product.metadata?.accent)}`}>
        <div className="text-center text-white">
          {product.metadata?.game && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest">{product.metadata.game}</p>
          )}
          <p className="text-lg font-medium opacity-90">{product.categories?.name}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{product.categories?.name}</p>
        <h1 className="mt-2 text-3xl font-semibold">{product.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="teal">{KIND_LABEL[kind]}</Badge>
          <Badge>{product.stock > 0 ? `Stok ${product.stock}` : "Habis"}</Badge>
        </div>
        <p className="mt-4 text-3xl font-bold">{formatRupiah(product.price)}</p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>
        {specs.length > 0 && (
          <ul className="mt-6 space-y-2">
            {specs.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                {s}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8">
          <ProductBuy product={product} />
        </div>
      </div>
    </div>
  );
}
