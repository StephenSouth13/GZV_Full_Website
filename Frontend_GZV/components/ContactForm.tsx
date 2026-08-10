'use client'

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2, Clock, Facebook, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import PageBanner from "@/components/sections/PageBanner"
import { supabase } from "@/lib/api-supabase"

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
  { id: "d1", field_key: "name", label: "Họ và tên", field_type: "text", placeholder: "Nguyễn Văn A", options: [], is_required: true, is_active: true, sort_order: 1, width: "full" },
  { id: "d2", field_key: "email", label: "Email", field_type: "email", placeholder: "email@example.com", options: [], is_required: true, is_active: true, sort_order: 2, width: "half" },
  { id: "d3", field_key: "phone", label: "Số điện thoại", field_type: "tel", placeholder: "090 xxx xxxx", options: [], is_required: false, is_active: true, sort_order: 3, width: "half" },
  { id: "d4", field_key: "message", label: "Nội dung", field_type: "textarea", placeholder: "Tôi cần tư vấn về...", options: [], is_required: true, is_active: true, sort_order: 4, width: "full" },
]

const DEFAULT_SETTINGS: ContactSettings = {
  hero_badge: "LIÊN HỆ GZV",
  hero_title: "KẾT NỐI VỚI GZV",
  hero_subtitle: "Để lại thông tin, đội ngũ GZV sẽ phản hồi và đồng hành cùng nhu cầu của bạn.",
  form_title: "Gửi lời nhắn cho chúng tôi",
  form_description: "Điền thông tin bên dưới, đội ngũ GZV sẽ phản hồi trong vòng 24 giờ làm việc.",
  submit_label: "Gửi tin nhắn",
  success_message: "Cảm ơn bạn! Tin nhắn đã được gửi thành công.",
  error_message: "Không gửi được tin nhắn. Vui lòng thử lại sau.",
  info_title: "Thông tin liên hệ",
  social_title: "Mạng xã hội",
  map_title: "Bản đồ GZV",
  map_embed_url: "",
  map_enabled: true,
  contact_items: [
    { icon: "map", title: "Địa chỉ", lines: ["279 Nguyễn Tri Phương, Phường Diên Hồng, TP. Hồ Chí Minh"] },
    { icon: "phone", title: "Điện thoại", lines: ["(+84) 329 381 489"], href: "tel:+84329381489" },
    { icon: "mail", title: "Email", lines: ["gzv.one@gmail.com"], href: "mailto:gzv.one@gmail.com" },
    { icon: "clock", title: "Giờ làm việc", lines: ["Thứ 2 - Thứ 7: 8:00 - 17:30", "Chủ nhật: Nghỉ"] },
  ],
  social_links: [
    { icon: "facebook", label: "Facebook", href: "https://www.facebook.com/gzv.one", visible: true },
    { icon: "zalo", label: "Zalo", href: "https://zalo.me/g/acumou501", visible: true },
  ],
  stats: [
    { value: "+84", label: "Điện thoại" },
    { value: "24h", label: "Phản hồi" },
    { value: "100%", label: "Tin cậy" },
  ],
}

const iconMap: Record<string, any> = { map: MapPin, phone: Phone, mail: Mail, clock: Clock }
const socialIconMap: Record<string, any> = { facebook: Facebook, zalo: MessageSquare, message: MessageSquare, mail: Mail, phone: Phone }

function normalizeOptions(raw: any): Array<{ label: string; value: string }> {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item: any) => typeof item === "string" ? { label: item, value: item } : { label: String(item.label ?? item.value ?? ""), value: String(item.value ?? item.label ?? "") })
    .filter((item) => item.value)
}

export default function ContactForm() {
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FIELDS)
  const [settings, setSettings] = useState<ContactSettings>(DEFAULT_SETTINGS)
  const [values, setValues] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [fieldsResult, settingsResult] = await Promise.all([
        supabase.from("contact_form_fields").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("site_contact_settings").select("*").eq("id", 1).maybeSingle(),
      ])
      if (!mounted) return
      if (!fieldsResult.error && fieldsResult.data?.length) {
        setFields(fieldsResult.data.map((row: any) => ({ ...row, options: normalizeOptions(row.options), width: row.width === "half" ? "half" : "full" })) as FormField[])
      }
      if (!settingsResult.error && settingsResult.data) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsResult.data } as ContactSettings)
      }
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

  const visibleSocials = useMemo(() => settings.social_links.filter((link) => link.visible !== false && link.href), [settings.social_links])
  const setVal = (key: string, value: any) => setValues((previous) => ({ ...previous, [key]: value }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMsg("")

    for (const field of fields) {
      const value = values[field.field_key]
      if (field.is_required && (value === undefined || value === null || value === "" || value === false)) {
        setErrorMsg(`Vui lòng nhập "${field.label}".`)
        setSubmitStatus("error")
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
      if (!response.ok) submitError = (await response.json().catch(() => ({})))?.error || settings.error_message
    } catch {
      const { error } = await supabase.from("contact_messages").insert(payload)
      submitError = error?.message || null
    }

    if (submitError) {
      setSubmitStatus("error")
      setErrorMsg(settings.error_message)
    } else {
      setSubmitStatus("success")
      const cleared: Record<string, any> = {}
      for (const field of fields) cleared[field.field_key] = field.field_type === "checkbox" ? false : ""
      setValues(cleared)
    }
    setIsSubmitting(false)
  }

  const renderField = (field: FormField) => {
    const value = values[field.field_key] ?? ""
    const common = { id: field.field_key, name: field.field_key, required: field.is_required, placeholder: field.placeholder ?? "" }
    switch (field.field_type) {
      case "textarea":
        return <Textarea {...common} rows={5} value={value} onChange={(event) => setVal(field.field_key, event.target.value)} />
      case "select":
        return (
          <Select value={value || undefined} onValueChange={(next) => setVal(field.field_key, next)}>
            <SelectTrigger><SelectValue placeholder={field.placeholder || "Chọn..."} /></SelectTrigger>
            <SelectContent>{normalizeOptions(field.options).map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
          </Select>
        )
      case "radio":
        return (
          <RadioGroup value={value} onValueChange={(next) => setVal(field.field_key, next)} className="flex flex-wrap gap-4">
            {normalizeOptions(field.options).map((item) => (
              <div key={item.value} className="flex items-center gap-2">
                <RadioGroupItem id={`${field.field_key}-${item.value}`} value={item.value} />
                <Label htmlFor={`${field.field_key}-${item.value}`}>{item.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox id={field.field_key} checked={!!value} onCheckedChange={(checked) => setVal(field.field_key, !!checked)} />
            <Label htmlFor={field.field_key} className="text-sm font-semibold text-slate-700">{field.help_text || field.label}</Label>
          </div>
        )
      case "date":
      case "number":
      case "url":
      case "email":
      case "tel":
        return <Input {...common} type={field.field_type} value={value} onChange={(event) => setVal(field.field_key, event.target.value)} />
      default:
        return <Input {...common} type="text" value={value} onChange={(event) => setVal(field.field_key, event.target.value)} />
    }
  }

  return (
    <div className="bg-white text-slate-950">
      <PageBanner badge={settings.hero_badge} title={settings.hero_title} subtitle={settings.hero_subtitle} stats={settings.stats} />

      <section className="bg-white py-20">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <motion.div className="lg:col-span-3" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} viewport={{ once: true }}>
              <div className="border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-8">
                <div className="mb-8 border-l-4 border-[#ed1c24] pl-4">
                  <h2 className="text-3xl font-black uppercase text-slate-950">{settings.form_title}</h2>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{settings.form_description}</p>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {fields.map((field) => (
                    <div key={field.id} className={field.width === "half" ? "md:col-span-1" : "md:col-span-2"}>
                      {field.field_type !== "checkbox" && (
                        <label htmlFor={field.field_key} className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-700">
                          {field.label} {field.is_required && <span className="text-[#ed1c24]">*</span>}
                        </label>
                      )}
                      {renderField(field)}
                      {field.help_text && field.field_type !== "checkbox" && <p className="mt-1 text-xs font-semibold text-slate-500">{field.help_text}</p>}
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <Button type="submit" disabled={isSubmitting} className="h-14 w-full rounded-none bg-[#ed1c24] text-base font-black uppercase tracking-wide text-white hover:bg-[#c91218]">
                      {isSubmitting ? "Đang gửi..." : <span className="inline-flex items-center gap-2"><Send className="h-5 w-5" /> {settings.submit_label}</span>}
                    </Button>
                    {submitStatus === "success" && <StatusLine tone="success" icon={<CheckCircle2 className="h-5 w-5" />} text={settings.success_message} />}
                    {submitStatus === "error" && <StatusLine tone="error" icon={<AlertCircle className="h-5 w-5" />} text={errorMsg || settings.error_message} />}
                  </div>
                </form>
              </div>
            </motion.div>

            <motion.aside className="space-y-6 lg:col-span-2" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }} viewport={{ once: true }}>
              <InfoPanel title={settings.info_title}>
                {settings.contact_items.map((item, index) => {
                  const Icon = iconMap[item.icon || ""] || MapPin
                  const content = item.lines.map((line, lineIndex) => <p key={lineIndex}>{line}</p>)
                  return (
                    <div key={`${item.title}-${index}`} className="flex items-start gap-4 border-b border-slate-100 py-4 last:border-b-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-slate-200 bg-[#ed1c24] text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-black uppercase text-slate-900">{item.title}</h3>
                        {item.href ? <a href={item.href} className="mt-1 block text-sm font-semibold leading-6 text-slate-600 hover:text-[#ed1c24]">{content}</a> : <div className="mt-1 text-sm font-semibold leading-6 text-slate-600">{content}</div>}
                      </div>
                    </div>
                  )
                })}
              </InfoPanel>

              {visibleSocials.length > 0 && (
                <InfoPanel title={settings.social_title}>
                  <div className="grid grid-cols-2 gap-3">
                    {visibleSocials.map((link) => {
                      const Icon = socialIconMap[link.icon || ""] || MessageSquare
                      return (
                        <a key={`${link.label}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border border-slate-200 px-4 py-3 text-sm font-black uppercase text-slate-900 transition hover:border-[#ed1c24] hover:bg-[#ed1c24] hover:text-white">
                          <Icon className="h-5 w-5" /> {link.label}
                        </a>
                      )
                    })}
                  </div>
                </InfoPanel>
              )}
            </motion.aside>
          </div>
        </div>
      </section>

      {settings.map_enabled && settings.map_embed_url && (
        <section className="bg-slate-50 pb-20">
          <div className="container">
            <div className="mb-6 border-l-4 border-[#ed1c24] pl-4">
              <h2 className="text-3xl font-black uppercase text-slate-950">{settings.map_title}</h2>
            </div>
            <div className="h-[420px] overflow-hidden border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <iframe src={settings.map_embed_url} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={settings.map_title} />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-200 bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
      <h2 className="border-l-4 border-[#ed1c24] pl-3 text-xl font-black uppercase text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function StatusLine({ tone, icon, text }: { tone: "success" | "error"; icon: React.ReactNode; text: string }) {
  const cls = tone === "success" ? "text-emerald-600" : "text-[#ed1c24]"
  return <div className={`mt-4 flex items-center justify-center gap-2 text-sm font-bold ${cls}`}>{icon}<span>{text}</span></div>
}
