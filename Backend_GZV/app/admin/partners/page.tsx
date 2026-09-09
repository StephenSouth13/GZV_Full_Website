"use client"

import React, { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Plus,
  Pencil,
  Trash2,
  Globe,
  Search,
  Users,
  ImageIcon,
  GripVertical,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCcw,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { PartnerModal } from "@/components/admin/partners/PartnerModal"
import { PartnerDeleteModal } from "@/components/admin/partners/PartnerDeleteModal"

// Drag and Drop imports
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export interface Partner {
  id: string
  name: string
  logo_url: string
  category: string
  website_url: string | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CategoryItem {
  key: string
  label: string
  aliases?: string[]
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { key: "doi-tac-khac", label: "ĐỐI TÁC KHÁC", aliases: ["doi-tac-khac", "other", "khac", ""] },
]

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeGroup, setActiveGroup] = useState<string>("doi-tac-khac")
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [current, setCurrent] = useState<Partner | null>(null)

  // Rename Category Dialog State
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [categoryToRename, setCategoryToRename] = useState<CategoryItem | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)

  // Delete Category Dialog State
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null)
  const [deleteCategoryAction, setDeleteCategoryAction] = useState<"move" | "delete">("move")
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchPartners = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" })
    } else {
      const partnerList = (data as Partner[]) || []
      setPartners(partnerList)

      // Discover categories dynamically from actual database records
      const knownKeys = new Set(["doi-tac-khac"])
      const extraCategories: CategoryItem[] = []

      partnerList.forEach((p) => {
        const rawCat = (p.category || "").trim()
        if (rawCat && rawCat !== "doi-tac-khac" && !knownKeys.has(rawCat)) {
          knownKeys.add(rawCat)
          extraCategories.push({
            key: rawCat,
            label: rawCat.replace(/-/g, " ").toUpperCase(),
            aliases: [rawCat],
          })
        }
      })

      const combinedCategories = [
        ...extraCategories,
        { key: "doi-tac-khac", label: "ĐỐI TÁC KHÁC", aliases: ["doi-tac-khac", "other", "khac", ""] },
      ]

      setCategories(combinedCategories)
      if (!combinedCategories.some((c) => c.key === activeGroup)) {
        setActiveGroup(combinedCategories[0]?.key || "doi-tac-khac")
      }
    }
    setLoading(false)
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    setIsDeletingCategory(true)
    try {
      if (deleteCategoryAction === "delete") {
        // Delete all partners in this category
        const { error } = await supabase
          .from("partners")
          .delete()
          .eq("category", categoryToDelete.key)
        if (error) throw error
        toast({ title: `Đã xóa danh mục "${categoryToDelete.label}" và toàn bộ đối tác bên trong.` })
      } else {
        // Move all partners in this category to 'doi-tac-khac'
        const { error } = await supabase
          .from("partners")
          .update({ category: "doi-tac-khac" })
          .eq("category", categoryToDelete.key)
        if (error) throw error
        toast({ title: `Đã xóa danh mục "${categoryToDelete.label}" và chuyển đối tác sang "ĐỐI TÁC KHÁC".` })
      }

      setCategories((prev) => prev.filter((c) => c.key !== categoryToDelete.key))
      setActiveGroup("doi-tac-khac")
      fetchPartners()
    } catch (err: any) {
      toast({ title: "Không thể xóa danh mục", description: err.message, variant: "destructive" })
    } finally {
      setIsDeletingCategory(false)
      setDeleteCategoryDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  const matchesCategory = (partner: Partner, cat: CategoryItem) => {
    const pCat = (partner.category || "").toLowerCase()
    if (cat.key !== "doi-tac-khac") {
      if (pCat === cat.key.toLowerCase()) return true
      if (cat.aliases?.some((a) => a.toLowerCase() === pCat)) return true
      if (pCat === cat.label.toLowerCase()) return true
      return false
    }
    if (pCat === "doi-tac-khac" || pCat === "other" || pCat === "khac" || !pCat) {
      return true
    }
    const otherCategories = categories.filter((c) => c.key !== "doi-tac-khac")
    const matchedOther = otherCategories.some((other) => {
      if (pCat === other.key.toLowerCase()) return true
      if (other.aliases?.some((a) => a.toLowerCase() === pCat)) return true
      return false
    })
    return !matchedOther
  }

  // Grouped structure
  const groupedCategories = useMemo(() => {
    return categories.map((cat) => {
      const groupPartners = partners.filter((p) => matchesCategory(p, cat))
      return {
        ...cat,
        partners: groupPartners,
      }
    })
  }, [categories, partners])

  useEffect(() => {
    if (groupedCategories.length > 0 && !groupedCategories.some((g) => g.key === activeGroup)) {
      setActiveGroup(groupedCategories[0].key)
    }
  }, [groupedCategories, activeGroup])

  const activeCategoryData = useMemo(() => {
    return groupedCategories.find((g) => g.key === activeGroup) || groupedCategories[0] || null
  }, [groupedCategories, activeGroup])

  const filteredPartnersInActiveGroup = useMemo(() => {
    if (!activeCategoryData) return []
    const q = search.trim().toLowerCase()
    if (!q) return activeCategoryData.partners
    return activeCategoryData.partners.filter((p) => p.name.toLowerCase().includes(q))
  }, [activeCategoryData, search])

  // Drag & drop sorting of categories in master sidebar
  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.key === active.id)
      const newIndex = categories.findIndex((c) => c.key === over.id)
      const updated = arrayMove(categories, oldIndex, newIndex)
      setCategories(updated)
      toast({ title: "Đã cập nhật thứ tự danh mục" })
    }
  }

  // Drag & drop sorting of partners in active detail view
  const handlePartnerDragEnd = async (event: DragEndEvent, partnerList: Partner[]) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = partnerList.findIndex((p) => p.id === active.id)
      const newIndex = partnerList.findIndex((p) => p.id === over.id)
      const updatedList = arrayMove(partnerList, oldIndex, newIndex)

      const updates = updatedList.map((partner, index) => ({
        id: partner.id,
        sort_order: (index + 1) * 10,
      }))

      // Optimistic update
      setPartners((prev) =>
        prev.map((p) => {
          const matched = updates.find((u) => u.id === p.id)
          return matched ? { ...p, sort_order: matched.sort_order } : p
        })
      )

      try {
        await Promise.all(
          updates.map((u) => supabase.from("partners").update({ sort_order: u.sort_order }).eq("id", u.id))
        )
        toast({ title: "Đã lưu thứ tự đối tác" })
      } catch (err: any) {
        toast({ title: "Lỗi cập nhật thứ tự", description: err.message, variant: "destructive" })
        fetchPartners()
      }
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const next = !currentStatus
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: next } : p)))
    const { error } = await supabase.from("partners").update({ is_active: next }).eq("id", id)
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
      fetchPartners()
    } else {
      toast({ title: next ? "Đã bật hiển thị" : "Đã tạm ẩn đối tác" })
    }
  }

  const handleDelete = async () => {
    if (!current) return
    const { error } = await supabase.from("partners").delete().eq("id", current.id)
    if (error) {
      toast({ title: "Lỗi khi xóa", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Đã xóa đối tác thành công" })
      setDeleteOpen(false)
      fetchPartners()
    }
  }

  const handleRenameCategory = async () => {
    if (!categoryToRename || !newCategoryName.trim()) return
    const target = newCategoryName.trim()
    if (target === categoryToRename.label) {
      setRenameDialogOpen(false)
      return
    }

    setIsRenaming(true)
    try {
      const { error } = await supabase
        .from("partners")
        .update({ category: target })
        .eq("category", categoryToRename.key)

      if (error) throw error

      setCategories((prev) =>
        prev.map((c) => (c.key === categoryToRename.key ? { ...c, label: target.toUpperCase() } : c))
      )
      toast({ title: `Đã đổi tên danh mục thành "${target}"` })
      fetchPartners()
    } catch (err: any) {
      toast({ title: "Không thể đổi tên", description: err.message, variant: "destructive" })
    } finally {
      setIsRenaming(false)
      setRenameDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 select-none">
      {/* Top Banner Header matching GZV Theme */}
      <div className="relative overflow-hidden rounded-none border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
          <div className="space-y-1.5 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-none bg-[#ed1c24] text-white flex items-center justify-center font-black shrink-0 shadow-xs">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-50 text-[#ed1c24] border border-red-200 font-black uppercase tracking-wider px-2.5 py-0.5 text-[9px] rounded-none">
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-[#ed1c24] shrink-0" />
                  Mạng lưới đối tác GZV
                </Badge>
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase mt-1">
                Quản lý đối tác & đơn vị đồng hành
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPartners}
              disabled={loading}
              className="h-10 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
            >
              <RefreshCcw className={`mr-1.5 h-3.5 w-3.5 text-[#ed1c24] ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setCurrent(null)
                setModalOpen(true)
              }}
              className="h-10 px-6 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218] shadow-xs cursor-pointer"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Thêm đối tác mới
            </Button>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="max-w-md">
        <Card className="border border-slate-200 bg-white shadow-2xs rounded-none overflow-hidden dark:border-white/10 dark:bg-slate-900">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm nhanh đối tác theo tên..."
                className="pl-10 h-9 rounded-none bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-xs font-semibold"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MASTER - DETAIL LAYOUT */}
      <div className="mt-6">
        {loading && partners.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 dark:bg-slate-900 dark:border-white/10">
            <Loader2 className="h-10 w-10 text-[#ed1c24] animate-spin mx-auto mb-3" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Đang tải dữ liệu đối tác...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* MASTER SIDEBAR: Group List */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10 px-1">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#ed1c24]" /> Danh mục đối tác
                </h3>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGroupDragEnd}>
                <SortableContext items={categories.map((c) => c.key)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                    {groupedCategories.map((group) => (
                      <SortableGroupItem
                        key={group.key}
                        group={group}
                        isActive={activeGroup === group.key}
                        onClick={() => setActiveGroup(group.key)}
                        onRename={(cat) => {
                          setCategoryToRename(cat)
                          setNewCategoryName(cat.label)
                          setRenameDialogOpen(true)
                        }}
                        onDelete={(cat) => {
                          setCategoryToDelete(cat)
                          setDeleteCategoryDialogOpen(true)
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* DETAIL VIEW: Partner Grid inside Selected Group */}
            <div className="lg:col-span-8 xl:col-span-9">
              {activeCategoryData ? (
                <Card className="rounded-none border border-slate-200 overflow-hidden bg-white shadow-2xs dark:border-white/10 dark:bg-slate-900">
                  <CardHeader className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/10 flex flex-row items-center justify-between p-5 py-4">
                    <div>
                      <CardTitle className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                        {activeCategoryData.label}
                        {activeCategoryData.key !== "doi-tac-khac" && (
                          <div className="flex items-center gap-1 ml-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-none hover:bg-slate-200 text-slate-400 hover:text-[#ed1c24] transition-all"
                              onClick={() => {
                                setCategoryToRename(activeCategoryData)
                                setNewCategoryName(activeCategoryData.label)
                                setRenameDialogOpen(true)
                              }}
                              title="Đổi tên danh mục"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-none hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all"
                              onClick={() => {
                                setCategoryToDelete(activeCategoryData)
                                setDeleteCategoryDialogOpen(true)
                              }}
                              title="Xóa danh mục này"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 font-semibold text-slate-500">
                        Đang quản lý <span className="font-bold text-[#ed1c24]">{activeCategoryData.partners.length} đối tác</span> trong danh mục này.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {filteredPartnersInActiveGroup.length === 0 ? (
                      <div className="py-14 text-center border border-dashed border-slate-200 dark:border-white/10 p-6">
                        <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase text-slate-400">
                          {search ? "Không tìm thấy đối tác phù hợp với từ khóa." : "Chưa có đối tác trong danh mục này."}
                        </p>
                      </div>
                    ) : (
                      <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handlePartnerDragEnd(e, activeCategoryData.partners)}
                      >
                        <SortableContext
                          items={activeCategoryData.partners.map((p) => p.id)}
                          strategy={rectSortingStrategy}
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredPartnersInActiveGroup.map((p) => (
                              <SortablePartnerAdminCard
                                key={p.id}
                                p={p}
                                openEdit={(item) => {
                                  setCurrent(item)
                                  setModalOpen(true)
                                }}
                                toggleActive={toggleActive}
                                handleDelete={(item) => {
                                  setCurrent(item)
                                  setDeleteOpen(true)
                                }}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full min-h-[400px] flex items-center justify-center rounded-none border border-dashed border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
                  <p className="text-xs font-semibold text-slate-400">Chọn một danh mục bên trái để quản lý đối tác</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Partner Edit / Create Modal */}
      <PartnerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        partner={current}
        existing={partners}
        categories={categories}
        defaultCategoryKey={activeGroup}
        onSuccess={fetchPartners}
      />

      {/* Partner Delete Confirmation Modal */}
      <PartnerDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        partner={current}
        onConfirm={handleDelete}
      />

      {/* Rename Category Dialog */}
      {renameDialogOpen && categoryToRename && (
        <Dialog open={renameDialogOpen} onOpenChange={(v) => !v && !isRenaming && setRenameDialogOpen(false)}>
          <DialogContent className="max-w-md p-6 rounded-none border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 shadow-2xl outline-none">
            <DialogHeader className="border-b border-slate-200 dark:border-white/10 pb-4">
              <DialogTitle className="text-xs font-black uppercase tracking-wider">Đổi tên danh mục</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Tất cả các đối tác trong danh mục này sẽ tự động cập nhật theo tên mới.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-10 rounded-none bg-slate-50 dark:bg-slate-800 border-slate-200 text-xs font-bold uppercase"
                  placeholder="Nhập tên danh mục mới..."
                  disabled={isRenaming}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-200 dark:border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setRenameDialogOpen(false)}
                  disabled={isRenaming}
                  className="h-9 rounded-none text-xs font-black uppercase"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleRenameCategory}
                  disabled={isRenaming}
                  className="h-9 rounded-none font-black text-xs uppercase bg-[#ed1c24] text-white hover:bg-[#c91218]"
                >
                  {isRenaming ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Category Dialog */}
      {deleteCategoryDialogOpen && categoryToDelete && (
        <Dialog open={deleteCategoryDialogOpen} onOpenChange={(v) => !v && !isDeletingCategory && setDeleteCategoryDialogOpen(false)}>
          <DialogContent className="max-w-md p-6 rounded-none border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 shadow-2xl outline-none">
            <DialogHeader className="border-b border-slate-200 dark:border-white/10 pb-4">
              <DialogTitle className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Xóa danh mục đối tác
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Bạn đang chuẩn bị xóa danh mục <span className="font-bold text-slate-900 dark:text-white uppercase">"{categoryToDelete.label}"</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chọn hành động với các đối tác trong danh mục:
                </Label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-3 border border-slate-200 dark:border-white/10 cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50">
                    <input
                      type="radio"
                      name="deleteCategoryAction"
                      value="move"
                      checked={deleteCategoryAction === "move"}
                      onChange={() => setDeleteCategoryAction("move")}
                      className="mt-0.5 accent-[#ed1c24]"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">Chuyển đối tác sang "ĐỐI TÁC KHÁC"</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Giữ lại logo đối tác, chỉ xóa bỏ tên danh mục này.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 border border-red-200 dark:border-red-900/30 cursor-pointer bg-red-50/30 dark:bg-red-950/20 hover:bg-red-50/50">
                    <input
                      type="radio"
                      name="deleteCategoryAction"
                      value="delete"
                      checked={deleteCategoryAction === "delete"}
                      onChange={() => setDeleteCategoryAction("delete")}
                      className="mt-0.5 accent-[#ed1c24]"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-red-600">Xóa vĩnh viễn tất cả đối tác trong danh mục</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Xóa hoàn toàn danh mục và tất cả đối tác bên trong.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-200 dark:border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setDeleteCategoryDialogOpen(false)}
                  disabled={isDeletingCategory}
                  className="h-9 rounded-none text-xs font-black uppercase"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleDeleteCategory}
                  disabled={isDeletingCategory}
                  className="h-9 rounded-none font-black text-xs uppercase bg-red-600 text-white hover:bg-red-700"
                >
                  {isDeletingCategory ? "Đang xóa..." : "Xác nhận xóa"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Master Sidebar Category Item with Drag and Drop
function SortableGroupItem({
  group,
  isActive,
  onClick,
  onRename,
  onDelete,
}: {
  group: { key: string; label: string; partners: Partner[] }
  isActive: boolean
  onClick: () => void
  onRename?: (group: { key: string; label: string }) => void
  onDelete?: (group: { key: string; label: string }) => void
}) {
  const isUngrouped = group.key === "doi-tac-khac"
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.key,
    disabled: isUngrouped,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2 p-2.5 rounded-none border transition-all cursor-pointer ${
        isDragging
          ? "bg-red-50/40 border-[#ed1c24] shadow-md ring-2 ring-red-200 scale-105"
          : isActive
          ? "bg-red-50/80 border-[#ed1c24] text-[#ed1c24] shadow-xs"
          : "bg-white border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900"
      }`}
      onClick={onClick}
    >
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ed1c24]" />}

      {!isUngrouped ? (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#ed1c24] p-1 rounded-none transition-colors"
          title="Kéo thả sắp xếp danh mục"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : (
        <div className="w-6" />
      )}

      <div className="flex-1 overflow-hidden">
        <h4
          className={`text-xs font-bold uppercase tracking-wider truncate ${
            isActive ? "text-[#ed1c24] font-black" : "text-slate-800 dark:text-slate-200"
          }`}
        >
          {group.label}
        </h4>
      </div>
      {!isUngrouped && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onRename && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRename(group)
              }}
              className="text-slate-400 hover:text-[#ed1c24] p-1 rounded-none hover:bg-slate-200 transition-all"
              title="Đổi tên danh mục"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(group)
              }}
              className="text-slate-400 hover:text-red-600 p-1 rounded-none hover:bg-red-100 transition-all"
              title="Xóa danh mục"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      <Badge
        variant="outline"
        className={`text-[10px] font-black rounded-none px-1.5 py-0 ${
          isActive ? "bg-red-100 text-[#ed1c24] border-red-200" : "bg-slate-100 text-slate-600 border-slate-200"
        }`}
      >
        {group.partners.length}
      </Badge>

      <ChevronRight
        className={`h-4 w-4 shrink-0 transition-transform ${
          isActive ? "text-[#ed1c24] translate-x-1" : "text-slate-300"
        }`}
      />
    </div>
  )
}

// Partner Card in Detail View with Drag and Drop
function SortablePartnerAdminCard({
  p,
  openEdit,
  toggleActive,
  handleDelete,
}: {
  p: Partner
  openEdit: (p: Partner) => void
  toggleActive: (id: string, current: boolean) => void
  handleDelete: (p: Partner) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`group border border-slate-200 hover:border-[#ed1c24]/60 bg-white hover:shadow-md transition-all duration-200 rounded-none overflow-hidden dark:border-white/10 dark:bg-slate-900 ${
          !p.is_active ? "opacity-45" : ""
        } ${isDragging ? "ring-2 ring-[#ed1c24]/40 shadow-lg" : ""}`}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            {p.logo_url ? (
              <div className="relative overflow-hidden w-12 h-12 bg-slate-50 p-1.5 rounded-none border border-slate-200 flex items-center justify-center group-hover:bg-red-50/30 transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.logo_url}
                  alt={p.name}
                  style={{ width: "auto", height: "100%", maxWidth: "100%", objectFit: "contain" }}
                  className="rounded-none group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-none bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
            )}

            <div className="flex items-center border border-slate-200 rounded-none bg-slate-50 p-0.5 dark:border-white/10 dark:bg-slate-800">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-none hover:bg-white text-slate-500 hover:text-[#ed1c24] transition-all"
                onClick={() => toggleActive(p.id, p.is_active)}
                title={p.is_active ? "Tạm ẩn đối tác" : "Kích hoạt hiển thị"}
              >
                {p.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-none hover:bg-white text-slate-500 hover:text-[#ed1c24] transition-all"
                onClick={() => openEdit(p)}
                title="Chỉnh sửa đối tác"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-none hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all"
                onClick={() => handleDelete(p)}
                title="Xóa đối tác"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <h4
              className="font-bold text-xs text-slate-900 dark:text-white tracking-tight leading-none truncate group-hover:text-[#ed1c24] transition-colors"
              title={p.name}
            >
              {p.name}
            </h4>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-500">
            {p.website_url ? (
              <a
                href={p.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#ed1c24] flex items-center gap-1 hover:underline font-semibold truncate max-w-[130px]"
              >
                <Globe className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">
                  {p.website_url.replace(/https?:\/\//, "").replace(/\/$/, "").slice(0, 22)}
                </span>
              </a>
            ) : (
              <span className="text-[9px] italic opacity-50">Không có website</span>
            )}
            <span
              {...attributes}
              {...listeners}
              className="flex items-center gap-0.5 cursor-grab active:cursor-grabbing hover:text-[#ed1c24] font-mono bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-none border border-slate-200 transition-all select-none text-[9px] shrink-0 font-bold"
              title="Kéo thả để sắp xếp đối tác trong danh mục"
            >
              <GripVertical className="h-2.5 w-2.5" />#{p.sort_order}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
