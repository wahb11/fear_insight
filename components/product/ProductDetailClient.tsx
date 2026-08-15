'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Star,
  ShoppingBag,
  Ruler,
  Heart,
  Truck,
  RotateCcw,
  Shield,
  ChevronDown,
  ZoomIn,
  Shirt,
  Layers,
  Sparkles,
} from 'lucide-react'
import { SizeChart } from '@/components/ui/size-chart'
import { useCart } from '@/app/context/CartContext'
import { useWishlist } from '@/app/context/WishlistContext'
import { useAllProducts } from '@/hooks/useAllProducts'
import { Product } from '@/types/products'
import { isOnesizeProduct } from '@/lib/collections'

const getColorValue = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    black: '#1a1a1a',
    white: '#ffffff',
    cream: '#fffdd0',
    beige: '#f5f5dc',
    navy: '#1e3a5f',
    blue: '#2563eb',
    pink: '#ec4899',
    red: '#dc2626',
    green: '#16a34a',
    gray: '#6b7280',
    grey: '#6b7280',
    brown: '#78350f',
    tan: '#d2b48c',
    olive: '#556b2f',
    maroon: '#800000',
    burgundy: '#800020',
    charcoal: '#36454f',
    sand: '#c2b280',
    ivory: '#fffff0',
    khaki: '#c3b091',
    stone: '#928e85',
  }
  return colorMap[colorName.toLowerCase().trim()] || colorName.toLowerCase()
}

type VariantOption = { name: string; inStock: boolean }
type InfoTab = 'details' | 'materials' | 'fit' | 'shipping'

const TABS: { id: InfoTab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'materials', label: 'Materials' },
  { id: 'fit', label: 'Size & Fit' },
  { id: 'shipping', label: 'Shipping & Returns' },
]

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart()
  const { has, toggle } = useWishlist()
  const saved = has(product.id)
  const { data: allProducts } = useAllProducts()

  const availableColors = useMemo<VariantOption[]>(() => {
    if (!product?.colors?.length) return []
    return product.colors.flatMap((color: unknown) => {
      if (typeof color === 'string' && color.trim()) {
        return [{ name: color.trim(), inStock: true }]
      }
      if (typeof color === 'object' && color !== null) {
        return Object.keys(color)
          .filter((key) => key.trim().length > 0)
          .map((key) => ({ name: key.trim(), inStock: true }))
      }
      return []
    })
  }, [product])

  const availableSizes = useMemo<VariantOption[]>(() => {
    if (!product?.sizes?.length) return []
    return product.sizes.flatMap((size: unknown) => {
      if (typeof size === 'string' && size.trim()) {
        return [{ name: size.trim().toUpperCase(), inStock: true }]
      }
      if (typeof size === 'object' && size !== null) {
        return Object.keys(size)
          .filter((key) => key.trim().length > 0)
          .map((key) => ({ name: key.trim().toUpperCase(), inStock: true }))
      }
      return []
    })
  }, [product])

  const images = useMemo(() => {
    if (!product?.images?.length) return ['/download.png']
    return product.images
  }, [product])

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [addedFlash, setAddedFlash] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [activeTab, setActiveTab] = useState<InfoTab>('details')
  const [lightbox, setLightbox] = useState(false)

  const fallbackImage = '/download.png'

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      const first = availableColors.find((c) => c.inStock)
      if (first) setSelectedColor(first.name)
    }
  }, [availableColors, selectedColor])

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      const first = availableSizes.find((s) => s.inStock)
      if (first) setSelectedSize(first.name)
    }
  }, [availableSizes, selectedSize])

  useEffect(() => {
    if (!images.length || !selectedColor) return
    const normalized = selectedColor.toLowerCase().replace(/\s+/g, '')
    const matchingIndex = images.findIndex((img) => {
      try {
        const url = new URL(img)
        const colorParam = url.searchParams.get('color')?.toLowerCase().replace(/\s+/g, '')
        if (colorParam && colorParam === normalized) return true
      } catch {
        /* ignore */
      }
      return img.toLowerCase().includes(`color=${normalized}`)
    })
    if (matchingIndex >= 0) setSelectedImage(matchingIndex)
  }, [images, selectedColor])

  useEffect(() => {
    if (selectedImage >= images.length) setSelectedImage(0)
  }, [images.length, selectedImage])

  useEffect(() => {
    setImageError(false)
  }, [selectedImage, selectedColor])

  const relatedProducts = useMemo(() => {
    if (!allProducts?.length) return []
    return allProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 4)
  }, [allProducts, product.id])

  const isColorInStock = useCallback(() => {
    return availableColors.find((c) => c.name === selectedColor)?.inStock ?? false
  }, [availableColors, selectedColor])

  const isSizeInStock = useCallback(() => {
    return availableSizes.find((s) => s.name === selectedSize)?.inStock ?? false
  }, [availableSizes, selectedSize])

  const handleAddToCart = async () => {
    if (!product || !selectedSize || !selectedColor) return
    setIsAdding(true)
    try {
      addToCart(product, 1, selectedColor, selectedSize)
      setAddedFlash(true)
      setTimeout(() => {
        setIsAdding(false)
        setAddedFlash(false)
      }, 1200)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAdding(false)
    }
  }

  const discountedPrice = product.price * (1 - (product.discount || 0) / 100)
  const hasDiscount = (product.discount || 0) > 0
  const hasRequiredSelections =
    (availableColors.length === 0 || selectedColor) &&
    (availableSizes.length === 0 || selectedSize)
  const isOutOfStock = hasRequiredSelections
    ? (availableColors.length > 0 && !isColorInStock()) ||
      (availableSizes.length > 0 && !isSizeInStock())
    : false

  const shortDescription =
    product.description ||
    product.fullDescription?.slice(0, 160) ||
    'Premium Fear Insight piece — built for presence, cut with intention.'

  const mainSrc = imageError ? fallbackImage : images[selectedImage] || fallbackImage
  const detailImage = images[Math.min(1, images.length - 1)] || mainSrc
  const onesize = isOnesizeProduct(product)

  const scrollThumbs = (dir: 1 | -1) => {
    setSelectedImage((prev) => (prev + dir + images.length) % images.length)
  }

  return (
    <div className="bg-white text-neutral-900">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-100 px-4 pb-2 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-2 font-nike text-xs text-neutral-500">
          <Link href="/" className="transition-colors hover:text-neutral-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/fear" className="transition-colors hover:text-neutral-900">
            Shop
          </Link>
          <span>/</span>
          <span className="truncate text-neutral-900">{product.name}</span>
        </div>
      </div>

      {/* Primary product section */}
      <section className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto grid max-w-6xl items-start gap-5 lg:grid-cols-12 lg:gap-6">
          {/* Thumbnails — desktop left rail */}
          <div className="hidden lg:col-span-1 lg:flex lg:flex-col lg:items-center lg:gap-2">
            <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
              {images.map((image, index) => (
                <button
                  key={`thumb-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`h-14 w-14 shrink-0 overflow-hidden border transition-all ${
                    selectedImage === index
                      ? 'border-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
            {images.length > 4 && (
              <button
                type="button"
                onClick={() => scrollThumbs(1)}
                aria-label="Next images"
                className="mt-1 flex h-7 w-7 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Main image */}
          <div className="lg:col-span-6">
            <div className="relative aspect-square overflow-hidden bg-neutral-50 sm:aspect-[4/5] lg:aspect-[5/6] lg:max-h-[560px]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={mainSrc}
                  alt={`${product.name} — Fear Insight`}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => setImageError(true)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setLightbox(true)}
                aria-label="Zoom image"
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile / tablet horizontal thumbs */}
            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {images.map((image, index) => (
                <button
                  key={`m-thumb-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-14 w-14 shrink-0 overflow-hidden border ${
                    selectedImage === index ? 'border-neutral-900' : 'border-neutral-200'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Purchase panel */}
          <div className="flex flex-col lg:col-span-5 lg:sticky lg:top-32">
            {(product.featured || product.best_seller) && (
              <span className="mb-2 inline-flex w-fit items-center rounded-full bg-neutral-100 px-2.5 py-0.5 font-nike text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-neutral-700">
                {product.best_seller ? 'Bestseller' : 'New Arrival'}
              </span>
            )}

            <h1 className="text-3xl font-black leading-tight tracking-tight text-neutral-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(product.ratings || 0)
                        ? 'fill-neutral-900 text-neutral-900'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-nike text-sm text-neutral-600">
                {(product.ratings || 0).toFixed(1)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <span className="font-nike text-xl font-semibold text-neutral-900 sm:text-2xl">
                ${discountedPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="font-nike text-base text-neutral-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="rounded-full bg-neutral-900 px-2 py-0.5 font-nike text-[0.6rem] font-bold uppercase tracking-wider text-white">
                    {Math.round(product.discount)}% off
                  </span>
                </>
              )}
            </div>

            <p className="font-nike mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
              {shortDescription}
            </p>

            {/* Color */}
            {availableColors.length > 0 && (
              <div className="mt-5">
                <p className="font-nike text-sm text-neutral-800">
                  Color:{' '}
                  <span className="font-semibold capitalize">{selectedColor || '—'}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableColors.map((color) => {
                    const active = selectedColor === color.name
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        aria-label={color.name}
                        title={color.name}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          active
                            ? 'border-neutral-900 ring-2 ring-neutral-900/10 ring-offset-1'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                        style={{ backgroundColor: getColorValue(color.name) }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            {availableSizes.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-nike text-sm text-neutral-800">
                    Size:{' '}
                    <span className="font-semibold">{selectedSize || '—'}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSizeChart(true)}
                    className="font-nike inline-flex items-center gap-1.5 text-xs text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    Size Guide
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const active = selectedSize === size.name
                    return (
                      <button
                        key={size.name}
                        type="button"
                        onClick={() => setSelectedSize(size.name)}
                        className={`min-w-[2.75rem] px-2.5 py-2 font-nike text-sm font-semibold transition-colors ${
                          active
                            ? 'bg-neutral-900 text-white'
                            : 'border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400'
                        }`}
                      >
                        {size.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* CTA row */}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!hasRequiredSelections || isOutOfStock || isAdding}
                className="font-nike inline-flex flex-1 items-center justify-center gap-2 bg-neutral-900 px-5 py-3 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ShoppingBag className="h-4 w-4" />
                {isOutOfStock
                  ? 'Out of stock'
                  : addedFlash
                    ? 'Added'
                    : isAdding
                      ? 'Adding…'
                      : !hasRequiredSelections
                        ? 'Select options'
                        : 'Add to Cart'}
              </button>
              <button
                type="button"
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={saved}
                onClick={() => toggle(product.id)}
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-neutral-200 text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
              >
                <Heart className={`h-4 w-4 ${saved ? 'fill-neutral-900 text-neutral-900' : ''}`} />
              </button>
            </div>

            {/* Trust row */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-4">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: RotateCcw, label: 'Easy Returns' },
                { icon: Shield, label: 'Secure Payment' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="h-3.5 w-3.5 text-neutral-500" strokeWidth={1.75} />
                  <span className="font-nike text-[0.6rem] uppercase tracking-[0.08em] text-neutral-500">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info tabs — compact, no stretched empty column */}
      <section className="border-t border-neutral-100 px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div
            role="tablist"
            aria-label="Product information"
            className="flex gap-5 overflow-x-auto border-b border-neutral-200 sm:gap-7"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`font-nike shrink-0 pb-2.5 text-sm transition-colors ${
                    active
                      ? 'border-b-2 border-neutral-900 font-semibold text-neutral-900'
                      : 'border-b-2 border-transparent text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
            <div className="min-w-0">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <p className="font-nike text-sm leading-relaxed text-neutral-600">
                    {product.fullDescription ||
                      product.description ||
                      'Crafted for daily wear with Fear Insight’s signature weight and finish — a silhouette that holds its shape and carries the message.'}
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-1">
                    {[
                      {
                        icon: Shirt,
                        text: onesize ? 'Oversize / one-size fit' : 'Standard cut with room to move',
                      },
                      {
                        icon: Layers,
                        text: product.material || 'Soft heavyweight cotton blend',
                      },
                      {
                        icon: Sparkles,
                        text: 'Directed by God — Fear Insight essentials',
                      },
                    ].map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-neutral-100 text-neutral-700">
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </span>
                        <span className="font-nike text-sm text-neutral-700">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="space-y-3 font-nike text-sm leading-relaxed text-neutral-600">
                  <p>
                    <span className="font-semibold text-neutral-900">Material: </span>
                    {product.material || '80% premium cotton, 20% polyester'}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-900">Care: </span>
                    {product.care ||
                      'Machine wash cold with like colors. Tumble dry low. Turn inside out before washing.'}
                  </p>
                </div>
              )}

              {activeTab === 'fit' && (
                <div className="space-y-3 font-nike text-sm leading-relaxed text-neutral-600">
                  <p>
                    {onesize
                      ? 'This piece is offered in one size with an oversized drape. Check the size guide for approximate measurements.'
                      : 'True to size with a structured silhouette. Between sizes? Size up for a roomier feel.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSizeChart(true)}
                    className="inline-flex items-center gap-2 border border-neutral-900 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    Open size guide
                  </button>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-3 font-nike text-sm leading-relaxed text-neutral-600">
                  <p>
                    {product.shipping ||
                      'Free standard shipping on orders over $75. Most orders ship within 1–2 business days.'}
                  </p>
                  <Link
                    href="/shipping-returns"
                    className="inline-flex text-neutral-900 underline underline-offset-4 transition-opacity hover:opacity-60"
                  >
                    View shipping &amp; returns policy
                  </Link>
                </div>
              )}
            </div>

            <div className="relative aspect-[4/3] max-h-56 overflow-hidden bg-neutral-100 sm:max-h-64 lg:max-h-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detailImage}
                alt={`${product.name} detail`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* You may also like */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-neutral-100 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="font-nike-display text-xl uppercase tracking-[0.04em] text-neutral-900 sm:text-2xl">
                You May Also Like
              </h2>
              <Link
                href="/fear"
                className="font-nike shrink-0 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {relatedProducts.map((item) => {
                const price =
                  item.discount > 0
                    ? item.price * (1 - item.discount / 100)
                    : item.price
                const img = item.images?.[0] || fallbackImage
                return (
                  <Link
                    key={item.id}
                    href={`/product/${item.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <button
                        type="button"
                        aria-label={has(item.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggle(item.id)
                        }}
                        className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center bg-white/90 text-neutral-700 shadow-sm transition-opacity group-hover:opacity-100 opacity-0"
                      >
                        <Heart className={`h-3.5 w-3.5 ${has(item.id) ? 'fill-neutral-900 text-neutral-900' : ''}`} />
                      </button>
                    </div>
                    <div className="mt-3 space-y-0.5">
                      <p className="font-nike text-sm font-semibold text-neutral-900 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="font-nike text-sm text-neutral-500">
                        ${price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product image zoom"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainSrc}
            alt={product.name}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <SizeChart isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </div>
  )
}
