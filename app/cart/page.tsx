'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react'
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
    

      <div className="pt-20 container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center gap-2 text-stone-400"
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
          className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent italic"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="space-y-6">
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-4 pb-4 border-b border-stone-700 text-sm font-semibold text-stone-300">
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
                      className="grid grid-cols-4 gap-4 items-center pb-6 border-b border-stone-800"
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
                            <span className="text-xs text-stone-400 line-through">${item.product.price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-stone-100">${item.product.price.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-stone-900/50 rounded-lg p-1 w-fit">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                          className="p-1 hover:bg-stone-800 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-stone-300" />
                        </button>
                        <span className="w-6 text-center text-stone-100">{item.quantity}</span>
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
              </div>

              {/* Delivery & Payment Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-12 space-y-6"
              >
                <div>
                  <h3 className="font-semibold text-stone-100 mb-2">Delivery Info</h3>
                  <p className="text-sm text-stone-400">See our delivery & returns info here</p>
                </div>

                <div>
                  <h3 className="font-semibold text-stone-100 mb-2">Payment Info</h3>
                  <p className="text-sm text-stone-400 mb-3">We accept the following methods of payment</p>
                  <div className="flex gap-3 text-xs font-semibold text-stone-300">
                    <span className="px-2 py-1 bg-stone-800/50 rounded">VISA</span>
                    <span className="px-2 py-1 bg-stone-800/50 rounded">MASTERCARD</span>
                    <span className="px-2 py-1 bg-stone-800/50 rounded">AMEX</span>
                    <span className="px-2 py-1 bg-stone-800/50 rounded">PAYPAL</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Sidebar: Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <Card className="bg-stone-900/50 border border-stone-700/50 sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-stone-100 mb-6">ORDER SUMMARY</h2>

                  <div className="space-y-4 mb-6 pb-6 border-b border-stone-700">
                    <div className="flex justify-between text-stone-300">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Taxes</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-xl font-bold text-stone-100 mb-6">
                    <span>TOTAL</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Add promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-stone-950/50 border-stone-600 text-stone-100 placeholder:text-stone-500 focus:border-stone-300"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="p-2 text-stone-300 hover:text-stone-100 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                      </button>
                    </div>
                    {promoCode && discount === 0 && (
                      <p className="text-xs text-stone-400 mt-2">Code not found (try "SAVE10")</p>
                    )}
                  </div>

                  {/* Checkout Buttons */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/checkout" className="block">
                      <Button className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50 font-bold py-2 mb-3">
                        CHECKOUT
                      </Button>
                    </Link>
                  </motion.div>
                  

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/products" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-stone-600 text-stone-100 hover:bg-stone-800 font-bold"
                      >
                        CONTINUE SHOPPING
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
