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



// Animation variants for product cards
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.3,
      type: "spring" as const,
      stiffness: 80,
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


  if (isLoading) return <p>Loading...</p>
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
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-stone-100 via-stone-400 to-stone-600 bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            COLLECTION
          </motion.h1>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-stone-700 to-stone-900 mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          />
          <motion.p
            className="text-xl text-stone-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
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
            transition={{ duration: 0.6 }}
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
            transition={{ duration: 0.4, delay: 0.2 }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product: Product, index: number) => {
              const finalPrice = product.discount > 0 ? product.price - product.discount : product.price
              const firstImage = product.images?.[0] || ""
              
              // Extract colors and sizes using the helper function
              const colorList = extractValues(product.colors)
              const firstColor = colorList[0] || "gray"
              const availableSizes = extractValues(product.sizes)

              return (
                <motion.div
                  key={product.id}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  <Card
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="bg-stone-900/50 backdrop-blur-sm border-stone-700 overflow-hidden h-full hover:border-stone-400/50 transition-all duration-300 flex flex-col">
                    {/* Product Image */}
                    <div className="relative h-80 overflow-hidden">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center rounded-t-lg relative bg-stone-800"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-stone-950/20 to-transparent" />
                          <div className="text-stone-100 text-center z-10">
                            <div className="w-32 h-32 mx-auto mb-4 relative">
                              {/* Simple hoodie shape */}
                              <div className="absolute inset-0 bg-stone-100/90 rounded-t-full" />
                              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-stone-100/90 rounded-full" />
                              <div className="absolute top-8 left-2 w-8 h-16 bg-stone-100/90 rounded-full transform -rotate-12" />
                              <div className="absolute top-8 right-2 w-8 h-16 bg-stone-100/90 rounded-full transform rotate-12" />
                              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-stone-100/70 rounded" />
                            </div>
                            <div className="text-sm font-medium text-stone-100">Premium Product</div>
                          </div>
                        </div>
                      )}

                      {/* Single Badge - Priority: discount > bestseller > featured */}
                      <div className="absolute top-4 right-4">
                        {product.discount > 0 ? (
                          <Pill color="green">SALE</Pill>
                        ) : product.best_seller ? (
                          <Pill color="yellow">BESTSELLER</Pill>
                        ) : product.featured ? (
                          <Pill color="green">FEATURED</Pill>
                        ) : null}
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (colorList.length > 0 && availableSizes.length > 0) {
                              addToCart(product, 1, firstColor, availableSizes[0])
                            }
                          }}
                          className="bg-stone-100 text-stone-950 p-3 rounded-full hover:bg-stone-200 transition-colors"
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowSizeChart(true)
                          }}
                          className="bg-stone-100 text-stone-950 p-3 rounded-full hover:bg-stone-200 transition-colors"
                        >
                          <Ruler className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    <CardContent className="p-6 flex flex-col flex-grow">
                      {/* Product Info - grows to fill space */}
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold text-stone-100 group-hover:text-stone-300 transition-colors mb-3">
                          {product.name}
                        </h3>

                        {/* Colors - clean swatches only */}
                        {colorList.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-3">
                            {colorList.map((colorName, idx) => (
                              <span
                                key={`${colorName}-${idx}`}
                                className="w-5 h-5 rounded-full border-2 border-stone-600 hover:border-stone-400 transition-colors"
                                style={{ backgroundColor: getColorValue(colorName) }}
                                title={colorName}
                              />
                            ))}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center mb-3">
                          <span className="text-2xl font-bold text-stone-100">${finalPrice.toFixed(2)}</span>
                          {product.discount > 0 && (
                            <span className="text-stone-500 line-through ml-2">${product.price.toFixed(2)}</span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center mb-4">
                          <div className="flex items-center space-x-1 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(product.ratings)
                                  ? "fill-stone-400 text-stone-400"
                                  : "text-stone-600"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-stone-400">({product.ratings.toFixed(1)})</span>
                        </div>

                        {/* Sizes */}
                        {availableSizes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {availableSizes.map((size, idx) => (
                              <span
                                key={`${size}-${idx}`}
                                className="px-2 py-1 bg-stone-800 text-stone-200 rounded text-xs border border-stone-700"
                              >
                                {size.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add to Cart Button - always at bottom */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-auto">
                        <Button
                          className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50 group shadow-lg shadow-stone-900/25"
                        >
                          Add to Cart
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>


      <SizeChart isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </div>
  )
}
