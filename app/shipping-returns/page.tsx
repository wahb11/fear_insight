"use client"
import { useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Truck, RotateCcw, Shield, Clock, MapPin, CreditCard, ArrowRight, Mail, Instagram, Twitter } from "lucide-react"
import Link from "next/link"
export default function ShippingReturnsPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div ref={containerRef} className="bg-stone-950 text-stone-100 overflow-hidden">


      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden pt-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-700/10 to-stone-900/10" />

        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-stone-100 via-stone-400 to-stone-600 bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{
              // Neutral subtle halo instead of green glow
              textShadow: "0 0 24px rgba(255, 255, 255, 0.06), 0 4px 8px rgba(0, 0, 0, 0.9)",
              filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.9))",
            }}
          >
            SHIPPING & RETURNS
          </motion.h1>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-stone-700 to-stone-900 mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.8 }}
          />
          <motion.p
            className="text-xl text-stone-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            style={{
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.9)",
              filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.9))",
            }}
          >
            We're committed to getting your Fear Insight pieces to you quickly and ensuring your complete satisfaction.
          </motion.p>
        </motion.div>
      </section>

      {/* Shipping Information */}
      <section className="py-16 px-4 bg-stone-900/20">
        <div className="container mx-auto">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-stone-900/50 backdrop-blur-sm border-stone-700 hover:border-stone-400/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-stone-100">
                    <Truck className="w-6 h-6 mr-3" />
                    SHIPPING INFORMATION
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-stone-50">Shipping Options</h3>
                    <div className="space-y-3 text-stone-200">
                      <div className="flex justify-between">
                        <span>Standard Shipping (5-7 business days)</span>
                        <span className="text-stone-50 font-semibold">FREE on orders $75+</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Express Shipping (2-3 business days)</span>
                        <span className="text-stone-50 font-semibold">$12.99</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overnight Shipping (1 business day)</span>
                        <span className="text-stone-50 font-semibold">$24.99</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-stone-50 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Processing Time
                    </h3>
                    <p className="text-stone-200">
                      Orders are processed within 1-2 business days. You'll receive a tracking number once your order
                      ships.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-stone-50 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Shipping Locations
                    </h3>
                    <p className="text-stone-200">
                      We currently ship within the United States. International shipping coming soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-stone-900/50 backdrop-blur-sm border-stone-700 hover:border-stone-400/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-stone-100">
                    <RotateCcw className="w-6 h-6 mr-3" />
                    RETURNS & EXCHANGES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-stone-50">Return Policy</h3>
                    <p className="text-stone-200 mb-3">
                      We offer a 30-day return policy for unworn items in original condition with tags attached.
                    </p>
                    <ul className="space-y-2 text-stone-200 text-sm">
                      <li>• Items must be unworn and unwashed</li>
                      <li>• Original tags must be attached</li>
                      <li>• Items must be in original packaging</li>
                      <li>• Return shipping is free for defective items</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-stone-50">Exchange Process</h3>
                    <p className="text-stone-200">
                      Need a different size? We offer free exchanges within 30 days. Contact us at{" "}
                      <a href="mailto:info@fearinsight.com" className="text-stone-50 hover:text-stone-100 font-semibold">
                        info@fearinsight.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-stone-50 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Refund Timeline
                    </h3>
                    <p className="text-stone-200">
                      Refunds are processed within 5-7 business days after we receive your return.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: "Secure Packaging",
                description: "All orders are carefully packaged to ensure your items arrive in perfect condition."
              },
              {
                icon: Truck,
                title: "Order Tracking",
                description: "Track your order every step of the way with real-time updates and notifications."
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                description: "Simple return process with prepaid labels for hassle-free exchanges and returns."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-stone-900/60 backdrop-blur-sm border-stone-600 hover:border-stone-400 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <item.icon className="w-12 h-12 text-stone-50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-stone-50">{item.title}</h3>
                    <p className="text-stone-200 text-sm">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-stone-900/50 to-stone-900/40">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4 text-stone-100">Need Help?</h2>
            <p className="text-xl text-stone-300 mb-8 max-w-2xl mx-auto">
              Have questions about shipping or returns? Our customer service team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50 group shadow-lg shadow-stone-900/25"
              >
                <a href="mailto:info@fearinsight.com" className="flex items-center">
                  Contact Support
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Link href="/faq">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-stone-300/60 text-stone-100 hover:bg-stone-100/10 bg-transparent"
                >
                  View FAQ
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
