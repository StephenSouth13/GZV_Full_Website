"use client"

import { useEffect, useMemo, useState } from "react"
import type React from "react"
import { ProtectedRoute } from "@/components/admin/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GZVRichEditor } from "@/components/editor/GZVRichEditor"
import { MediaPickerDialog, type MediaPickResult } from "@/components/media/MediaPickerDialog"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { ArrowDown, ArrowUp, Bot, Copy, Eye, EyeOff, GripVertical, Image as ImageIcon, Layers, Loader2, MessageCircle, MonitorCog, Plus, RotateCcw, Save, Settings2, Trash2, Video } from "lucide-react"

type NavItem = { id?: string; href: string; label_vi: string; label_en?: string | null; sort_order: number; is_visible: boolean; is_page_enabled: boolean }
type PageContent = { id?: string; slug: string; title: string; menu_title?: string | null; banner_badge?: string | null; banner_title?: string | null; banner_subtitle?: string | null; banner_description?: string | null; banner_image_url?: string | null; content_html?: string | null; is_visible: boolean; seo_title?: string | null; seo_description?: string | null }
type HomeSection = { id?: string; section_key: string; title: string; subtitle?: string | null; description?: string | null; button_label?: string | null; button_url?: string | null; sort_order: number; item_limit: number; is_visible: boolean; content_html?: string | null; settings?: Record<string, any> }
type LoadingSettings = { id: number; logo_url: string; title: string; subtitle: string; effect: "orbit" | "pulse" | "bars"; background_from: string; background_to: string; accent_color: string; enabled: boolean; minimum_duration_ms: number }
type FooterSettings = {
  id: number
  logo_url: string
  intro_text: string
  background_color: string
  bottom_background_color: string
  facebook_page_url?: string | null
  address?: string | null
  phone_label?: string | null
  phone_url?: string | null
  email_label?: string | null
  email_url?: string | null
  newsletter_title?: string | null
  newsletter_description?: string | null
  copyright_text?: string | null
  links: Array<{ label: string; href: string; visible?: boolean }>
  social_links: Array<{ label: string; href: string; icon?: string; visible?: boolean }>
}
type FloatingAction = { id?: string; action_key: string; label: string; href?: string | null; icon_url?: string | null; action_type: "link" | "chatbot"; sort_order: number; is_visible: boolean }
type BrandingSettings = { id: number; site_name: string; header_logo_url: string; footer_logo_url: string; favicon_url: string; default_title: string; title_template: string; default_description?: string | null; default_keywords?: string | null; og_image_url?: string | null; topbar_email_label?: string | null; topbar_phone_label?: string | null; topbar_badge_label?: string | null }
type SectionTemplate = { id?: string; template_key: string; name: string; category: string; component_type: string; default_props: any; sort_order: number; is_active: boolean }
type PageBlock = { id?: string; page_slug: string; block_key: string; component_type: string; title?: string | null; props: any; content_html?: string | null; sort_order: number; is_visible: boolean; responsive?: any; seo?: any }

const defaultNav: NavItem[] = [
  { href: "/gioi-thieu", label_vi: "GIỚI THIỆU", label_en: "ABOUT", sort_order: 10, is_visible: true, is_page_enabled: true },
  { href: "/dich-vu", label_vi: "DỊCH VỤ", label_en: "SERVICES", sort_order: 20, is_visible: true, is_page_enabled: true },
  { href: "/du-an", label_vi: "DỰ ÁN", label_en: "PROJECTS", sort_order: 30, is_visible: true, is_page_enabled: true },
  { href: "/gzver", label_vi: "GZVers", label_en: "GZVers", sort_order: 40, is_visible: true, is_page_enabled: true },
  { href: "/tin-tuc", label_vi: "TIN TỨC", label_en: "NEWS", sort_order: 50, is_visible: true, is_page_enabled: true },
  { href: "/lien-he", label_vi: "LIÊN HỆ", label_en: "CONTACT", sort_order: 60, is_visible: true, is_page_enabled: true },
]

const quickBuilderPages = [
  { slug: "dich-vu", label: "Dịch vụ", hint: "Trang riêng /dich-vu, không còn là anchor #dich-vu" },
  { slug: "gioi-thieu", label: "Giới thiệu", hint: "Câu chuyện, sứ mệnh, tầm nhìn, đội ngũ" },
  { slug: "du-an", label: "Dự án", hint: "Banner, block dự án, case study" },
  { slug: "gzver", label: "GZVers", hint: "Cộng đồng, ban, profile" },
  { slug: "tin-tuc", label: "Tin tức", hint: "Banner và block nội dung tin" },
  { slug: "lien-he", label: "Liên hệ", hint: "Form, map, thông tin liên hệ" },
]

const defaultLoading: LoadingSettings = { id: 1, logo_url: "/logo.webp", title: "GZV", subtitle: "Đang tải dữ liệu...", effect: "orbit", background_from: "#050505", background_to: "#ed1c24", accent_color: "#ed1c24", enabled: true, minimum_duration_ms: 900 }
const defaultBranding: BrandingSettings = { id: 1, site_name: "GZV", header_logo_url: "/logo.webp", footer_logo_url: "/logo.webp", favicon_url: "/logo/favicon.ico", default_title: "GZV - The Voice of Genzers", title_template: "%s | GZV", default_description: "GZV Center", default_keywords: "GZV, đào tạo, mentoring, coaching", og_image_url: "/og-image.jpg", topbar_email_label: "gzv.one@gmail.com", topbar_phone_label: "(+84) 329 381 489", topbar_badge_label: "GZV" }
const defaultFooter: FooterSettings = {
  id: 1,
  logo_url: "/logo.webp",
  intro_text: "GZV - The Voice of Genzers",
  background_color: "#050505",
  bottom_background_color: "#111111",
  facebook_page_url: "https://www.facebook.com/gzv.one",
  address: "279 Nguyễn Tri Phương, Phường Diên Hồng, TP.Hồ Chí Minh",
  phone_label: "Điện Thoại: (+84) 329 381 489",
  phone_url: "tel:+84329381489",
  email_label: "Email: gzv.one@gmail.com",
  email_url: "mailto:gzv.one@gmail.com",
  newsletter_title: "Kết nối với chúng tôi",
  newsletter_description: "Đăng ký để nhận thông tin về các khóa học và sự kiện mới nhất.",
  copyright_text: "gzv Center. Phát triển bởi Phòng Công nghệ thông tin.",
  links: [],
  social_links: [],
}

const fallbackTemplates: SectionTemplate[] = [
  {
    template_key: "sharp-hero-stats",
    name: "Hero sắc cạnh + số liệu",
    category: "hero",
    component_type: "hero_stats",
    default_props: {
      title: "TIÊU ĐỀ TRANG",
      subtitle: "Mô tả ngắn, gọn và sắc nét cho trang.",
      stats: [{ value: "10+", label: "Dự án" }, { value: "5000+", label: "Học viên" }, { value: "50+", label: "Đối tác" }],
      backgroundFrom: "#050505",
      backgroundTo: "#ed1c24",
    },
    sort_order: 1,
    is_active: true,
  },
  {
    template_key: "feature-grid-red",
    name: "Lưới giá trị 3-4 cột",
    category: "content",
    component_type: "feature_grid",
    default_props: {
      title: "GIÁ TRỊ NỔI BẬT",
      subtitle: "Các điểm mạnh có thể thêm, xóa, sửa trực tiếp trong props.",
      columns: 3,
      items: [
        { title: "Tư duy chiến lược", description: "Mô tả ngắn cho giá trị này.", icon: "target", color: "#ed1c24" },
        { title: "Triển khai thực chiến", description: "Mô tả ngắn cho giá trị này.", icon: "book", color: "#050505" },
        { title: "Đo lường kết quả", description: "Mô tả ngắn cho giá trị này.", icon: "award", color: "#ed1c24" },
      ],
    },
    sort_order: 2,
    is_active: true,
  },
  {
    template_key: "gallery-editor",
    name: "Bộ ảnh + mô tả",
    category: "media",
    component_type: "image_gallery",
    default_props: {
      title: "THƯ VIỆN HÌNH ẢNH",
      subtitle: "Quản lý từng ảnh, tiêu đề, mô tả và phân loại.",
      images: [
        { src: "/placeholder.jpg", title: "Ảnh 1", category: "GZV", description: "Mô tả ảnh", alt: "GZV" },
        { src: "/placeholder.jpg", title: "Ảnh 2", category: "GZV", description: "Mô tả ảnh", alt: "GZV" },
      ],
    },
    sort_order: 3,
    is_active: true,
  },
  {
    template_key: "rich-content",
    name: "Khối nội dung rich text",
    category: "content",
    component_type: "html_rich",
    default_props: { maxWidth: "980px" },
    sort_order: 4,
    is_active: true,
  },
  {
    template_key: "contact-layout",
    name: "Form liên hệ",
    category: "contact",
    component_type: "contact_form",
    default_props: { title: "KẾT NỐI VỚI GZV", subtitle: "Để lại thông tin để đội ngũ GZV phản hồi." },
    sort_order: 5,
    is_active: true,
  },
  {
    template_key: "cta-red-black",
    name: "CTA đen đỏ",
    category: "cta",
    component_type: "cta_band",
    default_props: {
      title: "SẴN SÀNG ĐỒNG HÀNH?",
      description: "Kết nối với GZV để trao đổi về dự án hoặc dịch vụ.",
      buttonLabel: "Liên hệ ngay",
      buttonUrl: "/lien-he",
      backgroundFrom: "#050505",
      backgroundTo: "#ed1c24",
    },
    sort_order: 6,
    is_active: true,
  },
]

function SiteContentManager() {
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNav)
  const [pages, setPages] = useState<PageContent[]>([])
  const [homeSections, setHomeSections] = useState<HomeSection[]>([])
  const [footer, setFooter] = useState<FooterSettings>(defaultFooter)
  const [floating, setFloating] = useState<FloatingAction[]>([])
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding)
  const [templates, setTemplates] = useState<SectionTemplate[]>([])
  const [pageBlocks, setPageBlocks] = useState<PageBlock[]>([])
  const [selectedSlug, setSelectedSlug] = useState("gioi-thieu")
  const [builderSlug, setBuilderSlug] = useState("gioi-thieu")
  const [slugRenames, setSlugRenames] = useState<Record<string, string>>({})
  const [selectedSectionKey, setSelectedSectionKey] = useState("hero")
  const [loadingSettings, setLoadingSettings] = useState<LoadingSettings>(defaultLoading)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState<"banner" | "builderBanner" | "loadingLogo" | "footerLogo" | "headerLogo" | "brandFooterLogo" | "favicon" | "ogImage" | "heroVideo" | "heroPoster" | { floatingIndex: number } | { blockImageIndex: number; imageIndex: number } | null>(null)

  const selectedPage = useMemo(() => pages.find((page) => page.slug === selectedSlug) || null, [pages, selectedSlug])
  const builderPage = useMemo(() => pages.find((page) => page.slug === builderSlug) || null, [pages, builderSlug])
  const builderBlocks = useMemo(
    () => pageBlocks
      .map((block, index) => ({ block, index }))
      .filter((item) => item.block.page_slug === builderSlug)
      .sort((a, b) => (a.block.sort_order || 0) - (b.block.sort_order || 0)),
    [pageBlocks, builderSlug],
  )
  const selectedSection = useMemo(() => homeSections.find((section) => section.section_key === selectedSectionKey) || null, [homeSections, selectedSectionKey])
  const builderSlugs = useMemo(() => {
    const navSlugs = defaultNav
      .map((item) => item.href.split("#")[0].replace("/", ""))
      .filter((slug) => slug && slug !== "")
    return [...new Set([...navSlugs, ...pages.map((page) => page.slug), ...pageBlocks.map((block) => block.page_slug)])]
  }, [pages, pageBlocks])
  const orderedHomeSections = useMemo(
    () => homeSections
      .map((section, index) => ({ section, index }))
      .sort((a, b) => (a.section.sort_order || 0) - (b.section.sort_order || 0)),
    [homeSections],
  )

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [navResult, pagesResult, loadingResult, sectionsResult, footerResult, floatingResult, brandingResult, templatesResult, blocksResult] = await Promise.all([
          supabase.from("site_navigation").select("*").order("sort_order", { ascending: true }),
          supabase.from("site_pages").select("*").order("title", { ascending: true }),
          supabase.from("site_loading_settings").select("*").eq("id", 1).maybeSingle(),
          supabase.from("site_home_sections").select("*").order("sort_order", { ascending: true }),
          supabase.from("site_footer_settings").select("*").eq("id", 1).maybeSingle(),
          supabase.from("site_floating_actions").select("*").order("sort_order", { ascending: true }),
          supabase.from("site_branding_settings").select("*").eq("id", 1).maybeSingle(),
          supabase.from("site_section_templates").select("*").order("sort_order", { ascending: true }),
          supabase.from("site_page_blocks").select("*").order("page_slug", { ascending: true }).order("sort_order", { ascending: true }),
        ])
        for (const result of [navResult, pagesResult, loadingResult, sectionsResult, footerResult, floatingResult, brandingResult, templatesResult, blocksResult]) {
          if (result.error) throw result.error
        }

        const nextNav = navResult.data?.length ? navResult.data as NavItem[] : defaultNav
        const nextPages = pagesResult.data?.length
          ? pagesResult.data as PageContent[]
          : defaultNav.map((item) => ({ slug: item.href.replace("/", ""), title: item.label_vi, menu_title: item.label_vi, banner_title: item.label_vi, is_visible: true }))

        setNavItems(nextNav)
        setPages(nextPages)
        setSelectedSlug(nextPages[0]?.slug || "gioi-thieu")
        setLoadingSettings({ ...defaultLoading, ...(loadingResult.data || {}) })
        setHomeSections((sectionsResult.data || []) as HomeSection[])
        setSelectedSectionKey((sectionsResult.data || []).some((section: any) => section.section_key === "hero") ? "hero" : sectionsResult.data?.[0]?.section_key || "projects")
        setFooter({ ...defaultFooter, ...(footerResult.data || {}) })
        setFloating((floatingResult.data || []) as FloatingAction[])
        setBranding({ ...defaultBranding, ...(brandingResult.data || {}) })
        setTemplates((templatesResult.data || []) as SectionTemplate[])
        setPageBlocks((blocksResult.data || []) as PageBlock[])
      } catch (error: any) {
        toast.error(error.message || "Không tải được cấu hình website. Hãy chạy file SQL mới trước.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (loading || pages.some((page) => page.slug === builderSlug)) return
    setPages((items) => [...items, {
      slug: builderSlug,
      title: builderSlug,
      menu_title: builderSlug,
      banner_title: builderSlug,
      is_visible: true,
    }])
  }, [builderSlug, loading, pages])

  const saveRows = async (table: string, rows: any[], conflict: string, success: string) => {
    try {
      setSaving(true)
      const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict })
      if (error) throw error
      toast.success(success)
    } catch (error: any) {
      toast.error(error.message || "Không lưu được")
    } finally {
      setSaving(false)
    }
  }

  const updateNav = (index: number, patch: Partial<NavItem>) => setNavItems((items) => items.map((item, idx) => idx === index ? { ...item, ...patch } : item))
  const updatePage = (patch: Partial<PageContent>) => setPages((items) => items.map((item) => item.slug === selectedSlug ? { ...item, ...patch } : item))
  const updateSection = (patch: Partial<HomeSection>) => setHomeSections((items) => items.map((item) => item.section_key === selectedSectionKey ? { ...item, ...patch } : item))
  const updateSectionSettings = (patch: Record<string, any>) => {
    setHomeSections((items) => items.map((item) => item.section_key === selectedSectionKey ? { ...item, settings: { ...(item.settings || {}), ...patch } } : item))
  }
  const updateFloating = (index: number, patch: Partial<FloatingAction>) => setFloating((items) => items.map((item, idx) => idx === index ? { ...item, ...patch } : item))
  const updateBlock = (index: number, patch: Partial<PageBlock>) => setPageBlocks((items) => items.map((item, idx) => idx === index ? { ...item, ...patch } : item))
  const updateBuilderPage = (patch: Partial<PageContent>) => setPages((items) => items.map((item) => item.slug === builderSlug ? { ...item, ...patch } : item))

  const renameBuilderSlug = (value: string) => {
    const nextSlug = normalizeSlug(value)
    if (!nextSlug || nextSlug === builderSlug) return
    const previousSlug = builderSlug
    setSlugRenames((items) => ({ ...items, [previousSlug]: nextSlug }))
    setPages((items) => items.map((item) => item.slug === previousSlug ? { ...item, slug: nextSlug } : item))
    setPageBlocks((items) => items.map((item) => item.page_slug === previousSlug ? { ...item, page_slug: nextSlug } : item))
    setNavItems((items) => items.map((item) => item.href === `/${previousSlug}` ? { ...item, href: `/${nextSlug}` } : item))
    setSelectedSlug((slug) => slug === previousSlug ? nextSlug : slug)
    setBuilderSlug(nextSlug)
  }

  const moveBlock = (blockIndex: number, direction: -1 | 1) => {
    const currentPosition = builderBlocks.findIndex((item) => item.index === blockIndex)
    const swapWith = builderBlocks[currentPosition + direction]
    const current = builderBlocks[currentPosition]
    if (!current || !swapWith) return
    setPageBlocks((items) => items.map((item, index) => {
      if (index === current.index) return { ...item, sort_order: swapWith.block.sort_order }
      if (index === swapWith.index) return { ...item, sort_order: current.block.sort_order }
      return item
    }))
  }

  const moveHomeSection = (sectionKey: string, direction: -1 | 1) => {
    const currentPosition = orderedHomeSections.findIndex((item) => item.section.section_key === sectionKey)
    const current = orderedHomeSections[currentPosition]
    const swapWith = orderedHomeSections[currentPosition + direction]
    if (!current || !swapWith) return
    setHomeSections((items) => items.map((item, index) => {
      if (index === current.index) return { ...item, sort_order: swapWith.section.sort_order }
      if (index === swapWith.index) return { ...item, sort_order: current.section.sort_order }
      return item
    }))
  }

  const moveFloatingAction = (actionIndex: number, direction: -1 | 1) => {
    const ordered = floating
      .map((item, index) => ({ item, index }))
      .sort((a, b) => (a.item.sort_order || 0) - (b.item.sort_order || 0))
    const currentPosition = ordered.findIndex((entry) => entry.index === actionIndex)
    const current = ordered[currentPosition]
    const swapWith = ordered[currentPosition + direction]
    if (!current || !swapWith) return
    setFloating((items) => items.map((item, index) => {
      if (index === current.index) return { ...item, sort_order: swapWith.item.sort_order }
      if (index === swapWith.index) return { ...item, sort_order: current.item.sort_order }
      return item
    }))
  }

  const normalizeHomeSectionOrder = () => {
    setHomeSections((items) => {
      const rank = new Map(orderedHomeSections.map((item, position) => [item.section.section_key, (position + 1) * 10]))
      return items.map((item) => ({ ...item, sort_order: rank.get(item.section_key) || item.sort_order }))
    })
    toast.success("Đã sắp lại thứ tự section. Bấm Lưu section trang chủ để ghi lên Supabase.")
  }

  const duplicateBlock = (block: PageBlock) => {
    setPageBlocks((rows) => {
      const samePage = rows.filter((row) => row.page_slug === builderSlug)
      return [...rows, {
        ...block,
        id: undefined,
        block_key: `${block.block_key}-copy-${Date.now()}`,
        title: `${block.title || block.block_key} copy`,
        sort_order: samePage.length * 10 + 10,
      }]
    })
  }

  const seedDefaultNavigation = () => {
    setNavItems(defaultNav)
    toast.success("Đã nạp menu GZV mới. Bấm Lưu menu header để ghi lên Supabase.")
  }

  const addNavItem = () => {
    setNavItems((items) => [
      ...items,
      {
        href: "/trang-moi",
        label_vi: "TRANG MỚI",
        label_en: "NEW PAGE",
        sort_order: (items.length + 1) * 10,
        is_visible: true,
        is_page_enabled: true,
      },
    ])
  }

  const deleteNavItem = async (index: number) => {
    const item = navItems[index]
    setNavItems((items) => items.filter((_, idx) => idx !== index))
    if (!item?.href) return
    const { error } = await supabase.from("site_navigation").delete().eq("href", item.href)
    if (error) toast.error(error.message)
    else toast.success("Đã xóa menu header")
  }

  const addPage = () => {
    const slug = `trang-moi-${Date.now()}`
    setPages((items) => [
      ...items,
      {
        slug,
        title: "Trang mới",
        menu_title: "Trang mới",
        banner_badge: "GZV",
        banner_title: "Trang mới",
        banner_subtitle: "",
        banner_description: "",
        banner_image_url: "",
        content_html: "",
        is_visible: true,
      },
    ])
    setSelectedSlug(slug)
    setBuilderSlug(slug)
  }

  const deleteSelectedPage = async () => {
    if (!selectedPage) return
    const slug = selectedPage.slug
    setPages((items) => items.filter((item) => item.slug !== slug))
    setPageBlocks((items) => items.filter((item) => item.page_slug !== slug))
    setNavItems((items) => items.filter((item) => item.href !== `/${slug}`))
    setSelectedSlug((pages.find((item) => item.slug !== slug) || { slug: "gioi-thieu" }).slug)
    await supabase.from("site_page_blocks").delete().eq("page_slug", slug)
    await supabase.from("site_navigation").delete().eq("href", `/${slug}`)
    const { error } = await supabase.from("site_pages").delete().eq("slug", slug)
    if (error) toast.error(error.message)
    else toast.success("Đã xóa trang và block liên quan")
  }

  const addHomeSection = () => {
    const key = `section-${Date.now()}`
    setHomeSections((items) => [
      ...items,
      {
        section_key: key,
        title: "Section mới",
        subtitle: "",
        description: "",
        button_label: "",
        button_url: "",
        sort_order: (items.length + 1) * 10,
        item_limit: 6,
        is_visible: true,
        content_html: "",
        settings: {},
      },
    ])
    setSelectedSectionKey(key)
  }

  const deleteHomeSection = async (sectionKey: string) => {
    setHomeSections((items) => items.filter((item) => item.section_key !== sectionKey))
    setSelectedSectionKey((homeSections.find((item) => item.section_key !== sectionKey) || { section_key: "projects" }).section_key)
    const { error } = await supabase.from("site_home_sections").delete().eq("section_key", sectionKey)
    if (error) toast.error(error.message)
    else toast.success("Đã xóa section trang chủ")
  }

  const deleteFloatingAction = async (index: number) => {
    const item = floating[index]
    setFloating((rows) => rows.filter((_, i) => i !== index))
    if (!item?.action_key) return
    const { error } = await supabase.from("site_floating_actions").delete().eq("action_key", item.action_key)
    if (error) toast.error(error.message)
    else toast.success("Đã xóa floating action")
  }

  const saveNavigation = () => saveRows("site_navigation", navItems, "href", "Đã lưu menu header")
  const savePage = () => selectedPage && saveRows("site_pages", [selectedPage], "slug", "Đã lưu nội dung trang")
  const saveHomeSections = () => saveRows("site_home_sections", homeSections, "section_key", "Đã lưu section trang chủ")
  const saveFloating = () => saveRows("site_floating_actions", floating, "action_key", "Đã lưu floating buttons")
  const saveBlocks = () => saveRows("site_page_blocks", pageBlocks, "page_slug,block_key", "Đã lưu page builder")

  const saveBuilderLayout = async () => {
    try {
      setSaving(true)
      const oldSlugs = Object.keys(slugRenames)
      const slugsToClean = [...new Set([...oldSlugs, builderSlug])]
      const page = builderPage || {
        slug: builderSlug,
        title: builderSlug,
        menu_title: builderSlug,
        banner_title: builderSlug,
        is_visible: true,
      }
      const blocks = builderBlocks.map(({ block }, position) => ({
        ...block,
        page_slug: builderSlug,
        sort_order: (position + 1) * 10,
      }))

      for (const slug of slugsToClean) {
        await supabase.from("site_page_blocks").delete().eq("page_slug", slug)
      }
      for (const slug of oldSlugs) {
        await supabase.from("site_pages").delete().eq("slug", slug)
        await supabase.from("site_navigation").delete().eq("href", `/${slug}`)
      }

      const pageResult = await supabase.from("site_pages").upsert(page, { onConflict: "slug" })
      if (pageResult.error) throw pageResult.error
      if (blocks.length) {
        const blockResult = await supabase.from("site_page_blocks").insert(blocks)
        if (blockResult.error) throw blockResult.error
      }
      const relatedNav = navItems.find((item) => item.href === `/${builderSlug}`)
      if (relatedNav) {
        const navResult = await supabase.from("site_navigation").upsert(relatedNav, { onConflict: "href" })
        if (navResult.error) throw navResult.error
      }

      setPageBlocks((items) => [
        ...items.filter((item) => item.page_slug !== builderSlug && !oldSlugs.includes(item.page_slug)),
        ...blocks,
      ])
      setSlugRenames({})
      toast.success("Đã lưu layout, thứ tự section và slug trang")
    } catch (error: any) {
      toast.error(error.message || "Không lưu được layout trang")
    } finally {
      setSaving(false)
    }
  }

  const saveBranding = async () => {
    try {
      setSaving(true)
      const { error } = await supabase.from("site_branding_settings").upsert(branding, { onConflict: "id" })
      if (error) throw error
      toast.success("Đã lưu branding, favicon và SEO mặc định")
    } catch (error: any) {
      toast.error(error.message || "Không lưu được branding")
    } finally {
      setSaving(false)
    }
  }

  const saveFooter = async () => {
    try {
      setSaving(true)
      const { error } = await supabase.from("site_footer_settings").upsert(footer, { onConflict: "id" })
      if (error) throw error
      toast.success("Đã lưu footer")
    } catch (error: any) {
      toast.error(error.message || "Không lưu được footer")
    } finally {
      setSaving(false)
    }
  }

  const saveLoading = async () => {
    try {
      setSaving(true)
      const { error } = await supabase.from("site_loading_settings").upsert(loadingSettings, { onConflict: "id" })
      if (error) throw error
      toast.success("Đã lưu trang loading")
    } catch (error: any) {
      toast.error(error.message || "Không lưu được loading")
    } finally {
      setSaving(false)
    }
  }

  const handleMediaSelect = (result: MediaPickResult) => {
    if (pickerOpen === "banner") updatePage({ banner_image_url: result.url })
    if (pickerOpen === "builderBanner") updateBuilderPage({ banner_image_url: result.url })
    if (pickerOpen === "loadingLogo") setLoadingSettings((value) => ({ ...value, logo_url: result.url }))
    if (pickerOpen === "footerLogo") setFooter((value) => ({ ...value, logo_url: result.url }))
    if (pickerOpen === "headerLogo") setBranding((value) => ({ ...value, header_logo_url: result.url }))
    if (pickerOpen === "brandFooterLogo") setBranding((value) => ({ ...value, footer_logo_url: result.url }))
    if (pickerOpen === "favicon") setBranding((value) => ({ ...value, favicon_url: result.url }))
    if (pickerOpen === "ogImage") setBranding((value) => ({ ...value, og_image_url: result.url }))
    if (pickerOpen === "heroVideo") updateSectionSettings({ video_url: result.url })
    if (pickerOpen === "heroPoster") updateSectionSettings({ poster_url: result.url })
    if (typeof pickerOpen === "object" && pickerOpen?.floatingIndex >= 0) updateFloating(pickerOpen.floatingIndex, { icon_url: result.url })
    if (typeof pickerOpen === "object" && "blockImageIndex" in pickerOpen) {
      const block = pageBlocks[pickerOpen.blockImageIndex]
      const images = Array.isArray(block?.props?.images) ? [...block.props.images] : []
      images[pickerOpen.imageIndex] = { ...(images[pickerOpen.imageIndex] || {}), src: result.url, alt: result.alt }
      updateBlock(pickerOpen.blockImageIndex, { props: { ...(block.props || {}), images } })
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Đang tải cấu hình website...</div>
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 md:p-6">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0b0b0b]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="border-l-4 border-[#ed1c24] pl-3 text-xs font-black uppercase tracking-wide text-[#ed1c24]">Website Control Center</p>
            <h1 className="mt-3 text-3xl font-black uppercase text-slate-950 dark:text-white">Điều khiển toàn bộ website</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">
              Chỉnh header, branding, từng trang, từng section trang chủ, page builder, footer, floating buttons và loading screen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={seedDefaultNavigation} className="rounded-none border-[#ed1c24] text-[#ed1c24]">
              <RotateCcw className="mr-2 h-4 w-4" /> Seed menu GZV
            </Button>
            <Button onClick={saveNavigation} disabled={saving} className="rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218]">
              <Save className="mr-2 h-4 w-4" /> Lưu header
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <ControlStat label="Menu" value={navItems.length} />
          <ControlStat label="Trang" value={pages.length} />
          <ControlStat label="Home section" value={homeSections.length} />
          <ControlStat label="Page blocks" value={pageBlocks.length} />
        </div>
      </div>

      <Tabs defaultValue="home" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-none border bg-white p-1 md:grid-cols-8 dark:bg-[#0b0b0b]">
          <TabsTrigger value="home">Trang chủ</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="navigation">Header</TabsTrigger>
          <TabsTrigger value="pages">Trang</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="floating">Floating</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <div className="mb-6 border border-slate-200 bg-[#050505] p-5 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="border-l-4 border-[#ed1c24] pl-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#ed1c24]">Page Builder Control</p>
                <h2 className="mt-3 text-2xl font-black uppercase">Chỉnh sửa từng trang public</h2>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/70">
                  Trang Dịch vụ nằm ở <span className="font-black text-white">/dich-vu</span>. Chọn trang, thêm block, chỉnh ảnh bằng Media Library, rồi lưu layout.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="rounded-none border-white/20 bg-transparent text-white hover:bg-white hover:text-[#050505]">
                  <a href="/admin/images"><ImageIcon className="mr-2 h-4 w-4" /> Mở Media Library</a>
                </Button>
                <Button asChild className="rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218]">
                  <a href={`https://www.gzv.one/${builderSlug}`} target="_blank" rel="noreferrer"><Eye className="mr-2 h-4 w-4" /> Xem trang public</a>
                </Button>
              </div>
            </div>
            <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-6">
              {quickBuilderPages.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  onClick={() => setBuilderSlug(page.slug)}
                  className={`border p-4 text-left transition ${builderSlug === page.slug ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-white/10 bg-white/5 text-white hover:border-[#ed1c24]"}`}
                >
                  <p className="text-sm font-black uppercase">{page.label}</p>
                  <p className={`mt-2 text-[11px] font-semibold leading-5 ${builderSlug === page.slug ? "text-white/85" : "text-white/50"}`}>{page.hint}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Card>
              <CardHeader><CardTitle>Trang</CardTitle><CardDescription>Chọn trang để nạp block layout.</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                <Button type="button" variant="outline" onClick={addPage} className="mb-2 w-full rounded-none">
                  <Plus className="mr-2 h-4 w-4" /> Trang mới
                </Button>
                {builderSlugs.map((slug) => (
                  <button key={slug} onClick={() => setBuilderSlug(slug)} className={`w-full rounded-none px-3 py-2 text-left text-sm font-bold ${builderSlug === slug ? "bg-[#ed1c24] text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{slug}</button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Page Builder: /{builderSlug}</CardTitle>
                <CardDescription>Kéo thả phiên bản nhẹ: đổi thứ tự bằng số, thêm template, sửa JSON props, HTML, slug trang và ẩn/hiện block.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="mb-4 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-[#ed1c24]" />
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Cấu hình trang đang edit</p>
                      <p className="text-sm text-slate-500">Đổi slug, title tab, SEO, banner và trạng thái public cho từng trang.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Slug trang">
                      <Input value={builderSlug} onChange={(event) => renameBuilderSlug(event.target.value)} placeholder="vi-du-slug" />
                    </Field>
                    <SwitchLine label="Hiện trang public" checked={builderPage?.is_visible !== false} onChange={(value) => updateBuilderPage({ is_visible: value })} />
                    <Field label="Tên trang"><Input value={builderPage?.title || ""} onChange={(event) => updateBuilderPage({ title: event.target.value })} /></Field>
                    <Field label="Title tab / SEO"><Input value={(builderPage as any)?.seo_title || ""} onChange={(event) => updateBuilderPage({ seo_title: event.target.value } as any)} /></Field>
                    <Field label="Tiêu đề banner"><Input value={builderPage?.banner_title || ""} onChange={(event) => updateBuilderPage({ banner_title: event.target.value })} /></Field>
                    <Field label="Ảnh banner"><PickerInput value={builderPage?.banner_image_url || ""} onChange={(value) => updateBuilderPage({ banner_image_url: value })} onPick={() => setPickerOpen("builderBanner")} /></Field>
                  </div>
                  <Field label="Meta description">
                    <Textarea value={(builderPage as any)?.seo_description || ""} onChange={(event) => updateBuilderPage({ seo_description: event.target.value } as any)} />
                  </Field>
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {(templates.length ? templates : fallbackTemplates).map((template) => (
                    <Button
                      key={template.template_key}
                      type="button"
                      variant="outline"
                      className="h-auto justify-start rounded-none border-slate-300 px-4 py-3 text-left font-black uppercase hover:border-[#ed1c24] hover:text-[#ed1c24]"
                      onClick={() => setPageBlocks((rows) => [...rows, {
                        page_slug: builderSlug,
                        block_key: `${template.template_key}-${Date.now()}`,
                        component_type: template.component_type,
                        title: template.name,
                        props: template.default_props || {},
                        content_html: "",
                        sort_order: rows.filter((r) => r.page_slug === builderSlug).length * 10 + 10,
                        is_visible: true,
                        responsive: {},
                        seo: {},
                      }])}
                    >
                      <Plus className="mr-2 h-4 w-4" /> {template.name}
                    </Button>
                  ))}
                </div>

                {builderBlocks.map(({ block, index }, position) => (
                  <div key={`${block.page_slug}-${block.block_key}-${index}`} className="space-y-3 border bg-white p-4 dark:bg-slate-900">
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_0.5fr_auto]">
                      <Field label="Page slug"><Input value={block.page_slug} onChange={(e) => updateBlock(index, { page_slug: e.target.value })} /></Field>
                      <Field label="Block key"><Input value={block.block_key} onChange={(e) => updateBlock(index, { block_key: e.target.value })} /></Field>
                      <Field label="Component"><Input value={block.component_type} onChange={(e) => updateBlock(index, { component_type: e.target.value })} /></Field>
                      <Field label="Thứ tự"><Input type="number" value={block.sort_order} onChange={(e) => updateBlock(index, { sort_order: Number(e.target.value) })} /></Field>
                      <div className="flex items-end gap-2">
                        <Button type="button" variant="outline" size="icon" disabled={position === 0} onClick={() => moveBlock(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
                        <Button type="button" variant="outline" size="icon" disabled={position === builderBlocks.length - 1} onClick={() => moveBlock(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
                        <Button type="button" variant="outline" size="icon" onClick={() => duplicateBlock(block)}><Copy className="h-4 w-4" /></Button>
                        <Switch checked={block.is_visible} onCheckedChange={(v) => updateBlock(index, { is_visible: v })} />
                        <Button variant="destructive" size="icon" onClick={() => setPageBlocks((rows) => rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <Field label="Tên block"><Input value={block.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} /></Field>
                    <BlockPropsEditor
                      block={block}
                      blockIndex={index}
                      onChange={(props) => updateBlock(index, { props })}
                      onPickImage={(imageIndex) => setPickerOpen({ blockImageIndex: index, imageIndex })}
                    />
                    <Field label="Rich HTML cá»§a block">
                      <GZVRichEditor value={block.content_html || ""} onChange={(html) => updateBlock(index, { content_html: html })} minHeight={260} uploadFolder={`blocks/${builderSlug}`} />
                    </Field>
                  </div>
                ))}
                <div className="sticky bottom-4 z-10 flex justify-end border bg-white/95 p-3 shadow-xl backdrop-blur dark:bg-slate-950/95">
                  <Button onClick={saveBuilderLayout} disabled={saving} className="gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218]"><Save className="h-4 w-4" /> Lưu layout trang này</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader><CardTitle>Branding, favicon và SEO mặc định</CardTitle><CardDescription>Chỉnh title tab, template title, header logo, footer logo, favicon và meta mặc định.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên site"><Input value={branding.site_name} onChange={(e) => setBranding({ ...branding, site_name: e.target.value })} /></Field>
                <Field label="Default title"><Input value={branding.default_title} onChange={(e) => setBranding({ ...branding, default_title: e.target.value })} /></Field>
                <Field label="Title template"><Input value={branding.title_template} onChange={(e) => setBranding({ ...branding, title_template: e.target.value })} placeholder="%s | GZV" /></Field>
                <Field label="Header logo"><PickerInput value={branding.header_logo_url} onChange={(v) => setBranding({ ...branding, header_logo_url: v })} onPick={() => setPickerOpen("headerLogo")} /></Field>
                <Field label="Footer logo"><PickerInput value={branding.footer_logo_url} onChange={(v) => setBranding({ ...branding, footer_logo_url: v })} onPick={() => setPickerOpen("brandFooterLogo")} /></Field>
                <Field label="Favicon"><PickerInput value={branding.favicon_url} onChange={(v) => setBranding({ ...branding, favicon_url: v })} onPick={() => setPickerOpen("favicon")} /></Field>
                <Field label="OG image"><PickerInput value={branding.og_image_url || ""} onChange={(v) => setBranding({ ...branding, og_image_url: v })} onPick={() => setPickerOpen("ogImage")} /></Field>
                <Field label="Topbar email"><Input value={branding.topbar_email_label || ""} onChange={(e) => setBranding({ ...branding, topbar_email_label: e.target.value })} /></Field>
                <Field label="Topbar phone"><Input value={branding.topbar_phone_label || ""} onChange={(e) => setBranding({ ...branding, topbar_phone_label: e.target.value })} /></Field>
                <Field label="Topbar badge"><Input value={branding.topbar_badge_label || ""} onChange={(e) => setBranding({ ...branding, topbar_badge_label: e.target.value })} /></Field>
              </div>
              <Field label="Meta description"><Textarea value={branding.default_description || ""} onChange={(e) => setBranding({ ...branding, default_description: e.target.value })} /></Field>
              <Field label="Meta keywords"><Textarea value={branding.default_keywords || ""} onChange={(e) => setBranding({ ...branding, default_keywords: e.target.value })} /></Field>
              <Button onClick={saveBranding} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> Lưu branding</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="home">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <ListCard title="Section trang chủ">
              <div className="mb-2 grid grid-cols-[1fr_auto] gap-2">
                <Button type="button" variant="outline" onClick={addHomeSection} className="w-full rounded-none">
                  <Plus className="mr-2 h-4 w-4" /> Thêm section
                </Button>
                <Button type="button" variant="outline" onClick={normalizeHomeSectionOrder} className="rounded-none px-3" title="Chuẩn hóa thứ tự">
                  <GripVertical className="h-4 w-4" />
                </Button>
              </div>
              {orderedHomeSections.map(({ section }, position) => (
                <div key={section.section_key} className={`mb-2 grid grid-cols-[1fr_auto] border ${selectedSectionKey === section.section_key ? "border-[#ed1c24]" : "border-slate-200 dark:border-white/10"}`}>
                  <button onClick={() => setSelectedSectionKey(section.section_key)} className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-bold transition ${selectedSectionKey === section.section_key ? "bg-[#ed1c24] text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <span className="line-clamp-2">{section.title}</span>
                    {section.is_visible ? <Eye className="h-4 w-4 shrink-0" /> : <EyeOff className="h-4 w-4 shrink-0" />}
                  </button>
                  <div className="flex border-l bg-white dark:bg-slate-950">
                    <Button type="button" variant="ghost" size="icon" className="h-full rounded-none" disabled={position === 0} onClick={() => moveHomeSection(section.section_key, -1)} title="Đưa section lên">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-full rounded-none" disabled={position === orderedHomeSections.length - 1} onClick={() => moveHomeSection(section.section_key, 1)} title="Đưa section xuống">
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ListCard>
            {selectedSection && (
              <Card>
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle>Chỉnh section: {selectedSection.title}</CardTitle>
                    <CardDescription>Bật tắt, đổi tiêu đề, mô tả, nút và số lượng item trên trang chủ.</CardDescription>
                  </div>
                  <Button type="button" variant="destructive" className="rounded-none" onClick={() => deleteHomeSection(selectedSection.section_key)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa section
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Key"><Input value={selectedSection.section_key} disabled /></Field>
                    <SwitchLine label="Hiện section" checked={selectedSection.is_visible} onChange={(v) => updateSection({ is_visible: v })} />
                    <Field label="Tiêu đề"><Input value={selectedSection.title || ""} onChange={(e) => updateSection({ title: e.target.value })} /></Field>
                    <Field label="Thứ tự"><Input type="number" value={selectedSection.sort_order} onChange={(e) => updateSection({ sort_order: Number(e.target.value) })} /></Field>
                    <Field label="Label nút"><Input value={selectedSection.button_label || ""} onChange={(e) => updateSection({ button_label: e.target.value })} /></Field>
                    <Field label="Link nút"><Input value={selectedSection.button_url || ""} onChange={(e) => updateSection({ button_url: e.target.value })} /></Field>
                    <Field label="Số item"><Input type="number" value={selectedSection.item_limit} onChange={(e) => updateSection({ item_limit: Number(e.target.value) })} /></Field>
                  </div>
                  <Field label="Phụ đề"><Textarea value={selectedSection.subtitle || ""} onChange={(e) => updateSection({ subtitle: e.target.value })} /></Field>
                  <Field label="Mô tả"><Textarea value={selectedSection.description || ""} onChange={(e) => updateSection({ description: e.target.value })} /></Field>
                  {selectedSection.section_key === "hero" && (
                    <div className="space-y-4 border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-[#ed1c24]" />
                        <div>
                          <p className="text-sm font-black uppercase text-slate-950 dark:text-white">Hero video trang chủ</p>
                          <p className="text-xs text-slate-500">Dán URL mp4/webm/ogg hoặc link YouTube/Vimeo. Có thể chọn file đã upload từ media.</p>
                        </div>
                      </div>
                      <Field label="Video URL hoặc embed URL">
                        <div className="flex gap-2">
                          <Input
                            value={selectedSection.settings?.video_url || ""}
                            onChange={(e) => updateSectionSettings({ video_url: e.target.value })}
                            placeholder="/Intro.mp4 hoặc https://youtube.com/watch?v=..."
                          />
                          <Button type="button" variant="outline" className="rounded-none" onClick={() => setPickerOpen("heroVideo")}>
                            <Video className="mr-2 h-4 w-4" /> Chọn video
                          </Button>
                        </div>
                      </Field>
                      <Field label="Poster ảnh video">
                        <div className="flex gap-2">
                          <Input
                            value={selectedSection.settings?.poster_url || ""}
                            onChange={(e) => updateSectionSettings({ poster_url: e.target.value })}
                            placeholder="/og-image.jpg"
                          />
                          <Button type="button" variant="outline" className="rounded-none" onClick={() => setPickerOpen("heroPoster")}>
                            <ImageIcon className="mr-2 h-4 w-4" /> Chọn ảnh
                          </Button>
                        </div>
                      </Field>
                      {(selectedSection.settings?.video_url || selectedSection.settings?.poster_url) && (
                        <div className="border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950">
                          <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-500">Preview URL</p>
                          <div className="break-all text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {selectedSection.settings?.video_url || "Chưa có video URL"}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <Field label="Settings JSON nâng cao">
                    <PropsEditor value={selectedSection.settings || {}} onChange={(settings) => updateSection({ settings })} />
                  </Field>
                  <Button onClick={saveHomeSections} disabled={saving} className="gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218]"><Save className="h-4 w-4" /> Lưu section trang chủ</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="navigation">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> Menu header</CardTitle><CardDescription>Đổi tiêu đề, thứ tự, ẩn khỏi header hoặc khóa hẳn trang public.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={seedDefaultNavigation} className="rounded-none">
                  <RotateCcw className="mr-2 h-4 w-4" /> Nạp cấu trúc GZV
                </Button>
                <Button type="button" variant="outline" onClick={addNavItem} className="rounded-none">
                  <Plus className="mr-2 h-4 w-4" /> Thêm menu
                </Button>
              </div>
              {navItems.map((item, index) => (
                <div key={`${item.href}-${index}`} className="grid gap-3 rounded-none border bg-white p-4 md:grid-cols-[1.2fr_1.2fr_0.7fr_0.7fr_0.7fr_auto] dark:bg-slate-900">
                  <Field label="Đường dẫn"><Input value={item.href} onChange={(e) => updateNav(index, { href: e.target.value })} /></Field>
                  <Field label="Tiêu đề header"><Input value={item.label_vi} onChange={(e) => updateNav(index, { label_vi: e.target.value })} /></Field>
                  <Field label="Thứ tự"><Input type="number" value={item.sort_order} onChange={(e) => updateNav(index, { sort_order: Number(e.target.value) })} /></Field>
                  <SwitchLine label="Hiện menu" checked={item.is_visible} onChange={(v) => updateNav(index, { is_visible: v })} />
                  <SwitchLine label="Mở trang" checked={item.is_page_enabled} onChange={(v) => updateNav(index, { is_page_enabled: v })} />
                  <div className="flex items-end">
                    <Button type="button" variant="destructive" size="icon" className="rounded-none" onClick={() => deleteNavItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button onClick={saveNavigation} disabled={saving} className="gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218]"><Save className="h-4 w-4" /> Lưu menu header</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <ListCard title="Danh sách trang">
              <Button type="button" variant="outline" onClick={addPage} className="mb-2 w-full rounded-none">
                <Plus className="mr-2 h-4 w-4" /> Thêm trang
              </Button>
              {pages.map((page) => (
                <button key={page.slug} onClick={() => setSelectedSlug(page.slug)} className={`flex w-full items-center justify-between rounded-none px-3 py-2 text-left text-sm font-bold transition ${selectedSlug === page.slug ? "bg-[#ed1c24] text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                  <span>{page.title}</span>
                  {page.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              ))}
            </ListCard>
            {selectedPage && (
              <Card>
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle>Chỉnh trang: {selectedPage.title}</CardTitle>
                    <CardDescription>Banner áp dụng cho PageBanner. Nội dung HTML sẽ được chèn thêm cuối trang public.</CardDescription>
                  </div>
                  <Button type="button" variant="destructive" className="rounded-none" onClick={deleteSelectedPage}>
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa trang
                  </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Slug"><Input value={selectedPage.slug} disabled /></Field>
                    <SwitchLine label="Hiện trang" checked={selectedPage.is_visible} onChange={(v) => updatePage({ is_visible: v })} />
                    <Field label="Tên trang"><Input value={selectedPage.title || ""} onChange={(e) => updatePage({ title: e.target.value })} /></Field>
                    <Field label="Tiêu đề menu gợi ý"><Input value={selectedPage.menu_title || ""} onChange={(e) => updatePage({ menu_title: e.target.value })} /></Field>
                    <Field label="Badge banner"><Input value={selectedPage.banner_badge || ""} onChange={(e) => updatePage({ banner_badge: e.target.value })} /></Field>
                    <Field label="Tiêu đề banner"><Input value={selectedPage.banner_title || ""} onChange={(e) => updatePage({ banner_title: e.target.value })} /></Field>
                  </div>
                  <Field label="Phụ đề banner"><Textarea value={selectedPage.banner_subtitle || ""} onChange={(e) => updatePage({ banner_subtitle: e.target.value })} /></Field>
                  <Field label="Mô tả banner"><Textarea value={selectedPage.banner_description || ""} onChange={(e) => updatePage({ banner_description: e.target.value })} /></Field>
                  <Field label="Ảnh banner">
                    <div className="flex gap-2">
                      <Input value={selectedPage.banner_image_url || ""} onChange={(e) => updatePage({ banner_image_url: e.target.value })} placeholder="URL ảnh banner" />
                      <Button type="button" variant="outline" onClick={() => setPickerOpen("banner")}><ImageIcon className="mr-2 h-4 w-4" /> Chọn ảnh</Button>
                    </div>
                  </Field>
                  <Field label="Nội dung thêm của trang">
                    <GZVRichEditor value={selectedPage.content_html || ""} onChange={(html) => updatePage({ content_html: html })} minHeight={420} uploadFolder={`pages/${selectedPage.slug}`} />
                  </Field>
                  <Button onClick={savePage} disabled={saving} className="gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218]"><Save className="h-4 w-4" /> Lưu trang</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardHeader><CardTitle>Footer</CardTitle><CardDescription>Chỉnh logo, thông tin liên hệ, màu nền, link cuối trang và social.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Logo footer"><div className="flex gap-2"><Input value={footer.logo_url} onChange={(e) => setFooter({ ...footer, logo_url: e.target.value })} /><Button variant="outline" onClick={() => setPickerOpen("footerLogo")}><ImageIcon className="h-4 w-4" /></Button></div></Field>
                <Field label="Intro"><Input value={footer.intro_text} onChange={(e) => setFooter({ ...footer, intro_text: e.target.value })} /></Field>
                <Field label="Màu nền"><Input type="color" value={footer.background_color} onChange={(e) => setFooter({ ...footer, background_color: e.target.value })} /></Field>
                <Field label="Màu đáy footer"><Input type="color" value={footer.bottom_background_color} onChange={(e) => setFooter({ ...footer, bottom_background_color: e.target.value })} /></Field>
                <Field label="Facebook page"><Input value={footer.facebook_page_url || ""} onChange={(e) => setFooter({ ...footer, facebook_page_url: e.target.value })} /></Field>
                <Field label="Địa chỉ"><Input value={footer.address || ""} onChange={(e) => setFooter({ ...footer, address: e.target.value })} /></Field>
                <Field label="Phone label"><Input value={footer.phone_label || ""} onChange={(e) => setFooter({ ...footer, phone_label: e.target.value })} /></Field>
                <Field label="Phone URL"><Input value={footer.phone_url || ""} onChange={(e) => setFooter({ ...footer, phone_url: e.target.value })} /></Field>
                <Field label="Email label"><Input value={footer.email_label || ""} onChange={(e) => setFooter({ ...footer, email_label: e.target.value })} /></Field>
                <Field label="Email URL"><Input value={footer.email_url || ""} onChange={(e) => setFooter({ ...footer, email_url: e.target.value })} /></Field>
                <Field label="Newsletter title"><Input value={footer.newsletter_title || ""} onChange={(e) => setFooter({ ...footer, newsletter_title: e.target.value })} /></Field>
                <Field label="Copyright"><Input value={footer.copyright_text || ""} onChange={(e) => setFooter({ ...footer, copyright_text: e.target.value })} /></Field>
              </div>
              <Field label="Newsletter mô tả"><Textarea value={footer.newsletter_description || ""} onChange={(e) => setFooter({ ...footer, newsletter_description: e.target.value })} /></Field>
              <EditableLinks title="Link footer" rows={footer.links} onChange={(links) => setFooter({ ...footer, links })} />
              <EditableLinks title="Social footer" rows={footer.social_links} onChange={(social_links) => setFooter({ ...footer, social_links })} withIcon />
              <Button onClick={saveFooter} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> Lưu footer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="floating">
          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader>
                <CardTitle>Floating chat/buttons</CardTitle>
                <CardDescription>Chỉnh chatbot, social media, link gọi điện, Zalo, Facebook, YouTube. Public sẽ hiển thị dạng dock, không đè nút lên đầu trang.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {floating
                  .map((item, index) => ({ item, index }))
                  .sort((a, b) => (a.item.sort_order || 0) - (b.item.sort_order || 0))
                  .map(({ item, index }, position, ordered) => (
                    <div key={`${item.action_key}-${index}`} className="grid gap-4 border bg-white p-4 dark:bg-slate-900 lg:grid-cols-[92px_1fr_auto]">
                      <div className="flex flex-col items-center justify-center gap-2 border bg-slate-50 p-3 dark:bg-slate-950">
                        <div className="flex h-14 w-14 items-center justify-center bg-[#050505] text-white">
                          {item.icon_url ? <img src={item.icon_url} alt={item.label} className="h-8 w-8 object-contain" /> : <MessageCirclePreview label={item.label} type={item.action_type} />}
                        </div>
                        <span className={`px-2 py-1 text-[10px] font-black uppercase ${item.is_visible ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                          {item.is_visible ? "Hiện" : "Ẩn"}
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Mã nút"><Input value={item.action_key} onChange={(e) => updateFloating(index, { action_key: e.target.value })} placeholder="facebook, zalo, chatbot..." /></Field>
                        <Field label="Tên hiển thị"><Input value={item.label} onChange={(e) => updateFloating(index, { label: e.target.value })} placeholder="Facebook" /></Field>
                        <Field label="Link liên kết"><Input value={item.href || ""} onChange={(e) => updateFloating(index, { href: e.target.value })} placeholder="https://, tel:, mailto:, zalo..." /></Field>
                        <Field label="Loại nút"><Select value={item.action_type} onValueChange={(v: "link" | "chatbot") => updateFloating(index, { action_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="link">Link / Social</SelectItem><SelectItem value="chatbot">Chatbot</SelectItem></SelectContent></Select></Field>
                        <Field label="URL icon"><Input value={item.icon_url || ""} onChange={(e) => updateFloating(index, { icon_url: e.target.value })} placeholder="/icons/zalo.png" /></Field>
                        <Field label="Thứ tự"><Input type="number" value={item.sort_order} onChange={(e) => updateFloating(index, { sort_order: Number(e.target.value) })} /></Field>
                      </div>

                      <div className="flex flex-row items-end gap-2 lg:flex-col lg:items-stretch lg:justify-end">
                        <Button type="button" variant="outline" size="icon" className="rounded-none" disabled={position === 0} onClick={() => moveFloatingAction(index, -1)} title="Đưa lên">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" className="rounded-none" disabled={position === ordered.length - 1} onClick={() => moveFloatingAction(index, 1)} title="Đưa xuống">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" className="rounded-none" onClick={() => setPickerOpen({ floatingIndex: index })} title="Chọn icon">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Switch checked={item.is_visible} onCheckedChange={(v) => updateFloating(index, { is_visible: v })} />
                        <Button type="button" variant="destructive" size="icon" className="rounded-none" onClick={() => deleteFloatingAction(index)} title="Xóa nút">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-none" onClick={() => setFloating((rows) => [...rows, { action_key: `action-${Date.now()}`, label: "Nút mới", href: "", icon_url: "", action_type: "link", sort_order: rows.length * 10 + 10, is_visible: true }])}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm nút
                  </Button>
                  <Button onClick={saveFloating} disabled={saving} className="gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218]">
                    <Save className="h-4 w-4" /> Lưu floating
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="self-start">
              <CardHeader>
                <CardTitle>Preview dock</CardTitle>
                <CardDescription>Back-to-top nằm riêng bên trái, dock liên hệ nằm bên phải.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="mb-3 flex justify-end">
                    <div className="w-[230px] border bg-white shadow-xl">
                      <div className="bg-[#050505] px-4 py-3 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">GZV Connect</p>
                        <p className="text-sm font-black uppercase">Kết nối nhanh</p>
                      </div>
                      <div className="space-y-1 p-2">
                        {floating.filter((item) => item.is_visible).slice(0, 4).map((item) => (
                          <div key={item.action_key} className="flex items-center gap-3 px-3 py-2">
                            <span className="flex h-9 w-9 items-center justify-center bg-[#050505] text-white">
                              {item.icon_url ? <img src={item.icon_url} alt="" className="h-5 w-5 object-contain" /> : <MessageCirclePreview label={item.label} type={item.action_type} />}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-black">{item.label}</p>
                              <p className="truncate text-[10px] font-bold text-slate-500">{item.action_type === "chatbot" ? "Mở chatbot" : item.href || "Chưa có link"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <span className="flex h-11 w-11 items-center justify-center border bg-white"><ArrowUp className="h-4 w-4" /></span>
                    <span className="flex h-11 items-center gap-2 bg-[#ed1c24] px-4 text-xs font-black uppercase text-white"><Plus className="h-4 w-4" /> Liên hệ</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loading">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MonitorCog className="h-5 w-5" /> Trang loading public</CardTitle><CardDescription>Hiển thị khi người dùng mới vào website và khi chuyển trang chờ dữ liệu đổ lên.</CardDescription></CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <SwitchLine label="Bật loading" checked={loadingSettings.enabled} onChange={(v) => setLoadingSettings({ ...loadingSettings, enabled: v })} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Tiêu đề"><Input value={loadingSettings.title} onChange={(e) => setLoadingSettings({ ...loadingSettings, title: e.target.value })} /></Field>
                  <Field label="Dòng mô tả"><Input value={loadingSettings.subtitle} onChange={(e) => setLoadingSettings({ ...loadingSettings, subtitle: e.target.value })} /></Field>
                  <Field label="Hiệu ứng"><Select value={loadingSettings.effect} onValueChange={(effect: LoadingSettings["effect"]) => setLoadingSettings({ ...loadingSettings, effect })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="orbit">Orbit</SelectItem><SelectItem value="pulse">Pulse</SelectItem><SelectItem value="bars">Bars</SelectItem></SelectContent></Select></Field>
                  <Field label="Thời gian tối thiểu ms"><Input type="number" min={0} max={6000} value={loadingSettings.minimum_duration_ms} onChange={(e) => setLoadingSettings({ ...loadingSettings, minimum_duration_ms: Number(e.target.value) })} /></Field>
                  <Field label="Màu nền 1"><Input type="color" value={loadingSettings.background_from} onChange={(e) => setLoadingSettings({ ...loadingSettings, background_from: e.target.value })} /></Field>
                  <Field label="Màu nền 2"><Input type="color" value={loadingSettings.background_to} onChange={(e) => setLoadingSettings({ ...loadingSettings, background_to: e.target.value })} /></Field>
                  <Field label="Màu nhấn"><Input type="color" value={loadingSettings.accent_color} onChange={(e) => setLoadingSettings({ ...loadingSettings, accent_color: e.target.value })} /></Field>
                  <Field label="Logo"><div className="flex gap-2"><Input value={loadingSettings.logo_url} onChange={(e) => setLoadingSettings({ ...loadingSettings, logo_url: e.target.value })} /><Button variant="outline" onClick={() => setPickerOpen("loadingLogo")}><ImageIcon className="h-4 w-4" /></Button></div></Field>
                </div>
                <Button onClick={saveLoading} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> Lưu loading</Button>
              </div>
              <div className="rounded-2xl p-6 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${loadingSettings.background_from}, ${loadingSettings.background_to})` }}><div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-white p-4"><img src={loadingSettings.logo_url} alt="Loading logo" className="max-h-20 object-contain" /></div><h3 className="mt-6 text-center text-2xl font-black uppercase tracking-[0.18em]">{loadingSettings.title}</h3><p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.22em] text-white/75">{loadingSettings.subtitle}</p></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MediaPickerDialog open={Boolean(pickerOpen)} onClose={() => setPickerOpen(null)} defaultFolder="site" onSelect={handleMediaSelect} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}

function ControlStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function BlockPropsEditor({
  block,
  blockIndex,
  onChange,
  onPickImage,
}: {
  block: PageBlock
  blockIndex: number
  onChange: (value: Record<string, any>) => void
  onPickImage: (imageIndex: number) => void
}) {
  const [dragImageIndex, setDragImageIndex] = useState<number | null>(null)
  if (block.component_type !== "image_gallery") {
    return <PropsEditor value={block.props || {}} onChange={onChange} />
  }

  const props = block.props || {}
  const images = Array.isArray(props.images) ? props.images : []
  const updateImage = (imageIndex: number, patch: Record<string, any>) => {
    const nextImages = images.map((image: any, idx: number) => idx === imageIndex ? { ...image, ...patch } : image)
    onChange({ ...props, images: nextImages })
  }
  const moveImage = (imageIndex: number, direction: -1 | 1) => {
    const swapIndex = imageIndex + direction
    if (swapIndex < 0 || swapIndex >= images.length) return
    const nextImages = [...images]
    ;[nextImages[imageIndex], nextImages[swapIndex]] = [nextImages[swapIndex], nextImages[imageIndex]]
    onChange({ ...props, images: nextImages })
  }
  const dropImage = (targetIndex: number) => {
    if (dragImageIndex === null || dragImageIndex === targetIndex) {
      setDragImageIndex(null)
      return
    }
    const nextImages = [...images]
    const [moved] = nextImages.splice(dragImageIndex, 1)
    nextImages.splice(targetIndex, 0, moved)
    onChange({ ...props, images: nextImages })
    setDragImageIndex(null)
  }
  const addImage = () => {
    onChange({
      ...props,
      images: [
        ...images,
        { src: "", title: "Ảnh mới", category: "GZV", description: "", alt: "" },
      ],
    })
  }
  const deleteImage = (imageIndex: number) => {
    onChange({ ...props, images: images.filter((_: any, idx: number) => idx !== imageIndex) })
  }

  return (
    <div className="space-y-4 rounded-xl border bg-slate-50 p-4 dark:bg-slate-950">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Tiêu đề gallery">
          <Input value={props.title || ""} onChange={(event) => onChange({ ...props, title: event.target.value })} />
        </Field>
        <Field label="Phụ đề gallery">
          <Input value={props.subtitle || ""} onChange={(event) => onChange({ ...props, subtitle: event.target.value })} />
        </Field>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bộ ảnh và mô tả</Label>
        <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={addImage}>
          <Plus className="mr-2 h-4 w-4" /> Thêm ảnh
        </Button>
      </div>
      <div className="space-y-3">
        {images.map((image: any, imageIndex: number) => {
          const positionX = Number(image.position_x ?? 50)
          const positionY = Number(image.position_y ?? 50)
          return (
            <div
              key={`${blockIndex}-${imageIndex}`}
              draggable
              onDragStart={() => setDragImageIndex(imageIndex)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropImage(imageIndex)}
              onDragEnd={() => setDragImageIndex(null)}
              className={`grid gap-3 border bg-white p-3 transition dark:border-white/10 dark:bg-slate-900 md:grid-cols-[180px_1fr_auto] ${dragImageIndex === imageIndex ? "border-[#ed1c24] opacity-60" : ""}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span className="inline-flex items-center gap-1"><GripVertical className="h-3.5 w-3.5" /> Kéo ảnh</span>
                  <span>#{imageIndex + 1}</span>
                </div>
                <div className="aspect-video overflow-hidden bg-slate-200 dark:bg-slate-800">
                  {image.src ? <img src={image.src} alt={image.alt || image.title || ""} className="h-full w-full object-cover" style={{ objectPosition: `${positionX}% ${positionY}%` }} /> : null}
                </div>
                <Button type="button" variant="outline" size="sm" className="w-full rounded-none" onClick={() => onPickImage(imageIndex)}>
                  <ImageIcon className="mr-2 h-4 w-4" /> Chọn ảnh
                </Button>
                <div className="grid grid-cols-2 gap-1">
                  <Button type="button" variant="outline" size="sm" className="rounded-none" disabled={imageIndex === 0} onClick={() => moveImage(imageIndex, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-none" disabled={imageIndex === images.length - 1} onClick={() => moveImage(imageIndex, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="URL ảnh">
                  <Input value={image.src || ""} onChange={(event) => updateImage(imageIndex, { src: event.target.value })} />
                </Field>
                <Field label="Alt">
                  <Input value={image.alt || ""} onChange={(event) => updateImage(imageIndex, { alt: event.target.value })} />
                </Field>
                <Field label="Ti?u ??">
                  <Input value={image.title || ""} onChange={(event) => updateImage(imageIndex, { title: event.target.value })} />
                </Field>
                <Field label="Category">
                  <Input value={image.category || ""} onChange={(event) => updateImage(imageIndex, { category: event.target.value })} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="M? t?">
                    <Textarea value={image.description || ""} onChange={(event) => updateImage(imageIndex, { description: event.target.value })} />
                  </Field>
                </div>
                <Field label={`Vị trí ngang: ${positionX}%`}>
                  <Input type="range" min={0} max={100} value={positionX} onChange={(event) => updateImage(imageIndex, { position_x: Number(event.target.value) })} />
                </Field>
                <Field label={`Vị trí dọc: ${positionY}%`}>
                  <Input type="range" min={0} max={100} value={positionY} onChange={(event) => updateImage(imageIndex, { position_y: Number(event.target.value) })} />
                </Field>
              </div>
              <Button type="button" variant="destructive" size="icon" className="rounded-none" onClick={() => deleteImage(imageIndex)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>
      <PropsEditor value={props} onChange={onChange} />
    </div>
  )
}

function PropsEditor({ value, onChange }: { value: Record<string, any>; onChange: (value: Record<string, any>) => void }) {
  const [rawJson, setRawJson] = useState(() => JSON.stringify(value || {}, null, 2))
  const [jsonError, setJsonError] = useState("")

  useEffect(() => {
    setRawJson(JSON.stringify(value || {}, null, 2))
    setJsonError("")
  }, [value])

  const updateKey = (key: string, nextValue: any) => {
    onChange({ ...(value || {}), [key]: nextValue })
  }

  const entries = Object.entries(value || {})

  return (
    <div className="space-y-4 rounded-xl border bg-slate-50 p-4 dark:bg-slate-950">
      <div>
        <Label>Props editor</Label>
        <p className="mt-1 text-xs text-slate-500">Edit nhanh tung field. Object/array van co JSON rieng de can thiep sau.</p>
      </div>
      {entries.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {entries.map(([key, item]) => (
            <Field key={key} label={key}>
              {renderPropControl(item, (nextValue) => updateKey(key, nextValue))}
            </Field>
          ))}
        </div>
      )}
      <Field label="Raw JSON">
        <Textarea
          className="min-h-[180px] font-mono text-xs"
          value={rawJson}
          onChange={(event) => {
            const text = event.target.value
            setRawJson(text)
            try {
              const parsed = JSON.parse(text || "{}")
              setJsonError("")
              onChange(parsed)
            } catch (error: any) {
              setJsonError(error.message || "JSON khong hop le")
            }
          }}
        />
      </Field>
      {jsonError && <p className="text-xs font-bold text-red-600">{jsonError}</p>}
    </div>
  )
}

function renderPropControl(value: any, onChange: (value: any) => void) {
  if (typeof value === "boolean") {
    return <Switch checked={value} onCheckedChange={onChange} />
  }
  if (typeof value === "number") {
    return <Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
  }
  if (typeof value === "string") {
    const looksLikeColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
    if (looksLikeColor) {
      return (
        <div className="flex gap-2">
          <Input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="w-16 shrink-0" />
          <Input value={value} onChange={(event) => onChange(event.target.value)} />
        </div>
      )
    }
    if (value.length > 90) {
      return <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
    }
    return <Input value={value} onChange={(event) => onChange(event.target.value)} />
  }
  if (Array.isArray(value)) {
    return <ArrayPropEditor rows={value} onChange={onChange} />
  }

  return (
    <Textarea
      className="min-h-[120px] font-mono text-xs"
      value={JSON.stringify(value ?? null, null, 2)}
      onChange={(event) => {
        try {
          onChange(JSON.parse(event.target.value || "null"))
        } catch {
          onChange(value)
        }
      }}
    />
  )
}

function ArrayPropEditor({ rows, onChange }: { rows: any[]; onChange: (value: any[]) => void }) {
  const isObjectArray = rows.every((row) => row && typeof row === "object" && !Array.isArray(row))
  const move = (index: number, direction: -1 | 1) => {
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= rows.length) return
    const nextRows = [...rows]
    ;[nextRows[index], nextRows[swapIndex]] = [nextRows[swapIndex], nextRows[index]]
    onChange(nextRows)
  }

  if (!isObjectArray) {
    return (
      <Textarea
        className="min-h-[120px] font-mono text-xs"
        value={JSON.stringify(rows, null, 2)}
        onChange={(event) => {
          try {
            const parsed = JSON.parse(event.target.value || "[]")
            onChange(Array.isArray(parsed) ? parsed : rows)
          } catch {
            onChange(rows)
          }
        }}
      />
    )
  }

  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row || {}))))
  const updateRow = (index: number, key: string, nextValue: string) => {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: nextValue } : row))
  }
  const addRow = () => {
    const template = Object.fromEntries((keys.length ? keys : ["title", "description"]).map((key) => [key, ""]))
    onChange([...rows, template])
  }

  return (
    <div className="space-y-3 border bg-white p-3 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Danh sách item</span>
        <Button type="button" variant="outline" size="sm" className="rounded-none" onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" /> Thêm item
        </Button>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="border bg-slate-50 p-3 dark:bg-slate-950">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><GripVertical className="h-3.5 w-3.5" /> Item #{index + 1}</span>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-none" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
              <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-none" disabled={index === rows.length - 1} onClick={() => move(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
              <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-none" onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {keys.map((key) => (
              <Field key={key} label={key}>
                {String(row?.[key] || "").length > 80 ? (
                  <Textarea value={String(row?.[key] || "")} onChange={(event) => updateRow(index, key, event.target.value)} />
                ) : (
                  <Input value={String(row?.[key] ?? "")} onChange={(event) => updateRow(index, key, event.target.value)} />
                )}
              </Field>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function PickerInput({ value, onChange, onPick }: { value: string; onChange: (value: string) => void; onPick: () => void }) {
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
      <Button type="button" variant="outline" onClick={onPick}><ImageIcon className="h-4 w-4" /></Button>
    </div>
  )
}

function SwitchLine({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3 rounded-lg border p-3"><Label>{label}</Label><Switch checked={checked} onCheckedChange={onChange} /></div>
}

function MessageCirclePreview({ label, type }: { label: string; type: "link" | "chatbot" }) {
  const key = label.toLowerCase()
  if (type === "chatbot") return <Bot className="h-5 w-5" />
  if (key.includes("zalo") || key.includes("chat")) return <MessageCircle className="h-5 w-5" />
  return <Plus className="h-5 w-5" />
}

function ListCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-2">{children}</CardContent></Card>
}

function EditableLinks({ title, rows, onChange, withIcon = false }: { title: string; rows: any[]; onChange: (rows: any[]) => void; withIcon?: boolean }) {
  const update = (index: number, patch: any) => onChange(rows.map((row, i) => i === index ? { ...row, ...patch } : row))
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between"><Label>{title}</Label><Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, { label: "Link mới", href: "", icon: "", visible: true }])}><Plus className="mr-2 h-4 w-4" /> Thêm</Button></div>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-[1fr_1.4fr_0.8fr_auto_auto]">
          <Input value={row.label || ""} onChange={(e) => update(index, { label: e.target.value })} placeholder="Label" />
          <Input value={row.href || ""} onChange={(e) => update(index, { href: e.target.value })} placeholder="Href" />
          {withIcon ? <Input value={row.icon || ""} onChange={(e) => update(index, { icon: e.target.value })} placeholder="icon" /> : <div />}
          <Switch checked={row.visible !== false} onCheckedChange={(visible) => update(index, { visible })} />
          <Button type="button" variant="destructive" size="icon" onClick={() => onChange(rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  )
}

export default function SiteContentPage() {
  return <ProtectedRoute allowedRoles={["admin", "collab"]}><SiteContentManager /></ProtectedRoute>
}
