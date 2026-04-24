"use client"

import React from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useAnimation } from "framer-motion"
import { useCart } from "@/app/context/CartContext"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, ArrowRight, Play, Sparkles, Crown, Shield, Target, CheckCircle, Palette, Scissors, Star } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import Collections from "@/components/landing-page/Collections"
import BestSellers from "@/components/landing-page/BestSellers"


export default function FearInsightLanding() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items, addToCart } = useCart()
  const cartButtonControls = useAnimation()
  const router = useRouter()
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
      <div ref={containerRef} className="bg-stone-950 text-stone-100 overflow-hidden">
        {/* Navigation */}

        {/* Hero Section with Video Background */}
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            {/* Fallback background */}
            <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-950 to-stone-800" />

            {/* Clothing/fashion video background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="w-full h-full object-cover absolute inset-0"
              style={{
                filter: "brightness(0.7) contrast(1.2) saturate(1.0)",
                transform: "scale(1.05)",
                zIndex: 1
              }}
              onLoadedData={(e) => {
                // Only play once loaded to avoid blocking
                e.currentTarget.play().catch(() => { })
              }}
              onError={(e) => {
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
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <motion.h1
                className="text-6xl md:text-8xl lg:text-9xl font-black mb-4 bg-gradient-to-r from-stone-100 via-stone-400 to-stone-600 bg-clip-text text-transparent"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
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
                transition={{ duration: 0.4, delay: 0.25 }}
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
                transition={{ duration: 0.4, delay: 0.35 }}
                style={{ willChange: "transform" }}
              >
                <div className="h-2 bg-gradient-to-r from-stone-700 via-stone-400 to-stone-900 mx-auto rounded-full" style={{ width: "96px" }} />
              </motion.div>

              <motion.p
                className="text-lg md:text-xl text-stone-300 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.45 }}
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
            </motion.div>
          </motion.div>

        </section>

        <Collections />



        {/* About Section */}
        <section
          id="about"
          className="py-20 px-4 bg-gradient-to-b from-stone-950 to-stone-900 relative overflow-hidden"
        >
          {/* Gradient background only - no image */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900/40 via-stone-950/50 to-stone-900/40" />

          <div className="container mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Text Content */}
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
                  transition={{ duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  OUR VISION
                </motion.h2>

                {[
                  {
                    text: "FEAR INSIGHT represents more than just clothing. We create pieces that embody spiritual strength, divine inspiration, and fearless self-expression. Each design is carefully crafted to remind you that you are guided by a higher purpose.",
                  },
                  {
                    text: "Our mission is to inspire confidence and faith through premium streetwear that speaks to your soul. We believe that fashion can be a powerful expression of one's spiritual journey and divine calling.",
                  },
                  {
                    text: "Founded on principles of faith, quality, and authenticity, Fear Insight continues to push boundaries while staying true to our core values. Every thread tells a story of purpose, every design speaks of hope.",
                  },
                ].map((para, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 + idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <p className="text-lg md:text-xl text-stone-200 mb-4 leading-relaxed bg-stone-950/25 p-4 rounded-lg text-left">
                      {para.text}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Right Column - Values Cards */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, type: "spring", stiffness: 50 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {[
                  {
                    title: "FAITH DRIVEN",
                    description: "Every piece is guided by spiritual values and divine purpose",
                    icon: Sparkles
                  },
                  {
                    title: "PREMIUM QUALITY",
                    description: "465gsm heavyweight fabric with meticulous attention to detail",
                    icon: Crown
                  },
                  {
                    title: "FEARLESS EXPRESSION",
                    description: "Wear your beliefs boldly and inspire those around you",
                    icon: Shield
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="p-6 bg-gradient-to-br from-stone-800/40 to-stone-900/40 border border-stone-700/50 rounded-xl backdrop-blur-md hover:border-stone-600/80 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-stone-700/30 rounded-lg">
                        <item.icon className="w-6 h-6 text-stone-200" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-stone-50 mb-2">{item.title}</h3>
                        <p className="text-stone-300 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Statistics Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="p-6 bg-gradient-to-br from-stone-700/30 to-stone-900/40 border border-stone-600/60 rounded-xl backdrop-blur-md mt-8"
                >
                  <p className="text-stone-100 text-center text-sm font-semibold mb-4">
                    Trusted by believers worldwide
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-stone-50">10K+</p>
                      <p className="text-xs text-stone-400">Community Members</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-50">100%</p>
                      <p className="text-xs text-stone-400">Quality Assured</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-50">∞</p>
                      <p className="text-xs text-stone-400">Divine Purpose</p>
                    </div>
                  </div>
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
                  icon: Target,
                },
                {
                  number: "02",
                  title: "Quality Testing",
                  description: "Each fabric undergoes rigorous testing for durability, comfort, and sustainability standards. We only approve materials that meet our exacting requirements.",
                  icon: CheckCircle,
                },
                {
                  number: "03",
                  title: "Design & Crafting",
                  description: "Our master craftsmen transform selected fabrics into unique pieces through meticulous design and careful construction, ensuring perfect fit and finish.",
                  icon: Palette,
                },
                {
                  number: "04",
                  title: "Stitching",
                  description: "Expert stitching with precision techniques ensures every seam is perfect. We use premium threads and meticulous attention to detail for durability and comfort.",
                  icon: Scissors,
                },
                {
                  number: "05",
                  title: "Final Inspection",
                  description: "Before delivery, every garment undergoes a comprehensive final inspection to guarantee it meets our premium standards and your expectations.",
                  icon: Star,
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (index % 5) * 0.08 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  className="group"
                >
                  <Card className="h-full bg-stone-900/80 border border-stone-800 shadow-lg shadow-black/25 hover:border-stone-500/60 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6 flex flex-col h-full relative">
                      {/* Step number background */}
                      <div className="absolute -top-8 -right-8 text-8xl font-bold text-stone-800/25 group-hover:text-stone-600/35 transition-colors duration-300">
                        {step.number}
                      </div>

                      {/* Icon */}
                      <motion.div
                        className="mb-4 relative z-10 p-3 bg-stone-800/60 border border-stone-700/60 rounded-lg w-fit shadow-inner shadow-black/30"
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.08 + 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <step.icon className="w-8 h-8 text-stone-100" />
                      </motion.div>

                      {/* Title */}
                      <motion.h3
                        className="text-xl font-bold mb-3 text-stone-100 relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.08 }}
                        viewport={{ once: true }}
                      >
                        {step.title}
                      </motion.h3>

                      {/* Description */}
                      <motion.p
                        className="text-stone-200 text-sm leading-relaxed relative z-10 flex-grow"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.08 + 0.12 }}
                        viewport={{ once: true }}
                      >
                        {step.description}
                      </motion.p>

                      {/* Connection line indicator */}
                      {index < 4 && (
                        <div className="hidden lg:block absolute -right-3 top-1/2 transform translate-x-full">
                          <motion.div
                            className="w-6 h-0.5 bg-gradient-to-r from-stone-600 to-stone-700"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.08 + 0.15 }}
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
              transition={{ duration: 0.4, delay: 0.2 }}
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
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="text-center p-6 bg-stone-900/60 border border-stone-800 rounded-lg hover:border-stone-600/80 transition-colors duration-300"
                >
                  <div className="text-3xl font-bold text-stone-100 mb-2">
                    {highlight.value}
                  </div>
                  <h4 className="text-sm font-semibold text-stone-200 mb-1">
                    {highlight.label}
                  </h4>
                  <p className="text-xs text-stone-400">
                    {highlight.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Our Best Sellers (carousel) - replaces the Newsletter block */}
        <BestSellers />

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
      </div>
    </>
  )
}
