"use client"

import React, { useEffect, useRef, useState } from "react"

import { motion } from "framer-motion"
import { CollectionsProductCard } from "./CollectionsProductCard"
import { useAllProducts } from "@/hooks/useAllProducts"

export default function Collections() {
  const { data, isLoading, error } = useAllProducts()
  const products = data ? data.filter(product => product.featured) : []

  const trackRef = useRef<HTMLDivElement | null>(null)
  const [autoDir, setAutoDir] = useState<"left" | "right">("right")

  useEffect(() => {
    if (!trackRef.current) return
    const el = trackRef.current
    const timer = setInterval(() => {
      if (!el) return
      const maxScroll = el.scrollWidth - el.clientWidth
      const step = Math.round(el.clientWidth * 0.5)
      let next = autoDir === "right" ? el.scrollLeft + step : el.scrollLeft - step
      if (next >= maxScroll - 8) {
        next = 0
      } else if (next <= 0) {
        next = maxScroll
      }
      el.scrollTo({ left: next, behavior: "smooth" })
    }, 2800)
    return () => clearInterval(timer)
  }, [autoDir])

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div className="text-center text-stone-300">Error loading products</div>
  }
  return (
    <section id="products" className="py-20 px-4 relative bg-stone-900">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-stone-100 to-stone-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            FEATURED COLLECTION
          </motion.h2>

          <motion.p
            className="text-base md:text-lg text-stone-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            viewport={{ once: true }}
          >
            Premium streetwear designed with purpose and crafted with precision. Each piece tells a story of faith,
            courage, and divine inspiration.
          </motion.p>
        </motion.div>

        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products && products.map((product, index) => (
            <div key={product.id} className="min-w-[260px] sm:min-w-[320px] lg:min-w-[360px] snap-start">
              <CollectionsProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
