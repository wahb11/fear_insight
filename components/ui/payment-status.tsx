"use client"

import { motion } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "./button"

interface PaymentStatusProps {
  status: "success" | "failed" | "pending"
  amount?: number
  orderId?: string
  onClose?: () => void
  onRetry?: () => void
}

export function PaymentStatus({
  status,
  amount,
  orderId,
  onClose,
  onRetry,
}: PaymentStatusProps) {
  const isSuccess = status === "success"
  const isFailed = status === "failed"
  const isPending = status === "pending"

  const statusConfig = {
    success: {
      icon: CheckCircle,
      title: "Payment Successful!",
      message: "Your order has been confirmed and will be processed shortly.",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-500",
      accentColor: "from-emerald-500/20 to-emerald-600/20",
    },
    failed: {
      icon: XCircle,
      title: "Payment Failed",
      message: "There was an issue processing your payment. Please try again.",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      iconColor: "text-red-500",
      accentColor: "from-red-500/20 to-red-600/20",
    },
    pending: {
      icon: AlertCircle,
      title: "Processing Payment...",
      message: "Please wait while we process your payment.",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-500",
      accentColor: "from-amber-500/20 to-amber-600/20",
    },
  }

  const config = statusConfig[status]
  const IconComponent = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={`relative max-w-md w-full rounded-xl border ${config.borderColor} ${config.bgColor} backdrop-blur-xl overflow-hidden`}
      >
        {/* Gradient accent background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.accentColor} opacity-0 group-hover:opacity-100 transition-opacity`} />

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <div className={`${config.iconColor} p-4 bg-stone-900/50 rounded-full`}>
              <IconComponent className="w-12 h-12" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-2xl font-bold text-stone-50 mb-2"
          >
            {config.title}
          </motion.h2>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-stone-300 mb-6"
          >
            {config.message}
          </motion.p>

          {/* Details */}
          {(amount || orderId) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="bg-stone-800/50 rounded-lg p-4 mb-6 space-y-2"
            >
              {amount && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-400">Amount</span>
                  <span className="text-stone-50 font-semibold">${amount.toFixed(2)}</span>
                </div>
              )}
              {orderId && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-400">Order ID</span>
                  <span className="text-stone-50 font-mono text-xs">{orderId}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Loading animation for pending */}
          {isPending && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="flex justify-center mb-6"
            >
              <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full" />
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="flex gap-3"
          >
            {isFailed && onRetry ? (
              <>
                <Button
                  onClick={onRetry}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  Retry Payment
                </Button>
                {onClose && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-stone-600 text-stone-200 hover:bg-stone-800/50"
                  >
                    Cancel
                  </Button>
                )}
              </>
            ) : isSuccess ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (onClose) {
                    onClose()
                  } else {
                    window.location.href = '/products'
                  }
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              >
                Continue Shopping
              </Button>
            ) : null}
          </motion.div>

          {/* Close button for pending */}
          {isPending && onClose && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              onClick={onClose}
              className="mt-4 text-sm text-stone-400 hover:text-stone-200 transition-colors"
            >
              Dismiss
            </motion.button>
          )}
        </div>

        {/* Animated border gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`absolute inset-0 rounded-xl ${config.borderColor} pointer-events-none`}
          style={{
            boxShadow: `inset 0 0 20px ${
              isSuccess ? "rgba(16, 185, 129, 0.1)" : isFailed ? "rgba(239, 68, 68, 0.1)" : "rgba(217, 119, 6, 0.1)"
            }`,
          }}
        />
      </motion.div>
    </motion.div>
  )
}

export default PaymentStatus
