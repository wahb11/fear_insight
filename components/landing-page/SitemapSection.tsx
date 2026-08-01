'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// PLACEHOLDER SOCIAL URLS — replace these with the official Fear Insight profiles.
const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/fearinsight' },
  { label: 'TikTok', href: 'https://tiktok.com/@fearinsight' },
  { label: 'WhatsApp', href: 'https://wa.me/0000000000' },
] as const

// PLACEHOLDER SITEMAP CONTENT — replace product names and destinations when collections are final.
const SITEMAP_COLUMNS = [
  {
    title: 'Fear',
    links: [
      { label: 'Directed Hoodie', href: '/products?category=fear' },
      { label: 'Fear Statement Tee', href: '/products?category=fear' },
      { label: 'Shadow Layer', href: '/products?category=fear' },
      { label: 'Fear Essentials', href: '/products?category=fear' },
    ],
  },
  {
    title: 'Signature',
    links: [
      { label: 'Signature Hoodie', href: '/products?category=signature' },
      { label: 'Core Crewneck', href: '/products?category=signature' },
      { label: 'Essential Tee', href: '/products?category=signature' },
      { label: 'Signature Collection', href: '/products?category=signature' },
    ],
  },
  {
    title: 'Oversize',
    links: [
      { label: 'Oversize Hoodie', href: '/products?category=oversize' },
      { label: 'Heavyweight Tee', href: '/products?category=oversize' },
      { label: 'Relaxed Crew', href: '/products?category=oversize' },
      { label: 'Oversize Collection', href: '/products?category=oversize' },
    ],
  },
  {
    title: 'Upcoming',
    links: [
      { label: 'Next Drop', href: '/products' },
      { label: 'Coming Soon', href: '/products' },
      { label: 'Join the Waitlist', href: '/products' },
      { label: 'Drop Archive', href: '/products' },
    ],
  },
] as const

/** Footer-adjacent sitemap block; the site footer remains a separate component below it. */
export default function SitemapSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const socialRef = useRef<HTMLElement>(null)
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])
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
      const logo = logoRef.current
      const social = socialRef.current
      const columns = columnRefs.current.filter(Boolean)
      if (!section || !logo || !social || columns.length === 0) return

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          once: true,
        },
      })

      timeline
        .from(logo, {
          opacity: 0,
          y: reducedMotion ? 0 : 14,
          duration: reducedMotion ? 0.3 : 0.5,
          ease: 'power2.out',
        })
        .from(
          social,
          {
            opacity: 0,
            y: reducedMotion ? 0 : 12,
            duration: reducedMotion ? 0.3 : 0.45,
            ease: 'power2.out',
          },
          reducedMotion ? '>-0.2' : '>-0.15'
        )
        .from(
          columns,
          {
            opacity: 0,
            y: reducedMotion ? 0 : 18,
            duration: reducedMotion ? 0.3 : 0.5,
            stagger: reducedMotion ? 0 : 0.08,
            ease: 'power2.out',
          },
          reducedMotion ? '>-0.2' : '>-0.1'
        )
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  )

  return (
    <section
      ref={sectionRef}
      aria-labelledby="sitemap-heading"
      className="bg-white px-4 pb-0 pt-8 text-neutral-900 sm:px-6 sm:pt-10 lg:px-12 lg:pt-12"
    >
      <h2 id="sitemap-heading" className="sr-only">
        Explore Fear Insight
      </h2>

      <div className="mx-auto max-w-7xl">
        <div ref={logoRef} className="flex justify-center">
          {/* Placeholder logo asset — replace `/images/logo-mark.svg` with the final logo. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-mark.svg"
            alt="Fear Insight"
            className="h-14 w-auto object-contain sm:h-16 md:h-20"
          />
        </div>

        <nav
          ref={socialRef}
          aria-label="Fear Insight social media"
          className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 sm:mt-10 sm:gap-x-10"
        >
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-neutral-800 underline-offset-4 transition-all duration-300 hover:-translate-y-0.5 hover:opacity-55 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 sm:text-base"
            >
              {social.label}
            </a>
          ))}
        </nav>

        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 sm:mt-20 sm:gap-x-10 md:grid-cols-4 md:gap-x-12 lg:mt-24 lg:gap-x-20">
          {SITEMAP_COLUMNS.map((column, index) => (
            <div
              key={column.title}
              ref={(element) => {
                columnRefs.current[index] = element
              }}
            >
              <h3 className="text-base font-semibold text-black sm:text-lg">{column.title}</h3>
              <ul className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                {column.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="inline-block text-sm leading-relaxed text-neutral-600 transition-all duration-300 hover:translate-x-1 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 sm:text-[0.95rem]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-neutral-200 sm:mt-20 lg:mt-24" aria-hidden />
      </div>
    </section>
  )
}
