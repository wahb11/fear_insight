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
    <div ref={containerRef} className="bg-white text-neutral-900 overflow-hidden">


      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden pt-20 bg-neutral-50">
        <motion.div
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-black mb-4 text-neutral-900"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            SHIPPING & RETURNS
          </motion.h1>
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
            We're committed to getting your Fear Insight pieces to you quickly and ensuring your complete satisfaction.
          </motion.p>
        </motion.div>
      </section>

      {/* Shipping Information */}
      <section className="py-16 px-4 bg-white">
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
              <Card className="bg-white border-neutral-200 hover:border-neutral-400 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-neutral-900">
                    <Truck className="w-6 h-6 mr-3" />
                    SHIPPING INFORMATION
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-neutral-900">Shipping Options</h3>
                    <div className="space-y-3 text-neutral-600">
                      <div className="flex justify-between">
                        <span>Standard Shipping (5-7 business days)</span>
                        <span className="text-neutral-900 font-semibold">FREE on orders $75+</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Express Shipping (2-3 business days)</span>
                        <span className="text-neutral-900 font-semibold">$12.99</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overnight Shipping (1 business day)</span>
                        <span className="text-neutral-900 font-semibold">$24.99</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-neutral-900 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Processing Time
                    </h3>
                    <p className="text-neutral-600">
                      Orders are processed within 1-2 business days. You'll receive a tracking number once your order
                      ships.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-neutral-900 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Shipping Locations
                    </h3>
                    <p className="text-neutral-600">
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
              <Card className="bg-white border-neutral-200 hover:border-neutral-400 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-neutral-900">
                    <RotateCcw className="w-6 h-6 mr-3" />
                    RETURNS & EXCHANGES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-neutral-900">Return Policy</h3>
                    <p className="text-neutral-600 mb-3">
                      We offer a 30-day return policy for unworn items in original condition with tags attached.
                    </p>
                    <ul className="space-y-2 text-neutral-600 text-sm">
                      <li>• Items must be unworn and unwashed</li>
                      <li>• Original tags must be attached</li>
                      <li>• Items must be in original packaging</li>
                      <li>• Return shipping is free for defective items</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-neutral-900">Exchange Process</h3>
                    <p className="text-neutral-600">
                      Need a different size? We offer free exchanges within 30 days. Contact us at{" "}
                      <a href="mailto:info@fearinsight.com" className="text-neutral-900 hover:text-black font-semibold">
                        info@fearinsight.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-neutral-900 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Refund Timeline
                    </h3>
                    <p className="text-neutral-600">
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
                <Card className="bg-white border-neutral-200 hover:border-neutral-400 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <item.icon className="w-12 h-12 text-neutral-900 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-neutral-900">{item.title}</h3>
                    <p className="text-neutral-600 text-sm">
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
      <section className="py-16 px-4 bg-neutral-50">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4 text-neutral-900">Need Help?</h2>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Have questions about shipping or returns? Our customer service team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-black hover:bg-neutral-800 text-white group"
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
                  className="border-neutral-300 text-neutral-900 hover:bg-neutral-100 bg-white"
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
