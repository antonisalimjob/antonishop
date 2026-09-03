import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params

  if (!slug) {
    return notFound()
  }

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground capitalize">
          Kategori: {slug.replace(/-/g, ' ')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Menampilkan produk untuk kategori <code className="rounded bg-muted px-2 py-1">{slug}</code>
        </p>
      </div>
    </main>
  )
}
