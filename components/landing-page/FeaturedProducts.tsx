'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight } from 'lucide-react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Featured products — one look per category.
 * Images: /public/images/slider1–3.png
 */
const PRODUCTS = [
  {
    category: 'Fear',
    name: 'Fear Hoodie',
    detail: 'Statement weight · Fear collection',
    image: '/images/slider1.png',
    href: '/products?category=fear',
  },
  {
    category: 'Oversize',
    name: 'Oversize Hoodie',
    detail: 'Relaxed volume · Oversize collection',
    image: '/images/slider2.png',
    href: '/products?category=oversize',
  },
  {
    category: 'Signature',
    name: 'Signature Hoodie',
    detail: 'Everyday core · Signature collection',
    image: '/images/slider3.png',
    href: '/products?category=signature',
  },
] as const

const TOTAL = PRODUCTS.length

/**
 * Poses use xPercent relative to item width, with left:50% anchoring.
 * -50 centers the item; side offsets slide it into the blurred wings.
 */
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

const CENTER: SlotPose = {
  xPercent: -50,
  scale: 1,
  blur: 0,
  opacity: 1,
  rotation: 0,
  zIndex: 20,
  shadowOpacity: 0.7,
  shadowScale: 1,
}

const LEFT: SlotPose = {
  xPercent: -128,
  scale: 0.55,
  blur: 12,
  opacity: 0.75,
  rotation: 0, // upright — no tilt on side hoodies
  zIndex: 5,
  shadowOpacity: 0.45,
  shadowScale: 0.72,
}

const RIGHT: SlotPose = {
  xPercent: 28,
  scale: 0.55,
  blur: 12,
  opacity: 0.75,
  rotation: 0, // upright — no tilt on side hoodies
  zIndex: 5,
  shadowOpacity: 0.45,
  shadowScale: 0.72,
}

const OFF_LEFT: SlotPose = {
  xPercent: -180,
  scale: 0.38,
  blur: 18,
  opacity: 0,
  rotation: 0,
  zIndex: 1,
  shadowOpacity: 0,
  shadowScale: 0.4,
}

const OFF_RIGHT: SlotPose = {
  xPercent: 80,
  scale: 0.38,
  blur: 18,
  opacity: 0,
  rotation: 0,
  zIndex: 1,
  shadowOpacity: 0,
  shadowScale: 0.4,
}

function wrapIndex(i: number) {
  return ((i % TOTAL) + TOTAL) % TOTAL
}

function relativeOffset(productIndex: number, activeIndex: number) {
  let offset = productIndex - activeIndex
  while (offset > TOTAL / 2) offset -= TOTAL
  while (offset < -TOTAL / 2) offset += TOTAL
  return offset
}

function poseForOffset(offset: number): SlotPose {
  if (offset === 0) return CENTER
  if (offset === -1) return LEFT
  if (offset === 1) return RIGHT
  return offset < 0 ? OFF_LEFT : OFF_RIGHT
}

/**
 * Studio coverflow — center sharp & floating, sides blurred with soft floor shadows.
 * Products slide into focus (no fade-swap).
 */
export default function FeaturedProducts() {
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

  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

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
      const duration = immediate ? 0 : 0.8
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

  /** Instant pose (no tween) — used for wrap teleports */
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
      PRODUCTS.forEach((_, i) => {
        const el = itemRefs.current[i]
        const shadow = shadowRefs.current[i]
        const img = imgRefs.current[i]
        if (!el) return
        const offset = relativeOffset(i, active)
        applyPose(el, shadow, img, poseForOffset(offset), immediate)
      })
    },
    [applyPose]
  )

  /**
   * Animate to a new active index.
   * Adjacent slots slide normally; the wrapping side item exits off-stage,
   * teleports, then enters from the opposite wing (avoids crossing the center).
   */
  const transitionToIndex = useCallback(
    (from: number, to: number) => {
      PRODUCTS.forEach((_, i) => {
        const el = itemRefs.current[i]
        const shadow = shadowRefs.current[i]
        const img = imgRefs.current[i]
        if (!el) return

        const fromOff = relativeOffset(i, from)
        const toOff = relativeOffset(i, to)
        const toPose = poseForOffset(toOff)

        // Wrapping: e.g. LEFT → RIGHT when going next
        const wrapsAround =
          (fromOff === -1 && toOff === 1) || (fromOff === 1 && toOff === -1)

        if (wrapsAround) {
          const exitPose = fromOff < 0 ? OFF_LEFT : OFF_RIGHT
          const enterPose = toOff < 0 ? OFF_LEFT : OFF_RIGHT

          const tl = gsap.timeline()
          // Exit
          tl.to(el, {
            xPercent: exitPose.xPercent,
            yPercent: -50,
            y: 0,
            scale: exitPose.scale,
            rotation: exitPose.rotation,
            opacity: 0,
            zIndex: 1,
            duration: 0.35,
            ease: 'power2.in',
          })
          if (img) {
            tl.to(
              img,
              { filter: `blur(${exitPose.blur}px)`, duration: 0.35, ease: 'power2.in' },
              0
            )
          }
          if (shadow) {
            tl.to(
              shadow,
              { opacity: 0, scaleX: 0.4, scaleY: 0.32, duration: 0.35, ease: 'power2.in' },
              0
            )
          }
          // Teleport to opposite wing
          tl.add(() => {
            setPose(el, shadow, img, enterPose)
          })
          // Enter into target side slot
          tl.to(el, {
            xPercent: toPose.xPercent,
            scale: toPose.scale,
            rotation: toPose.rotation,
            opacity: toPose.opacity,
            zIndex: toPose.zIndex,
            duration: 0.45,
            ease: 'power3.out',
          })
          if (img) {
            tl.to(
              img,
              { filter: `blur(${toPose.blur}px)`, duration: 0.45, ease: 'power3.out' },
              '-=0.45'
            )
          }
          if (shadow) {
            tl.to(
              shadow,
              {
                opacity: toPose.shadowOpacity,
                scaleX: toPose.shadowScale,
                scaleY: toPose.shadowScale * 0.8,
                duration: 0.45,
                ease: 'power3.out',
              },
              '-=0.45'
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

    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const offset = relativeOffset(i, currentIndexRef.current)
      if (Math.abs(offset) > 1) return

      const amplitude = offset === 0 ? 14 : 9
      const duration = offset === 0 ? 2.5 : 2.9 + i * 0.12
      const direction = offset === 0 ? -1 : offset < 0 ? 1 : -1

      // Float via y (px) on top of yPercent centering — GSAP combines them
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
      const data = PRODUCTS[index]
      if (!data) return

      const brand = brandRef.current
      const detail = detailRef.current
      const seeMore = seeMoreRef.current
      if (!brand || !detail || !seeMore) return

      if (reducedMotion) {
        brand.textContent = data.name
        detail.textContent = data.detail
        seeMore.href = data.href
        return
      }

      gsap
        .timeline()
        .to([brand, detail, seeMore], {
          y: 14,
          opacity: 0,
          duration: 0.22,
          stagger: 0.03,
          ease: 'power2.in',
        })
        .add(() => {
          brand.textContent = data.name
          detail.textContent = data.detail
          seeMore.href = data.href
        })
        .set([brand, detail, seeMore], { y: -12 })
        .to([brand, detail, seeMore], {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power3.out',
        })
    },
    [reducedMotion]
  )

  const goTo = useCallback(
    (nextIndex: number) => {
      if (isAnimatingRef.current) return
      const wrapped = wrapIndex(nextIndex)
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

      gsap.delayedCall(0.85, () => {
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
      layoutToIndex(0, true)
    },
    { scope: sectionRef, dependencies: [layoutToIndex] }
  )

  useGSAP(
    () => {
      const section = sectionRef.current
      const content = contentRef.current
      if (!section || !content) return

      gsap.set(content, { opacity: 0, y: reducedMotion ? 0 : 28 })

      ScrollTrigger.create({
        trigger: section,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          gsap.to(content, {
            opacity: 1,
            y: 0,
            duration: reducedMotion ? 0.35 : 0.85,
            ease: 'power2.out',
            onComplete: () => {
              inViewRef.current = true
              startFloat()
            },
          })
        },
      })
    },
    { scope: sectionRef, dependencies: [reducedMotion, startFloat] }
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
      killFloat()
    }
  }, [killFloat])

  useEffect(() => {
    if (inViewRef.current) startFloat()
  }, [reducedMotion, startFloat])

  // Drag / swipe
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    let dragging = false
    let startX = 0
    let moved = false

    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) return
      dragging = true
      moved = false
      startX = e.clientX
      stage.setPointerCapture(e.pointerId)
    }

    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      if (Math.abs(e.clientX - startX) > 28) moved = true
    }

    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      const dx = e.clientX - startX
      try {
        stage.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
      if (!moved || Math.abs(dx) < 48) return
      if (dx < 0) goNext()
      else goPrev()
    }

    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onUp)

    return () => {
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
    }
  }, [goNext, goPrev])

  const product = PRODUCTS[activeIndex]

  return (
    <section
      ref={sectionRef}
      id="bestsellers"
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Featured products. Drag, use arrow buttons, or keyboard arrows to browse."
      className="relative overflow-hidden px-4 py-14 text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:py-20"
    >
      {/* Studio atmosphere — soft wall → floor */}
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
        <header className="mb-2 text-center md:mb-3">
          <p className="font-nike mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            Curated picks
          </p>
          <h2
            id="featured-products-heading"
            className="font-nike-display text-2xl uppercase tracking-[0.04em] text-black sm:text-3xl md:text-5xl"
          >
            Shop the Drop
          </h2>
        </header>

        <div
          ref={stageRef}
          className="relative mx-auto mt-1 flex h-[300px] w-full max-w-5xl cursor-grab touch-pan-y items-center justify-center active:cursor-grabbing sm:h-[380px] md:h-[460px] lg:h-[500px]"
          role="region"
          aria-labelledby="featured-products-heading"
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous featured product"
            className="absolute left-0 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-neutral-900/80 bg-white/90 text-neutral-900 backdrop-blur-sm transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next featured product"
            className="absolute right-0 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-neutral-900/80 bg-white/90 text-neutral-900 backdrop-blur-sm transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          {/*
            Stage track: items are positioned from left:50% / top:48%.
            GSAP owns xPercent (centered at -50), yPercent (-50), scale, rotation, opacity.
          */}
          <div className="relative h-full w-[58%] max-w-[200px] sm:w-[42%] sm:max-w-[280px] md:max-w-[340px] lg:max-w-[380px]">
            {PRODUCTS.map((p, i) => {
              const isActive = i === activeIndex
              return (
                <div
                  key={p.category}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  className="absolute left-1/2 top-[48%] w-full will-change-transform"
                  style={{ opacity: 0 }}
                  aria-hidden={!isActive}
                >
                  {/* Soft elliptical floor shadow under each hoodie */}
                  <div
                    ref={(el) => {
                      shadowRefs.current[i] = el
                    }}
                    aria-hidden
                    className="pointer-events-none absolute bottom-[-4%] left-1/2 z-0 h-[14%] w-[88%] -translate-x-1/2 rounded-[100%]"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 38%, rgba(0,0,0,0.08) 62%, transparent 78%)',
                      filter: 'blur(14px)',
                      transformOrigin: 'center center',
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={(el) => {
                      imgRefs.current[i] = el
                    }}
                    src={p.image}
                    alt={isActive ? `${p.name} — Fear Insight ${p.category} collection` : ''}
                    className="relative z-10 h-auto w-full select-none"
                    style={{
                      willChange: 'filter',
                    }}
                    draggable={false}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative z-20 -mt-2 flex flex-col items-center gap-2 text-center sm:mt-0 md:gap-3">
          <h3
            ref={brandRef}
            className="font-nike-display text-2xl uppercase tracking-[0.06em] text-black sm:text-3xl md:text-4xl"
          >
            {product.name}
          </h3>
          <p
            ref={detailRef}
            className="font-nike text-xs tracking-wide text-neutral-500 sm:text-sm"
          >
            {product.detail}
          </p>
          <Link
            ref={seeMoreRef}
            href={product.href}
            className="font-nike mt-1 inline-flex min-h-9 items-center justify-center rounded-sm bg-neutral-400/90 px-7 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:min-h-10 sm:px-8"
          >
            See More
          </Link>
        </div>

        <p
          className="mt-5 text-center font-nike text-xs uppercase tracking-[0.18em] text-neutral-400"
          aria-live="polite"
        >
          {String(activeIndex + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
        </p>
      </div>
    </section>
  )
}
