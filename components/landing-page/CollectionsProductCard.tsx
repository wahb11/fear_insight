"use client"

import React, { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Star } from "lucide-react"
import { Product } from "@/types/products"

interface CollectionsProductCardProps {
  product: Product
  index: number
}

export function CollectionsProductCard({ product, index }: CollectionsProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-100px" })
  const color = Object.keys(product.colors[0] || {})[0] || "#fff"
  const imageUrl = product.images[0] || null

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 100 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        type: "spring",
        stiffness: 100,
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
            style={{ backgroundColor: color }}
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
            className="absolute top-4 right-4 bg-stone-900/70 backdrop-blur-sm rounded-full p-2"
            initial={{ scale: 0 }}
            animate={{ scale: isInView ? 1 : 0 }}
            transition={{ delay: index * 0.2 + 0.5 }}
          >
            <ShoppingBag className="w-5 h-5 text-stone-100" />
          </motion.div>
        </div>

        <CardContent className="p-6">
          <motion.h3
            className="text-xl font-bold mb-2 text-stone-100"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * 0.2 + 0.3 }}
          >
            {product.name}
          </motion.h3>
          <motion.p
            className="text-stone-400 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * 0.2 + 0.4 }}
          >
            {product.description || "Premium cotton blend with embroidered details"}
          </motion.p>
          <motion.div
            className="flex justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.2 + 0.5 }}
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
                  transition={{ delay: index * 0.2 + 0.6 + i * 0.1 }}
                >
                  <Star className="w-4 h-4 fill-stone-400 text-stone-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
