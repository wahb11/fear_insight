"use client"

import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import Hero from "@/components/landing-page/Hero"
import CategoryCarousel from "@/components/landing-page/CategoryCarousel"
import BrandStatement from "@/components/landing-page/BrandStatement"
import JourneyBanner from "@/components/landing-page/JourneyBanner"
import FeaturedProducts from "@/components/landing-page/FeaturedProducts"
import ProductFeatureSection from "@/components/landing-page/ProductFeatureSection"
import LifestyleStorySection from "@/components/landing-page/LifestyleStorySection"
import SitemapSection from "@/components/landing-page/SitemapSection"


export default function FearInsightLanding() {
  const prefersReducedMotion = useReducedMotion()
  const sectionReveal = prefersReducedMotion
    ? {
        initial: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
        whileInView: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 36, scale: 0.985, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
        transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <>
      <div className="bg-white text-neutral-900">
        <Hero />

        {/* Category carousel — keeps #about for nav anchors */}
        <motion.div viewport={{ once: true, margin: "-12% 0px -8% 0px" }} {...sectionReveal}>
          <CategoryCarousel />
        </motion.div>

        {/* Brand statement pause + journey video banner */}
        <motion.div
          viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
          {...sectionReveal}
          transition={{ ...sectionReveal.transition, delay: prefersReducedMotion ? 0 : 0.06 }}
        >
          <BrandStatement />
        </motion.div>
        <motion.div
          viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
          {...sectionReveal}
          transition={{ ...sectionReveal.transition, delay: prefersReducedMotion ? 0 : 0.1 }}
        >
          <JourneyBanner />
        </motion.div>

        {/* Featured products showcase */}
        <motion.div
          viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
          {...sectionReveal}
          transition={{ ...sectionReveal.transition, delay: prefersReducedMotion ? 0 : 0.12 }}
        >
          <FeaturedProducts />
        </motion.div>

        {/* Soft product feature — Apple-inspired ghost watermark + floating shot */}
        <motion.div
          viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
          {...sectionReveal}
          transition={{ ...sectionReveal.transition, delay: prefersReducedMotion ? 0 : 0.08 }}
        >
          <ProductFeatureSection />
        </motion.div>

        {/* Lifestyle + craft alternating story blocks */}
        <motion.div
          viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
          {...sectionReveal}
          transition={{ ...sectionReveal.transition, delay: prefersReducedMotion ? 0 : 0.1 }}
        >
          <LifestyleStorySection />
        </motion.div>

        {/* Logo + collection columns; dark Footer follows via ConditionalLayout */}
        <motion.div
          viewport={{ once: true, margin: "-8% 0px -4% 0px" }}
          {...sectionReveal}
          transition={{ ...sectionReveal.transition, delay: prefersReducedMotion ? 0 : 0.08 }}
        >
          <SitemapSection />
        </motion.div>
      </div>
    </>
  )
}
