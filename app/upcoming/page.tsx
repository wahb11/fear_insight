'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function UpcomingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-28 sm:pt-32">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            backgroundImage: `
              radial-gradient(ellipse 70% 50% at 50% 40%, rgba(0,0,0,0.04), transparent 60%),
              linear-gradient(180deg, #fafafa 0%, #ffffff 55%, #f3f3f3 100%)
            `,
          }}
        />

        <motion.div
          className="relative z-10 mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-nike mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-neutral-500">
            Next drop
          </p>
          <h1 className="font-nike-display text-5xl uppercase tracking-[0.04em] text-black sm:text-6xl md:text-7xl">
            Coming soon
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-neutral-900" aria-hidden />
          <p className="font-nike mx-auto mt-6 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-base">
            New pieces are in the works. Check back for the next Fear Insight release.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/fear"
              className="font-nike inline-flex items-center justify-center border border-neutral-900 bg-neutral-900 px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-neutral-900"
            >
              Shop Fear
            </Link>
            <Link
              href="/"
              className="font-nike inline-flex items-center justify-center border border-neutral-900 bg-white px-6 py-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
            >
              Back home
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
