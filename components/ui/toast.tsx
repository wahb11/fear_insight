"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, X } from "lucide-react"

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-16 sm:top-20 md:top-24 left-0 right-0 z-[100] pointer-events-auto px-3 sm:px-4 md:px-0"
        >
          <div className="max-w-full sm:max-w-md mx-auto">
            <motion.div
              className="bg-stone-900/95 backdrop-blur-md border border-stone-700 rounded-lg shadow-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 flex items-start sm:items-center gap-2 sm:gap-3 w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="flex-shrink-0 mt-0.5 sm:mt-0"
              >
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-400" />
              </motion.div>
              <p className="text-stone-100 font-medium flex-1 text-xs sm:text-sm md:text-base leading-relaxed break-words">{message}</p>
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-stone-100 transition-colors p-1 rounded hover:bg-stone-800 flex-shrink-0 mt-0.5 sm:mt-0"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
