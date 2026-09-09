'use client'

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/api-supabase"
import { toast } from "sonner"

type FieldType = "text" | "email" | "tel" | "number" | "url" | "textarea" | "select" | "radio" | "checkbox" | "date"

interface FormField {
  id: string
  field_key: string
  label: string
  field_type: FieldType
  placeholder?: string | null
  help_text?: string | null
  options: Array<{ label: string; value: string }> | string[]
  is_required: boolean
  is_active: boolean
  sort_order: number
  width: "full" | "half"
}

type ContactItem = { icon?: string; title: string; lines: string[]; href?: string }
type SocialLink = { icon?: string; label: string; href: string; visible?: boolean }
type ContactSettings = {
  hero_badge: string
  hero_title: string
  hero_subtitle: string
  form_title: string
  form_description: string
  submit_label: string
  success_message: string
  error_message: string
  info_title: string
  social_title: string
  map_title: string
  map_embed_url?: string | null
  map_enabled: boolean
  contact_items: ContactItem[]
  social_links: SocialLink[]
  stats: Array<{ value: string; label: string }>
}

const DEFAULT_FIELDS: FormField[] = [
  { id: "d1", field_key: "name", label: "Họ và tên", field_type: "text", placeholder: "Nhập họ và tên...", options: [], is_required: true, is_active: true, sort_order: 1, width: "half" },
  { id: "d2", field_key: "email", label: "Email", field_type: "email", placeholder: "Nhập địa chỉ email...", options: [], is_required: true, is_active: true, sort_order: 2, width: "half" },
  { id: "d3", field_key: "phone", label: "Số điện thoại", field_type: "tel", placeholder: "Nhập số điện thoại...", options: [], is_required: false, is_active: true, sort_order: 3, width: "half" },
  { id: "d4", field_key: "subject", label: "Chủ đề", field_type: "text", placeholder: "VD: Hợp tác / Tài trợ", options: [], is_required: false, is_active: true, sort_order: 4, width: "half" },
  { id: "d5", field_key: "message", label: "Nội dung", field_type: "textarea", placeholder: "Cho chúng tôi biết bạn đang nghĩ gì...", options: [], is_required: true, is_active: true, sort_order: 5, width: "full" },
]

const DEFAULT_MAP =
  "https://maps.google.com/maps?q=230/5/10%20V%C4%A9nh%20Vi%E1%BB%85n%2C%20Ph%C6%B0%E1%BB%9Dng%20V%C6%B0%E1%BB%9Dn%20L%C3%A0i%2C%20TP.%20HCM&t=&z=16&ie=UTF8&iwloc=&output=embed"

function getSafeMapEmbedUrl(url?: string | null, fallbackAddress?: string): string {
  const addressQuery = fallbackAddress || "230/5/10 Vĩnh Viễn, Phường Vườn Lài, TP. HCM"
  const defaultEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(addressQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`

  if (!url || typeof url !== "string" || !url.trim()) {
    return defaultEmbed
  }

  let clean = url.trim()

  // Handle full iframe snippet pasted by admin
  if (clean.includes("<iframe") && clean.includes("src=")) {
    const match = clean.match(/src=["']([^"']+)["']/)
    if (match && match[1]) clean = match[1]
  }

  // Handle valid embed URLs
  if (clean.includes("/maps/embed") || clean.includes("output=embed")) {
    return clean
  }

  // Fallback for regular Google links that block iframes
  const q = encodeURIComponent(addressQuery)
  return `https://maps.google.com/maps?q=${q}&t=&z=16&ie=UTF8&iwloc=&output=embed`
}

const DEFAULT_SETTINGS: ContactSettings = {
  hero_badge: "LIÊN HỆ GZV",
  hero_title: "KẾT NỐI VỚI GZV",
  hero_subtitle: "Phản hồi nhanh trong vòng 24 giờ làm việc.",
  form_title: "GỬI TIN NHẮN",
  form_description: "Chúng tôi sẽ phản hồi qua email bạn cung cấp.",
  submit_label: "GỬI TIN NHẮN",
  success_message: "Cảm ơn bạn! Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.",
  error_message: "Không gửi được tin nhắn. Vui lòng thử lại sau.",
  info_title: "THÔNG TIN LIÊN HỆ",
  social_title: "THEO DÕI CHÚNG TÔI",
  map_title: "Tìm chúng tôi trên bản đồ",
  map_embed_url: DEFAULT_MAP,
  map_enabled: true,
  contact_items: [
    { icon: "mail", title: "EMAIL", lines: ["vsm.org.vn@gmail.com"], href: "mailto:vsm.org.vn@gmail.com" },
    { icon: "phone", title: "HOTLINE", lines: ["0329 381 489"], href: "tel:0329381489" },
    { icon: "map", title: "ĐỊA CHỈ", lines: ["139 Nguyễn Thị Thập, Tân Hưng, Q.7, TP.HCM"] },
  ],
  social_links: [
    { icon: "facebook", label: "Facebook", href: "https://www.facebook.com/gzv.one", visible: true },
    { icon: "youtube", label: "YouTube", href: "https://youtube.com", visible: true },
  ],
  stats: [
    { value: "+84", label: "Điện thoại" },
    { value: "24h", label: "Phản hồi" },
    { value: "100%", label: "Tin cậy" },
  ],
}

const iconMap: Record<string, any> = { map: MapPin, phone: Phone, mail: Mail, clock: Clock }
const socialIconMap: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  zalo: MessageSquare,
  message: MessageSquare,
  mail: Mail,
  phone: Phone,
}

function normalizeOptions(raw: any): Array<{ label: string; value: string }> {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item: any) =>
      typeof item === "string"
        ? { label: item, value: item }
        : { label: String(item.label ?? item.value ?? ""), value: String(item.value ?? item.label ?? "") }
    )
    .filter((item) => item.value)
}

export interface ContactFormProps {
  info_title?: string
  info_subtitle?: string
  form_title?: string
  form_description?: string
  submit_label?: string
  success_message?: string
  error_message?: string
  email?: string
  phone?: string
  address?: string
  working_hours?: string
  social_facebook?: string
  social_youtube?: string
  social_instagram?: string
  social_title?: string
  map_title?: string
  map_embed_url?: string | null
  map_enabled?: boolean
  contact_items?: ContactItem[]
  social_links?: SocialLink[]
}

export default function ContactForm(props: ContactFormProps = {}) {
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FIELDS)
  const [settings, setSettings] = useState<ContactSettings>(DEFAULT_SETTINGS)
  const [values, setValues] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    let mounted = true
      ; (async () => {
        const [fieldsResult, settingsResult, blockResult] = await Promise.all([
          supabase.from("contact_form_fields").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
          supabase.from("site_contact_settings").select("*").eq("id", 1).maybeSingle(),
          supabase.from("site_page_blocks").select("*").eq("page_slug", "lien-he").eq("component_type", "contact_form").maybeSingle(),
        ])
        if (!mounted) return
        if (!fieldsResult.error && fieldsResult.data?.length) {
          setFields(
            fieldsResult.data.map((row: any) => ({
              ...row,
              options: normalizeOptions(row.options),
              width: row.width === "half" ? "half" : "full",
            })) as FormField[]
          )
        }

        let merged: ContactSettings = { ...DEFAULT_SETTINGS }
        if (!settingsResult.error && settingsResult.data) {
          merged = { ...merged, ...settingsResult.data }
        }

        if (!blockResult.error && blockResult.data?.props) {
          const bp = blockResult.data.props
          if (bp.info_title) merged.info_title = bp.info_title
          if (bp.info_subtitle) merged.hero_subtitle = bp.info_subtitle
          if (bp.form_title) merged.form_title = bp.form_title
          if (bp.form_description) merged.form_description = bp.form_description
          if (bp.submit_label) merged.submit_label = bp.submit_label
          if (bp.success_message) merged.success_message = bp.success_message
          if (bp.map_title) merged.map_title = bp.map_title
          if (bp.map_embed_url) merged.map_embed_url = bp.map_embed_url
          if (bp.map_enabled !== undefined) merged.map_enabled = bp.map_enabled
          if (bp.email || bp.phone || bp.address || bp.working_hours) {
            const items: ContactItem[] = []
            if (bp.email) items.push({ icon: "mail", title: "EMAIL", lines: [bp.email], href: `mailto:${bp.email}` })
            if (bp.phone) items.push({ icon: "phone", title: "HOTLINE", lines: [bp.phone], href: `tel:${bp.phone}` })
            if (bp.address) items.push({ icon: "map", title: "ĐỊA CHỈ", lines: [bp.address] })
            if (bp.working_hours) items.push({ icon: "clock", title: "GIỜ LÀM VIỆC", lines: [bp.working_hours] })
            if (items.length > 0) merged.contact_items = items
          }
          if (bp.social_facebook || bp.social_youtube) {
            const sLinks: SocialLink[] = []
            if (bp.social_facebook) sLinks.push({ icon: "facebook", label: "Facebook", href: bp.social_facebook, visible: true })
            if (bp.social_youtube) sLinks.push({ icon: "youtube", label: "YouTube", href: bp.social_youtube, visible: true })
            if (sLinks.length > 0) merged.social_links = sLinks
          }
        }

        setSettings(merged)
      })().catch(() => undefined)
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setValues((previous) => {
      const next: Record<string, any> = {}
      for (const field of fields) next[field.field_key] = previous[field.field_key] ?? (field.field_type === "checkbox" ? false : "")
      return next
    })
  }, [fields])

  const activeSettings = useMemo(() => {
    const s: ContactSettings = { ...settings }
    if (props.info_title) s.info_title = props.info_title
    if (props.info_subtitle) s.hero_subtitle = props.info_subtitle
    if (props.form_title) s.form_title = props.form_title
    if (props.form_description) s.form_description = props.form_description
    if (props.submit_label) s.submit_label = props.submit_label
    if (props.success_message) s.success_message = props.success_message
    if (props.error_message) s.error_message = props.error_message
    if (props.map_title) s.map_title = props.map_title
    if (props.map_embed_url !== undefined && props.map_embed_url !== null) s.map_embed_url = props.map_embed_url
    if (props.map_enabled !== undefined) s.map_enabled = props.map_enabled
    if (props.social_title) s.social_title = props.social_title

    if (Array.isArray(props.contact_items) && props.contact_items.length > 0) {
      s.contact_items = props.contact_items
    } else if (props.email || props.phone || props.address || props.working_hours) {
      const items: ContactItem[] = []
      if (props.email) items.push({ icon: "mail", title: "EMAIL", lines: [props.email], href: `mailto:${props.email}` })
      if (props.phone) items.push({ icon: "phone", title: "HOTLINE", lines: [props.phone], href: `tel:${props.phone}` })
      if (props.address) items.push({ icon: "map", title: "ĐỊA CHỈ", lines: [props.address] })
      if (props.working_hours) items.push({ icon: "clock", title: "GIỜ LÀM VIỆC", lines: [props.working_hours] })
      if (items.length > 0) s.contact_items = items
    }

    if (Array.isArray(props.social_links) && props.social_links.length > 0) {
      s.social_links = props.social_links
    } else if (props.social_facebook || props.social_youtube || props.social_instagram) {
      const links: SocialLink[] = []
      if (props.social_facebook) links.push({ icon: "facebook", label: "Facebook", href: props.social_facebook, visible: true })
      if (props.social_youtube) links.push({ icon: "youtube", label: "YouTube", href: props.social_youtube, visible: true })
      if (props.social_instagram) links.push({ icon: "instagram", label: "Instagram", href: props.social_instagram, visible: true })
      s.social_links = links
    }

    return s
  }, [settings, props])

  const visibleSocials = useMemo(
    () => activeSettings.social_links.filter((link) => link.visible !== false && link.href),
    [activeSettings.social_links]
  )

  // Filter out clock item from main contact items to render in dedicated working hours row if present
  const mainContactItems = useMemo(
    () => activeSettings.contact_items.filter((i) => i.icon !== "clock"),
    [activeSettings.contact_items]
  )
  const clockItem = useMemo(
    () => activeSettings.contact_items.find((i) => i.icon === "clock"),
    [activeSettings.contact_items]
  )

  const setVal = (key: string, value: any) => setValues((previous) => ({ ...previous, [key]: value }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMsg("")

    for (const field of fields) {
      const value = values[field.field_key]
      if (field.is_required && (value === undefined || value === null || value === "" || value === false)) {
        const msg = `Vui lòng nhập "${field.label}".`
        setErrorMsg(msg)
        setSubmitStatus("error")
        toast.error(msg)
        setIsSubmitting(false)
        return
      }
    }

    const reserved = ["name", "email", "phone", "subject", "message"]
    const payload: any = {
      name: values.name ?? null,
      email: values.email ?? null,
      phone: values.phone ?? null,
      subject: values.subject ?? null,
      message: values.message ?? null,
      data: {},
      source: "lien-he",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    }
    for (const field of fields) {
      if (!reserved.includes(field.field_key)) payload.data[field.field_key] = values[field.field_key] ?? null
    }

    let submitError: string | null = null
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) submitError = (await response.json().catch(() => ({})))?.error || activeSettings.error_message
    } catch {
      const { error } = await supabase.from("contact_messages").insert(payload)
      submitError = error?.message || null
    }

    if (submitError) {
      setSubmitStatus("error")
      setErrorMsg(activeSettings.error_message)
      toast.error(activeSettings.error_message)
    } else {
      setSubmitStatus("success")
      toast.success(activeSettings.success_message)
      const cleared: Record<string, any> = {}
      for (const field of fields) cleared[field.field_key] = field.field_type === "checkbox" ? false : ""
      setValues(cleared)
    }
    setIsSubmitting(false)
  }

  const renderField = (field: FormField) => {
    const value = values[field.field_key] ?? ""
    const common = {
      id: field.field_key,
      name: field.field_key,
      required: field.is_required,
      placeholder: field.placeholder ?? "",
    }

    switch (field.field_type) {
      case "textarea":
        return (
          <Textarea
            {...common}
            rows={5}
            value={value}
            onChange={(event) => setVal(field.field_key, event.target.value)}
            className="rounded-none bg-[#f8fafc] border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#ed1c24] focus-visible:border-[#ed1c24] resize-none p-3.5"
          />
        )
      case "select":
        return (
          <Select value={value || undefined} onValueChange={(next) => setVal(field.field_key, next)}>
            <SelectTrigger className="rounded-none h-11 bg-[#f8fafc] border-slate-200 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-[#ed1c24]">
              <SelectValue placeholder={field.placeholder || "Chọn..."} />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {normalizeOptions(field.options).map((item) => (
                <SelectItem key={item.value} value={item.value} className="text-xs font-semibold">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "radio":
        return (
          <RadioGroup value={value} onValueChange={(next) => setVal(field.field_key, next)} className="flex flex-wrap gap-4 pt-1">
            {normalizeOptions(field.options).map((item) => (
              <div key={item.value} className="flex items-center gap-2">
                <RadioGroupItem id={`${field.field_key}-${item.value}`} value={item.value} />
                <Label htmlFor={`${field.field_key}-${item.value}`} className="text-xs font-bold text-slate-900 cursor-pointer">
                  {item.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "checkbox":
        return (
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id={field.field_key}
              checked={!!value}
              onCheckedChange={(checked) => setVal(field.field_key, !!checked)}
              className="rounded-none data-[state=checked]:bg-[#ed1c24] data-[state=checked]:border-[#ed1c24]"
            />
            <Label htmlFor={field.field_key} className="text-xs font-bold text-slate-900 cursor-pointer">
              {field.help_text || field.label} {field.is_required && <span className="text-[#ed1c24]">*</span>}
            </Label>
          </div>
        )
      case "date":
      case "number":
      case "url":
      case "email":
      case "tel":
        return (
          <Input
            {...common}
            type={field.field_type}
            value={value}
            onChange={(event) => setVal(field.field_key, event.target.value)}
            className="rounded-none h-11 bg-[#f8fafc] border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#ed1c24] focus-visible:border-[#ed1c24]"
          />
        )
      default:
        return (
          <Input
            {...common}
            type="text"
            value={value}
            onChange={(event) => setVal(field.field_key, event.target.value)}
            className="rounded-none h-11 bg-[#f8fafc] border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#ed1c24] focus-visible:border-[#ed1c24]"
          />
        )
    }
  }

  // Address text for map sub-heading
  const mapAddressDisplay =
    activeSettings.contact_items.find((i) => i.icon === "map")?.lines?.join(", ") ||
    "139 Nguyễn Thị Thập, Tân Hưng, Q.7, TP.HCM"

  return (
    <section className="bg-background min-h-screen py-12 md:py-16 text-foreground">
      <div className="container max-w-6xl mx-auto px-4 space-y-8">
        {/* Main Grid: Info (2 cols) & Form (3 cols) */}
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-5 items-start">
          {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="border border-slate-200 border-l-[6px] border-l-[#ed1c24] bg-white rounded-none overflow-hidden shadow-xs dark:border-white/10 dark:bg-slate-900">
              {/* Brand Header */}
              <div className="bg-[#ed1c24] p-6 text-white">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                  {activeSettings.info_title || "THÔNG TIN LIÊN HỆ"}
                </h2>
                <p className="text-xs text-white/90 font-semibold mt-1">
                  {activeSettings.hero_subtitle || "Phản hồi nhanh trong vòng 24 giờ làm việc."}
                </p>
              </div>

              <div className="p-6 space-y-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {mainContactItems.map((item, i) => {
                  const Icon = iconMap[item.icon || ""] || MapPin
                  const content = item.lines.map((line, idx) => (
                    <span key={idx} className="block leading-snug">
                      {line}
                    </span>
                  ))

                  return (
                    <div
                      key={`${item.title}-${i}`}
                      className="flex items-start gap-4"
                    >
                      <div className="w-11 h-11 rounded-none bg-[#ed1c24] text-white flex items-center justify-center shrink-0 border border-[#ed1c24] shadow-xs">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-black block">
                          {item.title}
                        </span>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white hover:text-[#ed1c24] break-words transition-colors leading-snug block"
                          >
                            {content}
                          </a>
                        ) : (
                          <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white break-words leading-snug">
                            {content}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Working Hours row */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-bold">
                  <Clock className="h-4 w-4 text-[#ed1c24] shrink-0" />
                  <span>
                    {clockItem?.lines?.join(" | ") || "Thứ 2 – Thứ 6: 8:00 – 18:00"}
                  </span>
                </div>

                {/* Social Links Block */}
                {visibleSocials.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-black mb-3">
                      {activeSettings.social_title || "THEO DÕI CHÚNG TÔI"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {visibleSocials.map((link) => {
                        const Icon = socialIconMap[link.icon || ""] || MessageSquare
                        return (
                          <a
                            key={`${link.label}-${link.href}`}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-none bg-white dark:bg-slate-800 hover:bg-[#ed1c24] hover:text-white text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-colors flex items-center justify-center"
                            title={link.label}
                          >
                            <Icon className="h-4 w-4" />
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* CỘT PHẢI: FORM GỬI TIN NHẮN */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="border border-slate-200 border-t-4 border-t-[#ed1c24] bg-white dark:bg-slate-900 rounded-none shadow-xs p-6 md:p-8 dark:border-white/10">
              {submitStatus === "success" ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-none bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      {activeSettings.success_message}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                      Chúng tôi đã nhận được thông tin và sẽ liên hệ lại với bạn trong thời gian sớm nhất.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 rounded-none text-xs font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-slate-100 text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-white h-11 px-6"
                    onClick={() => setSubmitStatus(null)}
                  >
                    Gửi tin nhắn khác
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1 mb-5">
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      {activeSettings.form_title || "GỬI TIN NHẮN"}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {activeSettings.form_description || "Chúng tôi sẽ phản hồi qua email bạn cung cấp."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs font-semibold">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className={field.width === "half" ? "md:col-span-1" : "md:col-span-2"}
                      >
                        {field.field_type !== "checkbox" && (
                          <label
                            htmlFor={field.field_key}
                            className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5"
                          >
                            {field.label} {field.is_required && <span className="text-[#ed1c24]">*</span>}
                          </label>
                        )}
                        {renderField(field)}
                        {field.help_text && field.field_type !== "checkbox" && (
                          <p className="mt-1 text-[10px] font-semibold text-slate-400">
                            {field.help_text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {submitStatus === "error" && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs font-bold text-[#ed1c24]">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMsg || activeSettings.error_message}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#ed1c24] hover:bg-[#c91218] text-white rounded-none h-12 px-8 text-xs font-black uppercase tracking-widest gap-2 transition-colors inline-flex items-center shadow-xs"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>{isSubmitting ? "Đang gửi..." : activeSettings.submit_label || "GỬI TIN NHẮN"}</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* Section Bản đồ Google Map (Nằm trực tiếp bên dưới trong cùng Section Contact) */}
        {activeSettings.map_enabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-none overflow-hidden border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 shadow-xs"
          >
            <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-none bg-[#ed1c24] text-white flex items-center justify-center border border-[#ed1c24] shrink-0">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-black uppercase text-sm text-slate-900 dark:text-white">
                  {activeSettings.map_title || "Tìm chúng tôi trên bản đồ"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {mapAddressDisplay}
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 select-none h-[420px]">
              <iframe
                src={getSafeMapEmbedUrl(activeSettings.map_embed_url, mapAddressDisplay)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={activeSettings.map_title || "Bản đồ liên hệ"}
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
