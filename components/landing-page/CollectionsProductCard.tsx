"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Star } from "lucide-react"
import { Product } from "@/types/products"

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

interface CollectionsProductCardProps {
  product: Product
  index: number
}

export function CollectionsProductCard({ product, index }: CollectionsProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-100px" })
  // Handle both string array and object array formats for colors
  const firstColor = Array.isArray(product.colors) && product.colors[0]
    ? (typeof product.colors[0] === 'string' ? product.colors[0] : Object.keys(product.colors[0])[0])
    : 'gray'
  const colorValue = getColorValue(firstColor)
  const imageUrl = product.images[0] || null

  return (
    <>
      <Link href={`/product/${product.id}`}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 100 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.25,
          delay: index * 0.03,
          type: "spring",
          stiffness: 120,
        }}
        whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group cursor-pointer"
      >
      <Card className="bg-stone-900/50 backdrop-blur-sm border-stone-700 overflow-hidden h-full">
        <div className="relative h-80">
          <div
            className="w-full h-full flex items-center justify-center rounded-t-lg relative overflow-hidden"
            style={{ backgroundColor: colorValue }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-stone-950/20 to-transparent" />
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-t-lg z-10"
              />
            ) : (
              <div className="text-stone-100 text-center z-10">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-stone-100/90 rounded-t-full" />
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-stone-100/90 rounded-full" />
                  <div className="absolute top-8 left-2 w-8 h-16 bg-stone-100/90 rounded-full transform -rotate-12" />
                  <div className="absolute top-8 right-2 w-8 h-16 bg-stone-100/90 rounded-full transform rotate-12" />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-stone-100/70 rounded" />
                </div>
                <div className="text-sm font-medium text-stone-100">{product.name}</div>
              </div>
            )}
          </div>

          <motion.div
            className="absolute top-4 right-4 bg-stone-900/70 backdrop-blur-sm rounded-full p-2 pointer-events-none z-20"
            initial={{ scale: 0 }}
            animate={{ scale: isInView ? 1 : 0 }}
            transition={{ delay: index * 0.03 + 0.05 }}
          >
            <ShoppingBag className="w-5 h-5 text-stone-100" />
          </motion.div>
        </div>

        <CardContent className="p-6">
          <motion.h3
            className="text-xl font-bold mb-3 text-stone-100"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * 0.03 + 0.05 }}
          >
            {product.name}
          </motion.h3>
          <motion.div
            className="flex justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.03 + 0.07 }}
          >
            <span className="text-2xl font-bold text-stone-100">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: index * 0.03 + 0.08 + i * 0.02 }}
                >
                  <Star className={`w-4 h-4 ${i < Math.floor(product.ratings) ? "fill-stone-400 text-stone-400" : "text-stone-600"}`} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </CardContent>
      </Card>
      </motion.div>
    </Link>
    </>
  )
}
