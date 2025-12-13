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
      className="fixed top-0 w-full z-50 bg-black border-b border-stone-800 backdrop-blur-md"
      style={{ willChange: "opacity" }}
    >
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between w-full">
          {/* Left: Hamburger (Mobile) / Logo (Desktop) */}
          <div className="flex items-center flex-shrink-0 w-1/3">
            {/* Hamburger Menu Button - Mobile Only */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg hover:bg-stone-800 transition-colors duration-200 group"
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center cursor-pointer">
                <motion.div
                  className="w-full h-0.5 bg-stone-100 rounded-full"
                  animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 8 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="w-full h-0.5 bg-stone-100 rounded-full"
                  animate={{ opacity: isMenuOpen ? 0 : 1, x: isMenuOpen ? 10 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="w-full h-0.5 bg-stone-100 rounded-full"
                  animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -8 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.button>
            
            {/* Logo - Desktop Only (Left) */}
            <Link href="/" className="hidden md:block flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-bold text-white cursor-pointer tracking-wide"
              >
                FEAR INSIGHT
              </motion.div>
            </Link>
          </div>

          {/* Center: Logo (Mobile) / Navigation (Desktop) */}
          <div className="flex items-center justify-center flex-1 w-1/3">
            {/* Logo - Mobile Only (Centered) */}
            <Link href="/" className="md:hidden flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold text-white cursor-pointer"
              >
                FEAR INSIGHT
              </motion.div>
            </Link>
            
            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center space-x-10 lg:space-x-12">
              {["Home", "Products", "About", "Contact"].map((item) => (
                <a
                  key={item}
                  href={item === "Home" ? "/" : item === "Products" ? "/products" : `#${item.toLowerCase()}`}
                  onClick={(e) => handleNavClick(item, e)}
                  className="text-white hover:text-stone-300 transition-colors duration-200 text-base font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
                >
                  {item.toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Cart Button */}
          <div className="flex items-center justify-end flex-shrink-0 w-1/3">
            <Link href="/cart">
              <motion.button
                animate={cartButtonControls}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-lg hover:bg-stone-800/80 transition-all duration-200 relative group"
              >
                <ShoppingBag className="w-6 h-6 text-white group-hover:text-stone-50 transition-colors" strokeWidth={2} />
                {items.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                  >
                    {items.length}
                  </motion.span>
                )}
              </motion.button>
            </Link>
          </div>
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
                className="text-white hover:text-stone-300 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-stone-800 text-left w-full font-medium"
              >
                <motion.span whileHover={{ x: 10 }} className="uppercase tracking-wide">
                  {item}
                </motion.span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.nav>
  )
}
