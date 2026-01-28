"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X, Edit, ImagePlus, Trash2, Package, Star, AlertCircle } from "lucide-react"
import { Product } from "@/types/products"

export default function ProductsTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addImagesDialogOpen, setAddImagesDialogOpen] = useState(false)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "0",
    category_id: "",
    colors: "",
    sizes: "",
    featured: false,
    best_seller: false,
  })
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "0",
    category_id: "",
    colors: "",
    sizes: "",
    featured: false,
    best_seller: false,
  })

  // Fetch categories and products on mount
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data || [])
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, category_id: data[0].id }))
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages((prev) => [...prev, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewImages((prev) => [...prev, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (images.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      })
      return
    }

    if (!formData.category_id) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const submitFormData = new FormData()
      
      const colors = formData.colors
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c)
      const sizes = formData.sizes
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)

      const productData = {
        ...formData,
        colors: colors.length > 0 ? colors : ["Black"],
        sizes: sizes.length > 0 ? sizes : ["S", "M", "L", "XL"],
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
      }

      submitFormData.append("productData", JSON.stringify(productData))
      images.forEach((image) => {
        submitFormData.append("images", image)
      })

      const res = await fetch("/api/admin/upload-product", {
        method: "POST",
        body: submitFormData,
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Success",
          description: "Product uploaded successfully!",
        })
        setFormData({
          name: "",
          description: "",
          price: "",
          discount: "0",
          category_id: categories[0]?.id || "",
          colors: "",
          sizes: "",
          featured: false,
          best_seller: false,
        })
        setImages([])
        setPreviews([])
        fetchProducts()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to upload product",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setEditFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      discount: product.discount.toString(),
      category_id: product.category_id,
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : "",
      sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : "",
      featured: product.featured,
      best_seller: product.best_seller,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    setLoading(true)

    try {
      const colors = editFormData.colors
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c)
      const sizes = editFormData.sizes
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)

      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        discount: parseFloat(editFormData.discount),
        category_id: editFormData.category_id,
        colors: colors.length > 0 ? colors : ["Black"],
        sizes: sizes.length > 0 ? sizes : ["S", "M", "L", "XL"],
        featured: editFormData.featured,
        best_seller: editFormData.best_seller,
      }

      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Success",
          description: "Product updated successfully!",
        })
        setEditDialogOpen(false)
        fetchProducts()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update product",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddImages = async () => {
    if (!editingProduct || newImages.length === 0) return

    setLoading(true)

    try {
      const formData = new FormData()
      newImages.forEach((image) => {
        formData.append("images", image)
      })

      const res = await fetch(`/api/admin/products/${editingProduct.id}/add-images`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Success",
          description: `${data.newImages?.length || 0} image(s) added successfully!`,
        })
        setAddImagesDialogOpen(false)
        setNewImages([])
        setNewImagePreviews([])
        fetchProducts()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add images",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while uploading images",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveImage = async (productId: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to remove this image?")) return

    try {
      // Extract filename from URL (works for both local and Supabase Storage URLs)
      const urlParts = imageUrl.split("/")
      const filename = urlParts[urlParts.length - 1].split("?")[0] // Remove query params if any

      // Fetch current product
      const res = await fetch(`/api/admin/products/${productId}`)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)

      const product = data.product
      const updatedImages = product.images.filter((img: string) => img !== imageUrl)

      // Update product (removes image URL from database)
      const updateRes = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: updatedImages }),
      })

      if (updateRes.ok) {
        // Try to delete from Supabase Storage (if it's a Supabase URL)
        if (imageUrl.includes("supabase.co/storage")) {
          try {
            await fetch(`/api/admin/products/${productId}/delete-image`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filename }),
            })
          } catch (err) {
            // Ignore storage deletion errors - image is already removed from product
            console.log("Note: Image removed from product but may still exist in storage")
          }
        }

        toast({
          title: "Success",
          description: "Image removed successfully!",
        })
        fetchProducts()
      } else {
        throw new Error("Failed to remove image")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      })
    }
  }

  return (
    <Tabs defaultValue="manage" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-stone-900 border border-stone-800 rounded-lg p-1">
        <TabsTrigger 
          value="manage" 
          className="data-[state=active]:bg-stone-800 data-[state=active]:text-stone-100 text-stone-400 text-xs sm:text-sm py-2 rounded-md"
        >
          <Package className="w-4 h-4 mr-1 sm:mr-2" />
          Manage Products
        </TabsTrigger>
        <TabsTrigger 
          value="add" 
          className="data-[state=active]:bg-stone-800 data-[state=active]:text-stone-100 text-stone-400 text-xs sm:text-sm py-2 rounded-md"
        >
          <Upload className="w-4 h-4 mr-1 sm:mr-2" />
          Add New
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manage" className="mt-4 sm:mt-6">
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="px-4 sm:px-6 py-4">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Package className="w-5 h-5" />
              All Products ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-stone-600 mx-auto mb-4" />
                <p className="text-stone-400">No products found</p>
                <p className="text-stone-500 text-sm mt-1">Add your first product to get started</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {products.map((product) => (
                  <Card key={product.id} className="bg-stone-800 border-stone-700 overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                          {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-stone-700"
                          />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-700 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-stone-500" />
                            </div>
                        )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h3 className="text-base sm:text-lg font-semibold text-stone-100 mb-1 truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-stone-400 mb-2 line-clamp-2">
                            {product.description || "No description"}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-xs sm:text-sm">
                            <span className="text-stone-200 font-semibold">${product.price}</span>
                            {product.discount > 0 && (
                              <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs">
                                -{product.discount}%
                              </span>
                            )}
                            {product.featured && (
                              <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Featured
                              </span>
                            )}
                            {product.best_seller && (
                              <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">
                                Best Seller
                              </span>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                            <Button
                              size="sm"
                              onClick={() => openEditDialog(product)}
                              className="bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs sm:text-sm h-8 px-3"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product)
                                setAddImagesDialogOpen(true)
                              }}
                              className="bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs sm:text-sm h-8 px-3"
                            >
                              <ImagePlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Add Images
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="add" className="mt-4 sm:mt-6">
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="px-4 sm:px-6 py-4">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Product
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name and Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-stone-200 text-sm">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100 h-10"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-stone-200 text-sm">
                    Price ($) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100 h-10"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-stone-200 text-sm">
                  Category *
                </Label>
                {categories.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-stone-400 bg-stone-800 p-3 rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading categories...
                  </div>
                ) : (
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                    required
                  >
                    <SelectTrigger className="bg-stone-800 border-stone-700 text-stone-100 h-10">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-800 border-stone-700">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-stone-100">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-stone-200 text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-stone-800 border-stone-700 text-stone-100 min-h-[80px]"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              {/* Colors and Sizes Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="colors" className="text-stone-200 text-sm">
                    Colors (comma-separated)
                  </Label>
                  <Input
                    id="colors"
                    value={formData.colors}
                    onChange={(e) =>
                      setFormData({ ...formData, colors: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100 h-10"
                    placeholder="Black, Navy, White"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sizes" className="text-stone-200 text-sm">
                    Sizes (comma-separated)
                  </Label>
                  <Input
                    id="sizes"
                    value={formData.sizes}
                    onChange={(e) =>
                      setFormData({ ...formData, sizes: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100 h-10"
                    placeholder="S, M, L, XL"
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label className="text-stone-200 text-sm flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" />
                  Product Images *
                </Label>
                
                {/* Image Previews */}
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                  {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-stone-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow-lg transition-colors"
                      >
                          <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                )}
                
                {/* Upload Input */}
                <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                    className="bg-stone-800 border-stone-700 text-stone-100 h-10 file:bg-stone-700 file:text-stone-100 file:border-0 file:mr-3 file:px-3 file:h-10 file:cursor-pointer"
                />
              </div>

                {previews.length === 0 && (
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    At least one image is required
                  </p>
                )}
              </div>

              {/* Featured & Best Seller Checkboxes */}
              <div className="flex flex-wrap gap-6 py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked as boolean })
                    }
                    className="border-stone-600"
                  />
                  <Label htmlFor="featured" className="text-stone-200 text-sm cursor-pointer flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    Featured
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="best_seller"
                    checked={formData.best_seller}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, best_seller: checked as boolean })
                    }
                    className="border-stone-600"
                  />
                  <Label htmlFor="best_seller" className="text-stone-200 text-sm cursor-pointer">
                    Best Seller
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-600 hover:to-stone-700 text-stone-100 h-11 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Product
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Product
            </DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-stone-200 text-sm">Product Name *</Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100 h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-200 text-sm">Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, price: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100 h-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-200 text-sm">Category *</Label>
                <Select
                  value={editFormData.category_id}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, category_id: value })
                  }
                >
                  <SelectTrigger className="bg-stone-800 border-stone-700 text-stone-100 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-800 border-stone-700">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-stone-100">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-200 text-sm">Description</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className="bg-stone-800 border-stone-700 text-stone-100 min-h-[80px]"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-stone-200 text-sm">Colors (comma-separated)</Label>
                  <Input
                    value={editFormData.colors}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, colors: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-200 text-sm">Sizes (comma-separated)</Label>
                  <Input
                    value={editFormData.sizes}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, sizes: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100 h-10"
                  />
                </div>
              </div>

              {/* Current Images */}
              <div className="space-y-2">
                <Label className="text-stone-200 text-sm">Current Images</Label>
                <div className="flex flex-wrap gap-2">
                  {editingProduct.images?.length > 0 ? (
                    editingProduct.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Product image ${idx + 1}`}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-stone-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(editingProduct.id, img)}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    ))
                  ) : (
                    <p className="text-stone-500 text-sm">No images</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editFormData.featured}
                    onCheckedChange={(checked) =>
                      setEditFormData({ ...editFormData, featured: checked as boolean })
                    }
                    className="border-stone-600"
                  />
                  <Label className="text-stone-200 text-sm cursor-pointer">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editFormData.best_seller}
                    onCheckedChange={(checked) =>
                      setEditFormData({ ...editFormData, best_seller: checked as boolean })
                    }
                    className="border-stone-600"
                  />
                  <Label className="text-stone-200 text-sm cursor-pointer">Best Seller</Label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="border-stone-700 text-stone-200 hover:bg-stone-800 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProduct}
                  disabled={loading}
                  className="bg-stone-700 hover:bg-stone-600 text-stone-100 w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Images Dialog */}
      <Dialog open={addImagesDialogOpen} onOpenChange={setAddImagesDialogOpen}>
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-w-[95vw] sm:max-w-lg p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              Add Images
            </DialogTitle>
            {editingProduct && (
              <p className="text-sm text-stone-400 mt-1">
                Adding to: {editingProduct.name}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3">
              {newImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-stone-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow-lg transition-colors"
                  >
                      <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            )}
            
            {/* File Input */}
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewImageChange}
              className="bg-stone-800 border-stone-700 text-stone-100 h-10 file:bg-stone-700 file:text-stone-100 file:border-0 file:mr-3 file:px-3 file:h-10"
            />
            
            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAddImagesDialogOpen(false)
                  setNewImages([])
                  setNewImagePreviews([])
                }}
                className="border-stone-700 text-stone-200 hover:bg-stone-800 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddImages}
                disabled={loading || newImages.length === 0}
                className="bg-stone-700 hover:bg-stone-600 text-stone-100 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Add {newImages.length} Image{newImages.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}
