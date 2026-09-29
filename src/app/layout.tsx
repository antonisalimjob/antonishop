import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import CartDrawer from '@/components/CartDrawer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AntoniHost Shop',
  description: 'Toko Online Hardware, Software, Akun Game, dan Jasa IT Support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Bungkus seluruh aplikasi dengan CartProvider */}
        <CartProvider>
          {children}
          
          {/* Komponen Keranjang Virtual Melayang di Pojok Kanan Bawah */}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
