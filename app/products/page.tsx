"use client"

import React, { useState, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Star, Heart, ArrowRight, Search } from "lucide-react"
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
      delay: i * 0.15,
      duration: 0.6,
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

  // Generate dynamic filters from products
  const dynamicFilters = useMemo(() => {
    if (!products) return { colors: ["All"], sizes: ["All"], priceRanges: ["All"] }

    const colorsSet = new Set<string>()
    const sizesSet = new Set<string>()
    let minPrice = Infinity
    let maxPrice = 0

    products.forEach((product: Product) => {
      // Extract colors from colors array
      product.colors?.forEach((colorObj) => {
        Object.keys(colorObj).forEach((color) => colorsSet.add(color))
      })

      // Extract sizes from sizes array
      product.sizes?.forEach((sizeObj) => {
        Object.keys(sizeObj).forEach((size) => sizesSet.add(size.toUpperCase()))
      })

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

      // Color filter
      if (selectedColor !== "All") {
        const hasColor = product.colors?.some((colorObj) =>
          Object.keys(colorObj).some((color) => color.toLowerCase() === selectedColor.toLowerCase())
        )
        if (!hasColor) return false
      }

      // Size filter
      if (selectedSize !== "All") {
        const hasSize = product.sizes?.some((sizeObj) =>
          Object.keys(sizeObj).some((size) => size.toUpperCase() === selectedSize.toUpperCase())
        )
        if (!hasSize) return false
      }

      // Price filter
      if (selectedPrice !== "All") {
        const finalPrice = product.discount > 0 ? product.price - product.discount : product.price
        const priceStep = dynamicFilters.priceStep
        const minPrice = dynamicFilters.minPrice

        if (selectedPrice.startsWith("Under")) {
          const maxPriceInRange = (minPrice || 0)+ (priceStep || 0)
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
    if (error) return <p>Error fetching products</p>

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
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-stone-100 via-stone-400 to-stone-600 bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            COLLECTION
          </motion.h1>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-stone-700 to-stone-900 mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.8 }}
          />
          <motion.p
            className="text-xl text-stone-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
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
            className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
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
            <div className="flex flex-wrap gap-4 items-center">
              {/* Color Filter */}
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="bg-stone-950/70 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm focus:border-stone-300 transition-colors"
              >
                {dynamicFilters.colors.map((color) => (
                  <option key={color} value={color}>
                    {color === "All" ? "All Colors" : color}
                  </option>
                ))}
              </select>

              {/* Size Filter */}
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="bg-stone-950/70 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm focus:border-stone-300 transition-colors"
              >
                {dynamicFilters.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size === "All" ? "All Sizes" : size}
                  </option>
                ))}
              </select>

              {/* Price Filter */}
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="bg-stone-950/70 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm focus:border-stone-300 transition-colors"
              >
                {dynamicFilters.priceRanges.map((price) => (
                  <option key={price} value={price}>
                    {price === "All" ? "All Prices" : price}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-stone-950/70 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm focus:border-stone-300 transition-colors"
              >
                {["Featured", "Price: Low to High", "Price: High to Low", "Best Selling", "Highest Rated"].map((sort) => (
                  <option key={sort} value={sort}>
                    Sort by: {sort}
                  </option>
                ))}
              </select>
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
              const firstColor = product.colors?.[0] ? Object.keys(product.colors[0])[0] : "gray"
              const availableSizes = product.sizes?.flatMap((sizeObj) => Object.keys(sizeObj)) || []
              const firstImage = product.images?.[0] || ""

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
                  className="bg-stone-900/50 backdrop-blur-sm border-stone-700 overflow-hidden h-full hover:border-stone-400/50 transition-all duration-300">
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

                      {/* Badges */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {product.featured && <Pill color="green">FEATURED</Pill>}
                        {product.best_seller && <Pill color="yellow">BESTSELLER</Pill>}
                        {product.discount > 0 && (
                          <Pill color="green">-${product.discount}</Pill>
                        )}
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            addToCart(product, 1, firstColor, availableSizes[0] || "M")
                          }
                          className="bg-stone-100 text-stone-950 p-3 rounded-full hover:bg-stone-200 transition-colors"
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-stone-100 text-stone-950 p-3 rounded-full hover:bg-stone-200 transition-colors"
                        >
                          <Heart className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-stone-100 group-hover:text-stone-300 transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      {product.description && (
                        <p className="text-stone-400 text-sm mb-4 leading-relaxed line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Colors */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center mb-3 flex-wrap gap-2">
                          {product.colors.map((colorObj, idx) =>
                            Object.entries(colorObj).map(([colorName, stock]) => (
                              <div key={`${colorName}-${idx}`} className="flex items-center">
                                <span
                                  className="w-4 h-4 rounded-full mr-1 border border-stone-600"
                                  style={{ backgroundColor: colorName }}
                                  title={`${colorName} (${stock} in stock)`}
                                />
                                <span className="text-xs text-stone-400">{stock}</span>
                              </div>
                            ))
                          )}
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
                              className={`w-4 h-4 ${
                                i < Math.floor(product.ratings)
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
                        <div className="flex flex-wrap gap-2 mb-6">
                          {availableSizes.map((size, idx) => (
                            <span
                              key={`${size}-${idx}`}
                              className="px-2 py-1 bg-stone-800 text-stone-200 rounded text-xs border border-stone-700 hover:border-stone-400 transition-colors"
                            >
                              {size.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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

      
    </div>
  )
}
