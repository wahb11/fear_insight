"use client"

import React, { useState, useRef } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ShoppingBag, Star, Filter, Grid, List, Heart, Eye, ArrowRight, Mail, Instagram, Twitter, SlidersHorizontal, Search } from "lucide-react"
import Link from "next/link"

const products = [
	{
		id: 1,
		title: "DIVINE HOODIE",
		price: 89,
		originalPrice: 109,
		color: "#d2b48c",
		colorName: "Tan",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.9,
		reviews: 127,
		isNew: true,
		isBestseller: false,
		description: "Premium cotton blend hoodie with embroidered divine inspiration details",
		images: [
			"/placeholder.svg?height=400&width=400&text=Divine+Hoodie+Front",
			"/placeholder.svg?height=400&width=400&text=Divine+Hoodie+Back",
		],
	},
	{
		id: 2,
		title: "FAITH HOODIE",
		price: 95,
		originalPrice: null,
		color: "#36454f",
		colorName: "Charcoal",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.8,
		reviews: 89,
		isNew: false,
		isBestseller: true,
		description: "Bold faith statement piece with premium construction and comfort",
		images: [
			"/placeholder.svg?height=400&width=400&text=Faith+Hoodie+Front",
			"/placeholder.svg?height=400&width=400&text=Faith+Hoodie+Back",
		],
	},
	{
		id: 3,
		title: "BLESSED HOODIE",
		price: 92,
		originalPrice: null,
		color: "#ffd700",
		colorName: "Gold",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.9,
		reviews: 156,
		isNew: false,
		isBestseller: true,
		description: "Luxurious gold-toned hoodie celebrating divine blessings",
		images: [
			"/placeholder.svg?height=400&width=400&text=Blessed+Hoodie+Front",
			"/placeholder.svg?height=400&width=400&text=Blessed+Hoodie+Back",
		],
	},
	{
		id: 4,
		title: "GRACE HOODIE",
		price: 88,
		originalPrice: 98,
		color: "#f5f5dc",
		colorName: "Cream",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.7,
		reviews: 73,
		isNew: true,
		isBestseller: false,
		description: "Elegant cream hoodie embodying grace and spiritual elegance",
		images: [
			"/placeholder.svg?height=400&width=400&text=Grace+Hoodie+Front",
			"/placeholder.svg?height=400&width=400&text=Grace+Hoodie+Back",
		],
	},
	{
		id: 5,
		title: "SPIRIT HOODIE",
		price: 94,
		originalPrice: null,
		color: "#cd853f",
		colorName: "Bronze",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.8,
		reviews: 112,
		isNew: false,
		isBestseller: false,
		description: "Spiritual strength meets streetwear style in this bronze masterpiece",
		images: [
			"/placeholder.svg?height=400&width=400&text=Spirit+Hoodie+Front",
			"/placeholder.svg?height=400&width=400&text=Spirit+Hoodie+Back",
		],
	},
	{
		id: 6,
		title: "PRAYER HOODIE",
		price: 90,
		originalPrice: null,
		color: "#8b4513",
		colorName: "Brown",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.9,
		reviews: 98,
		isNew: false,
		isBestseller: false,
		description: "Meditative brown hoodie perfect for prayer and reflection",
		images: [
			"/placeholder.svg?height=400&width=400&text=Prayer+Hoodie+Front",
			"/placeholder.svg?height=400&width=400&text=Prayer+Hoodie+Back",
		],
	},
	{
		id: 7,
		title: "WORSHIP HOODIE",
		price: 96,
		originalPrice: null,
		color: "#2f4f4f",
		colorName: "Dark Slate",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.8,
		reviews: 84,
		isNew: true,
		isBestseller: false,
		description: "Deep slate hoodie designed for worship and contemplation",
		images: [
			"/placeholder.svg?height=400&width=400&text=Worship+Hoodie+Front",
			"/placeholder.svg?height=400&width=400&text=Worship+Hoodie+Back",
		],
	},
	{
		id: 8,
		title: "MIRACLE HOODIE",
		price: 99,
		originalPrice: 119,
		color: "#daa520",
		colorName: "Goldenrod",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.9,
		reviews: 145,
		isNew: false,
		isBestseller: true,
		description: "Limited edition hoodie celebrating life's miracles",
		images: [
			"/placeholder.svg?height=400&width=400&text=Miracle+Hoodie+Front",
			"/placeholder.svg?height=400&width=400&text=Miracle+Hoodie+Back",
		],
	},
]

const filters = {
	colors: ["All", "Tan", "Charcoal", "Gold", "Cream", "Bronze", "Brown", "Dark Slate", "Goldenrod"],
	sizes: ["All", "S", "M", "L", "XL", "XXL"],
	price: ["All", "Under $90", "$90-$95", "Over $95"],
	sort: ["Featured", "Price: Low to High", "Price: High to Low", "Newest", "Best Selling", "Highest Rated"],
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About", href: "/#about" },
  { name: "Contact", href: "/#contact" },
]

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
        ? "bg-green-500 text-stone-950 text-xs font-bold px-2 py-1 rounded-full"
        : "bg-yellow-400 text-stone-950 text-xs font-bold px-2 py-1 rounded-full"
    }
  >
    {children}
  </span>
)

export default function ProductsPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedColor, setSelectedColor] = useState("All")
  const [selectedSize, setSelectedSize] = useState("All")
  const [selectedPrice, setSelectedPrice] = useState("All")
  const [sortBy, setSortBy] = useState("Featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const filteredProducts = products.filter((product) => {
    if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (selectedColor !== "All" && product.colorName !== selectedColor) return false
    if (selectedSize !== "All" && !product.sizes.includes(selectedSize)) return false
    if (selectedPrice !== "All") {
      if (selectedPrice === "Under $90" && product.price >= 90) return false
      if (selectedPrice === "$90-$95" && (product.price < 90 || product.price > 95)) return false
      if (selectedPrice === "Over $95" && product.price <= 95) return false
    }
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "Price: Low to High":
        return a.price - b.price
      case "Price: High to Low":
        return b.price - a.price
      case "Newest":
        return a.isNew ? -1 : 1
      case "Best Selling":
        return a.isBestseller ? -1 : 1
      case "Highest Rated":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  return (
    <div ref={containerRef} className="bg-stone-950 text-stone-100 overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, type: "spring", stiffness: 100 }}
        className="fixed top-0 w-full z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent"
          >
            <Link href="/">FEAR INSIGHT</Link>
          </motion.div>

          <motion.div
            className="hidden md:flex space-x-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, staggerChildren: 0.1 }}
          >
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="hover:text-green-400 transition-colors relative group"
                >
                  {item.name}
                  <motion.div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-red-500 group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-red-600/10" />
        
        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-stone-100 via-green-300 to-green-400 bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            COLLECTION
          </motion.h1>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-green-600 to-red-600 mx-auto mb-6"
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
                className="pl-10 bg-stone-950/50 border-stone-700 text-stone-100 placeholder:text-stone-400 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Color Filter */}
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="bg-stone-950/70 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm focus:border-green-500 transition-colors"
              >
                {filters.colors.map((color) => (
                  <option key={color} value={color}>
                    {color === "All" ? "All Colors" : color}
                  </option>
                ))}
              </select>

              {/* Size Filter */}
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="bg-stone-950/70 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm focus:border-green-500 transition-colors"
              >
                {filters.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size === "All" ? "All Sizes" : size}
                  </option>
                ))}
              </select>

              {/* Price Filter */}
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="bg-stone-950/70 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm focus:border-green-500 transition-colors"
              >
                {filters.price.map((price) => (
                  <option key={price} value={price}>
                    {price === "All" ? "All Prices" : price}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-stone-950/70 border border-stone-700 text-stone-100 rounded px-3 py-2 text-sm focus:border-green-500 transition-colors"
              >
                {filters.sort.map((sort) => (
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
            Showing {sortedProducts.length} of {products.length} products
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 bg-stone-950">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product, index) => (
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
                <Card className="bg-stone-900/50 backdrop-blur-sm border-stone-700 overflow-hidden h-full hover:border-green-500/50 transition-all duration-300">
                  {/* Product Image */}
                  <div className="relative h-80 overflow-hidden">
                    <div
                      className="w-full h-full flex items-center justify-center rounded-t-lg relative"
                      style={{ backgroundColor: product.color }}
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
                        <div className="text-sm font-medium text-stone-100">Premium Hoodie</div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {product.isNew && <Pill color="green">NEW</Pill>}
                      {product.isBestseller && <Pill color="yellow">BESTSELLER</Pill>}
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-stone-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-green-500 text-stone-950 p-3 rounded-full hover:bg-green-400 transition-colors"
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
                      <h3 className="text-lg font-bold text-stone-100 group-hover:text-green-400 transition-colors">
                        {product.title}
                      </h3>
                    </div>
                    
                    <p className="text-stone-400 text-sm mb-4 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Color */}
                    <div className="flex items-center mb-3">
                      <span
                        className="w-4 h-4 rounded-full mr-2 border border-stone-600"
                        style={{ backgroundColor: product.color }}
                        title={product.colorName}
                      />
                      <span className="text-xs text-stone-300">{product.colorName}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center mb-3">
                      <span className="text-2xl font-bold text-green-500">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-stone-500 line-through ml-2">${product.originalPrice}</span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center space-x-1 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-red-500 text-red-500"
                                : "text-stone-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-stone-400">({product.reviews} reviews)</span>
                    </div>

                    {/* Sizes */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {product.sizes.map((size) => (
                        <span
                          key={size}
                          className="px-2 py-1 bg-stone-800 text-stone-200 rounded text-xs border border-stone-700 hover:border-green-500 transition-colors"
                        >
                          {size}
                        </span>
                      ))}
                    </div>

                    {/* Add to Cart Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-stone-50 group shadow-lg shadow-green-500/25">
                        Add to Cart
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-stone-950 border-t border-stone-800">
        <div className="container mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="col-span-1 md:col-span-2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-500 to-red-500 bg-clip-text text-transparent">
                FEAR INSIGHT
              </h3>
              <p className="text-stone-400 mb-4 max-w-md">
                DIRECTED BY GOD - Premium streetwear that speaks to your soul and inspires fearless faith.
              </p>
              <div className="mb-4">
                <p className="text-stone-300 mb-2">Get in touch:</p>
                <a
                  href="mailto:wahbusman@fearinsight.com"
                  className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  wahbusman@fearinsight.com
                </a>
              </div>
              <div className="flex space-x-4">
                {[Instagram, Twitter, Mail].map((Icon, index) => (
                  <motion.a
                    key={index}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    href="#"
                    className="text-stone-400 hover:text-green-400 transition-colors"
                  >
                    <Icon className="w-6 h-6" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {[
              {
                title: "Quick Links",
                items: [
                  { name: "Home", href: "/" },
                  { name: "Products", href: "/products" },
                  { name: "About", href: "/#about" },
                  { name: "Contact", href: "/#contact" },
                ],
              },
              {
                title: "Support",
                items: [
                  { name: "Size Guide", href: "/products" },
                  { name: "Shipping & Returns", href: "/shipping-returns" },
                  { name: "FAQ", href: "/faq" },
                  { name: "Contact Us", href: "/#contact" },
                ],
              },
            ].map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: sectionIndex * 0.2 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-semibold mb-4 text-stone-100">{section.title}</h4>
                <ul className="space-y-2 text-stone-400">
                  {section.items.map((item, itemIndex) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: sectionIndex * 0.2 + itemIndex * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.div whileHover={{ x: 5 }}>
                        <Link href={item.href} className="hover:text-green-400 transition-colors">
                          {item.name}
                        </Link>
                      </motion.div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="border-t border-stone-800 mt-8 pt-8 text-center text-stone-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p>&copy; {new Date().getFullYear()} FEAR INSIGHT. All rights reserved. DIRECTED BY GOD.</p>
            <p className="mt-2 text-sm">Contact us: wahbusman@fearinsight.com</p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
