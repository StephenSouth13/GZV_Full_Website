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
  Check,
  CreditCard,
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
import { MediaLibraryButton } from "@/components/media/MediaLibraryButton"
import { QRCodeSVG } from "qrcode.react"
import { CvPreview } from "./CvPreview"
import { CvTemplatePicker } from "../../../../shared/gzver/CvTemplatePicker"
import { mergeCvProjects } from "../../../../shared/gzver/cv-model"
import { getGzverAuthors, getGzverProjectCatalog, getGzverHighlights, invalidateGzverHighlights, watchGzverCatalog } from "@/lib/gzver-catalog"

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

type OnlineCard = {
  title: string
  issuer?: string
  front_image_url: string
  back_image_url?: string
  verification_url?: string
  issued_at?: string
  visible: boolean
  sort_order: number
}

type MemberCard = {
  enabled: boolean
  status: "official" | "demo"
  design: "obsidian" | "crimson" | "graphite" | "executive"
  card_title: string
  card_subtitle: string
  card_number: string
  issued_at: string
  expires_at: string
  tagline: string
  qr_url: string
  qr_caption: string
  notice: string
  email: string
  hotline: string
  website_label: string
  front_image_url: string
  back_image_url: string
  links: CardLink[]
  hide_default_links: boolean
}

type CardLink = {
  label: string
  url: string
  icon: string
  visible: boolean
  sort_order: number
}

export const CARD_LINK_ICONS = [
  { value: "website", label: "Website" },
  { value: "facebook", label: "Facebook" },
  { value: "zalo", label: "Zalo" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Điện thoại" },
  { value: "calendar", label: "Đặt lịch" },
  { value: "link", label: "Link khác" },
]

const defaultMemberCard: MemberCard = {
  enabled: true,
  status: "demo",
  design: "obsidian",
  card_title: "",
  card_subtitle: "",
  card_number: "",
  issued_at: "",
  expires_at: "",
  tagline: "",
  qr_url: "",
  qr_caption: "",
  notice: "",
  email: "",
  hotline: "",
  website_label: "",
  front_image_url: "",
  back_image_url: "",
  links: [],
  hide_default_links: false,
}

const FRONTEND_URL = "https://www.gzv.one"

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
  cv_settings: { template: "executive", accent: "#ed1c24", show_contact: true, show_projects: true },
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
  profile_view_mode: "one_view" as "one_view" | "tabs",
  profile_badges: [] as ProfileBadge[],
  online_cards: [] as OnlineCard[],
  member_card: defaultMemberCard,
  avatar_position_x: 50,
  avatar_position_y: 32,
  avatar_scale: 100,
  cover_position_x: 50,
  cover_position_y: 50,
  cover_scale: 100,
  is_active: true,
  is_director: false,
  order: 0,
  linked_author_id: null as string | null,
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
  const [previewContent, setPreviewContent] = useState<"profile" | "cv">("profile")
  const [formData, setFormData] = useState<any>(defaultForm)
  const [authors, setAuthors] = useState<any[]>([])
  const [selectedAuthorId, setSelectedAuthorId] = useState("")
  const [projectOptions, setProjectOptions] = useState<any[]>([])
  const [projectHighlights, setProjectHighlights] = useState<Record<string, any>>({})
  const [projectSearch, setProjectSearch] = useState("")
  const [projectLoadError, setProjectLoadError] = useState("")
  const cvProjects = useMemo(() => mergeCvProjects(formData, projectOptions, Object.entries(projectHighlights).map(([project_id, value]) => ({ ...value, project_id }))), [projectOptions, projectHighlights, formData.id, formData.linked_author_id])
  const cvPerson = { ...formData, department_name: departments?.find((department: Department) => department.id === formData.department_id)?.name || formData.department_name }

  useEffect(() => {
    if (!open) return
    let active = true
    const load = () => getGzverAuthors().then((data) => { if (active) setAuthors(data) }).catch(() => {})
    void load()
    const stop = watchGzverCatalog(() => { void load() })
    return () => { active = false; stop() }
  }, [open])

  useEffect(() => {
    if (!open) return
    let active = true
    const loadProjects = async () => {
      setProjectLoadError("")
      try {
        const projects = await getGzverProjectCatalog()
        if (!active) return
        setProjectOptions(projects)
        let highlights: any[] = []
        if (gzver?.id) {
          try { highlights = await getGzverHighlights(gzver.id) }
          catch (error: any) { setProjectLoadError(`Không đọc được danh sách dự án đã gắn: ${error.message}`) }
        }
        if (!active) return
        setProjectHighlights(Object.fromEntries(highlights.map((item: any) => [item.project_id, item])))
      } catch (error: any) {
        if (!active) return
        setProjectOptions([])
        setProjectLoadError(`Không tải được danh sách dự án: ${error.message || "Lỗi không xác định."}`)
      }
    }
    loadProjects()
    const stop = watchGzverCatalog(() => { void getGzverProjectCatalog().then((rows) => { if (active) setProjectOptions(rows) }).catch((error: any) => { if (active) setProjectLoadError(error.message) }) })
    return () => { active = false; stop() }
  }, [open, gzver?.id])

  const handlePullFromAuthor = () => {
    const source = authors.find((a) => a.id === selectedAuthorId)
    if (!source) return
    setFormData((prev: any) => ({
      ...prev,
      full_name: source.full_name || prev.full_name,
      slug: prev.slug || convertToSlug(source.full_name || prev.full_name),
      avatar_url: source.avatar_url || prev.avatar_url,
      position: source.title || prev.position,
      headline: source.bio || prev.headline,
      linked_author_id: source.id,
    }))
    toast({ title: "Đã kéo dữ liệu từ Tác giả", description: "Bạn có thể chỉnh sửa lại trước khi lưu." })
  }

  useEffect(() => {
    if (!open) return
    if (gzver) {
      setSelectedAuthorId(gzver.linked_author_id || "")
      setFormData({
        ...defaultForm,
        ...gzver,
        department_id: gzver.department_id || gzver.gzver_departments?.id || "",
        department_name: gzver.department_name || gzver.gzver_departments?.name || "",
        cv_settings: { ...defaultForm.cv_settings, ...(gzver.cv_settings || {}) },
        skills: gzver.skills || [],
        achievements_list: gzver.achievements_list || [],
        background: gzver.background || defaultForm.background,
        social_links: sortByOrder(gzver.social_links),
        profile_tabs: sortByOrder(gzver.profile_tabs).length ? sortByOrder(gzver.profile_tabs) : defaultSections,
        profile_badges: sortByOrder(gzver.profile_badges).length ? sortByOrder(gzver.profile_badges) : defaultForm.profile_badges,
        online_cards: sortByOrder(gzver.online_cards),
        member_card: (() => {
          const saved = gzver.member_card && typeof gzver.member_card === "object" ? gzver.member_card : {}
          return { ...defaultMemberCard, ...saved, links: sortByOrder<CardLink>(saved.links) }
        })(),
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
      setSelectedAuthorId("")
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

  const handleOnlineCardUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, field: "front_image_url" | "back_image_url") => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const extension = file.name.split(".").pop()
      const path = `gzvers/cards/${Date.now()}-${field}.${extension}`
      const { error } = await supabase.storage.from("media").upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path)
      updateArrayItem("online_cards", index, { [field]: publicUrl })
      toast({ title: "Đã tải ảnh thẻ lên" })
    } catch (error: any) {
      toast({ title: "Lỗi tải ảnh thẻ", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  const updateMemberCard = (patch: Partial<MemberCard>) => {
    setFormData((prev: any) => ({ ...prev, member_card: { ...defaultMemberCard, ...prev.member_card, ...patch } }))
  }

  const cardLinks: CardLink[] = formData.member_card?.links || []
  const setCardLinks = (links: CardLink[]) => updateMemberCard({ links: links.map((link, index) => ({ ...link, sort_order: (index + 1) * 10 })) })

  const handleMemberCardUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "front_image_url" | "back_image_url") => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const extension = file.name.split(".").pop()
      const path = `gzvers/member-cards/${Date.now()}-${field}.${extension}`
      const { error } = await supabase.storage.from("media").upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path)
      updateMemberCard({ [field]: publicUrl })
      toast({ title: "Đã chèn ảnh vào khung thẻ" })
    } catch (error: any) {
      toast({ title: "Lỗi tải ảnh thẻ", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
      e.target.value = ""
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
        linked_author_id: payload.linked_author_id || null,
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
        online_cards: sortByOrder<OnlineCard>(payload.online_cards).filter((item: OnlineCard) => item.title || item.front_image_url),
        member_card: {
          ...Object.fromEntries(
            Object.entries({ ...defaultMemberCard, ...payload.member_card }).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
          ),
          links: sortByOrder<CardLink>(payload.member_card?.links)
            .filter((link) => link.url?.trim())
            .map((link, index) => ({ ...link, label: link.label.trim(), url: link.url.trim(), sort_order: (index + 1) * 10 })),
        },
      }
      const saveResult = gzver?.id
        ? await supabase.from("gzvers").update(cleanPayload).eq("id", gzver.id).select("id").single()
        : await supabase.from("gzvers").insert([cleanPayload]).select("id").single()
      if (saveResult.error) throw saveResult.error
      const gzverId = saveResult.data.id
      const highlights = Object.entries(projectHighlights)
      if (highlights.length) {
        const { error: highlightError } = await supabase.from("gzver_project_highlights").upsert(highlights.map(([projectId, item], index) => ({
          gzver_id: gzverId,
          project_id: projectId,
          contribution: item.contribution || "",
          image_urls: Array.isArray(item.image_urls) ? item.image_urls : [],
          is_visible: item.is_visible !== false,
          sort_order: (index + 1) * 10,
          updated_at: new Date().toISOString(),
        })), { onConflict: "gzver_id,project_id" })
        if (highlightError) throw highlightError
      }
      invalidateGzverHighlights()
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
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[1440px] h-[calc(100dvh-1.5rem)] flex flex-col overflow-hidden rounded-none border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-white">
        <DialogDescription className="sr-only">Quản lý hồ sơ GZVer</DialogDescription>

        {/* Header Modal */}
        <DialogHeader className="shrink-0 bg-white p-4 text-slate-900 border-b border-slate-200 dark:border-white/10 dark:bg-slate-900 dark:text-white rounded-none sm:p-5">
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

            <div className="flex w-full items-center justify-between gap-3 border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-800 px-4 py-2.5 rounded-none md:w-auto">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Hiển thị Public</Label>
              <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData({ ...formData, is_active: val })} />
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <Tabs defaultValue="basic" className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
          <TabsList className="shrink-0 h-auto min-h-12 w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-slate-900 flex-nowrap">
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
              value="cards"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Thẻ online
            </TabsTrigger>
            <TabsTrigger
              value="docs"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Hồ sơ CV (PDF)
            </TabsTrigger>
            <TabsTrigger value="projects" className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white">Dự án tham gia</TabsTrigger>
            <TabsTrigger
              value="preview"
              className="rounded-none text-xs font-black uppercase tracking-wider py-2 px-3 data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white"
            >
              Xem trước (Preview)
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto overscroll-contain bg-white p-3 dark:bg-slate-950 sm:p-6 min-h-0">
            {/* TAB 1: BASIC */}
            <TabsContent value="basic" className="mt-0 space-y-5">
              <div className="flex flex-col gap-3 border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row sm:items-center">
                <Label className="flex shrink-0 items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Link2 className="h-3.5 w-3.5 text-[#ed1c24]" />
                  Kéo dữ liệu từ Tác giả
                </Label>
                <Select value={selectedAuthorId} onValueChange={setSelectedAuthorId}>
                  <SelectTrigger className="h-10 flex-1 rounded-none border-slate-200 bg-white text-xs dark:border-white/10 dark:bg-slate-950">
                    <SelectValue placeholder="Chọn một Tác giả để lấy tên, ảnh, chức danh, tiểu sử..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white">
                    {authors.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!selectedAuthorId}
                  onClick={handlePullFromAuthor}
                  className="h-10 shrink-0 rounded-none border-[#ed1c24] text-xs font-black uppercase text-[#ed1c24] hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Áp dụng
                </Button>
              </div>

              <div className="flex flex-col gap-3 border border-[#ed1c24]/20 bg-red-50/60 p-4 dark:border-[#ed1c24]/30 dark:bg-red-950/10 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Giao diện hồ sơ public</p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">One-view hiển thị toàn bộ nội dung ngay từ đầu; Tab giữ giao diện gọn.</p>
                </div>
                <div className="flex shrink-0 border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-slate-950">
                  <button type="button" onClick={() => setFormData({ ...formData, profile_view_mode: "one_view" })} className={`px-3 py-2 text-[10px] font-black uppercase ${formData.profile_view_mode !== "tabs" ? "bg-[#ed1c24] text-white" : "text-slate-600 dark:text-slate-300"}`}>One-view</button>
                  <button type="button" onClick={() => setFormData({ ...formData, profile_view_mode: "tabs" })} className={`px-3 py-2 text-[10px] font-black uppercase ${formData.profile_view_mode === "tabs" ? "bg-[#ed1c24] text-white" : "text-slate-600 dark:text-slate-300"}`}>Tabs gọn</button>
                </div>
              </div>
              {formData.linked_author_id && (
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Link2 className="h-3 w-3" /> Đang liên kết với hồ sơ Tác giả. Xóa GZVer này hoặc xóa Tác giả đó sẽ không ảnh hưởng tới hồ sơ còn lại.
                </p>
              )}
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
                <Field label="Thứ tự hiển thị (Order)">
                  <Input
                    type="number"
                    className="h-11 rounded-none border-slate-200 bg-white font-mono text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    value={formData.order ?? 0}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                    placeholder="0, 10, 20..."
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

            {/* DIGITAL CREDENTIAL CARDS */}
            <TabsContent value="cards" className="mt-0 space-y-4">
              {/* GZVER MEMBER CARD (CARD VISIT 2 MẶT) */}
              <div className="space-y-4 border-2 border-[#124c96]/30 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-800 dark:text-white">
                    <CreditCard className="h-4 w-4 text-[#ed1c24]" />
                    Card visit GZVer (2 mặt)
                  </div>
                  <div className="flex items-center gap-4">
                    {formData.slug && (
                      <a
                        href={`${FRONTEND_URL}/gzver/${formData.slug}#card-visit`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#124c96] hover:text-[#ed1c24]"
                      >
                        <Link2 className="h-3.5 w-3.5" /> Xem thẻ trên web
                      </a>
                    )}
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                      Hiển thị
                      <Switch checked={formData.member_card?.enabled !== false} onCheckedChange={(checked) => updateMemberCard({ enabled: checked })} />
                    </label>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Trạng thái thẻ</Label>
                    <Select value={formData.member_card?.status || "demo"} onValueChange={(value: "official" | "demo") => updateMemberCard({ status: value })}>
                      <SelectTrigger className="h-10 rounded-none text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Demo / Tạm thời</SelectItem>
                        <SelectItem value="official">Chính thức</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Mã số thẻ</Label>
                    <Input value={formData.member_card?.card_number || ""} onChange={(e) => updateMemberCard({ card_number: e.target.value })} placeholder="VD: GZV-0001 (trống = tự sinh)" className="h-10 rounded-none font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Mẫu thiết kế</Label>
                    <Select value={formData.member_card?.design || "obsidian"} onValueChange={(value: MemberCard["design"]) => updateMemberCard({ design: value })}>
                      <SelectTrigger className="h-10 rounded-none text-xs font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="obsidian">Obsidian - Đỏ đen</SelectItem>
                        <SelectItem value="crimson">Crimson - Đỏ nổi bật</SelectItem>
                        <SelectItem value="graphite">Graphite - Than chì</SelectItem>
                        <SelectItem value="executive">Executive - Đen cao cấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Ngày cấp</Label>
                    <Input type="date" value={formData.member_card?.issued_at || ""} onChange={(e) => updateMemberCard({ issued_at: e.target.value })} className="h-10 rounded-none text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Hiệu lực đến</Label>
                    <Input type="date" value={formData.member_card?.expires_at || ""} onChange={(e) => updateMemberCard({ expires_at: e.target.value })} className="h-10 rounded-none text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Xem trước mẫu thiết kế thẻ">
                  {([
                    ["obsidian", "Obsidian", "from-[#111722] via-[#07080b] to-black"],
                    ["crimson", "Crimson", "from-[#5d080d] via-[#ed1c24] to-[#210205]"],
                    ["graphite", "Graphite", "from-[#303947] via-[#101217] to-[#050505]"],
                    ["executive", "Executive", "from-black via-[#151920] to-[#4a070b]"],
                  ] as const).map(([design, label, gradient]) => (
                    <button
                      key={design}
                      type="button"
                      onClick={() => updateMemberCard({ design })}
                      className={`min-w-0 border p-2 text-left transition ${formData.member_card?.design === design || (!formData.member_card?.design && design === "obsidian") ? "border-[#ed1c24] ring-1 ring-[#ed1c24]" : "border-slate-200 dark:border-white/10"}`}
                    >
                      <span className={`block h-12 bg-gradient-to-br ${gradient}`}><span className="block h-1 w-2/3 bg-[#ed1c24]" /></span>
                      <span className="mt-2 block truncate text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Tên thẻ (mặt trước)</Label>
                    <Input value={formData.member_card?.card_title || ""} onChange={(e) => updateMemberCard({ card_title: e.target.value })} placeholder="THẺ THÀNH VIÊN" className="h-10 rounded-none text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Dòng phụ (mặt trước)</Label>
                    <Input value={formData.member_card?.card_subtitle || ""} onChange={(e) => updateMemberCard({ card_subtitle: e.target.value })} placeholder="GZVER" className="h-10 rounded-none text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Slogan (mặt sau)</Label>
                    <Input value={formData.member_card?.tagline || ""} onChange={(e) => updateMemberCard({ tagline: e.target.value })} placeholder="THE VOICE OF GENZ" className="h-10 rounded-none text-xs" />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Link mã QR (mặt sau)</Label>
                    <Input
                      value={formData.member_card?.qr_url || ""}
                      onChange={(e) => updateMemberCard({ qr_url: e.target.value })}
                      placeholder={`Trống = ${FRONTEND_URL}/gzver/${formData.slug || "slug"}`}
                      className="h-10 rounded-none font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Chú thích dưới QR</Label>
                    <Input value={formData.member_card?.qr_caption || ""} onChange={(e) => updateMemberCard({ qr_caption: e.target.value })} placeholder="Trống = theo mẫu chung" className="h-10 rounded-none text-xs" />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Email in trên thẻ</Label>
                    <Input value={formData.member_card?.email || ""} onChange={(e) => updateMemberCard({ email: e.target.value })} placeholder="Trống = theo mẫu chung" className="h-10 rounded-none font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Hotline in trên thẻ</Label>
                    <Input value={formData.member_card?.hotline || ""} onChange={(e) => updateMemberCard({ hotline: e.target.value })} placeholder="Trống = theo mẫu chung" className="h-10 rounded-none font-mono text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Website in trên thẻ</Label>
                    <Input value={formData.member_card?.website_label || ""} onChange={(e) => updateMemberCard({ website_label: e.target.value })} placeholder="Trống = theo mẫu chung" className="h-10 rounded-none text-xs" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Lời xác nhận khi thẻ chính thức</Label>
                  <Input value={formData.member_card?.notice || ""} onChange={(e) => updateMemberCard({ notice: e.target.value })} placeholder="Trống = theo mẫu chung" className="h-10 rounded-none text-xs" />
                </div>

                <p className="text-[11px] font-medium leading-5 text-slate-500">
                  <b>Ảnh thẻ riêng</b> (thường dùng cho thẻ chính thức): ảnh hoàn chỉnh, hiển thị nguyên vẹn, thay được bất cứ lúc nào. Khung CR80 đứng 54 × 85.6 mm, khuyến nghị <b>1080 × 1712 px</b>. Khung nào để trống thì dùng <b>mẫu chung</b> ở tab &quot;Mẫu card visit&quot; ngoài danh sách GZVer.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {(["front_image_url", "back_image_url"] as const).map((field) => {
                    const value = formData.member_card?.[field] || ""
                    return (
                      <div key={field} className="space-y-2 border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950">
                        <Label className="text-[10px] font-black uppercase text-slate-500">{field === "front_image_url" ? "Ảnh thẻ riêng – mặt trước" : "Ảnh thẻ riêng – mặt sau"}</Label>
                        <div className="mx-auto w-40 overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-white dark:border-white/20 dark:bg-slate-900" style={{ aspectRatio: "54 / 85.6" }}>
                          {value ? (
                            <img src={value} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-1 p-3 text-center text-[10px] font-bold uppercase text-slate-400">
                              <CreditCard className="h-6 w-6" />
                              Dùng mẫu chung
                            </div>
                          )}
                        </div>
                        <Input value={value} onChange={(e) => updateMemberCard({ [field]: e.target.value })} placeholder="URL ảnh thẻ" className="h-9 rounded-none font-mono text-xs" />
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" className="relative h-9 flex-1 rounded-none text-[10px] font-black uppercase">
                            <Upload className="mr-1.5 h-3.5 w-3.5" /> Tải lên
                            <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" disabled={loading} onChange={(e) => handleMemberCardUpload(e, field)} />
                          </Button>
                          <MediaLibraryButton folder="gzvers" label="Thư viện" className="h-9 flex-1" onSelect={(url) => updateMemberCard({ [field]: url })} />
                          {value && (
                            <Button type="button" variant="outline" onClick={() => updateMemberCard({ [field]: "" })} className="h-9 rounded-none text-[10px] font-black uppercase text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500">Nút liên kết dưới thẻ (riêng người này)</Label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
                        Ẩn link chung
                        <Switch checked={!!formData.member_card?.hide_default_links} onCheckedChange={(checked) => updateMemberCard({ hide_default_links: checked })} />
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCardLinks([...cardLinks, { label: "", url: "", icon: "website", visible: true, sort_order: 0 }])}
                        className="h-8 rounded-none text-[10px] font-black uppercase"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Thêm link
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">Website cá nhân (tab Thông tin) tự hiện đầu danh sách. Link chung của GZV hiện sau link riêng.</p>
                  {cardLinks.map((link, index) => (
                    <div key={index} className="grid gap-2 md:grid-cols-[140px_1fr_2fr_auto]">
                      <Select value={link.icon || "link"} onValueChange={(value) => setCardLinks(cardLinks.map((item, i) => (i === index ? { ...item, icon: value } : item)))}>
                        <SelectTrigger className="h-9 rounded-none text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CARD_LINK_ICONS.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              {icon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input value={link.label} onChange={(e) => setCardLinks(cardLinks.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)))} placeholder="Tên nút" className="h-9 rounded-none text-xs" />
                      <Input value={link.url} onChange={(e) => setCardLinks(cardLinks.map((item, i) => (i === index ? { ...item, url: e.target.value } : item)))} placeholder="https://... / mailto:... / tel:..." className="h-9 rounded-none font-mono text-xs" />
                      <div className="flex gap-1">
                        <Button type="button" variant="outline" size="icon" disabled={index === 0} onClick={() => setCardLinks(cardLinks.map((item, i) => (i === index - 1 ? cardLinks[index] : i === index ? cardLinks[index - 1] : item)))} className="h-9 w-9 rounded-none">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" disabled={index === cardLinks.length - 1} onClick={() => setCardLinks(cardLinks.map((item, i) => (i === index + 1 ? cardLinks[index] : i === index ? cardLinks[index + 1] : item)))} className="h-9 w-9 rounded-none">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" onClick={() => setCardLinks(cardLinks.filter((_, i) => i !== index))} className="h-9 w-9 rounded-none text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <ArrayHeader
                title="Thẻ & chứng nhận khác"
                onAdd={() =>
                  setFormData({
                    ...formData,
                    online_cards: [
                      ...(formData.online_cards || []),
                      {
                        title: "Thẻ mới",
                        issuer: "",
                        front_image_url: "",
                        back_image_url: "",
                        verification_url: "",
                        issued_at: "",
                        visible: true,
                        sort_order: ((formData.online_cards || []).length + 1) * 10,
                      },
                    ],
                  })
                }
              />

              {(formData.online_cards || []).map((item: OnlineCard, index: number) => (
                <div key={index} className="space-y-4 border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-800 dark:text-white">
                      <CreditCard className="h-4 w-4 text-[#ed1c24]" />
                      Thẻ {String(index + 1).padStart(2, "0")}
                    </div>
                    <RowActions
                      field="online_cards"
                      index={index}
                      visible={item.visible}
                      updateArrayItem={updateArrayItem}
                      removeArrayItem={removeArrayItem}
                      moveArrayItem={moveArrayItem}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <Input value={item.title || ""} onChange={(e) => updateArrayItem("online_cards", index, { title: e.target.value })} placeholder="Tên thẻ / chứng nhận" className="h-10 rounded-none bg-white text-xs dark:bg-slate-950" />
                    <Input value={item.issuer || ""} onChange={(e) => updateArrayItem("online_cards", index, { issuer: e.target.value })} placeholder="Đơn vị cấp" className="h-10 rounded-none bg-white text-xs dark:bg-slate-950" />
                    <Input type="date" value={item.issued_at || ""} onChange={(e) => updateArrayItem("online_cards", index, { issued_at: e.target.value })} className="h-10 rounded-none bg-white text-xs dark:bg-slate-950" />
                  </div>

                  <Input value={item.verification_url || ""} onChange={(e) => updateArrayItem("online_cards", index, { verification_url: e.target.value })} placeholder="Link xác thực hoặc trang chi tiết thẻ (https://...)" className="h-10 rounded-none bg-white font-mono text-xs dark:bg-slate-950" />

                  <div className="grid gap-4 md:grid-cols-2">
                    {(["front_image_url", "back_image_url"] as const).map((field) => (
                      <div key={field} className="space-y-2 border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950">
                        <Label className="text-[10px] font-black uppercase text-slate-500">{field === "front_image_url" ? "Mặt trước" : "Mặt sau (tùy chọn)"}</Label>
                        {item[field] && <img src={item[field]} alt="" className="mx-auto max-h-52 w-full object-contain" />}
                        <Input value={item[field] || ""} onChange={(e) => updateArrayItem("online_cards", index, { [field]: e.target.value })} placeholder="URL ảnh" className="h-9 rounded-none font-mono text-xs" />
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" className="relative h-9 flex-1 rounded-none text-[10px] font-black uppercase">
                            <Upload className="mr-1.5 h-3.5 w-3.5" /> Tải ảnh
                            <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" disabled={loading} onChange={(e) => handleOnlineCardUpload(e, index, field)} />
                          </Button>
                          <MediaLibraryButton folder="gzvers" label="Thư viện" className="h-9 flex-1" onSelect={(url) => updateArrayItem("online_cards", index, { [field]: url })} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* TAB 7: CV DOCS */}
            <TabsContent value="docs" className="mt-0">
              <div className="mb-4 grid gap-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:grid-cols-2">
                <div className="sm:col-span-2"><p className="text-xs font-black uppercase text-slate-900 dark:text-white">CV tự động từ hồ sơ GZVer</p><p className="mt-1 text-[11px] text-slate-500">Xem ngay dữ liệu đang biên tập và tải PDF một trang liền mạch, kèm logo GZV. Lưu hồ sơ để cập nhật trang CV công khai.</p></div>
                <div className="sm:col-span-2">
                  <Label className="mb-3 block text-[10px] font-black uppercase">Bộ sưu tập thiết kế CV</Label>
                  <CvTemplatePicker
                    value={formData.cv_settings?.template || "executive"}
                    selectedAccent={formData.cv_settings?.accent || "#ed1c24"}
                    showProjects={formData.cv_settings?.show_projects !== false}
                    projectLayout={formData.cv_settings?.project_layout || "grid-1"}
                    onChange={(template, accent) => setFormData((prev: any) => ({ ...prev, cv_settings: { ...prev.cv_settings, template, accent } }))}
                    onToggleProjects={(show) => setFormData((prev: any) => ({ ...prev, cv_settings: { ...prev.cv_settings, show_projects: show } }))}
                    onChangeProjectLayout={(layout) => setFormData((prev: any) => ({ ...prev, cv_settings: { ...prev.cv_settings, project_layout: layout } }))}
                  />
                </div>
                <div><Label className="text-[10px] font-black uppercase">Màu nhấn</Label><div className="mt-1 flex gap-2"><Input type="color" value={formData.cv_settings?.accent || "#ed1c24"} onChange={(e) => setFormData((prev: any) => ({ ...prev, cv_settings: { ...prev.cv_settings, accent: e.target.value } }))} className="h-9 w-14 rounded-none p-1" /><Input value={formData.cv_settings?.accent || "#ed1c24"} onChange={(e) => setFormData((prev: any) => ({ ...prev, cv_settings: { ...prev.cv_settings, accent: e.target.value } }))} className="rounded-none font-mono" /></div></div>
                <div className="flex items-center justify-between border p-3"><Label>Hiện thông tin liên hệ trong CV</Label><Switch checked={formData.cv_settings?.show_contact !== false} onCheckedChange={(value) => setFormData((prev: any) => ({ ...prev, cv_settings: { ...prev.cv_settings, show_contact: value } }))} /></div>
                <div className="flex items-center justify-between border p-3"><Label>Đưa dự án vào CV</Label><Switch checked={formData.cv_settings?.show_projects !== false} onCheckedChange={(value) => setFormData((prev: any) => ({ ...prev, cv_settings: { ...prev.cv_settings, show_projects: value } }))} /></div>
                {([['show_project_details', 'Nội dung chi tiết dự án'], ['show_project_gallery', 'Toàn bộ thư viện ảnh dự án'], ['show_credentials', 'Chứng nhận & ảnh xác thực']] as const).map(([key, label]) => <div key={key} className="flex items-center justify-between border p-3"><Label>{label}</Label><Switch checked={formData.cv_settings?.[key] !== false} onCheckedChange={(value) => setFormData((prev: any) => ({ ...prev, cv_settings: { ...prev.cv_settings, [key]: value } }))} /></div>)}
                {formData.slug && <a href={`${FRONTEND_URL}/gzver/${formData.slug}/cv`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center border border-[#ed1c24] px-4 text-xs font-black uppercase text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white sm:col-span-2"><FileText className="mr-2 h-4 w-4" />Mở trang CV công khai đã lưu</a>}
              </div>
              {projectLoadError && formData.cv_settings?.show_projects !== false && <p role="alert" className="mb-3 text-sm text-red-600">{projectLoadError}</p>}
              <CvPreview person={cvPerson} projects={cvProjects} />
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
                    <div className="flex justify-center">
                      <MediaLibraryButton
                        folder="gzvers"
                        accept="file"
                        label="Chọn từ thư viện / dán link (Drive, PDF...)"
                        className="h-10 px-4"
                        onSelect={(url) => setFormData((prev: any) => ({ ...prev, cv_url: url }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="mt-0 space-y-3">
              {/* GZVer là nhân sự triển khai: chỉ chọn dự án đã tham gia, hồ sơ hiển thị lưới dự án giống trang /du-an */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-l-4 border-[#ed1c24] bg-slate-50 p-4 dark:bg-slate-900">
                <div>
                  <p className="text-xs font-black uppercase">Dự án đã tham gia</p>
                  <p className="mt-1 text-[11px] text-slate-500">Tick các dự án GZVer này tham gia triển khai. Hồ sơ hiển thị ảnh, logo và tên dự án lấy từ trang Dự án.</p>
                </div>
                <span className="bg-[#ed1c24] px-3 py-1 text-[11px] font-black uppercase text-white">
                  {Object.values(projectHighlights).filter((item: any) => item?.is_visible !== false).length} đã chọn
                </span>
              </div>
              {projectLoadError && <p role="alert" className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">Không tải được dự án: {projectLoadError}</p>}
              {projectOptions.length > 6 && (
                <Input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Tìm dự án..." className="h-9 rounded-none text-xs" />
              )}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {projectOptions
                  .filter((project) => !projectSearch.trim() || `${project.title} ${project.category || ""}`.toLowerCase().includes(projectSearch.trim().toLowerCase()))
                  .map((project) => {
                    const selected = projectHighlights[project.id]?.is_visible !== false && Boolean(projectHighlights[project.id])
                    const image = project.image || project.thumbnail_url
                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => setProjectHighlights((current) => ({ ...current, [project.id]: { ...(current[project.id] || {}), project_id: project.id, is_visible: !selected } }))}
                        className={`group relative overflow-hidden border-2 text-left transition ${selected ? "border-[#ed1c24] shadow-md" : "border-slate-200 opacity-80 hover:opacity-100 dark:border-white/10"}`}
                      >
                        <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800">
                          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] font-black uppercase text-slate-400">GZV</div>}
                        </div>
                        <div className="p-2.5">
                          <p className="line-clamp-2 text-[11px] font-black uppercase leading-snug">{project.title}</p>
                          {project.category && <p className="mt-0.5 truncate text-[10px] text-slate-500">{project.category}</p>}
                        </div>
                        <span className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center border-2 ${selected ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-white bg-white/80 text-transparent"}`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    )
                  })}
              </div>
              {!projectLoadError && projectOptions.length === 0 && <p className="border border-dashed p-8 text-center text-sm text-slate-500">Chưa có dự án trong hệ thống.</p>}
            </TabsContent>

            {/* TAB 8: PREVIEW */}
            <TabsContent value="preview" className="mt-0 space-y-4">
              <div className="flex gap-2">
                <Button type="button" variant={previewContent === "profile" ? "default" : "outline"} onClick={() => setPreviewContent("profile")} className="rounded-none text-xs">Hồ sơ GZVer</Button>
                <Button type="button" variant={previewContent === "cv" ? "default" : "outline"} onClick={() => setPreviewContent("cv")} className="rounded-none text-xs"><FileText size={14} className="mr-2" />CV / PDF</Button>
              </div>
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
              {previewContent === "cv" ? <CvPreview person={cvPerson} projects={cvProjects} mobile={previewMode === "mobile"} /> : <ProfilePreview formData={formData} previewMode={previewMode} />}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="shrink-0 sticky bottom-0 z-50 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950 rounded-none sm:flex-row sm:items-center sm:p-4">
          <Button variant="ghost" onClick={onClose} className="rounded-none px-6 text-xs font-black uppercase text-slate-500 hover:bg-slate-200/60">
            Hủy Bỏ
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="h-11 rounded-none bg-[#ed1c24] px-8 text-xs font-black uppercase text-white hover:bg-[#c91218] shadow-md">
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
        <div className="flex items-center gap-2">
          <MediaLibraryButton folder={folder} className="h-8" onSelect={(url) => setFormData((prev: any) => ({ ...prev, [field]: url }))} />
          <Button variant="outline" size="sm" className="relative h-8 rounded-none border-[#ed1c24] text-[#ed1c24] text-xs font-bold hover:bg-[#ed1c24] hover:text-white">
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Tải từ máy
            <input type="file" className="absolute inset-0 cursor-pointer opacity-0" accept="image/*" onChange={(e) => handleFileUpload(e, folder, field)} />
          </Button>
        </div>
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
  const sections = useMemo(() => sortByOrder<ProfileSection>(formData.profile_tabs || []).filter((item: ProfileSection) => item.visible !== false), [formData.profile_tabs])
  const badges = useMemo(() => sortByOrder(formData.profile_badges || []).filter((item: any) => item.visible !== false), [formData.profile_badges])
  const socials = useMemo(() => sortByOrder(formData.social_links || []).filter((item: any) => item.visible !== false), [formData.social_links])
  const isMobile = previewMode === "mobile"
  const [activeSectionKey, setActiveSectionKey] = useState("")
  const avatarStyle = { objectPosition: `${formData.avatar_position_x || 50}% ${formData.avatar_position_y || 50}%`, transform: `scale(${(formData.avatar_scale || 100) / 100})` }
  const coverStyle = { objectPosition: `${formData.cover_position_x || 50}% ${formData.cover_position_y || 50}%`, transform: `scale(${(formData.cover_scale || 100) / 100})` }
  const currentSection = sections.find((section: any, index: number) => (section.key || `section-${index}`) === activeSectionKey) || sections[0]

  useEffect(() => {
    if (!sections.some((section: any, index: number) => (section.key || `section-${index}`) === activeSectionKey)) setActiveSectionKey(sections[0]?.key || "")
  }, [sections, activeSectionKey])

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
            <div className="flex gap-1 overflow-x-auto border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
              {sections.map((section: any, index: number) => {
                const key = section.key || `section-${index}`
                return <button key={key} type="button" onClick={() => setActiveSectionKey(key)} className={`shrink-0 px-3 py-2 text-[9px] font-black uppercase ${currentSection === section ? "bg-[#ed1c24] text-white" : "text-slate-500 hover:bg-white dark:text-slate-300 dark:hover:bg-white/10"}`}>{section.label || `Mục ${index + 1}`}</button>
              })}
            </div>
            {currentSection ? (
              <div className="border border-slate-200 p-4 dark:border-white/10">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-[#ed1c24]">Section {String(Math.max(0, sections.indexOf(currentSection)) + 1).padStart(2, "0")}</p>
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">{currentSection.label || "Section"}</h4>
                <p className="mt-2 whitespace-pre-line text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">{currentSection.content || previewSourceText(formData, currentSection) || "Nội dung sẽ hiển thị tại đây."}</p>
              </div>
            ) : <div className="border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">Chưa có section hiển thị.</div>}
          </div>
        </div>
        <CardVisitPreview formData={formData} />
      </div>
    </div>
  )
}

function CardVisitPreview({ formData }: { formData: any }) {
  const card = formData.member_card || {}
  const qrValue = card.qr_url || `https://www.gzv.one/gzver/${formData.slug || "slug"}`
  const surfaces: Record<string, string> = { obsidian: "linear-gradient(145deg,#171a22,#08090d 52%,#000)", crimson: "linear-gradient(145deg,#5d080d,#ed1c24 48%,#210205)", graphite: "linear-gradient(145deg,#303947,#101217 52%,#050505)", executive: "linear-gradient(145deg,#050505,#151920 60%,#4a070b)" }
  const surface = surfaces[card.design] || surfaces.obsidian
  const executive = Boolean(formData.is_director) || /điều hành|ceo|director/i.test(`${formData.department_name || ""} ${formData.role_level || ""}`)
  const title = card.card_title || (executive ? "THẺ CHỨC DANH" : "THẺ THÀNH VIÊN")
  const subtitle = card.card_subtitle || (executive ? "BAN ĐIỀU HÀNH" : "GZVER")
  const avatarStyle = { objectPosition: `${formData.avatar_position_x || 50}% ${formData.avatar_position_y || 50}%`, transform: `scale(${(formData.avatar_scale || 100) / 100})` }
  return (
    <div className="border border-slate-200 bg-slate-950 p-4 text-white dark:border-white/10">
      <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff5a60]">Live card preview</p><h4 className="mt-1 text-sm font-black uppercase">Thẻ online + QR thực tế</h4></div><span className="border border-[#ed1c24]/60 px-2 py-1 text-[9px] font-black uppercase text-[#ff6b70]">{card.design || "obsidian"}</span></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="mx-auto flex w-full max-w-[190px] flex-col items-center overflow-hidden rounded-xl border border-[#ed1c24] p-4 text-center" style={{ aspectRatio: "54 / 85.6", background: surface }}><p className="text-[8px] font-black uppercase tracking-wide">CÔNG TY TNHH GZV</p><p className="mt-1 text-[8px] font-black text-[#ed1c24]">THE VOICE OF GENZ</p><div className="mx-auto mt-7 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ed1c24] bg-white text-[10px] font-black tracking-widest text-[#124c96]">GZV</div><p className="mt-6 text-[13px] font-black uppercase">{title}</p><p className="mt-1 text-[20px] font-black tracking-wider text-[#ed1c24]">{subtitle}</p><span className="mt-4 bg-[#ed1c24] px-3 py-1 text-[8px] font-black uppercase">{formData.department_name || "GZVers"}</span><p className="mt-auto pt-5 text-[8px] font-bold text-white/70">{card.website_label || "WWW.GZV.ONE"}</p></div>
        <div className="mx-auto flex w-full max-w-[190px] flex-col items-center overflow-hidden rounded-xl border border-[#ed1c24] p-4 text-center" style={{ aspectRatio: "54 / 85.6", background: surface }}><div className="h-24 w-20 overflow-hidden rounded-lg border-2 border-white bg-slate-800">{formData.avatar_url ? <img src={formData.avatar_url} alt="" className="h-full w-full object-cover" style={avatarStyle} /> : <div className="flex h-full items-center justify-center text-xl font-black">G</div>}</div><p className="mt-4 text-[8px] font-black uppercase text-[#ed1c24]">{formData.position || "GZVER"}</p><p className="mt-1 text-[13px] font-black uppercase">{formData.full_name || "TÊN GZVER"}</p><div className="mx-auto mt-6 w-fit rounded bg-white p-1.5"><QRCodeSVG value={qrValue} size={72} level="M" /></div><p className="mt-2 text-[7px] font-black uppercase text-white/70">QR xác thực hồ sơ</p></div>
      </div>
      <p className="mt-3 break-all text-center font-mono text-[9px] text-white/50">QR: {qrValue}</p>
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
