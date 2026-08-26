"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BASE_PATH, hasSupabaseEnv } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

export default function LoginClient() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";
  const error = params.get("error");

  async function loginGoogle() {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}${BASE_PATH}/auth/callback?next=${encodeURIComponent(next)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <div className="surface p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-teal-700 text-lg font-bold text-white">
          A
        </div>
        <h1 className="text-2xl font-semibold">Masuk ke AntoniHost Shop</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Sign up dan login hanya melalui Google. Tidak ada kata sandi lokal.
        </p>
        {!hasSupabaseEnv() && (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Supabase belum dikonfigurasi. Isi .env.local dari .env.local.example.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">Gagal masuk. Periksa Google OAuth di dashboard Supabase.</p>
        )}
        <Button className="mt-6 w-full" size="lg" onClick={loginGoogle} disabled={!hasSupabaseEnv()}>
          Lanjutkan dengan Google
        </Button>
      </div>
    </div>
  );
}
