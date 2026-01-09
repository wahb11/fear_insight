"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X, Edit, ImagePlus, Trash2 } from "lucide-react"
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
          description: "Images added successfully!",
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
        description: "An error occurred",
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
      <TabsList className="grid w-full grid-cols-2 bg-stone-900 border-stone-800">
        <TabsTrigger value="manage" className="data-[state=active]:bg-stone-800">
          Manage Products
        </TabsTrigger>
        <TabsTrigger value="add" className="data-[state=active]:bg-stone-800">
          Add New Product
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manage" className="mt-6">
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader>
            <CardTitle>All Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-stone-400 text-center py-8">No products found</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Card key={product.id} className="bg-stone-800 border-stone-700">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded border border-stone-700"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-stone-100 mb-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-stone-300 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex gap-2 text-sm text-stone-400">
                            <span>${product.price}</span>
                            {product.discount > 0 && (
                              <span className="text-red-400">-{product.discount}%</span>
                            )}
                            {product.featured && (
                              <span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs">
                                Featured
                              </span>
                            )}
                            {product.best_seller && (
                              <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">
                                Best Seller
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => openEditDialog(product)}
                              className="bg-stone-700 hover:bg-stone-600 text-stone-100"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product)
                                setAddImagesDialogOpen(true)
                              }}
                              className="bg-stone-700 hover:bg-stone-600 text-stone-100"
                            >
                              <ImagePlus className="w-4 h-4 mr-2" />
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

      <TabsContent value="add" className="mt-6">
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader>
            <CardTitle>Upload New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-stone-200">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-stone-200">
                    Price *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-stone-200">
                  Category *
                </Label>
                {categories.length === 0 ? (
                  <div className="text-sm text-stone-400">Loading categories...</div>
                ) : (
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                    required
                  >
                    <SelectTrigger className="bg-stone-800 border-stone-700 text-stone-100">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-stone-200">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-stone-800 border-stone-700 text-stone-100"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="colors" className="text-stone-200">
                    Colors (comma-separated)
                  </Label>
                  <Input
                    id="colors"
                    value={formData.colors}
                    onChange={(e) =>
                      setFormData({ ...formData, colors: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100"
                    placeholder="Black, Navy, White"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sizes" className="text-stone-200">
                    Sizes (comma-separated)
                  </Label>
                  <Input
                    id="sizes"
                    value={formData.sizes}
                    onChange={(e) =>
                      setFormData({ ...formData, sizes: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100"
                    placeholder="S, M, L, XL"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-200">Product Images *</Label>
                <div className="flex flex-wrap gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-24 h-24 object-cover rounded border border-stone-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="bg-stone-800 border-stone-700 text-stone-100"
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked as boolean })
                    }
                  />
                  <Label htmlFor="featured" className="text-stone-200">
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
                  />
                  <Label htmlFor="best_seller" className="text-stone-200">
                    Best Seller
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100"
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
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-stone-200">Product Name *</Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-200">Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, price: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-200">Category *</Label>
                <Select
                  value={editFormData.category_id}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, category_id: value })
                  }
                >
                  <SelectTrigger className="bg-stone-800 border-stone-700 text-stone-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-200">Description</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className="bg-stone-800 border-stone-700 text-stone-100"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-stone-200">Colors (comma-separated)</Label>
                  <Input
                    value={editFormData.colors}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, colors: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-200">Sizes (comma-separated)</Label>
                  <Input
                    value={editFormData.sizes}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, sizes: e.target.value })
                    }
                    className="bg-stone-800 border-stone-700 text-stone-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-200">Current Images</Label>
                <div className="flex flex-wrap gap-2">
                  {editingProduct.images?.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        alt={`Product image ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border border-stone-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(editingProduct.id, img)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editFormData.featured}
                    onCheckedChange={(checked) =>
                      setEditFormData({ ...editFormData, featured: checked as boolean })
                    }
                  />
                  <Label className="text-stone-200">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editFormData.best_seller}
                    onCheckedChange={(checked) =>
                      setEditFormData({ ...editFormData, best_seller: checked as boolean })
                    }
                  />
                  <Label className="text-stone-200">Best Seller</Label>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="border-stone-700 text-stone-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProduct}
                  disabled={loading}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-100"
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
        <DialogContent className="bg-stone-900 border-stone-800 text-stone-100">
          <DialogHeader>
            <DialogTitle>Add Images to {editingProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {newImagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border border-stone-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewImageChange}
              className="bg-stone-800 border-stone-700 text-stone-100"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setAddImagesDialogOpen(false)
                  setNewImages([])
                  setNewImagePreviews([])
                }}
                className="border-stone-700 text-stone-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddImages}
                disabled={loading || newImages.length === 0}
                className="bg-stone-800 hover:bg-stone-700 text-stone-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Add Images
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
