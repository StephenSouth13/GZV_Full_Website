"use client"

import React, { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Plus, Upload, UserPlus, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

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

interface GZVerQuickAddModalProps {
  open: boolean
  onClose: () => void
  departments: Array<{ id?: string; name: string; slug: string }>
  onSuccess: () => void
}

export function GZVerQuickAddModal({
  open,
  onClose,
  departments,
  onSuccess,
}: GZVerQuickAddModalProps) {
  const [fullName, setFullName] = useState("")
  const [slug, setSlug] = useState("")
  const [isSlugCustomized, setIsSlugCustomized] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [position, setPosition] = useState("")
  const [company, setCompany] = useState("GZV")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Default departments if list from DB is empty
  const defaultDepts = [
    { id: "ban-dieu-hanh", name: "Ban điều hành", slug: "ban-dieu-hanh" },
    { id: "ban-co-van", name: "Ban cố vấn", slug: "ban-co-van" },
    { id: "ban-thuc-thi", name: "Ban thực thi", slug: "ban-thuc-thi" },
  ]

  const availableDepts = departments.length > 0 ? departments : defaultDepts

  useEffect(() => {
    if (open) {
      setFullName("")
      setSlug("")
      setIsSlugCustomized(false)
      setAvatarUrl("")
      setDepartmentId(availableDepts[0]?.id || "")
      setPosition("")
      setCompany("GZV")
      setLoading(false)
      setUploading(false)
    }
  }, [open])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFullName(val)
    if (!isSlugCustomized) {
      setSlug(slugify(val))
    }
  }

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `gzvers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, { cacheControl: "3600", upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrlData.publicUrl)
      toast.success("Đã tải ảnh đại diện lên thành công!")
    } catch (err: any) {
      toast.error(err.message || "Không tải được ảnh")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên GZVer")
      return
    }

    const finalSlug = slug.trim() || slugify(fullName) || `gzver-${Date.now()}`
    const selectedDept = availableDepts.find((d) => d.id === departmentId || d.slug === departmentId)

    setLoading(true)
    try {
      const defaultProfileTabs = [
        { key: "overview", label: "TỔNG QUAN", label_en: "Overview", type: "overview", source: "overview", visible: true, sort_order: 10 },
        { key: "journey", label: "LỘ TRÌNH", label_en: "Journey", type: "text", source: "promotion_path", visible: true, sort_order: 20 },
        { key: "achievements", label: "THÀNH TỰU", label_en: "Achievements", type: "list", source: "achievements_list", visible: true, sort_order: 30 },
        { key: "experience", label: "KINH NGHIỆM", label_en: "Experience", type: "background", source: "experience", visible: true, sort_order: 40 },
        { key: "impact", label: "TÁC ĐỘNG", label_en: "Impact", type: "text", source: "social_impact", visible: true, sort_order: 50 },
      ]

      const payload: any = {
        full_name: fullName.trim(),
        slug: finalSlug,
        avatar_url: avatarUrl.trim() || "/placeholder.svg",
        position: position.trim() || "Thành viên",
        company: company.trim() || "GZV",
        department_id: selectedDept?.id || null,
        department_name: selectedDept?.name || "Chưa gán ban",
        profile_tabs: defaultProfileTabs,
        profile_badges: [
          { label: "Core Team", icon: "shield", color: "#ed1c24", visible: true, sort_order: 10 },
          { label: "Top Performer", icon: "star", color: "#f59e0b", visible: true, sort_order: 20 },
        ],
        social_links: [
          { label: "LinkedIn", platform: "linkedin", href: "", visible: true, sort_order: 10 },
          { label: "Facebook", platform: "facebook", href: "", visible: true, sort_order: 20 },
          { label: "Zalo", platform: "zalo", href: "", visible: true, sort_order: 30 },
        ],
        is_active: true,
        order: 0,
      }

      const { error } = await supabase.from("gzvers").insert([payload])
      if (error) throw error

      toast.success(`Đã thêm thành viên ${fullName} thành công!`)
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tạo GZVer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-none border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-white">
        <DialogHeader className="border-b border-slate-200 pb-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center bg-[#ed1c24] text-white">
              <UserPlus className="h-4 w-4" />
            </span>
            <DialogTitle className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Thêm GZVer Mới
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Điền nhanh thông tin cơ bản để thêm nhân sự vào hệ thống. Sau khi tạo, bạn có thể bổ sung Magazine Profile chi tiết bất kỳ lúc nào.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Avatar Upload Box */}
          <div className="flex items-center gap-4 rounded-none border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-slate-900">
            <Avatar className="h-16 w-16 rounded-none border-2 border-slate-200 dark:border-white/10 shrink-0">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="rounded-none bg-slate-800 text-sm font-black text-white">
                {fullName ? fullName.charAt(0) : "GZV"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Ảnh đại diện (Avatar)
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadAvatar}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 rounded-none text-xs font-bold"
                >
                  {uploading ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="mr-1.5 h-3.5 w-3.5 text-[#ed1c24]" />
                  )}
                  Tải ảnh từ máy
                </Button>

                <Input
                  type="text"
                  placeholder="Hoặc dán link ảnh trực tiếp..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="h-8 rounded-none text-xs border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Full Name & Slug */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                Họ và tên <span className="text-[#ed1c24]">*</span>
              </Label>
              <Input
                required
                value={fullName}
                onChange={handleNameChange}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="h-9 rounded-none text-xs border-slate-200 dark:border-white/10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                Đường dẫn tĩnh (Slug)
              </Label>
              <Input
                required
                value={slug}
                onChange={(e) => {
                  setIsSlugCustomized(true)
                  setSlug(e.target.value)
                }}
                placeholder="nguyen-van-a"
                className="h-9 rounded-none text-xs font-mono border-slate-200 dark:border-white/10"
              />
            </div>
          </div>

          {/* Department Select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-900 dark:text-white">
              Phòng ban trực thuộc
            </Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="h-9 rounded-none text-xs border-slate-200 dark:border-white/10">
                <SelectValue placeholder="Chọn phòng ban..." />
              </SelectTrigger>
              <SelectContent className="rounded-none border-slate-200 dark:border-white/10">
                {availableDepts.map((dept) => (
                  <SelectItem key={dept.id || dept.slug} value={dept.id || dept.slug} className="text-xs">
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position & Company */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                Chức vụ / Vị trí
              </Label>
              <Input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ví dụ: Trưởng ban, Co-Founder..."
                className="h-9 rounded-none text-xs border-slate-200 dark:border-white/10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                Đơn vị / Công ty
              </Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ví dụ: GZV Center"
                className="h-9 rounded-none text-xs border-slate-200 dark:border-white/10"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 pt-4 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 rounded-none text-xs font-bold"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="h-9 rounded-none bg-[#ed1c24] px-5 text-xs font-black uppercase text-white hover:bg-[#c91218]"
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="mr-1.5 h-3.5 w-3.5" />
              )}
              Tạo GZVer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
