'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    category_slug: 'komputer-aksesoris',
    price: '',
    description: '',
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.from('products').insert([
      {
        name: formData.name,
        category_slug: formData.category_slug,
        price: Number(formData.price),
        description: formData.description,
      },
    ])

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      router.push('/admin?tab=products')
      router.refresh()
    }
  }

  return (
    <main className="container mx-auto min-h-screen max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Tambah Produk Baru</h1>
        <Link
          href="/admin?tab=products"
          className="text-sm font-medium text-gray-600 hover:text-slate-800"
        >
          &larr; Kembali ke Panel Admin
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Nama Produk
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="Contoh: Jasa Support IT Networking"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Kategori
          </label>
          <select
            value={formData.category_slug}
            onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
            className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="komputer-aksesoris">Komputer & Aksesoris</option>
            <option value="akun-game">Akun Game</option>
            <option value="jasa-it-support">Jasa IT Support</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Harga (Rp)
          </label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="150000"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Deskripsi Produk
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="Detail rincian produk/layanan..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50"
        >
          {loading ? 'Sistem Menyimpan...' : 'Simpan Produk'}
        </button>
      </form>
    </main>
  )
}
