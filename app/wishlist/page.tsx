'use client'

import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { useWishlist } from '@/app/context/WishlistContext'
import { useAuth } from '@/app/context/AuthContext'
import { useCart } from '@/app/context/CartContext'
import { useAllProducts } from '@/hooks/useAllProducts'

export default function WishlistPage() {
  const { ids, toggle, count } = useWishlist()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { data: products, isLoading } = useAllProducts()

  const saved = (products || []).filter((p) => ids.includes(p.id))

  return (
    <div className="min-h-screen bg-white text-neutral-900 pt-28 pb-16 px-4">
      <div className="container mx-auto">
        <h1 className="font-nike-display text-4xl uppercase tracking-[0.06em] md:text-5xl">
          Wishlist
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {count} saved {count === 1 ? 'piece' : 'pieces'}
          {!user && (
            <>
              {' · '}
              <Link href="/login" className="underline underline-offset-4 text-neutral-900">
                Sign in
              </Link>{' '}
              to keep them across devices
            </>
          )}
        </p>

        {isLoading ? (
          <p className="mt-12 text-neutral-500">Loading…</p>
        ) : saved.length === 0 ? (
          <div className="mt-16 text-center">
            <Heart className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-4 text-neutral-600">Nothing saved yet.</p>
            <Link
              href="/fear"
              className="mt-6 inline-block bg-neutral-900 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
            >
              Shop Fear
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {saved.map((product) => {
              const colors = Array.isArray(product.colors)
                ? product.colors.flatMap((c) => (typeof c === 'string' ? [c] : Object.keys(c)))
                : []
              const sizes = Array.isArray(product.sizes)
                ? product.sizes.flatMap((s) => (typeof s === 'string' ? [s] : Object.keys(s)))
                : []
              return (
                <div key={product.id} className="border border-neutral-200">
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="aspect-square bg-neutral-100">
                      {product.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
                      <p className="mt-1 text-sm text-neutral-600">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                  <div className="flex gap-2 border-t border-neutral-200 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (colors[0] && sizes[0]) addToCart(product, 1, colors[0], sizes[0])
                      }}
                      className="flex flex-1 items-center justify-center gap-1 bg-neutral-900 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => toggle(product.id)}
                      className="px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-600 hover:text-black"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
