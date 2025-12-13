'use client'
import React, { useState } from 'react'
import { ShoppingBag } from "lucide-react"
import { motion, useAnimation } from "framer-motion"
import { useCart } from '@/app/context/CartContext'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCart()
  const cartButtonControls = useAnimation()
  const router = useRouter()
  const pathname = usePathname()

  const handleNavClick = (item: string, e: React.MouseEvent) => {
    e.preventDefault()
    setIsMenuOpen(false)

    if (item === "Products") {
      router.push("/products")
    } else if (item === "Home") {
      router.push("/")
    } else if (item === "About" || item === "Contact") {
      // For anchor links (About, Contact)
      const id = item.toLowerCase()

      // Function to scroll to element
      const scrollToElement = () => {
        const element = document.getElementById(id)
        if (element) {
          // Add a small delay and ensure scrolling happens
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }

      // If we're on the home page, just scroll
      if (pathname === '/') {
        // Small delay to ensure DOM is ready
        setTimeout(scrollToElement, 100)
      } else {
        // If we're on a different page, navigate to home with the anchor
        router.push(`/#${id}`)
        // Wait longer for page to fully load, then scroll
        setTimeout(scrollToElement, 1000)
      }
    }
  }

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 w-full z-50 bg-stone-950/90 border-b border-stone-800 backdrop-blur-md"
      style={{ willChange: "opacity" }}
    >
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-5 flex items-center justify-between relative">
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-4 flex-1">
          {/* Hamburger Menu Button - Mobile Only */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-lg hover:bg-stone-800 transition-colors duration-200 group"
          >
            <div className="w-6 h-5 flex flex-col justify-between items-center cursor-pointer">
              <motion.div
                className="w-full h-0.5 bg-stone-100 rounded-full"
                animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 9 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="w-full h-0.5 bg-stone-100 rounded-full"
                animate={{ opacity: isMenuOpen ? 0 : 1, x: isMenuOpen ? 10 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="w-full h-0.5 bg-stone-100 rounded-full"
                animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -9 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-stone-100 via-stone-300 to-stone-400 bg-clip-text text-transparent cursor-pointer tracking-tight"
            >
              FEAR INSIGHT
            </motion.div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
          {["Home", "Products", "About", "Contact"].map((item) => (
            <a
              key={item}
              href={item === "Home" ? "/" : item === "Products" ? "/products" : `#${item.toLowerCase()}`}
              onClick={(e) => handleNavClick(item, e)}
              className="text-stone-300 hover:text-stone-100 transition-colors duration-200 text-sm font-semibold uppercase tracking-wider cursor-pointer"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right: Cart Button */}
        <div className="flex items-center justify-end flex-1">
          <Link href="/cart">
            <motion.button
              animate={cartButtonControls}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-lg hover:bg-stone-800/80 transition-all duration-200 relative group"
            >
              <ShoppingBag className="w-6 h-6 md:w-7 md:h-7 text-stone-100 group-hover:text-stone-50 transition-colors" />
              {items.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-stone-950"
                >
                  {items.length}
                </motion.span>
              )}
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isMenuOpen ? 1 : 0, height: isMenuOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden bg-stone-900/95 border-t border-stone-800"
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          {["Home", "Products", "About", "Contact"].map((item) => {
            return (
              <motion.button
                key={item}
                onClick={(e) => handleNavClick(item, e)}
                className="text-stone-100 hover:text-stone-300 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-stone-800 text-left w-full"
              >
                <motion.span whileHover={{ x: 10 }}>{item}</motion.span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.nav>
  )
}
