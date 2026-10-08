"use client"
import { useState, useEffect, useRef } from "react"
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
import { Loader2, Upload, X, Edit, ImagePlus, Trash2, Package, Star, AlertCircle, Wand2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import { Product } from "@/types/products"
import { getImageColor, setImageColor } from "@/lib/product-image-color"
import {
  buildPerColorSizes,
  colorSizeMapFromProduct,
  hasPerColorSizes,
  parseColorNames,
  parseFlatSizes,
} from "@/lib/product-variants"

const DEFAULT_SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"]

const IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export default function ProductsTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [uploadNotice, setUploadNotice] = useState<{
    type: "success" | "error"
    title: string
    message: string
  } | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [imageColors, setImageColors] = useState<string[]>([])
  const [newImageColors, setNewImageColors] = useState<string[]>([])
  const [dragOverCreate, setDragOverCreate] = useState(false)
  const [dragOverAdd, setDragOverAdd] = useState(false)
  const [assigningColor, setAssigningColor] = useState(false)
  const [perColorSizesCreate, setPerColorSizesCreate] = useState(false)
  const [perColorSizesEdit, setPerColorSizesEdit] = useState(false)
  const [createColorSizeMap, setCreateColorSizeMap] = useState<Record<string, string[]>>({})
  const [editColorSizeMap, setEditColorSizeMap] = useState<Record<string, string[]>>({})
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
  const [cutoutBusy, setCutoutBusy] = useState(false)
  const [cutoutProgress, setCutoutProgress] = useState("")
  const [cutoutPreview, setCutoutPreview] = useState<string | null>(null)
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null)
  const autoCutoutRef = useRef<HTMLInputElement | null>(null)
  const readyCutoutRef = useRef<HTMLInputElement | null>(null)
  const createImagesInputRef = useRef<HTMLInputElement | null>(null)
  const addImagesInputRef = useRef<HTMLInputElement | null>(null)

  // Fetch categories and products on mount
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories?all=1')
      const data = await res.json()
      const rows = Array.isArray(data) ? data : []
      // Prefer leaf categories (subs) first in the list for product assignment
      const byId = new Map(rows.map((c: any) => [c.id, c]))
      const labeled = rows.map((c: any) => {
        const parent = c.parent_id ? byId.get(c.parent_id) : null
        const label = parent ? `${parent.name} / ${c.name}` : c.name
        return { ...c, label }
      })
      labeled.sort((a: any, b: any) => String(a.label).localeCompare(String(b.label)))
      setCategories(labeled)
      if (labeled.length > 0) {
        // Prefer a subcategory if available
        const preferred = labeled.find((c: any) => c.parent_id) || labeled[0]
        setFormData(prev => ({ ...prev, category_id: preferred.id }))
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProducts = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setListLoading(true)
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setListLoading(false)
    }
  }

  const filterImageFiles = (picked: File[]) => {
    const files = picked.filter((file) => {
      const ok = IMAGE_EXT.test(file.name) || IMAGE_TYPES.includes(file.type)
      if (!ok) {
        toast({
          title: "Unsupported image",
          description: `${file.name} was skipped. Use JPG/PNG/WEBP/GIF (not HEIC).`,
          variant: "destructive",
        })
      }
      return ok
    })
    return files
  }

  const parseColorList = (raw: string) =>
    raw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)

  const parseSizeList = (raw: string) =>
    raw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)

  const syncColorSizeMap = (
    colors: string[],
    masterSizes: string[],
    prev: Record<string, string[]>
  ) => {
    const next: Record<string, string[]> = {}
    for (const color of colors) {
      next[color] = prev[color]?.length ? prev[color] : [...masterSizes]
    }
    return next
  }

  const toggleSizeForColor = (
    map: Record<string, string[]>,
    color: string,
    size: string
  ) => {
    const current = map[color] || []
    const has = current.includes(size)
    return {
      ...map,
      [color]: has ? current.filter((s) => s !== size) : [...current, size],
    }
  }

  const resolveSizesPayload = (
    perColor: boolean,
    colorsRaw: string,
    sizesRaw: string,
    colorMap: Record<string, string[]>
  ) => {
    const colors = parseColorList(colorsRaw)
    const flat = parseSizeList(sizesRaw)
    if (perColor && colors.length > 0) {
      const maps = buildPerColorSizes(colorMap)
      if (maps.length > 0) return maps
    }
    return flat.length > 0 ? flat : ["S", "M", "L", "XL"]
  }

  const appendCreateImages = (picked: File[]) => {
    const files = filterImageFiles(picked)
    if (files.length === 0) return
    setImages((prev) => [...prev, ...files])
    setImageColors((prev) => [...prev, ...files.map(() => "")])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const appendNewImages = (picked: File[]) => {
    const files = filterImageFiles(picked)
    if (files.length === 0) return
    setNewImages((prev) => [...prev, ...files])
    setNewImageColors((prev) => [...prev, ...files.map(() => "")])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    appendCreateImages(Array.from(e.target.files || []))
    e.target.value = ""
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    appendNewImages(Array.from(e.target.files || []))
    e.target.value = ""
  }

  const onDragOver =
    (setter: (v: boolean) => void) =>
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setter(true)
    }

  const onDragLeave =
    (setter: (v: boolean) => void) =>
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setter(false)
    }

  const onDropCreate = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCreate(false)
    appendCreateImages(Array.from(e.dataTransfer.files || []))
  }

  const onDropAdd = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverAdd(false)
    appendNewImages(Array.from(e.dataTransfer.files || []))
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setImageColors((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setNewImageColors((prev) => prev.filter((_, i) => i !== index))
  }

  const moveItem = <T,>(list: T[], from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) return list
    const next = [...list]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return next
  }

  const moveCreateImage = (from: number, to: number) => {
    setImages((prev) => moveItem(prev, from, to))
    setPreviews((prev) => moveItem(prev, from, to))
    setImageColors((prev) => moveItem(prev, from, to))
  }

  const moveNewImage = (from: number, to: number) => {
    setNewImages((prev) => moveItem(prev, from, to))
    setNewImagePreviews((prev) => moveItem(prev, from, to))
    setNewImageColors((prev) => moveItem(prev, from, to))
  }

  const persistEditingImages = async (
    nextImages: string[],
    previous: string[],
    successMessage: string
  ) => {
    if (!editingProduct) return false
    setEditingProduct({ ...editingProduct, images: nextImages })
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}/reorder-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: nextImages }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setEditingProduct({ ...editingProduct, images: previous })
        toast({
          title: "Could not update images",
          description: data?.error || "Failed to save image changes",
          variant: "destructive",
        })
        return false
      }
      if (Array.isArray(data?.images)) {
        setEditingProduct((prev) => (prev ? { ...prev, images: data.images } : prev))
      }
      fetchProducts({ silent: true })
      toast({ title: "Saved", description: successMessage })
      return true
    } catch (error: any) {
      setEditingProduct({ ...editingProduct, images: previous })
      toast({
        title: "Could not update images",
        description: error?.message || "Failed to save image changes",
        variant: "destructive",
      })
      return false
    }
  }

  const reorderEditingImages = async (from: number, to: number) => {
    if (!editingProduct?.images?.length) return
    if (to < 0 || to >= editingProduct.images.length || from === to) return
    const previous = editingProduct.images
    const nextImages = moveItem(previous, from, to)
    await persistEditingImages(
      nextImages,
      previous,
      "Image order saved. The first image is the main product photo."
    )
  }

  const assignEditingImageColor = async (index: number, color: string) => {
    if (!editingProduct?.images?.[index]) return
    const previous = editingProduct.images
    const nextImages = previous.map((url, i) =>
      i === index ? setImageColor(url, color || null) : url
    )
    setAssigningColor(true)
    await persistEditingImages(
      nextImages,
      previous,
      color
        ? `This photo will show when shoppers pick "${color}".`
        : "Color link removed from this photo."
    )
    setAssigningColor(false)
  }

  const notifyUpload = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setUploadNotice({ type, title, message })
    toast({
      title,
      description: message,
      variant: type === "error" ? "destructive" : "default",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadNotice(null)
    
    if (images.length === 0) {
      notifyUpload("error", "Product not added", "Please upload at least one image.")
      return
    }

    if (!formData.category_id) {
      notifyUpload("error", "Product not added", "Please select a category.")
      return
    }

    if (!formData.name.trim()) {
      notifyUpload("error", "Product not added", "Please enter a product name.")
      return
    }

    if (!formData.price || Number(formData.price) <= 0) {
      notifyUpload("error", "Product not added", "Please enter a valid price.")
      return
    }

    setLoading(true)

    try {
      const submitFormData = new FormData()
      
      const colors = parseColorList(formData.colors)
      const sizes = resolveSizesPayload(
        perColorSizesCreate,
        formData.colors,
        formData.sizes,
        createColorSizeMap
      )

      const productData = {
        ...formData,
        colors: colors.length > 0 ? colors : ["Black"],
        sizes,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
        imageColors,
      }

      submitFormData.append("productData", JSON.stringify(productData))
      images.forEach((image) => {
        submitFormData.append("images", image)
      })

      const res = await fetch("/api/admin/upload-product", {
        method: "POST",
        body: submitFormData,
      })

      let data: any = null
      try {
        data = await res.json()
      } catch {
        data = null
      }

      if (res.ok) {
        const productName = data?.product?.name || formData.name.trim()
        notifyUpload(
          "success",
          "Product added",
          data?.skipped?.length
            ? `"${productName}" was added. Some files skipped: ${data.skipped.join("; ")}`
            : `"${productName}" was added successfully with ${images.length} image(s).`
        )
        const preferred = categories.find((c: any) => c.parent_id) || categories[0]
        setFormData({
          name: "",
          description: "",
          price: "",
          discount: "0",
          category_id: preferred?.id || "",
          colors: "",
          sizes: "",
          featured: false,
          best_seller: false,
        })
        setImages([])
        setPreviews([])
        setImageColors([])
        setPerColorSizesCreate(false)
        setCreateColorSizeMap({})
        fetchProducts({ silent: true })
      } else {
        notifyUpload(
          "error",
          "Product not added",
          data?.error || `Upload failed (${res.status}). Please try again.`
        )
      }
    } catch (error: any) {
      notifyUpload(
        "error",
        "Product not added",
        error?.message || "An unexpected error occurred while uploading."
      )
    } finally {
      setLoading(false)
    }
  }

  const hydrateEditVariants = (product: Product) => {
    const colorNames = parseColorNames(product.colors)
    const flatSizes = parseFlatSizes(product.sizes)
    const perColor = hasPerColorSizes(product.sizes)
    setPerColorSizesEdit(perColor)
    setEditColorSizeMap(colorSizeMapFromProduct(product.sizes, colorNames))
    setEditFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      discount: (product.discount ?? 0).toString(),
      category_id: product.category_id,
      colors: colorNames.join(", "),
      sizes: (flatSizes.length ? flatSizes : DEFAULT_SIZE_OPTIONS).join(", "),
      featured: product.featured,
      best_seller: product.best_seller,
    })
  }

  const openEditDialog = async (product: Product) => {
    setEditingProduct(product)
    hydrateEditVariants(product)
    if (cutoutPreview) URL.revokeObjectURL(cutoutPreview)
    setCutoutPreview(null)
    setCutoutBlob(null)
    setCutoutProgress("")
    setEditDialogOpen(true)

    try {
      const res = await fetch(`/api/admin/products/${product.id}`)
      if (res.ok) {
        const json = await res.json()
        const full: Product = json.product ?? json
        setEditingProduct(full)
        hydrateEditVariants(full)
      }
    } catch {
      // silently keep the optimistic data already shown
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    setLoading(true)

    try {
      const colors = parseColorList(editFormData.colors)
      const sizes = resolveSizesPayload(
        perColorSizesEdit,
        editFormData.colors,
        editFormData.sizes,
        editColorSizeMap
      )

      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        discount: parseFloat(editFormData.discount),
        category_id: editFormData.category_id,
        colors: colors.length > 0 ? colors : ["Black"],
        sizes,
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
        fetchProducts({ silent: true })
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
      formData.append("imageColors", JSON.stringify(newImageColors))

      const res = await fetch(`/api/admin/products/${editingProduct.id}/add-images`, {
        method: "POST",
        body: formData,
      })

      let data: any = null
      try {
        data = await res.json()
      } catch {
        data = null
      }

      if (res.ok) {
        toast({
          title: "Success",
          description: data?.skipped?.length
            ? `Added ${data.newImages?.length || 0} image(s). Skipped: ${data.skipped.join("; ")}`
            : `${data?.newImages?.length || 0} image(s) added successfully!`,
        })
        setAddImagesDialogOpen(false)
        setNewImages([])
        setNewImagePreviews([])
        setNewImageColors([])
        if (data?.product) {
          setEditingProduct(data.product)
        }
        fetchProducts({ silent: true })
      } else {
        toast({
          title: "Error",
          description: data?.error || `Failed to add images (${res.status})`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "An error occurred while uploading images",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const uploadFeaturedCutout = async (blob: Blob, filename: string) => {
    if (!editingProduct) return
    setCutoutBusy(true)
    setCutoutProgress("Uploading cutout…")
    try {
      const fd = new FormData()
      fd.append("image", blob, filename)
      const res = await fetch(`/api/admin/products/${editingProduct.id}/featured-image`, {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      const nextImage = data.featured_image || data.product?.featured_image
      setEditingProduct({
        ...editingProduct,
        featured: true,
        featured_image: nextImage,
      })
      setEditFormData((prev) => ({ ...prev, featured: true }))
      if (cutoutPreview) URL.revokeObjectURL(cutoutPreview)
      setCutoutPreview(null)
      setCutoutBlob(null)
      setCutoutProgress("")
      toast({ title: "Success", description: "Carousel cutout saved" })
      fetchProducts({ silent: true })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload cutout",
        variant: "destructive",
      })
    } finally {
      setCutoutBusy(false)
      setCutoutProgress("")
    }
  }

  const handleAutoCutout = async (file: File) => {
    if (!editingProduct) return
    setCutoutBusy(true)
    setCutoutProgress("Removing background… (first run may take a minute)")
    try {
      const { removeImageBackground } = await import("@/lib/remove-background")
      const blob = await removeImageBackground(file, (msg) => setCutoutProgress(msg))
      if (cutoutPreview) URL.revokeObjectURL(cutoutPreview)
      setCutoutBlob(blob)
      setCutoutPreview(URL.createObjectURL(blob))
      setCutoutProgress("Preview ready — upload to save")
    } catch (error: any) {
      toast({
        title: "Background removal failed",
        description: error.message || "Try a clearer photo or upload a ready PNG",
        variant: "destructive",
      })
      setCutoutProgress("")
    } finally {
      setCutoutBusy(false)
    }
  }

  const clearFeaturedCutout = async () => {
    if (!editingProduct?.featured_image) return
    if (!confirm("Remove this carousel cutout?")) return
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}/featured-image`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to clear")
      setEditingProduct({ ...editingProduct, featured_image: null })
      toast({ title: "Cleared", description: "Cutout removed" })
      fetchProducts({ silent: true })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cutout",
        variant: "destructive",
      })
    }
  }

  const handleRemoveImage = async (productId: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to remove this image?")) return

    try {
      const res = await fetch(`/api/admin/products/${productId}/delete-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to remove image")

      toast({
        title: "Success",
        description: "Image removed successfully!",
      })

      if (editingProduct?.id === productId && Array.isArray(data.images)) {
        setEditingProduct({ ...editingProduct, images: data.images })
      }
      fetchProducts({ silent: true })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove image",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Delete "${productName}" permanently? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete product")

      toast({
        title: "Success",
        description: "Product deleted",
      })
      if (editingProduct?.id === productId) {
        setEditDialogOpen(false)
        setEditingProduct(null)
      }
      fetchProducts({ silent: true })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  return (
    <Tabs defaultValue="manage" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white border border-neutral-200 rounded-lg p-1">
        <TabsTrigger 
          value="manage" 
          className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white text-neutral-500 text-xs sm:text-sm py-2 rounded-none"
        >
          <Package className="w-4 h-4 mr-1 sm:mr-2" />
          Manage Products
        </TabsTrigger>
        <TabsTrigger 
          value="add" 
          className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white text-neutral-500 text-xs sm:text-sm py-2 rounded-none"
        >
          <Upload className="w-4 h-4 mr-1 sm:mr-2" />
          Add New
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manage" className="mt-4 sm:mt-6">
        <Card className="bg-white border-neutral-200">
          <CardHeader className="px-4 sm:px-6 py-4">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Package className="w-5 h-5" />
              All Products ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4">
            {listLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                <p className="text-neutral-500 text-sm mt-3">Loading products…</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500">No products found</p>
                <p className="text-neutral-500 text-sm mt-1">Add your first product to get started</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {products.map((product) => (
                  <Card key={product.id} className="bg-neutral-100 border-neutral-200 overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                          {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-neutral-200"
                            loading="lazy"
                            decoding="async"
                          />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-100 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-neutral-500" />
                            </div>
                        )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-1 truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-500 mb-2 line-clamp-2">
                            {product.description || "No description"}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center sm:justify-start text-xs sm:text-sm">
                            <span className="text-neutral-800 font-semibold">${product.price}</span>
                            {product.discount > 0 && (
                              <span className="bg-red-500/20 text-red-600 px-2 py-0.5 rounded text-xs">
                                -{product.discount}%
                              </span>
                            )}
                            {product.featured && (
                              <span className="bg-amber-500/20 text-amber-700 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Featured
                              </span>
                            )}
                            {product.best_seller && (
                              <span className="bg-green-500/20 text-green-700 px-2 py-0.5 rounded text-xs">
                                Best Seller
                              </span>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                            <Button
                              size="sm"
                              onClick={() => openEditDialog(product)}
                              className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm h-8 px-3"
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
                              className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm h-8 px-3"
                            >
                              <ImagePlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Add Images
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="border-red-300 text-red-600 hover:bg-red-50 text-xs sm:text-sm h-8 px-3"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Delete
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
        <Card className="bg-white border-neutral-200">
          <CardHeader className="px-4 sm:px-6 py-4">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Product
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {uploadNotice && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`flex items-start gap-3 rounded-md border px-4 py-3 ${
                    uploadNotice.type === "success"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                      : "border-red-300 bg-red-50 text-red-950"
                  }`}
                >
                  {uploadNotice.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{uploadNotice.title}</p>
                    <p className="mt-0.5 text-sm opacity-90">{uploadNotice.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadNotice(null)}
                    className="shrink-0 rounded p-1 opacity-60 hover:opacity-100"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Name / Price / Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="name" className="text-neutral-800 text-sm">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-neutral-800 text-sm">
                    Price ($) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-neutral-800 text-sm">
                    Discount (%)
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-neutral-800 text-sm">
                  Category *
                </Label>
                {categories.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-neutral-500 bg-neutral-100 p-3 rounded-md">
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
                    <SelectTrigger className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-neutral-200">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-neutral-900">
                          {cat.label || cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-neutral-800 text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-neutral-100 border-neutral-200 text-neutral-900 min-h-[80px]"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              {/* Colors and Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="colors" className="text-neutral-800 text-sm">
                    Colors (comma-separated)
                  </Label>
                  <Input
                    id="colors"
                    value={formData.colors}
                    onChange={(e) => {
                      const colors = e.target.value
                      setFormData({ ...formData, colors })
                      setCreateColorSizeMap((prev) =>
                        syncColorSizeMap(
                          parseColorList(colors),
                          parseSizeList(formData.sizes).length
                            ? parseSizeList(formData.sizes)
                            : DEFAULT_SIZE_OPTIONS,
                          prev
                        )
                      )
                    }}
                    className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10"
                    placeholder="Black, Navy"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sizes" className="text-neutral-800 text-sm">
                    Size options (comma-separated)
                  </Label>
                  <Input
                    id="sizes"
                    value={formData.sizes}
                    onChange={(e) =>
                      setFormData({ ...formData, sizes: e.target.value })
                    }
                    className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10"
                    placeholder="S, M, L, XL"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="per-color-sizes-create"
                    checked={perColorSizesCreate}
                    onCheckedChange={(checked) => {
                      const on = checked === true
                      setPerColorSizesCreate(on)
                      if (on) {
                        setCreateColorSizeMap((prev) =>
                          syncColorSizeMap(
                            parseColorList(formData.colors),
                            parseSizeList(formData.sizes).length
                              ? parseSizeList(formData.sizes)
                              : DEFAULT_SIZE_OPTIONS,
                            prev
                          )
                        )
                      }
                    }}
                    className="mt-0.5 border-neutral-300"
                  />
                  <div>
                    <Label
                      htmlFor="per-color-sizes-create"
                      className="text-neutral-800 text-sm cursor-pointer"
                    >
                      Different sizes for each color
                    </Label>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Example: Black has S–L, Navy has M–XL.
                    </p>
                  </div>
                </div>

                {perColorSizesCreate && (
                  <div className="space-y-3">
                    {parseColorList(formData.colors).length === 0 ? (
                      <p className="text-xs text-amber-700">
                        Enter colors above first, then pick sizes for each.
                      </p>
                    ) : (
                      parseColorList(formData.colors).map((color) => {
                        const options =
                          parseSizeList(formData.sizes).length > 0
                            ? parseSizeList(formData.sizes)
                            : DEFAULT_SIZE_OPTIONS
                        const selected = createColorSizeMap[color] || []
                        return (
                          <div key={color} className="space-y-1.5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
                              {color}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {options.map((size) => {
                                const active = selected.includes(size)
                                return (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() =>
                                      setCreateColorSizeMap((prev) =>
                                        toggleSizeForColor(prev, color, size)
                                      )
                                    }
                                    className={`min-w-[2.5rem] px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                                      active
                                        ? "border-neutral-900 bg-neutral-900 text-white"
                                        : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                                    }`}
                                  >
                                    {size}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label className="text-neutral-800 text-sm flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" />
                  Product Images *
                </Label>

                {previews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-neutral-500">
                      First image is the main photo. Assign a color under each pic so the color circle on the product page shows that photo.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative w-[5.5rem] sm:w-28">
                          <div className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-20 w-full sm:h-24 object-cover rounded-lg border border-neutral-200"
                            />
                            <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {index + 1}
                              {index === 0 ? " · main" : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow-lg transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <select
                            value={imageColors[index] || ""}
                            onChange={(e) =>
                              setImageColors((prev) => {
                                const next = [...prev]
                                next[index] = e.target.value
                                return next
                              })
                            }
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-1 py-1 text-[11px] text-neutral-800"
                            aria-label={`Color for image ${index + 1}`}
                          >
                            <option value="">No color</option>
                            {parseColorList(formData.colors).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          {previews.length > 1 && (
                            <div className="mt-1 flex justify-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => moveCreateImage(index, index - 1)}
                                className="rounded border border-neutral-300 bg-white p-1 text-neutral-700 disabled:opacity-30 hover:bg-neutral-100"
                                aria-label={`Move image ${index + 1} left`}
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === previews.length - 1}
                                onClick={() => moveCreateImage(index, index + 1)}
                                className="rounded border border-neutral-300 bg-white p-1 text-neutral-700 disabled:opacity-30 hover:bg-neutral-100"
                                aria-label={`Move image ${index + 1} right`}
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {parseColorList(formData.colors).length === 0 && (
                      <p className="text-xs text-amber-700">
                        Enter colors above (e.g. Black, Navy) to link each photo to a color circle.
                      </p>
                    )}
                  </div>
                )}

                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      createImagesInputRef.current?.click()
                    }
                  }}
                  onClick={() => createImagesInputRef.current?.click()}
                  onDragEnter={onDragOver(setDragOverCreate)}
                  onDragOver={onDragOver(setDragOverCreate)}
                  onDragLeave={onDragLeave(setDragOverCreate)}
                  onDrop={onDropCreate}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                    dragOverCreate
                      ? "border-neutral-900 bg-neutral-100"
                      : "border-neutral-300 bg-neutral-50 hover:border-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  <Upload
                    className={`h-7 w-7 ${dragOverCreate ? "text-neutral-900" : "text-neutral-500"}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {dragOverCreate ? "Drop images here" : "Drag & drop product images"}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      or click to browse · JPG, PNG, WEBP, GIF
                    </p>
                  </div>
                  <input
                    ref={createImagesInputRef}
                    type="file"
                    accept={IMAGE_ACCEPT}
                    multiple
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </div>

                <p className="text-xs text-neutral-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {previews.length === 0
                    ? "At least one image is required (not HEIC from iPhone)"
                    : `${previews.length} image(s) ready · max 10MB each`}
                </p>
              </div>

              <div className="flex flex-wrap gap-6 py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked as boolean })
                    }
                    className="border-neutral-300"
                  />
                  <Label htmlFor="featured" className="text-neutral-800 text-sm cursor-pointer flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-700" />
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
                    className="border-neutral-300"
                  />
                  <Label htmlFor="best_seller" className="text-neutral-800 text-sm cursor-pointer">
                    Best Seller
                  </Label>
                </div>
              </div>
              <p className="text-xs text-neutral-500 -mt-2">
                After creating, edit the product to upload a transparent carousel cutout.
              </p>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white h-11 font-semibold rounded-none uppercase tracking-[0.14em] font-nike text-sm"
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
        <DialogContent className="bg-white border-neutral-200 text-neutral-900 max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Product
            </DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-800 text-sm">Product Name *</Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-800 text-sm">Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, price: e.target.value })
                    }
                    className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-800 text-sm">Discount (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={editFormData.discount}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, discount: e.target.value })
                    }
                    className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-800 text-sm">Category *</Label>
                <Select
                  value={editFormData.category_id}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, category_id: value })
                  }
                >
                  <SelectTrigger className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-neutral-200">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-neutral-900">
                        {cat.label || cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-800 text-sm">Description</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  className="bg-neutral-100 border-neutral-200 text-neutral-900 min-h-[80px]"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-800 text-sm">Colors (comma-separated)</Label>
                  <Input
                    value={editFormData.colors}
                    onChange={(e) => {
                      const colors = e.target.value
                      setEditFormData({ ...editFormData, colors })
                      setEditColorSizeMap((prev) =>
                        syncColorSizeMap(
                          parseColorList(colors),
                          parseSizeList(editFormData.sizes).length
                            ? parseSizeList(editFormData.sizes)
                            : DEFAULT_SIZE_OPTIONS,
                          prev
                        )
                      )
                    }}
                    className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-800 text-sm">Size options (comma-separated)</Label>
                  <Input
                    value={editFormData.sizes}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, sizes: e.target.value })
                    }
                    className="bg-neutral-100 border-neutral-200 text-neutral-900 h-10"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="per-color-sizes-edit"
                    checked={perColorSizesEdit}
                    onCheckedChange={(checked) => {
                      const on = checked === true
                      setPerColorSizesEdit(on)
                      if (on) {
                        setEditColorSizeMap((prev) =>
                          syncColorSizeMap(
                            parseColorList(editFormData.colors),
                            parseSizeList(editFormData.sizes).length
                              ? parseSizeList(editFormData.sizes)
                              : DEFAULT_SIZE_OPTIONS,
                            prev
                          )
                        )
                      }
                    }}
                    className="mt-0.5 border-neutral-300"
                  />
                  <div>
                    <Label
                      htmlFor="per-color-sizes-edit"
                      className="text-neutral-800 text-sm cursor-pointer"
                    >
                      Different sizes for each color
                    </Label>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Same design, different size ranges per color. Click Save Changes after editing.
                    </p>
                  </div>
                </div>

                {perColorSizesEdit && (
                  <div className="space-y-3">
                    {parseColorList(editFormData.colors).length === 0 ? (
                      <p className="text-xs text-amber-700">
                        Enter colors above first, then pick sizes for each.
                      </p>
                    ) : (
                      parseColorList(editFormData.colors).map((color) => {
                        const options =
                          parseSizeList(editFormData.sizes).length > 0
                            ? parseSizeList(editFormData.sizes)
                            : DEFAULT_SIZE_OPTIONS
                        const selected = editColorSizeMap[color] || []
                        return (
                          <div key={color} className="space-y-1.5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
                              {color}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {options.map((size) => {
                                const active = selected.includes(size)
                                return (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() =>
                                      setEditColorSizeMap((prev) =>
                                        toggleSizeForColor(prev, color, size)
                                      )
                                    }
                                    className={`min-w-[2.5rem] px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                                      active
                                        ? "border-neutral-900 bg-neutral-900 text-white"
                                        : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                                    }`}
                                  >
                                    {size}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Current Images */}
              <div className="space-y-2">
                <Label className="text-neutral-800 text-sm">Current Images</Label>
                <p className="text-xs text-neutral-500">
                  Link each photo to a color. On the shop page, tapping that color circle shows this photo. Order saves immediately.
                </p>
                <div className="flex flex-wrap gap-3">
                  {editingProduct.images?.length > 0 ? (
                    editingProduct.images.map((img, idx) => {
                      const linkedColor = getImageColor(img) || ""
                      const colorOptions = parseColorList(editFormData.colors)
                      return (
                        <div key={`${img}-${idx}`} className="relative w-[5.5rem] sm:w-28">
                          <div className="relative">
                            <img
                              src={img}
                              alt={`Product image ${idx + 1}`}
                              className="h-16 w-full sm:h-20 object-cover rounded-lg border border-neutral-200"
                            />
                            <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {idx + 1}
                              {idx === 0 ? " · main" : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(editingProduct.id, img)}
                              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow-lg transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <select
                            value={
                              linkedColor &&
                              colorOptions.some(
                                (c) => c.toLowerCase() === linkedColor.toLowerCase()
                              )
                                ? colorOptions.find(
                                    (c) => c.toLowerCase() === linkedColor.toLowerCase()
                                  ) || linkedColor
                                : linkedColor
                            }
                            disabled={assigningColor}
                            onChange={(e) => assignEditingImageColor(idx, e.target.value)}
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-1 py-1 text-[11px] text-neutral-800 disabled:opacity-60"
                            aria-label={`Color for image ${idx + 1}`}
                          >
                            <option value="">No color</option>
                            {colorOptions.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                            {linkedColor &&
                              !colorOptions.some(
                                (c) => c.toLowerCase() === linkedColor.toLowerCase()
                              ) && (
                                <option value={linkedColor}>{linkedColor}</option>
                              )}
                          </select>
                          {editingProduct.images.length > 1 && (
                            <div className="mt-1 flex justify-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0 || assigningColor}
                                onClick={() => reorderEditingImages(idx, idx - 1)}
                                className="rounded border border-neutral-300 bg-white p-1 text-neutral-700 disabled:opacity-30 hover:bg-neutral-100"
                                aria-label={`Move image ${idx + 1} left`}
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={
                                  idx === editingProduct.images.length - 1 || assigningColor
                                }
                                onClick={() => reorderEditingImages(idx, idx + 1)}
                                className="rounded border border-neutral-300 bg-white p-1 text-neutral-700 disabled:opacity-30 hover:bg-neutral-100"
                                aria-label={`Move image ${idx + 1} right`}
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-neutral-500 text-sm">No images</p>
                  )}
                </div>
                {parseColorList(editFormData.colors).length === 0 && (
                  <p className="text-xs text-amber-700">
                    Save colors on this product first (e.g. Black, Navy), then link photos here.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-6 py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editFormData.featured}
                    onCheckedChange={(checked) =>
                      setEditFormData({ ...editFormData, featured: checked as boolean })
                    }
                    className="border-neutral-300"
                  />
                  <Label className="text-neutral-800 text-sm cursor-pointer flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-700" />
                    Featured
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editFormData.best_seller}
                    onCheckedChange={(checked) =>
                      setEditFormData({ ...editFormData, best_seller: checked as boolean })
                    }
                    className="border-neutral-300"
                  />
                  <Label className="text-neutral-800 text-sm cursor-pointer">Best Seller</Label>
                </div>
              </div>

              {/* Carousel cutout */}
              <div className="space-y-3 rounded-none border border-neutral-200 bg-neutral-50 p-3">
                <Label className="text-neutral-800 text-sm">Carousel cutout (transparent)</Label>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div
                    className="w-24 h-24 border border-neutral-300 overflow-hidden flex items-center justify-center bg-white"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg,#e5e5e5 25%,transparent 25%),linear-gradient(-45deg,#e5e5e5 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e5e5 75%),linear-gradient(-45deg,transparent 75%,#e5e5e5 75%)",
                      backgroundSize: "10px 10px",
                      backgroundPosition: "0 0,0 5px,5px -5px,-5px 0",
                    }}
                  >
                    {(cutoutPreview || editingProduct.featured_image) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cutoutPreview || editingProduct.featured_image || ""}
                        alt="Cutout"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-neutral-400 px-1 text-center">No cutout</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      ref={autoCutoutRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={cutoutBusy}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ""
                        if (file) handleAutoCutout(file)
                      }}
                    />
                    <input
                      ref={readyCutoutRef}
                      type="file"
                      accept="image/png,image/webp"
                      className="hidden"
                      disabled={cutoutBusy}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ""
                        if (file) uploadFeaturedCutout(file, file.name || "featured.png")
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={cutoutBusy}
                        onClick={() => autoCutoutRef.current?.click()}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white h-8 rounded-none"
                      >
                        {cutoutBusy && !cutoutBlob ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5 mr-1" />
                        )}
                        Auto remove BG
                      </Button>
                      {cutoutBlob && (
                        <Button
                          type="button"
                          size="sm"
                          disabled={cutoutBusy}
                          onClick={() => uploadFeaturedCutout(cutoutBlob, "featured-cutout.png")}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white h-8 rounded-none"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          Save cutout
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={cutoutBusy}
                        onClick={() => readyCutoutRef.current?.click()}
                        className="border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white h-8 rounded-none"
                      >
                        Upload ready PNG
                      </Button>
                      {editingProduct.featured_image && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={cutoutBusy}
                          onClick={clearFeaturedCutout}
                          className="border-red-300 text-red-600 hover:bg-red-50 h-8 rounded-none"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                    {cutoutProgress && (
                      <p className="text-[11px] text-neutral-500">{cutoutProgress}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="border-neutral-200 text-neutral-800 hover:bg-neutral-100 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProduct}
                  disabled={loading}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white w-full sm:w-auto"
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
        <DialogContent className="bg-white border-neutral-200 text-neutral-900 max-w-[95vw] sm:max-w-lg p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 shrink-0 border-b border-neutral-100">
            <DialogTitle className="text-lg flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              Add Images
            </DialogTitle>
            {editingProduct && (
              <p className="text-sm text-neutral-500 mt-1">
                Adding to: {editingProduct.name}
              </p>
            )}
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {newImagePreviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">
                  Assign a color under each new photo so the product-page color circle switches to it.
                </p>
                <div className="flex flex-wrap gap-3">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-[5.5rem] sm:w-28">
                      <div className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-20 w-full sm:h-24 object-cover rounded-lg border border-neutral-200"
                        />
                        <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow-lg transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <select
                        value={newImageColors[index] || ""}
                        onChange={(e) =>
                          setNewImageColors((prev) => {
                            const next = [...prev]
                            next[index] = e.target.value
                            return next
                          })
                        }
                        className="mt-1 w-full rounded border border-neutral-300 bg-white px-1 py-1 text-[11px] text-neutral-800"
                        aria-label={`Color for new image ${index + 1}`}
                      >
                        <option value="">No color</option>
                        {parseColorList(editFormData.colors).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      {newImagePreviews.length > 1 && (
                        <div className="mt-1 flex justify-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveNewImage(index, index - 1)}
                            className="rounded border border-neutral-300 bg-white p-1 text-neutral-700 disabled:opacity-30 hover:bg-neutral-100"
                            aria-label={`Move image ${index + 1} left`}
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === newImagePreviews.length - 1}
                            onClick={() => moveNewImage(index, index + 1)}
                            className="rounded border border-neutral-300 bg-white p-1 text-neutral-700 disabled:opacity-30 hover:bg-neutral-100"
                            aria-label={`Move image ${index + 1} right`}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  addImagesInputRef.current?.click()
                }
              }}
              onClick={() => addImagesInputRef.current?.click()}
              onDragEnter={onDragOver(setDragOverAdd)}
              onDragOver={onDragOver(setDragOverAdd)}
              onDragLeave={onDragLeave(setDragOverAdd)}
              onDrop={onDropAdd}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 text-center transition-colors ${
                newImagePreviews.length > 0 ? "py-4" : "py-8"
              } ${
                dragOverAdd
                  ? "border-neutral-900 bg-neutral-100"
                  : "border-neutral-300 bg-neutral-50 hover:border-neutral-500 hover:bg-neutral-100"
              }`}
            >
              <Upload
                className={`h-6 w-6 ${dragOverAdd ? "text-neutral-900" : "text-neutral-500"}`}
              />
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {dragOverAdd
                    ? "Drop images here"
                    : newImagePreviews.length > 0
                      ? "Add more images"
                      : "Drag & drop images"}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  or click to browse · JPG, PNG, WEBP, GIF
                </p>
              </div>
              <input
                ref={addImagesInputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                multiple
                onChange={handleNewImageChange}
                className="sr-only"
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-neutral-200 bg-white px-4 sm:px-6 py-3 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setAddImagesDialogOpen(false)
                setNewImages([])
                setNewImagePreviews([])
                setNewImageColors([])
              }}
              className="border-neutral-200 text-neutral-800 hover:bg-neutral-100 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddImages}
              disabled={loading || newImages.length === 0}
              className="bg-neutral-900 hover:bg-neutral-800 text-white w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {newImages.length} Image{newImages.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}
