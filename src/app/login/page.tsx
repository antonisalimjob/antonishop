'use client'

import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/shop/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Masuk ke AntoniHost Shop
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up dan login hanya melalui Google. Tidak ada kata sandi lokal.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-lg bg-emerald-700 py-3 text-white font-medium hover:bg-emerald-800 transition"
        >
          Lanjutkan dengan Google
        </button>
      </div>
    </div>
  )
}
