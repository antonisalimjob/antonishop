import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/config";
import type { ProductWithCategory } from "@/types/database";

export async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(*)")
    .contains("metadata", { featured: true })
    .order("price", { ascending: false })
    .limit(8);
  return (data as ProductWithCategory[] | null) ?? [];
}

export async function getProducts(opts?: { q?: string; kind?: string; categorySlug?: string }) {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  let q = supabase.from("products").select("*, categories(*)");
  if (opts?.categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", opts.categorySlug).maybeSingle();
    if (!cat) return [];
    q = q.eq("category_id", cat.id);
  }
  if (opts?.q) {
    q = q.or(`title.ilike.%${opts.q}%,description.ilike.%${opts.q}%`);
  }
  const { data } = await q.order("created_at", { ascending: false });
  let rows = (data as ProductWithCategory[] | null) ?? [];
  if (opts?.kind) {
    rows = rows.filter((p) => p.metadata?.kind === opts.kind);
  }
  return rows;
}

export async function getProductBySlug(slug: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .maybeSingle();
  return (data as ProductWithCategory | null) ?? null;
}

export async function getCategoryBySlug(slug: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  return data;
}
