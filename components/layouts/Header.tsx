'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ShoppingBag, Search, Heart } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useMagnetic } from '@/hooks/useMagnetic'

gsap.registerPlugin(useGSAP)

const UTILITY_LINKS = [
  { label: 'Find a Store', href: '#contact' },
  { label: 'Assistance', href: '/faq' },
  { label: 'The Community', href: 'https://www.instagram.com/fear_insight?igsh=MXV4dmtxMG0zbjJ3aQ==', external: true },
  { label: 'Sign In', href: '#', placeholder: true },
] as const

const MAIN_NAV = [
  { label: 'Fear', href: '/products' },
  { label: 'Oversize', href: '/products' },
  { label: 'Upcoming', href: '/#bestsellers' },
  { label: 'Signature', href: '/products' },
] as const

/** Secondary routes — footer + mobile menu */
const SECONDARY_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
] as const

function MagneticLink({
  href,
  children,
  className,
  external,
  onClick,
  reducedMotion,
}: {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
  onClick?: (e: React.MouseEvent) => void
  reducedMotion: boolean
}) {
  const ref = useMagnetic<HTMLSpanElement>(0.28, reducedMotion)

  const inner = (
    <span ref={ref} className="inline-block will-change-transform">
      {children}
    </span>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {inner}
      </a>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {inner}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {inner}
    </Link>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const { items } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const utilityRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useGSAP(
    () => {
      if (!utilityRef.current || !navRef.current) return

      const duration = reducedMotion ? 0.35 : 0.55
      const y = reducedMotion ? 0 : -16

      // Animate in, then clear inline styles so a GSAP revert can't leave the nav invisible
      gsap.from(utilityRef.current, {
        opacity: 0,
        y,
        duration,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      })
      gsap.from(navRef.current, {
        opacity: 0,
        y,
        duration,
        delay: reducedMotion ? 0.05 : 0.12,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      })
    },
    { scope: headerRef, dependencies: [reducedMotion] }
  )

  useEffect(() => {
    const MIN_SCROLL_TO_HIDE = 80
    const DIRECTION_THRESHOLD = 8

    const onScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollYRef.current

      if (Math.abs(delta) < DIRECTION_THRESHOLD) return

      if (currentY <= MIN_SCROLL_TO_HIDE) {
        setIsHeaderHidden(false)
      } else if (delta > 0) {
        setIsHeaderHidden(true)
      } else {
        setIsHeaderHidden(false)
      }

      lastScrollYRef.current = currentY
    }

    lastScrollYRef.current = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isMenuOpen && isHeaderHidden) {
      setIsHeaderHidden(false)
    }
  }, [isMenuOpen, isHeaderHidden])

  const scrollToId = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleAnchorNav = (href: string, e: React.MouseEvent) => {
    if (!href.startsWith('#') && !href.includes('/#')) return

    e.preventDefault()
    setIsMenuOpen(false)

    const id = href.includes('#') ? href.split('#')[1] : href.replace('#', '')

    if (pathname === '/') {
      setTimeout(() => scrollToId(id), 100)
    } else {
      router.push(`/#${id}`)
      setTimeout(() => scrollToId(id), 800)
    }
  }

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 w-full z-50 font-nike transition-transform duration-300 ease-out ${
        isHeaderHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Top utility strip — Nike-style white */}
      <div
        ref={utilityRef}
        className="hidden sm:block w-full bg-white border-b border-neutral-200"
        style={{ minHeight: 36 }}
      >
        <div className="w-full px-4 md:px-8 lg:px-12 flex items-center justify-end h-9 gap-5 md:gap-6">
          {UTILITY_LINKS.map((link, i) => (
            <React.Fragment key={link.label}>
              {i > 0 && <span className="text-neutral-300 text-[10px] select-none" aria-hidden>|</span>}
              <MagneticLink
                href={link.href}
                external={'external' in link && link.external}
                reducedMotion={reducedMotion}
                onClick={(e) => {
                  if ('placeholder' in link && link.placeholder) {
                    e.preventDefault()
                    return
                  }
                  if (link.href.startsWith('#')) handleAnchorNav(link.href, e)
                }}
                className="text-[12px] text-neutral-700 hover:text-black transition-colors duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                {link.label}
              </MagneticLink>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main nav — white; logo left, Fear / Oversize / Upcoming centered */}
      <nav
        ref={navRef}
        className="w-full bg-white border-b border-neutral-200"
        aria-label="Primary"
      >
        <div className="w-full px-4 md:px-8 lg:px-12 py-3 md:py-4">
          <div className="relative flex items-center justify-between w-full min-h-[40px]">
            {/* Left: hamburger + logo */}
            <div className="z-10 flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:basis-1/3 lg:flex-none">
              <button
                type="button"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex lg:hidden items-center justify-center w-9 h-9 rounded-full hover:bg-neutral-100 transition-colors duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <div className="w-5 h-3.5 flex flex-col justify-between items-center">
                  <span
                    className={`block w-full h-[1.5px] bg-black transition-transform duration-300 ${isMenuOpen ? 'translate-y-[6px] rotate-45' : ''}`}
                  />
                  <span
                    className={`block w-full h-[1.5px] bg-black transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}
                  />
                  <span
                    className={`block w-full h-[1.5px] bg-black transition-transform duration-300 ${isMenuOpen ? '-translate-y-[6px] -rotate-45' : ''}`}
                  />
                </div>
              </button>

              <Link
                href="/"
                aria-label="Fear Insight home"
                className="flex h-9 items-center focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-mark.svg"
                  alt="Fear Insight"
                  className="h-8 w-auto object-contain transition-opacity hover:opacity-70 sm:h-9"
                />
              </Link>
            </div>

            {/* Center: Fear / Oversize / Upcoming / Signature */}
            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-6 lg:flex xl:gap-9">
              {MAIN_NAV.map((item) => (
                <MagneticLink
                  key={item.label}
                  href={item.href}
                  reducedMotion={reducedMotion}
                  onClick={(e) => {
                    if (item.href.includes('#')) handleAnchorNav(item.href, e)
                    setIsMenuOpen(false)
                  }}
                  className="text-[15px] lg:text-[16px] font-medium text-black hover:text-neutral-500 transition-colors duration-200 whitespace-nowrap focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black"
                >
                  {item.label}
                </MagneticLink>
              ))}
            </div>

            {/* Right: search, wishlist, cart */}
            <div className="z-10 flex flex-1 items-center justify-end gap-1 md:gap-2 lg:basis-1/3 lg:flex-none">
              <Link
                href="/products"
                aria-label="Search products"
                className="hidden sm:flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-neutral-100 transition-all duration-200 group focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <Search className="w-[22px] h-[22px] text-black" strokeWidth={1.75} />
              </Link>
              <Link
                href="/products"
                aria-label="Wishlist"
                className="hidden sm:flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-neutral-100 transition-all duration-200 group focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <Heart className="w-[22px] h-[22px] text-black" strokeWidth={1.75} />
              </Link>
              <Link
                href="/cart"
                aria-label={`Shopping cart${items.length > 0 ? `, ${items.length} items` : ''}`}
                className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-neutral-100 transition-all duration-200 relative group focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <ShoppingBag className="w-[22px] h-[22px] text-black" strokeWidth={1.75} />
                {items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden bg-white border-t border-neutral-200 transition-all duration-300 lg:hidden ${
            isMenuOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
          }`}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-1">
            {MAIN_NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.href.includes('#')) handleAnchorNav(item.href, e)
                  setIsMenuOpen(false)
                }}
                className="text-black hover:text-neutral-500 transition-colors duration-200 py-3 px-4 text-left w-full text-[16px] font-medium focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-3 mt-2 border-t border-neutral-200">
              <p className="px-4 pb-2 text-[11px] uppercase tracking-[0.08em] text-neutral-400">More</p>
              {SECONDARY_NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith('#')) handleAnchorNav(item.href, e)
                    else setIsMenuOpen(false)
                  }}
                  className="block text-neutral-600 hover:text-black transition-colors duration-200 py-2.5 px-4 text-[15px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 pt-3 pb-1">
                {UTILITY_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={'external' in link && link.external ? '_blank' : undefined}
                    rel={'external' in link && link.external ? 'noopener noreferrer' : undefined}
                    onClick={(e) => {
                      if ('placeholder' in link && link.placeholder) {
                        e.preventDefault()
                        setIsMenuOpen(false)
                        return
                      }
                      if (link.href.startsWith('#')) handleAnchorNav(link.href, e)
                      setIsMenuOpen(false)
                    }}
                    className="text-[12px] text-neutral-500 hover:text-black transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
