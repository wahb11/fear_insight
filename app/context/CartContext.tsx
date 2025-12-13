'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAllProducts } from '@/hooks/useAllProducts'
import { Product } from '@/types/products'

export interface CartItem {
  product: Product
  quantity: number
  selectedColor: string
  selectedSize: string
}

interface StoredCartItem {
  productId: string
  quantity: number
  selectedColor: string
  selectedSize: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity: number, color: string, size: string) => void
  removeFromCart: (productId: string, color: string, size: string) => void
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void
  clearCart: () => void
  subtotal: number
  tax: number
  shipping: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [total, setTotal] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)
  const { data: products, isSuccess } = useAllProducts()

  // Load from localStorage only once when products are loaded
  useEffect(() => {
    if (!isSuccess || !products || isHydrated) return
    
    const stored = localStorage.getItem('cart')
    if (!stored) {
      setIsHydrated(true)
      return
    }
    
    try {
      const parsed: StoredCartItem[] = JSON.parse(stored)
      const validated = parsed
        .map(storedItem => {
          const product = products.find((p: Product) => p.id === storedItem.productId)
          if (!product) return null

          // Check if color exists (handles string arrays)
          const colorExists = product.colors.some((c) => {
            if (typeof c === 'string') {
              return c.toLowerCase() === storedItem.selectedColor.toLowerCase()
            }
            return Object.keys(c).some(key => key.toLowerCase() === storedItem.selectedColor.toLowerCase())
          })

          // Check if size exists (handles string arrays)
          const sizeExists = product.sizes.some((s) => {
            if (typeof s === 'string') {
              return s.toLowerCase() === storedItem.selectedSize.toLowerCase()
            }
            return Object.keys(s).some(key => key.toLowerCase() === storedItem.selectedSize.toLowerCase())
          })

          if (!colorExists || !sizeExists) return null

          return {
            product,
            quantity: storedItem.quantity,
            selectedColor: storedItem.selectedColor,
            selectedSize: storedItem.selectedSize,
          } as CartItem
        })
        .filter(Boolean) as CartItem[]
      setItems(validated)
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
    
    setIsHydrated(true)
  }, [isSuccess, products, isHydrated])

  // Save to localStorage and calculate totals whenever items change
  useEffect(() => {
    if (!isHydrated) return
    
    const newSubtotal = items.reduce(
      (sum, item) => {
        const discountedPrice = item.product.price * (1 - item.product.discount / 100)
        return sum + discountedPrice * item.quantity
      },
      0
    )
    const newTax = 0
    const newShipping = 0
    const newTotal = newSubtotal
    setSubtotal(newSubtotal)
    setTax(newTax)
    setShipping(newShipping)
    setTotal(newTotal)

    const stored: StoredCartItem[] = items.map(i => ({
      productId: i.product.id,
      quantity: i.quantity,
      selectedColor: i.selectedColor,
      selectedSize: i.selectedSize,
    }))
    localStorage.setItem('cart', JSON.stringify(stored))
  }, [items, isHydrated])

  const addToCart = (product: Product, quantity: number, color: string, size: string) => {
    // Check if color exists in product (handles string arrays)
    const colorExists = product.colors.some((c) => {
      if (typeof c === 'string') {
        return c.toLowerCase() === color.toLowerCase()
      }
      // Fallback for old object format
      return Object.keys(c).some(key => key.toLowerCase() === color.toLowerCase())
    })
    
    // Check if size exists in product (handles string arrays)
    const sizeExists = product.sizes.some((s) => {
      if (typeof s === 'string') {
        return s.toLowerCase() === size.toLowerCase()
      }
      // Fallback for old object format
      return Object.keys(s).some(key => key.toLowerCase() === size.toLowerCase())
    })
    
    if (!colorExists || !sizeExists) {
      alert('Selected variant is not available')
      return
    }

    setItems(prev => {
      const existing = prev.find(
        i => i.product.id === product.id && i.selectedColor === color && i.selectedSize === size
      )
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.selectedColor === color && i.selectedSize === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, quantity, selectedColor: color, selectedSize: size }]
    })
  }

  const removeFromCart = (productId: string, color: string, size: string) =>
    setItems(prev => prev.filter(i => 
      !(i.product.id === productId && i.selectedColor === color && i.selectedSize === size)
    ))

  const updateQuantity = (productId: string, color: string, size: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId, color, size)
    setItems(prev => prev.map(i => 
      (i.product.id === productId && i.selectedColor === color && i.selectedSize === size)
        ? { ...i, quantity }
        : i
    ))
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, tax, shipping, total }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
