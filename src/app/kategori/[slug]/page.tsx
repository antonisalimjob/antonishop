import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  // 1. Cek Sesi User & Role Admin
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    isAdmin = profile?.role === 'admin'
  }

  // 2. Ambil Daftar Produk Berdasarkan Kategori
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_slug', slug)
    .order('created_at', { ascending: false })

  // Nomor WhatsApp tujuan pemesanan (ganti jika perlu)
  const waNumber = '628161995186'

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      {/* Header Kategori */}
      <div className="flex items-center justify-between rounded-2xl border bg-white p-6 shadow-sm border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 capitalize">
            Kategori: {slug.replace(/-/g, ' ')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Menampilkan produk untuk kategori <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-slate-700">{slug}</code>
          </p>
        </div>

        {/* Tombol Tambah Produk (Khusus Admin) */}
        {isAdmin && (
          <Link
            href="/admin/products/new"
            className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
          >
            + Tambah Produk
          </Link>
        )}
      </div>

      {/* Grid Daftar Produk */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products && products.length > 0 ? (
          products.map((product) => {
            const waMessage = encodeURIComponent(
              `Halo AntoniHost, saya ingin memesan:\n\n*Produk:* ${product.name}\n*Harga:* Rp ${Number(product.price).toLocaleString('id-ID')}\n\nMohon info langkah selanjutnya. Terima kasih!`
            )
            const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`

            return (
              <div
                key={product.id}
                className="flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm border-slate-200 hover:shadow-md transition"
              >
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{product.name}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {product.description || 'Tidak ada deskripsi.'}
                  </p>
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">Harga</p>
                      <p className="text-xl font-extrabold text-emerald-700">
                        Rp {Number(product.price).toLocaleString('id-ID')}
                      </p>
                    </div>

                    {isAdmin && (
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                  </div>

                  {/* Tombol Beli Langsung via WA (Tanpa Registrasi) */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
                  >
                    Beli Sekarang
                  </a>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed bg-white p-12 text-center">
            <p className="text-gray-500 font-medium">Belum ada produk di kategori ini.</p>
          </div>
        )}
      </div>
    </main>
  )
}
