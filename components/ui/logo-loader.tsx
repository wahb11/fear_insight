'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LogoLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export function LogoLoader({ size = 'md', fullScreen = false }: LogoLoaderProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  }

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: {
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  }

  const rotateVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'linear' as const,
      },
    },
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center gap-4"
        >
          {/* Logo SVG with rotation */}
          <motion.div
            variants={rotateVariants}
            animate="animate"
            className={`${sizeClasses.lg} flex items-center justify-center`}
          >
            <svg
              viewBox="0 0 200 280"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Main vertical bar - left side (tall) */}
              <motion.rect
                x="60"
                y="50"
                width="40"
                height="180"
                fill="#f5f5f4"
                variants={itemVariants}
              />

              {/* Top horizontal bar */}
              <motion.rect
                x="60"
                y="50"
                width="80"
                height="40"
                fill="#f5f5f4"
                variants={itemVariants}
              />

              {/* Middle horizontal bar */}
              <motion.rect
                x="100"
                y="130"
                width="40"
                height="35"
                fill="#f5f5f4"
                variants={itemVariants}
              />

              {/* Bottom right vertical bar */}
              <motion.rect
                x="100"
                y="165"
                width="40"
                height="65"
                fill="#f5f5f4"
                variants={itemVariants}
              />
            </svg>
          </motion.div>

          {/* Pulsing dots */}
          <motion.div
            className="flex gap-2"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-stone-100"
                variants={{
                  initial: { y: 0, opacity: 0.5 },
                  animate: {
                    y: [-8, 0, -8],
                    opacity: [0.5, 1, 0.5],
                    transition: {
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                    },
                  },
                }}
              />
            ))}
          </motion.div>

          {/* Loading text */}
          <motion.p
            className="text-stone-300 text-sm font-medium tracking-widest uppercase"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            Loading
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // Inline loader (not fullscreen)
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        variants={rotateVariants}
        animate="animate"
        className={`${sizeClasses[size]} flex items-center justify-center`}
      >
        <svg
          viewBox="0 0 200 280"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main vertical bar - left side (tall) */}
          <motion.rect
            x="60"
            y="50"
            width="40"
            height="180"
            fill="#f5f5f4"
            variants={itemVariants}
          />

          {/* Top horizontal bar */}
          <motion.rect
            x="60"
            y="50"
            width="80"
            height="40"
            fill="#f5f5f4"
            variants={itemVariants}
          />

          {/* Middle horizontal bar */}
          <motion.rect
            x="100"
            y="130"
            width="40"
            height="35"
            fill="#f5f5f4"
            variants={itemVariants}
          />

          {/* Bottom right vertical bar */}
          <motion.rect
            x="100"
            y="165"
            width="40"
            height="65"
            fill="#f5f5f4"
            variants={itemVariants}
          />
        </svg>
      </motion.div>

      {/* Pulsing dots */}
      <motion.div
        className="flex gap-2"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-stone-100"
            variants={{
              initial: { y: 0, opacity: 0.5 },
              animate: {
                y: [-8, 0, -8],
                opacity: [0.5, 1, 0.5],
                transition: {
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                },
              },
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
