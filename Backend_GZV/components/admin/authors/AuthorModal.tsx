"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Loader2,
  Save,
  Upload,
  Users,
  Globe,
  Linkedin,
  Lock,
  Unlock,
  PenTool,
  Sparkles,
  ImageIcon,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Props {
  isOpen: boolean
  onClose: () => void
  author: any
  onSuccess: () => void
}

export function AuthorModal({ isOpen, onClose, author, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isSlugLocked, setIsSlugLocked] = useState(true)
  const [formData, setFormData] = useState<any>({
    full_name: "",
    slug: "",
    title: "",
    avatar_url: "",
    bio: "",
    linkedin_url: "",
    portfolio_url: "",
  })

  useEffect(() => {
    if (author && isOpen) {
      setFormData(author)
      setIsSlugLocked(true)
    } else if (isOpen) {
      setFormData({
        full_name: "",
        slug: "",
        title: "",
        avatar_url: "",
        bio: "",
        linkedin_url: "",
        portfolio_url: "",
      })
      setIsSlugLocked(false)
    }
  }, [author, isOpen])

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
      const fileExt = file.name.split(".").pop()
      const fileName = `author-${Date.now()}.${fileExt}`
      const filePath = `authors/${fileName}`

      const { error: uploadError } = await supabase.storage.from("media").upload(filePath, file)
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(filePath)
      setFormData((prev: any) => ({ ...prev, avatar_url: publicUrl }))
      toast({ title: "Thành công", description: "Đã tải ảnh đại diện tác giả lên." })
    } catch (error: any) {
      toast({ title: "Lỗi tải ảnh", description: error.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.full_name?.trim()) {
      return toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập họ và tên tác giả.",
        variant: "destructive",
      })
    }

    setLoading(true)
    try {
      const payload = {
        full_name: formData.full_name.trim(),
        slug: formData.slug?.trim() || generateSlug(formData.full_name),
        title: formData.title?.trim() || "",
        avatar_url: formData.avatar_url?.trim() || null,
        bio: formData.bio?.trim() || "",
        linkedin_url: formData.linkedin_url?.trim() || null,
        portfolio_url: formData.portfolio_url?.trim() || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = author?.id
        ? await supabase.from("authors").update(payload).eq("id", author.id)
        : await supabase.from("authors").insert([payload])

      if (error) throw error

      toast({
        title: "Thành công!",
        description: author ? "Đã cập nhật hồ sơ tác giả." : "Đã tạo hồ sơ tác giả mới.",
      })
      if (onSuccess) onSuccess()
      onClose()
    } catch (error: any) {
      toast({ title: "Lỗi lưu dữ liệu", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
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
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[9px] font-black uppercase tracking-widest text-[#ed1c24] leading-tight">
                EDITORIAL & AUTHORS
              </span>
              <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                {author ? "Chỉnh sửa hồ sơ tác giả Expert" : "Thêm tác giả Expert mới"}
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Biên tập viên, chuyên gia cố vấn & đội ngũ phát triển nội dung GZV.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-[240px_1fr]">
            {/* Left Column: Avatar & Links */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Ảnh đại diện tác giả
              </Label>

              <div className="relative aspect-square w-full overflow-hidden border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-slate-950 flex items-center justify-center">
                {formData.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-slate-400 p-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-slate-200/60 dark:bg-slate-800 text-slate-400 mb-2">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Chưa có ảnh</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Tải lên định dạng PNG, JPG</p>
                  </div>
                )}

                {formData.avatar_url && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-none shadow-xs"
                    onClick={() => setFormData((p: any) => ({ ...p, avatar_url: "" }))}
                    title="Xóa ảnh"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <label className="block">
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    className="w-full rounded-none border-[#ed1c24] text-xs font-black uppercase text-[#ed1c24] hover:bg-red-50 dark:hover:bg-red-950/30 h-9 pointer-events-none"
                  >
                    {uploading ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-3.5 w-3.5" />
                    )}
                    {uploading ? "Đang tải lên..." : "Tải ảnh từ máy"}
                  </Button>
                </label>
              </div>

              {/* Social Links */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5 text-[#ed1c24]" />
                    <span>LinkedIn Profile</span>
                  </Label>
                  <Input
                    value={formData.linkedin_url || ""}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="h-9 rounded-none border-slate-200 bg-white text-xs font-mono dark:border-white/10 dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-500" />
                    <span>Portfolio / Website</span>
                  </Label>
                  <Input
                    value={formData.portfolio_url || ""}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    placeholder="https://my-work.com"
                    className="h-9 rounded-none border-slate-200 bg-white text-xs font-mono dark:border-white/10 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Info Fields */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Họ và tên tác giả *
                </Label>
                <Input
                  value={formData.full_name || ""}
                  onChange={(e) => {
                    const val = e.target.value
                    setFormData({
                      ...formData,
                      full_name: val,
                      slug: isSlugLocked ? generateSlug(val) : formData.slug,
                    })
                  }}
                  placeholder="Ví dụ: NGUYỄN VĂN A"
                  className="h-10 rounded-none border-slate-200 bg-white text-sm font-black uppercase text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Đường dẫn định danh (Slug)
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsSlugLocked(!isSlugLocked)}
                    className="text-[10px] font-bold text-slate-500 hover:text-[#ed1c24] inline-flex items-center gap-1"
                  >
                    {isSlugLocked ? (
                      <>
                        <Lock className="h-3 w-3" /> Khóa tự động
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3 text-amber-500" /> Tự sửa tay
                      </>
                    )}
                  </button>
                </div>
                <Input
                  value={formData.slug || ""}
                  readOnly={isSlugLocked}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  className={`h-9.5 rounded-none border-slate-200 bg-slate-50 font-mono text-xs font-bold dark:border-white/10 dark:bg-slate-950 ${
                    isSlugLocked ? "text-slate-500" : "text-[#ed1c24] border-[#ed1c24]"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chức danh / Chuyên môn
                </Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Senior Content Strategist / Creative Director"
                  className="h-9.5 rounded-none border-slate-200 bg-white text-xs font-bold text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tiểu sử & Kinh nghiệm
                </Label>
                <Textarea
                  rows={5}
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Viết tóm tắt tiểu sử, kinh nghiệm và thế mạnh chuyên môn của tác giả..."
                  className="rounded-none border-slate-200 bg-white p-3 text-xs leading-relaxed dark:border-white/10 dark:bg-slate-900 resize-none"
                />
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
            disabled={loading || uploading}
            className="h-9 rounded-none bg-[#ed1c24] px-5 text-xs font-black uppercase text-white hover:bg-[#c91218] shadow-xs"
          >
            {loading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}
            {author ? "Lưu hồ sơ tác giả" : "Tạo tác giả mới"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}