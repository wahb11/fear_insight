'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Trash2, Plus, Minus, Package, CreditCard, ShieldCheck, X, Check } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'

export default function CartPage() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    shipping, 
    total, 
    discount,
    promoCode,
    shippingType, 
    setShippingType,
    applyPromoCode,
    clearPromoCode
  } = useCart()
  
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)

  // Pick the first image whose query param color matches the selected color; fall back to the first image
  const getImageForColor = (images: string[], selectedColor: string) => {
    if (!images?.length) return ''
    const normalizedSelected = selectedColor.toLowerCase().replace(/\s+/g, '')

    const matchIdx = images.findIndex((img) => {
      try {
        const url = new URL(img)
        const colorParam = url.searchParams.get('color')?.toLowerCase().replace(/\s+/g, '')
        if (colorParam && colorParam === normalizedSelected) return true
      } catch {
        // ignore bad URLs, fall back to simple match
      }
      return img.toLowerCase().includes(`color=${normalizedSelected}`)
    })

    return matchIdx >= 0 ? images[matchIdx] : images[0]
  }

  const handleApplyPromo = () => {
    const result = applyPromoCode(promoInput)
    if (result.success) {
      setPromoError(null)
      setPromoInput('')
    } else {
      setPromoError(result.message)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyPromo()
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
    

      <div className="pt-24 md:pt-28 container mx-auto px-4 sm:px-6 pb-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4 md:mb-6 flex items-center gap-2 text-neutral-500 text-sm"
        >
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-900">Cart</span>
        </motion.div>

        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-bold mb-6 md:mb-10 text-center text-neutral-900 italic"
        >
          Your Bag
        </motion.h1>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <p className="text-neutral-600 mb-6">Your cart is empty</p>
            <Link href="/products">
              <Button className="bg-black hover:bg-neutral-800 text-white">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 order-2 lg:order-1"
            >
              <div className="space-y-4">
                {/* Table Header - Hidden on mobile */}
                <div className="hidden md:grid grid-cols-4 gap-4 pb-4 border-b border-neutral-200 text-sm font-semibold text-neutral-700">
                  <div>Product</div>
                  <div>Price</div>
                  <div>Quantity</div>
                  <div>Total</div>
                </div>

                {/* Cart Items */}
                {items.map((item, index) => {
                  const discountedPrice = item.product.price * (1 - item.product.discount / 100)
                  return (
                    <motion.div
                      key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="hidden md:grid grid-cols-4 gap-4 items-center pb-6 border-b border-neutral-200"
                    >
                      {/* Product Image and Name */}
                      <div className="flex gap-3 items-center">
                        <img
                          src={getImageForColor(item.product.images, item.selectedColor)}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-neutral-200"
                        />
                        <div>
                          <h3 className="font-semibold text-neutral-900">{item.product.name}</h3>
                          <p className="text-xs text-neutral-500">
                            Color: {item.selectedColor} | Size: {item.selectedSize}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        {item.product.discount > 0 ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-neutral-900">${discountedPrice.toFixed(2)}</span>
                            <span className="text-xs text-neutral-500 line-through">${item.product.price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-neutral-900">${item.product.price.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white rounded-lg p-1 w-fit border border-neutral-200">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                          className="p-1 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-neutral-600" />
                        </button>
                        <span className="w-6 text-center text-neutral-900 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                          className="p-1 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-neutral-600" />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-neutral-900">${(discountedPrice * item.quantity).toFixed(2)}</div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                          className="p-2 hover:bg-red-900/30 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {items.map((item, index) => {
                    const discountedPrice = item.product.price * (1 - item.product.discount / 100)
                    return (
                      <motion.div
                        key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-white border border-neutral-200 rounded-lg p-4"
                      >
                        {/* Product Image and Name */}
                        <div className="flex gap-3 mb-4">
                          <img
                            src={getImageForColor(item.product.images, item.selectedColor)}
                            alt={item.product.name}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-neutral-200"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900 text-sm mb-1">{item.product.name}</h3>
                            <p className="text-xs text-neutral-500 mb-2">
                              Color: {item.selectedColor}
                            </p>
                            <p className="text-xs text-neutral-500">
                              Size: {item.selectedSize}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                            className="p-2 hover:bg-red-900/30 rounded transition-colors h-fit"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-center">
                          <div>
                            {item.product.discount > 0 ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-neutral-900">${discountedPrice.toFixed(2)}</span>
                                <span className="text-xs text-neutral-500 line-through">${item.product.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="font-semibold text-neutral-900">${item.product.price.toFixed(2)}</span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-neutral-200">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                              className="p-1 hover:bg-neutral-100 rounded transition-colors"
                            >
                              <Minus className="w-3 h-3 text-neutral-600" />
                            </button>
                            <span className="w-5 text-center text-neutral-900 font-semibold text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                              className="p-1 hover:bg-neutral-100 rounded transition-colors"
                            >
                              <Plus className="w-3 h-3 text-neutral-600" />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="font-semibold text-neutral-900 text-right">
                            ${(discountedPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Delivery & Payment Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-12 space-y-6"
              >
                {/* Delivery Info Card */}
                <Card className="bg-white border-neutral-200">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" /> Delivery Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-neutral-600">Standard Shipping (5-7 days)</span>
                        <span className="text-neutral-900 font-semibold">FREE</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-neutral-600">Express Shipping (2-3 days)</span>
                        <span className="text-neutral-900 font-semibold">$12.99</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-neutral-600">Overnight (1 day)</span>
                        <span className="text-neutral-900 font-semibold">$24.99</span>
                      </div>
                      <Link href="/shipping-returns" className="mt-3 inline-block">
                        <p className="text-neutral-500 hover:text-neutral-900 transition-colors text-xs underline">
                          View full shipping & returns policy →
                        </p>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Info Card */}
                <Card className="bg-white border-neutral-200">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" /> Payment Methods
                    </h3>
                    <p className="text-sm text-neutral-600 mb-4">We accept the following secure payment methods:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      {['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL'].map((method) => (
                        <div
                          key={method}
                          className="px-3 py-2 sm:px-4 sm:py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-center text-xs font-semibold text-neutral-700 hover:border-neutral-400 transition-colors"
                        >
                          {method}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-4 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-neutral-400" /> All transactions are encrypted and secure
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Sidebar: Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1 order-1 lg:order-2"
            >
              <Card className="bg-white border border-neutral-200 lg:sticky lg:top-24">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg font-bold text-neutral-900 mb-6 uppercase tracking-wider">Order Summary</h2>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-neutral-900">
                        <span className="text-sm">Subtotal</span>
                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span className="text-sm flex items-center gap-1">
                            Promo Discount
                            <span className="text-xs text-green-500">({promoCode})</span>
                          </span>
                          <span className="font-semibold">-${discount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Shipping Selection */}
                    <div className="mb-6 pb-6 border-b border-neutral-200">
                      <label className="block text-sm font-semibold text-neutral-700 mb-3">Shipping</label>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="shipping"
                              value="standard"
                              checked={shippingType === 'standard'}
                              onChange={() => setShippingType('standard')}
                              className="w-4 h-4 text-neutral-900"
                            />
                            <span className="text-neutral-900 text-sm">Standard (5-7 days)</span>
                          </div>
                          <span className="text-neutral-600 font-semibold text-sm">FREE</span>
                        </label>
                        <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="shipping"
                              value="express"
                              checked={shippingType === 'express'}
                              onChange={() => setShippingType('express')}
                              className="w-4 h-4 text-neutral-900"
                            />
                            <span className="text-neutral-900 text-sm">Express (2-3 days)</span>
                          </div>
                          <span className="text-neutral-600 font-semibold text-sm">$12.99</span>
                        </label>
                        <label className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="shipping"
                              value="overnight"
                              checked={shippingType === 'overnight'}
                              onChange={() => setShippingType('overnight')}
                              className="w-4 h-4 text-neutral-900"
                            />
                            <span className="text-neutral-900 text-sm">Overnight (1 day)</span>
                          </div>
                          <span className="text-neutral-600 font-semibold text-sm">$24.99</span>
                        </label>
                      </div>
                      <div className="mt-3 flex justify-between text-neutral-900">
                        <span className="text-sm">Shipping Cost</span>
                        <span className="font-semibold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                      </div>
                    </div>

                  <div className="flex justify-between items-center mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="font-bold text-neutral-900 uppercase tracking-wide">TOTAL</span>
                    <span className="text-2xl font-bold text-neutral-900">${total.toFixed(2)}</span>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-6">
                    {promoCode ? (
                      // Show applied promo code
                      <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm font-semibold">{promoCode}</span>
                          <span className="text-green-500/70 text-xs">20% off applied</span>
                        </div>
                        <button
                          onClick={clearPromoCode}
                          className="p-1 hover:bg-red-900/30 rounded transition-colors"
                          title="Remove promo code"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ) : (
                      // Show promo code input
                      <>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Promo code"
                            value={promoInput}
                            onChange={(e) => {
                              setPromoInput(e.target.value)
                              setPromoError(null)
                            }}
                            onKeyPress={handleKeyPress}
                            className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 text-sm uppercase"
                          />
                          <button
                            onClick={handleApplyPromo}
                            className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors hover:bg-neutral-100 rounded"
                          >
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                          </button>
                        </div>
                        {promoError && (
                          <p className="text-xs text-red-400 mt-2">{promoError}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Checkout Buttons */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mb-3">
                    <Link href="/checkout" className="block">
                      <Button className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-2 uppercase tracking-wider text-sm">
                        Checkout
                      </Button>
                    </Link>
                  </motion.div>
                  

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/products" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-neutral-300 text-neutral-900 hover:bg-neutral-100 font-bold uppercase tracking-wider text-sm bg-white border-2"
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
