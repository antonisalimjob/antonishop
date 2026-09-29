'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'

export default function CartDrawer() {
  const { cart, removeFromCart, totalPrice, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const waNumber = '628161995186'

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckoutAll = () => {
    if (cart.length === 0) return

    let text = 'Halo AntoniHost, saya ingin memesan produk berikut dari keranjang:\n\n'
    cart.forEach((item, index) => {
      text += `${index + 1}. *${item.name}* (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`
    })
    text += `\n*Total Belanja:* Rp ${totalPrice.toLocaleString('id-ID')}\n\nMohon diproses, terima kasih!`

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-white shadow-lg hover:bg-emerald-800 transition font-semibold text-sm"
      >
        🛒 Keranjang ({totalItems})
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 rounded-2xl border bg-white p-5 shadow-2xl border-slate-200">
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <h3 className="font-bold text-slate-800">Keranjang Virtual</h3>
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:underline"
            >
              Kosongkan
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-3 divide-y">
            {cart.map((item) => (
              <div key={item.id} className="pt-2 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-xs text-red-500 font-bold px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-bold text-slate-800 text-sm mb-3">
              <span>Total:</span>
              <span className="text-emerald-700">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={handleCheckoutAll}
              className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 transition"
            >
              Checkout Keranjang via WA
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
