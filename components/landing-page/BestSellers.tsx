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
  const [cardWidth, setCardWidth] = useState(320) // Default width to prevent 0 width
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const animationFrameRef = useRef<number | null>(null)
  const isMountedRef = useRef(false)
  const currentXRef = useRef(0)

  const { data, isLoading, error } = useAllProducts()
  const products = data ? data.filter(product => product.best_seller) : []
  
  // Duplicate products for seamless infinite scroll
  const duplicatedProducts = [...products, ...products]

  useEffect(() => {
    // Calculate card width based on container
    const updateCardWidth = () => {
      if (!carouselRef.current) return
      const containerWidth = carouselRef.current.offsetWidth
      // Responsive card width: smaller on mobile, larger on desktop
      let newWidth = 320 // default
      if (containerWidth < 640) {
        newWidth = 220 // mobile
      } else if (containerWidth < 1024) {
        newWidth = 280 // tablet
      } else {
        newWidth = 320 // desktop
      }
      setCardWidth(newWidth)
    }
    
    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {
      updateCardWidth()
    }, 100)
    
    window.addEventListener("resize", updateCardWidth)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", updateCardWidth)
    }
  }, [products.length])

  // Mark component as mounted
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Continuous infinite scroll animation
  useEffect(() => {
    if (cardWidth <= 0 || products.length === 0) return
    
    // Wait to ensure component is fully mounted and DOM is ready
    const timer = setTimeout(() => {
      if (!isMountedRef.current) return
      
      const totalWidth = cardWidth * products.length
      const gap = 24 // gap-6 = 1.5rem = 24px
      const singleSetWidth = totalWidth + (gap * (products.length - 1))
      
      currentXRef.current = 0
      setCarX(0)
      
      // Initialize position safely
      try {
        controls.start({ x: 0, transition: { duration: 0 } })
      } catch (e) {
        // Controls not ready yet, will be set via animate prop
      }
      
      const animate = () => {
        if (!isMountedRef.current) return
        
        if (!isPaused) {
          currentXRef.current -= 0.5 // Move 0.5px per frame for smooth continuous movement
          // Reset position when we've scrolled one full set
          if (currentXRef.current <= -singleSetWidth) {
            currentXRef.current = 0
          }
          setCarX(currentXRef.current)
          
          // Safely update controls
          try {
            controls.start({ x: currentXRef.current, transition: { duration: 0 } })
          } catch (e) {
            // Controls not ready, skip this frame
          }
        }
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }, 300)
    
    return () => {
      clearTimeout(timer)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [cardWidth, products.length, controls, isPaused])

  function scrollByPixels(direction: 'left' | 'right') {
    const move = cardWidth + 24 // card width + gap
    let next = currentXRef.current
    if (direction === 'right') {
      next = currentXRef.current - move
    } else {
      next = currentXRef.current + move
    }
    currentXRef.current = next
    setCarX(next)
  }

  if (isLoading) return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <p className="text-center text-stone-300">Loading...</p>
      </div>
    </section>
  )
  
  if (error) return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <p className="text-center text-stone-300">Error fetching best sellers</p>
      </div>
    </section>
  )

  if (products.length === 0) return null

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

        <div ref={carouselRef} className="overflow-hidden relative w-full">
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
            className="flex pb-6"
            drag="x"
            dragElastic={0.1}
            whileTap={{ cursor: "grabbing" }}
            animate={{ x: carX }}
            initial={{ x: 0 }}
            transition={{ duration: 0 }}
            onDragEnd={(_: any, info: { offset: { x: number } }) => {
              const newX = currentXRef.current + info.offset.x
              currentXRef.current = newX
              setCarX(newX)
            }}
            style={{ willChange: 'transform' }}
          >
            {duplicatedProducts && duplicatedProducts.map((p: Product, i: number) => (
              <motion.div 
                key={`${p.id}-${i}`} 
                className="flex-shrink-0"
                style={{ 
                  width: `${cardWidth}px`,
                  marginRight: i < duplicatedProducts.length - 1 ? '24px' : '0'
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <Card className="bg-stone-900/30 border border-stone-700/50 hover:border-stone-600/80 transition-all duration-300 h-full flex flex-col w-full">
                  <CardContent className="p-4 flex flex-col flex-1 w-full">
                    <div className="w-full h-44 mb-4 bg-stone-800 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="text-stone-50 font-semibold text-center px-2">{p.name}</div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-stone-100 mb-2 line-clamp-2">{p.name}</h3>
                    <p className="text-stone-300 mb-3">${p.price.toFixed(2)}</p>
                    <div className="flex gap-2 mt-auto">
                      <Link 
                        href={`/product/${p.id}`} 
                        className="flex-1"
                        onClick={() => {
                          setIsPaused(true)
                          // Resume after navigation starts
                          setTimeout(() => setIsPaused(false), 100)
                        }}
                      >
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
                          setIsPaused(true)
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
          onClick={() => {
            setZoomImage(null)
            setIsPaused(false)
          }}
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
