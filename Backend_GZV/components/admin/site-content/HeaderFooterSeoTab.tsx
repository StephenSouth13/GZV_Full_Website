"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Palette,
  Layout,
  Save,
  Loader2,
  Plus,
  Trash2,
  Globe,
  Link2,
  Sparkles,
  CheckCircle2,
  FileText,
  RotateCcw,
  X,
  ImageIcon,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Youtube,
  Instagram,
  ArrowUpRight,
  Send,
  GripVertical,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function updateAdminFavicon(url?: string | null) {
  if (!url || typeof document === "undefined") return
  const rels = ["icon", "shortcut icon", "apple-touch-icon"]
  rels.forEach((rel) => {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
    if (link) {
      link.href = url
    } else {
      link = document.createElement("link")
      link.rel = rel
      link.href = url
      document.head.appendChild(link)
    }
  })
}

export function AdminFaviconManager({ faviconUrl }: { faviconUrl?: string | null }) {
  useEffect(() => {
    if (faviconUrl) updateAdminFavicon(faviconUrl)
  }, [faviconUrl])
  return null
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.84 19.4a6.34 6.34 0 0 0 10.86-4.43V8.27a8.16 8.16 0 0 0 4.77 1.52V6.34a4.85 4.85 0 0 1-1.88.35z" />
    </svg>
  )
}

function SortableAddressRow({
  id,
  item,
  index,
  total,
  onUpdate,
  onDelete,
}: {
  id: string
  item: { id: string; label: string; value: string }
  index: number
  total: number
  onUpdate: (index: number, patch: { label?: string; value?: string }) => void
  onDelete: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  }

  const isPrimary = index === 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 border transition-all ${
        isPrimary
          ? "border-slate-300 bg-slate-100/70 dark:border-white/20 dark:bg-slate-900/90"
          : "border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-slate-900/60"
      }`}
    >
      {/* 1. Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Kéo thả để sắp xếp thứ tự"
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 shrink-0"
      >
        <GripVertical className="h-4 w-4 text-slate-500 hover:text-slate-900 dark:hover:text-white" />
      </button>

      {/* 2. Ô riêng hiển thị số thứ tự (#) - màu đen/trắng tiêu chuẩn */}
      <div className="w-9 h-9 flex items-center justify-center border border-slate-300 bg-white font-mono text-xs font-black text-slate-700 shrink-0 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
        #{index + 1}
      </div>

      {/* 3. Ô riêng chỉnh sửa Tên/Nhãn cơ sở (Trụ sở chính, Cơ sở 2...) - giữ nguyên chữ hoa/thường người dùng gõ */}
      <div className="w-36 sm:w-44 shrink-0">
        <Input
          value={item.label}
          onChange={(e) => onUpdate(index, { label: e.target.value })}
          placeholder={isPrimary ? "Trụ sở chính" : `Cơ sở ${index + 1}`}
          className="h-9 text-xs font-bold rounded-none border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/15 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>

      {/* 4. Ô nhập chi tiết Địa chỉ */}
      <Input
        value={item.value}
        onChange={(e) => onUpdate(index, { value: e.target.value })}
        placeholder={isPrimary ? "Địa chỉ trụ sở chính (Số nhà, đường, quận, TP...)" : `Địa chỉ cơ sở ${index + 1}`}
        className="h-9 text-xs rounded-none border-slate-300 font-semibold bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/15 dark:bg-slate-950 dark:text-slate-100 flex-1"
      />

      {/* 5. Nút Xóa hoặc Cố định cho #1 */}
      {isPrimary ? (
        <span
          title="Địa chỉ #1 là cơ sở mặc định, không được phép xóa"
          className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 select-none shrink-0"
        >
          Cố định
        </span>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onDelete(index)}
          title="Xóa cơ sở này"
          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

interface HeaderFooterSeoTabProps {
  branding: any
  setBranding: (val: any) => void
  footer: any
  setFooter: (val: any) => void
  onPickMedia: (target: "headerLogo" | "footerLogo" | "favicon" | "ogImage") => void
  onSave: () => void
  saving: boolean
}

export function HeaderFooterSeoTab({
  branding,
  setBranding,
  footer,
  setFooter,
  onPickMedia,
  onSave,
  saving,
}: HeaderFooterSeoTabProps) {
  const [subTab, setSubTab] = useState<"header" | "footer" | "seo">("header")
  const [activeFooterCol, setActiveFooterCol] = useState<number | string>(1)

  // Tự động đồng bộ Favicon tab trình duyệt Admin khi đổi favicon
  useEffect(() => {
    if (branding?.favicon_url) {
      updateAdminFavicon(branding.favicon_url)
    }
  }, [branding?.favicon_url])

  // Local helper getters & setters for Branding
  const logoUrl = branding.header_logo_url || ""
  const setLogoUrl = (url: string) => setBranding({ ...branding, header_logo_url: url })

  const faviconUrl = branding.favicon_url || ""
  const setFaviconUrl = (url: string) => {
    updateAdminFavicon(url)
    setBranding({ ...branding, favicon_url: url })
  }

  const siteTitle = branding.site_name || "GZV"
  const setSiteTitle = (val: string) => setBranding({ ...branding, site_name: val })

  const headerSiteName = branding.header_site_name || branding.site_name || ""
  const setHeaderSiteName = (val: string) => setBranding({ ...branding, header_site_name: val, site_name: val })

  const browserSiteTitle = branding.default_title || ""
  const setBrowserSiteTitle = (val: string) => setBranding({ ...branding, default_title: val })

  const seoTitle = branding.default_title || ""
  const setSeoTitle = (val: string) => setBranding({ ...branding, default_title: val })

  const metaDescription = branding.default_description || ""
  const setMetaDescription = (val: string) => setBranding({ ...branding, default_description: val })

  const keywords = branding.default_keywords || ""
  const setKeywords = (val: string) => setBranding({ ...branding, default_keywords: val })

  const author = branding.author || "GZV Center"
  const setAuthor = (val: string) => setBranding({ ...branding, author: val })

  const canonicalUrl = branding.canonical_url || "https://www.gzv.one"
  const setCanonicalUrl = (val: string) => setBranding({ ...branding, canonical_url: val })

  const ogTitle = branding.og_title || branding.default_title || ""
  const setOgTitle = (val: string) => setBranding({ ...branding, og_title: val })

  const ogDescription = branding.og_description || branding.default_description || ""
  const setOgDescription = (val: string) => setBranding({ ...branding, og_description: val })

  const ogImage = branding.og_image_url || ""
  const setOgImage = (val: string) => setBranding({ ...branding, og_image_url: val })

  const ogUrl = branding.og_url || canonicalUrl
  const setOgUrl = (val: string) => setBranding({ ...branding, og_url: val })

  const showLogo = branding.show_logo !== false
  const setShowLogo = (val: boolean) => setBranding({ ...branding, show_logo: val })

  const showTopbar = branding.show_topbar !== false
  const setShowTopbar = (val: boolean) => setBranding({ ...branding, show_topbar: val })

  const showTopbarEmail = branding.show_topbar_email !== false
  const setShowTopbarEmail = (val: boolean) => setBranding({ ...branding, show_topbar_email: val })

  const showTopbarPhone = branding.show_topbar_phone !== false
  const setShowTopbarPhone = (val: boolean) => setBranding({ ...branding, show_topbar_phone: val })

  const showTopbarBadge = branding.show_topbar_badge !== false
  const setShowTopbarBadge = (val: boolean) => setBranding({ ...branding, show_topbar_badge: val })

  const topbarEmail = branding.topbar_email_label || "gzv.one@gmail.com"
  const setTopbarEmail = (val: string) => setBranding({ ...branding, topbar_email_label: val })

  const topbarPhone = branding.topbar_phone_label || "(+84) 329 381 489"
  const setTopbarPhone = (val: string) => setBranding({ ...branding, topbar_phone_label: val })

  const topbarBadge = branding.topbar_badge_label || "GZV"
  const setTopbarBadge = (val: string) => setBranding({ ...branding, topbar_badge_label: val })

  const topbarBgColor = branding.topbar_bg_color || ""
  const setTopbarBgColor = (val: string) => setBranding({ ...branding, topbar_bg_color: val })

  const topbarTextColor = branding.topbar_text_color || ""
  const setTopbarTextColor = (val: string) => setBranding({ ...branding, topbar_text_color: val })

  const headerBgColor = branding.header_bg_color || ""
  const setHeaderBgColor = (val: string) => setBranding({ ...branding, header_bg_color: val })

  const headerTextColor = branding.header_text_color || ""
  const setHeaderTextColor = (val: string) => setBranding({ ...branding, header_text_color: val })

  // Local helper getters & setters for Footer
  const footerLogoUrl = footer.logo_url || branding.footer_logo_url || "/logo.webp"
  const setFooterLogoUrl = (url: string) => {
    setFooter({ ...footer, logo_url: url })
    setBranding({ ...branding, footer_logo_url: url })
  }

  const brandTagline = footer.intro_text || ""
  const setBrandTagline = (val: string) => setFooter({ ...footer, intro_text: val })

  const contactAddress = footer.address || ""
  const setContactAddress = (val: string) => setFooter({ ...footer, address: val })

  // Multi-address state with stable IDs and explicit label & value
  const parseAddressLines = (addrStr?: string | null): Array<{ id: string; label: string; value: string }> => {
    if (!addrStr || !addrStr.trim()) {
      return [{ id: `addr-init-0`, label: "Trụ sở chính", value: "" }]
    }
    const lines = addrStr.split("\n")
    return lines.map((line, idx) => {
      let label = idx === 0 ? "Trụ sở chính" : `Cơ sở ${idx + 1}`
      let value = line
      if (line.includes(": ")) {
        const colonIdx = line.indexOf(": ")
        const prefix = line.substring(0, colonIdx).trim()
        if (prefix.length > 0 && prefix.length <= 40) {
          label = prefix
          value = line.substring(colonIdx + 2)
        }
      }
      return {
        id: `addr-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        label,
        value,
      }
    })
  }

  const serializeAddressItems = (items: Array<{ id: string; label: string; value: string }>): string => {
    return items
      .map((item) => {
        const trimmedLabel = item.label.trim()
        const trimmedVal = item.value.trim()
        if (trimmedLabel && trimmedVal) {
          return `${trimmedLabel}: ${trimmedVal}`
        }
        return trimmedVal || trimmedLabel || ""
      })
      .join("\n")
  }

  const [addressItems, setAddressItems] = useState<Array<{ id: string; label: string; value: string }>>(() =>
    parseAddressLines(footer.address)
  )

  // Sync state ONLY when footer.address is modified from outside (e.g. initial DB load or tab switch)
  const isInternalAddressUpdate = React.useRef(false)
  useEffect(() => {
    if (isInternalAddressUpdate.current) {
      isInternalAddressUpdate.current = false
      return
    }
    if (footer.address !== undefined) {
      setAddressItems(parseAddressLines(footer.address))
    }
  }, [footer.address])

  const addressSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const syncAddressToFooter = (newItems: Array<{ id: string; label: string; value: string }>) => {
    setAddressItems(newItems)
    isInternalAddressUpdate.current = true
    const joined = serializeAddressItems(newItems)
    setFooter({ ...footer, address: joined })
  }

  const addAddress = () => {
    const newIdx = addressItems.length + 1
    const newItems = [
      ...addressItems,
      { id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, label: `Cơ sở ${newIdx}`, value: "" },
    ]
    syncAddressToFooter(newItems)
  }

  const updateAddress = (index: number, patch: { label?: string; value?: string }) => {
    const newItems = addressItems.map((item, i) => (i === index ? { ...item, ...patch } : item))
    syncAddressToFooter(newItems)
  }

  const removeAddress = (index: number) => {
    if (index === 0) return // Không cho phép xóa địa chỉ #1
    const newItems = addressItems.filter((_, i) => i !== index)
    syncAddressToFooter(
      newItems.length > 0
        ? newItems
        : [{ id: `addr-${Date.now()}`, label: "Trụ sở chính", value: "" }]
    )
  }

  const handleAddressDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = addressItems.findIndex((item) => item.id === active.id)
    const newIndex = addressItems.findIndex((item) => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newItems = [...addressItems]
    const [moved] = newItems.splice(oldIndex, 1)
    newItems.splice(newIndex, 0, moved)
    syncAddressToFooter(newItems)
  }

  const contactPhone = footer.phone_label || ""
  const setContactPhone = (val: string) => setFooter({ ...footer, phone_label: val })

  const contactEmail = footer.email_label || ""
  const setContactEmail = (val: string) => setFooter({ ...footer, email_label: val })

  const facebook = footer.social_facebook || "https://facebook.com/gzv.one"
  const setFacebook = (val: string) => setFooter({ ...footer, social_facebook: val })

  const youtube = footer.social_youtube || ""
  const setYoutube = (val: string) => setFooter({ ...footer, social_youtube: val })

  const instagram = footer.social_instagram || ""
  const setInstagram = (val: string) => setFooter({ ...footer, social_instagram: val })

  const tiktok = footer.social_tiktok || ""
  const setTiktok = (val: string) => setFooter({ ...footer, social_tiktok: val })

  const fbPageUrl = footer.facebook_page_url || "https://www.facebook.com/gzv.one"
  const setFbPageUrl = (val: string) => setFooter({ ...footer, facebook_page_url: val })

  const copyrightText = footer.copyright_text || ""
  const setCopyrightText = (val: string) => setFooter({ ...footer, copyright_text: val })

  const contactPerson = footer.contact_person || ""
  const setContactPerson = (val: string) => setFooter({ ...footer, contact_person: val })

  const contactPersonPhone = footer.contact_person_phone || ""
  const setContactPersonPhone = (val: string) => setFooter({ ...footer, contact_person_phone: val })

  const contactPersonEmail = footer.contact_person_email || ""
  const setContactPersonEmail = (val: string) => setFooter({ ...footer, contact_person_email: val })

  const termsUrl = footer.terms_url || "/terms"
  const setTermsUrl = (val: string) => setFooter({ ...footer, terms_url: val })

  const privacyUrl = footer.privacy_url || "/privacy"
  const setPrivacyUrl = (val: string) => setFooter({ ...footer, privacy_url: val })

  const showTerms = footer.show_terms !== false
  const setShowTerms = (val: boolean) => setFooter({ ...footer, show_terms: val })

  const showPrivacy = footer.show_privacy !== false
  const setShowPrivacy = (val: boolean) => setFooter({ ...footer, show_privacy: val })

  const showSocial = footer.show_social !== false
  const setShowSocial = (val: boolean) => setFooter({ ...footer, show_social: val })

  const footerLinks: any[] = footer.links?.length ? footer.links : [
    { label: "Giới thiệu", url: "/gioi-thieu" },
    { label: "Dịch vụ", url: "/dich-vu" },
    { label: "Dự án", url: "/du-an" },
    { label: "GZVers", url: "/gzver" },
    { label: "Tin tức", url: "/tin-tuc" },
    { label: "Liên hệ", url: "/lien-he" },
  ]
  const addFooterLink = () => {
    setFooter({
      ...footer,
      links: [...footerLinks, { label: "Liên kết mới", url: "/lien-ket-moi" }],
    })
  }
  const updateFooterLink = (idx: number, key: string, val: string) => {
    const nextLinks = footerLinks.map((l: any, i: number) => (i === idx ? { ...l, [key]: val } : l))
    setFooter({ ...footer, links: nextLinks })
  }
  const removeFooterLink = (idx: number) => {
    const nextLinks = footerLinks.filter((_: any, i: number) => i !== idx)
    setFooter({ ...footer, links: nextLinks })
  }

  const footerBgColor = footer.background_color || ""
  const setFooterBgColor = (val: string) => setFooter({ ...footer, background_color: val })

  const footerTextColor = footer.footer_text_color || ""
  const setFooterTextColor = (val: string) => setFooter({ ...footer, footer_text_color: val })

  const footerLinkColor = footer.footer_link_color || ""
  const setFooterLinkColor = (val: string) => setFooter({ ...footer, footer_link_color: val })

  const socialsList = showSocial ? ([
    facebook && { icon: Facebook, url: facebook, label: "Facebook" },
    youtube && { icon: Youtube, url: youtube, label: "YouTube" },
    instagram && { icon: Instagram, url: instagram, label: "Instagram" },
    tiktok && { icon: TikTokIcon, url: tiktok, label: "TikTok" },
  ].filter(Boolean) as Array<{ icon: any; url: string; label: string }>) : []

  const fbEmbedSrc = fbPageUrl
    ? `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(fbPageUrl)}&tabs&width=250&height=160&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`
    : null

  return (
    <div className="space-y-6">
      {/* 2. Sub-Tabs Bar: HEADER | FOOTER | SEO WEBSITE */}
      <Tabs value={subTab} onValueChange={(val) => setSubTab(val as "header" | "footer" | "seo")} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-none border border-slate-200 flex h-11 gap-1 max-w-md dark:border-white/10 dark:bg-slate-900">
          <TabsTrigger
            value="header"
            className="flex-1 gap-1.5 rounded-none px-4 py-2 text-xs font-black uppercase tracking-wider data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white transition-colors"
          >
            <Layout className="h-4 w-4" />
            HEADER
          </TabsTrigger>
          <TabsTrigger
            value="footer"
            className="flex-1 gap-1.5 rounded-none px-4 py-2 text-xs font-black uppercase tracking-wider data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            FOOTER
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="flex-1 gap-1.5 rounded-none px-4 py-2 text-xs font-black uppercase tracking-wider data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white transition-colors"
          >
            <Globe className="h-4 w-4" />
            SEO WEBSITE
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* SUB-TAB 1: HEADER */}
        {/* ========================================================================= */}
        <TabsContent value="header" className="space-y-6 mt-0">
          {/* Live Preview Header & Topbar at Top */}
          <Card className="border-slate-200 rounded-none shadow-xs bg-white overflow-hidden dark:border-white/10 dark:bg-slate-900">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between dark:border-white/10 dark:bg-slate-950">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-none bg-[#ed1c24] animate-pulse" />
                Xem trước trực tiếp (Live Preview Header & Topbar)
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">
                Giao diện Header ngoài trang public
              </span>
            </div>

            {/* Topbar Preview */}
            {showTopbar && (
              <div
                className="w-full border-b border-white/10 px-4 py-1.5 transition-colors text-[11px] font-bold uppercase"
                style={{
                  backgroundColor: topbarBgColor || "#050505",
                  color: topbarTextColor || "#ffffff",
                }}
              >
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                  <div className="flex items-center gap-6 opacity-90">
                    {showTopbarEmail && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#ed1c24]" />
                        {topbarEmail}
                      </span>
                    )}
                    {showTopbarPhone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#ed1c24]" />
                        {topbarPhone}
                      </span>
                    )}
                  </div>
                  {showTopbarBadge && (
                    <span className="border-l-2 border-[#ed1c24] pl-2.5 font-bold">
                      {topbarBadge}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Navbar Preview */}
            <div
              className="w-full border-b border-slate-200 p-4 transition-colors dark:border-white/10"
              style={{
                backgroundColor: headerBgColor || "#ffffff",
                color: headerTextColor || "#000000",
              }}
            >
              <div className="flex items-center justify-between max-w-5xl mx-auto">
                <div className="flex items-center gap-3">
                  {showLogo && logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-9 max-w-[160px] object-contain" />
                  ) : (
                    <div className="h-8 w-8 bg-[#ed1c24] text-white flex items-center justify-center font-black text-xs">
                      G
                    </div>
                  )}
                  <span className="text-sm font-black uppercase tracking-wider">
                    {headerSiteName || siteTitle || "GZV CENTER"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider opacity-80 hidden md:flex">
                  <span>Trang chủ</span>
                  <span>Giới thiệu</span>
                  <span>Dịch vụ</span>
                  <span>Dự án</span>
                  <span>GZVers</span>
                  <span>Đối tác</span>
                  <span>Tin tức</span>
                  <span>Liên hệ</span>
                </div>
              </div>
            </div>
          </Card>

          {/* CẤU HÌNH THANH TOPBAR (EMAIL, SĐT, BADGE PHÍA TRÊN CÙNG) */}
          <Card className="border-slate-200 rounded-none shadow-xs bg-white dark:border-white/10 dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
                    <Phone className="h-4 w-4 text-[#ed1c24]" /> Cấu hình thanh Topbar trên cùng
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold mt-1">
                    Bật/tắt toàn bộ hoặc tùy chỉnh từng mục Email, Số điện thoại và Nhãn thương hiệu hiển thị ở thanh trên cùng.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {showTopbar ? "Đang bật" : "Đang tắt"}
                  </span>
                  <Switch checked={showTopbar} onCheckedChange={setShowTopbar} />
                </div>
              </div>
            </CardHeader>
            {showTopbar && (
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. Email */}
                  <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#ed1c24]" /> Email liên hệ
                      </Label>
                      <Switch checked={showTopbarEmail} onCheckedChange={setShowTopbarEmail} />
                    </div>
                    <Input
                      value={topbarEmail}
                      onChange={(e) => setTopbarEmail(e.target.value)}
                      placeholder="gzv.one@gmail.com"
                      disabled={!showTopbarEmail}
                      className="rounded-none border-slate-200 text-xs font-semibold h-9 bg-white dark:border-white/10 dark:bg-slate-900 disabled:opacity-50"
                    />
                  </div>

                  {/* 2. Số điện thoại */}
                  <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#ed1c24]" /> Số điện thoại / Hotline
                      </Label>
                      <Switch checked={showTopbarPhone} onCheckedChange={setShowTopbarPhone} />
                    </div>
                    <Input
                      value={topbarPhone}
                      onChange={(e) => setTopbarPhone(e.target.value)}
                      placeholder="(+84) 329 381 489"
                      disabled={!showTopbarPhone}
                      className="rounded-none border-slate-200 text-xs font-semibold h-9 bg-white dark:border-white/10 dark:bg-slate-900 disabled:opacity-50"
                    />
                  </div>

                  {/* 3. Nhãn bên phải */}
                  <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#ed1c24]" /> Nhãn thương hiệu
                      </Label>
                      <Switch checked={showTopbarBadge} onCheckedChange={setShowTopbarBadge} />
                    </div>
                    <Input
                      value={topbarBadge}
                      onChange={(e) => setTopbarBadge(e.target.value)}
                      placeholder="GZV"
                      disabled={!showTopbarBadge}
                      className="rounded-none border-slate-200 text-xs font-semibold h-9 bg-white dark:border-white/10 dark:bg-slate-900 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Tùy chỉnh màu sắc Topbar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Màu nền Topbar</Label>
                      {topbarBgColor && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setTopbarBgColor("")}
                          className="h-5 px-1.5 text-[10px] font-bold text-slate-500 hover:text-red-600 rounded-none"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" /> Reset
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={topbarBgColor || "#050505"}
                        onChange={(e) => setTopbarBgColor(e.target.value)}
                        className="w-8 h-8 rounded-none cursor-pointer border border-slate-200 shrink-0"
                        style={{ padding: 1 }}
                      />
                      <Input
                        value={topbarBgColor}
                        onChange={(e) => setTopbarBgColor(e.target.value)}
                        placeholder="#050505 (Mặc định)"
                        className="flex-1 font-mono text-xs uppercase rounded-none border-slate-200 h-8 bg-white dark:border-white/10 dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Màu chữ Topbar</Label>
                      {topbarTextColor && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setTopbarTextColor("")}
                          className="h-5 px-1.5 text-[10px] font-bold text-slate-500 hover:text-red-600 rounded-none"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" /> Reset
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={topbarTextColor || "#ffffff"}
                        onChange={(e) => setTopbarTextColor(e.target.value)}
                        className="w-8 h-8 rounded-none cursor-pointer border border-slate-200 shrink-0"
                        style={{ padding: 1 }}
                      />
                      <Input
                        value={topbarTextColor}
                        onChange={(e) => setTopbarTextColor(e.target.value)}
                        placeholder="#FFFFFF (Mặc định)"
                        className="flex-1 font-mono text-xs uppercase rounded-none border-slate-200 h-8 bg-white dark:border-white/10 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Tùy chỉnh màu sắc Header */}
          <Card className="border-slate-200 rounded-none shadow-xs bg-white dark:border-white/10 dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-white/10">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
                <Palette className="h-4 w-4 text-[#ed1c24]" /> Tùy chỉnh màu sắc Header
              </CardTitle>
              <CardDescription className="text-xs font-semibold">
                Tùy chỉnh màu nền và màu chữ cho thanh Header Navbar. Mặc định: Nền đen (#050505), Chữ trắng (#FFFFFF).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Màu nền Header */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Màu nền Header</Label>
                    {headerBgColor && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setHeaderBgColor("")}
                        title="Reset về màu nền mặc định"
                        className="h-6 px-2 text-[10px] font-bold text-slate-500 hover:text-red-600 rounded-none transition-colors"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Reset
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 items-center pt-1">
                    <input
                      type="color"
                      value={headerBgColor || "#050505"}
                      onChange={(e) => setHeaderBgColor(e.target.value)}
                      className="w-9 h-9 rounded-none cursor-pointer border border-slate-200 shrink-0"
                      style={{ padding: 1 }}
                    />
                    <Input
                      value={headerBgColor}
                      onChange={(e) => setHeaderBgColor(e.target.value)}
                      placeholder="#050505 (Mặc định)"
                      className="flex-1 font-mono text-xs uppercase rounded-none border-slate-200 h-9 bg-white dark:border-white/10 dark:bg-slate-900"
                    />
                  </div>
                </div>

                {/* 2. Màu chữ Header */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Màu chữ Header</Label>
                    {headerTextColor && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setHeaderTextColor("")}
                        title="Reset về màu chữ mặc định"
                        className="h-6 px-2 text-[10px] font-bold text-slate-500 hover:text-red-600 rounded-none transition-colors"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Reset
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 items-center pt-1">
                    <input
                      type="color"
                      value={headerTextColor || "#ffffff"}
                      onChange={(e) => setHeaderTextColor(e.target.value)}
                      className="w-9 h-9 rounded-none cursor-pointer border border-slate-200 shrink-0"
                      style={{ padding: 1 }}
                    />
                    <Input
                      value={headerTextColor}
                      onChange={(e) => setHeaderTextColor(e.target.value)}
                      placeholder="#FFFFFF (Mặc định)"
                      className="flex-1 font-mono text-xs uppercase rounded-none border-slate-200 h-9 bg-white dark:border-white/10 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Header Settings Form */}
          <Card className="border-slate-200 rounded-none shadow-xs bg-white dark:border-white/10 dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-white/10">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
                <Globe className="h-4 w-4 text-[#ed1c24]" /> Cấu hình thương hiệu & Header
              </CardTitle>
              <CardDescription className="text-xs font-semibold">
                Tách riêng thông tin hiển thị trên Header Navbar, Tab trình duyệt và Favicon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* 1. LOGO CHÍNH & TÊN HIỂN THỊ TRÊN HEADER */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-none space-y-4 dark:border-white/10 dark:bg-slate-950/40">
                <div className="border-b border-slate-200 pb-2 dark:border-white/10">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#ed1c24]" /> LOGO CHÍNH & TÊN HIỂN THỊ TRÊN HEADER
                  </Label>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Cấu hình logo hình ảnh và tên chữ hiển thị riêng trên thanh Navbar. Tên này không dùng làm tiêu đề tab trình duyệt.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-900">
                  <div>
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Hiển thị logo trên Header</Label>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Bật để hiển thị logo hình ảnh, tắt để dùng tên chữ mặc định trên Header</p>
                  </div>
                  <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                </div>

                {/* 2-Column layout on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start pt-1">
                  {/* Left: Logo chính */}
                  <div className="space-y-2 flex flex-col justify-start">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Logo chính (Header & Footer)
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-none h-[72px] dark:border-white/10 dark:bg-slate-900">
                      <div className="w-16 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 p-1 rounded-none dark:bg-slate-800 dark:border-white/10">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo chính" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <FileText className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col justify-center gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPickMedia("headerLogo")}
                            type="button"
                            className="h-7 text-[11px] font-black uppercase tracking-wider rounded-none border-slate-200 bg-white hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800"
                          >
                            Chọn / Tải lên
                          </Button>
                          {logoUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setLogoUrl("")}
                              type="button"
                              className="h-7 text-[11px] font-black uppercase tracking-wider text-red-500 rounded-none hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              Xóa
                            </Button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold line-clamp-1">
                          Nền trong suốt PNG được khuyến nghị (180-240px).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Tên hiển thị */}
                  <div className="space-y-2 flex flex-col justify-start">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Tên hiển thị cạnh Logo trên Header (Navbar)
                    </Label>
                    <Input
                      value={headerSiteName}
                      onChange={(e) => setHeaderSiteName(e.target.value)}
                      placeholder="GZV CENTER"
                      className="rounded-none border-slate-200 text-xs font-semibold h-10 bg-white dark:border-white/10 dark:bg-slate-900"
                    />
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Tên này chỉ dùng trên Navbar, cập nhật ngay ở Live Preview ở trên.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. FAVICON & TÊN WEBSITE TRÊN TRÌNH DUYỆT */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-none space-y-4 dark:border-white/10 dark:bg-slate-950/40">
                <div className="border-b border-slate-200 pb-2 dark:border-white/10">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#ed1c24]" /> FAVICON & TÊN WEBSITE TRÊN TRÌNH DUYỆT
                  </Label>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Cấu hình biểu tượng Favicon và tiêu đề hiển thị trên Tab trình duyệt (Browser Tab Title). Tách biệt hoàn toàn với tên Header.
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Tên website trên tab trình duyệt (Browser Tab Title)</Label>
                  <Input
                    value={browserSiteTitle}
                    onChange={(e) => setBrowserSiteTitle(e.target.value)}
                    placeholder="GZV - The Voice of Genzers"
                    className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 bg-white dark:border-white/10 dark:bg-slate-900"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">Xuất hiện trên thẻ tab của Chrome/Safari/Edge.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-1">
                  {/* Favicon picker */}
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Favicon Trình duyệt</Label>
                    <div className="flex gap-2">
                      <Input
                        value={faviconUrl}
                        onChange={(e) => setFaviconUrl(e.target.value)}
                        placeholder="/logo/favicon.ico"
                        className="flex-1 h-9 text-xs font-mono rounded-none border-slate-200 dark:border-white/10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPickMedia("favicon")}
                        className="h-9 rounded-none text-xs font-black uppercase border-slate-200 dark:border-white/10"
                      >
                        <ImageIcon className="h-4 w-4 mr-1 text-[#ed1c24]" /> Chọn ảnh
                      </Button>
                      {faviconUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFaviconUrl("")}
                          className="h-9 rounded-none text-xs font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold">Kích thước vuông ≥ 64×64 (PNG / ICO / SVG).</p>
                  </div>

                  {/* Live Preview Tab Trình Duyệt */}
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      Mô phỏng Tab trình duyệt (Browser Tab Preview)
                    </Label>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-none h-[110px] flex items-end">
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 border-t-2 border-t-[#ed1c24] border-x border-slate-700 text-xs font-semibold max-w-full rounded-t-md shadow-md text-white">
                        {faviconUrl ? (
                          <img src={faviconUrl} alt="Favicon" className="w-4 h-4 object-contain shrink-0" />
                        ) : (
                          <Globe className="w-4 h-4 text-[#ed1c24] shrink-0" />
                        )}
                        <span className="truncate max-w-[190px] text-slate-200 text-[11px] font-medium">
                          {browserSiteTitle || siteTitle || "GZV - The Voice of Genzers"}
                        </span>
                        <X className="w-3 h-3 text-slate-400 ml-2 shrink-0 cursor-default" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* SUB-TAB 2: FOOTER */}
        {/* ========================================================================= */}
        <TabsContent value="footer" className="space-y-6 mt-0">
          {/* Live Preview Footer at Top - MATCHING PUBLIC FOOTER 100% */}
          <Card className="border-slate-200 rounded-none shadow-xs bg-white overflow-hidden dark:border-white/10 dark:bg-slate-900">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between dark:border-white/10 dark:bg-slate-950">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-none bg-[#ed1c24] animate-pulse" />
                Xem trước trực tiếp Chân trang (Live Preview Footer Public)
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">
                Bấm trực tiếp vào từng cột bên dưới để chọn chỉnh sửa
              </span>
            </div>

            {/* Public Footer UI Container */}
            <div
              className="relative mt-0 border-t border-slate-800 bg-[#050505] text-white select-none transition-colors"
              style={{
                backgroundColor: footerBgColor || "#050505",
                color: footerTextColor || "#ffffff",
              }}
            >
              <div className="container mx-auto px-4 py-10 relative max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Cột 1: Brand + Address */}
                  <div
                    onClick={() => setActiveFooterCol(1)}
                    className={`space-y-4 rounded-none transition-all cursor-pointer p-3 border ${activeFooterCol === 1
                      ? "border-[#ed1c24] bg-[#ed1c24]/10 ring-2 ring-[#ed1c24]"
                      : "border-white/10 hover:border-[#ed1c24]/60 hover:bg-white/5"
                      }`}
                  >
                    <div className="inline-flex items-center gap-2">
                      {footerLogoUrl ? (
                        <img src={footerLogoUrl} alt={siteTitle} className="h-10 object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded-none bg-[#ed1c24] text-white flex items-center justify-center">
                          <span className="font-extrabold text-xs">GZV</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed font-semibold opacity-90">
                      {brandTagline || "GZV Center — Hệ sinh thái đào tạo, tư vấn và triển khai dự án thực chiến."}
                    </p>
                    <ul className="space-y-2 text-xs font-semibold">
                      {addressItems.filter((item) => item.value.trim() || item.label.trim()).length > 0 ? (
                        addressItems
                          .filter((item) => item.value.trim() || item.label.trim())
                          .map((item, idx: number) => {
                            return (
                              <li key={item.id || idx} className="flex items-start gap-2 text-slate-300">
                                <MapPin className="h-3.5 w-3.5 text-[#ed1c24] mt-0.5 shrink-0" />
                                <div className="leading-relaxed">
                                  {item.label && item.value ? (
                                    <span>
                                      <strong className="text-white font-bold">{item.label}: </strong>
                                      <span>{item.value}</span>
                                    </span>
                                  ) : (
                                    <span>{item.value || item.label}</span>
                                  )}
                                </div>
                              </li>
                            )
                          })
                      ) : (
                        <li className="flex items-start gap-2 text-slate-300">
                          <MapPin className="h-3.5 w-3.5 text-[#ed1c24] mt-0.5 shrink-0" />
                          <span className="leading-relaxed">279 Nguyễn Tri Phương, Phường Diên Hồng, TP.HCM</span>
                        </li>
                      )}
                      {contactPhone && (
                        <li className="flex items-center gap-2 text-slate-300">
                          <Phone className="h-3.5 w-3.5 text-[#ed1c24] shrink-0" />
                          <span>{contactPhone}</span>
                        </li>
                      )}
                      {contactEmail && (
                        <li className="flex items-center gap-2 text-slate-300">
                          <Mail className="h-3.5 w-3.5 text-[#ed1c24] shrink-0" />
                          <span>{contactEmail}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Cột 2: Quick Links */}
                  <div
                    onClick={() => setActiveFooterCol(2)}
                    className={`space-y-4 rounded-none transition-all cursor-pointer p-3 border ${activeFooterCol === 2
                      ? "border-[#ed1c24] bg-[#ed1c24]/10 ring-2 ring-[#ed1c24]"
                      : "border-white/10 hover:border-[#ed1c24]/60 hover:bg-white/5"
                      }`}
                  >
                    <h3 className="font-black text-xs uppercase tracking-wider relative inline-block text-white pb-1 border-b-2 border-[#ed1c24]">
                      Liên kết nhanh
                    </h3>
                    <ul className="space-y-2 text-xs font-semibold">
                      {footerLinks.map((l: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-none bg-[#ed1c24]" />
                          <span>{l.label}</span>
                          <ArrowUpRight className="h-3 w-3 text-[#ed1c24] shrink-0" />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cột 3: Social Networks */}
                  <div
                    onClick={() => setActiveFooterCol(3)}
                    className={`space-y-4 rounded-none transition-all cursor-pointer p-3 border ${activeFooterCol === 3
                      ? "border-[#ed1c24] bg-[#ed1c24]/10 ring-2 ring-[#ed1c24]"
                      : "border-white/10 hover:border-[#ed1c24]/60 hover:bg-white/5"
                      }`}
                  >
                    <h3 className="font-black text-xs uppercase tracking-wider relative inline-block text-white pb-1 border-b-2 border-[#ed1c24]">
                      Kết nối với chúng tôi
                    </h3>
                    {socialsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {socialsList.map((s) => {
                          const Icon = s.icon
                          return (
                            <div
                              key={s.label}
                              className="w-8 h-8 rounded-none bg-[#ed1c24] text-white flex items-center justify-center shadow-xs"
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {fbEmbedSrc && (
                      <div className="w-full max-w-[220px] overflow-hidden rounded-none bg-black mt-2">
                        <iframe
                          src={fbEmbedSrc}
                          width="220"
                          height="130"
                          style={{ border: "none", overflow: "hidden" }}
                          scrolling="no"
                          frameBorder="0"
                          allow="encrypted-media"
                          title="Facebook Page"
                          className="w-[220px] max-w-full h-[130px] block border-0"
                        />
                      </div>
                    )}
                  </div>

                  {/* Cột 4: Newsletter & Contact Person */}
                  <div
                    onClick={() => setActiveFooterCol(4)}
                    className={`space-y-3 rounded-none transition-all cursor-pointer p-3 border ${activeFooterCol === 4
                      ? "border-[#ed1c24] bg-[#ed1c24]/10 ring-2 ring-[#ed1c24]"
                      : "border-white/10 hover:border-[#ed1c24]/60 hover:bg-white/5"
                      }`}
                  >
                    <h3 className="font-black text-xs uppercase tracking-wider relative inline-block text-white pb-1 border-b-2 border-[#ed1c24]">
                      Đăng ký nhận tin mới
                    </h3>
                    <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">Nhận thông tin hoạt động và chương trình mới từ GZV.</p>
                    <div className="relative mt-1">
                      <input
                        type="email"
                        disabled
                        placeholder="Email của bạn..."
                        className="w-full pl-3 pr-8 py-1.5 h-9 rounded-none bg-white text-slate-900 text-xs font-semibold"
                      />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#ed1c24] text-white flex items-center justify-center">
                        <Send className="h-3 w-3" />
                      </div>
                    </div>
                    {(contactPerson || contactPersonPhone || contactPersonEmail) && (
                      <div className="mt-3 p-3 rounded-none border text-[11px] font-semibold bg-white text-slate-900 border-slate-200">
                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-500">Liên hệ GZV</p>
                        <p className="font-bold">{contactPerson || "GZV Ltd"}</p>
                        {contactPersonPhone && <p className="text-slate-600">Điện thoại: {contactPersonPhone}</p>}
                        {contactPersonEmail && <p className="text-slate-600">Email: {contactPersonEmail}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom bar / Copyright */}
                <div
                  onClick={() => setActiveFooterCol("copyright")}
                  className={`mt-8 pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-400 font-semibold rounded-none cursor-pointer p-2 ${activeFooterCol === "copyright" ? "border-[#ed1c24] bg-[#ed1c24]/10 ring-2 ring-[#ed1c24]" : "hover:bg-white/5"
                    }`}
                >
                  <p>{copyrightText || `© 2026 ${siteTitle}. All rights reserved.`}</p>
                  <div className="flex items-center gap-4 text-[11px]">
                    {showTerms && <span className="hover:text-[#ed1c24]">Điều khoản sử dụng</span>}
                    {showPrivacy && <span className="hover:text-[#ed1c24]">Bảo mật</span>}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 1. Tùy chỉnh màu sắc Footer */}
          <Card className="border-slate-200 rounded-none shadow-xs bg-white dark:border-white/10 dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-white/10">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#ed1c24]" /> Màu sắc Footer (Mặc định: Nền đen, Chữ trắng)
              </CardTitle>
              <CardDescription className="text-xs font-semibold">
                Tùy chỉnh màu nền và màu liên kết riêng cho chân trang (Footer).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Màu nền */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Màu nền Footer</Label>
                    {footerBgColor && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFooterBgColor("")}
                        title="Reset về màu nền mặc định (#050505)"
                        className="h-6 px-2 text-[10px] font-bold text-slate-500 hover:text-red-600 rounded-none transition-colors"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Reset
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 items-center pt-1">
                    <input
                      type="color"
                      value={footerBgColor || "#050505"}
                      onChange={(e) => setFooterBgColor(e.target.value)}
                      className="w-9 h-9 rounded-none cursor-pointer border border-slate-200 shrink-0"
                      style={{ padding: 1 }}
                    />
                    <Input
                      value={footerBgColor}
                      onChange={(e) => setFooterBgColor(e.target.value)}
                      placeholder="#050505"
                      className="flex-1 font-mono text-xs uppercase rounded-none border-slate-200 h-9 bg-white dark:border-white/10 dark:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Màu liên kết */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Màu liên kết & Icon</Label>
                    {footerLinkColor && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFooterLinkColor("")}
                        title="Reset về màu liên kết mặc định (#ED1C24)"
                        className="h-6 px-2 text-[10px] font-bold text-slate-500 hover:text-red-600 rounded-none transition-colors"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Reset
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 items-center pt-1">
                    <input
                      type="color"
                      value={footerLinkColor || "#ed1c24"}
                      onChange={(e) => setFooterLinkColor(e.target.value)}
                      className="w-9 h-9 rounded-none cursor-pointer border border-slate-200 shrink-0"
                      style={{ padding: 1 }}
                    />
                    <Input
                      value={footerLinkColor}
                      onChange={(e) => setFooterLinkColor(e.target.value)}
                      placeholder="#ED1C24"
                      className="flex-1 font-mono text-xs uppercase rounded-none border-slate-200 h-9 bg-white dark:border-white/10 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* List of Footer Columns Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#ed1c24]" /> Chọn cột Footer để chỉnh sửa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Column 1 */}
              <div
                onClick={() => setActiveFooterCol(1)}
                className={`p-3.5 border rounded-none cursor-pointer transition-all ${activeFooterCol === 1
                  ? "bg-red-50/60 border-[#ed1c24] text-slate-900 font-bold dark:bg-red-950/30 dark:text-white"
                  : "bg-white border-slate-200 hover:border-slate-400 text-slate-500 dark:border-white/10 dark:bg-slate-900"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-none border-red-300 text-[#ed1c24]">Cột 1</Badge>
                  {activeFooterCol === 1 && <CheckCircle2 className="h-4 w-4 text-[#ed1c24]" />}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mt-2 text-slate-900 dark:text-white">Thương hiệu & Địa chỉ</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Logo, tagline, địa chỉ, sđt, email</p>
              </div>

              {/* Column 2 */}
              <div
                onClick={() => setActiveFooterCol(2)}
                className={`p-3.5 border rounded-none cursor-pointer transition-all ${activeFooterCol === 2
                  ? "bg-red-50/60 border-[#ed1c24] text-slate-900 font-bold dark:bg-red-950/30 dark:text-white"
                  : "bg-white border-slate-200 hover:border-slate-400 text-slate-500 dark:border-white/10 dark:bg-slate-900"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-none border-red-300 text-[#ed1c24]">Cột 2</Badge>
                  {activeFooterCol === 2 && <CheckCircle2 className="h-4 w-4 text-[#ed1c24]" />}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mt-2 text-slate-900 dark:text-white">Liên kết nhanh</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Danh sách liên kết menu phụ</p>
              </div>

              {/* Column 3 */}
              <div
                onClick={() => setActiveFooterCol(3)}
                className={`p-3.5 border rounded-none cursor-pointer transition-all ${activeFooterCol === 3
                  ? "bg-red-50/60 border-[#ed1c24] text-slate-900 font-bold dark:bg-red-950/30 dark:text-white"
                  : "bg-white border-slate-200 hover:border-slate-400 text-slate-500 dark:border-white/10 dark:bg-slate-900"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-none border-red-300 text-[#ed1c24]">Cột 3</Badge>
                  {activeFooterCol === 3 && <CheckCircle2 className="h-4 w-4 text-[#ed1c24]" />}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mt-2 text-slate-900 dark:text-white">Kết nối mạng xã hội</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">FB, Youtube, Insta, TikTok, Embed</p>
              </div>

              {/* Column 4 */}
              <div
                onClick={() => setActiveFooterCol(4)}
                className={`p-3.5 border rounded-none cursor-pointer transition-all ${activeFooterCol === 4
                  ? "bg-red-50/60 border-[#ed1c24] text-slate-900 font-bold dark:bg-red-950/30 dark:text-white"
                  : "bg-white border-slate-200 hover:border-slate-400 text-slate-500 dark:border-white/10 dark:bg-slate-900"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-none border-red-300 text-[#ed1c24]">Cột 4</Badge>
                  {activeFooterCol === 4 && <CheckCircle2 className="h-4 w-4 text-[#ed1c24]" />}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mt-2 text-slate-900 dark:text-white">Đăng ký nhận tin BĐH</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Newsletter, thông tin người liên hệ</p>
              </div>

              {/* Bottom Bar / Copyright */}
              <div
                onClick={() => setActiveFooterCol("copyright")}
                className={`p-3.5 border rounded-none cursor-pointer transition-all ${activeFooterCol === "copyright"
                  ? "bg-red-50/60 border-[#ed1c24] text-slate-900 font-bold dark:bg-red-950/30 dark:text-white"
                  : "bg-white border-slate-200 hover:border-slate-400 text-slate-500 dark:border-white/10 dark:bg-slate-900"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-none border-red-300 text-[#ed1c24]">Mục riêng</Badge>
                  {activeFooterCol === "copyright" && <CheckCircle2 className="h-4 w-4 text-[#ed1c24]" />}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mt-2 text-slate-900 dark:text-white">Bản quyền & Điều khoản</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Copyright, Điều khoản, Bảo mật</p>
              </div>
            </div>
          </div>

          {/* Active Column Form */}
          <Card className="border-slate-200 rounded-none shadow-xs bg-white dark:border-white/10 dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-white/10 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="h-4 w-4 text-[#ed1c24]" />
                {activeFooterCol === 1 && "Chỉnh sửa Cột 1: Thông tin thương hiệu và địa chỉ"}
                {activeFooterCol === 2 && "Chỉnh sửa Cột 2: Liên kết nhanh"}
                {activeFooterCol === 3 && "Chỉnh sửa Cột 3: Kết nối mạng xã hội"}
                {activeFooterCol === 4 && "Chỉnh sửa Cột 4: Đăng ký nhận tin và thông tin liên hệ"}
                {activeFooterCol === "copyright" && "Chỉnh sửa Mục riêng: Bản quyền & Điều khoản (Bottom Bar)"}
              </CardTitle>
              {onSave && (
                <Button
                  type="button"
                  size="sm"
                  onClick={onSave}
                  disabled={saving}
                  className="h-8 px-3 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {/* Form Cột 1 */}
              {activeFooterCol === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Logo Footer (`footer_logo_url`)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={footerLogoUrl}
                        onChange={(e) => setFooterLogoUrl(e.target.value)}
                        placeholder="/logo.webp"
                        className="flex-1 h-9 text-xs font-mono rounded-none border-slate-200 dark:border-white/10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPickMedia("footerLogo")}
                        className="h-9 rounded-none text-xs font-black uppercase border-slate-200 shrink-0 dark:border-white/10"
                      >
                        <ImageIcon className="h-4 w-4 mr-1 text-[#ed1c24]" /> Chọn ảnh
                      </Button>
                      {footerLogoUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFooterLogoUrl("")}
                          className="h-9 rounded-none text-xs font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Khẩu hiệu thương hiệu (Brand Tagline)</Label>
                    <Textarea
                      rows={2}
                      value={brandTagline}
                      onChange={(e) => setBrandTagline(e.target.value)}
                      placeholder="Mô tả ngắn gọn giới thiệu tổ chức/cộng đồng..."
                      className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold dark:border-white/10"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Danh sách địa chỉ / Cơ sở ({addressItems.length})
                        </Label>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          Kéo <span className="text-[#ed1c24]">⠿</span> để đổi thứ tự. Ô <b>#</b> hiển thị thứ tự, ô tiếp theo chỉnh sửa tên/nhãn (Trụ sở chính, Cơ sở 2...), ô cuối nhập địa chỉ.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addAddress}
                        className="h-7 text-[10px] font-black uppercase rounded-none border-slate-200 dark:border-white/10"
                      >
                        <Plus className="h-3 w-3 mr-1 text-[#ed1c24]" /> Thêm địa chỉ
                      </Button>
                    </div>

                    <DndContext
                      sensors={addressSensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleAddressDragEnd}
                    >
                      <SortableContext
                        items={addressItems.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2 mt-2">
                          {addressItems.map((item, idx: number) => (
                            <SortableAddressRow
                              key={item.id}
                              id={item.id}
                              item={item}
                              index={idx}
                              total={addressItems.length}
                              onUpdate={updateAddress}
                              onDelete={removeAddress}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Số điện thoại liên hệ</Label>
                      <Input
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Hotline / SĐT..."
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 dark:border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Email liên hệ chung</Label>
                      <Input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="gzv.one@gmail.com..."
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 dark:border-white/10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Cột 2 */}
              {activeFooterCol === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Danh sách liên kết nhanh</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addFooterLink}
                      className="h-8 text-[10px] font-black uppercase rounded-none border-slate-200 dark:border-white/10"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1 text-[#ed1c24]" /> Thêm liên kết
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {footerLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950">
                        <Input
                          value={link.label}
                          onChange={(e) => updateFooterLink(idx, "label", e.target.value)}
                          placeholder="Nhãn liên kết"
                          className="flex-1 h-9 text-xs rounded-none border-slate-200 font-semibold dark:border-white/10"
                        />
                        <Input
                          value={link.url || link.href || ""}
                          onChange={(e) => updateFooterLink(idx, "url", e.target.value)}
                          placeholder="Đường dẫn URL (/gioi-thieu, /du-an...)"
                          className="flex-1 h-9 text-xs rounded-none border-slate-200 font-mono dark:border-white/10"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFooterLink(idx)}
                          className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {footerLinks.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6 font-semibold border border-dashed border-slate-200 dark:border-white/10">
                        Chưa có liên kết nhanh nào. Bấm nút "Thêm liên kết" để tạo.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Form Cột 3 */}
              {activeFooterCol === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950">
                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Hiển thị biểu tượng Mạng xã hội</Label>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Bật/tắt các icon liên kết mạng xã hội ở chân trang</p>
                    </div>
                    <Switch checked={showSocial} onCheckedChange={setShowSocial} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Facebook URL</Label>
                      <Input
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-mono h-10 dark:border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">YouTube URL</Label>
                      <Input
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-mono h-10 dark:border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Instagram URL</Label>
                      <Input
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-mono h-10 dark:border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">TikTok URL</Label>
                      <Input
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                        placeholder="https://tiktok.com/@..."
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-mono h-10 dark:border-white/10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Facebook Fanpage Embed URL</Label>
                    <Input
                      value={fbPageUrl}
                      onChange={(e) => setFbPageUrl(e.target.value)}
                      placeholder="https://www.facebook.com/gzv.one"
                      className="mt-1.5 rounded-none border-slate-200 text-xs font-mono h-10 dark:border-white/10"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Đường dẫn trang Facebook để hiển thị khung Fanpage trực tiếp ở Footer</p>
                  </div>
                </div>
              )}

              {/* Form Cột 4 */}
              {activeFooterCol === 4 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-semibold bg-slate-50 p-3 border border-slate-200 dark:border-white/10 dark:bg-slate-950">
                    Cột 4 bao gồm ô nhận tin Newsletter tự động cùng thông tin đại diện người liên hệ Ban điều hành.
                  </p>
                  <div>
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Tên Người liên hệ BĐH</Label>
                    <Input
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Nguyễn Văn A - Ban Điều Hành..."
                      className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 dark:border-white/10"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Điện thoại người liên hệ</Label>
                      <Input
                        value={contactPersonPhone}
                        onChange={(e) => setContactPersonPhone(e.target.value)}
                        placeholder="0987xxxxxx..."
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 dark:border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Email người liên hệ</Label>
                      <Input
                        value={contactPersonEmail}
                        onChange={(e) => setContactPersonEmail(e.target.value)}
                        placeholder="one.gzv@gmail.com..."
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 dark:border-white/10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Copyright & Bottom Bar */}
              {activeFooterCol === "copyright" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Nội dung bản quyền (Copyright)</Label>
                    <Input
                      value={copyrightText}
                      onChange={(e) => setCopyrightText(e.target.value)}
                      placeholder="© 2026 GZV Center. All rights reserved."
                      className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 dark:border-white/10"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Điều khoản sử dụng */}
                    <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950/40">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Điều khoản sử dụng
                        </Label>
                        <Switch checked={showTerms} onCheckedChange={setShowTerms} />
                      </div>
                      <Input
                        value={termsUrl}
                        onChange={(e) => setTermsUrl(e.target.value)}
                        placeholder="/terms..."
                        disabled={!showTerms}
                        className="rounded-none border-slate-200 text-xs font-mono h-9 bg-white dark:border-white/10 dark:bg-slate-900 disabled:opacity-50"
                      />
                    </div>

                    {/* Chính sách bảo mật */}
                    <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-950/40">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Chính sách bảo mật
                        </Label>
                        <Switch checked={showPrivacy} onCheckedChange={setShowPrivacy} />
                      </div>
                      <Input
                        value={privacyUrl}
                        onChange={(e) => setPrivacyUrl(e.target.value)}
                        placeholder="/privacy..."
                        disabled={!showPrivacy}
                        className="rounded-none border-slate-200 text-xs font-mono h-9 bg-white dark:border-white/10 dark:bg-slate-900 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* SUB-TAB 3: SEO WEBSITE */}
        {/* ========================================================================= */}
        <TabsContent value="seo" className="space-y-6 mt-0">
          <Card className="border-slate-200 rounded-none shadow-xs bg-white dark:border-white/10 dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-white/10">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
                <Globe className="h-4 w-4 text-[#ed1c24]" /> Cấu hình SEO mặc định & Thẻ Social Open Graph
              </CardTitle>
              <CardDescription className="text-xs font-semibold">
                Tùy chỉnh thông tin tìm kiếm Google, chia sẻ liên kết trên Facebook, Zalo, Twitter cho trang web.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Cột trái: Form nhập SEO (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Nhóm 1: Thẻ SEO cơ bản */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-none space-y-4 dark:border-white/10 dark:bg-slate-950/40">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#ed1c24]" /> THẺ META SEO CHUẨN GOOGLE
                    </Label>

                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">SEO Title</Label>
                      <Input
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="GZV - The Voice of Genzers"
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 bg-white dark:border-white/10 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Meta Description</Label>
                      <Textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Mô tả trang web hiển thị trên kết quả tìm kiếm Google..."
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-medium min-h-[70px] bg-white dark:border-white/10 dark:bg-slate-900"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Keywords (Từ khóa)</Label>
                        <Input
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          placeholder="GZV, genz, mentoring, coaching..."
                          className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 bg-white dark:border-white/10 dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Tác giả (Author)</Label>
                        <Input
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          placeholder="GZV Center"
                          className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 bg-white dark:border-white/10 dark:bg-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Canonical URL</Label>
                      <Input
                        value={canonicalUrl}
                        onChange={(e) => setCanonicalUrl(e.target.value)}
                        placeholder="https://www.gzv.one"
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-mono h-10 bg-white dark:border-white/10 dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  {/* Nhóm 2: Open Graph & Social Sharing */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-none space-y-4 dark:border-white/10 dark:bg-slate-950/40">
                    <div className="border-b border-slate-200 pb-2 dark:border-white/10">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-[#ed1c24]" /> CHIA SẺ MẠNG XÃ HỘI (FACEBOOK, ZALO, TWITTER/X, LINKEDIN)
                      </Label>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Tự động đồng bộ chung cho tất cả các nền tảng mạng xã hội khi dán liên kết.
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Tiêu đề chia sẻ MXH (OG Title)</Label>
                      <Input
                        value={ogTitle}
                        onChange={(e) => setOgTitle(e.target.value)}
                        placeholder="GZV CENTER 2026"
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-semibold h-10 bg-white dark:border-white/10 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Mô tả chia sẻ MXH (OG Description)</Label>
                      <Textarea
                        value={ogDescription}
                        onChange={(e) => setOgDescription(e.target.value)}
                        placeholder="Nội dung mô tả xuất hiện bên dưới tiêu đề khi dán link trên Facebook / Zalo / Messenger..."
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-medium min-h-[70px] bg-white dark:border-white/10 dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Ảnh đại diện chia sẻ MXH (OG Image)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={ogImage}
                          onChange={(e) => setOgImage(e.target.value)}
                          placeholder="/og-image.jpg"
                          className="flex-1 h-9 text-xs font-mono rounded-none border-slate-200 dark:border-white/10"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onPickMedia("ogImage")}
                          className="h-9 rounded-none text-xs font-black uppercase border-slate-200 shrink-0 dark:border-white/10"
                        >
                          <ImageIcon className="h-4 w-4 mr-1 text-[#ed1c24]" /> Chọn ảnh
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold">Khuyến nghị tỉ lệ 1.91:1 (Kích thước 1200×630px PNG/JPG).</p>
                    </div>

                    <div>
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Canonical / Link URL (OG URL)</Label>
                      <Input
                        value={ogUrl}
                        onChange={(e) => setOgUrl(e.target.value)}
                        placeholder="https://www.gzv.one/"
                        className="mt-1.5 rounded-none border-slate-200 text-xs font-mono h-10 bg-white dark:border-white/10 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Cột phải: Live Preview mô phỏng chia sẻ link MXH (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="sticky top-6">
                    <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#ed1c24]" /> MÔ PHỎNG CHIA SẺ LIÊN KẾT (SOCIAL CARD PREVIEW)
                    </Label>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5 mb-3">
                      Xem trước thực tế hình ảnh và nội dung khi dán link trang web trên Facebook, Zalo, Messenger, Skype.
                    </p>

                    {/* Mockup Card Social Share */}
                    <div className="border border-slate-200 rounded-none bg-white shadow-md overflow-hidden space-y-0 dark:border-white/10 dark:bg-slate-900">
                      {/* Header card preview */}
                      <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:border-white/10 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-emerald-500 rounded-none" />
                          Open Graph Card Preview
                        </span>
                        <span className="font-mono text-[10px] uppercase">Facebook / Zalo</span>
                      </div>

                      {/* Image Preview Box */}
                      <div className="relative aspect-[1.91/1] w-full bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-white/10">
                        {ogImage || logoUrl ? (
                          <img
                            src={ogImage || logoUrl}
                            alt="Social Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4 space-y-1">
                            <Globe className="h-8 w-8 mx-auto text-slate-500" />
                            <p className="text-[11px] font-semibold text-slate-400">Chưa có ảnh đại diện OG Image</p>
                          </div>
                        )}
                      </div>

                      {/* Meta Text Details Box */}
                      <div className="p-4 bg-slate-50 space-y-1.5 dark:bg-slate-950">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">
                          {canonicalUrl ? (canonicalUrl.startsWith("http") ? new URL(canonicalUrl).hostname : canonicalUrl) : "GZV.ONE"}
                        </p>
                        <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 dark:text-white">
                          {ogTitle || seoTitle || browserSiteTitle || siteTitle || "GZV CENTER"}
                        </h4>
                        <p className="text-xs text-slate-500 font-normal line-clamp-3 dark:text-slate-400">
                          {ogDescription || metaDescription || "GZV - The Voice of Genzers. Đào tạo, mentoring, coaching và kết nối cộng đồng Gen Z."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
