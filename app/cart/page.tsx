'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Trash2, Plus, Minus, Package, CreditCard, ShieldCheck } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, tax, shipping, total } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const handleApplyPromo = () => {
    // Simple promo code logic (example: "SAVE10" = 10% off)
    if (promoCode === 'SAVE10') {
      setDiscount(subtotal * 0.1)
    } else {
      setDiscount(0)
    }
  }

  const finalTotal = total - discount

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
    

      <div className="pt-24 md:pt-28 container mx-auto px-4 sm:px-6 pb-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4 md:mb-6 flex items-center gap-2 text-stone-400 text-sm"
        >
          <Link href="/" className="hover:text-stone-200 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-stone-100">Cart</span>
        </motion.div>

        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-bold mb-6 md:mb-10 text-center bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent italic"
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
            <p className="text-stone-300 mb-6">Your cart is empty</p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50">
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
                <div className="hidden md:grid grid-cols-4 gap-4 pb-4 border-b border-stone-700 text-sm font-semibold text-stone-200">
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
                      className="hidden md:grid grid-cols-4 gap-4 items-center pb-6 border-b border-stone-800"
                    >
                      {/* Product Image and Name */}
                      <div className="flex gap-3 items-center">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-stone-700"
                        />
                        <div>
                          <h3 className="font-semibold text-stone-100">{item.product.name}</h3>
                          <p className="text-xs text-stone-400">
                            Color: {item.selectedColor} | Size: {item.selectedSize}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        {item.product.discount > 0 ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-stone-100">${discountedPrice.toFixed(2)}</span>
                            <span className="text-xs text-stone-500 line-through">${item.product.price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-stone-100">${item.product.price.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-stone-900/80 rounded-lg p-1 w-fit border border-stone-700">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                          className="p-1 hover:bg-stone-800 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-stone-300" />
                        </button>
                        <span className="w-6 text-center text-stone-100 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                          className="p-1 hover:bg-stone-800 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-stone-300" />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-stone-100">${(discountedPrice * item.quantity).toFixed(2)}</div>
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
                        className="bg-stone-900/50 border border-stone-700 rounded-lg p-4"
                      >
                        {/* Product Image and Name */}
                        <div className="flex gap-3 mb-4">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-stone-700"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-stone-100 text-sm mb-1">{item.product.name}</h3>
                            <p className="text-xs text-stone-400 mb-2">
                              Color: {item.selectedColor}
                            </p>
                            <p className="text-xs text-stone-400">
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
                                <span className="font-semibold text-stone-100">${discountedPrice.toFixed(2)}</span>
                                <span className="text-xs text-stone-500 line-through">${item.product.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="font-semibold text-stone-100">${item.product.price.toFixed(2)}</span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-stone-900/80 rounded-lg p-1 border border-stone-700">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                              className="p-1 hover:bg-stone-800 rounded transition-colors"
                            >
                              <Minus className="w-3 h-3 text-stone-300" />
                            </button>
                            <span className="w-5 text-center text-stone-100 font-semibold text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                              className="p-1 hover:bg-stone-800 rounded transition-colors"
                            >
                              <Plus className="w-3 h-3 text-stone-300" />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="font-semibold text-stone-100 text-right">
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
                <Card className="bg-stone-900/50 border-stone-700">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-bold text-lg text-stone-50 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" /> Delivery Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-stone-300">Standard Shipping (5-7 days)</span>
                        <span className="text-stone-100 font-semibold">FREE on orders $75+</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-stone-300">Express Shipping (2-3 days)</span>
                        <span className="text-stone-100 font-semibold">$12.99</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-stone-300">Overnight (1 day)</span>
                        <span className="text-stone-100 font-semibold">$24.99</span>
                      </div>
                      <Link href="/shipping-returns" className="mt-3 inline-block">
                        <p className="text-stone-400 hover:text-stone-200 transition-colors text-xs underline">
                          View full shipping & returns policy →
                        </p>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Info Card */}
                <Card className="bg-stone-900/50 border-stone-700">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-bold text-lg text-stone-50 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" /> Payment Methods
                    </h3>
                    <p className="text-sm text-stone-300 mb-4">We accept the following secure payment methods:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      {['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL'].map((method) => (
                        <div
                          key={method}
                          className="px-3 py-2 sm:px-4 sm:py-3 bg-stone-800/50 border border-stone-700/50 rounded-lg text-center text-xs font-semibold text-stone-200 hover:border-stone-600 transition-colors"
                        >
                          {method}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-stone-400 mt-4 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-stone-500" /> All transactions are encrypted and secure
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
              <Card className="bg-stone-900/95 border border-stone-600/80 lg:sticky lg:top-24">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg font-bold text-stone-50 mb-6 uppercase tracking-wider">Order Summary</h2>

                  <div className="space-y-3 mb-6 pb-6 border-b border-stone-600/70">
                    <div className="flex justify-between text-stone-100">
                      <span className="text-sm">Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-100">
                      <span className="text-sm">Taxes</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-100">
                      <span className="text-sm">Shipping</span>
                      <span className="font-semibold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span className="text-sm">Discount</span>
                        <span className="font-semibold">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-6 p-4 bg-stone-950/80 rounded-lg border border-stone-500/60">
                    <span className="font-bold text-stone-50 uppercase tracking-wide">TOTAL</span>
                    <span className="text-2xl font-bold text-stone-50">${finalTotal.toFixed(2)}</span>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-stone-950/60 border-stone-600 text-stone-100 placeholder:text-stone-500 focus:border-stone-300 text-sm"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="p-2 text-stone-300 hover:text-stone-100 transition-colors hover:bg-stone-800 rounded"
                      >
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                      </button>
                    </div>
                    {promoCode && discount === 0 && (
                      <p className="text-xs text-stone-400 mt-2">Code not found (try "SAVE10")</p>
                    )}
                  </div>

                  {/* Checkout Buttons */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mb-3">
                    <Link href="/checkout" className="block">
                      <Button className="w-full bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-800 hover:to-stone-900 text-stone-50 font-bold py-2 uppercase tracking-wider text-sm">
                        Checkout
                      </Button>
                    </Link>
                  </motion.div>
                  

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/products" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-stone-600/80 text-stone-200 hover:bg-stone-800/60 hover:text-stone-50 font-bold uppercase tracking-wider text-sm bg-transparent border-2"
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
