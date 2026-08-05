'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const CREED = ['FAITH', 'FEAR', 'FORM', 'FOCUS', 'FIRE', 'FINISH']

/**
 * Cinematic chapter — full-bleed look with type cutting across the frame,
 * vertical index rail, and an infinite creed marquee. Not a basic split layout.
 */
export default function LifestyleStorySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const railRef = useRef<HTMLParagraphElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
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
      const frame = frameRef.current
      const image = imageRef.current
      const title = titleRef.current
      const rail = railRef.current
      const marquee = marqueeRef.current
      if (!section || !frame || !image || !title) return

      gsap.from(frame, {
        opacity: 0,
        y: reducedMotion ? 0 : 36,
        duration: reducedMotion ? 0.35 : 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true,
        },
      })

      gsap.from(title, {
        opacity: 0,
        x: reducedMotion ? 0 : -40,
        duration: reducedMotion ? 0.3 : 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          once: true,
        },
      })

      if (rail) {
        gsap.from(rail, {
          opacity: 0,
          y: reducedMotion ? 0 : 20,
          duration: reducedMotion ? 0.3 : 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 68%',
            once: true,
          },
        })
      }

      if (!reducedMotion) {
        gsap.to(image, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: frame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })

        gsap.to(title, {
          xPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: frame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      // Infinite creed marquee
      if (marquee && !reducedMotion) {
        const track = marquee.querySelector('[data-marquee-track]')
        if (track) {
          gsap.to(track, {
            xPercent: -50,
            duration: 28,
            ease: 'none',
            repeat: -1,
          })
        }
      }
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  )

  const marqueeItems = [...CREED, ...CREED, ...CREED, ...CREED]

  return (
    <section
      ref={sectionRef}
      id="story"
      aria-labelledby="story-title"
      className="relative overflow-hidden bg-[#f4f4f4]"
    >
      {/* Cinematic frame */}
      <div
        ref={frameRef}
        className="relative mx-auto max-w-7xl px-3 pt-10 sm:px-5 sm:pt-14 md:px-8 md:pt-16"
      >
        <div className="relative aspect-[16/11] overflow-hidden bg-neutral-900 sm:aspect-[16/10] md:aspect-[21/9]">
          {/* Parallax image layer */}
          <div
            ref={imageRef}
            className="absolute inset-x-0 -top-[12%] h-[124%] w-full will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/carousel-fear.jpg"
              alt="Fear Insight Fear collection"
              className="h-full w-full object-cover"
              style={{ filter: 'contrast(1.08) saturate(0.82) brightness(0.78)' }}
              decoding="async"
              loading="lazy"
            />
          </div>

          {/* Scrim */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              backgroundImage: `
                linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.35) 100%),
                linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 55%)
              `,
            }}
          />

          {/* Vertical chapter rail */}
          <p
            ref={railRef}
            className="font-nike absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 -rotate-90 text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-white/55 sm:left-5 sm:block md:left-7"
          >
            Chapter 02 — Wear the signal
          </p>

          {/* Type cutting across the image */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 sm:p-8 md:p-10 lg:p-12">
            <h2
              id="story-title"
              ref={titleRef}
              className="font-nike-display max-w-[12ch] text-[clamp(2.4rem,7vw,5.5rem)] uppercase leading-[0.92] tracking-[0.02em] text-white will-change-transform"
            >
              Built for
              <br />
              the moment
              <br />
              <span className="text-white/45">you choose</span>
            </h2>

            <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
              <p
                className="max-w-sm text-sm leading-relaxed text-white/75 sm:text-[0.95rem]"
                style={{
                  fontFamily: 'var(--font-editorial), "Times New Roman", serif',
                }}
              >
                Not costume. Not trend. A piece you put on when comfort is no longer the point.
              </p>
              <Link
                href="/fear"
                className="font-nike inline-flex w-fit items-center justify-center border border-white bg-white px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-transparent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Enter the drop
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Creed marquee — kinetic brand strip */}
      <div
        ref={marqueeRef}
        className="relative mt-8 overflow-hidden border-y border-neutral-900/10 py-4 sm:mt-10 sm:py-5 md:mt-12"
        aria-hidden
      >
        <div
          data-marquee-track
          className="flex w-max items-center gap-6 will-change-transform sm:gap-10"
        >
          {marqueeItems.map((word, i) => (
            <span key={`${word}-${i}`} className="flex items-center gap-6 sm:gap-10">
              <span className="font-nike-display text-2xl uppercase tracking-[0.08em] text-neutral-900/80 sm:text-3xl md:text-4xl">
                {word}
              </span>
              <span className="block h-1.5 w-1.5 rotate-45 bg-neutral-900/35" />
            </span>
          ))}
        </div>
      </div>

      {/* Closing caption row */}
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-12 md:px-10">
        <p className="font-nike text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-neutral-500">
          Directed by God
        </p>
        <p className="font-nike max-w-md text-sm text-neutral-600 sm:text-right">
          Signature · Fear · Oversize — three moods, one standard.
        </p>
      </div>
    </section>
  )
}
