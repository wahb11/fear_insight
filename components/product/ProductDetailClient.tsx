"use client"

import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/app/context/CartContext"
import { Star, ShoppingBag, Ruler, Share2, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight, Mail, Instagram, Twitter, ArrowLeft } from "lucide-react"
import { SizeChart } from "@/components/ui/size-chart"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Product } from "@/types/products"

// Map color names to valid CSS colors
const getColorValue = (colorName: string): string => {
	const colorMap: Record<string, string> = {
		'black': '#1a1a1a',
		'white': '#ffffff',
		'cream': '#fffdd0',
		'beige': '#f5f5dc',
		'navy': '#1e3a5f',
		'blue': '#2563eb',
		'pink': '#ec4899',
		'red': '#dc2626',
		'green': '#16a34a',
		'gray': '#6b7280',
		'grey': '#6b7280',
		'brown': '#78350f',
		'tan': '#d2b48c',
		'olive': '#556b2f',
		'maroon': '#800000',
		'burgundy': '#800020',
		'charcoal': '#36454f',
		'sand': '#c2b280',
		'ivory': '#fffff0',
		'khaki': '#c3b091',
		'stone': '#928e85',
	}
	const lowerName = colorName.toLowerCase().trim()
	return colorMap[lowerName] || colorName.toLowerCase()
}

type VariantOption = { name: string; inStock: boolean }

interface ProductDetailClientProps {
	product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
	const router = useRouter()
	const { addToCart } = useCart()

	// Extract available colors and sizes from the product data (handles both string arrays and object arrays)
	const availableColors = React.useMemo<VariantOption[]>(() => {
		if (!product?.colors?.length) return []
		return product.colors.flatMap((color: unknown) => {
			// String format: "Navy"
			if (typeof color === 'string' && color.trim().length > 0) {
				return [{ name: color.trim(), inStock: true }]
			}
			// Object format: {"Navy": 5}
			if (typeof color === 'object' && color !== null) {
				return Object.keys(color)
					.filter(key => key.trim().length > 0)
					.map(key => ({ name: key.trim(), inStock: true }))
			}
			return []
		})
	}, [product])

	const availableSizes = React.useMemo<VariantOption[]>(() => {
		if (!product?.sizes?.length) return []
		return product.sizes.flatMap((size: unknown) => {
			// String format: "M"
			if (typeof size === 'string' && size.trim().length > 0) {
				return [{ name: size.trim().toUpperCase(), inStock: true }]
			}
			// Object format: {"M": 10}
			if (typeof size === 'object' && size !== null) {
				return Object.keys(size)
					.filter(key => key.trim().length > 0)
					.map(key => ({ name: key.trim().toUpperCase(), inStock: true }))
			}
			return []
		})
	}, [product])

	// States
	const [selectedImage, setSelectedImage] = useState(0)
	const [selectedColor, setSelectedColor] = useState("")
	const [selectedSize, setSelectedSize] = useState("")
	const [quantity, setQuantity] = useState(1)
	const [isAdding, setIsAdding] = useState(false)
	const [imageError, setImageError] = useState(false)
	const [showSizeChart, setShowSizeChart] = useState(false)
	
	const fallbackImage = "/download.png"

	// Set initial color and size when product loads
	React.useEffect(() => {
		if (availableColors.length > 0 && !selectedColor) {
			const firstAvailableColor = availableColors.find((c: VariantOption) => c.inStock)
			if (firstAvailableColor) setSelectedColor(firstAvailableColor.name)
		}
	}, [availableColors, selectedColor])

	React.useEffect(() => {
		if (availableSizes.length > 0 && !selectedSize) {
			const firstAvailableSize = availableSizes.find((s: VariantOption) => s.inStock)
			if (firstAvailableSize) setSelectedSize(firstAvailableSize.name)
		}
	}, [availableSizes, selectedSize])
	
	// Snap main image to the first image that matches the selected color
	React.useEffect(() => {
		if (!product?.images?.length || !selectedColor) return

		const normalizedSelected = selectedColor.toLowerCase().replace(/\s+/g, "")

		const matchingIndex = product.images.findIndex((img: string) => {
			try {
				const url = new URL(img)
				const colorParam = url.searchParams.get("color")?.toLowerCase().replace(/\s+/g, "")
				if (colorParam && colorParam === normalizedSelected) return true
			} catch {
				// ignore parsing errors, fall back to substring match
			}
			return img.toLowerCase().includes(`color=${normalizedSelected}`)
		})

		if (matchingIndex >= 0) setSelectedImage(matchingIndex)
	}, [product?.images, selectedColor])

	// Clamp selected image to valid range if data changes
	React.useEffect(() => {
		if (!product?.images?.length) return
		if (selectedImage >= product.images.length) setSelectedImage(0)
	}, [product?.images?.length, selectedImage])

	// Reset image error when selection changes
	React.useEffect(() => {
		setImageError(false)
	}, [selectedImage, selectedColor])
	
	// Check if current selection is in stock
	const isColorInStock = useCallback(() => {
		const colorData = availableColors.find((c: VariantOption) => c.name === selectedColor)
		return colorData?.inStock ?? false
	}, [availableColors, selectedColor])
	
	const isSizeInStock = useCallback(() => {
		const sizeData = availableSizes.find((s: VariantOption) => s.name === selectedSize)
		return sizeData?.inStock ?? false
	}, [availableSizes, selectedSize])
	
	
	// Handle add to cart
	const handleAddToCart = async () => {
		if (!product || !selectedSize || !selectedColor) return
		
		setIsAdding(true)
		try {
			addToCart(product, quantity, selectedColor, selectedSize)
			// Show success feedback
			setTimeout(() => {
				setIsAdding(false)
			}, 500)
		} catch (error) {
			console.error("Error adding to cart:", error)
			setIsAdding(false)
		}
	}
	
	const discountedPrice = product.price * (1 - product.discount / 100)
	// Only check stock if selections are made, otherwise assume in stock
	const hasRequiredSelections = selectedColor && selectedSize
	const isOutOfStock = hasRequiredSelections ? (!isColorInStock() || !isSizeInStock()) : false
	
	return (
		<div className="bg-white text-neutral-900 overflow-hidden">
		
			{/* Breadcrumb */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="pt-24 px-4 bg-white"
			>
				<div className="container mx-auto flex items-center gap-2 text-sm text-neutral-600">
					<Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link>
					<span>/</span>
					<Link href="/products" className="hover:text-neutral-900 transition-colors">Products</Link>
					<span>/</span>
					<span className="text-neutral-900">{product.name}</span>
				</div>
			</motion.div>

			{/* Main Content */}
			<section className="py-12 px-4">
				<div className="container mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
						{/* Image Section */}
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							className="space-y-4"
						>
							{/* Main Image */}
							<motion.div
								className="relative h-96 sm:h-[500px] overflow-hidden rounded-lg bg-neutral-50 border border-neutral-200"
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.3 }}
							>
								{/* Main image navigation */}
								{product.images.length > 1 && (
									<>
										<button
											onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
											className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white"
										>
											<ChevronLeft className="w-5 h-5" />
										</button>
										<button
											onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
											className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white"
										>
											<ChevronRight className="w-5 h-5" />
										</button>
									</>
								)}

								<AnimatePresence mode="wait">
									<motion.img
										key={selectedImage}
										src={imageError ? fallbackImage : (product.images[selectedImage] || fallbackImage)}
										alt={`${product.name} - Premium streetwear by Fear Insight - View ${selectedImage + 1}`}
										className="w-full h-full object-cover"
										onError={() => setImageError(true)}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.3 }}
									/>
								</AnimatePresence>
								
								{/* Image Counter */}
								<div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded text-sm text-white">
									{selectedImage + 1} / {product.images.length}
								</div>
							</motion.div>

							{/* Thumbnail Grid */}
							<div className="flex flex-wrap gap-2">
								{product.images.map((image: string, index: number) => (
									<motion.button
										key={index}
										onClick={() => setSelectedImage(index)}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
											selectedImage === index
												? "border-black ring-2 ring-neutral-400/50"
												: "border-neutral-200 hover:border-neutral-400"
										}`}
									>
										<img
											src={image}
											alt={`${product.name} thumbnail ${index + 1} - Fear Insight`}
											className="w-full h-full object-cover"
										/>
									</motion.button>
								))}
							</div>
						</motion.div>

						{/* Product Details */}
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							className="space-y-6"
						>
			{/* Category & Badges */}
			<div className="flex items-center gap-3">
				{product.featured && (
					<motion.span
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full"
					>
						FEATURED
					</motion.span>
				)}
				{product.best_seller && (
					<motion.span
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.1 }}
						className="bg-neutral-100 text-neutral-900 text-xs font-bold px-3 py-1 rounded-full border border-neutral-200"
					>
						BESTSELLER
					</motion.span>
				)}
			</div>							{/* name */}
							<div>
								<h1 className="text-4xl font-black text-neutral-900 mb-2">
									{product.name}
								</h1>
								<p className="text-neutral-600">{product.description}</p>
							</div>

			{/* Rating */}
			<div className="flex items-center gap-4 pb-4 border-b border-neutral-200">
				<div className="flex items-center gap-1">
					{[...Array(5)].map((_, i) => (
						<Star
							key={i}
							className={`w-5 h-5 ${
								i < Math.floor(product.ratings)
									? "fill-neutral-900 text-neutral-900"
									: "text-neutral-300"
							}`}
						/>
					))}
				</div>
				<span className="text-neutral-900 font-semibold">{product.ratings.toFixed(1)}</span>
			</div>							{/* Price */}
							<div className="space-y-2">
								<div className="flex items-center gap-4">
									<span className="text-4xl font-black text-neutral-900">
										${discountedPrice.toFixed(2)}
									</span>
									{product.discount > 0 && (
										<>
											<span className="text-xl text-neutral-600 line-through">
												${product.price.toFixed(2)}
											</span>
											<motion.span
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full"
											>
												-{product.discount}%
											</motion.span>
										</>
									)}
								</div>
								{product.discount > 0 && (
									<p className="text-sm text-neutral-600">
										You save ${(product.price - discountedPrice).toFixed(2)}
									</p>
								)}
							</div>

			{/* Color Selection */}
			{availableColors.length > 0 && (
				<div>
					<label className="block text-sm font-semibold text-neutral-900 mb-3">
						COLOR
					</label>
					<div className="flex flex-wrap gap-3">
						{availableColors.map((color: VariantOption) => (
							<motion.button
								key={color.name}
								onClick={() => setSelectedColor(color.name)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all capitalize ${
									selectedColor === color.name
										? "border-black bg-neutral-50"
										: "border-neutral-200 hover:border-neutral-400"
								}`}
							>
								<span 
									className="w-4 h-4 rounded-full border border-neutral-300"
									style={{ backgroundColor: getColorValue(color.name) }}
								/>
								<span className="text-sm font-medium">{color.name}</span>
							</motion.button>
						))}
					</div>
				</div>
			)}

			{/* Size Selection */}
			{availableSizes.length > 0 && (
				<div>
					<label className="block text-sm font-semibold text-neutral-900 mb-3">
						SIZE
					</label>
					<div className="grid grid-cols-5 gap-2">
						{availableSizes.map((size: VariantOption) => (
							<motion.button
								key={size.name}
								onClick={() => setSelectedSize(size.name)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`py-3 rounded-lg font-semibold transition-all ${
									selectedSize === size.name
										? "bg-black text-white"
										: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
								}`}
							>
								{size.name}
							</motion.button>
						))}
					</div>
				</div>
			)}

							{/* Quantity */}
							<div>
								<label className="block text-sm font-semibold text-neutral-900 mb-3">
									QUANTITY
								</label>
								<div className="flex items-center gap-4">
									<motion.button
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="w-12 h-12 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold border border-neutral-200"
									>
										−
									</motion.button>
									<span className="text-2xl font-bold text-neutral-900 w-8 text-center">
										{quantity}
									</span>
									<motion.button
										onClick={() => setQuantity(quantity + 1)}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="w-12 h-12 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold border border-neutral-200"
									>
										+
									</motion.button>
								</div>
							</div>

							{/* Add to Cart & Wishlist */}
							<div className="flex gap-4 pt-4">
								<motion.div
									className="flex-1"
									whileHover={{ scale: 1.03, y: -2 }}
									whileTap={{ scale: 0.98 }}
									transition={{ type: "spring", stiffness: 260, damping: 18 }}
								>
									<Button
										onClick={handleAddToCart}
										disabled={!selectedColor || !selectedSize || isAdding}
										className="w-full bg-black text-white hover:bg-neutral-800 h-14 font-semibold text-lg group disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isAdding ? (
											<motion.span
												animate={{ rotate: 360 }}
												transition={{ duration: 1, repeat: Infinity }}
											>
												Adding...
											</motion.span>
										) : !selectedColor || !selectedSize ? (
											"Select Color & Size"
										) : (
											<>
												<ShoppingBag className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
												Add to Cart
											</>
										)}
									</Button>
								</motion.div>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => setShowSizeChart(true)}
									className="w-14 h-14 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 flex items-center justify-center border border-neutral-200"
								>
									<Ruler className="w-5 h-5" />
								</motion.button>
							</div>

							{/* Product Details */}
							<div className="space-y-3 pt-4 border-t border-neutral-200">
								<div className="flex items-start gap-3">
									<Truck className="w-5 h-5 text-neutral-600 mt-1 flex-shrink-0" />
									<div>
										<p className="font-semibold text-neutral-900">Free Shipping</p>
										<p className="text-sm text-neutral-600">On orders over $75</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<RotateCcw className="w-5 h-5 text-neutral-600 mt-1 flex-shrink-0" />
									<div>
										<p className="font-semibold text-neutral-900">30-Day Returns</p>
										<p className="text-sm text-neutral-600">Easy returns & exchanges</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Shield className="w-5 h-5 text-neutral-600 mt-1 flex-shrink-0" />
									<div>
										<p className="font-semibold text-neutral-900">Secure Checkout</p>
										<p className="text-sm text-neutral-600">100% encrypted transactions</p>
									</div>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Description & Specifications */}
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6"
					>
						<div className="lg:col-span-2 space-y-4">
							<Card className="bg-white border-neutral-200 shadow-sm">
								<CardContent className="p-6 space-y-3">
									<h2 className="text-2xl font-bold text-neutral-900">Product Description</h2>
									<p className="text-neutral-600 leading-relaxed">
										{product.fullDescription}
									</p>
								</CardContent>
							</Card>

							<Card className="bg-white border-neutral-200 shadow-sm">
								<CardContent className="p-6 space-y-3">
									<h3 className="text-xl font-semibold text-neutral-900">Material & Care</h3>
									<p className="text-neutral-600">
										<strong>Material:</strong> 80% premium cotton, 20% polyester
									</p>
									<p className="text-neutral-600">
										<strong>Care Instructions:</strong> {product.care}
									</p>
								</CardContent>
							</Card>
						</div>

						<div>
							<Card className="bg-white border-neutral-200 shadow-sm">
								<CardContent className="p-6 space-y-4">
									<h3 className="font-bold text-neutral-900">Shipping Info</h3>
									<p className="text-sm text-neutral-600">
										{product.shipping}
									</p>
									<Button className="w-full bg-black text-white hover:bg-neutral-800">
										<Link href="/shipping-returns">Learn More</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</motion.div>
				</div>
			</section>

		
			<SizeChart isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
		</div>
	)
}
