"use client"

import React, { useEffect, useRef, useState } from "react"

import { motion, useAnimation } from "framer-motion"
import { CollectionsProductCard } from "./CollectionsProductCard"
import { useAllProducts } from "@/hooks/useAllProducts"

export default function Collections() {
  const { data, isLoading, error } = useAllProducts()
  const products = data ? data.filter(product => product.featured) : []
  
  // Duplicate products for seamless infinite scroll
  const duplicatedProducts = [...products, ...products]

  const trackRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const controls = useAnimation()
  const [carX, setCarX] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const animationFrameRef = useRef<number | null>(null)
  const isMountedRef = useRef(false)
  const currentXRef = useRef(0)

  // Mark component as mounted
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Calculate card width based on screen size
    const updateCardWidth = () => {
      if (window.innerWidth < 640) {
        setCardWidth(260) // mobile
      } else if (window.innerWidth < 1024) {
        setCardWidth(320) // tablet
      } else {
        setCardWidth(360) // desktop
      }
    }
    
    updateCardWidth()
    window.addEventListener("resize", updateCardWidth)
    return () => window.removeEventListener("resize", updateCardWidth)
  }, [])

  // Continuous infinite scroll animation
  useEffect(() => {
    if (!cardWidth || products.length === 0 || !isMountedRef.current) return
    
    const gap = 24 // gap-6 = 1.5rem = 24px
    const singleSetWidth = (cardWidth * products.length) + (gap * (products.length - 1))
    
    currentXRef.current = carX
    
    const animate = () => {
      if (!isMountedRef.current) return
      
      if (!isPaused) {
        currentXRef.current -= 0.5 // Move 0.5px per frame for smooth continuous movement
        // Reset position when we've scrolled one full set
        if (currentXRef.current <= -singleSetWidth) {
          currentXRef.current = 0
        }
        setCarX(currentXRef.current)
        controls.start({ x: currentXRef.current, transition: { duration: 0 } })
      }
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [cardWidth, products.length, controls, isPaused])

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
          transition={{ duration: 0.25 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-stone-100 to-stone-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            viewport={{ once: true }}
          >
            FEATURED COLLECTION
          </motion.h2>

          <motion.p
            className="text-base md:text-lg text-stone-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            viewport={{ once: true }}
          >
            Premium streetwear designed with purpose and crafted with precision. Each piece tells a story of faith,
            courage, and divine inspiration.
          </motion.p>
        </motion.div>

        <div
          ref={trackRef}
          className="overflow-hidden pb-4 relative"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <motion.div
            ref={innerRef}
            className="flex gap-6"
            animate={controls}
            initial={{ x: 0 }}
            style={{ willChange: 'transform' }}
          >
            {duplicatedProducts && duplicatedProducts.map((product, index) => (
              <div 
                key={`${product.id}-${index}`} 
                className="flex-shrink-0 h-full"
                style={{ width: `${cardWidth}px` }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onClick={() => {
                  // Keep paused during click for smooth navigation
                  setIsPaused(true)
                  setTimeout(() => setIsPaused(false), 200)
                }}
              >
                <CollectionsProductCard 
                  product={product} 
                  index={index % products.length}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
