"use client"

import React from "react"
import Link from "next/link"
import { motion, useScroll, useTransform,  useAnimation } from "framer-motion"
import { useCart } from "@/app/context/CartContext"
import { Button } from "@/components/ui/button"

import { Card, CardContent } from "@/components/ui/card"
import { Instagram, Twitter, Mail, ShoppingBag,  ArrowRight, Play} from "lucide-react"
import { useRef, useState, useEffect } from "react"
import Collections from "@/components/landing-page/Collections"






// Simple Product Card without 3D





export default function FearInsightLanding() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items, addToCart } = useCart()
  const cartButtonControls = useAnimation()
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

  // Animate cart button when items are added
  useEffect(() => {
    if (items.length > 0) {
      cartButtonControls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.3, ease: "easeInOut" }
      })
    }
  }, [items.length, cartButtonControls])

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

  // Carousel refs and width calculation for Best Sellers
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const [carWidth, setCarWidth] = useState(0)

  useEffect(() => {
    function updateWidth() {
      if (!innerRef.current || !carouselRef.current) return
      const scrollWidth = innerRef.current.scrollWidth
      const offsetWidth = carouselRef.current.offsetWidth
      setCarWidth(Math.max(0, scrollWidth - offsetWidth))
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [products])

  // Carousel animation controls
  const controls = useAnimation()
  const [carX, setCarX] = useState(0)

  function scrollByPixels(direction: 'left' | 'right') {
    const containerW = carouselRef.current?.offsetWidth || 300
    const move = Math.round(containerW * 0.75)
    let next = carX
    if (direction === 'right') {
      // move carousel to the left (show next items)
      next = carX - move
    } else {
      // move carousel to the right (show previous items)
      next = carX + move
    }
    // clamp within allowed range
    next = Math.max(-carWidth, Math.min(0, next))
    setCarX(next)
    controls.start({ x: next, transition: { type: 'spring', stiffness: 200, damping: 30 } })
  }

  return (
    <>
      {/* Remove PageLoadingOverlay */}
      {/* <PageLoadingOverlay isLoading={pageLoading} /> */}

      <div ref={containerRef} className="bg-stone-950 text-stone-100 overflow-hidden">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="fixed top-0 w-full z-50 bg-stone-950/90 border-b border-stone-800 backdrop-blur-md"
          style={{ willChange: "opacity" }}
        >
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            {/* Hamburger Menu Button with Animation */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-stone-800 transition-colors duration-200 group"
            >
              <div className="w-6 h-5 flex flex-col justify-between items-center cursor-pointer">
                <motion.div
                  className="w-full h-0.5 bg-stone-100 rounded-full"
                  animate={{
                    rotate: isMenuOpen ? 45 : 0,
                    y: isMenuOpen ? 9 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="w-full h-0.5 bg-stone-100 rounded-full"
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                    x: isMenuOpen ? 10 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="w-full h-0.5 bg-stone-100 rounded-full"
                  animate={{
                    rotate: isMenuOpen ? -45 : 0,
                    y: isMenuOpen ? -9 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.button>

            {/* Logo Text in Center */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent"
            >
              FEAR INSIGHT
            </motion.div>

            {/* Cart Button */}
            <Link href="/cart">
              <motion.button
                animate={cartButtonControls}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-stone-800 transition-colors duration-200 relative"
              >
                <ShoppingBag className="w-6 h-6 text-stone-100" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isMenuOpen ? 1 : 0, height: isMenuOpen ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-stone-900/95 border-t border-stone-800"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {["Home", "Products", "About", "Contact"].map((item) => (
                <motion.a
                  key={item}
                  href={item === "Products" ? "/products" : `#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-stone-100 hover:text-stone-300 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-stone-800"
                  whileHover={{ x: 10 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.nav>

        {/* Hero Section with Video Background */}
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            {/* Fallback background */}
            <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-950 to-stone-800" />
            
            {/* Debug indicator - remove this later */}
            <div className="absolute top-4 left-4 z-50 bg-red-500 text-white px-2 py-1 text-xs rounded opacity-75">
              VIDEO SECTION
            </div>
            
            {/* Clothing/fashion video background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover absolute inset-0"
              style={{ 
                filter: "brightness(0.7) contrast(1.2) saturate(1.0)", // Even brighter for testing
                transform: "scale(1.05)",
                zIndex: 1 // Above background but below overlay
              }}
              onLoadStart={() => console.log('Video loading...')}
              onLoadedData={() => console.log('Video loaded successfully')}
              onError={(e) => {
                console.log('Video failed to load:', e)
                // Show fallback background
                e.currentTarget.style.display = 'none'
              }}
            >
              
              <source
                src="https://www.pexels.com/download/video/4622341/"
                type="video/mp4"
              />
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
              <source
                src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4"
                type="video/mp4"
              />
              {/* Fashion video as backup */}
              <source
                src="https://videos.pexels.com/video-files/6195149/6195149-hd_1920_1080_25fps.mp4"
                type="video/mp4"
              />
            </video>

            {/* Overlay for better text readability - reduced for testing */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-900/30 to-stone-950/50 z-10" />
          </div>

          {/* Hero Text Content */}
          <motion.div className="relative z-30 text-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.h1
                className="text-6xl md:text-8xl lg:text-9xl font-black mb-4 bg-gradient-to-r from-stone-100 via-stone-400 to-stone-600 bg-clip-text text-transparent"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{
                  textShadow: "0 4px 8px rgba(0, 0, 0, 0.9)",
                  willChange: "transform",
                }}
              >
                FEAR INSIGHT
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl lg:text-3xl font-light mb-6 text-stone-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                style={{
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
                  willChange: "opacity",
                }}
              >
                DIRECTED BY GOD
              </motion.p>

              <motion.div
                className="relative mb-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                style={{ willChange: "transform" }}
              >
                <div className="h-2 bg-gradient-to-r from-stone-700 via-stone-400 to-stone-900 mx-auto rounded-full" style={{ width: "96px" }} />
              </motion.div>

              <motion.p
                className="text-lg md:text-xl text-stone-300 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                style={{ willChange: "opacity" }}
              >
                Welcome to Fear Insight - where faith meets fashion. Our premium streetwear collection embodies
                spiritual strength and divine inspiration, crafted for those who walk fearlessly in their purpose.
              </motion.p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              style={{ willChange: "opacity" }}
            >
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50 text-lg px-8 py-3 group transition-all duration-300"
                  >
                    Explore Collection
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-stone-300/60 text-stone-100 hover:bg-stone-100/90 hover:text-stone-950 text-lg px-8 py-3 bg-stone-950/30 group border-2 transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-105 transition-transform duration-200" />
                  Watch Story
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

        </section>

            <Collections/>


        
        {/* About Section */}
        <section
          id="about"
          className="py-20 px-4 bg-gradient-to-b from-stone-950 to-stone-900 relative overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-700/20 to-stone-900/20 rounded-lg backdrop-blur-sm border border-stone-100/10 overflow-hidden">
            {/* Background Image */}
            <img
              src="/premium-streetwear-hoodie-brand-lifestyle-spiritua.png"
              alt="Fear Insight Brand Lifestyle"
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            />

            {/* Gradient Overlay for blending */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-700/30 via-stone-900/40 to-stone-900/30 mix-blend-multiply" />

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
                  className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-stone-100 to-stone-500 bg-clip-text text-transparent"
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
                    className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50 group shadow-lg shadow-stone-900/25 backdrop-blur-sm"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Process Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-stone-900 to-stone-950 relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-4xl md:text-6xl font-bold mb-4 text-center bg-gradient-to-r from-stone-100 to-stone-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                OUR PROCESS
              </motion.h2>
              <motion.p
                className="text-xl text-stone-300 text-center max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                How we select and craft the finest quality cloth for every piece
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  number: "01",
                  title: "Source Selection",
                  description: "We carefully source premium fabrics from certified suppliers worldwide, ensuring ethical production and superior quality in every material we choose.",
                  icon: "🎯",
                },
                {
                  number: "02",
                  title: "Quality Testing",
                  description: "Each fabric undergoes rigorous testing for durability, comfort, and sustainability standards. We only approve materials that meet our exacting requirements.",
                  icon: "✓",
                },
                {
                  number: "03",
                  title: "Design & Crafting",
                  description: "Our master craftsmen transform selected fabrics into unique pieces through meticulous design and careful construction, ensuring perfect fit and finish.",
                  icon: "✨",
                },
                {
                  number: "04",
                  title: "Stitching",
                  description: "Expert stitching with precision techniques ensures every seam is perfect. We use premium threads and meticulous attention to detail for durability and comfort.",
                  icon: "🧵",
                },
                {
                  number: "05",
                  title: "Final Inspection",
                  description: "Before delivery, every garment undergoes a comprehensive final inspection to guarantee it meets our premium standards and your expectations.",
                  icon: "⭐",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: (index % 5) * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  className="group"
                >
                  <Card className="h-full bg-gradient-to-br from-stone-800/40 to-stone-900/40 border border-stone-700/50 hover:border-stone-600/80 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6 flex flex-col h-full relative">
                      {/* Step number background */}
                      <div className="absolute -top-8 -right-8 text-8xl font-bold text-stone-700/20 group-hover:text-stone-600/30 transition-colors duration-300">
                        {step.number}
                      </div>

                      {/* Icon */}
                      <motion.div
                        className="text-5xl mb-4 relative z-10"
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.15 + 0.2 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {step.icon}
                      </motion.div>

                      {/* Title */}
                      <motion.h3
                        className="text-xl font-bold mb-3 text-stone-100 relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.15 + 0.1 }}
                        viewport={{ once: true }}
                      >
                        {step.title}
                      </motion.h3>

                      {/* Description */}
                      <motion.p
                        className="text-stone-300 text-sm leading-relaxed relative z-10 flex-grow"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.15 + 0.2 }}
                        viewport={{ once: true }}
                      >
                        {step.description}
                      </motion.p>

                      {/* Connection line indicator */}
                      {index < 4 && (
                        <div className="hidden lg:block absolute -right-3 top-1/2 transform translate-x-full">
                          <motion.div
                            className="w-6 h-0.5 bg-gradient-to-r from-stone-600 to-stone-800"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                            viewport={{ once: true }}
                            style={{ transformOrigin: "left center" }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Process Highlights */}
            <motion.div
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              {[
                {
                  label: "Premium Materials",
                  value: "100%",
                  description: "Ethical sourced fabrics",
                },
                {
                  label: "Quality Assurance",
                  value: "5",
                  description: "Point inspection process",
                },
                {
                  label: "Craftsmanship",
                  value: "∞",
                  description: "Dedication to perfection",
                },
              ].map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-stone-800/30 border border-stone-700/50 rounded-lg hover:bg-stone-800/50 transition-colors duration-300"
                >
                  <motion.div
                    className="text-3xl font-bold text-stone-100 mb-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    {highlight.value}
                  </motion.div>
                  <motion.h4 className="text-sm font-semibold text-stone-200 mb-1">
                    {highlight.label}
                  </motion.h4>
                  <motion.p className="text-xs text-stone-400">
                    {highlight.description}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Our Best Sellers (carousel) - replaces the Newsletter block */}
        <section className="py-16 px-4 relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-8 text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent">OUR BEST SELLERS</h2>
              <p className="text-stone-300 max-w-2xl mx-auto">Explore the pieces our community wears most — heavyweight hoodies built for comfort, durability, and style.</p>
            </motion.div>

            {/* Carousel container */}
            <div ref={carouselRef} className="overflow-hidden relative">
              {/* Left / Right arrows */}
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
                  // info.offset.x is the delta applied during the drag
                  const next = Math.max(-carWidth, Math.min(0, carX + info.offset.x))
                  setCarX(next)
                  controls.start({ x: next, transition: { type: 'spring', stiffness: 200, damping: 30 } })
                }}
              >
                {products.map((p, i) => (
                  <motion.div key={i} className="min-w-[220px] md:min-w-[280px] lg:min-w-[320px]">                    <Card className="bg-stone-900/30 border border-stone-700/50 hover:border-stone-600/80 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="w-full h-44 mb-4 bg-stone-800 rounded-md flex items-center justify-center" style={{ backgroundColor: p.color }}>
                          {/* Placeholder thumbnail */}
                          <div className="text-stone-50 font-semibold">{p.title}</div>
                        </div>
                        <h3 className="text-lg font-semibold text-stone-100">{p.title}</h3>
                        <p className="text-stone-300 mb-3">{p.price}</p>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() =>
                              addToCart({
                                id: `${p.title}-${i}`,
                                title: p.title,
                                price: parseInt(p.price.replace('$', '')),
                                quantity: 1,
                                color: p.color,
                              })
                            }
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50 px-3 py-1 rounded text-sm font-semibold transition-all"
                          >
                            Buy Now
                          </motion.button>
                          <Button size="sm" className="border border-stone-700 text-stone-100">Quick View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Hoodie Highlight / Story */}
        <section className="py-12 px-4 bg-stone-900/60 relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent">The Hoodie — 465gsm Heavyweight</h3>
              <p className="text-stone-300 mb-6">
                Our signature 465gsm heavyweight hoodie is built to last — dense, structured, and luxuriously soft. Every
                fiber is chosen for warmth, drape, and resilience so the garment keeps its shape and feels premium wash
                after wash. From the moment you unbox it, the experience is carefully crafted: premium tissue, branded
                stickers, a thank-you card, and protective wrapping that highlights the garment like the piece of art it is.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-stone-800/30 border border-stone-700/50 rounded-lg">
                  <h4 className="text-lg font-semibold text-stone-100">465gsm Fabric</h4>
                  <p className="text-xs text-stone-400">Heavyweight, durable, and premium hand feel.</p>
                </div>
                <div className="p-4 bg-stone-800/30 border border-stone-700/50 rounded-lg">
                  <h4 className="text-lg font-semibold text-stone-100">Premium Stitching</h4>
                  <p className="text-xs text-stone-400">Double-needle seams and reinforced stress points for longevity.</p>
                </div>
                <div className="p-4 bg-stone-800/30 border border-stone-700/50 rounded-lg">
                  <h4 className="text-lg font-semibold text-stone-100">Unboxing Experience</h4>
                  <p className="text-xs text-stone-400">Thoughtful packaging that makes every purchase feel like a gift.</p>
                </div>
              </div>

              <p className="text-stone-300">Our goal is simple: to create garments that make you feel confident, valued, and satisfied. Every choice — from fabric weight to packaging — aims to deliver joy when you open the box and pride every time you wear it.</p>
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
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-stone-100 to-stone-500 bg-clip-text text-transparent">
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
                    className="text-stone-100 hover:text-stone-300 transition-colors flex items-center gap-2"
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
                      className="text-stone-400 hover:text-stone-300 transition-colors"
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
                          className="hover:text-stone-300 transition-colors"
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
