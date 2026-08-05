'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Apple-inspired product feature — soft gray field, ghost "Fear Insight"
 * watermark, floating product shot, quiet copy + soft CTA on the right.
 */
export default function ProductFeatureSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const watermarkRef = useRef<HTMLParagraphElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
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
      if (!section) return

      gsap.from([watermarkRef.current, mediaRef.current, copyRef.current], {
        opacity: 0,
        y: reducedMotion ? 0 : 32,
        duration: reducedMotion ? 0.35 : 0.9,
        stagger: reducedMotion ? 0 : 0.12,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          once: true,
        },
      })

      if (!reducedMotion && mediaRef.current) {
        gsap.to(mediaRef.current, {
          yPercent: -4,
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
    <section
      ref={sectionRef}
      id="feature"
      aria-labelledby="feature-headline"
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:py-28 lg:px-10"
      style={{
        backgroundImage:
          'linear-gradient(180deg, #f5f5f5 0%, #ececec 45%, #f3f3f3 100%)',
      }}
    >
      {/* Ghost watermark */}
      <p
        ref={watermarkRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18%] z-0 w-[140%] -translate-x-1/2 text-center font-nike-display text-[clamp(3.5rem,16vw,11rem)] uppercase leading-none tracking-[0.02em] text-black/[0.045] select-none sm:top-[12%]"
      >
        Fear Insight
      </p>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
        {/* Product plane */}
        <div ref={mediaRef} className="relative md:col-span-7 lg:col-span-7">
          <div className="relative mx-auto aspect-square w-full max-w-[520px] md:max-w-none md:-ml-4 md:mr-0 lg:-ml-8">
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-[8%] left-1/2 h-[12%] w-[70%] -translate-x-1/2 rounded-[100%] bg-black/10 blur-2xl"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/slider1.png"
              alt="Fear Insight Fear Hoodie"
              className="relative z-10 h-full w-full object-contain drop-shadow-[0_28px_50px_rgba(0,0,0,0.18)]"
              decoding="async"
              loading="lazy"
            />
          </div>
        </div>

        {/* Copy — small lines on the right */}
        <div
          ref={copyRef}
          className="flex flex-col items-start md:col-span-5 lg:col-span-5 lg:pl-2"
        >
          <h2
            id="feature-headline"
            className="font-nike-display text-3xl uppercase leading-[0.95] tracking-[0.04em] text-neutral-900 sm:text-4xl md:text-[2.75rem] lg:text-5xl"
          >
            Pure
            <br />
            weight
          </h2>
          <p
            className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-500 sm:mt-6 sm:text-[0.95rem]"
            style={{
              fontFamily: 'var(--font-editorial), "Times New Roman", serif',
              fontStyle: 'italic',
            }}
          >
            “Heavy where it matters — soft where you live in it.”
          </p>
          <p className="font-nike mt-4 max-w-sm text-sm leading-relaxed text-neutral-600">
            Signature cotton blends cut for presence. Built to hold shape through the day and still feel like ease.
          </p>
          <Link
            href="/fear"
            className="font-nike mt-8 inline-flex items-center justify-center rounded-2xl bg-white/90 px-7 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-neutral-900 shadow-[0_10px_28px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.9)_inset] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:mt-10"
          >
            Read more
          </Link>
        </div>
      </div>
    </section>
  )
}
