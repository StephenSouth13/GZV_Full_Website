"use client"

import { useEffect, useMemo, useState } from "react"
import { ProtectedRoute } from "@/components/admin/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaPickerDialog } from "@/components/media/MediaPickerDialog"
import { EditMenuDialog } from "@/components/admin/site-content/EditMenuDialog"
import { HeaderFooterSeoTab } from "@/components/admin/site-content/HeaderFooterSeoTab"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Bot,
  ImageIcon,
  LayoutTemplate,
  Loader2,
  Menu,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
} from "lucide-react"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"

import type {
  NavItem,
  PageContent,
  HomeSection,
  LoadingSettings,
  FooterSettings,
  FloatingAction,
  BrandingSettings,
  SectionTemplate,
  PageBlock,
} from "@/components/admin/site-content/types"

import {
  defaultNav,
  defaultHomeSections,
  fallbackTemplates,
  defaultLoading,
  defaultBranding,
  defaultFooter,
  defaultBannerConfig,
  defaultPageBlocks,
  normalizeSlug,
} from "@/components/admin/site-content/defaults"

import { ControlStat } from "@/components/admin/site-content/helpers/BasicHelpers"
import { MenuNavigationTab } from "@/components/admin/site-content/tabs/MenuNavigationTab"
import { HomeSectionsTab } from "@/components/admin/site-content/tabs/HomeSectionsTab"
import { PageBuilderTab } from "@/components/admin/site-content/tabs/PageBuilderTab"
import { BannerHeroTab } from "@/components/admin/site-content/tabs/BannerHeroTab"
import { FloatingActionsTab } from "@/components/admin/site-content/tabs/FloatingActionsTab"
import { LoadingScreenTab } from "@/components/admin/site-content/tabs/LoadingScreenTab"

function SiteContentManager() {
  const [activeTab, setActiveTab] = useState("menu")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Navigation & Pages State
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNav)
  const [pages, setPages] = useState<PageContent[]>([])
  const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string>("gioi-thieu")

  // Home Sections State
  const [homeSections, setHomeSections] = useState<HomeSection[]>(defaultHomeSections)
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("hero")

  // Page Builder State
  const [builderSlug, setBuilderSlug] = useState<string>("gioi-thieu")
  const [pageBlocks, setPageBlocks] = useState<PageBlock[]>([])
  const [templates, setTemplates] = useState<SectionTemplate[]>(fallbackTemplates)
  const [selectedBlockKey, setSelectedBlockKey] = useState<string | null>(null)
  const [slugRenames, setSlugRenames] = useState<Record<string, string>>({})

  // Global Settings State
  const [loadingSettings, setLoadingSettings] = useState<LoadingSettings>(defaultLoading)
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding)
  const [footer, setFooter] = useState<FooterSettings>(defaultFooter)
  const [floating, setFloating] = useState<FloatingAction[]>([])
  const [globalBannerConfig, setGlobalBannerConfig] = useState<any>(defaultBannerConfig)
  const [syncAllBanners, setSyncAllBanners] = useState(true)
  const [selectedPageForPreview, setSelectedPageForPreview] = useState<string>("du-an")
  const [pickerOpen, setPickerOpen] = useState<any>(null)

  // Sensors for Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Derived Values
  const selectedSection = useMemo(
    () => homeSections.find((s) => s.section_key === selectedSectionKey) || homeSections[0],
    [homeSections, selectedSectionKey]
  )

  const orderedHomeSections = useMemo(() => {
    return homeSections
      .map((section, index) => ({ section, index }))
      .sort((a, b) => a.section.sort_order - b.section.sort_order)
  }, [homeSections])

  const builderPage = useMemo(() => pages.find((p) => p.slug === builderSlug) || null, [pages, builderSlug])

  const builderBlocks = useMemo(() => {
    return pageBlocks
      .map((block, index) => ({ block, index }))
      .filter(({ block }) => block.page_slug === builderSlug && block.component_type !== "page_banner")
      .sort((a, b) => a.block.sort_order - b.block.sort_order)
  }, [pageBlocks, builderSlug])

  const activeBlockItem = useMemo(() => {
    if (!selectedBlockKey) return builderBlocks[0]
    return builderBlocks.find(({ block }) => block.block_key === selectedBlockKey) || builderBlocks[0]
  }, [builderBlocks, selectedBlockKey])

  const selectedPageObj = useMemo(
    () => pages.find((p) => p.slug === selectedPageForPreview) || pages[0] || null,
    [pages, selectedPageForPreview]
  )

  // Fetch Data from Supabase
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [
          navResult,
          pagesResult,
          loadingResult,
          sectionsResult,
          footerResult,
          floatingResult,
          brandingResult,
          templatesResult,
          blocksResult,
        ] = await Promise.all([
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

        let nextNav: NavItem[] = defaultNav
        if (navResult.data?.length) {
          const rawNav = navResult.data as NavItem[]
          const parentNavs = rawNav.filter((n) => !n.parent_href)
          const childNavs = rawNav.filter((n) => !!n.parent_href)
          nextNav = parentNavs.map((parent) => {
            const children = childNavs.filter((c) => c.parent_href === parent.href)
            return children.length > 0 ? { ...parent, children } : parent
          })
          if (!nextNav.some((item) => item.href === "/")) {
            nextNav.unshift(defaultNav[0])
          }
        }
        setNavItems(nextNav)

        let nextPages = ((pagesResult.data || []) as PageContent[]).filter(
          (p) => p.slug !== "dong-hanh" && p.slug !== "mentors" && p.slug !== "mentor"
        )
        const fetchedBrandingRaw = (brandingResult.data || {}) as any
        let headerMetaRaw: any = {}
        try {
          if (fetchedBrandingRaw.default_keywords && fetchedBrandingRaw.default_keywords.startsWith("{")) {
            headerMetaRaw = JSON.parse(fetchedBrandingRaw.default_keywords)
          }
        } catch (e) {
          headerMetaRaw = {}
        }
        const pageBannersConfig = headerMetaRaw.page_banners || {}
        nextPages = nextPages.map((p) => {
          const cfg = pageBannersConfig[p.slug] || {}
          return {
            ...p,
            show_badge: cfg.show_badge !== undefined ? cfg.show_badge : (p.show_badge !== undefined ? p.show_badge : true),
            show_title: cfg.show_title !== undefined ? cfg.show_title : (p.show_title !== undefined ? p.show_title : true),
            show_subtitle: cfg.show_subtitle !== undefined ? cfg.show_subtitle : (p.show_subtitle !== undefined ? p.show_subtitle : true),
          }
        })
        setPages(nextPages)
        setSelectedSlug(nextPages[0]?.slug || "gioi-thieu")
        const validHomeKeys = ["hero", "about_gzv", "projects", "services_three", "about_boxes", "partners", "news"]
        const rawFetchedSections = (sectionsResult.data || []).filter((s: any) => validHomeKeys.includes(s.section_key)) as HomeSection[]
        const mergedHomeSections = defaultHomeSections.map((defSec) => {
          const found = rawFetchedSections.find((s) => s.section_key === defSec.section_key)
          if (!found) return defSec
          return {
            ...defSec,
            ...found,
            settings: { ...(defSec.settings || {}), ...(found.settings || {}) },
          }
        })
        setHomeSections(mergedHomeSections)

        if (loadingResult.data) setLoadingSettings({ ...defaultLoading, ...loadingResult.data })

        const fetchedFooter = (footerResult.data || {}) as any
        const rawSocial = Array.isArray(fetchedFooter.social_links) ? fetchedFooter.social_links : []
        const contactPersonMeta = rawSocial.find((s: any) => s && s._meta === "contact_person_info") || {}

        setFooter({
          ...defaultFooter,
          ...fetchedFooter,
          contact_person: contactPersonMeta.contact_person || "",
          contact_person_phone: contactPersonMeta.contact_person_phone || "",
          contact_person_email: contactPersonMeta.contact_person_email || "",
          social_facebook: contactPersonMeta.social_facebook || "",
          social_youtube: contactPersonMeta.social_youtube || "",
          social_instagram: contactPersonMeta.social_instagram || "",
          social_tiktok: contactPersonMeta.social_tiktok || "",
          terms_url: contactPersonMeta.terms_url || fetchedFooter.terms_url || "/terms",
          privacy_url: contactPersonMeta.privacy_url || fetchedFooter.privacy_url || "/privacy",
          show_terms: contactPersonMeta.show_terms !== undefined ? contactPersonMeta.show_terms : true,
          show_privacy: contactPersonMeta.show_privacy !== undefined ? contactPersonMeta.show_privacy : true,
          footer_bg_color: fetchedFooter.background_color || "",
          footer_text_color: fetchedFooter.footer_text_color || "",
          footer_link_color: fetchedFooter.footer_link_color || "",
        })

        if (floatingResult.data) setFloating((floatingResult.data || []) as FloatingAction[])

        const fetchedBranding = (brandingResult.data || {}) as any
        let headerMeta: any = {}
        try {
          if (fetchedBranding.default_keywords && fetchedBranding.default_keywords.startsWith("{")) {
            headerMeta = JSON.parse(fetchedBranding.default_keywords)
          }
        } catch (e) {
          headerMeta = {}
        }

        setBranding({
          ...defaultBranding,
          ...fetchedBranding,
          show_topbar: headerMeta.show_topbar !== undefined ? headerMeta.show_topbar : true,
          show_topbar_email: headerMeta.show_topbar_email !== undefined ? headerMeta.show_topbar_email : true,
          show_topbar_phone: headerMeta.show_topbar_phone !== undefined ? headerMeta.show_topbar_phone : true,
          show_topbar_badge: headerMeta.show_topbar_badge !== undefined ? headerMeta.show_topbar_badge : true,
          topbar_bg_color: headerMeta.topbar_bg_color || "#050505",
          topbar_text_color: headerMeta.topbar_text_color || "#ffffff",
          topbar_email_label: fetchedBranding.topbar_email_label || "gzv.one@gmail.com",
          topbar_phone_label: fetchedBranding.topbar_phone_label || "(+84) 329 381 489",
          topbar_badge_label: fetchedBranding.topbar_badge_label || "GZV",
          header_bg_color: headerMeta.header_bg_color || fetchedBranding.header_bg_color || "",
          header_text_color: headerMeta.header_text_color || fetchedBranding.header_text_color || "",
          header_site_name: headerMeta.header_site_name || fetchedBranding.header_site_name || fetchedBranding.site_name || "GZV CENTER",
          show_logo: headerMeta.show_logo !== undefined ? headerMeta.show_logo : (fetchedBranding.show_logo !== false),
          author: headerMeta.author || fetchedBranding.author || "GZV Center",
          canonical_url: headerMeta.canonical_url || fetchedBranding.canonical_url || "https://www.gzv.one",
          og_title: headerMeta.og_title || fetchedBranding.og_title || "",
          og_description: headerMeta.og_description || fetchedBranding.og_description || "",
          og_url: headerMeta.og_url || fetchedBranding.og_url || "",
        })
        setTemplates((templatesResult.data || []) as SectionTemplate[])

        const fetchedBlocks = ((blocksResult.data || []) as PageBlock[]).filter((b) => b.component_type !== "page_banner")
        const existingSlugs = new Set(fetchedBlocks.map((b) => b.page_slug))
        const mergedBlocks = [...fetchedBlocks]

        defaultPageBlocks.forEach((defBlock) => {
          if (!existingSlugs.has(defBlock.page_slug)) {
            mergedBlocks.push(defBlock)
          }
        })

        setPageBlocks(mergedBlocks)

        if (headerMeta.global_banner) {
          setGlobalBannerConfig({ ...defaultBannerConfig, ...headerMeta.global_banner })
        }

        if (typeof headerMeta.sync_all_banners === "boolean") {
          setSyncAllBanners(headerMeta.sync_all_banners)
        }
      } catch (error: any) {
        toast.error(error.message || "Không tải được cấu hình website.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // DB Save Functions
  const saveNavigation = async () => {
    try {
      setSaving(true)
      const flatList: NavItem[] = []

      navItems.forEach((parent, pIdx) => {
        flatList.push({
          href: parent.href,
          label_vi: parent.label_vi,
          label_en: parent.label_en || "",
          parent_href: null,
          sort_order: (pIdx + 1) * 10,
          is_visible: parent.is_visible,
          is_page_enabled: parent.is_page_enabled !== false,
          is_external: parent.is_external || false,
        })

        if (parent.children && parent.children.length > 0) {
          parent.children.forEach((child, cIdx) => {
            flatList.push({
              href: child.href,
              label_vi: child.label_vi,
              label_en: child.label_en || "",
              parent_href: parent.href,
              sort_order: (cIdx + 1) * 10,
              is_visible: child.is_visible,
              is_page_enabled: child.is_page_enabled !== false,
              is_external: child.is_external || false,
            })
          })
        }
      })

      const { error: delError } = await supabase.from("site_navigation").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      if (delError) console.warn("Lỗi khi xóa nav cũ:", delError)

      const { error: insError } = await supabase.from("site_navigation").insert(flatList)
      if (insError) throw insError

      toast.success("Đã lưu cấu trúc Menu Điều Hướng thành công!")
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu Menu")
    } finally {
      setSaving(false)
    }
  }

  const saveHomeSections = async () => {
    try {
      setSaving(true)
      const validHomeKeys = ["hero", "about_gzv", "projects", "services_three", "about_boxes", "partners", "news"]
      const { data: existingDbSections } = await supabase.from("site_home_sections").select("section_key")
      if (existingDbSections && existingDbSections.length > 0) {
        const invalidKeys = existingDbSections.map((s: any) => s.section_key).filter((k: string) => !validHomeKeys.includes(k))
        if (invalidKeys.length > 0) {
          await supabase.from("site_home_sections").delete().in("section_key", invalidKeys)
        }
      }
      const filteredHomeSections = homeSections.filter((item) => validHomeKeys.includes(item.section_key))

      const rowsToSave = filteredHomeSections.map((sec) => ({
        section_key: sec.section_key,
        title: sec.title,
        subtitle: sec.subtitle || "",
        description: sec.description || "",
        button_label: sec.button_label || "",
        button_url: sec.button_url || "",
        sort_order: Number(sec.sort_order) || 0,
        item_limit: Number(sec.item_limit) || 6,
        is_visible: Boolean(sec.is_visible),
        settings: sec.settings || {},
      }))

      const { error: saveErr } = await supabase.from("site_home_sections").upsert(rowsToSave, { onConflict: "section_key" })
      if (saveErr) throw saveErr

      const blocksSync = filteredHomeSections.map((sec, idx) => ({
        page_slug: "home",
        block_key: sec.section_key,
        component_type: sec.section_key === "hero" ? "hero_stats" : sec.section_key === "projects" ? "projects_grid" : sec.section_key === "partners" ? "partners_grid" : sec.section_key === "news" ? "news_grid" : sec.section_key,
        title: sec.title,
        sort_order: (idx + 1) * 10,
        is_visible: sec.is_visible,
        props: {
          title: sec.title,
          subtitle: sec.subtitle,
          description: sec.description,
          body: sec.description,
          button_label: sec.button_label,
          button_url: sec.button_url,
          item_limit: sec.item_limit,
          limit: sec.item_limit,
          ...(sec.settings || {}),
        },
      }))
      await supabase.from("site_page_blocks").upsert(blocksSync, { onConflict: "page_slug,block_key" })

      toast.success("Đã lưu thành công 7 Section Trang Chủ vào Database!")
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu section")
    } finally {
      setSaving(false)
    }
  }

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
      if (oldSlugs.length > 0) {
        await supabase.from("site_page_blocks").delete().in("page_slug", oldSlugs)
        await supabase.from("site_pages").delete().in("slug", oldSlugs)
      }
      const pageRows = [page]
      const targetBlocks = pageBlocks.filter((item) => slugsToClean.includes(item.page_slug)).map((block, idx) => {
        const customTitle = block.props?.title !== undefined && block.props?.title !== null ? block.props.title : block.title
        return {
          ...block,
          title: customTitle,
          page_slug: builderSlug,
          sort_order: (idx + 1) * 10,
          props: {
            ...(block.props || {}),
            title: customTitle,
          },
        }
      })
      await supabase.from("site_page_blocks").delete().eq("page_slug", builderSlug)
      if (targetBlocks.length > 0) {
        const { error: blockErr } = await supabase.from("site_page_blocks").upsert(targetBlocks)
        if (blockErr) throw blockErr
      }

      // Sync site_contact_settings if editing lien-he
      if (builderSlug === "lien-he") {
        const contactBlock = targetBlocks.find(
          (b) => b.component_type === "contact_form" || b.block_key === "contact_block"
        )
        if (contactBlock && contactBlock.props) {
          const bp = contactBlock.props
          const contactPayload: any = {
            id: 1,
            info_title: bp.info_title || "THÔNG TIN LIÊN HỆ",
            hero_subtitle: bp.info_subtitle || "Phản hồi nhanh trong vòng 24 giờ làm việc.",
            form_title: bp.form_title || "GỬI TIN NHẮN",
            form_description: bp.form_description || "Chúng tôi sẽ phản hồi qua email bạn cung cấp.",
            submit_label: bp.submit_label || "GỬI TIN NHẮN",
            success_message: bp.success_message || "Cảm ơn bạn! Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.",
            map_title: bp.map_title || "Tìm chúng tôi trên bản đồ",
            map_embed_url: bp.map_embed_url || null,
            map_enabled: bp.map_enabled !== false,
          }
          if (bp.email || bp.phone || bp.address || bp.working_hours) {
            const items: any[] = []
            if (bp.email) items.push({ icon: "mail", title: "EMAIL", lines: [bp.email], href: `mailto:${bp.email}` })
            if (bp.phone) items.push({ icon: "phone", title: "HOTLINE", lines: [bp.phone], href: `tel:${bp.phone}` })
            if (bp.address) items.push({ icon: "map", title: "ĐỊA CHỈ", lines: [bp.address] })
            if (bp.working_hours) items.push({ icon: "clock", title: "GIỜ LÀM VIỆC", lines: [bp.working_hours] })
            contactPayload.contact_items = items
          }
          if (bp.social_facebook || bp.social_youtube) {
            const sLinks: any[] = []
            if (bp.social_facebook) sLinks.push({ icon: "facebook", label: "Facebook", href: bp.social_facebook, visible: true })
            if (bp.social_youtube) sLinks.push({ icon: "youtube", label: "YouTube", href: bp.social_youtube, visible: true })
            contactPayload.social_links = sLinks
          }
          await supabase.from("site_contact_settings").upsert(contactPayload, { onConflict: "id" })
        }
      }

      const { error: pageErr } = await supabase.from("site_pages").upsert(pageRows, { onConflict: "slug" })
      if (pageErr) throw pageErr
      setSlugRenames({})
      toast.success(`Đã lưu layout và block trang /${builderSlug}!`)
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu layout")
    } finally {
      setSaving(false)
    }
  }

  const saveBannerConfig = async (targetSlug?: string) => {
    try {
      setSaving(true)

      // 1. Lưu nội dung các trang (tiêu đề, phụ đề, badge, cover) vào site_pages
      if (pages.length > 0) {
        const pagesPayload = pages.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title || p.slug,
          menu_title: p.menu_title || p.title || p.slug,
          banner_badge: p.banner_badge || null,
          banner_title: p.banner_title || p.title || null,
          banner_subtitle: p.banner_subtitle || p.banner_description || null,
          banner_description: p.banner_description || p.banner_subtitle || null,
          banner_image_url: p.banner_image_url || null,
          is_visible: p.is_visible !== false,
          content_html: p.content_html || null,
          content_blocks: (p as any).content_blocks || [],
          seo_title: p.seo_title || null,
          seo_description: p.seo_description || null,
        }))
        const { error: pagesErr } = await supabase.from("site_pages").upsert(pagesPayload, { onConflict: "slug" })
        if (pagesErr) console.warn("Lỗi khi cập nhật site_pages:", pagesErr)
      }

      // 2. Lưu cấu hình Giao diện Banner chung vào site_branding_settings
      const fetchedBrandingRes = await supabase.from("site_branding_settings").select("*").eq("id", 1).maybeSingle()
      const currentBranding = fetchedBrandingRes.data || {}

      let headerMeta: any = {}
      try {
        if (currentBranding.default_keywords && currentBranding.default_keywords.startsWith("{")) {
          headerMeta = JSON.parse(currentBranding.default_keywords)
        }
      } catch (e) {
        headerMeta = {}
      }

      const pageBannersMap: Record<string, any> = headerMeta.page_banners || {}
      pages.forEach((p) => {
        if (p.slug) {
          pageBannersMap[p.slug] = {
            show_badge: p.show_badge !== undefined ? p.show_badge : true,
            show_title: p.show_title !== undefined ? p.show_title : true,
            show_subtitle: p.show_subtitle !== undefined ? p.show_subtitle : true,
          }
        }
      })

      const updatedHeaderMeta = {
        ...headerMeta,
        global_banner: globalBannerConfig,
        sync_all_banners: syncAllBanners,
        page_banners: pageBannersMap,
      }

      const brandingPayload = {
        id: 1,
        site_name: currentBranding.site_name || branding.site_name || "GZV",
        header_logo_url: currentBranding.header_logo_url !== undefined ? currentBranding.header_logo_url : (branding.header_logo_url || ""),
        footer_logo_url: currentBranding.footer_logo_url !== undefined ? currentBranding.footer_logo_url : (branding.footer_logo_url || ""),
        favicon_url: currentBranding.favicon_url || branding.favicon_url || "/logo/favicon.ico",
        default_title: currentBranding.default_title || branding.default_title || "GZV - The Voice of Genzers",
        title_template: currentBranding.title_template || branding.title_template || "%s | GZV",
        default_description: currentBranding.default_description || branding.default_description || "",
        default_keywords: JSON.stringify(updatedHeaderMeta),
        og_image_url: currentBranding.og_image_url || branding.og_image_url || "",
        topbar_email_label: currentBranding.topbar_email_label || branding.topbar_email_label || "gzv.one@gmail.com",
        topbar_phone_label: currentBranding.topbar_phone_label || branding.topbar_phone_label || "(+84) 329 381 489",
        topbar_badge_label: currentBranding.topbar_badge_label || branding.topbar_badge_label || "GZV",
      }

      const { error: brandingErr } = await supabase.from("site_branding_settings").upsert([brandingPayload], { onConflict: "id" })
      if (brandingErr) throw brandingErr

      toast.success("Đã lưu cấu hình Banner và nội dung các trang thành công!")
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu banner")
    } finally {
      setSaving(false)
    }
  }

  const saveHeaderAndFooter = async () => {
    try {
      setSaving(true)

      const rawSocialLinks = Array.isArray(footer.social_links) ? footer.social_links : []
      const filteredSocialLinks = rawSocialLinks.filter((s: any) => s && s._meta !== "contact_person_info")

      const socialLinksPayload = [
        ...filteredSocialLinks,
        {
          _meta: "contact_person_info",
          contact_person: footer.contact_person || "",
          contact_person_phone: footer.contact_person_phone || "",
          contact_person_email: footer.contact_person_email || "",
          terms_url: footer.terms_url || "/terms",
          privacy_url: footer.privacy_url || "/privacy",
          show_terms: footer.show_terms !== false,
          show_privacy: footer.show_privacy !== false,
          social_facebook: footer.social_facebook || "",
          social_youtube: footer.social_youtube || "",
          social_instagram: footer.social_instagram || "",
          social_tiktok: footer.social_tiktok || "",
        },
      ]

      const footerPayload = {
        id: 1,
        logo_url: footer.logo_url !== undefined ? footer.logo_url : (branding.footer_logo_url ?? ""),
        intro_text: footer.intro_text || "",
        background_color: footer.background_color || "#050505",
        bottom_background_color: footer.bottom_background_color || footer.background_color || "#050505",
        facebook_page_url: footer.facebook_page_url || "",
        address: footer.address || "",
        phone_label: footer.phone_label || "",
        phone_url: footer.phone_url || "",
        email_label: footer.email_label || "",
        email_url: footer.email_url || "",
        newsletter_title: footer.newsletter_title || "",
        newsletter_description: footer.newsletter_description || "",
        copyright_text: footer.copyright_text || "",
        links: footer.links || [],
        social_links: socialLinksPayload,
      }

      const pageBannersMap: Record<string, any> = {}
      pages.forEach((p) => {
        if (p.slug) {
          pageBannersMap[p.slug] = {
            show_badge: p.show_badge !== undefined ? p.show_badge : true,
            show_title: p.show_title !== undefined ? p.show_title : true,
            show_subtitle: p.show_subtitle !== undefined ? p.show_subtitle : true,
          }
        }
      })

      const headerMeta = {
        show_topbar: branding.show_topbar !== false,
        show_topbar_email: branding.show_topbar_email !== false,
        show_topbar_phone: branding.show_topbar_phone !== false,
        show_topbar_badge: branding.show_topbar_badge !== false,
        topbar_bg_color: branding.topbar_bg_color || "",
        topbar_text_color: branding.topbar_text_color || "",
        header_bg_color: branding.header_bg_color || "",
        header_text_color: branding.header_text_color || "",
        header_site_name: branding.header_site_name || branding.site_name || "",
        show_logo: branding.show_logo !== false,
        author: branding.author || "GZV Center",
        canonical_url: branding.canonical_url || "https://www.gzv.one",
        og_title: branding.og_title || "",
        og_description: branding.og_description || "",
        og_url: branding.og_url || "",
        global_banner: globalBannerConfig,
        sync_all_banners: syncAllBanners,
        page_banners: pageBannersMap,
      }

      const brandingPayload = {
        id: 1,
        site_name: branding.header_site_name || branding.site_name || "GZV",
        header_logo_url: branding.header_logo_url !== undefined ? branding.header_logo_url : "",
        footer_logo_url: branding.footer_logo_url !== undefined ? branding.footer_logo_url : "",
        favicon_url: branding.favicon_url || "/logo/favicon.ico",
        default_title: branding.default_title || "GZV - The Voice of Genzers",
        title_template: branding.title_template || "%s | GZV",
        default_description: branding.default_description || "",
        default_keywords: JSON.stringify(headerMeta),
        og_image_url: branding.og_image_url || "",
        topbar_email_label: branding.topbar_email_label || "gzv.one@gmail.com",
        topbar_phone_label: branding.topbar_phone_label || "(+84) 329 381 489",
        topbar_badge_label: branding.topbar_badge_label || "GZV",
      }

      const [brandingRes, footerRes] = await Promise.all([
        supabase.from("site_branding_settings").upsert([brandingPayload], { onConflict: "id" }),
        supabase.from("site_footer_settings").upsert([footerPayload], { onConflict: "id" }),
      ])
      if (brandingRes.error) throw brandingRes.error
      if (footerRes.error) throw footerRes.error
      toast.success("Đã lưu toàn bộ cấu hình Header, Footer & SEO thành công!")
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu cấu hình Header, Footer & SEO")
    } finally {
      setSaving(false)
    }
  }

  // Home Section Handlers
  const moveHomeSection = (sectionKey: string, direction: -1 | 1) => {
    const currentPosition = orderedHomeSections.findIndex((entry) => entry.section.section_key === sectionKey)
    const current = orderedHomeSections[currentPosition]
    const swapWith = orderedHomeSections[currentPosition + direction]
    if (!current || !swapWith) return
    setHomeSections((items) => items.map((item, index) => {
      if (index === current.index) return { ...item, sort_order: swapWith.section.sort_order }
      if (index === swapWith.index) return { ...item, sort_order: current.section.sort_order }
      return item
    }))
  }

  const addHomeSection = () => {
    const validHomeKeys = ["hero", "about_gzv", "projects", "services_three", "about_boxes", "partners", "news"]
    const missingDef = defaultHomeSections.find((def) => !homeSections.some((h) => h.section_key === def.section_key))
    if (!missingDef) {
      toast.info("Tất cả 7 section chuẩn của Trang Chủ đã có đầy đủ!")
      return
    }
    setHomeSections((items) => [...items, missingDef])
    setSelectedSectionKey(missingDef.section_key)
    toast.success(`Đã thêm section ${missingDef.title}`)
  }

  const resetHomeSectionsToDefault = () => {
    if (window.confirm("Bạn có chắc muốn nạp lại toàn bộ dữ liệu gốc chuẩn từ các component Home? Tất cả 7 section sẽ được điền đầy đủ dữ liệu từ code Frontend.")) {
      setHomeSections(defaultHomeSections)
      setSelectedSectionKey("hero")
      toast.success("Đã nạp toàn bộ dữ liệu gốc từ các component Home! Hãy bấm 'Lưu Section Trang Chủ' để lưu vào Database.")
    }
  }

  const deleteHomeSection = async (sectionKey: string) => {
    const updated = homeSections.filter((item) => item.section_key !== sectionKey)
    setHomeSections(updated)
    setSelectedSectionKey(updated[0]?.section_key || "hero")
    const { error } = await supabase.from("site_home_sections").delete().eq("section_key", sectionKey)
    if (error) toast.error(error.message)
    else toast.success("Đã xóa section trang chủ")
  }

  // Builder Handlers
  const updateBlock = (index: number, patch: Partial<PageBlock>) => {
    setPageBlocks((items) => items.map((item, idx) => idx === index ? { ...item, ...patch } : item))
  }

  const moveBlock = (blockIndex: number, direction: -1 | 1) => {
    const currentPosition = builderBlocks.findIndex((entry) => entry.index === blockIndex)
    const current = builderBlocks[currentPosition]
    const swapWith = builderBlocks[currentPosition + direction]
    if (!current || !swapWith) return
    setPageBlocks((rows) => rows.map((row, index) => {
      if (index === current.index) return { ...row, sort_order: swapWith.block.sort_order }
      if (index === swapWith.index) return { ...row, sort_order: current.block.sort_order }
      return row
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

  const updateBuilderPage = (patch: Partial<PageContent>) => {
    setPages((items) => items.map((item) => item.slug === builderSlug ? { ...item, ...patch } : item))
  }

  // Drag & Drop Handlers
  const handleNavDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = navItems.findIndex((item) => String(item.id || item.href) === active.id)
    const newIndex = navItems.findIndex((item) => String(item.id || item.href) === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newNav = [...navItems]
    const [removed] = newNav.splice(oldIndex, 1)
    newNav.splice(newIndex, 0, removed)
    setNavItems(newNav)
  }

  const handleHomeDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = homeSections.findIndex((s) => s.section_key === active.id)
    const newIndex = homeSections.findIndex((s) => s.section_key === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newSections = [...homeSections]
    const [removed] = newSections.splice(oldIndex, 1)
    newSections.splice(newIndex, 0, removed)
    setHomeSections(newSections)
  }

  const handleBuilderDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const currentBlocks = pageBlocks.filter((b) => b.page_slug === builderSlug)
    const otherBlocks = pageBlocks.filter((b) => b.page_slug !== builderSlug)

    const oldIndex = currentBlocks.findIndex((b) => b.block_key === active.id)
    const newIndex = currentBlocks.findIndex((b) => b.block_key === over.id)

    if (oldIndex === -1 || newIndex === -1) return
    const reordered = [...currentBlocks]
    const [removed] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, removed)

    setPageBlocks([...otherBlocks, ...reordered])
  }

  // Nav Handlers
  const handleAddNavItem = () => {
    const newHref = `/trang-moi-${Date.now()}`
    const newItem: NavItem = {
      href: newHref,
      label_vi: "TRANG MỚI",
      label_en: "NEW PAGE",
      parent_href: null,
      sort_order: (navItems.length + 1) * 10,
      is_visible: true,
      is_page_enabled: true,
      is_external: false,
    }
    setNavItems([...navItems, newItem])
    setEditingMenuIndex(navItems.length)
  }

  const handleEditMenuSave = (updatedItem: NavItem) => {
    if (editingMenuIndex === null) return
    const newNav = [...navItems]
    newNav[editingMenuIndex] = updatedItem
    setNavItems(newNav)
    setEditingMenuIndex(null)
  }

  const handleDeleteNavItem = (index: number) => {
    const targetHref = navItems[index]?.href || ""
    const defaultHrefs = ["/", "/gioi-thieu", "/dich-vu", "/dich-vu/marketing", "/cua-hang", "/du-an", "/gzver", "/tin-tuc", "/lien-he"]
    if (defaultHrefs.includes(targetHref) || defaultNav.some((d) => d.href === targetHref)) {
      toast.error("Không thể xóa các trang mặc định của hệ thống! Bạn chỉ có thể ẩn hoặc đổi tên.")
      return
    }
    setNavItems(navItems.filter((_, idx) => idx !== index))
  }

  const handleToggleNavVisible = (index: number) => {
    if (navItems[index]?.href === "/") {
      toast.error("Trang Chủ luôn hiển thị trên hệ thống!")
      return
    }
    const newNav = [...navItems]
    newNav[index].is_visible = !newNav[index].is_visible
    setNavItems(newNav)
  }

  const handleGoToPageSections = (href: string) => {
    const rawPath = (href || "").split("#")[0].trim()
    const isHome = rawPath === "/" || rawPath === "" || rawPath === "#"
    if (isHome) {
      setActiveTab("home")
      toast.success("Đã chuyển tới phần chỉnh sửa Section Trang Chủ!")
    } else {
      let cleanSlug = normalizeSlug(rawPath.replace(/^\//, "")) || "gioi-thieu"
      if (cleanSlug === "gzvers") cleanSlug = "gzver"
      setBuilderSlug(cleanSlug)
      setSelectedSlug(cleanSlug)

      setPageBlocks((currentBlocks) => {
        if (!currentBlocks.some((b) => b.page_slug === cleanSlug)) {
          const defaultsForSlug = defaultPageBlocks.filter((b) => b.page_slug === cleanSlug)
          if (defaultsForSlug.length > 0) {
            return [...currentBlocks, ...defaultsForSlug]
          }
        }
        return currentBlocks
      })

      setActiveTab("builder")
      toast.success(`Đã chuyển tới phần chỉnh sửa Section trang /${cleanSlug}!`)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#ed1c24]" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Đang tải dữ liệu Website Control...</p>
      </div>
    )
  }

  const previewBannerData = {
    badge: selectedPageObj?.banner_badge || globalBannerConfig.badge || "",
    title: selectedPageObj?.banner_title || selectedPageObj?.title || globalBannerConfig.title || "",
    description: selectedPageObj?.banner_subtitle || selectedPageObj?.banner_description || globalBannerConfig.subtitle || "",
    badgeColor: globalBannerConfig.badge_color || "#ffffff",
    titleColor: globalBannerConfig.title_color || "#ffffff",
    descriptionColor: globalBannerConfig.subtitle_color || "rgba(255,255,255,0.85)",
    useImage: globalBannerConfig.use_image,
    backgroundImageUrl: selectedPageObj?.banner_image_url || globalBannerConfig.cover_url,
    imagePositionY: globalBannerConfig.imagePositionY || "50%",
    imageOpacity: globalBannerConfig.image_opacity !== undefined ? globalBannerConfig.image_opacity : 100,
    imageGrayscale: !!globalBannerConfig.image_grayscale,
    bgColor: globalBannerConfig.bg_color || "#050505",
    bgFrom: globalBannerConfig.bg_from || globalBannerConfig.bg_color || "#050505",
    bgTo: globalBannerConfig.bg_to || globalBannerConfig.bg_color || "#ed1c24",
    overlayEnabled: globalBannerConfig.overlay_enabled !== false,
    overlayColor: globalBannerConfig.overlay_color || "#050505",
    overlayOpacity: globalBannerConfig.overlay_opacity !== undefined ? globalBannerConfig.overlay_opacity : 60,
    titleAlignment: globalBannerConfig.titleAlignment || "center",
    showBadge: syncAllBanners
      ? globalBannerConfig.show_badge !== false
      : (selectedPageObj?.show_badge !== undefined && selectedPageObj?.show_badge !== null ? selectedPageObj.show_badge : globalBannerConfig.show_badge !== false),
    showTitle: syncAllBanners
      ? globalBannerConfig.show_title !== false
      : (selectedPageObj?.show_title !== undefined && selectedPageObj?.show_title !== null ? selectedPageObj.show_title : globalBannerConfig.show_title !== false),
    showDescription: syncAllBanners
      ? (globalBannerConfig.show_subtitle !== false && globalBannerConfig.show_description !== false)
      : (selectedPageObj?.show_subtitle !== undefined && selectedPageObj?.show_subtitle !== null ? selectedPageObj.show_subtitle : (globalBannerConfig.show_subtitle !== false && globalBannerConfig.show_description !== false)),
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "collab"]}>
      <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">

        {/* Header Bar */}
        <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 shrink-0 bg-[#ed1c24] text-white flex items-center justify-center font-black shadow-xs">
                <Menu className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                  WEBSITE CONTROL CENTER
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                  Điều Khiển Toàn Bộ Website
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  Quản lý menu điều hướng, từng section trang chủ, page builder, banner hero, footer, floating buttons và loading.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNavItems(defaultNav)}
                className="h-9 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
              >
                <RotateCcw className="mr-1.5 h-4 w-4 text-[#ed1c24]" /> Seed menu
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  saveNavigation()
                  saveBannerConfig()
                  saveHeaderAndFooter()
                }}
                disabled={saving}
                className="h-9 px-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
              >
                <Save className="mr-1.5 h-4 w-4" />
                {saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ControlStat label="Menu Điều Hướng" value={navItems.length} />
            <ControlStat label="Danh Sách Trang" value={pages.length} />
            <ControlStat label="Section Trang Chủ" value={homeSections.length} />
            <ControlStat label="Page Blocks" value={pageBlocks.length} />
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 border border-slate-200 bg-slate-100 p-1.5 rounded-none shadow-xs dark:border-white/10 dark:bg-slate-900">
            <TabsTrigger value="menu" className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5">
              <LayoutTemplate className="h-3.5 w-3.5 shrink-0" /> Menu
            </TabsTrigger>
            <TabsTrigger value="banner" className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 shrink-0" /> Banner (Hero)
            </TabsTrigger>
            <TabsTrigger value="header_footer" className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 shrink-0" /> Header & Footer
            </TabsTrigger>
            <TabsTrigger value="floating" className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5">
              <Bot className="h-3.5 w-3.5 shrink-0" /> Floating
            </TabsTrigger>
            <TabsTrigger value="loading" className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 shrink-0" /> Loading
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MENU */}
          <TabsContent value="menu" className="space-y-4">
            <MenuNavigationTab
              navItems={navItems}
              sensors={sensors}
              onDragEnd={handleNavDragEnd}
              onAddNavItem={handleAddNavItem}
              onEditNavItem={(idx) => setEditingMenuIndex(idx)}
              onDeleteNavItem={handleDeleteNavItem}
              onToggleNavVisible={handleToggleNavVisible}
              onGoToPageSections={handleGoToPageSections}
              onSaveNavigation={saveNavigation}
              saving={saving}
            />
          </TabsContent>

          {/* TAB 2: HOME SECTIONS */}
          <TabsContent value="home" className="space-y-6">
            <HomeSectionsTab
              homeSections={homeSections}
              orderedHomeSections={orderedHomeSections}
              selectedSection={selectedSection}
              selectedSectionKey={selectedSectionKey}
              setSelectedSectionKey={setSelectedSectionKey}
              setHomeSections={setHomeSections}
              sensors={sensors}
              onHomeDragEnd={handleHomeDragEnd}
              onAddHomeSection={addHomeSection}
              onResetHomeSectionsToDefault={resetHomeSectionsToDefault}
              onDeleteHomeSection={deleteHomeSection}
              onSaveHomeSections={saveHomeSections}
              onBackToMenu={() => setActiveTab("menu")}
              onPickMedia={(target) => setPickerOpen(target)}
              saving={saving}
            />
          </TabsContent>

          {/* TAB 3: PAGE BUILDER */}
          <TabsContent value="builder" className="space-y-6">
            <PageBuilderTab
              builderSlug={builderSlug}
              onSelectSlug={(slug) => handleGoToPageSections("/" + slug)}
              builderBlocks={builderBlocks}
              activeBlockItem={activeBlockItem}
              selectedBlockKey={selectedBlockKey}
              setSelectedBlockKey={setSelectedBlockKey}
              setPageBlocks={setPageBlocks}
              templates={templates}
              sensors={sensors}
              onBuilderDragEnd={handleBuilderDragEnd}
              onDuplicateBlock={duplicateBlock}
              onMoveBlock={moveBlock}
              onSaveBuilderLayout={saveBuilderLayout}
              onBackToMenu={() => setActiveTab("menu")}
              onPickMedia={(target) => setPickerOpen(target)}
              saving={saving}
            />
          </TabsContent>

          {/* TAB 4: HERO BANNER */}
          <TabsContent value="banner" className="space-y-6">
            <BannerHeroTab
              globalBannerConfig={globalBannerConfig}
              setGlobalBannerConfig={setGlobalBannerConfig}
              syncAllBanners={syncAllBanners}
              setSyncAllBanners={setSyncAllBanners}
              pages={pages}
              setPages={setPages}
              selectedPageForPreview={selectedPageForPreview}
              setSelectedPageForPreview={setSelectedPageForPreview}
              previewBannerData={previewBannerData}
              onSaveBannerConfig={saveBannerConfig}
              onPickMedia={(target) => setPickerOpen(target)}
              saving={saving}
            />
          </TabsContent>

          {/* TAB 5: HEADER & FOOTER */}
          <TabsContent value="header_footer" className="space-y-6">
            <HeaderFooterSeoTab
              branding={branding}
              setBranding={setBranding}
              footer={footer}
              setFooter={setFooter}
              onPickMedia={(target) => setPickerOpen(target as any)}
              onSave={saveHeaderAndFooter}
              saving={saving}
            />
          </TabsContent>

          {/* TAB 6: FLOATING */}
          <TabsContent value="floating">
            <FloatingActionsTab />
          </TabsContent>

          {/* TAB 7: LOADING */}
          <TabsContent value="loading">
            <LoadingScreenTab
              loadingSettings={loadingSettings}
              setLoadingSettings={setLoadingSettings}
            />
          </TabsContent>
        </Tabs>

        {/* Media Pickers */}
        <MediaPickerDialog
          open={pickerOpen !== null}
          onClose={() => setPickerOpen(null)}
          onSelect={(res) => {
            if (pickerOpen === "globalCover") {
              setGlobalBannerConfig({ ...globalBannerConfig, cover_url: res.url })
            } else if (pickerOpen === "pageCover" && selectedPageObj) {
              setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, banner_image_url: res.url } : p)))
            } else if (pickerOpen === "headerLogo") {
              setBranding({ ...branding, header_logo_url: res.url })
            } else if (pickerOpen === "favicon") {
              setBranding({ ...branding, favicon_url: res.url })
            } else if (pickerOpen === "footerLogo") {
              setFooter({ ...footer, logo_url: res.url })
              setBranding({ ...branding, footer_logo_url: res.url })
            } else if (pickerOpen === "ogImage") {
              setBranding({ ...branding, og_image_url: res.url })
            } else if (pickerOpen === "heroVideo") {
              setHomeSections((items) => items.map((item) => item.section_key === selectedSectionKey ? { ...item, settings: { ...(item.settings || {}), video_url: res.url } } : item))
            } else if (pickerOpen === "heroPoster") {
              setHomeSections((items) => items.map((item) => item.section_key === selectedSectionKey ? { ...item, settings: { ...(item.settings || {}), poster_url: res.url } } : item))
            } else if (pickerOpen === "aboutImage") {
              setHomeSections((items) => items.map((item) => item.section_key === selectedSectionKey ? { ...item, settings: { ...(item.settings || {}), image_url: res.url } } : item))
            } else if (pickerOpen === "builderBanner") {
              updateBuilderPage({ banner_image_url: res.url })
            } else if (typeof pickerOpen === "object" && pickerOpen !== null) {
              if ("blockImageIndex" in pickerOpen) {
                const block = pageBlocks[pickerOpen.blockImageIndex]
                const images = Array.isArray(block?.props?.images) ? [...block.props.images] : []
                images[pickerOpen.imageIndex] = { ...(images[pickerOpen.imageIndex] || {}), src: res.url, alt: res.alt || "GZV" }
                updateBlock(pickerOpen.blockImageIndex, { props: { ...(block.props || {}), images } })
              } else if ("singleBlockIndex" in pickerOpen) {
                const block = pageBlocks[pickerOpen.singleBlockIndex]
                updateBlock(pickerOpen.singleBlockIndex, {
                  props: { ...(block?.props || {}), image_url: res.url }
                })
              }
            }
            setPickerOpen(null)
          }}
          defaultFolder="site"
        />

        {/* Edit Menu Item Dialog */}
        <EditMenuDialog
          isOpen={editingMenuIndex !== null}
          onClose={() => setEditingMenuIndex(null)}
          item={editingMenuIndex !== null ? navItems[editingMenuIndex] : null}
          onSave={handleEditMenuSave}
        />
      </div>
    </ProtectedRoute>
  )
}

export default SiteContentManager
