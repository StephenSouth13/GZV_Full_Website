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
  Eye,
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

const convertToSlug = (text: string) => text
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
  { key: "journey", label: "Lộ trình phát triển", label_en: "Journey", type: "text", source: "promotion_path", visible: true, sort_order: 20 },
  { key: "achievements", label: "Thành tựu nổi bật", label_en: "Achievements", type: "list", source: "achievements_list", visible: true, sort_order: 30 },
  { key: "experience", label: "Năng lực thực chiến", label_en: "Experience", type: "background", source: "experience", visible: true, sort_order: 40 },
  { key: "impact", label: "Tác động xã hội", label_en: "Impact", type: "text", source: "social_impact", visible: true, sort_order: 50 },
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
  graduation_year: "",
  promotion_path: "",
  social_impact: "",
  course_taken: "",
  skills: [] as string[],
  achievements_list: [] as string[],
  mentoring_content: "",
  background: { education: "", previous_role: "", experience: "" },
  social_links: [] as SocialLink[],
  profile_tabs: defaultSections,
  profile_badges: [{ label: "GZVer", icon: "shield", color: "#ed1c24", visible: true, sort_order: 10 }] as ProfileBadge[],
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

const normalizeArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (!value) return []
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed as T[] : []
    } catch {
      return []
    }
  }
  return []
}

const sortByOrder = <T extends { sort_order?: number }>(items: unknown = []) =>
  [...normalizeArray<T>(items)].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

export function GZVerModal({ open, onClose, gzver, onSave, departments = [] }: any) {
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
      [field]: normalizeArray<any>(prev[field]).map((item: any, itemIndex: number) => itemIndex === index ? { ...item, ...patch } : item),
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev: any) => ({ ...prev, [field]: normalizeArray<any>(prev[field]).filter((_: any, itemIndex: number) => itemIndex !== index) }))
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
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path)
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
      toast({ title: "Đã lưu GZVer" })
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
      <DialogContent className="max-w-7xl overflow-hidden rounded-none border-white/10 bg-gray-950 p-0 text-white shadow-2xl">
        <DialogDescription className="sr-only">Quản lý hồ sơ GZVer</DialogDescription>
        <DialogHeader className="border-b border-white/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#ed1c24] p-3"><Sparkles className="text-white" size={22} /></div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Hồ sơ GZVer</DialogTitle>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Chỉnh section tự do, social, badge, media và xem trước PC/mobile</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3">
              <Label className="text-[10px] font-black uppercase tracking-widest">Hiển thị public</Label>
              <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData({ ...formData, is_active: val })} />
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="h-12 w-full justify-start gap-4 overflow-x-auto rounded-none border-b border-white/10 bg-transparent px-6">
            <TabsTrigger value="basic" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">Thông tin</TabsTrigger>
            <TabsTrigger value="media" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">Ảnh & crop</TabsTrigger>
            <TabsTrigger value="story" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">Năng lực</TabsTrigger>
            <TabsTrigger value="social" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">Social</TabsTrigger>
            <TabsTrigger value="sections" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">Section chi tiết</TabsTrigger>
            <TabsTrigger value="badges" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">Badge</TabsTrigger>
            <TabsTrigger value="preview" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">Preview</TabsTrigger>
            <TabsTrigger value="docs" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">CV</TabsTrigger>
          </TabsList>

          <div className="max-h-[66vh] overflow-y-auto p-6">
            <TabsContent value="basic" className="mt-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Họ và tên"><Input className="h-12 rounded-none border-white/10 bg-white/5 font-bold text-white" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value, slug: convertToSlug(e.target.value) })} /></Field>
                <Field label="Slug"><Input className="h-12 rounded-none border-white/10 bg-white/5 font-mono text-[#ed1c24]" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: convertToSlug(e.target.value) })} /></Field>
                <Field label="Ban">
                  <Select value={formData.department_id || ""} onValueChange={setDepartment}>
                    <SelectTrigger className="h-12 rounded-none border-white/10 bg-white/5 text-white"><SelectValue placeholder="Chọn ban" /></SelectTrigger>
                    <SelectContent className="rounded-none border-white/10 bg-gray-950 text-white">
                      {departments.map((department: Department) => <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Role level / nhãn nổi bật"><Input className="h-12 rounded-none border-white/10 bg-white/5 text-white" placeholder="Founder, Lead, Member..." value={formData.role_level || ""} onChange={(e) => setFormData({ ...formData, role_level: e.target.value })} /></Field>
                <Field label="Chức danh"><Input className="h-12 rounded-none border-white/10 bg-white/5 text-white" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} /></Field>
                <Field label="Đơn vị / công ty"><Input className="h-12 rounded-none border-white/10 bg-white/5 text-white" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></Field>
                <Field label="Địa điểm"><Input className="h-12 rounded-none border-white/10 bg-white/5 text-white" value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></Field>
                <Field label="Thứ tự danh sách"><Input type="number" className="h-12 rounded-none border-white/10 bg-white/5 text-white" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 0 })} /></Field>
              </div>
              <Field label="Headline trên profile"><Textarea className="min-h-24 rounded-none border-white/10 bg-white/5 text-white" value={formData.headline || ""} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} /></Field>
              <Field label="Thành tích hiển thị trên card"><Textarea className="min-h-24 rounded-none border-white/10 bg-white/5 text-white" value={formData.achievement_summary || ""} onChange={(e) => setFormData({ ...formData, achievement_summary: e.target.value })} /></Field>
              <Field label="Quote / testimonial"><Textarea className="min-h-28 rounded-none border-white/10 bg-white/5 text-white" value={formData.testimonial || ""} onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })} /></Field>
              <div className="flex items-center justify-between border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#ed1c24]" /><Label className="text-[10px] font-black uppercase tracking-widest">Ban điều hành</Label></div>
                <Switch checked={formData.is_director} onCheckedChange={(val) => setFormData({ ...formData, is_director: val })} />
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-0 grid gap-6 lg:grid-cols-2">
              <MediaEditor title="Ảnh đại diện" field="avatar_url" folder="gzvers/avatars" formData={formData} setFormData={setFormData} handleFileUpload={handleFileUpload} />
              <MediaEditor title="Cover profile" field="cover_image_url" folder="gzvers/covers" formData={formData} setFormData={setFormData} handleFileUpload={handleFileUpload} wide />
            </TabsContent>

            <TabsContent value="story" className="mt-0 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Kỹ năng, mỗi dòng một mục"><Textarea className="min-h-44 rounded-none border-white/10 bg-white/5 text-white" value={(formData.skills || []).join("\n")} onChange={(e) => setFormData({ ...formData, skills: e.target.value.split("\n") })} /></Field>
                <Field label="Thành tựu, mỗi dòng một mục"><Textarea className="min-h-44 rounded-none border-white/10 bg-white/5 text-white" value={(formData.achievements_list || []).join("\n")} onChange={(e) => setFormData({ ...formData, achievements_list: e.target.value.split("\n") })} /></Field>
                <Field label="Học vấn"><Textarea className="min-h-36 rounded-none border-white/10 bg-white/5 text-white" value={formData.background?.education || ""} onChange={(e) => setFormData({ ...formData, background: { ...formData.background, education: e.target.value } })} /></Field>
                <Field label="Kinh nghiệm"><Textarea className="min-h-36 rounded-none border-white/10 bg-white/5 text-white" value={formData.background?.experience || ""} onChange={(e) => setFormData({ ...formData, background: { ...formData.background, experience: e.target.value } })} /></Field>
              </div>
              <Field label="Lộ trình phát triển"><Textarea className="min-h-28 rounded-none border-white/10 bg-white/5 text-white" value={formData.promotion_path || ""} onChange={(e) => setFormData({ ...formData, promotion_path: e.target.value })} /></Field>
              <Field label="Tác động xã hội / cộng đồng"><Textarea className="min-h-28 rounded-none border-white/10 bg-white/5 text-white" value={formData.social_impact || ""} onChange={(e) => setFormData({ ...formData, social_impact: e.target.value })} /></Field>
            </TabsContent>

            <TabsContent value="social" className="mt-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Email"><Input className="h-12 rounded-none border-white/10 bg-white/5 text-white" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></Field>
                <Field label="Số điện thoại"><Input className="h-12 rounded-none border-white/10 bg-white/5 text-white" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></Field>
                <Field label="Website cá nhân"><Input className="h-12 rounded-none border-white/10 bg-white/5 text-white" value={formData.website_url || ""} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} /></Field>
              </div>
              <ArrayHeader title="Social media" onAdd={() => setFormData({ ...formData, social_links: [...(formData.social_links || []), { label: "LinkedIn", platform: "linkedin", href: "", visible: true, sort_order: ((formData.social_links || []).length + 1) * 10 }] })} />
              {(formData.social_links || []).map((item: SocialLink, index: number) => (
                <div key={index} className="grid gap-3 border border-white/10 bg-white/5 p-4 lg:grid-cols-[1fr_150px_2fr_auto]">
                  <Input className="h-11 rounded-none border-white/10 bg-black text-white" placeholder="Label" value={item.label || ""} onChange={(e) => updateArrayItem("social_links", index, { label: e.target.value })} />
                  <Input className="h-11 rounded-none border-white/10 bg-black text-white" placeholder="facebook/linkedin/zalo" value={item.platform || ""} onChange={(e) => updateArrayItem("social_links", index, { platform: e.target.value })} />
                  <Input className="h-11 rounded-none border-white/10 bg-black text-white" placeholder="https://..." value={item.href || ""} onChange={(e) => updateArrayItem("social_links", index, { href: e.target.value })} />
                  <RowActions field="social_links" index={index} visible={item.visible} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} moveArrayItem={moveArrayItem} />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="sections" className="mt-0 space-y-4">
              <ArrayHeader title="Section chi tiết trên profile" onAdd={() => setFormData({ ...formData, profile_tabs: [...(formData.profile_tabs || []), { key: `section-${Date.now()}`, label: "Section mới", label_en: "", type: "text", source: "custom", content: "", visible: true, sort_order: ((formData.profile_tabs || []).length + 1) * 10 }] })} />
              {(formData.profile_tabs || []).map((item: ProfileSection, index: number) => (
                <div key={index} className="space-y-3 border border-white/10 bg-white/5 p-4">
                  <div className="grid gap-3 lg:grid-cols-[150px_1fr_1fr_150px_180px_auto]">
                    <Input className="h-11 rounded-none border-white/10 bg-black text-white" placeholder="key" value={item.key || ""} onChange={(e) => updateArrayItem("profile_tabs", index, { key: convertToSlug(e.target.value) })} />
                    <Input className="h-11 rounded-none border-white/10 bg-black text-white" placeholder="Tên section VN" value={item.label || ""} onChange={(e) => updateArrayItem("profile_tabs", index, { label: e.target.value })} />
                    <Input className="h-11 rounded-none border-white/10 bg-black text-white" placeholder="Tên section EN" value={item.label_en || ""} onChange={(e) => updateArrayItem("profile_tabs", index, { label_en: e.target.value })} />
                    <Select value={item.type || "text"} onValueChange={(value) => updateArrayItem("profile_tabs", index, { type: value })}>
                      <SelectTrigger className="h-11 rounded-none border-white/10 bg-black text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-none border-white/10 bg-gray-950 text-white">
                        <SelectItem value="overview">Tổng quan</SelectItem>
                        <SelectItem value="text">Văn bản tự do</SelectItem>
                        <SelectItem value="list">Danh sách</SelectItem>
                        <SelectItem value="background">Học vấn/Kinh nghiệm</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input className="h-11 rounded-none border-white/10 bg-black text-white" placeholder="source hoặc custom" value={item.source || ""} onChange={(e) => updateArrayItem("profile_tabs", index, { source: e.target.value })} />
                    <RowActions field="profile_tabs" index={index} visible={item.visible} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} moveArrayItem={moveArrayItem} />
                  </div>
                  <Textarea className="min-h-28 rounded-none border-white/10 bg-black text-white" placeholder="Nội dung tự do. Có thể xuống dòng, dùng - để tạo ý, hoặc để trống nếu section lấy dữ liệu từ source." value={item.content || ""} onChange={(e) => updateArrayItem("profile_tabs", index, { content: e.target.value })} />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="badges" className="mt-0 space-y-4">
              <ArrayHeader title="Badge profile" onAdd={() => setFormData({ ...formData, profile_badges: [...(formData.profile_badges || []), { label: "Badge mới", icon: "star", color: "#ed1c24", visible: true, sort_order: ((formData.profile_badges || []).length + 1) * 10 }] })} />
              {(formData.profile_badges || []).map((item: ProfileBadge, index: number) => (
                <div key={index} className="grid gap-3 border border-white/10 bg-white/5 p-4 lg:grid-cols-[1fr_150px_150px_auto]">
                  <Input className="h-11 rounded-none border-white/10 bg-black text-white" placeholder="Label" value={item.label || ""} onChange={(e) => updateArrayItem("profile_badges", index, { label: e.target.value })} />
                  <Input className="h-11 rounded-none border-white/10 bg-black text-white" placeholder="star/shield/award" value={item.icon || ""} onChange={(e) => updateArrayItem("profile_badges", index, { icon: e.target.value })} />
                  <Input type="color" className="h-11 rounded-none border-white/10 bg-black p-1" value={item.color || "#ed1c24"} onChange={(e) => updateArrayItem("profile_badges", index, { color: e.target.value })} />
                  <RowActions field="profile_badges" index={index} visible={item.visible} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} moveArrayItem={moveArrayItem} />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="preview" className="mt-0 space-y-4">
              <div className="flex items-center justify-between border border-white/10 bg-black p-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Preview trước khi xuất bản</h3>
                  <p className="mt-1 text-xs font-semibold text-gray-500">Xem nhanh profile theo dữ liệu đang nhập, chưa cần lưu.</p>
                </div>
                <div className="flex border border-white/10">
                  <Button onClick={() => setPreviewMode("desktop")} className={`rounded-none ${previewMode === "desktop" ? "bg-[#ed1c24]" : "bg-transparent hover:bg-white/10"}`}><Monitor className="mr-2 h-4 w-4" />PC</Button>
                  <Button onClick={() => setPreviewMode("mobile")} className={`rounded-none ${previewMode === "mobile" ? "bg-[#ed1c24]" : "bg-transparent hover:bg-white/10"}`}><Smartphone className="mr-2 h-4 w-4" />Mobile</Button>
                </div>
              </div>
              <ProfilePreview formData={formData} previewMode={previewMode} />
            </TabsContent>

            <TabsContent value="docs" className="mt-0">
              <div className="flex min-h-[280px] flex-col items-center justify-center border-2 border-dashed border-white/10 bg-white/5 p-8 text-center">
                <div className="mb-5 bg-[#ed1c24]/15 p-5"><FileText size={44} className="text-[#ed1c24]" /></div>
                {formData.cv_url ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 border border-emerald-500/25 bg-emerald-500/10 px-6 py-4 text-emerald-400">
                      <FileCheck size={22} />
                      <a href={formData.cv_url} target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest">Xem CV đã upload</a>
                      <Button variant="ghost" size="icon" onClick={() => setFormData({ ...formData, cv_url: "" })} className="rounded-none text-red-400 hover:bg-red-500/20"><X size={16} /></Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="relative h-14 rounded-none border-[#ed1c24] px-10 text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white">
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : <Upload size={18} className="mr-2" />} Tải file PDF
                    <input type="file" className="absolute inset-0 cursor-pointer opacity-0" accept=".pdf" onChange={(e) => handleFileUpload(e, "gzvers/cvs", "cv_url")} disabled={loading} />
                  </Button>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 border-t border-white/10 bg-[#0b0b0b] p-6">
          <Button variant="ghost" onClick={onClose} className="rounded-none px-8 text-xs font-black uppercase text-gray-400 hover:bg-white/5">Hủy</Button>
          <Button onClick={handleSubmit} disabled={loading} className="h-12 rounded-none bg-[#ed1c24] px-10 text-xs font-black uppercase text-white hover:bg-[#c91218]">
            {loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Save size={18} className="mr-2" />} Lưu hồ sơ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
        <Hash className="h-3 w-3 text-[#ed1c24]" />
        {label}
      </Label>
      {children}
    </div>
  )
}

function ArrayHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between border border-white/10 bg-black p-4">
      <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
      <Button onClick={onAdd} className="h-10 rounded-none bg-[#ed1c24] px-4 text-xs font-black uppercase text-white hover:bg-[#c91218]">
        <Plus className="mr-2 h-4 w-4" /> Thêm
      </Button>
    </div>
  )
}

function RowActions({ field, index, visible, updateArrayItem, removeArrayItem, moveArrayItem }: any) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Switch checked={visible !== false} onCheckedChange={(value) => updateArrayItem(field, index, { visible: value })} />
      <Button type="button" variant="ghost" size="icon" className="rounded-none text-white hover:bg-white/10" onClick={() => moveArrayItem(field, index, -1)}><ArrowUp className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" className="rounded-none text-white hover:bg-white/10" onClick={() => moveArrayItem(field, index, 1)}><ArrowDown className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" className="rounded-none text-red-400 hover:bg-red-500/15" onClick={() => removeArrayItem(field, index)}><Trash2 className="h-4 w-4" /></Button>
    </div>
  )
}

function MediaEditor({ title, field, folder, formData, setFormData, handleFileUpload, wide }: any) {
  const xField = field === "avatar_url" ? "avatar_position_x" : "cover_position_x"
  const yField = field === "avatar_url" ? "avatar_position_y" : "cover_position_y"
  const scaleField = field === "avatar_url" ? "avatar_scale" : "cover_scale"
  return (
    <div className="space-y-4 border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest"><ImageIcon className="h-4 w-4 text-[#ed1c24]" />{title}</h3>
        <Button variant="outline" className="relative h-10 rounded-none border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white">
          <Upload className="mr-2 h-4 w-4" /> Upload
          <input type="file" className="absolute inset-0 cursor-pointer opacity-0" accept="image/*" onChange={(e) => handleFileUpload(e, folder, field)} />
        </Button>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.9fr)_1.1fr]">
        <div className={`relative overflow-hidden border border-white/10 bg-black ${wide ? "aspect-[16/7]" : "mx-auto aspect-square w-full max-w-[300px]"}`}>
          {formData[field] ? (
            <img
              src={formData[field]}
              alt={title}
              className="h-full w-full object-cover"
              style={{ objectPosition: `${formData[xField] || 50}% ${formData[yField] || 50}%`, transform: `scale(${(formData[scaleField] || 100) / 100})` }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-black uppercase tracking-widest text-white/25">Chưa có ảnh</div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white">
            Crop: X {formData[xField] || 50} · Y {formData[yField] || 50} · Zoom {formData[scaleField] || 100}
          </div>
        </div>
        <div className="space-y-4">
          <Field label="URL ảnh">
            <div className="flex gap-2">
              <Input className="h-11 rounded-none border-white/10 bg-black text-white" value={formData[field] || ""} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })} />
              <Button variant="ghost" size="icon" className="rounded-none text-white hover:bg-white/10" asChild><a href={formData[field] || "#"} target="_blank" rel="noreferrer"><Link2 className="h-4 w-4" /></a></Button>
            </div>
          </Field>
          <div className="border border-[#ed1c24]/35 bg-black p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24]">Crop ảnh trong khung</p>
              <Button type="button" variant="outline" className="h-8 rounded-none border-white/10 bg-white/5 px-3 text-[10px] text-white" onClick={() => setFormData({ ...formData, [xField]: 50, [yField]: 50, [scaleField]: 100 })}>Reset</Button>
            </div>
            <div className="grid gap-4">
              <RangeField label="Trái / phải" value={formData[xField] || 50} onChange={(value) => setFormData({ ...formData, [xField]: value })} />
              <RangeField label="Trên / dưới" value={formData[yField] || 50} onChange={(value) => setFormData({ ...formData, [yField]: value })} />
              <RangeField label="Zoom" min={80} max={180} value={formData[scaleField] || 100} onChange={(value) => setFormData({ ...formData, [scaleField]: value })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RangeField({ label, value, onChange, min = 0, max = 100 }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return (
    <Field label={`${label}: ${value}`}>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#ed1c24]" />
    </Field>
  )
}

function ProfilePreview({ formData, previewMode }: { formData: any; previewMode: "desktop" | "mobile" }) {
  const sections = useMemo(() => sortByOrder(formData.profile_tabs || []).filter((item: ProfileSection) => item.visible !== false), [formData.profile_tabs])
  const badges = useMemo(() => sortByOrder(formData.profile_badges || []).filter((item: ProfileBadge) => item.visible !== false), [formData.profile_badges])
  const socials = useMemo(() => sortByOrder(formData.social_links || []).filter((item: SocialLink) => item.visible !== false), [formData.social_links])
  const isMobile = previewMode === "mobile"
  const avatarStyle = { objectPosition: `${formData.avatar_position_x || 50}% ${formData.avatar_position_y || 50}%`, transform: `scale(${(formData.avatar_scale || 100) / 100})` }
  const coverStyle = { objectPosition: `${formData.cover_position_x || 50}% ${formData.cover_position_y || 50}%`, transform: `scale(${(formData.cover_scale || 100) / 100})` }

  return (
    <div className="overflow-auto border border-white/10 bg-[#111] p-4">
      <div className={`mx-auto overflow-hidden border border-white/10 bg-white text-slate-950 shadow-2xl ${isMobile ? "max-w-[390px]" : "max-w-5xl"}`}>
        <div className="relative h-48 overflow-hidden bg-[#050505]">
          {formData.cover_image_url ? <img src={formData.cover_image_url} alt="" className="h-full w-full object-cover opacity-85" style={coverStyle} /> : <div className="h-full w-full bg-[linear-gradient(135deg,#050505_0%,#220608_45%,#ed1c24_100%)]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="mb-2 inline-flex bg-[#ed1c24] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white">{formData.department_name || "GZVers"}</p>
            <h2 className="text-3xl font-black uppercase leading-none text-white">{formData.full_name || "Tên GZVer"}</h2>
          </div>
        </div>
        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-[280px_1fr]"}`}>
          <aside className="bg-[#050505] p-5 text-white">
            <div className="-mt-16 mb-5 h-36 w-36 overflow-hidden border-8 border-[#050505] bg-slate-200">
              {formData.avatar_url ? <img src={formData.avatar_url} alt="" className="h-full w-full object-cover" style={avatarStyle} /> : <div className="h-full w-full bg-slate-200" />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24]">{formData.role_level || "GZVer profile"}</p>
            <h3 className="mt-2 text-xl font-black uppercase">{formData.position || "Chức danh"}</h3>
            <p className="mt-3 text-sm font-semibold text-white/65">{formData.headline || "Headline sẽ hiển thị tại đây."}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {badges.map((badge: ProfileBadge, index: number) => <span key={index} className="border px-2 py-1 text-[10px] font-black uppercase" style={{ borderColor: badge.color || "#ed1c24", color: badge.color || "#ed1c24" }}>{badge.label}</span>)}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map((item: SocialLink, index: number) => <span key={index} className="border border-white/15 px-2 py-1 text-[10px] font-black uppercase text-white/70">{item.label || item.platform}</span>)}
            </div>
          </aside>
          <div className="space-y-4 p-5">
            <div className="border-l-4 border-[#ed1c24] bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24]">Profile sections</p>
              <h3 className="mt-1 text-xl font-black uppercase">Hồ sơ chi tiết</h3>
            </div>
            {sections.map((section: ProfileSection, index: number) => (
              <div key={section.key || index} className="border border-slate-200 p-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#ed1c24]">Section {String(index + 1).padStart(2, "0")}</p>
                <h4 className="text-lg font-black uppercase">{section.label || "Section"}</h4>
                <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">
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
