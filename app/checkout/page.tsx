'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Check } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'

export default function CheckoutPage() {
  const { items, subtotal, tax, shipping, total } = useCart()
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping')
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
    // Payment Details
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.firstName && formData.lastName && formData.address && formData.city && formData.state && formData.zipCode) {
      setCurrentStep('payment')
    } else {
      alert('Please fill in all shipping details')
    }
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.cardName && formData.cardNumber && formData.expiryDate && formData.cvv) {
      setCurrentStep('confirmation')
    } else {
      alert('Please fill in all payment details')
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-2"
          >
            {/* Step Indicators */}
            <div className="flex justify-between mb-12">
              {['shipping', 'payment', 'confirmation'].map((step, index) => (
                <motion.div
                  key={step}
                  className="flex flex-col items-center flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all duration-300 ${
                      currentStep === step || (step === 'shipping' && currentStep !== 'shipping')
                        ? 'bg-stone-100 text-stone-950'
                        : currentStep === 'payment' && (step === 'payment' || step === 'confirmation')
                        ? 'bg-stone-700 text-stone-100'
                        : currentStep === 'confirmation' && step === 'confirmation'
                        ? 'bg-stone-100 text-stone-950'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {step === 'shipping' && '1'}
                    {step === 'payment' && '2'}
                    {step === 'confirmation' && '3'}
                  </motion.div>
                  <span className="text-xs md:text-sm text-stone-400 capitalize">
                    {step === 'confirmation' ? 'Order Confirmation' : step}
                  </span>
                  {index < 2 && (
                    <div className="hidden md:block absolute left-1/3 right-1/3 h-0.5 bg-stone-800 top-5 -z-10" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Shipping Details Form */}
            {currentStep === 'shipping' && (
              <motion.form
                onSubmit={handleShippingSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-stone-800/40 to-stone-900/40 border border-stone-700/50 mb-8">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent">
                      SHIPPING DETAILS
                    </h2>

                    {/* Name Fields */}
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
                          className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
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
                          className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
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
                          className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
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
                          className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
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
                        className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
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
                          className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
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
                          className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
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
                          className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
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
                        className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
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
                    Continue to Payment
                  </Button>
                </motion.div>
              </motion.form>
            )}

            {/* Payment Details Form */}
            {currentStep === 'payment' && (
              <motion.form
                onSubmit={handlePaymentSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-stone-800/40 to-stone-900/40 border border-stone-700/50 mb-8">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent">
                      PAYMENT DETAILS
                    </h2>

                    {/* Cardholder Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      viewport={{ once: true }}
                      className="mb-6"
                    >
                      <label className="block text-sm font-semibold text-stone-200 mb-2">
                        Name on Card
                      </label>
                      <Input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="Daniel Hacker"
                        className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
                        required
                      />
                    </motion.div>

                    {/* Card Number */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                      viewport={{ once: true }}
                      className="mb-6"
                    >
                      <label className="block text-sm font-semibold text-stone-200 mb-2">
                        Card Number
                      </label>
                      <Input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="4034 6666 6666 6666"
                        maxLength={19}
                        className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
                        required
                      />
                      <div className="flex justify-end mt-2">
                        <span className="text-xs text-stone-500">VISA</span>
                      </div>
                    </motion.div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        viewport={{ once: true }}
                      >
                        <label className="block text-sm font-semibold text-stone-200 mb-2">
                          Valid Through
                        </label>
                        <Input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="06/19"
                          maxLength={5}
                          className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
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
                          CVV Code
                        </label>
                        <Input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="●●●"
                          maxLength={4}
                          className="bg-stone-950/50 border-stone-700/50 text-stone-100 placeholder:text-stone-600"
                          required
                        />
                      </motion.div>
                    </div>

                    {/* Billing Address Same as Shipping */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-2 text-sm text-stone-300 p-3 bg-stone-950/30 rounded-lg border border-stone-700/30"
                    >
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Billing address same as shipping</span>
                    </motion.div>
                  </CardContent>
                </Card>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                  className="flex justify-between gap-4"
                >
                  <Button
                    onClick={() => setCurrentStep('shipping')}
                    variant="outline"
                    className="border-stone-600/60 text-stone-100 hover:bg-stone-100/90 hover:text-stone-950 bg-stone-950/30 border-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handlePaymentSubmit}
                    className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50"
                  >
                    Place Order
                  </Button>
                </motion.div>
              </motion.form>
            )}

            {/* Confirmation */}
            {currentStep === 'confirmation' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-center"
              >
                <Card className="bg-gradient-to-br from-stone-800/40 to-stone-900/40 border border-stone-700/50 mb-8">
                  <CardContent className="p-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex justify-center mb-6"
                    >
                      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                        <Check className="w-8 h-8 text-stone-950" />
                      </div>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className="text-3xl font-bold mb-4 bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent"
                    >
                      Order Confirmed!
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      className="text-stone-300 mb-8"
                    >
                      Thank you for your purchase. We'll send you an email confirmation shortly with tracking information.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                      className="space-y-3 text-left bg-stone-950/30 p-6 rounded-lg border border-stone-700/30 mb-8"
                    >
                      <div className="flex justify-between text-stone-300">
                        <span>Order Number:</span>
                        <span className="font-semibold">#FI-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span>Name:</span>
                        <span className="font-semibold">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span>Email:</span>
                        <span className="font-semibold text-sm">{formData.email}</span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span>Delivery Address:</span>
                        <span className="font-semibold text-right text-sm max-w-xs">{formData.address}, {formData.city}</span>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Link href="/products">
                    <Button className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50 w-full sm:w-auto">
                      Continue Shopping
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="border-stone-600/60 text-stone-100 hover:bg-stone-100/90 hover:text-stone-950 bg-stone-950/30 border-2 w-full sm:w-auto"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-32">
              <Card className="bg-gradient-to-br from-stone-800/40 to-stone-900/40 border border-stone-700/50">
                <CardContent className="p-8">
                  <h3 className="text-lg font-bold mb-6 text-stone-100">ORDER SUMMARY</h3>

                  {/* Order Items */}
                  <motion.div
                    className="space-y-4 mb-6 pb-6 border-b border-stone-700/50"
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
                          className="flex justify-between items-start text-sm"
                        >
                          <div className="flex-1">
                            <p className="text-stone-200 font-medium text-sm truncate">
                              {item.product.name}
                            </p>
                            <p className="text-stone-500 text-xs">
                              {item.selectedColor} • {item.selectedSize} • Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-stone-200 font-semibold ml-2">
                            ${(discountedPrice * item.quantity).toFixed(2)}
                          </p>
                        </motion.div>
                      )
                    })}
                  </motion.div>

                  {/* Price Breakdown */}
                  <motion.div
                    className="space-y-3 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <div className="flex justify-between text-stone-400">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Shipping:</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Tax (10%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </motion.div>

                  {/* Total */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="mt-6 pt-6 border-t border-stone-700/50 flex justify-between items-center"
                  >
                    <span className="text-lg font-bold text-stone-100">Total:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent">
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
