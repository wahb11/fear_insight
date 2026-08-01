'use client'

import React, { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false })

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLHeadingElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useGSAP(
    () => {
      const section = sectionRef.current
      const videoWrap = videoWrapRef.current
      const text = textRef.current
      const wordmark = wordmarkRef.current
      if (!section || !videoWrap || !text || !wordmark) return

      // Content stays visible in HTML/CSS so the page isn't blank while JS loads.
      // GSAP only enhances; never leave the hero stuck at opacity 0.
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      if (reducedMotion) {
        gsap.fromTo(
          videoWrap,
          { opacity: 0.85 },
          { opacity: 1, duration: 0.35, ease: 'power2.out' }
        )
      } else {
        gsap.set(wordmark, { clipPath: 'inset(0 0 100% 0)' })

        tl.fromTo(
          videoWrap,
          { opacity: 0.4, scale: 1.05 },
          { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' },
          0
        ).to(
          wordmark,
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.85,
            ease: 'power3.inOut',
          },
          0.2
        )
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          if (videoWrap) {
            gsap.set(videoWrap, {
              y: reducedMotion ? 0 : p * 80,
            })
          }
          if (text) {
            // Fade only — keep CSS transform centering intact
            gsap.set(text, {
              opacity: 1 - p * 0.85,
            })
          }
        },
      })
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  )

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative h-[70svh] overflow-hidden sm:h-[85svh] md:h-[100svh]"
    >
      {/* Video Background — visible by default (no opacity-0) so SSR isn't a blank screen */}
      <div ref={videoWrapRef} className="absolute inset-0 z-0 will-change-transform">
        <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-950 to-stone-800" />

        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover absolute inset-0"
          style={{
            filter: 'brightness(0.7) contrast(1.2) saturate(1.0)',
            transform: 'scale(1.05)',
            zIndex: 1,
          }}
          onLoadedData={(e) => {
            e.currentTarget.play().catch(() => {})
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 z-10" />
      </div>

      <HeroCanvas />

      {/* True viewport center: left/top 50% + translate -50% (header optical offset via top calc) */}
      <div
        ref={textRef}
        className="pointer-events-none absolute left-1/2 z-30 w-max max-w-[92vw] -translate-x-1/2 -translate-y-1/2 px-4 text-center"
        style={{ top: 'calc(50% + 1.75rem)' }}
      >
        <h1
          ref={wordmarkRef}
          className="font-nike-display block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase text-white tracking-[0.04em] leading-none whitespace-nowrap"
        >
          Fear Insight
        </h1>
      </div>
    </section>
  )
}
