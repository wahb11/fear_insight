'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const SECTIONS = [
  {
    title: 'Information we collect',
    body: [
      'When you browse or place an order, we may collect information you provide directly — such as your name, email address, shipping address, phone number, and payment details processed by our payment partners.',
      'We also collect limited technical data automatically, including IP address, browser type, device information, and pages visited, to keep the site secure and improve performance.',
    ],
  },
  {
    title: 'How we use your information',
    body: [
      'We use your information to process orders, arrange shipping, send order updates, respond to support requests, and improve the Fear Insight shopping experience.',
      'With your consent where required, we may send product drops, offers, or brand updates. You can unsubscribe from marketing emails at any time.',
    ],
  },
  {
    title: 'Payments & processors',
    body: [
      'Payment card details are handled by our payment processor (such as Stripe). We do not store full credit card numbers on our servers.',
      'These processors act as independent controllers or processors under their own privacy terms for payment data.',
    ],
  },
  {
    title: 'Sharing of information',
    body: [
      'We share information only as needed to run the business — for example with shipping carriers, payment processors, email providers, and analytics tools.',
      'We do not sell your personal information. We may disclose information if required by law or to protect the rights, safety, and integrity of Fear Insight and our customers.',
    ],
  },
  {
    title: 'Cookies & analytics',
    body: [
      'We use cookies and similar technologies for essential site functions (cart, checkout, security) and to understand how visitors use the site.',
      'You can control cookies through your browser settings. Disabling some cookies may affect checkout or other features.',
    ],
  },
  {
    title: 'Data retention & security',
    body: [
      'We retain order and account-related information for as long as needed to fulfill orders, meet legal obligations, and resolve disputes.',
      'We use reasonable administrative, technical, and organizational measures to protect personal data. No method of transmission over the internet is fully secure.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'Depending on where you live, you may have rights to access, correct, update, or request deletion of your personal information.',
      'To exercise these rights, or to ask a privacy-related question, contact us at info@fearinsight.com.',
    ],
  },
  {
    title: 'Children’s privacy',
    body: [
      'Fear Insight is not directed at children under 13 (or the equivalent minimum age in your region). We do not knowingly collect personal information from children.',
    ],
  },
  {
    title: 'Updates to this policy',
    body: [
      'We may update this Privacy Policy from time to time. The “Last updated” date at the top of this page will change when we do. Continued use of the site after changes means you accept the revised policy.',
    ],
  },
] as const

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <section className="relative overflow-hidden border-b border-neutral-200 bg-neutral-50 px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 md:pt-36">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,0,0,0.04), transparent 55%)',
          }}
        />
        <motion.div
          className="relative z-10 mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-nike mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            Legal
          </p>
          <h1 className="font-nike-display text-4xl uppercase tracking-[0.04em] text-black sm:text-5xl md:text-6xl">
            Privacy Policy
          </h1>
          <p className="font-nike mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            How we collect, use, and protect your information when you shop Fear Insight.
          </p>
          <p className="font-nike mt-5 text-[0.65rem] uppercase tracking-[0.18em] text-neutral-400">
            Last updated · August 5, 2026
          </p>
        </motion.div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-12 sm:space-y-14">
          {SECTIONS.map((section, index) => (
            <motion.article
              key={section.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 0.55, delay: Math.min(index * 0.04, 0.2) }}
            >
              <h2 className="font-nike-display text-xl uppercase tracking-[0.06em] text-black sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="font-nike text-sm leading-relaxed text-neutral-600 sm:text-[0.95rem]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.article>
          ))}

          <div className="border-t border-neutral-200 pt-10">
            <h2 className="font-nike-display text-xl uppercase tracking-[0.06em] text-black sm:text-2xl">
              Contact
            </h2>
            <p className="font-nike mt-4 text-sm leading-relaxed text-neutral-600 sm:text-[0.95rem]">
              Questions about this policy? Email{' '}
              <a
                href="mailto:info@fearinsight.com"
                className="text-neutral-900 underline underline-offset-4 transition-opacity hover:opacity-60"
              >
                info@fearinsight.com
              </a>
              .
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="font-nike inline-flex items-center justify-center border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-neutral-900"
              >
                Back to home
              </Link>
              <Link
                href="/shipping-returns"
                className="font-nike inline-flex items-center justify-center border border-neutral-900 bg-white px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
              >
                Shipping &amp; returns
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
