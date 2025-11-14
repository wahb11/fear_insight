'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from "framer-motion"
import { Instagram, Twitter, Mail} from "lucide-react"

export default function Footer() {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const id = href.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
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
                      { Icon: Instagram, href: "#" },
                      { Icon: Twitter, href: "#" },
                      { Icon: Mail, href: "mailto:wahbusman@fearinsight.com" },
                    ].map((item, index) => (
                      <motion.a
                        key={index}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        href={item.href}
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
