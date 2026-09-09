import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminPage({ searchParams }: Props) {
  const resolvedParams = await searchParams
  const tab = resolvedParams?.tab || 'overview'
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/shop/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/shop')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Panel admin</h1>

      {/* Navigasi Tab */}
      <div className="flex gap-2 mb-8">
        <Link
          href="/admin?tab=overview"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            tab === 'overview' ? 'bg-white border shadow-sm font-bold text-black' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Ringkasan
        </Link>
        <Link
          href="/admin?tab=products"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            tab === 'products' ? 'bg-white border shadow-sm font-bold text-black' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Produk
        </Link>
        <Link
          href="/admin?tab=orders"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            tab === 'orders' ? 'bg-white border shadow-sm font-bold text-black' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Pesanan
        </Link>
        <Link
          href="/admin?tab=chat"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            tab === 'chat' ? 'bg-white border shadow-sm font-bold text-black' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Live chat
        </Link>
      </div>

      {/* Tab Ringkasan */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">Menunggu Verifikasi</p>
            <p className="text-4xl font-bold mt-2">0</p>
          </div>
          <div className="border bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">Diproses</p>
            <p className="text-4xl font-bold mt-2">0</p>
          </div>
          <div className="border bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase">Pesan Chat</p>
            <p className="text-4xl font-bold mt-2">0</p>
          </div>
        </div>
      )}

      {/* Tab Kelola Produk */}
      {tab === 'products' && (
        <div className="border bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Kelola Produk</h2>
            <Link
              href="/admin/products/new"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Tambah Produk Baru
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="py-3 px-2">Nama Produk</th>
                  <th className="py-3 px-2">Kategori</th>
                  <th className="py-3 px-2">Harga</th>
                  <th className="py-3 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{item.name}</td>
                      <td className="py-3 px-2 text-sm text-gray-600">{item.category_slug}</td>
                      <td className="py-3 px-2 text-sm">Rp {item.price?.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <Link href={`/admin/products/edit/${item.id}`} className="text-xs text-blue-600 hover:underline">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-gray-500">
                      Belum ada produk. Klik &quot;+ Tambah Produk Baru&quot; untuk menambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
