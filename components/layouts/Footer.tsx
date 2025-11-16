'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from "framer-motion"
import { Instagram, Mail} from "lucide-react"

// TikTok icon component since lucide-react may not have it
const TikTokIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v12.7a2.85 2.85 0 0 1-2.85 2.92 2.85 2.85 0 0 1-2.85-2.92 2.88 2.88 0 0 1 5.13-1.01v-3.7a6.47 6.47 0 0 0-6.85 6.67 6.56 6.56 0 0 0 6.61 6.61 6.52 6.52 0 0 0 6.56-6.4V9.5a8.25 8.25 0 0 0 3.77 1.04v-3.68a4.58 4.58 0 0 1-.96-.1z"></path>
  </svg>
)

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    
    if (href.startsWith('#')) {
      const id = href.replace('#', '')
      
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
      <footer id="contact" className="py-12 px-4 bg-stone-950 border-t border-stone-800">
            <div className="container mx-auto">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-8"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, staggerChildren: 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="col-span-1 md:col-span-2"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-stone-100 to-stone-500 bg-clip-text text-transparent">
                    FEAR INSIGHT
                  </h3>
                  <p className="text-stone-400 mb-4 max-w-md">
                    DIRECTED BY GOD - Premium streetwear that speaks to your soul and inspires fearless faith. Every piece
                    is designed to empower your spiritual journey and express your divine purpose.
                  </p>
                  <div className="mb-4">
                    <p className="text-stone-300 mb-2">Get in touch:</p>
                    <a
                      href="mailto:wahbusman@fearinsight.com"
                      className="text-stone-100 hover:text-stone-300 transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      wahbusman@fearinsight.com
                    </a>
                  </div>
                  <div className="flex space-x-4">
                    {[
                      { Icon: Instagram, href: "https://www.instagram.com/fear_insight?igsh=MXV4dmtxMG0zbjJ3aQ==" },
                      { Icon: TikTokIcon, href: "https://www.tiktok.com/@fear_insight?_r=1&_t=ZS-91JlnRVRF9p" },
                      { Icon: Mail, href: "mailto:wahbusman@fearinsight.com" },
                    ].map((item, index) => (
                      <motion.a
                        key={index}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        href={item.href}
                        target={item.href.startsWith('http') ? "_blank" : undefined}
                        rel={item.href.startsWith('http') ? "noopener noreferrer" : undefined}
                        className="text-stone-400 hover:text-stone-300 transition-colors"
                      >
                        <item.Icon className="w-6 h-6" />
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
  
                {[
                  {
                    title: "Quick Links",
                    items: [
                      { name: "Home", href: "/" },
                      { name: "Products", href: "/products" },
                      { name: "About", href: "#about" },
                      { name: "Contact", href: "#contact" },
                    ],
                  },
                  {
                    title: "Support",
                    items: [
                      { name: "Size Guide", href: "/products" },
                      { name: "Shipping & Returns", href: "/shipping-returns" },
                      { name: "FAQ", href: "/faq" },
                      { name: "Contact Us", href: "#contact" },
                    ],
                  },
                ].map((section, sectionIndex) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: sectionIndex * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <h4 className="text-lg font-semibold mb-4 text-stone-100">{section.title}</h4>
                    <ul className="space-y-2 text-stone-400">
                      {section.items.map((item, itemIndex) => (
                        <motion.li
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: sectionIndex * 0.2 + itemIndex * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <motion.div whileHover={{ x: 5 }}>
                            {item.href.startsWith('#') ? (
                              <a
                                href={item.href}
                                onClick={(e) => handleAnchorClick(e, item.href)}
                                className="hover:text-stone-300 transition-colors cursor-pointer"
                              >
                                {item.name}
                              </a>
                            ) : (
                              <Link href={item.href} className="hover:text-stone-300 transition-colors">
                                {item.name}
                              </Link>
                            )}
                          </motion.div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </motion.div>
  
              <motion.div
                className="border-t border-stone-800 mt-8 pt-8 text-center text-stone-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <p>&copy; {new Date().getFullYear()} FEAR INSIGHT. All rights reserved. DIRECTED BY GOD.</p>
                <p className="mt-2 text-sm">Contact us: wahbusman@fearinsight.com</p>
              </motion.div>
            </div>
          </footer>
  )
}
