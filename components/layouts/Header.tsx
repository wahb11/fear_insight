'use client'
import React, { useState } from 'react'
import {  ShoppingBag} from "lucide-react"

import { motion, useScroll, useTransform,  useAnimation } from "framer-motion"
import { useCart } from '@/app/context/CartContext'
import Link from 'next/link'

export default function Header() {
      const [isMenuOpen, setIsMenuOpen] = useState(false)
        const { items, addToCart } = useCart()
        const cartButtonControls = useAnimation()
  return (
     <motion.nav
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="fixed top-0 w-full z-50 bg-stone-950/90 border-b border-stone-800 backdrop-blur-md"
             style={{ willChange: "opacity" }}
           >
             <div className="container mx-auto px-4 py-4 flex justify-between items-center">
               {/* Hamburger Menu Button with Animation */}
               <motion.button
                 onClick={() => setIsMenuOpen(!isMenuOpen)}
                 className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-stone-800 transition-colors duration-200 group"
               >
                 <div className="w-6 h-5 flex flex-col justify-between items-center cursor-pointer">
                   <motion.div
                     className="w-full h-0.5 bg-stone-100 rounded-full"
                     animate={{
                       rotate: isMenuOpen ? 45 : 0,
                       y: isMenuOpen ? 9 : 0,
                     }}
                     transition={{ duration: 0.3 }}
                   />
                   <motion.div
                     className="w-full h-0.5 bg-stone-100 rounded-full"
                     animate={{
                       opacity: isMenuOpen ? 0 : 1,
                       x: isMenuOpen ? 10 : 0,
                     }}
                     transition={{ duration: 0.3 }}
                   />
                   <motion.div
                     className="w-full h-0.5 bg-stone-100 rounded-full"
                     animate={{
                       rotate: isMenuOpen ? -45 : 0,
                       y: isMenuOpen ? -9 : 0,
                     }}
                     transition={{ duration: 0.3 }}
                   />
                 </div>
               </motion.button>
   
               {/* Logo Text in Center */}
               <motion.div
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 transition={{ duration: 0.2 }}
                 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent"
               >
                 FEAR INSIGHT
               </motion.div>
   
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
                 {["Home", "Products", "About", "Contact"].map((item) => (
                   <motion.a
                     key={item}
                     href={item === "Products" ? "/products" : item === "Home" ? `/` : `#${item.toLowerCase()}`}
                     onClick={() => setIsMenuOpen(false)}
                     className="text-stone-100 hover:text-stone-300 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-stone-800"
                     whileHover={{ x: 10 }}
                   >
                     {item}
                   </motion.a>
                 ))}
               </div>
             </motion.div>
           </motion.nav>
  )
}
