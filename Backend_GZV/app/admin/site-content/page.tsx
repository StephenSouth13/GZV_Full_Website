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
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Image as ImageIcon, Layers, Loader2, MonitorCog, Plus, RotateCcw, Save, Settings2, Trash2, Video } from "lucide-react"

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
  { href: "/gioi-thieu", label_vi: "GIá»šI THIá»†U", label_en: "ABOUT", sort_order: 10, is_visible: true, is_page_enabled: true },
  { href: "/#dich-vu", label_vi: "Dá»ŠCH Vá»¤", label_en: "SERVICES", sort_order: 20, is_visible: true, is_page_enabled: true },
  { href: "/du-an", label_vi: "Dá»° ÃN", label_en: "PROJECTS", sort_order: 30, is_visible: true, is_page_enabled: true },
  { href: "/gzver", label_vi: "GZVers", label_en: "GZVers", sort_order: 40, is_visible: true, is_page_enabled: true },
  { href: "/tin-tuc", label_vi: "TIN Tá»¨C", label_en: "NEWS", sort_order: 50, is_visible: true, is_page_enabled: true },
  { href: "/lien-he", label_vi: "LIÃŠN Há»†", label_en: "CONTACT", sort_order: 60, is_visible: true, is_page_enabled: true },
]

const defaultLoading: LoadingSettings = { id: 1, logo_url: "/logo.webp", title: "GZV", subtitle: "Äang táº£i dá»¯ liá»‡u...", effect: "orbit", background_from: "#031b3f", background_to: "#0f766e", accent_color: "#38bdf8", enabled: true, minimum_duration_ms: 900 }
const defaultBranding: BrandingSettings = { id: 1, site_name: "GZV", header_logo_url: "/logo.webp", footer_logo_url: "/logo.webp", favicon_url: "/logo/favicon.ico", default_title: "GZV - The Voice of Genzers", title_template: "%s | GZV", default_description: "GZV Center", default_keywords: "GZV, Ä‘Ã o táº¡o, mentoring, coaching", og_image_url: "/og-image.jpg", topbar_email_label: "gzv.one@gmail.com", topbar_phone_label: "(+84) 329 381 489", topbar_badge_label: "GZV" }
const defaultFooter: FooterSettings = {
  id: 1,
  logo_url: "/logo.webp",
  intro_text: "GZV - The Voice of Genzers",
  background_color: "#095095",
  bottom_background_color: "#074070",
  facebook_page_url: "https://www.facebook.com/gzv.one",
  address: "279 Nguyá»…n Tri PhÆ°Æ¡ng, PhÆ°á»ng DiÃªn Há»“ng, TP.Há»“ ChÃ­ Minh",
  phone_label: "Äiá»‡n Thoáº¡i: (+84) 329 381 489",
  phone_url: "tel:+84329381489",
  email_label: "Email: gzv.one@gmail.com",
  email_url: "mailto:gzv.one@gmail.com",
  newsletter_title: "Káº¿t ná»‘i vá»›i chÃºng tÃ´i",
  newsletter_description: "ÄÄƒng kÃ½ Ä‘á»ƒ nháº­n thÃ´ng tin vá» cÃ¡c khÃ³a há»c vÃ  sá»± kiá»‡n má»›i nháº¥t.",
  copyright_text: "gzv Center. PhÃ¡t triá»ƒn bá»Ÿi PhÃ²ng CÃ´ng nghá»‡ thÃ´ng tin.",
  links: [],
  social_links: [],
}

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
  const [pickerOpen, setPickerOpen] = useState<"banner" | "builderBanner" | "loadingLogo" | "footerLogo" | "headerLogo" | "brandFooterLogo" | "favicon" | "ogImage" | "heroVideo" | "heroPoster" | { floatingIndex: number } | null>(null)

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
        toast.error(error.message || "KhÃ´ng táº£i Ä‘Æ°á»£c cáº¥u hÃ¬nh website. HÃ£y cháº¡y file SQL má»›i trÆ°á»›c.")
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
      toast.error(error.message || "KhÃ´ng lÆ°u Ä‘Æ°á»£c")
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
    toast.success("ÄÃ£ náº¡p menu GZV má»›i. Báº¥m LÆ°u menu header Ä‘á»ƒ ghi lÃªn Supabase.")
  }

  const addNavItem = () => {
    setNavItems((items) => [
      ...items,
      {
        href: "/trang-moi",
        label_vi: "TRANG Má»šI",
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
    else toast.success("ÄÃ£ xÃ³a menu header")
  }

  const addPage = () => {
    const slug = `trang-moi-${Date.now()}`
    setPages((items) => [
      ...items,
      {
        slug,
        title: "Trang má»›i",
        menu_title: "Trang má»›i",
        banner_badge: "GZV",
        banner_title: "Trang má»›i",
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
    else toast.success("ÄÃ£ xÃ³a trang vÃ  block liÃªn quan")
  }

  const addHomeSection = () => {
    const key = `section-${Date.now()}`
    setHomeSections((items) => [
      ...items,
      {
        section_key: key,
        title: "Section má»›i",
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
    else toast.success("ÄÃ£ xÃ³a section trang chá»§")
  }

  const deleteFloatingAction = async (index: number) => {
    const item = floating[index]
    setFloating((rows) => rows.filter((_, i) => i !== index))
    if (!item?.action_key) return
    const { error } = await supabase.from("site_floating_actions").delete().eq("action_key", item.action_key)
    if (error) toast.error(error.message)
    else toast.success("ÄÃ£ xÃ³a floating action")
  }

  const saveNavigation = () => saveRows("site_navigation", navItems, "href", "ÄÃ£ lÆ°u menu header")
  const savePage = () => selectedPage && saveRows("site_pages", [selectedPage], "slug", "ÄÃ£ lÆ°u ná»™i dung trang")
  const saveHomeSections = () => saveRows("site_home_sections", homeSections, "section_key", "ÄÃ£ lÆ°u section trang chá»§")
  const saveFloating = () => saveRows("site_floating_actions", floating, "action_key", "ÄÃ£ lÆ°u floating buttons")
  const saveBlocks = () => saveRows("site_page_blocks", pageBlocks, "page_slug,block_key", "ÄÃ£ lÆ°u page builder")

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
      toast.success("ÄÃ£ lÆ°u layout, thá»© tá»± section vÃ  slug trang")
    } catch (error: any) {
      toast.error(error.message || "KhÃ´ng lÆ°u Ä‘Æ°á»£c layout trang")
    } finally {
      setSaving(false)
    }
  }

  const saveBranding = async () => {
    try {
      setSaving(true)
      const { error } = await supabase.from("site_branding_settings").upsert(branding, { onConflict: "id" })
      if (error) throw error
      toast.success("ÄÃ£ lÆ°u branding, favicon vÃ  SEO máº·c Ä‘á»‹nh")
    } catch (error: any) {
      toast.error(error.message || "KhÃ´ng lÆ°u Ä‘Æ°á»£c branding")
    } finally {
      setSaving(false)
    }
  }

  const saveFooter = async () => {
    try {
      setSaving(true)
      const { error } = await supabase.from("site_footer_settings").upsert(footer, { onConflict: "id" })
      if (error) throw error
      toast.success("ÄÃ£ lÆ°u footer")
    } catch (error: any) {
      toast.error(error.message || "KhÃ´ng lÆ°u Ä‘Æ°á»£c footer")
    } finally {
      setSaving(false)
    }
  }

  const saveLoading = async () => {
    try {
      setSaving(true)
      const { error } = await supabase.from("site_loading_settings").upsert(loadingSettings, { onConflict: "id" })
      if (error) throw error
      toast.success("ÄÃ£ lÆ°u trang loading")
    } catch (error: any) {
      toast.error(error.message || "KhÃ´ng lÆ°u Ä‘Æ°á»£c loading")
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
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Äang táº£i cáº¥u hÃ¬nh website...</div>
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 md:p-6">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0b0b0b]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="border-l-4 border-[#ed1c24] pl-3 text-xs font-black uppercase tracking-wide text-[#ed1c24]">Website Control Center</p>
            <h1 className="mt-3 text-3xl font-black uppercase text-slate-950 dark:text-white">Äiá»u khiá»ƒn toÃ n bá»™ website</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">
              Chá»‰nh header, branding, tá»«ng trang, tá»«ng section trang chá»§, page builder, footer, floating buttons vÃ  loading screen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={seedDefaultNavigation} className="rounded-none border-[#ed1c24] text-[#ed1c24]">
              <RotateCcw className="mr-2 h-4 w-4" /> Seed menu GZV
            </Button>
            <Button onClick={saveNavigation} disabled={saving} className="rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218]">
              <Save className="mr-2 h-4 w-4" /> LÆ°u header
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
          <TabsTrigger value="home">Trang chá»§</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="navigation">Header</TabsTrigger>
          <TabsTrigger value="pages">Trang</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="floating">Floating</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Card>
              <CardHeader><CardTitle>Trang</CardTitle><CardDescription>Chá»n trang Ä‘á»ƒ náº¡p block layout.</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                <Button type="button" variant="outline" onClick={addPage} className="mb-2 w-full rounded-none">
                  <Plus className="mr-2 h-4 w-4" /> Trang má»›i
                </Button>
                {[...new Set([...pages.map((p) => p.slug), ...pageBlocks.map((b) => b.page_slug)])].map((slug) => (
                  <button key={slug} onClick={() => setBuilderSlug(slug)} className={`w-full rounded-none px-3 py-2 text-left text-sm font-bold ${builderSlug === slug ? "bg-[#ed1c24] text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>{slug}</button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Page Builder: /{builderSlug}</CardTitle>
                <CardDescription>KÃ©o tháº£ phiÃªn báº£n nháº¹: Ä‘á»•i thá»© tá»± báº±ng sá»‘, thÃªm template, sá»­a JSON props, HTML, slug trang vÃ  áº©n/hiá»‡n block.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="mb-4 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Cau hinh trang dang edit</p>
                      <p className="text-sm text-slate-500">Doi slug, title tab, SEO, banner va trang thai public cho tung trang.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Slug trang">
                      <Input value={builderSlug} onChange={(event) => renameBuilderSlug(event.target.value)} placeholder="vi-du-slug" />
                    </Field>
                    <SwitchLine label="Hien trang public" checked={builderPage?.is_visible !== false} onChange={(value) => updateBuilderPage({ is_visible: value })} />
                    <Field label="Ten trang"><Input value={builderPage?.title || ""} onChange={(event) => updateBuilderPage({ title: event.target.value })} /></Field>
                    <Field label="Title tab / SEO"><Input value={(builderPage as any)?.seo_title || ""} onChange={(event) => updateBuilderPage({ seo_title: event.target.value } as any)} /></Field>
                    <Field label="Tieu de banner"><Input value={builderPage?.banner_title || ""} onChange={(event) => updateBuilderPage({ banner_title: event.target.value })} /></Field>
                    <Field label="Anh banner"><PickerInput value={builderPage?.banner_image_url || ""} onChange={(value) => updateBuilderPage({ banner_image_url: value })} onPick={() => setPickerOpen("builderBanner")} /></Field>
                  </div>
                  <Field label="Meta description">
                    <Textarea value={(builderPage as any)?.seo_description || ""} onChange={(event) => updateBuilderPage({ seo_description: event.target.value } as any)} />
                  </Field>
                </div>

                <div className="flex flex-wrap gap-2">
                  {templates.map((template) => (
                    <Button
                      key={template.template_key}
                      type="button"
                      variant="outline"
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
                  <div key={`${block.page_slug}-${block.block_key}-${index}`} className="space-y-3 rounded-2xl border bg-white p-4 dark:bg-slate-900">
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_0.5fr_auto]">
                      <Field label="Page slug"><Input value={block.page_slug} onChange={(e) => updateBlock(index, { page_slug: e.target.value })} /></Field>
                      <Field label="Block key"><Input value={block.block_key} onChange={(e) => updateBlock(index, { block_key: e.target.value })} /></Field>
                      <Field label="Component"><Input value={block.component_type} onChange={(e) => updateBlock(index, { component_type: e.target.value })} /></Field>
                      <Field label="Thá»© tá»±"><Input type="number" value={block.sort_order} onChange={(e) => updateBlock(index, { sort_order: Number(e.target.value) })} /></Field>
                      <div className="flex items-end gap-2">
                        <Button type="button" variant="outline" size="icon" disabled={position === 0} onClick={() => moveBlock(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
                        <Button type="button" variant="outline" size="icon" disabled={position === builderBlocks.length - 1} onClick={() => moveBlock(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
                        <Button type="button" variant="outline" size="icon" onClick={() => duplicateBlock(block)}><Copy className="h-4 w-4" /></Button>
                        <Switch checked={block.is_visible} onCheckedChange={(v) => updateBlock(index, { is_visible: v })} />
                        <Button variant="destructive" size="icon" onClick={() => setPageBlocks((rows) => rows.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <Field label="TÃªn block"><Input value={block.title || ""} onChange={(e) => updateBlock(index, { title: e.target.value })} /></Field>
                    <PropsEditor value={block.props || {}} onChange={(props) => updateBlock(index, { props })} />
                    <Field label="Rich HTML cá»§a block">
                      <GZVRichEditor value={block.content_html || ""} onChange={(html) => updateBlock(index, { content_html: html })} minHeight={260} uploadFolder={`blocks/${builderSlug}`} />
                    </Field>
                  </div>
                ))}
                <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border bg-white/95 p-3 shadow-xl backdrop-blur dark:bg-slate-950/95">
                  <Button onClick={saveBuilderLayout} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> Luu layout trang nay</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader><CardTitle>Branding, favicon vÃ  SEO máº·c Ä‘á»‹nh</CardTitle><CardDescription>Chá»‰nh title tab, template title, header logo, footer logo, favicon vÃ  meta máº·c Ä‘á»‹nh.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="TÃªn site"><Input value={branding.site_name} onChange={(e) => setBranding({ ...branding, site_name: e.target.value })} /></Field>
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
              <Button onClick={saveBranding} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> LÆ°u branding</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="home">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <ListCard title="Section trang chá»§">
              <Button type="button" variant="outline" onClick={addHomeSection} className="mb-2 w-full rounded-none">
                <Plus className="mr-2 h-4 w-4" /> ThÃªm section
              </Button>
              {homeSections.map((section) => (
                <button key={section.section_key} onClick={() => setSelectedSectionKey(section.section_key)} className={`flex w-full items-center justify-between rounded-none px-3 py-2 text-left text-sm font-bold transition ${selectedSectionKey === section.section_key ? "bg-[#ed1c24] text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                  <span>{section.title}</span>
                  {section.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              ))}
            </ListCard>
            {selectedSection && (
              <Card>
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle>Chá»‰nh section: {selectedSection.title}</CardTitle>
                    <CardDescription>Báº­t táº¯t, Ä‘á»•i tiÃªu Ä‘á», mÃ´ táº£, nÃºt vÃ  sá»‘ lÆ°á»£ng item trÃªn trang chá»§.</CardDescription>
                  </div>
                  <Button type="button" variant="destructive" className="rounded-none" onClick={() => deleteHomeSection(selectedSection.section_key)}>
                    <Trash2 className="mr-2 h-4 w-4" /> XÃ³a section
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Key"><Input value={selectedSection.section_key} disabled /></Field>
                    <SwitchLine label="Hiá»‡n section" checked={selectedSection.is_visible} onChange={(v) => updateSection({ is_visible: v })} />
                    <Field label="TiÃªu Ä‘á»"><Input value={selectedSection.title || ""} onChange={(e) => updateSection({ title: e.target.value })} /></Field>
                    <Field label="Thá»© tá»±"><Input type="number" value={selectedSection.sort_order} onChange={(e) => updateSection({ sort_order: Number(e.target.value) })} /></Field>
                    <Field label="Label nÃºt"><Input value={selectedSection.button_label || ""} onChange={(e) => updateSection({ button_label: e.target.value })} /></Field>
                    <Field label="Link nÃºt"><Input value={selectedSection.button_url || ""} onChange={(e) => updateSection({ button_url: e.target.value })} /></Field>
                    <Field label="Sá»‘ item"><Input type="number" value={selectedSection.item_limit} onChange={(e) => updateSection({ item_limit: Number(e.target.value) })} /></Field>
                  </div>
                  <Field label="Phá»¥ Ä‘á»"><Textarea value={selectedSection.subtitle || ""} onChange={(e) => updateSection({ subtitle: e.target.value })} /></Field>
                  <Field label="MÃ´ táº£"><Textarea value={selectedSection.description || ""} onChange={(e) => updateSection({ description: e.target.value })} /></Field>
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
                  <Button onClick={saveHomeSections} disabled={saving} className="gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218]"><Save className="h-4 w-4" /> LÆ°u section trang chá»§</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="navigation">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> Menu header</CardTitle><CardDescription>Äá»•i tiÃªu Ä‘á», thá»© tá»±, áº©n khá»i header hoáº·c khÃ³a háº³n trang public.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={seedDefaultNavigation} className="rounded-none">
                  <RotateCcw className="mr-2 h-4 w-4" /> Náº¡p cáº¥u trÃºc GZV
                </Button>
                <Button type="button" variant="outline" onClick={addNavItem} className="rounded-none">
                  <Plus className="mr-2 h-4 w-4" /> ThÃªm menu
                </Button>
              </div>
              {navItems.map((item, index) => (
                <div key={`${item.href}-${index}`} className="grid gap-3 rounded-none border bg-white p-4 md:grid-cols-[1.2fr_1.2fr_0.7fr_0.7fr_0.7fr_auto] dark:bg-slate-900">
                  <Field label="ÄÆ°á»ng dáº«n"><Input value={item.href} onChange={(e) => updateNav(index, { href: e.target.value })} /></Field>
                  <Field label="TiÃªu Ä‘á» header"><Input value={item.label_vi} onChange={(e) => updateNav(index, { label_vi: e.target.value })} /></Field>
                  <Field label="Thá»© tá»±"><Input type="number" value={item.sort_order} onChange={(e) => updateNav(index, { sort_order: Number(e.target.value) })} /></Field>
                  <SwitchLine label="Hiá»‡n menu" checked={item.is_visible} onChange={(v) => updateNav(index, { is_visible: v })} />
                  <SwitchLine label="Má»Ÿ trang" checked={item.is_page_enabled} onChange={(v) => updateNav(index, { is_page_enabled: v })} />
                  <div className="flex items-end">
                    <Button type="button" variant="destructive" size="icon" className="rounded-none" onClick={() => deleteNavItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button onClick={saveNavigation} disabled={saving} className="gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218]"><Save className="h-4 w-4" /> LÆ°u menu header</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <ListCard title="Danh sÃ¡ch trang">
              <Button type="button" variant="outline" onClick={addPage} className="mb-2 w-full rounded-none">
                <Plus className="mr-2 h-4 w-4" /> ThÃªm trang
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
                    <CardTitle>Chá»‰nh trang: {selectedPage.title}</CardTitle>
                    <CardDescription>Banner Ã¡p dá»¥ng cho PageBanner. Ná»™i dung HTML sáº½ Ä‘Æ°á»£c chÃ¨n thÃªm cuá»‘i trang public.</CardDescription>
                  </div>
                  <Button type="button" variant="destructive" className="rounded-none" onClick={deleteSelectedPage}>
                    <Trash2 className="mr-2 h-4 w-4" /> XÃ³a trang
                  </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Slug"><Input value={selectedPage.slug} disabled /></Field>
                    <SwitchLine label="Hiá»‡n trang" checked={selectedPage.is_visible} onChange={(v) => updatePage({ is_visible: v })} />
                    <Field label="TÃªn trang"><Input value={selectedPage.title || ""} onChange={(e) => updatePage({ title: e.target.value })} /></Field>
                    <Field label="TiÃªu Ä‘á» menu gá»£i Ã½"><Input value={selectedPage.menu_title || ""} onChange={(e) => updatePage({ menu_title: e.target.value })} /></Field>
                    <Field label="Badge banner"><Input value={selectedPage.banner_badge || ""} onChange={(e) => updatePage({ banner_badge: e.target.value })} /></Field>
                    <Field label="TiÃªu Ä‘á» banner"><Input value={selectedPage.banner_title || ""} onChange={(e) => updatePage({ banner_title: e.target.value })} /></Field>
                  </div>
                  <Field label="Phá»¥ Ä‘á» banner"><Textarea value={selectedPage.banner_subtitle || ""} onChange={(e) => updatePage({ banner_subtitle: e.target.value })} /></Field>
                  <Field label="MÃ´ táº£ banner"><Textarea value={selectedPage.banner_description || ""} onChange={(e) => updatePage({ banner_description: e.target.value })} /></Field>
                  <Field label="áº¢nh banner">
                    <div className="flex gap-2">
                      <Input value={selectedPage.banner_image_url || ""} onChange={(e) => updatePage({ banner_image_url: e.target.value })} placeholder="URL áº£nh banner" />
                      <Button type="button" variant="outline" onClick={() => setPickerOpen("banner")}><ImageIcon className="mr-2 h-4 w-4" /> Chá»n áº£nh</Button>
                    </div>
                  </Field>
                  <Field label="Ná»™i dung thÃªm cá»§a trang">
                    <GZVRichEditor value={selectedPage.content_html || ""} onChange={(html) => updatePage({ content_html: html })} minHeight={420} uploadFolder={`pages/${selectedPage.slug}`} />
                  </Field>
                  <Button onClick={savePage} disabled={saving} className="gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218]"><Save className="h-4 w-4" /> LÆ°u trang</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardHeader><CardTitle>Footer</CardTitle><CardDescription>Chá»‰nh logo, thÃ´ng tin liÃªn há»‡, mÃ u ná»n, link cuá»‘i trang vÃ  social.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Logo footer"><div className="flex gap-2"><Input value={footer.logo_url} onChange={(e) => setFooter({ ...footer, logo_url: e.target.value })} /><Button variant="outline" onClick={() => setPickerOpen("footerLogo")}><ImageIcon className="h-4 w-4" /></Button></div></Field>
                <Field label="Intro"><Input value={footer.intro_text} onChange={(e) => setFooter({ ...footer, intro_text: e.target.value })} /></Field>
                <Field label="MÃ u ná»n"><Input type="color" value={footer.background_color} onChange={(e) => setFooter({ ...footer, background_color: e.target.value })} /></Field>
                <Field label="MÃ u Ä‘Ã¡y footer"><Input type="color" value={footer.bottom_background_color} onChange={(e) => setFooter({ ...footer, bottom_background_color: e.target.value })} /></Field>
                <Field label="Facebook page"><Input value={footer.facebook_page_url || ""} onChange={(e) => setFooter({ ...footer, facebook_page_url: e.target.value })} /></Field>
                <Field label="Äá»‹a chá»‰"><Input value={footer.address || ""} onChange={(e) => setFooter({ ...footer, address: e.target.value })} /></Field>
                <Field label="Phone label"><Input value={footer.phone_label || ""} onChange={(e) => setFooter({ ...footer, phone_label: e.target.value })} /></Field>
                <Field label="Phone URL"><Input value={footer.phone_url || ""} onChange={(e) => setFooter({ ...footer, phone_url: e.target.value })} /></Field>
                <Field label="Email label"><Input value={footer.email_label || ""} onChange={(e) => setFooter({ ...footer, email_label: e.target.value })} /></Field>
                <Field label="Email URL"><Input value={footer.email_url || ""} onChange={(e) => setFooter({ ...footer, email_url: e.target.value })} /></Field>
                <Field label="Newsletter title"><Input value={footer.newsletter_title || ""} onChange={(e) => setFooter({ ...footer, newsletter_title: e.target.value })} /></Field>
                <Field label="Copyright"><Input value={footer.copyright_text || ""} onChange={(e) => setFooter({ ...footer, copyright_text: e.target.value })} /></Field>
              </div>
              <Field label="Newsletter mÃ´ táº£"><Textarea value={footer.newsletter_description || ""} onChange={(e) => setFooter({ ...footer, newsletter_description: e.target.value })} /></Field>
              <EditableLinks title="Link footer" rows={footer.links} onChange={(links) => setFooter({ ...footer, links })} />
              <EditableLinks title="Social footer" rows={footer.social_links} onChange={(social_links) => setFooter({ ...footer, social_links })} withIcon />
              <Button onClick={saveFooter} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> LÆ°u footer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="floating">
          <Card>
            <CardHeader><CardTitle>Floating chat/buttons</CardTitle><CardDescription>Chá»‰nh label, link, icon, thá»© tá»± vÃ  báº­t/táº¯t tá»«ng nÃºt ná»•i.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {floating.map((item, index) => (
                <div key={item.action_key} className="grid gap-3 rounded-none border bg-white p-4 md:grid-cols-[1fr_1fr_1fr_0.7fr_0.7fr_auto] dark:bg-slate-900">
                  <Field label="Key"><Input value={item.action_key} onChange={(e) => updateFloating(index, { action_key: e.target.value })} /></Field>
                  <Field label="Label"><Input value={item.label} onChange={(e) => updateFloating(index, { label: e.target.value })} /></Field>
                  <Field label="Href"><Input value={item.href || ""} onChange={(e) => updateFloating(index, { href: e.target.value })} /></Field>
                  <Field label="Type"><Select value={item.action_type} onValueChange={(v: "link" | "chatbot") => updateFloating(index, { action_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="link">Link</SelectItem><SelectItem value="chatbot">Chatbot</SelectItem></SelectContent></Select></Field>
                  <Field label="Thá»© tá»±"><Input type="number" value={item.sort_order} onChange={(e) => updateFloating(index, { sort_order: Number(e.target.value) })} /></Field>
                  <div className="flex items-end gap-2"><Switch checked={item.is_visible} onCheckedChange={(v) => updateFloating(index, { is_visible: v })} /><Button variant="outline" size="icon" className="rounded-none" onClick={() => setPickerOpen({ floatingIndex: index })}><ImageIcon className="h-4 w-4" /></Button><Button variant="destructive" size="icon" className="rounded-none" onClick={() => deleteFloatingAction(index)}><Trash2 className="h-4 w-4" /></Button></div>
                </div>
              ))}
              <Button variant="outline" className="rounded-none" onClick={() => setFloating((rows) => [...rows, { action_key: `action-${Date.now()}`, label: "NÃºt má»›i", href: "", icon_url: "", action_type: "link", sort_order: rows.length * 10 + 10, is_visible: true }])}><Plus className="mr-2 h-4 w-4" /> ThÃªm nÃºt</Button>
              <Button onClick={saveFloating} disabled={saving} className="ml-2 gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218]"><Save className="h-4 w-4" /> LÆ°u floating</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loading">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MonitorCog className="h-5 w-5" /> Trang loading public</CardTitle><CardDescription>Hiá»ƒn thá»‹ khi ngÆ°á»i dÃ¹ng má»›i vÃ o website vÃ  khi chuyá»ƒn trang chá» dá»¯ liá»‡u Ä‘á»• lÃªn.</CardDescription></CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <SwitchLine label="Báº­t loading" checked={loadingSettings.enabled} onChange={(v) => setLoadingSettings({ ...loadingSettings, enabled: v })} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="TiÃªu Ä‘á»"><Input value={loadingSettings.title} onChange={(e) => setLoadingSettings({ ...loadingSettings, title: e.target.value })} /></Field>
                  <Field label="DÃ²ng mÃ´ táº£"><Input value={loadingSettings.subtitle} onChange={(e) => setLoadingSettings({ ...loadingSettings, subtitle: e.target.value })} /></Field>
                  <Field label="Hiá»‡u á»©ng"><Select value={loadingSettings.effect} onValueChange={(effect: LoadingSettings["effect"]) => setLoadingSettings({ ...loadingSettings, effect })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="orbit">Orbit</SelectItem><SelectItem value="pulse">Pulse</SelectItem><SelectItem value="bars">Bars</SelectItem></SelectContent></Select></Field>
                  <Field label="Thá»i gian tá»‘i thiá»ƒu ms"><Input type="number" min={0} max={6000} value={loadingSettings.minimum_duration_ms} onChange={(e) => setLoadingSettings({ ...loadingSettings, minimum_duration_ms: Number(e.target.value) })} /></Field>
                  <Field label="MÃ u ná»n 1"><Input type="color" value={loadingSettings.background_from} onChange={(e) => setLoadingSettings({ ...loadingSettings, background_from: e.target.value })} /></Field>
                  <Field label="MÃ u ná»n 2"><Input type="color" value={loadingSettings.background_to} onChange={(e) => setLoadingSettings({ ...loadingSettings, background_to: e.target.value })} /></Field>
                  <Field label="MÃ u nháº¥n"><Input type="color" value={loadingSettings.accent_color} onChange={(e) => setLoadingSettings({ ...loadingSettings, accent_color: e.target.value })} /></Field>
                  <Field label="Logo"><div className="flex gap-2"><Input value={loadingSettings.logo_url} onChange={(e) => setLoadingSettings({ ...loadingSettings, logo_url: e.target.value })} /><Button variant="outline" onClick={() => setPickerOpen("loadingLogo")}><ImageIcon className="h-4 w-4" /></Button></div></Field>
                </div>
                <Button onClick={saveLoading} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> LÆ°u loading</Button>
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

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ä‘/g, "d")
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

function ListCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-2">{children}</CardContent></Card>
}

function EditableLinks({ title, rows, onChange, withIcon = false }: { title: string; rows: any[]; onChange: (rows: any[]) => void; withIcon?: boolean }) {
  const update = (index: number, patch: any) => onChange(rows.map((row, i) => i === index ? { ...row, ...patch } : row))
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between"><Label>{title}</Label><Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, { label: "Link má»›i", href: "", icon: "", visible: true }])}><Plus className="mr-2 h-4 w-4" /> ThÃªm</Button></div>
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

