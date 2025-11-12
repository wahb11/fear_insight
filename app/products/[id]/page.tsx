"use client"

import React, { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/app/context/CartContext"
import { Star, ShoppingBag, Heart, Share2, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight, Mail, Instagram, Twitter, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

// Product database (same as products page)

const products = [
	{
		id: "1",
		title: "DIVINE HOODIE",
		price: 89,
		discount: 18,
		originalPrice: 109,
		color: "#d2b48c",
		colorName: "Tan",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.9,
		reviews: 127,
		isNew: true,
		isBestseller: false,
		description: "Premium cotton blend hoodie with embroidered divine inspiration details. Crafted from 80% cotton and 20% polyester, this hoodie combines comfort with style. Features include drawstring hood, kangaroo pocket, and reinforced seams for durability.",
		fullDescription: "Experience divine comfort with our premium Divine Hoodie. Each piece is meticulously crafted to deliver both style and substance. The hoodie features an embroidered divine inspiration detail on the chest, complemented by a spacious kangaroo pocket perfect for keeping your essentials. The brushed fleece interior ensures maximum warmth without sacrificing breathability, making it ideal for any season.",
		images: [
			"/placeholder.svg?height=600&width=600&text=Divine+Hoodie+Main",
			"/placeholder.svg?height=600&width=600&text=Divine+Hoodie+Front",
			"/placeholder.svg?height=600&width=600&text=Divine+Hoodie+Back",
			"/placeholder.svg?height=600&width=600&text=Divine+Hoodie+Detail",
		],
		colors: [
			{ name: "Tan", hex: "#d2b48c", stock: 10 },
			{ name: "Charcoal", hex: "#36454f", stock: 8 },
			{ name: "Black", hex: "#000000", stock: 15 },
		],
		colorStock: [{ Tan: 10, Charcoal: 8, Black: 15 }],
		sizeStock: [{ S: 5, M: 8, L: 10, XL: 7, XXL: 4 }],
		material: "80% Cotton, 20% Polyester",
		care: "Machine wash cold with like colors. Tumble dry low. Do not bleach. Turn inside out before washing.",
		shipping: "Free shipping on orders over $75. Standard: 5-7 business days. Express: 2-3 business days.",
	},
	{
		id: "2",
		title: "FAITH HOODIE",
		price: 95,
		discount: 0,
		originalPrice: null,
		color: "#36454f",
		colorName: "Charcoal",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.8,
		reviews: 89,
		isNew: false,
		isBestseller: true,
		description: "Bold faith statement piece with premium construction and comfort. A bestseller that resonates with our community.",
		fullDescription: "Make a bold statement with the Faith Hoodie. This bestselling piece combines premium comfort with a powerful message. The hoodie features a large embroidered 'FAITH' design across the chest, perfectly positioned for maximum impact. Built from the same premium cotton blend, it delivers uncompromising comfort and durability.",
		images: [
			"/placeholder.svg?height=600&width=600&text=Faith+Hoodie+Main",
			"/placeholder.svg?height=600&width=600&text=Faith+Hoodie+Front",
			"/placeholder.svg?height=600&width=600&text=Faith+Hoodie+Back",
			"/placeholder.svg?height=600&width=600&text=Faith+Hoodie+Detail",
		],
		colors: [
			{ name: "Charcoal", hex: "#36454f", stock: 12 },
			{ name: "Black", hex: "#000000", stock: 15 },
		],
		colorStock: [{ Charcoal: 12, Black: 15 }],
		sizeStock: [{ S: 6, M: 10, L: 12, XL: 8, XXL: 5 }],
		material: "80% Cotton, 20% Polyester",
		care: "Machine wash cold with like colors. Tumble dry low. Do not bleach. Turn inside out before washing.",
		shipping: "Free shipping on orders over $75. Standard: 5-7 business days. Express: 2-3 business days.",
	},
	{
		id: "3",
		title: "BLESSED HOODIE",
		price: 92,
		discount: 0,
		originalPrice: null,
		color: "#ffd700",
		colorName: "Gold",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.9,
		reviews: 156,
		isNew: false,
		isBestseller: true,
		description: "Luxurious gold-toned hoodie celebrating divine blessings. A customer favorite.",
		fullDescription: "Celebrate life's blessings with our Blessed Hoodie. The rich gold tone stands out while maintaining a sophisticated aesthetic. Featuring an embroidered blessing motif, this hoodie is a testament to gratitude and divine favor.",
		images: [
			"/placeholder.svg?height=600&width=600&text=Blessed+Hoodie+Main",
			"/placeholder.svg?height=600&width=600&text=Blessed+Hoodie+Front",
			"/placeholder.svg?height=600&width=600&text=Blessed+Hoodie+Back",
			"/placeholder.svg?height=600&width=600&text=Blessed+Hoodie+Detail",
		],
		colors: [
			{ name: "Gold", hex: "#ffd700", stock: 14 },
			{ name: "Tan", hex: "#d2b48c", stock: 0 },
		],
		colorStock: [{ Gold: 14, Tan: 0 }],
		sizeStock: [{ S: 7, M: 9, L: 11, XL: 0, XXL: 3 }],
		material: "80% Cotton, 20% Polyester",
		care: "Machine wash cold with like colors. Tumble dry low. Do not bleach. Turn inside out before washing.",
		shipping: "Free shipping on orders over $75. Standard: 5-7 business days. Express: 2-3 business days.",
	},
	{
		id: "4",
		title: "GRACE HOODIE",
		price: 88,
		discount: 10,
		originalPrice: 98,
		color: "#f5f5dc",
		colorName: "Cream",
		sizes: ["S", "M", "L", "XL", "XXL"],
		rating: 4.7,
		reviews: 73,
		isNew: true,
		isBestseller: false,
		description: "Elegant cream hoodie embodying grace and spiritual elegance.",
		fullDescription: "Embrace elegance with the Grace Hoodie. The soft cream tone paired with delicate embroidered details creates a refined aesthetic. This piece speaks to those seeking a more subtle yet powerful expression of their spiritual journey.",
		images: [
			"/placeholder.svg?height=600&width=600&text=Grace+Hoodie+Main",
			"/placeholder.svg?height=600&width=600&text=Grace+Hoodie+Front",
			"/placeholder.svg?height=600&width=600&text=Grace+Hoodie+Back",
			"/placeholder.svg?height=600&width=600&text=Grace+Hoodie+Detail",
		],
		colors: [
			{ name: "Cream", hex: "#f5f5dc", stock: 9 },
			{ name: "Tan", hex: "#d2b48c", stock: 0 },
		],
		colorStock: [{ Cream: 9, Tan: 0 }],
		sizeStock: [{ S: 4, M: 7, L: 9, XL: 6, XXL: 0 }],
		material: "80% Cotton, 20% Polyester",
		care: "Machine wash cold with like colors. Tumble dry low. Do not bleach. Turn inside out before washing.",
		shipping: "Free shipping on orders over $75. Standard: 5-7 business days. Express: 2-3 business days.",
	},
]

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About", href: "/#about" },
  { name: "Contact", href: "/#contact" },
]

export default function ProductDetailPage() {
	const params = useParams()
	const router = useRouter()
	const { addToCart } = useCart()
	
	const product = products.find((p) => p.id === params.id as string)
	
	// States
	const [selectedImage, setSelectedImage] = useState(0)
	const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || "")
	const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "")
	const [quantity, setQuantity] = useState(1)
	const [isAdding, setIsAdding] = useState(false)
	
	const carouselRef = useRef<HTMLDivElement>(null)
	
	// Get current color stock
	const getColorStock = useCallback(() => {
		if (!product?.colorStock?.[0]) return 0
		return product.colorStock[0][selectedColor as keyof typeof product.colorStock[0]] ?? 0
	}, [product, selectedColor])
	
	// Get current size stock
	const getSizeStock = useCallback(() => {
		if (!product?.sizeStock?.[0]) return 0
		return product.sizeStock[0][selectedSize as keyof typeof product.sizeStock[0]] ?? 0
	}, [product, selectedSize])
	
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
			addToCart({
				id: product.id,
				title: product.title,
				price: product.price,
				quantity,
				color: selectedColor,
			})
			// Show success feedback
			setTimeout(() => {
				setIsAdding(false)
			}, 500)
		} catch (error) {
			console.error("Error adding to cart:", error)
			setIsAdding(false)
		}
	}
	
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
			{/* Navigation */}
			<motion.nav
				initial={{ y: -100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 1, type: "spring", stiffness: 100 }}
				className="fixed top-0 w-full z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800"
			>
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="text-2xl font-bold bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text text-transparent"
					>
						<Link href="/">FEAR INSIGHT</Link>
					</motion.div>

					<motion.div
						className="hidden md:flex space-x-8"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5, staggerChildren: 0.1 }}
					>
						{navigation.map((item, index) => (
							<motion.div
								key={item.name}
								initial={{ y: -20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.5 + index * 0.1 }}
							>
								<Link
									href={item.href}
									className="hover:text-stone-300 transition-colors relative group"
								>
									{item.name}
									<motion.div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-stone-100 to-stone-500 group-hover:w-full transition-all duration-300" />
								</Link>
							</motion.div>
						))}
					</motion.div>
				</div>
			</motion.nav>

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
					<span className="text-stone-200">{product.title}</span>
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
										alt={product.title}
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
									{product.images.map((image, index) => (
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
												alt={`${product.title} ${index}`}
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
								{product.isNew && (
									<motion.span
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="bg-stone-100 text-stone-950 text-xs font-bold px-3 py-1 rounded-full"
									>
										NEW
									</motion.span>
								)}
								{product.isBestseller && (
									<motion.span
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: 0.1 }}
										className="bg-stone-800 text-stone-100 text-xs font-bold px-3 py-1 rounded-full border border-stone-600"
									>
										BESTSELLER
									</motion.span>
								)}
							</div>

							{/* Title */}
							<div>
								<h1 className="text-4xl font-black text-stone-100 mb-2">
									{product.title}
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
												i < Math.floor(product.rating)
													? "fill-stone-400 text-stone-400"
													: "text-stone-600"
											}`}
										/>
									))}
								</div>
								<span className="text-stone-100 font-semibold">{product.rating}</span>
								<span className="text-stone-400">({product.reviews} reviews)</span>
							</div>

							{/* Price */}
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
							{product.colors && product.colors.length > 0 && (
								<div>
									<label className="block text-sm font-semibold text-stone-200 mb-3">
										COLOR ({colorStock} in stock)
									</label>
									<div className="flex flex-wrap gap-3">
										{product.colors.map((color) => {
											const hasStock = product.colorStock?.[0]?.[color.name as keyof typeof product.colorStock[0]] ?? 0 > 0
											if (!hasStock) return null
											
											return (
												<motion.button
													key={color.name}
													onClick={() => setSelectedColor(color.name)}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
														selectedColor === color.name
															? "border-stone-100 bg-stone-800/50"
															: "border-stone-700 hover:border-stone-500"
													}`}
												>
													<div
														className="w-6 h-6 rounded-full border-2 border-stone-600"
														style={{ backgroundColor: color.hex }}
													/>
													<span className="text-sm font-medium">{color.name}</span>
												</motion.button>
											)
										})}
									</div>
								</div>
							)}

							{/* Size Selection */}
							{product.sizes && product.sizes.length > 0 && (
								<div>
									<label className="block text-sm font-semibold text-stone-200 mb-3">
										SIZE ({sizeStock} in stock)
									</label>
									<div className="grid grid-cols-5 gap-2">
										{product.sizes.map((size) => {
											const stock = product.sizeStock?.[0]?.[size as keyof typeof product.sizeStock[0]] ?? 0
											const hasStock = stock > 0
											if (!hasStock) return null
											
											return (
												<motion.button
													key={size}
													onClick={() => setSelectedSize(size)}
													whileHover={hasStock ? { scale: 1.05 } : {}}
													whileTap={hasStock ? { scale: 0.95 } : {}}
													disabled={!hasStock}
													className={`py-3 rounded-lg font-semibold transition-all ${
														selectedSize === size
															? "bg-stone-100 text-stone-950"
															: hasStock
															? "bg-stone-800 text-stone-100 hover:bg-stone-700"
															: "bg-stone-900 text-stone-600 cursor-not-allowed opacity-50"
													}`}
												>
													{size}
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
										disabled={isOutOfStock || isAdding}
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

			{/* Footer */}
			<footer className="py-12 px-4 bg-stone-950 border-t border-stone-800 mt-16">
				<div className="container mx-auto">
					<motion.div
						className="grid grid-cols-1 md:grid-cols-4 gap-8"
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, staggerChildren: 0.1 }}
						viewport={{ once: true }}
					>
						<motion.div
							className="col-span-1 md:col-span-2"
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
						>
							<h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-stone-100 to-stone-500 bg-clip-text text-transparent">
								FEAR INSIGHT
							</h3>
							<p className="text-stone-400 mb-4 max-w-md">
								DIRECTED BY GOD - Premium streetwear that speaks to your soul and inspires fearless faith.
							</p>
							<div className="mb-4">
								<p className="text-stone-300 mb-2">Get in touch:</p>
								<a
									href="mailto:wahbusman@fearinsight.com"
									className="text-stone-100 hover:text-stone-300 transition-colors flex items-center gap-2"
								>
									<Mail className="w-4 h-4" />
									wahbusman@fearinsight.com
								</a>
							</div>
							<div className="flex space-x-4">
								{[Instagram, Twitter, Mail].map((Icon, index) => (
									<motion.a
										key={index}
										whileHover={{ scale: 1.2, rotate: 5 }}
										whileTap={{ scale: 0.9 }}
										href="#"
										className="text-stone-400 hover:text-stone-300 transition-colors"
									>
										<Icon className="w-6 h-6" />
									</motion.a>
								))}
							</div>
						</motion.div>

						{[
							{
								title: "Quick Links",
								items: [
									{ name: "Home", href: "/" },
									{ name: "Products", href: "/products" },
									{ name: "About", href: "/#about" },
									{ name: "Contact", href: "/#contact" },
								],
							},
							{
								title: "Support",
								items: [
									{ name: "Size Guide", href: "/products" },
									{ name: "Shipping & Returns", href: "/shipping-returns" },
									{ name: "FAQ", href: "/faq" },
									{ name: "Contact Us", href: "/#contact" },
								],
							},
						].map((section, sectionIndex) => (
							<motion.div
								key={section.title}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: sectionIndex * 0.2 }}
								viewport={{ once: true }}
							>
								<h4 className="text-lg font-semibold mb-4 text-stone-100">{section.title}</h4>
								<ul className="space-y-2 text-stone-400">
									{section.items.map((item, itemIndex) => (
										<motion.li
											key={item.name}
											initial={{ opacity: 0, x: -20 }}
											whileInView={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.6, delay: sectionIndex * 0.2 + itemIndex * 0.1 }}
											viewport={{ once: true }}
										>
											<motion.div whileHover={{ x: 5 }}>
												<Link href={item.href} className="hover:text-stone-300 transition-colors">
													{item.name}
												</Link>
											</motion.div>
										</motion.li>
									))}
								</ul>
							</motion.div>
						))}
					</motion.div>

					<motion.div
						className="border-t border-stone-800 mt-8 pt-8 text-center text-stone-400"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.5 }}
						viewport={{ once: true }}
					>
						<p>&copy; {new Date().getFullYear()} FEAR INSIGHT. All rights reserved. DIRECTED BY GOD.</p>
						<p className="mt-2 text-sm">Contact us: wahbusman@fearinsight.com</p>
					</motion.div>
				</div>
			</footer>
		</div>
	)
}
