'use client' // WAJIB ada di baris pertama file

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
    <button
      type="button"
      onClick={handleGoogleLogin} // Pastikan onClick terpasang di sini
      className="..."
    >
      Lanjutkan dengan Google
    </button>
  )
}
