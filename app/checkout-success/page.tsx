'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PaymentStatus } from '@/components/ui/payment-status'
import { useCart } from '@/app/context/CartContext'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(null)

  useEffect(() => {
    // Get order ID from URL params
    const id = searchParams.get('order_id')
    if (id) {
      setOrderId(id)
    }

    // Clear cart after successful payment
    clearCart()
  }, [searchParams, clearCart])

  const handleContinueShopping = () => {
    // Extra safety: ensure cart is clear before navigating away
    clearCart()
    router.push('/products')
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
      <PaymentStatus
        status="success"
        orderId={orderId || undefined}
        amount={amount || undefined}
        onClose={handleContinueShopping}
      />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
