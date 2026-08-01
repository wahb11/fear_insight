"use client"

import { useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, Mail, Phone, MessageCircle, ArrowRight, Instagram, Twitter } from "lucide-react"
import Link from "next/link"

const faqData = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        question: "How long does shipping take?",
        answer:
          "Standard shipping takes 5-7 business days, Express shipping takes 2-3 business days, and Overnight shipping takes 1 business day. All orders are processed within 1-2 business days.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Yes! We offer free standard shipping on all orders over $75. For orders under $75, standard shipping is $6.99.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Once your order ships, you'll receive a tracking number via email. You can use this to track your package in real-time.",
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we only ship within the United States. International shipping is coming soon - stay tuned!",
      },
    ],
  },
  {
    category: "Products & Sizing",
    questions: [
      {
        question: "How do I choose the right size?",
        answer:
          "We recommend checking our size guide on each product page. Our hoodies run true to size, but if you prefer a looser fit, consider sizing up. If you're between sizes, we suggest going with the larger size.",
      },
      {
        question: "What materials are your hoodies made from?",
        answer:
          "Our premium hoodies are made from a high-quality cotton blend (80% cotton, 20% polyester) for comfort, durability, and the perfect fit. All materials are ethically sourced.",
      },
      {
        question: "Are your designs printed or embroidered?",
        answer:
          "Our designs feature a combination of high-quality screen printing and embroidered details, depending on the specific design. This ensures longevity and maintains the premium feel of each piece.",
      },
      {
        question: "How should I care for my Fear Insight hoodie?",
        answer:
          "Machine wash cold with like colors, tumble dry low, and avoid bleach. Turn inside out before washing to preserve the design. Iron on low heat if needed, avoiding direct contact with printed areas.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy for unworn items in original condition with tags attached. Items must be unwashed and in original packaging.",
      },
      {
        question: "How do I return an item?",
        answer:
          "Contact us at info@fearinsight.com with your order number and reason for return. We'll provide you with a prepaid return label and instructions.",
      },
      {
        question: "Can I exchange for a different size?",
        answer:
          "Yes! We offer free exchanges within 30 days. Contact our customer service team, and we'll help you get the perfect fit.",
      },
      {
        question: "How long do refunds take?",
        answer:
          "Refunds are processed within 5-7 business days after we receive your return. You'll receive an email confirmation once the refund is processed.",
      },
    ],
  },
  {
    category: "Brand & Mission",
    questions: [
      {
        question: "What does 'DIRECTED BY GOD' mean?",
        answer:
          "Our tagline represents our core belief that we are guided by divine purpose in everything we do. It reflects our commitment to creating meaningful, purpose-driven streetwear that inspires faith and confidence.",
      },
      {
        question: "What is Fear Insight's mission?",
        answer:
          "Our mission is to inspire confidence and faith through premium streetwear that speaks to your soul. We believe fashion can be a powerful expression of one's spiritual journey and divine calling.",
      },
      {
        question: "Are you a faith-based company?",
        answer:
          "Yes, Fear Insight is founded on principles of faith, quality, and authenticity. While our designs appeal to everyone, our brand is rooted in spiritual values and divine inspiration.",
      },
      {
        question: "Do you give back to the community?",
        answer:
          "We regularly partner with local churches and community organizations to give back. A portion of our proceeds goes toward supporting youth programs and community outreach initiatives.",
      },
    ],
  },
]

export default function FAQPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [openItems, setOpenItems] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()

  const toggleItem = (id: string) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div ref={containerRef} className="bg-white text-neutral-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden pt-20 bg-neutral-50">
        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <HelpCircle className="w-16 h-16 text-neutral-900 mr-4" />
            <h1 className="text-5xl md:text-7xl font-black text-neutral-900">
              FAQ
            </h1>
          </motion.div>
          <motion.div
            className="w-24 h-1 bg-black mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.8 }}
          />
          <motion.p
            className="text-xl text-neutral-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Find answers to commonly asked questions about Fear Insight, our products, and policies.
          </motion.p>
        </motion.div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {faqData.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              className="mb-12"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-neutral-900 border-b border-neutral-200 pb-3">
                {category.category}
              </h2>

              <div className="space-y-4">
                {category.questions.map((faq, index) => {
                  const itemId = `${categoryIndex}-${index}`
                  const isOpen = openItems.includes(itemId)

                  return (
                    <Card key={index} className="bg-white border-neutral-200 overflow-hidden">
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full text-left p-6 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-neutral-900 pr-4">{faq.question}</h3>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-neutral-900 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-neutral-900 flex-shrink-0" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CardContent className="px-6 pb-6 pt-0">
                              <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4 text-neutral-900">Still Have Questions?</h2>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our customer service team is here to help you with any questions or
              concerns.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <Card className="bg-white border-neutral-200 hover:border-neutral-400 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Mail className="w-8 h-8 text-neutral-900 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-neutral-900">Email Support</h3>
                  <p className="text-neutral-600 text-sm mb-3">Get help via email</p>
                  <a
                    href="mailto:info@fearinsight.com"
                    className="text-neutral-900 hover:text-black text-sm font-semibold"
                  >
                    info@fearinsight.com
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-white border-neutral-200 hover:border-neutral-400 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="w-8 h-8 text-neutral-900 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-neutral-900">Live Chat</h3>
                  <p className="text-neutral-600 text-sm mb-3">Chat with us in real-time</p>
                  <span className="text-neutral-500 text-sm">Coming Soon</span>
                </CardContent>
              </Card>

              <Card className="bg-white border-neutral-200 hover:border-neutral-400 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Phone className="w-8 h-8 text-neutral-900 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-neutral-900">Phone Support</h3>
                  <p className="text-neutral-600 text-sm mb-3">Speak with our team</p>
                  <span className="text-neutral-500 text-sm">Coming Soon</span>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-black hover:bg-neutral-800 text-white group"
              >
                <a href="mailto:info@fearinsight.com" className="flex items-center">
                  Contact Support
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Link href="/shipping-returns">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-neutral-300 text-neutral-900 hover:bg-neutral-100 bg-white"
                >
                  Shipping & Returns
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
