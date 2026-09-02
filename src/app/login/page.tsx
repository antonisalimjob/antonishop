'use client' // WAJIB ada di baris pertama file

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
