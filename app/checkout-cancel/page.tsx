'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PaymentStatus } from '@/components/ui/payment-status'

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    // Get order ID from URL params
    const id = searchParams.get('order_id')
    if (id) {
      setOrderId(id)
    }
  }, [searchParams])

  const handleRetry = () => {
    // Navigate back to checkout to retry
    router.push('/checkout')
  }

  const handleClose = () => {
    // Navigate back to cart
    router.push('/cart')
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
      <PaymentStatus
        status="failed"
        orderId={orderId || undefined}
        onRetry={handleRetry}
        onClose={handleClose}
      />
    </div>
  )
}
