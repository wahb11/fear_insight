'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { SizeChart } from '@/components/ui/size-chart'

/**
 * Closing brand bar — oversized wordmark + CTAs + legal.
 * Collection columns live in SitemapSection on the landing page;
 * this footer stays lean so the two never feel like duplicate footers.
 */
export default function Footer() {
  const [showSizeChart, setShowSizeChart] = useState(false)
  const year = new Date().getFullYear()

  return (
    <>
      <footer id="contact" className="relative overflow-hidden bg-[#0a0a0a] text-[#e8e4dc]">
        <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-14 md:px-10 md:pt-16 lg:px-12">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="max-w-md">
              <p className="font-nike mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/40">
                Directed by God
              </p>
              <p className="font-nike text-sm leading-relaxed text-white/55 sm:text-[0.95rem]">
                Premium streetwear built for conviction — shop the drop or reach out.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link
                  href="/fear"
                  className="font-nike inline-flex items-center justify-center bg-[#e8e4dc] px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-neutral-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8e4dc]"
                >
                  Shop now
                </Link>
                <a
                  href="mailto:info@fearinsight.com"
                  className="font-nike inline-flex items-center justify-center border border-[#e8e4dc]/70 bg-transparent px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#e8e4dc] transition-colors hover:border-white hover:bg-white hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8e4dc]"
                >
                  Contact us
                </a>
              </div>
            </div>

            <nav
              aria-label="Footer utilities"
              className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end sm:gap-x-8"
            >
              <button
                type="button"
                onClick={() => setShowSizeChart(true)}
                className="font-nike text-[0.65rem] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white/80"
              >
                Size guide
              </button>
              <Link
                href="/shipping-returns"
                className="font-nike text-[0.65rem] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white/80"
              >
                Shipping &amp; returns
              </Link>
              <Link
                href="/faq"
                className="font-nike text-[0.65rem] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white/80"
              >
                FAQ
              </Link>
              <Link
                href="/privacy"
                className="font-nike text-[0.65rem] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-white/80"
              >
                Privacy
              </Link>
            </nav>
          </div>

          {/* Oversized brand mark */}
          <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-10 sm:mt-16 sm:pt-12 md:mt-20">
            <Link
              href="/"
              aria-label="Fear Insight home"
              className="group inline-flex max-w-full items-center gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e8e4dc] sm:gap-5 md:gap-6"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-mark.svg"
                alt=""
                className="h-9 w-auto shrink-0 brightness-0 invert opacity-90 transition-opacity group-hover:opacity-100 sm:h-12 md:h-16 lg:h-[4.5rem]"
              />
              <span className="font-nike-display text-[clamp(2.25rem,8.5vw,6.25rem)] uppercase leading-none tracking-[0.02em] text-[#e8e4dc] transition-colors group-hover:text-white">
                Fear Insight
              </span>
            </Link>
            <p className="font-nike pb-6 text-[0.65rem] uppercase tracking-[0.16em] text-white/30 sm:pb-8 md:pb-10">
              © Fear Insight {year}
            </p>
          </div>
        </div>
      </footer>

      <SizeChart isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </>
  )
}
