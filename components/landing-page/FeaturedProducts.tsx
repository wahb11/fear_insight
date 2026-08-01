'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight } from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * PLACEHOLDER PRODUCTS — swap `name`, `image`, and `href` for real product data.
 * One product per category (Fear / Oversize / Signature). Images currently point to `/public/images`.
 */
const PRODUCTS = [
  {
    category: 'Fear',
    name: 'Fear Hoodie',
    // TODO: replace with real product photo
    image: '/images/carousel-fear.jpg',
    href: '/products?category=fear',
  },
  {
    category: 'Oversize',
    name: 'Oversize Tee',
    // TODO: replace with real product photo
    image: '/images/carousel-oversize.jpg',
    href: '/products?category=oversize',
  },
  {
    category: 'Signature',
    name: 'Signature Crew',
    // TODO: replace with real product photo
    image: '/images/carousel-signature.jpg',
    href: '/products?category=signature',
  },
] as const

type IdleTweens = {
  main: gsap.core.Tween | null
  ghostLeft: gsap.core.Tween | null
  ghostRight: gsap.core.Tween | null
}

/**
 * Full-width featured products showcase.
 * Core swap + idle-float animation ported from the SSENSE reference — no app/social chrome.
 */
export default function FeaturedProducts() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const mainProductRef = useRef<HTMLDivElement>(null)
  const mainImgRef = useRef<HTMLImageElement>(null)
  const ghostLeftRef = useRef<HTMLDivElement>(null)
  const ghostRightRef = useRef<HTMLDivElement>(null)
  const ghostLeftImgRef = useRef<HTMLImageElement>(null)
  const ghostRightImgRef = useRef<HTMLImageElement>(null)
  const productNameRef = useRef<HTMLHeadingElement>(null)
  const seeMoreRef = useRef<HTMLAnchorElement>(null)

  const currentIndexRef = useRef(0)
  const isAnimatingRef = useRef(false)
  const idleRef = useRef<IdleTweens>({ main: null, ghostLeft: null, ghostRight: null })
  const inViewRef = useRef(false)

  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const killIdle = useCallback(() => {
    const idle = idleRef.current
    idle.main?.kill()
    idle.ghostLeft?.kill()
    idle.ghostRight?.kill()
    idle.main = null
    idle.ghostLeft = null
    idle.ghostRight = null
  }, [])

  const startIdle = useCallback(() => {
    if (!inViewRef.current) return
    killIdle()

    const main = mainProductRef.current
    const ghostLeft = ghostLeftRef.current
    const ghostRight = ghostRightRef.current
    if (!main || !ghostLeft || !ghostRight) return

    if (reducedMotion) {
      gsap.set(main, { y: 0, rotation: 0 })
      return
    }

    idleRef.current.main = gsap.to(main, {
      y: '-=10',
      duration: 2.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    idleRef.current.ghostLeft = gsap.to(ghostLeft, {
      y: '+=10',
      duration: 2.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    idleRef.current.ghostRight = gsap.to(ghostRight, {
      y: '-=10',
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  }, [killIdle, reducedMotion])

  const pauseIdle = useCallback(() => {
    const idle = idleRef.current
    idle.main?.pause()
    idle.ghostLeft?.pause()
    idle.ghostRight?.pause()
  }, [])

  const resumeIdle = useCallback(() => {
    if (reducedMotion || !inViewRef.current) return
    const idle = idleRef.current
    idle.main?.invalidate().restart()
    idle.ghostLeft?.invalidate().restart()
    idle.ghostRight?.invalidate().restart()
  }, [reducedMotion])

  const renderProductMeta = useCallback((index: number) => {
    const data = PRODUCTS[index]
    if (!data) return
    const previous = PRODUCTS[(index - 1 + PRODUCTS.length) % PRODUCTS.length]
    const next = PRODUCTS[(index + 1) % PRODUCTS.length]

    if (productNameRef.current) productNameRef.current.textContent = data.name
    if (mainImgRef.current) {
      mainImgRef.current.src = data.image
      mainImgRef.current.alt = `${data.name} — Fear Insight ${data.category} collection`
    }
    if (ghostLeftImgRef.current) ghostLeftImgRef.current.src = previous.image
    if (ghostRightImgRef.current) ghostRightImgRef.current.src = next.image
    if (seeMoreRef.current) seeMoreRef.current.href = data.href
  }, [])

  const switchProduct = useCallback(
    (nextIndex: number, direction = 1) => {
      if (isAnimatingRef.current) return
      if (nextIndex === currentIndexRef.current) return

      const main = mainProductRef.current
      const ghostLeft = ghostLeftRef.current
      const ghostRight = ghostRightRef.current
      const productName = productNameRef.current
      const seeMore = seeMoreRef.current
      if (!main || !ghostLeft || !ghostRight || !productName || !seeMore) return

      isAnimatingRef.current = true
      pauseIdle()

      if (reducedMotion) {
        renderProductMeta(nextIndex)
        currentIndexRef.current = nextIndex
        setActiveIndex(nextIndex)
        isAnimatingRef.current = false
        resumeIdle()
        return
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false
          currentIndexRef.current = nextIndex
          setActiveIndex(nextIndex)
          resumeIdle()
        },
      })

      tl.to(main, {
        x: direction * -200,
        y: 40,
        opacity: 0,
        rotation: -18,
        duration: 0.35,
        ease: 'power2.in',
      })
        .to(
          [ghostLeft, ghostRight],
          {
            opacity: 0,
            scale: 0.5,
            duration: 0.3,
            ease: 'power2.in',
          },
          '-=0.3'
        )
        .to(
          [productName, seeMore],
          {
            y: 16,
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
          },
          '-=0.3'
        )

      tl.add(() => {
        renderProductMeta(nextIndex)
      })

      tl.set(main, { x: direction * 200, y: -30, opacity: 0, rotation: 0 })
      tl.set([ghostLeft, ghostRight], { opacity: 0, scale: 0.5 })
      tl.set([productName, seeMore], { y: -14, opacity: 0 })

      tl.to(main, {
        x: 0,
        y: 0,
        opacity: 1,
        rotation: 0,
        duration: 0.55,
        ease: 'back.out(1.3)',
      })
        .to(
          [ghostLeft, ghostRight],
          {
            opacity: 0.35,
            scale: 0.65,
            duration: 0.5,
            ease: 'back.out(1.2)',
          },
          '-=0.4'
        )
        .to(
          [productName, seeMore],
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            stagger: 0.05,
            ease: 'power3.out',
          },
          '-=0.35'
        )
    },
    [pauseIdle, reducedMotion, renderProductMeta, resumeIdle]
  )

  const goPrev = useCallback(() => {
    const nextIndex = (currentIndexRef.current - 1 + PRODUCTS.length) % PRODUCTS.length
    switchProduct(nextIndex, -1)
  }, [switchProduct])

  const goNext = useCallback(() => {
    const nextIndex = (currentIndexRef.current + 1) % PRODUCTS.length
    switchProduct(nextIndex, 1)
  }, [switchProduct])

  useGSAP(
    () => {
      const main = mainProductRef.current
      const ghostLeft = ghostLeftRef.current
      const ghostRight = ghostRightRef.current
      if (main) gsap.set(main, { rotation: 0 })
      if (ghostLeft) gsap.set(ghostLeft, { rotation: -14, scale: 0.65, opacity: 0.35 })
      if (ghostRight) gsap.set(ghostRight, { rotation: 14, scale: 0.65, opacity: 0.35 })
    },
    { scope: sectionRef }
  )

  useGSAP(
    () => {
      const section = sectionRef.current
      const content = contentRef.current
      if (!section || !content) return

      gsap.set(content, { opacity: 0, scale: reducedMotion ? 1 : 0.96 })

      ScrollTrigger.create({
        trigger: section,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          gsap.to(content, {
            opacity: 1,
            scale: 1,
            duration: reducedMotion ? 0.35 : 0.7,
            ease: 'power2.out',
            onComplete: () => {
              inViewRef.current = true
              startIdle()
            },
          })
        },
      })

    },
    { scope: sectionRef, dependencies: [reducedMotion, startIdle] }
  )

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }

    section.addEventListener('keydown', onKeyDown)
    return () => section.removeEventListener('keydown', onKeyDown)
  }, [goPrev, goNext])

  useEffect(() => {
    return () => {
      killIdle()
    }
  }, [killIdle])

  useEffect(() => {
    if (inViewRef.current) startIdle()
  }, [reducedMotion, startIdle])

  const product = PRODUCTS[activeIndex]
  const previousProduct = PRODUCTS[(activeIndex - 1 + PRODUCTS.length) % PRODUCTS.length]
  const nextProduct = PRODUCTS[(activeIndex + 1) % PRODUCTS.length]

  return (
    <section
      ref={sectionRef}
      id="bestsellers"
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Featured products. Use arrow buttons or keyboard arrows to browse."
      className="relative overflow-hidden bg-white px-4 py-12 text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:py-14"
    >
      <div ref={contentRef} className="container relative z-10 mx-auto max-w-6xl">
        <header className="mb-6 text-center md:mb-8">
          <p className="font-nike mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            Curated picks
          </p>
          <h2
            id="featured-products-heading"
            className="font-nike-display mb-3 text-2xl uppercase tracking-[0.04em] text-black sm:text-3xl md:text-5xl"
          >
            Shop the Drop
          </h2>
          <p className="mx-auto max-w-xl text-sm text-neutral-600 md:text-base">
            Three pieces, three moods — tap through what&apos;s moving right now.
          </p>
        </header>

        <div
          ref={stageRef}
          className="relative mx-auto flex max-w-5xl items-center justify-center"
          role="region"
          aria-labelledby="featured-products-heading"
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous featured product"
            className="absolute left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-neutral-900 bg-white text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:left-0 sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next featured product"
            className="absolute right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-neutral-900 bg-white text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:right-0 sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          <div className="relative flex w-full items-center justify-center px-8 sm:px-14 md:px-16">
            <div
              ref={ghostLeftRef}
              className="pointer-events-none absolute left-0 top-[38%] w-[26%] max-w-[110px] -translate-y-1/2 sm:left-[2%] sm:top-1/2 sm:max-w-[180px] md:left-[4%] md:max-w-[220px] lg:max-w-[260px]"
              aria-hidden
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={ghostLeftImgRef}
                src={previousProduct.image}
                alt=""
                className="h-auto w-full select-none mix-blend-multiply blur-[1px] sm:blur-[2px]"
                draggable={false}
              />
            </div>

            <div
              ref={ghostRightRef}
              className="pointer-events-none absolute right-0 top-[38%] w-[26%] max-w-[110px] -translate-y-1/2 sm:right-[2%] sm:top-1/2 sm:max-w-[180px] md:right-[4%] md:max-w-[220px] lg:max-w-[260px]"
              aria-hidden
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={ghostRightImgRef}
                src={nextProduct.image}
                alt=""
                className="h-auto w-full select-none mix-blend-multiply blur-[1px] sm:blur-[2px]"
                draggable={false}
              />
            </div>

            <div className="relative z-10 flex w-full max-w-[180px] flex-col items-center sm:max-w-[320px] md:max-w-[400px] lg:max-w-[460px]">
              <div ref={mainProductRef} className="w-full will-change-transform">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={mainImgRef}
                  src={product.image}
                  alt={`${product.name} — Fear Insight ${product.category} collection`}
                  className="h-auto w-full select-none mix-blend-multiply drop-shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
                  draggable={false}
                />
              </div>

              <div className="mt-5 flex flex-col items-center gap-3 text-center md:mt-6">
                <h3
                  ref={productNameRef}
                  className="font-nike-display text-xl uppercase tracking-[0.06em] text-black md:text-2xl"
                >
                  {product.name}
                </h3>
                <Link
                  ref={seeMoreRef}
                  href={product.href}
                  className="font-nike inline-flex min-h-10 items-center justify-center border border-neutral-900 px-8 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                >
                  See More
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center font-nike text-xs uppercase tracking-[0.18em] text-neutral-400" aria-live="polite">
          {String(activeIndex + 1).padStart(2, '0')} / {String(PRODUCTS.length).padStart(2, '0')}
        </p>
      </div>
    </section>
  )
}
