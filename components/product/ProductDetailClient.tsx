'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
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
  ChevronLeft,
  ChevronRight,
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
import { sizesForColor } from '@/lib/product-variants'

const getColorValue = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    black: '#1a1a1a',
    white: '#ffffff',
    cream: '#fffdd0',
    beige: '#f5f5dc',
    camel: '#c4a574',
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

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [addedFlash, setAddedFlash] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [activeTab, setActiveTab] = useState<InfoTab>('details')
  const [lightbox, setLightbox] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const availableSizes = useMemo<VariantOption[]>(() => {
    const color = selectedColor || availableColors[0]?.name || ''
    return sizesForColor(product?.sizes, color).map((name) => ({
      name,
      inStock: true,
    }))
  }, [product?.sizes, selectedColor, availableColors])

  const images = useMemo(() => {
    if (!product?.images?.length) return ['/download.png']
    return product.images
  }, [product])

  const fallbackImage = '/download.png'

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      const first = availableColors.find((c) => c.inStock)
      if (first) setSelectedColor(first.name)
    }
  }, [availableColors, selectedColor])

  // When color changes, keep size only if still available for that color
  useEffect(() => {
    if (!availableSizes.length) {
      setSelectedSize('')
      return
    }
    if (!selectedSize || !availableSizes.some((s) => s.name === selectedSize)) {
      const first = availableSizes.find((s) => s.inStock)
      if (first) setSelectedSize(first.name)
    }
  }, [availableSizes, selectedSize])

  useEffect(() => {
    if (!images.length || !selectedColor) return
    const normalized = selectedColor.toLowerCase().replace(/\s+/g, '')

    // 1) Prefer images tagged with ?color= from admin
    let matchingIndex = images.findIndex((img) => {
      try {
        const url = new URL(img)
        const colorParam = url.searchParams.get('color')?.toLowerCase().replace(/\s+/g, '')
        if (colorParam && colorParam === normalized) return true
      } catch {
        /* ignore */
      }
      return img.toLowerCase().includes(`color=${normalized}`)
    })

    // 2) Fallback: same order as colors list (1st color → 1st image, etc.)
    if (matchingIndex < 0 && availableColors.length > 0) {
      const colorIdx = availableColors.findIndex(
        (c) => c.name.toLowerCase().replace(/\s+/g, '') === normalized
      )
      if (colorIdx >= 0 && colorIdx < images.length) matchingIndex = colorIdx
    }

    if (matchingIndex >= 0) setSelectedImage(matchingIndex)
  }, [images, selectedColor, availableColors])

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
    if (images.length < 2) return
    setSelectedImage((prev) => (prev + dir + images.length) % images.length)
  }

  const onGalleryTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const onGalleryTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || images.length < 2) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const dx = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 40) return
    scrollThumbs(dx < 0 ? 1 : -1)
  }

  return (
    <div className="max-w-full overflow-x-hidden bg-white pb-[calc(4.75rem+env(safe-area-inset-bottom))] text-neutral-900 lg:pb-0">
      {/* Breadcrumb — mobile header is nav-only (no utility strip) */}
      <div className="border-b border-neutral-100 px-4 pb-2 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <div className="mx-auto flex max-w-6xl items-center gap-2 font-nike text-xs text-neutral-500">
          <Link href="/" className="shrink-0 transition-colors hover:text-neutral-900">
            Home
          </Link>
          <span className="shrink-0">/</span>
          <Link href="/fear" className="shrink-0 transition-colors hover:text-neutral-900">
            Shop
          </Link>
          <span className="shrink-0">/</span>
          <span className="min-w-0 truncate text-neutral-900">{product.name}</span>
        </div>
      </div>

      {/* Primary product section */}
      <section className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto grid max-w-6xl items-start gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6">
          {/* Thumbnails — desktop left rail */}
          <div className="hidden min-w-0 lg:col-span-1 lg:flex lg:flex-col lg:items-center lg:gap-2">
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

          {/* Main image — natural portrait fit, no horizontal crop */}
          <div className="min-w-0 w-full max-w-full lg:col-span-6">
            <div
              className="relative flex w-full max-w-full items-center justify-center overflow-hidden bg-neutral-50 touch-pan-y lg:aspect-[5/6] lg:max-h-[560px]"
              onTouchStart={onGalleryTouchStart}
              onTouchEnd={onGalleryTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={mainSrc}
                  alt={`${product.name} — Fear Insight`}
                  className="relative z-0 mx-auto h-auto max-h-[min(68svh,560px)] w-full object-contain object-center lg:absolute lg:inset-0 lg:h-full lg:max-h-none lg:object-cover"
                  onError={() => setImageError(true)}
                  draggable={false}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => scrollThumbs(-1)}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-neutral-900 shadow-sm backdrop-blur-sm lg:hidden"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollThumbs(1)}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-neutral-900 shadow-sm backdrop-blur-sm lg:hidden"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 lg:hidden">
                    {images.map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        type="button"
                        aria-label={`Go to image ${index + 1}`}
                        onClick={() => setSelectedImage(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          selectedImage === index
                            ? 'w-4 bg-neutral-900'
                            : 'w-1.5 bg-neutral-900/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => setLightbox(true)}
                aria-label="Zoom image"
                className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile / tablet horizontal thumbs */}
            <div className="mt-2 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
              {images.map((image, index) => (
                <button
                  key={`m-thumb-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-12 w-12 shrink-0 overflow-hidden border sm:h-14 sm:w-14 ${
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
          <div className="flex min-w-0 w-full max-w-full flex-col lg:col-span-5 lg:sticky lg:top-32">
            {(product.featured || product.best_seller) && (
              <span className="mb-2 inline-flex w-fit items-center rounded-full bg-neutral-100 px-2.5 py-0.5 font-nike text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-neutral-700">
                {product.best_seller ? 'Bestseller' : 'New Arrival'}
              </span>
            )}

            <h1 className="mt-1 break-words text-xl font-black leading-tight tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            <div className="mt-1.5 flex items-center gap-2">
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

            <div className="mt-2 flex flex-wrap items-center gap-2.5">
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

            <p className="font-nike mt-2 line-clamp-3 max-w-md text-sm leading-relaxed text-neutral-600 sm:mt-3 sm:line-clamp-none">
              {shortDescription}
            </p>

            {/* Color */}
            {availableColors.length > 0 && (
              <div className="mt-4 sm:mt-5">
                <p className="font-nike text-sm text-neutral-800">
                  Color:{' '}
                  <span className="font-semibold capitalize">{selectedColor || '—'}</span>
                </p>
                <div className="mt-2 flex max-w-full flex-wrap gap-2.5">
                  {availableColors.map((color) => {
                    const active = selectedColor === color.name
                    const swatch = getColorValue(color.name)
                    const isLight =
                      ['#ffffff', '#fffdd0', '#f5f5dc', '#fffff0', '#fff', '#c4a574'].includes(
                        swatch.toLowerCase()
                      )
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        aria-label={color.name}
                        title={color.name}
                        className={`h-9 w-9 shrink-0 rounded-full border-2 transition-all sm:h-8 sm:w-8 ${
                          active
                            ? 'border-neutral-900 ring-2 ring-neutral-900/10 ring-offset-1'
                            : isLight
                              ? 'border-neutral-300 hover:border-neutral-500'
                              : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                        style={{ backgroundColor: swatch }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            {availableSizes.length > 0 && (
              <div className="mt-3 sm:mt-4">
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
                <div className="mt-2 flex max-w-full flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const active = selectedSize === size.name
                    return (
                      <button
                        key={size.name}
                        type="button"
                        onClick={() => setSelectedSize(size.name)}
                        className={`min-h-10 min-w-[2.75rem] px-3 py-2 font-nike text-sm font-semibold transition-colors sm:min-h-0 sm:min-w-[2.75rem] sm:px-2.5 sm:py-2 ${
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

            {/* CTA — always in the page flow so narrow desktop windows still see it */}
            <div className="mt-4 flex gap-2 sm:mt-5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!hasRequiredSelections || isOutOfStock || isAdding}
                className="font-nike inline-flex flex-1 items-center justify-center gap-2 bg-neutral-900 px-5 py-3.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-45 sm:py-3"
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
                className="flex h-12 w-12 shrink-0 items-center justify-center border border-neutral-200 text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 sm:h-11 sm:w-11"
              >
                <Heart className={`h-4 w-4 ${saved ? 'fill-neutral-900 text-neutral-900' : ''}`} />
              </button>
            </div>

            {/* Trust row */}
            <div className="mt-4 grid grid-cols-3 gap-1.5 border-t border-neutral-100 pt-4 sm:gap-2">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: RotateCcw, label: 'Easy Returns' },
                { icon: Shield, label: 'Secure Payment' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex min-w-0 flex-col items-center gap-1 text-center">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-500" strokeWidth={1.75} />
                  <span className="font-nike text-[0.55rem] uppercase leading-tight tracking-[0.06em] text-neutral-500 sm:text-[0.6rem] sm:tracking-[0.08em]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky buy bar — phones + tablets (hidden on desktop product layout) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-nike text-xs font-semibold text-neutral-900">
              {product.name}
            </p>
            <p className="font-nike text-sm font-semibold text-neutral-900">
              ${discountedPrice.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={saved}
            onClick={() => toggle(product.id)}
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-neutral-200 text-neutral-700"
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-neutral-900 text-neutral-900' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!hasRequiredSelections || isOutOfStock || isAdding}
            className="font-nike inline-flex h-11 min-w-[7.5rem] shrink-0 items-center justify-center gap-1.5 bg-neutral-900 px-4 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {isOutOfStock
              ? 'Sold out'
              : addedFlash
                ? 'Added'
                : isAdding
                  ? '…'
                  : !hasRequiredSelections
                    ? 'Select'
                    : 'Add'}
          </button>
        </div>
      </div>

      {/* Info tabs — compact, no stretched empty column */}
      <section className="border-t border-neutral-100 px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
        <div className="mx-auto max-w-6xl min-w-0">
          <div
            role="tablist"
            aria-label="Product information"
            className="flex max-w-full gap-5 overflow-x-auto overscroll-x-contain border-b border-neutral-200 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-7 [&::-webkit-scrollbar]:hidden"
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

            <div className="relative aspect-[4/3] max-h-48 w-full max-w-full overflow-hidden bg-neutral-100 sm:max-h-64 lg:max-h-72">
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
          <div className="mx-auto max-w-6xl min-w-0">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="font-nike-display min-w-0 text-xl uppercase tracking-[0.04em] text-neutral-900 sm:text-2xl">
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
                    className="group block min-w-0"
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
                        className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center bg-white/90 text-neutral-700 shadow-sm opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
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
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 sm:p-4"
          onClick={() => setLightbox(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainSrc}
            alt={product.name}
            className="max-h-[85vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <SizeChart isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </div>
  )
}
