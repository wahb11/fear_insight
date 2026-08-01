'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Play, X } from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Full-width video banner with bottom-left overlay CTAs (Nike-style).
 * Video: /videos/journey-banner.mp4 (falls back to /hero.mp4 until that file exists).
 * Explore → /products · Watch → opens inline video modal.
 */
export default function JourneyBanner() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [watchOpen, setWatchOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!watchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWatchOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [watchOpen])

  useGSAP(
    () => {
      const section = sectionRef.current
      const videoWrap = videoWrapRef.current
      const headline = headlineRef.current
      const tagline = taglineRef.current
      const actions = actionsRef.current
      if (!section || !headline || !tagline || !actions) return

      const overlayItems = [headline, tagline, actions]

      gsap.from(overlayItems, {
        opacity: 0,
        y: reducedMotion ? 0 : 28,
        duration: reducedMotion ? 0.35 : 0.55,
        stagger: reducedMotion ? 0.06 : 0.1,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      })

      if (!reducedMotion && videoWrap) {
        gsap.to(videoWrap, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  )

  return (
    <>
      <section
        ref={sectionRef}
        id="journey"
        aria-labelledby="journey-headline"
        className="relative overflow-hidden bg-stone-950"
        style={{ height: 'clamp(22rem, 70vh, 42rem)' }}
      >
        {/* Video layer — slight overscan so parallax doesn't show edges */}
        <div
          ref={videoWrapRef}
          className="absolute inset-x-0 -top-[8%] h-[116%] w-full will-change-transform"
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-800" />
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'brightness(0.72) contrast(1.1)' }}
            onLoadedData={(e) => {
              e.currentTarget.play().catch(() => {})
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          >
            {/* PLACEHOLDER: swap to /videos/journey-banner.mp4 when that asset is added */}
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Scrim for contrast — heavier at bottom-left where copy sits */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.15) 100%),
              linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 55%)
            `,
          }}
        />

        {/* Bottom-left overlay */}
        <div className="relative z-20 flex h-full flex-col justify-end px-5 pb-8 pt-16 sm:px-8 sm:pb-10 md:px-12 md:pb-12 lg:px-16">
          <div className="max-w-xl">
            <h2
              id="journey-headline"
              ref={headlineRef}
              className="font-nike-display text-4xl uppercase leading-none tracking-[0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              See Our Journey
            </h2>
            <p
              ref={taglineRef}
              className="font-nike mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base md:mt-4"
            >
              Faith, purpose, and fearless expression.
            </p>
            <div
              ref={actionsRef}
              className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6 sm:gap-4"
            >
              <Link
                href="/products"
                aria-label="Explore products"
                className="font-nike inline-flex items-center justify-center bg-white px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-neutral-900 transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-200 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore
              </Link>
              <button
                type="button"
                onClick={() => setWatchOpen(true)}
                aria-label="Watch brand video"
                className="font-nike inline-flex items-center justify-center gap-2 border border-white bg-transparent px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-neutral-900 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
                Watch
              </button>
            </div>
          </div>
        </div>
      </section>

      {watchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fear Insight brand video"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={() => setWatchOpen(false)}
        >
          <button
            type="button"
            onClick={() => setWatchOpen(false)}
            aria-label="Close video"
            className="absolute right-4 top-4 z-[101] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <div
            className="relative w-full max-w-4xl overflow-hidden bg-black shadow-2xl"
            style={{ aspectRatio: '16 / 9' }}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key="journey-modal"
              controls
              autoPlay
              playsInline
              className="h-full w-full object-contain"
            >
              {/* PLACEHOLDER: swap to /videos/journey-banner.mp4 when that asset is added */}
              <source src="/hero.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </>
  )
}
