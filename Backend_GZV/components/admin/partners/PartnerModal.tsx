"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Upload,
  Save,
  ImageIcon,
  Link as LinkIcon,
  Handshake,
  Building2,
  GraduationCap,
  Globe,
  ExternalLink,
  Trash2,
  Sparkles,
  Plus,
  Layers,
  RotateCcw,
  FolderOpen,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { MediaPickerDialog, type MediaPickResult } from "@/components/media/MediaPickerDialog"
import type { Partner, CategoryItem } from "@/app/admin/partners/page"

interface Props {
  isOpen: boolean
  onClose: () => void
  partner: Partner | null
  existing: Partner[]
  categories?: CategoryItem[]
  defaultCategoryKey?: string
  onSuccess: () => void
}

const empty: Omit<Partner, "id" | "created_at" | "updated_at"> = {
  name: "",
  logo_url: "",
  category: "doi-tac-khac",
  website_url: "",
  sort_order: 10,
  is_active: true,
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

export function PartnerModal({
  isOpen,
  onClose,
  partner,
  existing,
  categories = [],
  defaultCategoryKey,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [customCategoryName, setCustomCategoryName] = useState("")

  useEffect(() => {
    if (!isOpen) return

    if (partner) {
      setForm({ ...partner })
      // Check if partner's category is one of the known categories
      const isKnown = categories.some(
        (c) =>
          c.key === partner.category ||
          c.aliases?.includes(partner.category) ||
          c.label.toLowerCase() === partner.category.toLowerCase()
      )
      if (!isKnown && partner.category && partner.category !== "doi-tac-khac") {
        setIsCustomCategory(true)
        setCustomCategoryName(partner.category)
      } else {
        setIsCustomCategory(false)
        setCustomCategoryName("")
      }
    } else {
      const initialCat = defaultCategoryKey || "don-vi-thuc-hien"
      const sameCat = existing.filter((p) => p.category === initialCat)
      const next = sameCat.length ? Math.max(...sameCat.map((p) => p.sort_order || 0)) + 10 : 10
      setForm({ ...empty, category: initialCat, sort_order: next })
      setIsCustomCategory(false)
      setCustomCategoryName("")
    }
  }, [isOpen, partner, existing, categories, defaultCategoryKey])

  const recomputeNextOrder = (catKey: string) => {
    const sameCat = existing.filter((p) => (p.category === catKey) && p.id !== partner?.id)
    return sameCat.length ? Math.max(...sameCat.map((p) => p.sort_order || 0)) + 10 : 10
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const fileName = `partner_${Date.now()}.${ext}`
      const path = `partners/${fileName}`
      const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false })
      if (error) throw error
      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(path)
      setForm((p: any) => ({ ...p, logo_url: publicUrl }))
      toast({ title: "Đã tải lên", description: "Logo đối tác đã được cập nhật thành công." })
    } catch (err: any) {
      toast({ title: "Lỗi tải ảnh", description: err.message || "Không thể tải ảnh lên", variant: "destructive" })
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleCategorySelect = (val: string) => {
    if (val === "__custom__") {
      setIsCustomCategory(true)
      setCustomCategoryName("")
    } else {
      setIsCustomCategory(false)
      setForm((p: any) => ({
        ...p,
        category: val,
        sort_order: recomputeNextOrder(val),
      }))
    }
  }

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập tên đối tác.", variant: "destructive" })
      return
    }

    // Determine target category
    let finalCategory = form.category
    if (isCustomCategory) {
      const trimmedCustom = customCategoryName.trim()
      if (trimmedCustom) {
        finalCategory = slugify(trimmedCustom) || trimmedCustom
      } else {
        // If left empty when in custom mode, fallback to "doi-tac-khac"
        finalCategory = "doi-tac-khac"
      }
    } else if (!finalCategory || !finalCategory.trim()) {
      finalCategory = "doi-tac-khac"
    }

    setSaving(true)
    const payload = {
      name: form.name.trim(),
      logo_url: form.logo_url?.trim() || "",
      category: finalCategory,
      website_url: form.website_url?.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: !!form.is_active,
    }

    const { error } = partner
      ? await supabase.from("partners").update(payload).eq("id", partner.id)
      : await supabase.from("partners").insert(payload)
    setSaving(false)

    if (error) {
      toast({ title: "Lỗi lưu", description: error.message, variant: "destructive" })
      return
    }
    toast({ title: "Thành công", description: partner ? "Đã cập nhật đối tác." : "Đã thêm đối tác mới." })
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-none border border-slate-200 bg-white p-0 shadow-2xl dark:border-white/10 dark:bg-slate-900 overflow-hidden select-none">
        {/* Brand Accent Top Line */}
        <div className="h-1 w-full bg-[#ed1c24]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#ed1c24] text-white shadow-xs">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[9px] font-black uppercase tracking-widest text-[#ed1c24] leading-tight">
                PARTNERS & SPONSORS
              </span>
              <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                {partner ? "Chỉnh sửa thông tin đối tác" : "Thêm đối tác đồng hành mới"}
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Cập nhật logo nhận diện (có thể thêm sau), tùy chỉnh danh mục và thiết lập liên kết website.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            {/* Left Column: Logo preview & upload */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Logo nhận diện (Tùy chọn - có thể thêm sau)
              </Label>

              <div className="relative aspect-[4/3] overflow-hidden border border-slate-200 bg-white p-4 shadow-2xs dark:border-white/10 flex items-center justify-center">
                {form.logo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={form.logo_url}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-slate-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-none bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Chưa có logo</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tải lên định dạng PNG, SVG, JPG</p>
                  </div>
                )}

                {form.logo_url && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-none shadow-xs"
                    onClick={() => setForm((p: any) => ({ ...p, logo_url: "" }))}
                    title="Xóa logo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      className="w-full rounded-none border-[#ed1c24] text-[11px] font-black uppercase text-[#ed1c24] hover:bg-red-50 dark:hover:bg-red-950/30 h-9 pointer-events-none"
                    >
                      {uploading ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {uploading ? "Đang tải..." : "Tải từ máy"}
                    </Button>
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMediaPickerOpen(true)}
                    className="w-full rounded-none border-slate-300 text-[11px] font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800 h-9"
                  >
                    <FolderOpen className="mr-1.5 h-3.5 w-3.5 text-[#ed1c24]" />
                    Thư viện ảnh
                  </Button>
                </div>

                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                  <Input
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                    placeholder="Hoặc dán URL logo trực tiếp..."
                    className="h-9 rounded-none border-slate-200 bg-white pl-8.5 text-xs font-mono dark:border-white/10 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Form fields */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tên đối tác / Doanh nghiệp *
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: Shinhan Bank, Viettel, FPT Telecom..."
                  className="h-10 rounded-none border-slate-200 bg-white text-sm font-bold text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Category Selector with Custom / Fallback Support */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Danh mục đối tác *
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory)
                      if (!isCustomCategory) setCustomCategoryName("")
                    }}
                    className="text-[10px] font-bold text-[#ed1c24] hover:underline inline-flex items-center gap-1"
                  >
                    {isCustomCategory ? (
                      <>
                        <RotateCcw className="h-3 w-3" /> Chọn danh mục có sẵn
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" /> Nhập danh mục mới
                      </>
                    )}
                  </button>
                </div>

                {!isCustomCategory ? (
                  <Select
                    value={form.category || "doi-tac-khac"}
                    onValueChange={handleCategorySelect}
                  >
                    <SelectTrigger className="h-9.5 rounded-none border-slate-200 bg-white text-xs font-bold dark:border-white/10 dark:bg-slate-900">
                      <SelectValue placeholder="Chọn danh mục..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-slate-200 dark:border-white/10 max-h-72">
                      {categories.map((cat) => (
                        <SelectItem key={cat.key} value={cat.key} className="text-xs font-bold uppercase">
                          <div className="flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-[#ed1c24]" />
                            <span>{cat.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__" className="text-xs font-bold text-[#ed1c24] border-t border-slate-100 dark:border-white/5 mt-1 pt-1">
                        <div className="flex items-center gap-2">
                          <Plus className="h-3.5 w-3.5 text-[#ed1c24]" />
                          <span>TẠO DANH MỤC MỚI...</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-1">
                    <Input
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder="Nhập tên danh mục mới (để trống sẽ vào 'ĐỐI TÁC KHÁC')..."
                      className="h-9.5 rounded-none border-[#ed1c24] bg-red-50/20 text-xs font-bold text-slate-900 dark:bg-slate-900 dark:text-white"
                      autoFocus
                    />
                    <p className="text-[10px] text-slate-400 italic">
                      Gợi ý: Tên danh mục mới sẽ tự động hiển thị trong thanh danh mục quản trị.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Website (Tùy chọn)
                  </Label>
                  {form.website_url && (
                    <a
                      href={form.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ed1c24] hover:underline"
                    >
                      <span>Mở link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Input
                    value={form.website_url || ""}
                    onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                    placeholder="https://example.com"
                    className="h-9.5 rounded-none border-slate-200 bg-white pl-8.5 text-xs font-mono dark:border-white/10 dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Toggle Active Status */}
              <div className="flex items-center justify-between border border-slate-200 bg-slate-50/70 p-3.5 dark:border-white/10 dark:bg-slate-950/50">
                <div>
                  <p className="text-xs font-black uppercase text-slate-900 dark:text-white">
                    Hiển thị công khai trên Website
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Logo sẽ xuất hiện tại trang /dong-hanh và section Đối tác trang chủ.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <span
                    className={`text-[11px] font-black uppercase ${form.is_active
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                      }`}
                  >
                    {form.is_active ? "Bật" : "Tắt"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-white/10 dark:bg-slate-950/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 rounded-none border-slate-300 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="h-9 rounded-none bg-[#ed1c24] px-5 text-xs font-black uppercase text-white hover:bg-[#c91218] shadow-xs"
          >
            {saving ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}
            {partner ? "Lưu thay đổi" : "Thêm đối tác"}
          </Button>
        </div>
      </DialogContent>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        defaultFolder="partners"
        onSelect={(res) => {
          if (res?.url) {
            setForm((p: any) => ({ ...p, logo_url: res.url }))
            toast({ title: "Đã chọn ảnh", description: "Đã áp dụng logo từ thư viện." })
          }
          setMediaPickerOpen(false)
        }}
      />
    </Dialog>
  )
}
