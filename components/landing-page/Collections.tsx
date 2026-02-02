"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CollectionsProductCard } from "./CollectionsProductCard"
import { useAllProducts } from "@/hooks/useAllProducts"
import { ArrowLeft, ArrowRight, Sparkles, Flame } from "lucide-react"

export default function Collections() {
  const { data, isLoading, error } = useAllProducts()
  const products = data ? data.filter(product => product.featured) : []
  
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [cardsToShow, setCardsToShow] = useState(2) // Start with 2 for mobile
  const [cardWidth, setCardWidth] = useState(0)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const gap = 16 // gap-4 = 16px

  // Calculate cards to show and card width based on screen size
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth
      let cards = 4
      // Show 2 products on mobile (even small screens), 2 on tablet, 3 on desktop, 4 on large screens
      if (width < 640) {
        cards = 2  // Mobile: 2 products side by side
      } else if (width < 768) {
        cards = 2  // Small tablet: 2 products
      } else if (width < 1024) {
        cards = 3  // Tablet: 3 products
      } else {
        cards = 4  // Desktop: 4 products
      }
      setCardsToShow(cards)
      
      // Calculate card width based on container
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const totalGaps = (cards - 1) * gap
        const singleCardWidth = (containerWidth - totalGaps) / cards
        setCardWidth(singleCardWidth)
      }
    }
    
    // Initial calculation with delay to ensure DOM is ready
    const timer = setTimeout(updateLayout, 100)
    window.addEventListener("resize", updateLayout)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", updateLayout)
    }
  }, [products.length])

  // Auto-play carousel
  useEffect(() => {
    if (products.length === 0 || isPaused || products.length <= cardsToShow) return

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = products.length - cardsToShow
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 5000)
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [products.length, cardsToShow, isPaused])

  const scrollTo = useCallback((direction: 'left' | 'right') => {
    const maxIndex = products.length - cardsToShow
    setCurrentIndex((prev) => {
      if (direction === 'right') {
        return prev >= maxIndex ? 0 : prev + 1
      } else {
        return prev <= 0 ? maxIndex : prev - 1
      }
    })
  }, [products.length, cardsToShow])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-stone-900">
        <div className="container mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-stone-700 border-t-stone-400 rounded-full animate-spin" />
              <Flame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-stone-400" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 px-4 bg-stone-900">
        <div className="container mx-auto text-center text-stone-300">
          Error loading products
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  const maxIndex = Math.max(0, products.length - cardsToShow)
  const dotCount = maxIndex + 1
  const translateX = currentIndex * (cardWidth + gap)

  return (
    <section id="products" className="py-20 px-4 relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-stone-800/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-stone-700/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-stone-700/40 to-stone-800/40 px-4 py-2 rounded-full mb-4 border border-stone-600/30"
          >
            <Sparkles className="w-4 h-4 text-stone-400" />
            <span className="text-sm font-medium text-stone-300">Handpicked Selection</span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-stone-100 via-stone-300 to-stone-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            FEATURED COLLECTION
          </motion.h2>

          <motion.p
            className="text-base md:text-lg text-stone-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Premium streetwear designed with purpose and crafted with precision. Each piece tells a story of faith,
            courage, and divine inspiration.
          </motion.p>
        </motion.div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows */}
          {products.length > cardsToShow && (
            <>
              <motion.button
                onClick={() => scrollTo('left')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-stone-800 to-stone-900 p-2 sm:p-3 rounded-full border border-stone-700/50 shadow-xl shadow-black/30 hover:border-stone-500 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-stone-300 group-hover:text-stone-100 transition-colors" />
              </motion.button>
              <motion.button
                onClick={() => scrollTo('right')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-stone-800 to-stone-900 p-2 sm:p-3 rounded-full border border-stone-700/50 shadow-xl shadow-black/30 hover:border-stone-500 transition-colors group"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-stone-300 group-hover:text-stone-100 transition-colors" />
              </motion.button>
            </>
          )}

          {/* Cards Container */}
          <div ref={containerRef} className="overflow-hidden w-full">
          <motion.div
              className="flex"
              style={{ gap: `${gap}px` }}
              animate={{ x: -translateX }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
              {products.map((product, index) => (
              <div 
                  key={product.id} 
                className="flex-shrink-0 h-full"
                  style={{ 
                    width: cardWidth > 0 
                      ? `${cardWidth}px` 
                      : `calc((100% - ${(cardsToShow - 1) * gap}px) / ${cardsToShow})`,
                    minWidth: cardWidth > 0 ? `${cardWidth}px` : `calc((100% - ${(cardsToShow - 1) * gap}px) / ${cardsToShow})`
                  }}
              >
                <CollectionsProductCard 
                  product={product} 
                    index={index}
                />
              </div>
            ))}
          </motion.div>
        </div>

          {/* Pagination Dots */}
          {dotCount > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: dotCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === currentIndex 
                      ? 'bg-stone-400 w-8' 
                      : 'bg-stone-700 hover:bg-stone-600 w-2.5'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <Link href="/products">
            <button
              className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-700 hover:to-stone-800 text-stone-100 px-8 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 border border-stone-700/50 hover:border-stone-600"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
