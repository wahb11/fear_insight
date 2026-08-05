'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ChevronLeft, ChevronRight } from 'lucide-react'

gsap.registerPlugin(useGSAP)

type CategoryFace = {
  id: string
  title: string
  tag: string
  description: string
  href: string
  image: string
  placeholderLabel: string
}

const CATEGORIES: CategoryFace[] = [
  {
    id: 'signature',
    title: 'Signature',
    tag: 'CORE // ESSENTIALS',
    description: 'Foundational pieces built for everyday wear — clean silhouettes, lasting weight, quiet confidence.',
    href: '/signature',
    image: '/images/carousel-signature.jpg',
    placeholderLabel: 'PLACEHOLDER · Signature',
  },
  {
    id: 'fear',
    title: 'Fear',
    tag: 'STATEMENT // BOLD',
    description: 'High-impact designs that speak first — fearless graphics and presence you can feel.',
    href: '/fear',
    image: '/images/carousel-fear.jpg',
    placeholderLabel: 'PLACEHOLDER · Fear',
  },
  {
    id: 'oversize',
    title: 'Oversize',
    tag: 'VOLUME // RELAXED',
    description: 'Roomier cuts and heavier drape — streetwear scale without sacrificing structure.',
    href: '/oversize',
    image: '/images/carousel-oversize.jpg',
    placeholderLabel: 'PLACEHOLDER · Oversize',
  },
]

const TOTAL = CATEGORIES.length
const ANGLE_STEP = 360 / TOTAL
const FRICTION = 0.935
const DRAG_SENSITIVITY_DESKTOP = 0.42
const DRAG_SENSITIVITY_MOBILE = 0.55
const VELOCITY_BLEND = 0.28
const SNAP_STRENGTH = 0.16
const SNAP_THRESHOLD = 0.08
const INERTIA_BOOST = 1.35

const PANEL_W_DESKTOP = 260
const PANEL_H_DESKTOP = 310
const PANEL_W_MOBILE = 170
const PANEL_H_MOBILE = 210

const SPREAD_DESKTOP = 195
const SPREAD_MOBILE = 125
const YAW = 46
const DEPTH = 110

/**
 * Cover-flow category carousel.
 * Drag + arrow buttons + keyboard — page wheel/scroll is never captured.
 */
export default function CategoryCarousel() {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const faceRefs = useRef<(HTMLButtonElement | null)[]>([])
  const tagRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const indexRef = useRef<HTMLSpanElement>(null)
  const miniBarRefs = useRef<(HTMLButtonElement | null)[]>([])

  const currentRotation = useRef(0)
  const currentVelocity = useRef(0)
  const targetVelocity = useRef(0)
  const activeIndex = useRef(0)
  const rafId = useRef(0)
  const reducedMotion = useRef(false)
  const spreadRef = useRef(SPREAD_DESKTOP)
  const isDragging = useRef(false)
  const dragMoved = useRef(false)
  const dragStartX = useRef(0)
  const lastMoveX = useRef(0)
  const lastMoveTime = useRef(0)
  const pointerId = useRef<number | null>(null)
  const suppressClickUntil = useRef(0)
  const sensitivityRef = useRef(DRAG_SENSITIVITY_DESKTOP)

  const [index, setIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [imgReady, setImgReady] = useState<Record<string, boolean>>({})

  const panelW = isMobile ? PANEL_W_MOBILE : PANEL_W_DESKTOP
  const panelH = isMobile ? PANEL_H_MOBILE : PANEL_H_DESKTOP

  useEffect(() => {
    CATEGORIES.forEach((cat) => {
      const img = new window.Image()
      img.onload = () => setImgReady((prev) => ({ ...prev, [cat.id]: true }))
      img.src = cat.image
    })
  }, [])

  const updateContent = useCallback((nextIndex: number) => {
    const cat = CATEGORIES[nextIndex]
    if (!cat) return

    const targets = [tagRef.current, titleRef.current, descRef.current].filter(Boolean)

    const applyCopy = () => {
      if (tagRef.current) tagRef.current.textContent = cat.tag
      if (titleRef.current) titleRef.current.textContent = cat.title
      if (descRef.current) descRef.current.textContent = cat.description
      if (indexRef.current) indexRef.current.textContent = String(nextIndex + 1).padStart(2, '0')

      miniBarRefs.current.forEach((bar, i) => {
        if (!bar) return
        const active = i === nextIndex
        bar.style.backgroundColor = active ? '#0a0a0a' : 'rgba(0,0,0,0.15)'
        bar.style.width = active ? '36px' : '20px'
        bar.setAttribute('aria-current', active ? 'true' : 'false')
      })
    }

    if (reducedMotion.current || targets.length === 0) {
      applyCopy()
      setIndex(nextIndex)
      return
    }

    gsap
      .timeline()
      .to(targets, { opacity: 0, y: 10, duration: 0.1, stagger: 0.02, ease: 'power2.in' })
      .call(() => {
        applyCopy()
        setIndex(nextIndex)
      })
      .to(targets, { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: 'power3.out' })
  }, [])

  const navigateBy = useCallback((direction: number) => {
    targetVelocity.current -= direction * ANGLE_STEP
  }, [])

  const goToIndex = useCallback((targetIndex: number) => {
    const current = activeIndex.current
    let diff = targetIndex - current
    if (diff > TOTAL / 2) diff -= TOTAL
    if (diff < -TOTAL / 2) diff += TOTAL
    targetVelocity.current -= diff * ANGLE_STEP
  }, [])

  const openActiveCategory = useCallback(() => {
    const cat = CATEGORIES[activeIndex.current]
    if (cat) router.push(cat.href)
  }, [router])

  const handleFaceClick = useCallback(
    (faceIndex: number) => {
      if (Date.now() < suppressClickUntil.current) return
      if (faceIndex === activeIndex.current) {
        openActiveCategory()
      } else {
        goToIndex(faceIndex)
      }
    },
    [goToIndex, openActiveCategory]
  )

  const relativeOffset = (faceIndex: number, rotationDeg: number) => {
    let normalized = -rotationDeg % 360
    if (normalized < 0) normalized += 360
    const continuous = normalized / ANGLE_STEP
    let offset = faceIndex - continuous
    while (offset > TOTAL / 2) offset -= TOTAL
    while (offset < -TOTAL / 2) offset += TOTAL
    return offset
  }

  const applyFaceTransforms = (rotationDeg: number) => {
    const spread = spreadRef.current
    faceRefs.current.forEach((face, i) => {
      if (!face) return
      const offset = relativeOffset(i, rotationDeg)
      const abs = Math.abs(offset)

      if (abs > 1.55) {
        face.style.opacity = '0'
        face.style.pointerEvents = 'none'
        face.style.transform = `translate(-50%, -50%) translateX(${offset * spread}px) translateZ(${-DEPTH * 2}px) rotateY(${-offset * YAW}deg) scale(0.85)`
        return
      }

      const x = offset * spread
      const rotY = -offset * YAW
      const z = -Math.min(abs, 1) * DEPTH
      const scale = 1 - Math.min(abs, 1) * 0.12
      const opacity = 1 - Math.min(abs, 1) * 0.18

      face.style.opacity = String(opacity)
      face.style.pointerEvents = 'auto'
      face.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`
      face.style.zIndex = String(Math.round(100 - abs * 40))
    })
  }

  useGSAP(() => {
    updateContent(0)
  }, { scope: sectionRef })

  useEffect(() => {
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqMobile = window.matchMedia('(max-width: 767px)')

    const syncMotion = () => {
      reducedMotion.current = mqMotion.matches
    }
    const syncMobile = () => {
      const mobile = mqMobile.matches
      setIsMobile(mobile)
      spreadRef.current = mobile ? SPREAD_MOBILE : SPREAD_DESKTOP
      sensitivityRef.current = mobile ? DRAG_SENSITIVITY_MOBILE : DRAG_SENSITIVITY_DESKTOP
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

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateBy(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateBy(1)
      } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === section) {
        e.preventDefault()
        openActiveCategory()
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('[data-carousel-chrome]')) return
      isDragging.current = true
      dragMoved.current = false
      dragStartX.current = e.clientX
      lastMoveX.current = e.clientX
      lastMoveTime.current = performance.now()
      pointerId.current = e.pointerId
      currentVelocity.current = 0
      targetVelocity.current = 0
      stage.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const now = performance.now()
      const deltaX = e.clientX - lastMoveX.current
      const dt = Math.max(now - lastMoveTime.current, 1)

      if (Math.abs(e.clientX - dragStartX.current) > 4) dragMoved.current = true

      // Direct 1:1 tracking while dragging — feels immediate on touch
      const sensitivity = sensitivityRef.current
      currentRotation.current += deltaX * sensitivity

      // Instantaneous velocity for release inertia (deg per frame-ish)
      const instant = (deltaX * sensitivity) * (16.67 / dt)
      currentVelocity.current = currentVelocity.current * (1 - VELOCITY_BLEND) + instant * VELOCITY_BLEND
      targetVelocity.current = currentVelocity.current

      lastMoveX.current = e.clientX
      lastMoveTime.current = now

      if (dragMoved.current && Math.abs(deltaX) > Math.abs(e.movementY ?? 0)) {
        e.preventDefault()
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (pointerId.current !== null && e.pointerId === pointerId.current) {
        if (dragMoved.current) suppressClickUntil.current = Date.now() + 280
        // Boost leftover velocity into coasting inertia
        targetVelocity.current = currentVelocity.current * INERTIA_BOOST
        isDragging.current = false
        pointerId.current = null
        try {
          stage.releasePointerCapture(e.pointerId)
        } catch {
          /* already released */
        }
      }
    }

    const loop = () => {
      if (!isDragging.current) {
        currentVelocity.current += (targetVelocity.current - currentVelocity.current) * VELOCITY_BLEND
        currentRotation.current += currentVelocity.current
        targetVelocity.current *= FRICTION
        currentVelocity.current *= FRICTION

        if (
          Math.abs(currentVelocity.current) < SNAP_THRESHOLD &&
          Math.abs(targetVelocity.current) < SNAP_THRESHOLD
        ) {
          let normalized = -currentRotation.current % 360
          if (normalized < 0) normalized += 360
          const nearest = Math.round(normalized / ANGLE_STEP) * ANGLE_STEP
          let delta = nearest - normalized
          if (delta > 180) delta -= 360
          if (delta < -180) delta += 360
          if (Math.abs(delta) > 0.12) {
            currentRotation.current -= delta * SNAP_STRENGTH
          } else {
            currentRotation.current = -nearest
            currentVelocity.current = 0
            targetVelocity.current = 0
          }
        }
      }

      applyFaceTransforms(currentRotation.current)

      let normalizedRotation = -currentRotation.current % 360
      if (normalizedRotation < 0) normalizedRotation += 360
      const computedIndex = Math.round(normalizedRotation / ANGLE_STEP) % TOTAL

      if (computedIndex !== activeIndex.current) {
        activeIndex.current = computedIndex
        updateContent(computedIndex)
      }

      rafId.current = requestAnimationFrame(loop)
    }

    applyFaceTransforms(0)
    section.addEventListener('keydown', onKeyDown)
    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove, { passive: false })
    stage.addEventListener('pointerup', onPointerUp)
    stage.addEventListener('pointercancel', onPointerUp)
    stage.addEventListener('lostpointercapture', onPointerUp)
    rafId.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId.current)
      section.removeEventListener('keydown', onKeyDown)
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', onPointerUp)
      stage.removeEventListener('pointercancel', onPointerUp)
      stage.removeEventListener('lostpointercapture', onPointerUp)
    }
  }, [navigateBy, openActiveCategory, updateContent])

  const active = CATEGORIES[index]

  return (
    <section
      id="about"
      ref={sectionRef}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Product categories carousel. Drag, use arrow buttons, or keyboard arrows to change category."
      className="category-carousel relative flex flex-col justify-center bg-white text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      style={{
        minHeight: 'calc(100svh - 6.75rem)',
        maxHeight: 'calc(100svh - 6.75rem)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 50% 35%, rgba(0,0,0,0.03), transparent 55%),
            linear-gradient(180deg, #ffffff 0%, #f7f7f7 55%, #ffffff 100%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-5 md:px-8 md:py-6">
        <header
          data-carousel-chrome
          className="mb-3 flex shrink-0 items-end justify-between gap-4 md:mb-4"
        >
          <div>
            <p className="font-nike mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Shop by category
            </p>
            <h2 className="font-nike-display text-2xl uppercase tracking-[0.04em] text-black md:text-4xl">
              Categories
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <p className="font-nike-display hidden text-lg tracking-widest text-neutral-400 sm:block" aria-live="polite">
              <span ref={indexRef} className="text-black">
                01
              </span>
              <span className="mx-1">/</span>
              <span>0{TOTAL}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigateBy(-1)}
                aria-label="Previous category"
                className="flex h-10 w-10 items-center justify-center border border-neutral-900 bg-white text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => navigateBy(1)}
                aria-label="Next category"
                className="flex h-10 w-10 items-center justify-center border border-neutral-900 bg-white text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <div
          ref={stageRef}
          className="relative mx-auto min-h-0 w-full flex-1 cursor-grab touch-pan-y select-none active:cursor-grabbing"
          style={{
            perspective: isMobile ? '800px' : '1100px',
            perspectiveOrigin: '50% 50%',
            maxHeight: panelH + 48,
            touchAction: 'pan-y',
          }}
        >
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {CATEGORIES.map((cat, i) => {
              const isActive = i === index
              return (
                <button
                  key={cat.id}
                  type="button"
                  ref={(el) => {
                    faceRefs.current[i] = el
                  }}
                  aria-label={`${cat.title} category. ${isActive ? 'Open category page' : 'Bring to front'}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => handleFaceClick(i)}
                  className="absolute left-1/2 top-1/2 border border-neutral-200 bg-neutral-100 text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                  style={{
                    width: panelW,
                    height: panelH,
                    margin: 0,
                    borderRadius: 2,
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'center center',
                    willChange: 'transform, opacity',
                    boxShadow: '0 18px 36px rgba(0,0,0,0.14)',
                  }}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-[1px]">
                    {imgReady[cat.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.image}
                        alt=""
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300 px-4">
                        <span className="font-nike-display text-xl uppercase tracking-wider text-neutral-800">
                          {cat.title}
                        </span>
                        <span className="font-nike text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500">
                          {cat.placeholderLabel}
                        </span>
                      </span>
                    )}
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />
                    <span
                      className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-200"
                      style={{ opacity: isActive ? 0 : 0.28 }}
                    />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div
          data-carousel-chrome
          className="mt-3 flex shrink-0 flex-col gap-3 sm:mt-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="min-w-0 max-w-xl">
            <p
              ref={tagRef}
              className="font-nike mb-1.5 inline-block border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-neutral-700"
            >
              {CATEGORIES[0].tag}
            </p>
            <h3
              ref={titleRef}
              className="font-nike-display mb-1 text-3xl uppercase leading-none tracking-[0.04em] text-black md:text-5xl"
            >
              {CATEGORIES[0].title}
            </h3>
            <p
              ref={descRef}
              className="font-nike line-clamp-2 max-w-md text-xs leading-relaxed text-neutral-600 md:text-sm"
            >
              {CATEGORIES[0].description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
            <button
              type="button"
              onClick={openActiveCategory}
              className="font-nike inline-flex items-center border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              Shop {active?.title ?? 'category'}
            </button>

            <div className="flex gap-2" role="tablist" aria-label="Category position">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  ref={(el) => {
                    miniBarRefs.current[i] = el
                  }}
                  aria-label={`Go to ${cat.title}`}
                  aria-current={i === index ? 'true' : 'false'}
                  onClick={() => goToIndex(i)}
                  className="h-1.5 -skew-x-12 rounded-sm border border-black/10 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                  style={{
                    width: i === index ? 36 : 20,
                    backgroundColor: i === index ? '#0a0a0a' : 'rgba(0,0,0,0.15)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
