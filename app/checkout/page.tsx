'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'
import { createOrder } from '@/functions/createOrder'

export default function CheckoutPage() {
  const { items, subtotal, tax, shipping, total } = useCart()
  const [formData, setFormData] = useState({
    // Shipping Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleShippingSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (formData.firstName && formData.lastName && formData.address && formData.city && formData.state && formData.zipCode) {
      try{
         const order = await createOrder({
  first_name: formData.firstName,
  last_name: formData.lastName,
  email: formData.email,
  phone: formData.phone,
  address: formData.address,
  city: formData.city,
  state: formData.state,
  zip_code: formData.zipCode,
  country: formData.country,

  products: [
    ...items.map(item => ({
      product_id: item.product.id,
      size: item.selectedSize,
      color: item.selectedColor,
      quantity: item.quantity
    }))
  ],

  payment: false,
  tax: tax,
  shipping: shipping,
  grand_total: total
})      

  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.id,
      items: items,
      customer: { email: formData.email },
      tax,
      shipping,
    }),
  })

  console.log('Response from create-checkout-session:', res)
  const data = await res.json()
  if (data.url) window.location.href = data.url

      //   alert(`Order placed successfully! Thank you ${formData.firstName} ${formData.lastName}. We'll send confirmation to ${formData.email}`)
  
      }catch{
        alert('There was an error placing your order. Please try again.')
      }
    
    } else {
      alert('Please fill in all shipping details')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100">
        <div className="pt-20 container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <p className="text-stone-300 mb-6">Your cart is empty</p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Navigation */}
      <div className="pt-20 container mx-auto px-4">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-8 flex items-center gap-2 text-stone-400"
        >
          <Link href="/" className="hover:text-stone-200 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-stone-200 transition-colors">
            Cart
          </Link>
          <span>/</span>
          <span className="text-stone-100">Checkout</span>
        </motion.div>

        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent italic"
        >
          Checkout
        </motion.h1>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12">
          {/* Main Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <motion.form
                onSubmit={handleShippingSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
              <Card className="bg-gradient-to-br from-stone-800/60 to-stone-900/60 border border-stone-600/60 mb-8">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-8 text-stone-100 uppercase tracking-wider">
                    SHIPPING DETAILS
                  </h2>                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        viewport={{ once: true }}
                      >
                        <label className="block text-sm font-semibold text-stone-200 mb-2">
                          First Name
                        </label>
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Daniel"
                          className="bg-stone-950/70 border-stone-600/60 text-stone-100 placeholder:text-stone-500 focus:border-stone-400"
                          required
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        viewport={{ once: true }}
                      >
                        <label className="block text-sm font-semibold text-stone-200 mb-2">
                          Last Name
                        </label>
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Hacker"
                          className="bg-stone-950/70 border-stone-600/60 text-stone-100 placeholder:text-stone-500 focus:border-stone-400"
                          required
                        />
                      </motion.div>
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        viewport={{ once: true }}
                      >
                        <label className="block text-sm font-semibold text-stone-200 mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="daniel@sambora.com"
                          className="bg-stone-950/70 border-stone-600/60 text-stone-100 placeholder:text-stone-500 focus:border-stone-400"
                          required
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 }}
                        viewport={{ once: true }}
                      >
                        <label className="block text-sm font-semibold text-stone-200 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                          className="bg-stone-950/70 border-stone-600/60 text-stone-100 placeholder:text-stone-500 focus:border-stone-400"
                          required
                        />
                      </motion.div>
                    </div>

                    {/* Address */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="mb-6"
                    >
                      <label className="block text-sm font-semibold text-stone-200 mb-2">
                        Street Address
                      </label>
                      <Input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Vasagatan 16"
                        className="bg-stone-950/70 border-stone-600/60 text-stone-100 placeholder:text-stone-500 focus:border-stone-400"
                        required
                      />
                    </motion.div>

                    {/* City, State, Zip */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.35 }}
                        viewport={{ once: true }}
                      >
                        <label className="block text-sm font-semibold text-stone-200 mb-2">
                          City
                        </label>
                        <Input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Stockholm"
                          className="bg-stone-950/70 border-stone-600/60 text-stone-100 placeholder:text-stone-500 focus:border-stone-400"
                          required
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        viewport={{ once: true }}
                      >
                        <label className="block text-sm font-semibold text-stone-200 mb-2">
                          State/Province
                        </label>
                        <Input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="Stockholm"
                          className="bg-stone-950/70 border-stone-600/60 text-stone-100 placeholder:text-stone-500 focus:border-stone-400"
                          required
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.45 }}
                        viewport={{ once: true }}
                      >
                        <label className="block text-sm font-semibold text-stone-200 mb-2">
                          Zip Code
                        </label>
                        <Input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="111 20"
                          className="bg-stone-950/70 border-stone-600/60 text-stone-100 placeholder:text-stone-500 focus:border-stone-400"
                          required
                        />
                      </motion.div>
                    </div>

                    {/* Country */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <label className="block text-sm font-semibold text-stone-200 mb-2">
                        Country
                      </label>
                      <Input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Sweden"
                        className="bg-stone-950/70 border-stone-600/60 text-stone-100 placeholder:text-stone-500 focus:border-stone-400"
                        required
                      />
                    </motion.div>
                  </CardContent>
                </Card>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.55 }}
                  className="flex justify-between gap-4"
                >
                  <Link href="/cart">
                    <Button
                      variant="outline"
                      className="border-stone-600/60 text-stone-100 hover:bg-stone-100/90 hover:text-stone-950 bg-stone-950/30 border-2"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Cart
                    </Button>
                  </Link>
                  <Button
                    onClick={handleShippingSubmit}
                    className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50"
                  >
                    Place Order
                  </Button>
                </motion.div>
              </motion.form>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-32">
              <Card className="bg-stone-900/95 border border-stone-600/80">
                <CardContent className="p-8">
                  <h3 className="text-lg font-bold mb-6 text-stone-50 uppercase tracking-wider">Order Summary</h3>

                  {/* Order Items */}
                  <motion.div
                    className="space-y-4 mb-6 pb-6 border-b border-stone-600/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    {items.map((item, index) => {
                      const discountedPrice = item.product.price * (1 - item.product.discount / 100)
                      return (
                        <motion.div
                          key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 + index * 0.08 }}
                          className="flex justify-between items-start text-sm gap-2"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-stone-100 font-medium text-sm break-words">
                              {item.product.name}
                            </p>
                            <p className="text-stone-300 text-xs">
                              {item.selectedColor} • {item.selectedSize} • Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-stone-100 font-semibold flex-shrink-0">
                            ${(discountedPrice * item.quantity).toFixed(2)}
                          </p>
                        </motion.div>
                      )
                    })}
                  </motion.div>

                  {/* Price Breakdown */}
                  <motion.div
                    className="space-y-3 text-sm mb-6 pb-6 border-b border-stone-600/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <div className="flex justify-between text-stone-100">
                      <span>Subtotal:</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-100">
                      <span>Shipping:</span>
                      <span className="font-semibold">${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-100">
                      <span>Tax (10%):</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                  </motion.div>

                  {/* Total */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="flex justify-between items-center p-4 bg-stone-950/80 rounded-lg border border-stone-500/60"
                  >
                    <span className="font-bold text-stone-50 uppercase tracking-wide">Total:</span>
                    <span className="text-2xl font-bold text-stone-50">
                      ${total.toFixed(2)}
                    </span>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
