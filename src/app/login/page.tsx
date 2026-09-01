const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // WAJIB mengarahkan ke /auth/callback agar cookie tersimpan
      redirectTo: `${window.location.origin}/shop/auth/callback`,
    },
  })
}const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // WAJIB mengarahkan ke /auth/callback agar cookie tersimpan
      redirectTo: `${window.location.origin}/shop/auth/callback`,
    },
  })
}
