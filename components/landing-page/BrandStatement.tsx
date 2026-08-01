'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** Quiet brand statement between the category carousel and journey banner. */
export default function BrandStatement() {
  const sectionRef = useRef<HTMLElement>(null)
  const statementRef = useRef<HTMLParagraphElement>(null)
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
      const statement = statementRef.current
      if (!section || !statement) return

      gsap.from(statement, {
        opacity: 0,
        y: reducedMotion ? 0 : 20,
        scale: reducedMotion ? 1 : 0.94,
        duration: reducedMotion ? 0.35 : 0.7,
        ease: 'power2.out',
        immediateRender: false,
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  )

  return (
    <section ref={sectionRef} aria-label="Directed by God" className="bg-white">
      <div className="flex items-center justify-center px-4 py-9 md:py-12 lg:py-14">
        <p
          ref={statementRef}
          className="text-center text-xl font-medium leading-none tracking-[0.09em] text-neutral-900 will-change-transform sm:text-3xl sm:tracking-[0.12em] md:text-4xl lg:text-5xl"
          style={{
            fontFamily: 'var(--font-editorial), "Times New Roman", serif',
          }}
        >
          DIRECTED BY GOD
        </p>
      </div>
    </section>
  )
}
