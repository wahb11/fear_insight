"use client"

import React, { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/app/context/CartContext"
import { Star, ShoppingBag, Heart, Share2, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight, Mail, Instagram, Twitter, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAllProducts } from "@/hooks/useAllProducts"





export default function ProductDetailPage() {
	const { data: products, isLoading, error } = useAllProducts()
	const params = useParams()
	const router = useRouter()
	const { addToCart } = useCart()



	const product = products ? products.find((p) => p.id === params.id as string) : null

	// Extract available colors and sizes dynamically from the product data
	const availableColors = React.useMemo(() => {
		if (!product?.colors?.length) return []
		return product.colors.flatMap((colorObj: Record<string, number>) => 
			Object.entries(colorObj).map(([colorName, stock]) => ({
				name: colorName,
				stock: stock
			}))
		)
	}, [product])

	const availableSizes = React.useMemo(() => {
		if (!product?.sizes?.length) return []
		return product.sizes.flatMap((sizeObj: Record<string, number>) => 
			Object.entries(sizeObj).map(([sizeName, stock]) => ({
				name: sizeName.toUpperCase(),
				stock: stock
			}))
		)
	}, [product])

	// States
	const [selectedImage, setSelectedImage] = useState(0)
	const [selectedColor, setSelectedColor] = useState("")
	const [selectedSize, setSelectedSize] = useState("")
	const [quantity, setQuantity] = useState(1)
	const [isAdding, setIsAdding] = useState(false)
	
	const carouselRef = useRef<HTMLDivElement>(null)

	// Set initial color and size when product loads
	React.useEffect(() => {
		if (availableColors.length > 0 && !selectedColor) {
			const firstAvailableColor = availableColors.find((c: { name: string; stock: number }) => c.stock > 0)
			if (firstAvailableColor) setSelectedColor(firstAvailableColor.name)
		}
	}, [availableColors, selectedColor])

	React.useEffect(() => {
		if (availableSizes.length > 0 && !selectedSize) {
			const firstAvailableSize = availableSizes.find((s: { name: string; stock: number }) => s.stock > 0)
			if (firstAvailableSize) setSelectedSize(firstAvailableSize.name)
		}
	}, [availableSizes, selectedSize])
	
	// Get current color stock
	const getColorStock = useCallback(() => {
		const colorData = availableColors.find((c: { name: string; stock: number }) => c.name === selectedColor)
		return colorData?.stock ?? 0
	}, [availableColors, selectedColor])
	
	// Get current size stock
	const getSizeStock = useCallback(() => {
		const sizeData = availableSizes.find((s: { name: string; stock: number }) => s.name === selectedSize)
		return sizeData?.stock ?? 0
	}, [availableSizes, selectedSize])
	
	// Scroll carousel
	const scrollCarousel = (direction: "left" | "right") => {
		if (!carouselRef.current) return
		const scrollAmount = 120
		carouselRef.current.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		})
	}
	
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
	

	if (isLoading) return <p>Loading...</p>
    if (error) return <p className="bg-stone-950 text-stone-100 min-h-screen flex items-center justify-center">Error fetching products</p>

	if (!product) {
		return (
			<div className="bg-stone-950 text-stone-100 min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
					<Link href="/products">
						<Button className="bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50">
							Back to Products
						</Button>
					</Link>
				</div>
			</div>
		)
	}
	
	const discountedPrice = product.price * (1 - product.discount / 100)
	const colorStock = getColorStock()
	const sizeStock = getSizeStock()
	const isOutOfStock = colorStock === 0 || sizeStock === 0
	
	return (
		<div className="bg-stone-950 text-stone-100 overflow-hidden">
		
			{/* Breadcrumb */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="pt-24 px-4 bg-stone-950"
			>
				<div className="container mx-auto flex items-center gap-2 text-sm text-stone-400">
					<Link href="/" className="hover:text-stone-300 transition-colors">Home</Link>
					<span>/</span>
					<Link href="/products" className="hover:text-stone-300 transition-colors">Products</Link>
					<span>/</span>
					<span className="text-stone-200">{product.name}</span>
				</div>
			</motion.div>

			{/* Main Content */}
			<section className="py-12 px-4">
				<div className="container mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						{/* Image Section */}
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							className="space-y-4"
						>
							{/* Main Image */}
							<motion.div
								className="relative h-96 sm:h-[500px] overflow-hidden rounded-lg bg-stone-900/50 border border-stone-800"
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.3 }}
							>
								<AnimatePresence mode="wait">
									<motion.img
										key={selectedImage}
										src={product.images[selectedImage]}
										alt={product.name}
										className="w-full h-full object-cover"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.3 }}
									/>
								</AnimatePresence>
								
								{/* Image Counter */}
								<div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded text-sm text-stone-200">
									{selectedImage + 1} / {product.images.length}
								</div>
							</motion.div>

							{/* Thumbnail Carousel */}
							<div className="relative">
								<div
									ref={carouselRef}
									className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
									style={{ scrollBehavior: "smooth" }}
								>
									{product.images.map((image: string, index: number) => (
										<motion.button
											key={index}
											onClick={() => setSelectedImage(index)}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
												selectedImage === index
													? "border-stone-100"
													: "border-stone-700 hover:border-stone-500"
											}`}
										>
											<img
												src={image}
												alt={`${product.name} ${index}`}
												className="w-full h-full object-cover"
											/>
										</motion.button>
									))}
								</div>

								{/* Carousel Controls */}
								{product.images.length > 4 && (
									<>
										<motion.button
											onClick={() => scrollCarousel("left")}
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
											className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-stone-800/80 hover:bg-stone-700 p-2 rounded-full text-stone-100 z-10"
										>
											<ChevronLeft className="w-5 h-5" />
										</motion.button>
										<motion.button
											onClick={() => scrollCarousel("right")}
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
											className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-stone-800/80 hover:bg-stone-700 p-2 rounded-full text-stone-100 z-10"
										>
											<ChevronRight className="w-5 h-5" />
										</motion.button>
									</>
								)}
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
						className="bg-stone-100 text-stone-950 text-xs font-bold px-3 py-1 rounded-full"
					>
						FEATURED
					</motion.span>
				)}
				{product.best_seller && (
					<motion.span
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.1 }}
						className="bg-stone-800 text-stone-100 text-xs font-bold px-3 py-1 rounded-full border border-stone-600"
					>
						BESTSELLER
					</motion.span>
				)}
			</div>							{/* name */}
							<div>
								<h1 className="text-4xl font-black text-stone-100 mb-2">
									{product.name}
								</h1>
								<p className="text-stone-400">{product.description}</p>
							</div>

			{/* Rating */}
			<div className="flex items-center gap-4 pb-4 border-b border-stone-800">
				<div className="flex items-center gap-1">
					{[...Array(5)].map((_, i) => (
						<Star
							key={i}
							className={`w-5 h-5 ${
								i < Math.floor(product.ratings)
									? "fill-stone-400 text-stone-400"
									: "text-stone-600"
							}`}
						/>
					))}
				</div>
				<span className="text-stone-100 font-semibold">{product.ratings.toFixed(1)}</span>
			</div>							{/* Price */}
							<div className="space-y-2">
								<div className="flex items-center gap-4">
									<span className="text-4xl font-black text-stone-100">
										${discountedPrice.toFixed(2)}
									</span>
									{product.discount > 0 && (
										<>
											<span className="text-xl text-stone-400 line-through">
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
									<p className="text-sm text-stone-400">
										You save ${(product.price - discountedPrice).toFixed(2)}
									</p>
								)}
							</div>

			{/* Color Selection */}
			{availableColors.length > 0 && (
				<div>
					<label className="block text-sm font-semibold text-stone-200 mb-3">
						COLOR {selectedColor && `(${colorStock} in stock)`}
					</label>
					<div className="flex flex-wrap gap-3">
						{availableColors.map((color: { name: string; stock: number }) => {
							const hasStock = color.stock > 0
							if (!hasStock) return null
							
							return (
								<motion.button
									key={color.name}
									onClick={() => setSelectedColor(color.name)}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${
										selectedColor === color.name
											? "border-stone-100 bg-stone-800/50"
											: "border-stone-700 hover:border-stone-500"
									}`}
								>
									<span className="text-sm font-medium">{color.name}</span>
									<span className="text-xs text-stone-400 ml-2">({color.stock})</span>
								</motion.button>
							)
						})}
					</div>
				</div>
			)}

			{/* Size Selection */}
			{availableSizes.length > 0 && (
				<div>
					<label className="block text-sm font-semibold text-stone-200 mb-3">
						SIZE {selectedSize && `(${sizeStock} in stock)`}
					</label>
					<div className="grid grid-cols-5 gap-2">
						{availableSizes.map((size: { name: string; stock: number }) => {
							const hasStock = size.stock > 0
							if (!hasStock) return null
							
							return (
								<motion.button
									key={size.name}
									onClick={() => setSelectedSize(size.name)}
									whileHover={hasStock ? { scale: 1.05 } : {}}
									whileTap={hasStock ? { scale: 0.95 } : {}}
									disabled={!hasStock}
									className={`py-3 rounded-lg font-semibold transition-all ${
										selectedSize === size.name
											? "bg-stone-100 text-stone-950"
											: hasStock
											? "bg-stone-800 text-stone-100 hover:bg-stone-700"
											: "bg-stone-900 text-stone-600 cursor-not-allowed opacity-50"
									}`}
								>
									{size.name}
								</motion.button>
							)
						})}
					</div>
				</div>
			)}

							{/* Quantity */}
							<div>
								<label className="block text-sm font-semibold text-stone-200 mb-3">
									QUANTITY
								</label>
								<div className="flex items-center gap-4">
									<motion.button
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="w-12 h-12 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold"
									>
										−
									</motion.button>
									<span className="text-2xl font-bold text-stone-100 w-8 text-center">
										{quantity}
									</span>
									<motion.button
										onClick={() => setQuantity(quantity + 1)}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="w-12 h-12 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold"
									>
										+
									</motion.button>
								</div>
							</div>

							{/* Add to Cart & Wishlist */}
							<div className="flex gap-4 pt-4">
								<motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
									<Button
										onClick={handleAddToCart}
										
										className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50 h-14 font-semibold text-lg group disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isAdding ? (
											<motion.span
												animate={{ rotate: 360 }}
												transition={{ duration: 1, repeat: Infinity }}
											>
												Adding...
											</motion.span>
										) : isOutOfStock ? (
											"Out of Stock"
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
									className="w-14 h-14 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 flex items-center justify-center"
								>
									<Heart className="w-5 h-5" />
								</motion.button>
							</div>

							{/* Product Details */}
							<div className="space-y-3 pt-4 border-t border-stone-800">
								<div className="flex items-start gap-3">
									<Truck className="w-5 h-5 text-stone-400 mt-1 flex-shrink-0" />
									<div>
										<p className="font-semibold text-stone-200">Free Shipping</p>
										<p className="text-sm text-stone-400">On orders over $75</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<RotateCcw className="w-5 h-5 text-stone-400 mt-1 flex-shrink-0" />
									<div>
										<p className="font-semibold text-stone-200">30-Day Returns</p>
										<p className="text-sm text-stone-400">Easy returns & exchanges</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Shield className="w-5 h-5 text-stone-400 mt-1 flex-shrink-0" />
									<div>
										<p className="font-semibold text-stone-200">Secure Checkout</p>
										<p className="text-sm text-stone-400">100% encrypted transactions</p>
									</div>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Description & Specifications */}
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8"
					>
						<div className="lg:col-span-2 space-y-6">
							<div>
								<h2 className="text-2xl font-bold text-stone-100 mb-4">Product Description</h2>
								<p className="text-stone-400 leading-relaxed">
									{product.fullDescription}
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-stone-200 mb-3">Material & Care</h3>
								<p className="text-stone-400 mb-3">
									<strong>Material:</strong> {product.material}
								</p>
								<p className="text-stone-400">
									<strong>Care Instructions:</strong> {product.care}
								</p>
							</div>
						</div>

						<div>
							<Card className="bg-stone-900/50 border-stone-700">
								<CardContent className="p-6 space-y-4">
									<h3 className="font-bold text-stone-100">Shipping Info</h3>
									<p className="text-sm text-stone-400">
										{product.shipping}
									</p>
									<Button className="w-full bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-900 text-stone-50">
										<Link href="/shipping-returns">Learn More</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</motion.div>
				</div>
			</section>

		
		</div>
	)
}
