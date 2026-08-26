import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseEnv } from "@/lib/config";

export function createClient() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase env belum diisi. Salin .env.local.example ke .env.local.");
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
