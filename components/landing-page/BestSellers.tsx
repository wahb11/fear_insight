"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, X, Eye, ShoppingBag, Star, Sparkles } from "lucide-react"

import { Product } from "@/types/products"
import { useAllProducts } from "@/hooks/useAllProducts"

export default function BestSellers() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [zoomProduct, setZoomProduct] = useState<Product | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [cardsToShow, setCardsToShow] = useState(2) // Start with 2 for mobile
  const [cardWidth, setCardWidth] = useState(0)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const gap = 16 // gap-4 = 16px

  const { data, isLoading, error } = useAllProducts()
  const products = data ? data.filter(product => product.best_seller) : []
  
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
    }, 4000)
    
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

  if (isLoading) return (
    <section className="py-20 px-4 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-amber-500" />
          </div>
        </div>
      </div>
    </section>
  )
  
  if (error) return (
    <section className="py-20 px-4 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
      <div className="container mx-auto">
        <p className="text-center text-stone-400">Error fetching best sellers</p>
      </div>
    </section>
  )

  if (products.length === 0) return null

  const maxIndex = Math.max(0, products.length - cardsToShow)
  const dotCount = maxIndex + 1
  const translateX = currentIndex * (cardWidth + gap)

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-stone-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-stone-500/20 px-4 py-2 rounded-full mb-4 border border-amber-500/20"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-amber-400">Customer Favorites</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-stone-100 via-amber-200 to-stone-400 bg-clip-text text-transparent">
            OUR BEST SELLERS
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto text-lg">
            Explore the pieces our community wears most — heavyweight hoodies built for comfort, durability, and style.
          </p>
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
                className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-stone-800 to-stone-900 p-2 sm:p-3 rounded-full border border-stone-700/50 shadow-xl shadow-black/30 hover:border-amber-500/50 transition-colors group"
          >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-stone-300 group-hover:text-amber-400 transition-colors" />
          </motion.button>
          <motion.button
                onClick={() => scrollTo('right')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-stone-800 to-stone-900 p-2 sm:p-3 rounded-full border border-stone-700/50 shadow-xl shadow-black/30 hover:border-amber-500/50 transition-colors group"
          >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-stone-300 group-hover:text-amber-400 transition-colors" />
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
              {products.map((p: Product, i: number) => (
              <motion.div 
                  key={p.id}
                className="flex-shrink-0"
                  style={{ 
                    width: cardWidth > 0 
                      ? `${cardWidth}px` 
                      : `calc((100% - ${(cardsToShow - 1) * gap}px) / ${cardsToShow})`,
                    minWidth: cardWidth > 0 ? `${cardWidth}px` : `calc((100% - ${(cardsToShow - 1) * gap}px) / ${cardsToShow})`
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  viewport={{ once: true }}
              >
                  <Card className="bg-gradient-to-b from-stone-900/90 to-stone-950/90 border border-stone-700/50 hover:border-amber-500/30 transition-all duration-500 h-full flex flex-col group overflow-hidden shadow-lg shadow-black/20">
                    <CardContent className="p-0 flex flex-col flex-1">
                      {/* Image Container */}
                      <div className="relative w-full aspect-[4/5] overflow-hidden">
                      {p.images[0] ? (
                        <img
                          src={p.images[0]}
                            alt={`${p.name} - Best Seller - Fear Insight Premium Streetwear`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                          <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-stone-600" />
                          </div>
                        )}
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                        
                        {/* Best Seller Badge */}
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          BEST SELLER
                        </div>
                        
                        {/* Quick View Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setZoomImage(p.images[0])
                            setZoomProduct(p)
                          }}
                          className="absolute bottom-3 right-3 bg-stone-900/90 backdrop-blur-sm text-stone-100 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 border border-stone-700/50 hover:border-amber-500/50 hover:scale-105"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">Quick View</span>
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-stone-100 mb-2 line-clamp-2 group-hover:text-amber-200 transition-colors">
                          {p.name}
                        </h3>
                        
                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < Math.floor(p.ratings || 4) ? 'text-amber-400 fill-amber-400' : 'text-stone-600'}`} 
                            />
                          ))}
                          <span className="text-stone-500 text-xs ml-1">({p.ratings || 4}.0)</span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-xl sm:text-2xl font-bold text-stone-100">${p.price.toFixed(2)}</span>
                          {p.discount > 0 && (
                            <span className="text-sm text-stone-500 line-through">${(p.price * (1 + p.discount / 100)).toFixed(2)}</span>
                      )}
                    </div>

                      <Link 
                        href={`/product/${p.id}`} 
                          className="mt-auto w-full"
                      >
                          <button
                            className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-amber-600 hover:to-amber-700 text-stone-100 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-stone-700/50 hover:border-amber-500/50"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Shop Now
                          </button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
                      ? 'bg-amber-500 w-8' 
                      : 'bg-stone-700 hover:bg-stone-600 w-2.5'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomImage && zoomProduct && (
        <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setZoomImage(null)
              setZoomProduct(null)
          }}
        >
          <motion.div
              className="relative max-w-4xl w-full mx-4 bg-stone-900 rounded-2xl overflow-hidden border border-stone-700/50 shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
                onClick={() => {
                  setZoomImage(null)
                  setZoomProduct(null)
                }}
                className="absolute top-4 right-4 bg-stone-800/90 hover:bg-stone-700 rounded-full p-2 transition-colors z-10 shadow-lg border border-stone-600/50"
            >
                <X className="w-5 h-5 text-stone-100" />
            </button>
              
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2">
            <img
              src={zoomImage}
                    alt={zoomProduct.name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full mb-4 w-fit">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium text-amber-400">Best Seller</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-stone-100 mb-3">{zoomProduct.name}</h3>
                  <p className="text-stone-400 mb-4 line-clamp-3">{zoomProduct.description || "Premium quality streetwear designed with purpose."}</p>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(zoomProduct.ratings || 4) ? 'text-amber-400 fill-amber-400' : 'text-stone-600'}`} />
                    ))}
                  </div>
                  <p className="text-3xl font-bold text-stone-100 mb-6">${zoomProduct.price.toFixed(2)}</p>
                  <Link href={`/product/${zoomProduct.id}`}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold py-3">
                      View Full Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </section>
  )
}
