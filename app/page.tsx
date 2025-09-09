"use client"

import React from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Instagram, Twitter, Mail, ShoppingBag, Star, ArrowRight, Play, Loader2 } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="w-full h-full bg-stone-800 rounded" />
    }

    return this.props.children
  }
}

// Loading Spinner Component
function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-green-500`} />
    </div>
  )
}

// Enhanced Loading Component with animations
function EnhancedLoading({ text = "Loading...", showSpinner = true }: { text?: string; showSpinner?: boolean }) {
  return (
    <motion.div
      className="w-full h-full bg-gradient-to-br from-stone-900/20 to-stone-900/40 rounded-lg flex flex-col items-center justify-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {showSpinner && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
        </motion.div>
      )}
      <motion.div
        className="text-stone-200/70 text-sm font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        {text}
      </motion.div>
    </motion.div>
  )
}

// Simple Product Card without 3D
function ProductCard({
  title,
  price,
  color,
  index,
}: {
  title: string
  price: string
  color: string
  index: number
}) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-100px" })

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
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.3 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <Card className="bg-stone-900/50 backdrop-blur-sm border-stone-700 overflow-hidden h-full">
        <div className="relative h-80">
          {/* Simple hoodie illustration */}
          <div
            className="w-full h-full flex items-center justify-center rounded-t-lg relative overflow-hidden"
            style={{ backgroundColor: color }}
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
            {title}
          </motion.h3>
          <motion.p
            className="text-stone-400 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * 0.2 + 0.4 }}
          >
            Premium cotton blend with embroidered details
          </motion.p>
          <motion.div
            className="flex justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.2 + 0.5 }}
          >
            <span className="text-2xl font-bold text-green-500">{price}</span>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: index * 0.2 + 0.6 + i * 0.1 }}
                >
                  <Star className="w-4 h-4 fill-red-500 text-red-500" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// 3D Canvas removed

// Simple animated counter that works with SSR
function AnimatedCounter({ end }: { end: number }) {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)
  const isInView = useInView(countRef, { once: true })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const increment = end / 100
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 20)
      return () => clearInterval(timer)
    }
  }, [isInView, end])

  return (
    <span
      ref={countRef}
      className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent"
    >
      {count}
    </span>
  )
}

// 3D Scene removed

// Page Loading Overlay
function PageLoadingOverlay({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-stone-950 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.div
          className="text-6xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-8"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          FEAR INSIGHT
        </motion.div>
        <motion.div
          className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.p
          className="text-stone-300/70"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          DIRECTED BY GOD
        </motion.p>
      </div>
    </motion.div>
  )
}

export default function FearInsightLanding() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  // Remove pageLoading state and timer
  // const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    // Remove simulated page loading
    // const pageTimer = setTimeout(() => setPageLoading(false), 2000)
    // return () => {
    //   clearTimeout(pageTimer)
    // }
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  const products = [
    { title: "DIVINE HOODIE", price: "$89", color: "#d2b48c" },
    { title: "FAITH HOODIE", price: "$95", color: "#36454f" },
    { title: "BLESSED HOODIE", price: "$92", color: "#ffd700" },
    { title: "GRACE HOODIE", price: "$88", color: "#f5f5dc" },
    { title: "SPIRIT HOODIE", price: "$94", color: "#cd853f" },
    { title: "PRAYER HOODIE", price: "$90", color: "#8b4513" },
  ]

  return (
    <>
      {/* Remove PageLoadingOverlay */}
      {/* <PageLoadingOverlay isLoading={pageLoading} /> */}

      <div ref={containerRef} className="bg-stone-950 text-stone-100 overflow-hidden">
        {/* Navigation */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, type: "spring", stiffness: 100, delay: 0 }}
          className="fixed top-0 w-full z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800"
        >
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent"
            >
              FEAR INSIGHT
            </motion.div>

            <motion.div
              className="hidden md:flex space-x-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, staggerChildren: 0.1 }}
            >
              {["Home", "Products", "About", "Contact"].map((item, index) => (
                <motion.a
                  key={item}
                  href={item === "Products" ? "/products" : `#${item.toLowerCase()}`}
                  className="hover:text-green-400 transition-colors relative group"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: (0.5) + index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <motion.div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-red-500 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.nav>

        {/* Hero Section with Video Background */}
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.4) contrast(1.2) sepia(0.3)" }}
            >
              <source
                src="https://videos.pexels.com/video-files/6195149/6195149-uhd_2560_1440_25fps.mp4"
                type="video/mp4"
              />
              <source
                src="https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4"
                type="video/mp4"
              />
            </video>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-900/50 to-stone-950/80 z-10" />
          </div>

          {/* Hero Text Content */}
          <motion.div style={isMounted ? { y: textY } : {}} className="relative z-30 text-center px-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, type: "spring", stiffness: 50, delay: 0 }}
            >
              <motion.h1
                className="text-6xl md:text-8xl lg:text-9xl font-black mb-4 bg-gradient-to-r from-stone-100 via-green-300 to-green-400 bg-clip-text text-transparent"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                style={{
                  textShadow: "0 0 40px rgba(16, 185, 129, 0.8), 0 4px 8px rgba(0, 0, 0, 0.9)",
                  filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.9))",
                }}
              >
                FEAR INSIGHT
              </motion.h1>

              <motion.div
                className="relative mb-6"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <div className="h-2 bg-gradient-to-r from-green-600 via-red-500 to-green-600 mx-auto rounded-full shadow-lg shadow-green-500/40" />
              </motion.div>

              <motion.p
                className="text-xl md:text-2xl lg:text-3xl font-light mb-8 text-stone-200"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                style={{
                  textShadow: "0 4px 8px rgba(0, 0, 0, 0.9)",
                  filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.9))",
                }}
              >
                DIRECTED BY GOD
              </motion.p>

              <motion.p
                className="text-lg md:text-xl text-stone-300 mb-8 max-w-2xl mx-auto"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                Welcome to Fear Insight - where faith meets fashion. Our premium streetwear collection embodies
                spiritual strength and divine inspiration, crafted for those who walk fearlessly in their purpose.
              </motion.p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-stone-50 text-lg px-8 py-3 group shadow-2xl shadow-green-500/30 backdrop-blur-sm border border-stone-100/10"
                  >
                    Explore Collection
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-stone-300/60 text-stone-100 hover:bg-stone-100/90 hover:text-stone-950 text-lg px-8 py-3 bg-stone-950/30 backdrop-blur-md group shadow-2xl border-2"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Story
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, -10, 0], opacity: 1 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-stone-100/90 z-30"
            initial={{ opacity: 0 }}
          >
            <div className="w-8 h-12 border-2 border-stone-300/70 rounded-full flex justify-center backdrop-blur-md bg-stone-950/20 shadow-lg">
              <motion.div
                className="w-2 h-4 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-full mt-2"
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
            <p className="text-xs mt-2 text-stone-300/70 font-light">Scroll Down</p>
          </motion.div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-20 px-4 relative bg-stone-900">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2
                className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-500 to-red-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                COLLECTION
              </motion.h2>

              <motion.div
                className="w-24 h-1 bg-gradient-to-r from-green-600 to-red-600 mx-auto mb-6"
                initial={{ width: 0 }}
                whileInView={{ width: 96 }}
                transition={{ duration: 1, delay: 0.5 }}
                viewport={{ once: true }}
              />

              <motion.p
                className="text-xl text-stone-400 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Premium streetwear designed with purpose and crafted with precision. Each piece tells a story of faith,
                courage, and divine inspiration.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <ProductCard
                  key={product.title}
                  title={product.title}
                  price={product.price}
                  color={product.color}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="py-20 px-4 bg-gradient-to-b from-stone-950 to-stone-900 relative overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-red-600/20 rounded-lg backdrop-blur-sm border border-stone-100/10 overflow-hidden">
            {/* Background Image */}
            <img
              src="/premium-streetwear-hoodie-brand-lifestyle-spiritua.png"
              alt="Fear Insight Brand Lifestyle"
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            />

            {/* Gradient Overlay for blending */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 via-stone-900/40 to-red-600/30 mix-blend-multiply" />

            {/* Additional texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-stone-900/40" />

            {/* 3D background removed; keeping visual overlays only */}
          </div>

          <div className="container mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, type: "spring", stiffness: 50 }}
                viewport={{ once: true }}
              >
                <motion.h2
                  className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-500 to-red-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  OUR VISION
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <p className="text-xl text-stone-200 mb-6 leading-relaxed backdrop-blur-sm bg-stone-950/20 p-4 rounded-lg">
                    FEAR INSIGHT represents more than just clothing. We create pieces that embody spiritual strength,
                    divine inspiration, and fearless self-expression. Each design is carefully crafted to remind you
                    that you are guided by a higher purpose.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <p className="text-lg text-stone-300 mb-6 backdrop-blur-sm bg-stone-950/20 p-4 rounded-lg">
                    Our mission is to inspire confidence and faith through premium streetwear that speaks to your soul.
                    We believe that fashion can be a powerful expression of one's spiritual journey and divine calling.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <p className="text-md text-stone-400 mb-8 backdrop-blur-sm bg-stone-950/20 p-4 rounded-lg">
                    Founded on principles of faith, quality, and authenticity, Fear Insight continues to push boundaries
                    while staying true to our core values. Every thread tells a story of purpose, every design speaks of
                    hope.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-stone-50 group shadow-lg shadow-green-500/25 backdrop-blur-sm"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-stone-900/50 to-red-900/40 relative overflow-hidden">
          <div className="container mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-4xl md:text-5xl font-bold mb-4 text-stone-100"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                STAY CONNECTED
              </motion.h2>

              <motion.p
                className="text-xl text-stone-300 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Be the first to know about new drops, exclusive releases, and spiritual insights. Join our community of
                faith-driven fashion enthusiasts.
              </motion.p>

              <motion.div
                className="max-w-md mx-auto flex gap-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-stone-950/50 border-stone-600 text-stone-100 placeholder:text-stone-400 focus:border-green-500 transition-colors"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-stone-50 whitespace-nowrap">
                    Join Us
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="py-12 px-4 bg-stone-950 border-t border-stone-800">
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
                  DIRECTED BY GOD - Premium streetwear that speaks to your soul and inspires fearless faith. Every piece
                  is designed to empower your spiritual journey and express your divine purpose.
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
                    { name: "Home", href: "#home" },
                    { name: "Products", href: "/products" },
                    { name: "About", href: "#about" },
                    { name: "Contact", href: "#contact" },
                  ],
                },
                {
                  title: "Support",
                  items: [
                    { name: "Size Guide", href: "/products" },
                    { name: "Shipping & Returns", href: "/shipping-returns" },
                    { name: "FAQ", href: "/faq" },
                    { name: "Contact Us", href: "#contact" },
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
                        <motion.a
                          href={item.href}
                          className="hover:text-green-400 transition-colors"
                          whileHover={{ x: 5 }}
                        >
                          {item.name}
                        </motion.a>
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

    </>
  )
}
