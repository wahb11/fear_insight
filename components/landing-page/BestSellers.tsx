"use client"

import React, { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { motion, useAnimation } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, X } from "lucide-react"

import { Product } from "@/types/products"
import { useAllProducts } from "@/hooks/useAllProducts"

export default function BestSellers() {
  const controls = useAnimation()
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const [carX, setCarX] = useState(0)
  const [carWidth, setCarWidth] = useState(0)
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [autoDir, setAutoDir] = useState<'left' | 'right'>('right')

  useEffect(() => {
    if (innerRef.current && carouselRef.current) {
      setCarWidth(innerRef.current.scrollWidth - carouselRef.current.offsetWidth)
    }
  }, [innerRef.current, carouselRef.current])

  // Auto scroll carousel
  useEffect(() => {
    if (!carWidth || carWidth <= 0) return
    const id = setInterval(() => {
      const containerW = carouselRef.current?.offsetWidth || 300
      const move = Math.round(containerW * 0.75)
      let next = autoDir === 'right' ? carX - move : carX + move
      // loop instead of bounce
      if (next <= -carWidth) {
        next = 0
      } else if (next >= 0) {
        next = -carWidth
      }
      setCarX(next)
      controls.start({ x: next, transition: { type: 'spring', stiffness: 120, damping: 25 } })
    }, 3200)
    return () => clearInterval(id)
  }, [carX, carWidth, controls, autoDir])

  function scrollByPixels(direction: 'left' | 'right') {
    const containerW = carouselRef.current?.offsetWidth || 300
    const move = Math.round(containerW * 0.75)
    let next = carX
    if (direction === 'right') {
      next = carX - move
    } else {
      next = carX + move
    }
    next = Math.max(-carWidth, Math.min(0, next))
    setCarX(next)
    controls.start({ x: next, transition: { type: 'spring', stiffness: 200, damping: 30 } })
  }

  const { data, isLoading, error } = useAllProducts()
  const products = data ? data.filter(product => product.best_seller) : []  

  if (isLoading) return <p>Loading...</p>
  if (error) return <p className="text-center text-stone-300">Error fetching best sellers</p>

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent">
            OUR BEST SELLERS
          </h2>
          <p className="text-stone-300 max-w-2xl mx-auto">
            Explore the pieces our community wears most — heavyweight hoodies built for comfort, durability, and style.
          </p>
        </motion.div>

        <div ref={carouselRef} className="overflow-hidden relative">
          <motion.button
            onClick={() => scrollByPixels('left')}
            whileHover={{ scale: 1.05 }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 bg-stone-900/60 p-2 rounded-full border border-stone-700/50"
          >
            <ArrowRight className="w-5 h-5 text-stone-100 rotate-180" />
          </motion.button>
          <motion.button
            onClick={() => scrollByPixels('right')}
            whileHover={{ scale: 1.05 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 bg-stone-900/60 p-2 rounded-full border border-stone-700/50"
          >
            <ArrowRight className="w-5 h-5 text-stone-100" />
          </motion.button>

          <motion.div
            ref={innerRef}
            className="flex gap-6 pb-6"
            drag="x"
            dragConstraints={{ right: 0, left: -carWidth }}
            whileTap={{ cursor: "grabbing" }}
            animate={controls}
            initial={{ x: 0 }}
            onDragEnd={(_: any, info: { offset: { x: number } }) => {
              const next = Math.max(-carWidth, Math.min(0, carX + info.offset.x))
              setCarX(next)
              controls.start({ x: next, transition: { type: 'spring', stiffness: 200, damping: 30 } })
            }}
          >
            {products && products.map((p: Product, i: number) => (
              <motion.div key={i} className="min-w-[220px] md:min-w-[280px] lg:min-w-[320px]">
                <Card className="bg-stone-900/30 border border-stone-700/50 hover:border-stone-600/80 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="w-full h-44 mb-4 bg-stone-800 rounded-md flex items-center justify-center">
                      {p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="text-stone-50 font-semibold">{p.name}</div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-stone-100">{p.name}</h3>
                    <p className="text-stone-300 mb-3">${p.price.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <Link href={`/product/${p.id}`} className="flex-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50 px-3 py-1 rounded text-sm font-semibold transition-all"
                        >
                          Buy Now
                        </motion.button>
                      </Link>
                      <Button 
                        size="sm" 
                        className="border border-stone-700 text-stone-100"
                        onClick={(e) => {
                          e.preventDefault()
                          setZoomImage(p.images[0])
                        }}
                      >
                        Quick View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <motion.div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setZoomImage(null)}
        >
          <motion.div
            className="relative max-w-lg w-full mx-4"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-12 -right-0 md:-right-4 bg-stone-900/90 hover:bg-stone-800 rounded-full p-2 transition-colors z-10 shadow-lg"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-stone-100" />
            </button>
            <img
              src={zoomImage}
              alt="Zoomed product"
              className="w-full h-auto rounded-lg max-h-[80vh] object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
