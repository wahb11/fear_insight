"use client"

import React, { useState, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Star, Ruler, ArrowRight, Search } from "lucide-react"
import { SizeChart } from "@/components/ui/size-chart"
import { useCart } from "@/app/context/CartContext"
import { useAllProducts } from "@/hooks/useAllProducts"
import { Product } from "@/types/products"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useNavigationLoader } from "@/components/NavigationLoader"



// Animation variants for product cards
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.02,
      duration: 0.2,
      type: "spring" as const,
      stiffness: 100,
    },
  }),
}

// Badge helper
const Pill = ({ children, color = "green" }: { children: React.ReactNode; color?: "green" | "yellow" }) => (
  <span
    className={
      color === "green"
        ? "bg-stone-100 text-stone-950 text-xs font-bold px-2 py-1 rounded-full"
        : "bg-stone-300 text-stone-950 text-xs font-bold px-2 py-1 rounded-full"
    }
  >
    {children}
  </span>
)

export default function ProductsPage() {

  const router = useRouter()
  const { data: products, isLoading, error } = useAllProducts()
  const containerRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()
  const { startLoading } = useNavigationLoader()

  const [selectedColor, setSelectedColor] = useState("All")
  const [selectedSize, setSelectedSize] = useState("All")
  const [selectedPrice, setSelectedPrice] = useState("All")
  const [sortBy, setSortBy] = useState("Featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSizeChart, setShowSizeChart] = useState(false)

  // Map color names to valid CSS colors
  const getColorValue = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'black': '#1a1a1a',
      'white': '#ffffff',
      'cream': '#fffdd0',
      'beige': '#f5f5dc',
      'navy': '#1e3a5f',
      'blue': '#2563eb',
      'pink': '#ec4899',
      'red': '#dc2626',
      'green': '#16a34a',
      'gray': '#6b7280',
      'grey': '#6b7280',
      'brown': '#78350f',
      'tan': '#d2b48c',
      'olive': '#556b2f',
      'maroon': '#800000',
      'burgundy': '#800020',
      'charcoal': '#36454f',
      'sand': '#c2b280',
      'ivory': '#fffff0',
      'khaki': '#c3b091',
      'stone': '#928e85',
    }
    const lowerName = colorName.toLowerCase().trim()
    return colorMap[lowerName] || colorName.toLowerCase()
  }

  // Helper to extract values from size/color data (handles both string arrays and object arrays)
  const extractValues = (items: any[] | undefined): string[] => {
    if (!items || !Array.isArray(items)) return []
    return items.flatMap((item) => {
      // If it's a string (like "S", "M", "L", "Black"), use it directly
      if (typeof item === 'string' && item.trim().length > 0) {
        return [item.trim()]
      }
      // If it's an object (like { "S": 5 }), extract the keys
      if (typeof item === 'object' && item !== null) {
        return Object.keys(item).filter(key => key.trim().length > 0)
      }
      return []
    })
  }

  // Generate dynamic filters from products
  const dynamicFilters = useMemo(() => {
    if (!products || !Array.isArray(products)) return { colors: ["All"], sizes: ["All"], priceRanges: ["All"] }

    const colorsSet = new Set<string>()
    const sizesSet = new Set<string>()
    let minPrice = Infinity
    let maxPrice = 0

    products.forEach((product: Product) => {
      // Extract colors from colors array (handles both string[] and object[])
      extractValues(product.colors).forEach((color) => colorsSet.add(color))

      // Extract sizes from sizes array (handles both string[] and object[])
      extractValues(product.sizes).forEach((size) => sizesSet.add(size.toUpperCase()))

      // Track price range
      const finalPrice = product.discount > 0 ? product.price - product.discount : product.price
      if (finalPrice < minPrice) minPrice = finalPrice
      if (finalPrice > maxPrice) maxPrice = finalPrice
    })

    // Generate price ranges dynamically
    const priceStep = Math.ceil((maxPrice - minPrice) / 3)
    const priceRanges = [
      "All",
      `Under $${minPrice + priceStep}`,
      `$${minPrice + priceStep}-$${minPrice + priceStep * 2}`,
      `Over $${minPrice + priceStep * 2}`,
    ]

    return {
      colors: ["All", ...Array.from(colorsSet).sort()],
      sizes: ["All", ...Array.from(sizesSet).sort()],
      priceRanges,
      minPrice,
      maxPrice,
      priceStep,
    }
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!products) return []

    return products.filter((product: Product) => {
      // Search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Color filter (handles string or object inputs)
      if (selectedColor !== "All") {
        const colors = extractValues(product.colors)
        const hasColor = colors.some((color) => color.toLowerCase() === selectedColor.toLowerCase())
        if (!hasColor) return false
      }

      // Size filter (handles string or object inputs)
      if (selectedSize !== "All") {
        const sizes = extractValues(product.sizes).map((s) => s.toUpperCase())
        const hasSize = sizes.includes(selectedSize.toUpperCase())
        if (!hasSize) return false
      }

      // Price filter
      if (selectedPrice !== "All") {
        const finalPrice = product.discount > 0 ? product.price - product.discount : product.price
        const priceStep = dynamicFilters.priceStep
        const minPrice = dynamicFilters.minPrice

        if (selectedPrice.startsWith("Under")) {
          const maxPriceInRange = (minPrice || 0) + (priceStep || 0)
          if (finalPrice >= maxPriceInRange) return false
        } else if (selectedPrice.includes("-")) {
          const [min, max] = selectedPrice.replace(/\$/g, "").split("-").map(Number)
          if (finalPrice < min || finalPrice > max) return false
        } else if (selectedPrice.startsWith("Over")) {
          const minPriceInRange = (minPrice || 0) + (priceStep || 0) * 2
          if (finalPrice <= minPriceInRange) return false
        }
      }

      return true
    })
  }, [products, searchTerm, selectedColor, selectedSize, selectedPrice, dynamicFilters])

  const sortedProducts = useMemo(() => {
    if (!filteredProducts) return []

    return [...filteredProducts].sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "Price: Low to High":
          const priceA = a.discount > 0 ? a.price - a.discount : a.price
          const priceB = b.discount > 0 ? b.price - b.discount : b.price
          return priceA - priceB
        case "Price: High to Low":
          const priceADesc = a.discount > 0 ? a.price - a.discount : a.price
          const priceBDesc = b.discount > 0 ? b.price - b.discount : b.price
          return priceBDesc - priceADesc
        case "Best Selling":
          return (b.best_seller ? 1 : 0) - (a.best_seller ? 1 : 0)
        case "Highest Rated":
          return b.ratings - a.ratings
        case "Featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        default:
          return 0
      }
    })
  }, [filteredProducts, sortBy])


  if (isLoading) return (
    <div className="bg-stone-950 text-stone-100 min-h-screen">
      {/* Hero Skeleton */}
      <section className="relative h-72 sm:h-96 flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900" />
        <div className="relative z-10 text-center px-4 w-full max-w-2xl mx-auto space-y-4">
          <div className="h-10 sm:h-14 w-3/4 mx-auto bg-stone-800 rounded animate-pulse" />
          <div className="h-1 w-16 sm:w-24 mx-auto bg-stone-800 rounded animate-pulse" />
          <div className="h-4 sm:h-5 w-full bg-stone-900 rounded animate-pulse" style={{ animationDelay: "100ms" }} />
          <div className="h-4 sm:h-5 w-2/3 mx-auto bg-stone-900 rounded animate-pulse" style={{ animationDelay: "200ms" }} />
        </div>
      </section>

      {/* Filter Bar Skeleton */}
      <section className="py-6 sm:py-8 px-4 bg-stone-900/50">
        <div className="container mx-auto space-y-4">
          <div className="h-9 sm:h-10 w-full bg-stone-800/60 rounded animate-pulse" />
          <div className="hidden md:grid md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 sm:h-10 bg-stone-800/40 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
          <div className="h-4 w-40 bg-stone-800/30 rounded animate-pulse" />
        </div>
      </section>

      {/* Product Grid Skeleton */}
      <section className="py-8 sm:py-12 px-4 bg-stone-950">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-stone-900/50 border border-stone-700 rounded-lg overflow-hidden">
                {/* Image placeholder */}
                <div className="relative aspect-square bg-stone-800/50 overflow-hidden">
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-800/30 to-stone-900" style={{ animationDelay: `${index * 80}ms` }} />
                </div>
                {/* Content placeholder */}
                <div className="p-2.5 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                  <div className="h-3.5 sm:h-4 w-3/4 bg-stone-800 rounded animate-pulse" style={{ animationDelay: `${index * 80 + 50}ms` }} />
                  <div className="flex items-center justify-between">
                    <div className="h-4 sm:h-5 w-16 bg-stone-800 rounded animate-pulse" style={{ animationDelay: `${index * 80 + 100}ms` }} />
                    <div className="h-3 w-10 bg-stone-800/50 rounded animate-pulse" style={{ animationDelay: `${index * 80 + 150}ms` }} />
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((c) => (
                      <div key={c} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-stone-800 animate-pulse" />
                    ))}
                  </div>
                  <div className="h-7 sm:h-8 w-full bg-stone-800 rounded animate-pulse" style={{ animationDelay: `${index * 80 + 200}ms` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
  if (error) return <p className="bg-stone-950 text-stone-100 min-h-screen flex items-center justify-center">Error fetching products</p>

  return (
    <div ref={containerRef} className="bg-stone-950 text-stone-100 overflow-hidden">


      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-700/10 to-stone-900/10" />

        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-stone-100 via-stone-400 to-stone-600 bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.02 }}
          >
            COLLECTION
          </motion.h1>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-stone-700 to-stone-900 mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.25, delay: 0.08 }}
          />
          <motion.p
            className="text-xl text-stone-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            Premium streetwear designed with purpose. Each piece tells a story of faith, courage, and divine inspiration.
          </motion.p>
        </motion.div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 px-4 bg-stone-900/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 items-stretch justify-between mb-6"
          >
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-stone-950/50 border-stone-700 text-stone-100 placeholder:text-stone-400 focus:border-stone-300 transition-colors"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="md:hidden w-full text-left text-sm text-stone-200 bg-stone-900/70 border border-stone-800 rounded px-3 py-2 flex items-center justify-between"
              >
                <span>Filters & Sort</span>
                <span className="text-xs text-stone-400">{showFilters ? "Hide" : "Show"}</span>
              </button>

              <div className={`grid gap-3 ${showFilters ? "grid-cols-1 sm:grid-cols-2" : "hidden md:grid md:grid-cols-4"}`}>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-stone-950/70 border border-stone-800 text-stone-100 rounded px-3 py-2 text-sm focus:border-stone-300 transition-colors"
                >
                  {dynamicFilters.colors.map((color) => (
                    <option key={color} value={color}>
                      {color === "All" ? "All Colors" : color}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-stone-950/70 border border-stone-800 text-stone-100 rounded px-3 py-2 text-sm focus:border-stone-300 transition-colors"
                >
                  {dynamicFilters.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size === "All" ? "All Sizes" : size}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full bg-stone-950/70 border border-stone-800 text-stone-100 rounded px-3 py-2 text-sm focus:border-stone-300 transition-colors"
                >
                  {dynamicFilters.priceRanges.map((price) => (
                    <option key={price} value={price}>
                      {price === "All" ? "All Prices" : price}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-stone-950/70 border border-stone-800 text-stone-100 rounded px-3 py-2 text-sm focus:border-stone-300 transition-colors"
                >
                  {["Featured", "Price: Low to High", "Price: High to Low", "Best Selling", "Highest Rated"].map((sort) => (
                    <option key={sort} value={sort}>
                      Sort by: {sort}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-stone-400 text-sm mb-6"
          >
            Showing {sortedProducts.length} of {products?.length || 0} products
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 bg-stone-950">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {sortedProducts.map((product: Product, index: number) => {
              const finalPrice = product.discount > 0 ? product.price - product.discount : product.price
              const firstImage = product.images?.[0] || ""
              
              // Extract colors and sizes using the helper function
              const colorList = extractValues(product.colors)
              const firstColor = colorList[0] || "gray"
              const availableSizes = extractValues(product.sizes)

              return (
                <Link href={`/product/${product.id}`} key={product.id} className="block" onClick={startLoading}>
                  <motion.div
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                    className="group cursor-pointer h-full"
                  >
                    <Card className="bg-stone-900/50 backdrop-blur-sm border-stone-700 overflow-hidden h-full hover:border-stone-400/50 transition-all duration-300 flex flex-col rounded-lg">
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={`${product.name} - Shop at Fear Insight`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-800">
                            <ShoppingBag className="w-12 h-12 text-stone-600" />
                          </div>
                        )}

                        {/* Badge - smaller on mobile */}
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
                          {product.discount > 0 ? (
                            <span className="bg-stone-100 text-stone-950 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">SALE</span>
                          ) : product.best_seller ? (
                            <span className="bg-stone-300 text-stone-950 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">BEST</span>
                          ) : product.featured ? (
                            <span className="bg-stone-100 text-stone-950 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">NEW</span>
                          ) : null}
                        </div>

                        {/* Hover Actions - Desktop only */}
                        <div className="hidden md:flex absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-4 pointer-events-none group-hover:pointer-events-auto z-30">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (colorList.length > 0 && availableSizes.length > 0) {
                                addToCart(product, 1, firstColor, availableSizes[0])
                              }
                            }}
                            className="bg-stone-100 text-stone-950 p-3 rounded-full hover:bg-stone-200 transition-colors pointer-events-auto"
                          >
                            <ShoppingBag className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowSizeChart(true)
                            }}
                            className="bg-stone-100 text-stone-950 p-3 rounded-full hover:bg-stone-200 transition-colors pointer-events-auto"
                          >
                            <Ruler className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Product Info - Compact */}
                      <CardContent className="p-2.5 sm:p-3 md:p-4 flex flex-col flex-grow">
                        {/* Product Name */}
                        <h3 className="text-xs sm:text-sm md:text-base font-semibold text-stone-100 group-hover:text-stone-300 transition-colors line-clamp-1 mb-1.5">
                          {product.name}
                        </h3>

                        {/* Price and Rating Row */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm sm:text-base md:text-lg font-bold text-stone-100">${finalPrice.toFixed(2)}</span>
                            {product.discount > 0 && (
                              <span className="text-stone-500 line-through text-[10px] sm:text-xs">${product.price.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 fill-stone-400 text-stone-400" />
                            <span className="text-[10px] sm:text-xs text-stone-400 ml-0.5">{product.ratings.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Colors - Compact row */}
                        {colorList.length > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            {colorList.slice(0, 3).map((colorName, idx) => (
                              <span
                                key={`${colorName}-${idx}`}
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-stone-600"
                                style={{ backgroundColor: getColorValue(colorName) }}
                                title={colorName}
                              />
                            ))}
                            {colorList.length > 3 && (
                              <span className="text-[10px] text-stone-500">+{colorList.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Sizes - Hidden on very small screens, shown on sm+ */}
                        <div className="hidden sm:flex flex-wrap gap-1 mb-2">
                          {availableSizes.slice(0, 4).map((size, idx) => (
                            <span
                              key={`${size}-${idx}`}
                              className="px-1.5 py-0.5 bg-stone-800 text-stone-300 rounded text-[10px] border border-stone-700"
                            >
                              {size.toUpperCase()}
                            </span>
                          ))}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (colorList.length > 0 && availableSizes.length > 0) {
                              addToCart(product, 1, firstColor, availableSizes[0])
                            }
                          }}
                          className="w-full mt-auto bg-stone-800 hover:bg-stone-700 text-stone-100 text-[11px] sm:text-xs py-1.5 sm:py-2 h-auto"
                        >
                          <ShoppingBag className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>


      <SizeChart isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </div>
  )
}
