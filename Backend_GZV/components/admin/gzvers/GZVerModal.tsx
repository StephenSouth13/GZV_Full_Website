"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowDown,
  ArrowUp,
  FileCheck,
  FileText,
  Hash,
  ImageIcon,
  Link2,
  Loader2,
  Monitor,
  Plus,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  X,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

type Department = {
  id: string
  name: string
  slug: string
  color?: string | null
  sort_order?: number | null
}

type SocialLink = {
  label: string
  platform: string
  href: string
  visible: boolean
  sort_order: number
}

type ProfileSection = {
  key: string
  label: string
  label_en?: string
  type: string
  source: string
  content?: string
  items?: string[]
  visible: boolean
  sort_order: number
}

type ProfileBadge = {
  label: string
  icon: string
  color: string
  visible: boolean
  sort_order: number
}

const convertToSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

const defaultSections: ProfileSection[] = [
  { key: "overview", label: "Tổng quan", label_en: "Overview", type: "overview", source: "overview", visible: true, sort_order: 10 },
  { key: "journey", label: "Lộ trình", label_en: "Journey", type: "text", source: "promotion_path", visible: true, sort_order: 20 },
  { key: "achievements", label: "Thành tựu", label_en: "Achievements", type: "list", source: "achievements_list", visible: true, sort_order: 30 },
  { key: "experience", label: "Kinh nghiệm", label_en: "Experience", type: "background", source: "experience", visible: true, sort_order: 40 },
  { key: "impact", label: "Tác động", label_en: "Impact", type: "text", source: "social_impact", visible: true, sort_order: 50 },
]

const defaultForm = {
  full_name: "",
  slug: "",
  company: "GZV",
  position: "",
  role_level: "",
  headline: "",
  location: "",
  email: "",
  phone: "",
  website_url: "",
  department_id: "",
  department_name: "",
  avatar_url: "",
  cover_image_url: "",
  cv_url: "",
  achievement_summary: "",
  testimonial: "",
  promotion_path: "",
  social_impact: "",
  skills: [] as string[],
  achievements_list: [] as string[],
  background: {
    education: "",
    experience: "",
  },
  social_links: [
    { label: "LinkedIn", platform: "linkedin", href: "", visible: true, sort_order: 10 },
    { label: "Facebook", platform: "facebook", href: "", visible: true, sort_order: 20 },
    { label: "Zalo", platform: "zalo", href: "", visible: true, sort_order: 30 },
  ] as SocialLink[],
  profile_tabs: defaultSections,
  profile_badges: [] as ProfileBadge[],
  avatar_position_x: 50,
  avatar_position_y: 32,
  avatar_scale: 100,
  cover_position_x: 50,
  cover_position_y: 50,
  cover_scale: 100,
  is_active: true,
  is_director: false,
  order: 0,
}

function normalizeArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return []
    }
  }
  return []
}

function sortByOrder<T extends { sort_order?: number | null }>(items: any): T[] {
  return [...normalizeArray<T>(items)].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
}

export function GZVerModal({ open, onClose, gzver, departments, onSave }: any) {
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [formData, setFormData] = useState<any>(defaultForm)

  useEffect(() => {
    if (!open) return
    if (gzver) {
      setFormData({
        ...defaultForm,
        ...gzver,
        department_id: gzver.department_id || gzver.gzver_departments?.id || "",
        department_name: gzver.department_name || gzver.gzver_departments?.name || "",
        skills: gzver.skills || [],
        achievements_list: gzver.achievements_list || [],
        background: gzver.background || defaultForm.background,
        social_links: sortByOrder(gzver.social_links),
        profile_tabs: sortByOrder(gzver.profile_tabs).length ? sortByOrder(gzver.profile_tabs) : defaultSections,
        profile_badges: sortByOrder(gzver.profile_badges).length ? sortByOrder(gzver.profile_badges) : defaultForm.profile_badges,
        avatar_position_x: gzver.avatar_position_x ?? 50,
        avatar_position_y: gzver.avatar_position_y ?? 32,
        avatar_scale: gzver.avatar_scale ?? 100,
        cover_position_x: gzver.cover_position_x ?? 50,
        cover_position_y: gzver.cover_position_y ?? 50,
        cover_scale: gzver.cover_scale ?? 100,
        is_active: gzver.is_active ?? true,
        is_director: gzver.is_director ?? false,
        order: gzver.order ?? 0,
      })
    } else {
      const firstDepartment = departments[0]
      setFormData({
        ...defaultForm,
        department_id: firstDepartment?.id || "",
        department_name: firstDepartment?.name || "",
      })
    }
  }, [gzver, open, departments])

  const updateArrayItem = (field: string, index: number, patch: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: normalizeArray<any>(prev[field]).map((item: any, itemIndex: number) => (itemIndex === index ? { ...item, ...patch } : item)),
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: normalizeArray<any>(prev[field]).filter((_: any, itemIndex: number) => itemIndex !== index),
    }))
  }

  const moveArrayItem = (field: string, index: number, direction: -1 | 1) => {
    setFormData((prev: any) => {
      const items = normalizeArray<any>(prev[field])
      const target = index + direction
      if (target < 0 || target >= items.length) return prev
      const current = items[index]
      items[index] = items[target]
      items[target] = current
      return { ...prev, [field]: items.map((item, itemIndex) => ({ ...item, sort_order: (itemIndex + 1) * 10 })) }
    })
  }

  const handleFileUpload = async (e: any, folder: string, field: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const path = `${folder}/${fileName}`
      const { error } = await supabase.storage.from("media").upload(path, file)
      if (error) throw error
      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(path)
      setFormData((prev: any) => ({ ...prev, [field]: publicUrl }))
      toast({ title: "Đã tải lên", description: field === "cv_url" ? "CV đã sẵn sàng." : "Media đã sẵn sàng." })
    } catch (error: any) {
      toast({ title: "Lỗi upload", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const setDepartment = (departmentId: string) => {
    const department = departments.find((item: Department) => item.id === departmentId)
    setFormData({ ...formData, department_id: departmentId, department_name: department?.name || "" })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { id, created_at, updated_at, gzver_departments, ...payload } = formData
      const cleanPayload = {
        ...payload,
        department_id: payload.department_id || null,
        department_name: payload.department_name || null,
        role_level: payload.role_level || null,
        headline: payload.headline || null,
        location: payload.location || null,
        email: payload.email || null,
        phone: payload.phone || null,
        website_url: payload.website_url || null,
        cover_image_url: payload.cover_image_url || null,
        skills: (payload.skills || []).map((item: string) => item.trim()).filter(Boolean),
        achievements_list: (payload.achievements_list || []).map((item: string) => item.trim()).filter(Boolean),
        social_links: sortByOrder<SocialLink>(payload.social_links).filter((item: SocialLink) => item.label || item.href),
        profile_tabs: sortByOrder<ProfileSection>(payload.profile_tabs).filter((item: ProfileSection) => item.key && item.label),
        profile_badges: sortByOrder<ProfileBadge>(payload.profile_badges).filter((item: ProfileBadge) => item.label),
      }
      const { error } = gzver?.id
        ? await supabase.from("gzvers").update(cleanPayload).eq("id", gzver.id)
        : await supabase.from("gzvers").insert([cleanPayload])
      if (error) throw error
      toast({ title: "Đã lưu thông tin GZVer thành công!" })
      onSave()
      onClose()
    } catch (error: any) {
      toast({ title: "Không lưu được", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[96vh] overflow-hidden rounded-none border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-white">
        <DialogDescription className="sr-only">Quản lý hồ sơ GZVer</DialogDescription>

        {/* Header Modal */}
        <DialogHeader className="bg-white text-slate-900 p-6 border-b border-slate-200 dark:border-white/10 dark:bg-slate-900 dark:text-white rounded-none">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="bg-[#ed1c24] p-3 text-white shadow-xs rounded-none">
                <UserCheck size={22} />
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  {gzver ? `Chỉnh sửa Hồ sơ: ${formData.full_name || "GZVer"}` : "Tạo Hồ sơ Magazine GZVer mới"}
                </DialogTitle>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Tùy biến Section, Social links, Badge, Tải CV & Preview trực tiếp PC/Mobile
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-800 px-4 py-2.5 rounded-none">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Hiển thị Public</Label>
              <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData({ ...formData, is_active: val })} />
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="h-12 w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900 px-6">
            <TabsTrigger
              value="basic"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Ảnh & Crop Profile
            </TabsTrigger>
            <TabsTrigger
              value="story"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Năng lực & Học vấn
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Mạng xã hội
            </TabsTrigger>
            <TabsTrigger
              value="sections"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Section chi tiết
            </TabsTrigger>
            <TabsTrigger
              value="badges"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Huy hiệu Badge
            </TabsTrigger>
            <TabsTrigger
              value="docs"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Hồ sơ CV (PDF)
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Xem trước (Preview)
            </TabsTrigger>
          </TabsList>

          <div className="max-h-[64vh] overflow-y-auto p-6 bg-white dark:bg-slate-950">
            {/* TAB 1: BASIC */}
            <TabsContent value="basic" className="mt-0 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Họ và tên *">
                  <Input
                    className="h-11 rounded-none border-slate-200 bg-white font-bold text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value, slug: convertToSlug(e.target.value) })}
                  />
                </Field>
                <Field label="Slug URL (Đường dẫn tĩnh)">
                  <Input
                    className="h-11 rounded-none border-slate-200 bg-slate-50 font-mono text-[#ed1c24] dark:border-white/10 dark:bg-slate-900"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: convertToSlug(e.target.value) })}
                  />
                </Field>
                <Field label="Ban chuyên môn">
                  <Select value={formData.department_id || ""} onValueChange={setDepartment}>
                    <SelectTrigger className="h-11 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white">
                      <SelectValue placeholder="Chọn phòng ban..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white">
                      {departments.map((department: Department, index: number) => {
                        const deptVal = department.id || department.slug || `dept-${index}`
                        return (
                          <SelectItem key={deptVal} value={deptVal}>
                            {department.name}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Role Level / Nhãn nổi bật">
                  <Input
                    className="h-11 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    placeholder="Founder, Lead, Core Member..."
                    value={formData.role_level || ""}
                    onChange={(e) => setFormData({ ...formData, role_level: e.target.value })}
                  />
                </Field>
                <Field label="Chức danh / Vị trí đảm nhiệm">
                  <Input
                    className="h-11 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </Field>
                <Field label="Đơn vị / Công ty">
                  <Input
                    className="h-11 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </Field>
                <Field label="Địa điểm làm việc">
                  <Input
                    className="h-11 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    value={formData.location || ""}
                    placeholder="TP. Hồ Chí Minh, Việt Nam"
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </Field>
                <Field label="Thứ tự ưu tiên hiển thị">
                  <Input
                    type="number"
                    className="h-11 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 0 })}
                  />
                </Field>
              </div>

              <Field label="Headline trên profile cá nhân">
                <Textarea
                  className="min-h-20 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white text-xs"
                  placeholder="Câu châm ngôn ngắn gọn hoặc định vị bản thân..."
                  value={formData.headline || ""}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                />
              </Field>

              <Field label="Tóm tắt thành tích nổi bật">
                <Textarea
                  className="min-h-20 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white text-xs"
                  placeholder="3-5 gạch đầu dòng thành tựu nổi trội..."
                  value={formData.achievement_summary || ""}
                  onChange={(e) => setFormData({ ...formData, achievement_summary: e.target.value })}
                />
              </Field>

              <Field label="Quote / Lời chia sẻ">
                <Textarea
                  className="min-h-24 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white text-xs"
                  placeholder="Lời chia sẻ về hành trình phát triển tại GZV..."
                  value={formData.testimonial || ""}
                  onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                />
              </Field>
            </TabsContent>

            {/* TAB 2: MEDIA & CROP */}
            <TabsContent value="media" className="mt-0 grid gap-6 lg:grid-cols-2">
              <MediaEditor
                title="Ảnh Đại Diện (Avatar)"
                field="avatar_url"
                folder="gzvers/avatars"
                formData={formData}
                setFormData={setFormData}
                handleFileUpload={handleFileUpload}
              />
              <MediaEditor
                title="Ảnh Bìa Profile (Cover Image)"
                field="cover_image_url"
                folder="gzvers/covers"
                formData={formData}
                setFormData={setFormData}
                handleFileUpload={handleFileUpload}
                wide
              />
            </TabsContent>

            {/* TAB 3: STORY & CAPABILITY */}
            <TabsContent value="story" className="mt-0 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Kỹ năng chuyên môn (Mỗi dòng một mục)">
                  <Textarea
                    className="min-h-40 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white text-xs font-mono"
                    placeholder="Quản trị chiến lược&#10;Marketing & Branding&#10;Data Analysis"
                    value={(formData.skills || []).join("\n")}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value.split("\n") })}
                  />
                </Field>
                <Field label="Danh sách giải thưởng & chứng nhận (Mỗi dòng một mục)">
                  <Textarea
                    className="min-h-40 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white text-xs font-mono"
                    placeholder="Top 10 Sao Vàng Đất Việt&#10;Học bổng Xuất Sắc GZV"
                    value={(formData.achievements_list || []).join("\n")}
                    onChange={(e) => setFormData({ ...formData, achievements_list: e.target.value.split("\n") })}
                  />
                </Field>
                <Field label="Học vấn & Bằng cấp">
                  <Textarea
                    className="min-h-32 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white text-xs"
                    value={formData.background?.education || ""}
                    placeholder="Cử nhân Kinh tế Quốc tế - ĐH Ngoại Thương..."
                    onChange={(e) => setFormData({ ...formData, background: { ...formData.background, education: e.target.value } })}
                  />
                </Field>
                <Field label="Kinh nghiệm làm việc & Dự án">
                  <Textarea
                    className="min-h-32 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white text-xs"
                    value={formData.background?.experience || ""}
                    placeholder="5+ năm kinh nghiệm quản lý dự án công nghệ..."
                    onChange={(e) => setFormData({ ...formData, background: { ...formData.background, experience: e.target.value } })}
                  />
                </Field>
              </div>
              <Field label="Lộ trình thăng tiến & Mục tiêu sự nghiệp">
                <Textarea
                  className="min-h-24 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white text-xs"
                  value={formData.promotion_path || ""}
                  onChange={(e) => setFormData({ ...formData, promotion_path: e.target.value })}
                />
              </Field>
              <Field label="Đóng góp xã hội & Cộng đồng">
                <Textarea
                  className="min-h-24 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white text-xs"
                  value={formData.social_impact || ""}
                  onChange={(e) => setFormData({ ...formData, social_impact: e.target.value })}
                />
              </Field>
            </TabsContent>

            {/* TAB 4: SOCIAL MEDIA */}
            <TabsContent value="social" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Email liên hệ">
                  <Input
                    className="h-11 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    placeholder="ten.nguyen@gzv.vn"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Field>
                <Field label="Số điện thoại">
                  <Input
                    className="h-11 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    placeholder="0901 234 567"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Field>
                <Field label="Website / Portfolio">
                  <Input
                    className="h-11 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    placeholder="https://myprofile.com"
                    value={formData.website_url || ""}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  />
                </Field>
              </div>

              <ArrayHeader
                title="Kênh Mạng Xã Hội"
                onAdd={() =>
                  setFormData({
                    ...formData,
                    social_links: [
                      ...(formData.social_links || []),
                      { label: "LinkedIn", platform: "linkedin", href: "", visible: true, sort_order: ((formData.social_links || []).length + 1) * 10 },
                    ],
                  })
                }
              />

              {(formData.social_links || []).map((item: SocialLink, index: number) => (
                <div key={index} className="grid gap-3 border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900 p-4 lg:grid-cols-[1fr_150px_2fr_auto] rounded-none">
                  <Input
                    className="h-10 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white text-xs"
                    placeholder="Tên nhãn (Ví dụ: LinkedIn)"
                    value={item.label || ""}
                    onChange={(e) => updateArrayItem("social_links", index, { label: e.target.value })}
                  />
                  <Input
                    className="h-10 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white text-xs"
                    placeholder="facebook/linkedin/zalo"
                    value={item.platform || ""}
                    onChange={(e) => updateArrayItem("social_links", index, { platform: e.target.value })}
                  />
                  <Input
                    className="h-10 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white text-xs font-mono"
                    placeholder="https://..."
                    value={item.href || ""}
                    onChange={(e) => updateArrayItem("social_links", index, { href: e.target.value })}
                  />
                  <RowActions
                    field="social_links"
                    index={index}
                    visible={item.visible}
                    updateArrayItem={updateArrayItem}
                    removeArrayItem={removeArrayItem}
                    moveArrayItem={moveArrayItem}
                  />
                </div>
              ))}
            </TabsContent>

            {/* TAB 5: SECTIONS */}
            <TabsContent value="sections" className="mt-0 space-y-4">
              <ArrayHeader
                title="Khối Nội Dung Magazine Profile"
                onAdd={() =>
                  setFormData({
                    ...formData,
                    profile_tabs: [
                      ...(formData.profile_tabs || []),
                      {
                        key: `section-${Date.now()}`,
                        label: "Section mới",
                        label_en: "",
                        type: "text",
                        source: "custom",
                        content: "",
                        visible: true,
                        sort_order: ((formData.profile_tabs || []).length + 1) * 10,
                      },
                    ],
                  })
                }
              />

              {(formData.profile_tabs || []).map((item: ProfileSection, index: number) => (
                <div key={index} className="space-y-3 border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900 p-4 rounded-none">
                  <div className="grid gap-3 lg:grid-cols-[140px_1fr_1fr_150px_160px_auto]">
                    <Input
                      className="h-10 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white text-xs font-mono"
                      placeholder="key-code"
                      value={item.key || ""}
                      onChange={(e) => updateArrayItem("profile_tabs", index, { key: convertToSlug(e.target.value) })}
                    />
                    <Input
                      className="h-10 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white text-xs font-bold"
                      placeholder="Tiêu đề Section (VN)"
                      value={item.label || ""}
                      onChange={(e) => updateArrayItem("profile_tabs", index, { label: e.target.value })}
                    />
                    <Input
                      className="h-10 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white text-xs"
                      placeholder="Tiêu đề EN (Tùy chọn)"
                      value={item.label_en || ""}
                      onChange={(e) => updateArrayItem("profile_tabs", index, { label_en: e.target.value })}
                    />
                    <Select value={item.type || "text"} onValueChange={(value) => updateArrayItem("profile_tabs", index, { type: value })}>
                      <SelectTrigger className="h-10 rounded-none border-slate-200 bg-white text-xs dark:border-white/10 dark:bg-slate-950">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white">
                        <SelectItem value="overview">Tổng quan</SelectItem>
                        <SelectItem value="text">Văn bản tự do</SelectItem>
                        <SelectItem value="list">Danh sách gạch đầu dòng</SelectItem>
                        <SelectItem value="background">Học vấn & Kinh nghiệm</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      className="h-10 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white text-xs font-mono"
                      placeholder="source hoặc custom"
                      value={item.source || ""}
                      onChange={(e) => updateArrayItem("profile_tabs", index, { source: e.target.value })}
                    />
                    <RowActions
                      field="profile_tabs"
                      index={index}
                      visible={item.visible}
                      updateArrayItem={updateArrayItem}
                      removeArrayItem={removeArrayItem}
                      moveArrayItem={moveArrayItem}
                    />
                  </div>
                  <Textarea
                    className="min-h-24 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white text-xs"
                    placeholder="Nhập nội dung chi tiết cho khối này..."
                    value={item.content || ""}
                    onChange={(e) => updateArrayItem("profile_tabs", index, { content: e.target.value })}
                  />
                </div>
              ))}
            </TabsContent>

            {/* TAB 6: BADGES */}
            <TabsContent value="badges" className="mt-0 space-y-4">
              <ArrayHeader
                title="Huy Hiệu & Danh Hiệu Nổi Bật"
                onAdd={() =>
                  setFormData({
                    ...formData,
                    profile_badges: [
                      ...(formData.profile_badges || []),
                      { label: "Danh hiệu mới", icon: "star", color: "#ed1c24", visible: true, sort_order: ((formData.profile_badges || []).length + 1) * 10 },
                    ],
                  })
                }
              />
              {(formData.profile_badges || []).map((item: ProfileBadge, index: number) => (
                <div key={index} className="grid gap-3 border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900 p-4 lg:grid-cols-[1fr_150px_120px_auto] rounded-none">
                  <Input
                    className="h-10 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white text-xs font-bold"
                    placeholder="Tên nhãn huy hiệu"
                    value={item.label || ""}
                    onChange={(e) => updateArrayItem("profile_badges", index, { label: e.target.value })}
                  />
                  <Input
                    className="h-10 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white text-xs"
                    placeholder="star/shield/award"
                    value={item.icon || ""}
                    onChange={(e) => updateArrayItem("profile_badges", index, { icon: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      className="h-10 w-12 rounded-none border-slate-200 bg-white p-1 cursor-pointer"
                      value={item.color || "#ed1c24"}
                      onChange={(e) => updateArrayItem("profile_badges", index, { color: e.target.value })}
                    />
                    <span className="text-[10px] font-mono font-bold uppercase">{item.color}</span>
                  </div>
                  <RowActions
                    field="profile_badges"
                    index={index}
                    visible={item.visible}
                    updateArrayItem={updateArrayItem}
                    removeArrayItem={removeArrayItem}
                    moveArrayItem={moveArrayItem}
                  />
                </div>
              ))}
            </TabsContent>

            {/* TAB 7: CV DOCS */}
            <TabsContent value="docs" className="mt-0">
              <div className="flex min-h-[260px] flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-900/50 p-8 text-center rounded-none">
                <div className="mb-4 bg-red-50 dark:bg-red-950/40 p-4 border border-red-200 dark:border-red-900 rounded-none">
                  <FileText size={36} className="text-[#ed1c24]" />
                </div>
                {formData.cv_url ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-6 py-3 text-emerald-700 dark:text-emerald-400 rounded-none">
                      <FileCheck size={20} />
                      <a href={formData.cv_url} target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-wider hover:underline">
                        Xem tệp CV đã tải lên ↗
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData({ ...formData, cv_url: "" })}
                        className="h-7 w-7 rounded-none text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-semibold max-w-sm">
                      Tải lên bản PDF hồ sơ CV của nhân sự để hiển thị liên kết xem trực tiếp trên website.
                    </p>
                    <Button variant="outline" className="relative h-11 rounded-none border-[#ed1c24] px-8 text-xs font-black uppercase text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white">
                      {loading ? <Loader2 className="mr-2 animate-spin h-4 w-4" /> : <Upload size={16} className="mr-2" />} Tải file PDF CV
                      <input
                        type="file"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e, "gzvers/cvs", "cv_url")}
                        disabled={loading}
                      />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 8: PREVIEW */}
            <TabsContent value="preview" className="mt-0 space-y-4">
              <div className="flex items-center justify-between border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900 p-4 rounded-none">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Xem Trước Trực Quan (Live Preview)
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    Kiểm tra hiển thị bố cục hồ sơ theo dữ liệu đang biên tập
                  </p>
                </div>
                <div className="flex border border-slate-200 dark:border-white/10">
                  <Button
                    onClick={() => setPreviewMode("desktop")}
                    className={`h-8 rounded-none px-3 text-xs font-bold uppercase ${previewMode === "desktop" ? "bg-[#ed1c24] text-white" : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                  >
                    <Monitor className="mr-1.5 h-3.5 w-3.5" /> Desktop
                  </Button>
                  <Button
                    onClick={() => setPreviewMode("mobile")}
                    className={`h-8 rounded-none px-3 text-xs font-bold uppercase ${previewMode === "mobile" ? "bg-[#ed1c24] text-white" : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                  >
                    <Smartphone className="mr-1.5 h-3.5 w-3.5" /> Mobile
                  </Button>
                </div>
              </div>
              <ProfilePreview formData={formData} previewMode={previewMode} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-between items-center border-t border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950 rounded-none">
          <Button variant="ghost" onClick={onClose} className="rounded-none px-6 text-xs font-black uppercase text-slate-500 hover:bg-slate-200/60">
            Hủy Bỏ
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="h-11 rounded-none bg-[#ed1c24] px-8 text-xs font-black uppercase text-white hover:bg-[#c91218]">
            {loading ? <Loader2 className="mr-2 animate-spin h-4 w-4" /> : <Save size={16} className="mr-2" />} Lưu Toàn Bộ Hồ Sơ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
        <Hash className="h-3 w-3 text-[#ed1c24]" />
        {label}
      </Label>
      {children}
    </div>
  )
}

function ArrayHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900 p-3.5 rounded-none">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">{title}</h3>
      <Button onClick={onAdd} size="sm" className="h-8 rounded-none bg-[#ed1c24] px-3 text-xs font-black uppercase text-white hover:bg-[#c91218]">
        <Plus className="mr-1 h-3.5 w-3.5" /> Thêm Mục Mới
      </Button>
    </div>
  )
}

function RowActions({ field, index, visible, updateArrayItem, removeArrayItem, moveArrayItem }: any) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Switch checked={visible !== false} onCheckedChange={(value) => updateArrayItem(field, index, { visible: value })} />
      <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-none" onClick={() => moveArrayItem(field, index, -1)}>
        <ArrowUp className="h-3.5 w-3.5" />
      </Button>
      <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-none" onClick={() => moveArrayItem(field, index, 1)}>
        <ArrowDown className="h-3.5 w-3.5" />
      </Button>
      <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-none text-red-600 hover:bg-red-50" onClick={() => removeArrayItem(field, index)}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function MediaEditor({ title, field, folder, formData, setFormData, handleFileUpload, wide }: any) {
  const xField = field === "avatar_url" ? "avatar_position_x" : "cover_position_x"
  const yField = field === "avatar_url" ? "avatar_position_y" : "cover_position_y"
  const scaleField = field === "avatar_url" ? "avatar_scale" : "cover_scale"
  return (
    <div className="space-y-4 border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-900 p-5 rounded-none">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
          <ImageIcon className="h-4 w-4 text-[#ed1c24]" />
          {title}
        </h3>
        <Button variant="outline" size="sm" className="relative h-8 rounded-none border-[#ed1c24] text-[#ed1c24] text-xs font-bold hover:bg-[#ed1c24] hover:text-white">
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload File
          <input type="file" className="absolute inset-0 cursor-pointer opacity-0" accept="image/*" onChange={(e) => handleFileUpload(e, folder, field)} />
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(200px,0.9fr)_1.1fr]">
        <div className={`relative overflow-hidden border border-slate-300 dark:border-white/10 bg-slate-950 ${wide ? "aspect-[16/7]" : "mx-auto aspect-square w-full max-w-[260px]"}`}>
          {formData[field] ? (
            <img
              src={formData[field]}
              alt={title}
              className="h-full w-full object-cover"
              style={{ objectPosition: `${formData[xField] || 50}% ${formData[yField] || 50}%`, transform: `scale(${(formData[scaleField] || 100) / 100})` }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-black uppercase tracking-widest text-slate-500">Chưa có ảnh</div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-black/75 px-2.5 py-1.5 text-[9px] font-mono text-white">
            Crop: X {formData[xField] || 50}% · Y {formData[yField] || 50}% · Zoom {formData[scaleField] || 100}%
          </div>
        </div>

        <div className="space-y-3">
          <Field label="URL ảnh trực tiếp">
            <div className="flex gap-2">
              <Input
                className="h-9 rounded-none border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950 text-xs font-mono"
                value={formData[field] || ""}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              />
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-none shrink-0" asChild>
                <a href={formData[field] || "#"} target="_blank" rel="noreferrer">
                  <Link2 className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </Field>

          <div className="border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950 p-3.5 space-y-3 rounded-none">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#ed1c24]">Điều chỉnh khung nhìn</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 rounded-none px-2 text-[9px] font-bold uppercase"
                onClick={() => setFormData({ ...formData, [xField]: 50, [yField]: 50, [scaleField]: 100 })}
              >
                Reset
              </Button>
            </div>

            <RangeField label="Vị trí ngang (Trái / Phải)" value={formData[xField] || 50} onChange={(value) => setFormData({ ...formData, [xField]: value })} />
            <RangeField label="Vị trí dọc (Trên / Dưới)" value={formData[yField] || 50} onChange={(value) => setFormData({ ...formData, [yField]: value })} />
            <RangeField label="Thu phóng (Zoom %)" min={80} max={180} value={formData[scaleField] || 100} onChange={(value) => setFormData({ ...formData, [scaleField]: value })} />
          </div>
        </div>
      </div>
    </div>
  )
}

function RangeField({ label, value, onChange, min = 0, max = 100 }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-semibold text-slate-500">
        <span>{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#ed1c24] h-1.5 bg-slate-200 dark:bg-slate-800 cursor-pointer" />
    </div>
  )
}

function ProfilePreview({ formData, previewMode }: { formData: any; previewMode: "desktop" | "mobile" }) {
  const sections = useMemo(() => sortByOrder(formData.profile_tabs || []).filter((item: any) => item.visible !== false), [formData.profile_tabs])
  const badges = useMemo(() => sortByOrder(formData.profile_badges || []).filter((item: any) => item.visible !== false), [formData.profile_badges])
  const socials = useMemo(() => sortByOrder(formData.social_links || []).filter((item: any) => item.visible !== false), [formData.social_links])
  const isMobile = previewMode === "mobile"
  const avatarStyle = { objectPosition: `${formData.avatar_position_x || 50}% ${formData.avatar_position_y || 50}%`, transform: `scale(${(formData.avatar_scale || 100) / 100})` }
  const coverStyle = { objectPosition: `${formData.cover_position_x || 50}% ${formData.cover_position_y || 50}%`, transform: `scale(${(formData.cover_scale || 100) / 100})` }

  return (
    <div className="overflow-auto border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900 p-4 rounded-none">
      <div className={`mx-auto overflow-hidden border border-slate-200 bg-white text-slate-950 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-white ${isMobile ? "max-w-[390px]" : "max-w-5xl"}`}>
        <div className="relative h-44 overflow-hidden bg-slate-900">
          {formData.cover_image_url ? (
            <img src={formData.cover_image_url} alt="" className="h-full w-full object-cover opacity-85" style={coverStyle} />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,#050505_0%,#220608_45%,#ed1c24_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="mb-1.5 inline-flex bg-[#ed1c24] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white">{formData.department_name || "GZVers"}</p>
            <h2 className="text-2xl font-black uppercase leading-none text-white">{formData.full_name || "Tên GZVer"}</h2>
          </div>
        </div>

        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-[260px_1fr]"}`}>
          <aside className="bg-slate-900 p-5 text-white">
            <div className="-mt-14 mb-4 h-28 w-28 overflow-hidden border-4 border-slate-900 bg-slate-200 rounded-none shadow-md">
              {formData.avatar_url ? <img src={formData.avatar_url} alt="" className="h-full w-full object-cover" style={avatarStyle} /> : <div className="h-full w-full bg-slate-200" />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24]">{formData.role_level || "GZVer profile"}</p>
            <h3 className="mt-1 text-base font-black uppercase">{formData.position || "Chức danh"}</h3>
            <p className="mt-2 text-xs font-semibold text-slate-300 leading-relaxed">{formData.headline || "Headline sẽ hiển thị tại đây."}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {badges.map((badge: any, index: number) => (
                <span key={index} className="border px-2 py-0.5 text-[9px] font-black uppercase" style={{ borderColor: badge.color || "#ed1c24", color: badge.color || "#ed1c24" }}>
                  {badge.label}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {socials.map((item: any, index: number) => (
                <span key={index} className="border border-white/20 px-2 py-0.5 text-[9px] font-black uppercase text-white/80">
                  {item.label || item.platform}
                </span>
              ))}
            </div>
          </aside>

          <div className="space-y-4 p-5">
            <div className="border-l-4 border-[#ed1c24] bg-slate-50 dark:bg-white/5 p-3.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24]">Profile Sections</p>
              <h3 className="mt-0.5 text-base font-black uppercase text-slate-900 dark:text-white">Hồ sơ chi tiết</h3>
            </div>
            {sections.map((section: any, index: number) => (
              <div key={section.key || index} className="border border-slate-200 dark:border-white/10 p-4">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-[#ed1c24]">Section {String(index + 1).padStart(2, "0")}</p>
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">{section.label || "Section"}</h4>
                <p className="mt-2 whitespace-pre-line text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  {section.content || previewSourceText(formData, section) || "Nội dung sẽ hiển thị tại đây."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function previewSourceText(formData: any, section: ProfileSection) {
  if (section.type === "overview") return formData.testimonial || formData.achievement_summary
  if (section.type === "list") {
    const list = section.source === "skills" ? formData.skills : formData.achievements_list
    return Array.isArray(list) ? list.join("\n") : ""
  }
  if (section.type === "background") return [formData.background?.experience, formData.background?.education].filter(Boolean).join("\n\n")
  return section.source && section.source !== "custom" ? formData[section.source] : ""
}
