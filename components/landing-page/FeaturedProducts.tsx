'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useFeaturedProducts } from '@/hooks/useFeaturedProducts'
import { Product } from '@/types/products'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type CarouselItem = {
  id: string
  name: string
  detail: string
  image: string
  href: string
}

/** Previous hardcoded drop — used until admin featured cutouts exist */
const FALLBACK_PRODUCTS: CarouselItem[] = [
  {
    id: 'fallback-fear',
    name: 'Fear Hoodie',
    detail: 'Statement weight · Fear collection',
    image: '/images/slider1.png',
    href: '/fear',
  },
  {
    id: 'fallback-insignia',
    name: 'Insignia Hoodie',
    detail: 'Mark of origin · Insignia collection',
    image: '/images/slider2.png',
    href: '/insignia',
  },
  {
    id: 'fallback-oversized',
    name: 'Oversized Hoodie',
    detail: 'Relaxed volume · Oversized collection',
    image: '/images/slider3.png',
    href: '/oversized',
  },
]

function toCarouselItems(products: Product[]): CarouselItem[] {
  return products
    .filter((p) => p.featured_image)
    .map((p) => {
      const price =
        p.discount > 0
          ? `$${(p.price * (1 - p.discount / 100)).toFixed(2)} · ${p.discount}% off`
          : `$${Number(p.price).toFixed(2)}`
      return {
        id: p.id,
        name: p.name,
        detail: price,
        image: p.featured_image as string,
        href: `/product/${p.id}`,
      }
    })
}

type SlotPose = {
  xPercent: number
  scale: number
  blur: number
  opacity: number
  rotation: number
  zIndex: number
  shadowOpacity: number
  shadowScale: number
}

type PoseSet = {
  center: SlotPose
  left: SlotPose
  right: SlotPose
  offLeft: SlotPose
  offRight: SlotPose
}

const DESKTOP_POSES: PoseSet = {
  center: {
    xPercent: -50,
    scale: 1,
    blur: 0,
    opacity: 1,
    rotation: 0,
    zIndex: 20,
    shadowOpacity: 0.7,
    shadowScale: 1,
  },
  left: {
    xPercent: -128,
    scale: 0.55,
    blur: 12,
    opacity: 0.75,
    rotation: 0,
    zIndex: 5,
    shadowOpacity: 0.45,
    shadowScale: 0.72,
  },
  right: {
    xPercent: 28,
    scale: 0.55,
    blur: 12,
    opacity: 0.75,
    rotation: 0,
    zIndex: 5,
    shadowOpacity: 0.45,
    shadowScale: 0.72,
  },
  offLeft: {
    xPercent: -180,
    scale: 0.38,
    blur: 18,
    opacity: 0,
    rotation: 0,
    zIndex: 1,
    shadowOpacity: 0,
    shadowScale: 0.4,
  },
  offRight: {
    xPercent: 80,
    scale: 0.38,
    blur: 18,
    opacity: 0,
    rotation: 0,
    zIndex: 1,
    shadowOpacity: 0,
    shadowScale: 0.4,
  },
}

const MOBILE_POSES: PoseSet = {
  center: {
    xPercent: -50,
    scale: 1,
    blur: 0,
    opacity: 1,
    rotation: 0,
    zIndex: 20,
    shadowOpacity: 0.65,
    shadowScale: 1,
  },
  left: {
    xPercent: -102,
    scale: 0.5,
    blur: 8,
    opacity: 0.7,
    rotation: 0,
    zIndex: 5,
    shadowOpacity: 0.4,
    shadowScale: 0.7,
  },
  right: {
    xPercent: 2,
    scale: 0.5,
    blur: 8,
    opacity: 0.7,
    rotation: 0,
    zIndex: 5,
    shadowOpacity: 0.4,
    shadowScale: 0.7,
  },
  offLeft: {
    xPercent: -145,
    scale: 0.36,
    blur: 12,
    opacity: 0,
    rotation: 0,
    zIndex: 1,
    shadowOpacity: 0,
    shadowScale: 0.4,
  },
  offRight: {
    xPercent: 45,
    scale: 0.36,
    blur: 12,
    opacity: 0,
    rotation: 0,
    zIndex: 1,
    shadowOpacity: 0,
    shadowScale: 0.4,
  },
}

function wrapIndex(i: number, total: number) {
  if (total <= 0) return 0
  return ((i % total) + total) % total
}

function relativeOffset(productIndex: number, activeIndex: number, total: number) {
  if (total <= 0) return 0
  let offset = productIndex - activeIndex
  while (offset > total / 2) offset -= total
  while (offset < -total / 2) offset += total
  return offset
}

function poseForOffset(offset: number, poses: PoseSet): SlotPose {
  if (offset === 0) return poses.center
  if (offset === -1) return poses.left
  if (offset === 1) return poses.right
  return offset < 0 ? poses.offLeft : poses.offRight
}

/**
 * Studio coverflow — center sharp & floating, sides blurred with soft floor shadows.
 * Products come from admin Featured tab (featured + featured_image cutout).
 */
export default function FeaturedProducts() {
  const router = useRouter()
  const { data, isLoading } = useFeaturedProducts()
  const products = useMemo(() => {
    const fromDb = toCarouselItems(data || [])
    return fromDb.length > 0 ? fromDb : FALLBACK_PRODUCTS
  }, [data])
  const productsRef = useRef(products)
  productsRef.current = products
  const total = products.length

  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const shadowRefs = useRef<(HTMLDivElement | null)[]>([])
  const imgRefs = useRef<(HTMLImageElement | null)[]>([])
  const brandRef = useRef<HTMLHeadingElement>(null)
  const detailRef = useRef<HTMLParagraphElement>(null)
  const seeMoreRef = useRef<HTMLAnchorElement>(null)

  const currentIndexRef = useRef(0)
  const isAnimatingRef = useRef(false)
  const inViewRef = useRef(false)
  const floatTweensRef = useRef<gsap.core.Tween[]>([])
  const posesRef = useRef<PoseSet>(DESKTOP_POSES)
  const isMobileRef = useRef(false)
  const suppressClickRef = useRef(false)

  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqMobile = window.matchMedia('(max-width: 639px)')

    const syncMotion = () => setReducedMotion(mqMotion.matches)
    const syncMobile = () => {
      const mobile = mqMobile.matches
      isMobileRef.current = mobile
      posesRef.current = mobile ? MOBILE_POSES : DESKTOP_POSES
      setIsMobile(mobile)
    }

    syncMotion()
    syncMobile()
    mqMotion.addEventListener('change', syncMotion)
    mqMobile.addEventListener('change', syncMobile)
    return () => {
      mqMotion.removeEventListener('change', syncMotion)
      mqMobile.removeEventListener('change', syncMobile)
    }
  }, [])

  // Reset carousel when product list changes
  useEffect(() => {
    currentIndexRef.current = 0
    setActiveIndex(0)
    itemRefs.current = []
    shadowRefs.current = []
    imgRefs.current = []
  }, [total])

  const killFloat = useCallback(() => {
    floatTweensRef.current.forEach((t) => t.kill())
    floatTweensRef.current = []
  }, [])

  const applyPose = useCallback(
    (
      el: HTMLElement,
      shadow: HTMLElement | null,
      img: HTMLElement | null,
      pose: SlotPose,
      immediate = false
    ) => {
      const duration = immediate ? 0 : isMobileRef.current ? 0.65 : 0.8
      const ease = 'power3.inOut'

      gsap.to(el, {
        xPercent: pose.xPercent,
        yPercent: -50,
        y: 0,
        scale: pose.scale,
        rotation: pose.rotation,
        opacity: pose.opacity,
        zIndex: pose.zIndex,
        duration,
        ease,
        overwrite: 'auto',
      })

      if (img) {
        gsap.to(img, {
          filter: `blur(${pose.blur}px)`,
          duration,
          ease,
          overwrite: 'auto',
        })
      }

      if (shadow) {
        gsap.to(shadow, {
          opacity: pose.shadowOpacity,
          scaleX: pose.shadowScale,
          scaleY: pose.shadowScale * 0.8,
          duration,
          ease,
          overwrite: 'auto',
        })
      }
    },
    []
  )

  const setPose = useCallback(
    (
      el: HTMLElement,
      shadow: HTMLElement | null,
      img: HTMLElement | null,
      pose: SlotPose
    ) => {
      gsap.set(el, {
        xPercent: pose.xPercent,
        yPercent: -50,
        y: 0,
        scale: pose.scale,
        rotation: pose.rotation,
        opacity: pose.opacity,
        zIndex: pose.zIndex,
      })
      if (img) gsap.set(img, { filter: `blur(${pose.blur}px)` })
      if (shadow) {
        gsap.set(shadow, {
          opacity: pose.shadowOpacity,
          scaleX: pose.shadowScale,
          scaleY: pose.shadowScale * 0.8,
        })
      }
    },
    []
  )

  const layoutToIndex = useCallback(
    (active: number, immediate = false) => {
      const poses = posesRef.current
      const n = productsRef.current.length
      productsRef.current.forEach((_, i) => {
        const el = itemRefs.current[i]
        const shadow = shadowRefs.current[i]
        const img = imgRefs.current[i]
        if (!el) return
        const offset = relativeOffset(i, active, n)
        applyPose(el, shadow, img, poseForOffset(offset, poses), immediate)
      })
    },
    [applyPose]
  )

  const transitionToIndex = useCallback(
    (from: number, to: number) => {
      const poses = posesRef.current
      const n = productsRef.current.length

      productsRef.current.forEach((_, i) => {
        const el = itemRefs.current[i]
        const shadow = shadowRefs.current[i]
        const img = imgRefs.current[i]
        if (!el) return

        const fromOff = relativeOffset(i, from, n)
        const toOff = relativeOffset(i, to, n)
        const toPose = poseForOffset(toOff, poses)

        const wrapsAround =
          n > 2 && ((fromOff === -1 && toOff === 1) || (fromOff === 1 && toOff === -1))

        if (wrapsAround) {
          const exitPose = fromOff < 0 ? poses.offLeft : poses.offRight
          const enterPose = toOff < 0 ? poses.offLeft : poses.offRight
          const exitDur = isMobileRef.current ? 0.28 : 0.35
          const enterDur = isMobileRef.current ? 0.38 : 0.45

          const tl = gsap.timeline()
          tl.to(el, {
            xPercent: exitPose.xPercent,
            yPercent: -50,
            y: 0,
            scale: exitPose.scale,
            rotation: exitPose.rotation,
            opacity: 0,
            zIndex: 1,
            duration: exitDur,
            ease: 'power2.in',
          })
          if (img) {
            tl.to(
              img,
              { filter: `blur(${exitPose.blur}px)`, duration: exitDur, ease: 'power2.in' },
              0
            )
          }
          if (shadow) {
            tl.to(
              shadow,
              { opacity: 0, scaleX: 0.4, scaleY: 0.32, duration: exitDur, ease: 'power2.in' },
              0
            )
          }
          tl.add(() => {
            setPose(el, shadow, img, enterPose)
          })
          tl.to(el, {
            xPercent: toPose.xPercent,
            scale: toPose.scale,
            rotation: toPose.rotation,
            opacity: toPose.opacity,
            zIndex: toPose.zIndex,
            duration: enterDur,
            ease: 'power3.out',
          })
          if (img) {
            tl.to(
              img,
              { filter: `blur(${toPose.blur}px)`, duration: enterDur, ease: 'power3.out' },
              `-=${enterDur}`
            )
          }
          if (shadow) {
            tl.to(
              shadow,
              {
                opacity: toPose.shadowOpacity,
                scaleX: toPose.shadowScale,
                scaleY: toPose.shadowScale * 0.8,
                duration: enterDur,
                ease: 'power3.out',
              },
              `-=${enterDur}`
            )
          }
          return
        }

        applyPose(el, shadow, img, toPose, false)
      })
    },
    [applyPose, setPose]
  )

  const startFloat = useCallback(() => {
    if (!inViewRef.current || reducedMotion) return
    killFloat()

    const mobile = isMobileRef.current
    const n = productsRef.current.length

    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const offset = relativeOffset(i, currentIndexRef.current, n)
      if (Math.abs(offset) > 1) return

      const amplitude = mobile
        ? offset === 0
          ? 8
          : 5
        : offset === 0
          ? 14
          : 9
      const duration = offset === 0 ? 2.5 : 2.9 + i * 0.12
      const direction = offset === 0 ? -1 : offset < 0 ? 1 : -1

      const tween = gsap.to(el, {
        y: direction * amplitude,
        duration,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
      floatTweensRef.current.push(tween)
    })
  }, [killFloat, reducedMotion])

  const pauseFloat = useCallback(() => {
    floatTweensRef.current.forEach((t) => t.pause())
  }, [])

  const updateMeta = useCallback(
    (index: number) => {
      const list = productsRef.current
      const dataItem = list[index]
      if (!dataItem) return

      const brand = brandRef.current
      const detail = detailRef.current
      const seeMore = seeMoreRef.current
      if (!brand || !detail || !seeMore) return

      if (reducedMotion) {
        brand.textContent = dataItem.name
        detail.textContent = dataItem.detail
        seeMore.href = dataItem.href
        return
      }

      gsap
        .timeline()
        .to([brand, detail, seeMore], {
          y: 10,
          opacity: 0,
          duration: 0.18,
          stagger: 0.02,
          ease: 'power2.in',
        })
        .add(() => {
          brand.textContent = dataItem.name
          detail.textContent = dataItem.detail
          seeMore.href = dataItem.href
        })
        .set([brand, detail, seeMore], { y: -8 })
        .to([brand, detail, seeMore], {
          y: 0,
          opacity: 1,
          duration: 0.32,
          stagger: 0.04,
          ease: 'power3.out',
        })
    },
    [reducedMotion]
  )

  const goTo = useCallback(
    (nextIndex: number) => {
      const n = productsRef.current.length
      if (n <= 1 || isAnimatingRef.current) return
      const wrapped = wrapIndex(nextIndex, n)
      const from = currentIndexRef.current
      if (wrapped === from) return

      isAnimatingRef.current = true
      pauseFloat()
      killFloat()

      itemRefs.current.forEach((el) => {
        if (el) gsap.set(el, { y: 0 })
      })

      if (reducedMotion) {
        layoutToIndex(wrapped, true)
        currentIndexRef.current = wrapped
        setActiveIndex(wrapped)
        updateMeta(wrapped)
        isAnimatingRef.current = false
        startFloat()
        return
      }

      transitionToIndex(from, wrapped)
      updateMeta(wrapped)

      const settle = isMobileRef.current ? 0.7 : 0.85
      gsap.delayedCall(settle, () => {
        currentIndexRef.current = wrapped
        setActiveIndex(wrapped)
        isAnimatingRef.current = false
        startFloat()
      })
    },
    [
      killFloat,
      layoutToIndex,
      pauseFloat,
      reducedMotion,
      startFloat,
      transitionToIndex,
      updateMeta,
    ]
  )

  const goPrev = useCallback(() => {
    goTo(currentIndexRef.current - 1)
  }, [goTo])

  const goNext = useCallback(() => {
    goTo(currentIndexRef.current + 1)
  }, [goTo])

  useGSAP(
    () => {
      if (total === 0) return
      layoutToIndex(currentIndexRef.current, true)
      if (brandRef.current && products[0]) {
        brandRef.current.textContent = products[currentIndexRef.current]?.name || products[0].name
      }
      if (detailRef.current && products[0]) {
        detailRef.current.textContent =
          products[currentIndexRef.current]?.detail || products[0].detail
      }
    },
    { scope: sectionRef, dependencies: [layoutToIndex, isMobile, total, products] }
  )

  useGSAP(
    () => {
      const section = sectionRef.current
      const content = contentRef.current
      if (!section || !content || total === 0) return

      gsap.set(content, { opacity: 0, y: reducedMotion ? 0 : 20 })

      ScrollTrigger.create({
        trigger: section,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.to(content, {
            opacity: 1,
            y: 0,
            duration: reducedMotion ? 0.3 : 0.7,
            ease: 'power2.out',
            onComplete: () => {
              inViewRef.current = true
              startFloat()
            },
          })
        },
      })
    },
    { scope: sectionRef, dependencies: [reducedMotion, startFloat, total] }
  )

  useEffect(() => {
    const section = sectionRef.current
    if (!section || total === 0) return

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
  }, [goPrev, goNext, total])

  useEffect(() => {
    return () => {
      killFloat()
    }
  }, [killFloat])

  useEffect(() => {
    if (inViewRef.current && total > 0) {
      layoutToIndex(currentIndexRef.current, true)
      startFloat()
    }
  }, [isMobile, layoutToIndex, startFloat, total])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    let dragging = false
    let startX = 0
    let startY = 0
    let axis: 'x' | 'y' | null = null
    let moved = false
    let captured = false
    let tapLink: HTMLAnchorElement | null = null

    const threshold = () => (isMobileRef.current ? 36 : 48)

    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return
      dragging = true
      moved = false
      axis = null
      captured = false
      suppressClickRef.current = false
      tapLink = (e.target as HTMLElement).closest('a[data-featured-product]')
      startX = e.clientX
      startY = e.clientY
      // Do NOT capture yet — capturing kills the following click on the product link
    }

    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY

      if (!axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }

      if (axis === 'x') {
        moved = Math.abs(dx) > 20
        e.preventDefault()
        if (!captured && total > 1) {
          captured = true
          try {
            stage.setPointerCapture(e.pointerId)
          } catch {
            /* ignore */
          }
        }
      }
    }

    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      const dx = e.clientX - startX
      if (captured) {
        try {
          stage.releasePointerCapture(e.pointerId)
        } catch {
          /* already released */
        }
      }

      const isSwipe =
        total > 1 && axis === 'x' && moved && Math.abs(dx) >= threshold()

      if (isSwipe) {
        suppressClickRef.current = true
        if (dx < 0) goNext()
        else goPrev()
        tapLink = null
        axis = null
        return
      }

      // Tap (not a swipe) on a product image → navigate
      if (tapLink) {
        const href = tapLink.getAttribute('href')
        if (href) {
          suppressClickRef.current = true
          router.push(href)
        }
      }
      tapLink = null
      axis = null
    }

    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove, { passive: false })
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onUp)

    return () => {
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
    }
  }, [goNext, goPrev, total, router])

  const product = products[activeIndex] || products[0]

  if (isLoading) {
    return (
      <section
        id="bestsellers"
        className="relative flex min-h-[320px] items-center justify-center overflow-hidden px-3 py-16 text-neutral-900 sm:min-h-[420px]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 55% at 50% 40%, rgba(255,255,255,0.97) 0%, transparent 68%),
            linear-gradient(180deg, #fafafa 0%, #f2f2f2 45%, #ebebeb 68%, #e0e0e0 100%)
          `,
        }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </section>
    )
  }

  // Always have FALLBACK_PRODUCTS — empty state should never show
  if (total === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      id="bestsellers"
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Featured products. Swipe or use the dots to browse on mobile; arrow buttons on larger screens."
      className="relative overflow-hidden px-3 py-10 text-neutral-900 outline-none [contain:paint] focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-4 sm:py-14 md:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 55% at 50% 40%, rgba(255,255,255,0.97) 0%, transparent 68%),
            linear-gradient(180deg, #fafafa 0%, #f2f2f2 45%, #ebebeb 68%, #e0e0e0 100%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-[55%] h-[45%]"
        aria-hidden
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.035) 20%, rgba(0,0,0,0.07) 100%)',
        }}
      />

      <div ref={contentRef} className="container relative z-10 mx-auto max-w-6xl">
        <header className="mb-1 text-center sm:mb-2 md:mb-3">
          <p className="font-nike mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-neutral-500 sm:mb-2 sm:text-[0.65rem]">
            Curated picks
          </p>
          <h2
            id="featured-products-heading"
            className="font-nike-display text-xl uppercase tracking-[0.04em] text-black sm:text-3xl md:text-5xl"
          >
            Shop the Drop
          </h2>
        </header>

        <div
          ref={stageRef}
          className="relative mx-auto mt-0 flex h-[250px] w-full max-w-5xl cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing sm:h-[380px] md:h-[460px] lg:h-[500px]"
          role="region"
          aria-labelledby="featured-products-heading"
          style={{
            touchAction: 'pan-y',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous featured product"
                className="absolute left-0 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-neutral-900/80 bg-white/95 text-neutral-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:flex"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next featured product"
                className="absolute right-0 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-neutral-900/80 bg-white/95 text-neutral-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:flex"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </>
          )}

          <div className="relative h-full w-[62%] max-w-[200px] sm:w-[42%] sm:max-w-[280px] md:max-w-[340px] lg:max-w-[380px]">
            {products.map((p, i) => {
              const isActive = i === activeIndex
              return (
                <div
                  key={p.id}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  className="absolute left-1/2 top-[48%] w-full will-change-transform"
                  style={{ opacity: 0 }}
                  aria-hidden={!isActive}
                >
                  <div
                    ref={(el) => {
                      shadowRefs.current[i] = el
                    }}
                    aria-hidden
                    className="pointer-events-none absolute bottom-[-3%] left-1/2 z-0 h-[12%] w-[86%] -translate-x-1/2 rounded-[100%] sm:bottom-[-4%] sm:h-[14%] sm:w-[88%]"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 38%, rgba(0,0,0,0.08) 62%, transparent 78%)',
                      filter: isMobile ? 'blur(10px)' : 'blur(14px)',
                      transformOrigin: 'center center',
                    }}
                  />
                  <Link
                    href={p.href}
                    data-featured-product
                    aria-label={`View ${p.name}`}
                    tabIndex={isActive ? 0 : -1}
                    className="relative z-10 block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/50 focus-visible:ring-offset-2"
                    onClick={(e) => {
                      // Swipe / programmatic navigation already handled — avoid double nav
                      if (suppressClickRef.current) {
                        e.preventDefault()
                        suppressClickRef.current = false
                      }
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={(el) => {
                        imgRefs.current[i] = el
                      }}
                      src={p.image}
                      alt={isActive ? p.name : ''}
                      className="h-auto w-full select-none"
                      style={{ willChange: isActive ? 'filter' : 'auto' }}
                      draggable={false}
                      decoding="async"
                      loading={i === 0 ? 'eager' : 'lazy'}
                      sizes="(max-width: 639px) 52vw, (max-width: 767px) 280px, 380px"
                    />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative z-20 mt-1 flex flex-col items-center gap-1.5 px-2 text-center sm:mt-0 sm:gap-2 md:gap-3">
          <h3
            ref={brandRef}
            className="font-nike-display text-xl uppercase tracking-[0.06em] text-black sm:text-3xl md:text-4xl"
          >
            {product.name}
          </h3>
          <p
            ref={detailRef}
            className="font-nike max-w-[18rem] text-[0.7rem] leading-snug tracking-wide text-neutral-500 sm:max-w-none sm:text-sm"
          >
            {product.detail}
          </p>
          <Link
            ref={seeMoreRef}
            href={product.href}
            className="font-nike mt-1 inline-flex min-h-11 min-w-[8.5rem] items-center justify-center rounded-sm bg-neutral-400/90 px-7 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 active:bg-neutral-900 sm:min-h-10 sm:px-8 sm:py-2"
          >
            See More
          </Link>
        </div>

        <div className="mt-4 flex flex-col items-center gap-3 sm:mt-5">
          {total > 1 && (
            <div
              className="flex items-center gap-2 sm:hidden"
              role="tablist"
              aria-label="Featured product position"
            >
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-label={`Go to ${p.name}`}
                  aria-current={i === activeIndex ? 'true' : 'false'}
                  onClick={() => goTo(i)}
                  className="flex h-8 w-8 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                >
                  <span
                    className="block h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeIndex ? 22 : 8,
                      backgroundColor:
                        i === activeIndex ? '#0a0a0a' : 'rgba(0,0,0,0.22)',
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          <p
            className="hidden text-center font-nike text-xs uppercase tracking-[0.18em] text-neutral-400 sm:block"
            aria-live="polite"
          >
            {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
        </div>
      </div>
    </section>
  )
}
