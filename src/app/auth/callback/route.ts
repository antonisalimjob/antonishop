import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'

  if (code) {
    const cookieStore = await cookies()
    
    // Siapkan response redirect terlebih dahulu
    const response = NextResponse.redirect(`${origin}/shop${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Tulis cookie ke cookieStore dan ke objek response langsung
              cookieStore.set(name, value, { ...options, path: '/' })
              response.cookies.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: true,
              })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return response
    }
    
    console.error('Supabase Auth Exchange Error:', error.message)
  }

  return NextResponse.redirect(`${origin}/shop/login?error=auth-failed`)
}
