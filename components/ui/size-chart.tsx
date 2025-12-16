"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "./button"

interface SizeChartProps {
  isOpen: boolean
  onClose: () => void
}

export function SizeChart({ isOpen, onClose }: SizeChartProps) {
  const sizeData = [
    { size: "S", chest: "20-22", length: "27", sleeve: "33" },
    { size: "M", chest: "22-24", length: "28", sleeve: "34" },
    { size: "L", chest: "24-26", length: "29", sleeve: "35" },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-900 border border-stone-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-stone-900 border-b border-stone-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-stone-100">Size Guide</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-stone-300" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-stone-300 mb-6 text-sm">
                  All measurements are in inches. Please refer to the chart below to find your perfect fit.
                </p>

                {/* Size Chart Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-stone-800/50">
                        <th className="border border-stone-700 px-4 py-3 text-left text-stone-100 font-semibold">Size</th>
                        <th className="border border-stone-700 px-4 py-3 text-left text-stone-100 font-semibold">Chest (inches)</th>
                        <th className="border border-stone-700 px-4 py-3 text-left text-stone-100 font-semibold">Length (inches)</th>
                        <th className="border border-stone-700 px-4 py-3 text-left text-stone-100 font-semibold">Sleeve (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeData.map((row, index) => (
                        <tr
                          key={row.size}
                          className={index % 2 === 0 ? "bg-stone-900" : "bg-stone-800/30"}
                        >
                          <td className="border border-stone-700 px-4 py-3 text-stone-100 font-semibold">{row.size}</td>
                          <td className="border border-stone-700 px-4 py-3 text-stone-300">{row.chest}</td>
                          <td className="border border-stone-700 px-4 py-3 text-stone-300">{row.length}</td>
                          <td className="border border-stone-700 px-4 py-3 text-stone-300">{row.sleeve}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-stone-800/30 rounded-lg border border-stone-700">
                  <h3 className="text-stone-100 font-semibold mb-2">How to Measure:</h3>
                  <ul className="text-stone-300 text-sm space-y-1 list-disc list-inside">
                    <li><strong>Chest:</strong> Measure around the fullest part of your chest, under your arms</li>
                    <li><strong>Length:</strong> Measure from the top of the shoulder to the bottom hem</li>
                    <li><strong>Sleeve:</strong> Measure from the center back of the neck to the end of the sleeve</li>
                  </ul>
                </div>

                {/* Close Button */}
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={onClose}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-100"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

