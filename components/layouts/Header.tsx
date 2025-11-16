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
    } else {
      // For anchor links (About, Contact)
      const id = item.toLowerCase()
      
      // If we're on the home page, just scroll
      if (pathname === '/') {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        // If we're on a different page, navigate to home with the anchor
        router.push(`/#${id}`)
        // Wait for page to load, then scroll
        setTimeout(() => {
          const element = document.getElementById(id)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }, 500)
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
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Hamburger Menu Button */}
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-stone-800 transition-colors duration-200 group"
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
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="text-xl md:text-2xl font-bold bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent cursor-pointer"
          >
            FEAR INSIGHT
          </motion.div>
        </Link>

        {/* Cart Button */}
        <Link href="/cart">
          <motion.button
            animate={cartButtonControls}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-stone-800 transition-colors duration-200 relative"
          >
            <ShoppingBag className="w-6 h-6 text-stone-100" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          </motion.button>
        </Link>
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
