"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FolderOpen, Plus, Trash2, Save } from "lucide-react"
import { Category } from "@/types/categories"
import { buildCategoryTree, slugify } from "@/lib/categories"

type Draft = {
  name: string
  slug: string
  tag: string
  description: string
  image: string
  sort_order: number
  show: boolean
}

function toDraft(cat: Category): Draft {
  return {
    name: cat.name || "",
    slug: cat.slug || "",
    tag: cat.tag || "",
    description: cat.description || "",
    image: (cat.images && cat.images[0]) || "",
    sort_order: cat.sort_order ?? 0,
    show: cat.show !== false,
  }
}

export default function CategoriesTab() {
  const { toast } = useToast()
  const [flat, setFlat] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [parentForm, setParentForm] = useState({
    name: "",
    slug: "",
    tag: "",
    description: "",
    show: true,
  })
  const [subForms, setSubForms] = useState<Record<string, { name: string; slug: string }>>({})

  const tree = useMemo(() => buildCategoryTree(flat), [flat])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/categories?all=1")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load")
      const rows: Category[] = Array.isArray(data) ? data : []
      setFlat(rows)
      const map: Record<string, Draft> = {}
      for (const cat of rows) map[cat.id] = toDraft(cat)
      setDrafts(map)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const patchDraft = (id: string, patch: Partial<Draft>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parentForm.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parentForm.name.trim(),
          slug: parentForm.slug.trim() || slugify(parentForm.name),
          tag: parentForm.tag.trim(),
          description: parentForm.description.trim(),
          show: parentForm.show,
          parent_id: null,
          images: [],
          sort_order: tree.length + 1,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create")
      toast({ title: "Success", description: "Parent category created" })
      setParentForm({ name: "", slug: "", tag: "", description: "", show: true })
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCreateSub = async (parentId: string) => {
    const form = subForms[parentId]
    if (!form?.name.trim()) return
    setSaving(true)
    try {
      const parent = tree.find((p) => p.id === parentId)
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || slugify(form.name),
          parent_id: parentId,
          show: true,
          images: [],
          sort_order: (parent?.children?.length || 0) + 1,
          tag: "",
          description: "",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create")
      toast({ title: "Success", description: "Subcategory created" })
      setSubForms((prev) => ({ ...prev, [parentId]: { name: "", slug: "" } }))
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subcategory",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async (id: string) => {
    const draft = drafts[id]
    if (!draft) return
    setSaving(true)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: draft.name,
          slug: draft.slug || slugify(draft.name),
          tag: draft.tag,
          description: draft.description,
          show: draft.show,
          sort_order: draft.sort_order,
          images: draft.image ? [draft.image] : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
      toast({ title: "Success", description: "Category saved" })
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete")
      toast({ title: "Success", description: "Deleted" })
      fetchCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
        <p className="text-neutral-500 text-sm mt-3">Loading categories...</p>
      </div>
    )
  }

  const renderEditor = (cat: Category, isChild = false) => {
    const draft = drafts[cat.id] || toDraft(cat)
    return (
      <div
        key={cat.id}
        className={`space-y-3 border border-neutral-200 bg-white p-4 ${isChild ? "ml-0 sm:ml-6" : ""}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => patchDraft(cat.id, { name: e.target.value })}
              className="rounded-none border-neutral-300 h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">Slug</Label>
            <Input
              value={draft.slug}
              onChange={(e) => patchDraft(cat.id, { slug: e.target.value })}
              className="rounded-none border-neutral-300 h-9"
              placeholder="fear"
            />
          </div>
          {!isChild && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-neutral-500">Carousel tag</Label>
              <Input
                value={draft.tag}
                onChange={(e) => patchDraft(cat.id, { tag: e.target.value })}
                className="rounded-none border-neutral-300 h-9"
                placeholder="STATEMENT // BOLD"
              />
            </div>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-neutral-500">Description</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => patchDraft(cat.id, { description: e.target.value })}
              className="rounded-none border-neutral-300 min-h-[60px]"
              rows={2}
            />
          </div>
          {!isChild && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-neutral-500">Image URL</Label>
              <Input
                value={draft.image}
                onChange={(e) => patchDraft(cat.id, { image: e.target.value })}
                className="rounded-none border-neutral-300 h-9"
                placeholder="/images/carousel-fear.jpg"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">Sort order</Label>
            <Input
              type="number"
              value={draft.sort_order}
              onChange={(e) =>
                patchDraft(cat.id, { sort_order: parseInt(e.target.value, 10) || 0 })
              }
              className="rounded-none border-neutral-300 h-9"
            />
          </div>
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`show-${cat.id}`}
                checked={draft.show}
                onCheckedChange={(v) => patchDraft(cat.id, { show: !!v })}
                className="border-neutral-300"
              />
              <Label htmlFor={`show-${cat.id}`} className="text-sm cursor-pointer">
                Visible
              </Label>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={saving}
            onClick={() => handleSave(cat.id)}
            className="rounded-none bg-neutral-900 text-white hover:bg-neutral-800 h-8"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(cat.id, cat.name)}
            className="rounded-none border-red-300 text-red-600 hover:bg-red-50 h-8"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white border-neutral-200 rounded-none shadow-none">
        <CardHeader className="px-4 sm:px-6 py-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 font-nike-display uppercase tracking-[0.04em]">
            <Plus className="w-5 h-5" />
            Add parent category
          </CardTitle>
          <p className="text-sm text-neutral-500 mt-1">
            Run <code className="text-neutral-800">scripts/add_category_hierarchy.sql</code> once
            in Supabase if columns are missing.
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6">
          <form onSubmit={handleCreateParent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Name *</Label>
                <Input
                  value={parentForm.name}
                  onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })}
                  className="rounded-none border-neutral-300 h-10"
                  placeholder="FEAR"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Slug</Label>
                <Input
                  value={parentForm.slug}
                  onChange={(e) => setParentForm({ ...parentForm, slug: e.target.value })}
                  className="rounded-none border-neutral-300 h-10"
                  placeholder="fear"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm">Tag</Label>
                <Input
                  value={parentForm.tag}
                  onChange={(e) => setParentForm({ ...parentForm, tag: e.target.value })}
                  className="rounded-none border-neutral-300 h-10"
                  placeholder="STATEMENT // BOLD"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm">Description</Label>
                <Textarea
                  value={parentForm.description}
                  onChange={(e) =>
                    setParentForm({ ...parentForm, description: e.target.value })
                  }
                  className="rounded-none border-neutral-300 min-h-[70px]"
                  rows={2}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-none bg-neutral-900 text-white hover:bg-neutral-800"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create parent
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border-neutral-200 rounded-none shadow-none">
        <CardHeader className="px-4 sm:px-6 py-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 font-nike-display uppercase tracking-[0.04em]">
            <FolderOpen className="w-5 h-5" />
            Categories ({tree.length} parents)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 space-y-6">
          {tree.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">
              No parent categories yet. Run the SQL seed or create one above.
            </p>
          ) : (
            tree.map((parent) => (
              <div key={parent.id} className="space-y-3">
                {renderEditor(parent, false)}
                <div className="space-y-2 pl-0 sm:pl-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Subcategories
                  </p>
                  {(parent.children || []).map((child) => renderEditor(child, true))}
                  <div className="flex flex-col sm:flex-row gap-2 border border-dashed border-neutral-300 p-3">
                    <Input
                      placeholder="Subcategory name"
                      value={subForms[parent.id]?.name || ""}
                      onChange={(e) =>
                        setSubForms((prev) => ({
                          ...prev,
                          [parent.id]: {
                            name: e.target.value,
                            slug: prev[parent.id]?.slug || "",
                          },
                        }))
                      }
                      className="rounded-none border-neutral-300 h-9"
                    />
                    <Input
                      placeholder="slug"
                      value={subForms[parent.id]?.slug || ""}
                      onChange={(e) =>
                        setSubForms((prev) => ({
                          ...prev,
                          [parent.id]: {
                            name: prev[parent.id]?.name || "",
                            slug: e.target.value,
                          },
                        }))
                      }
                      className="rounded-none border-neutral-300 h-9 sm:max-w-[160px]"
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={saving}
                      onClick={() => handleCreateSub(parent.id)}
                      className="rounded-none bg-neutral-900 text-white hover:bg-neutral-800 h-9"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add sub
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Legacy / hidden flat rows without parent that aren't in tree roots */}
          {flat.filter((c) => c.parent_id && !flat.some((p) => p.id === c.parent_id)).length >
            0 && (
            <p className="text-xs text-amber-700">
              Some categories have missing parents — check the database seed.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
