"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, ArrowUp, CreditCard, Link2, Loader2, Plus, Save, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { MediaLibraryButton } from "@/components/media/MediaLibraryButton"
import { CARD_LINK_ICONS } from "./GZVerModal"

type CardLink = {
  label: string
  url: string
  icon: string
  visible: boolean
  sort_order: number
}

type CardSettings = {
  company_line: string
  top_tagline: string
  card_title: string
  card_subtitle: string
  tagline: string
  email: string
  hotline: string
  website_label: string
  website_url: string
  qr_caption: string
  template_front_image_url: string
  template_back_image_url: string
  template_overlay: boolean
  demo_notice: string
  official_notice: string
  links: CardLink[]
  show_vcard: boolean
}

const defaultSettings: CardSettings = {
  company_line: "CÔNG TY TNHH GZV",
  top_tagline: "THE VOICE OF GENZ",
  card_title: "THẺ THÀNH VIÊN",
  card_subtitle: "GZVER",
  tagline: "THE VOICE OF GENZ",
  email: "one.gzv@gmail.com",
  hotline: "0329 381 489",
  website_label: "WWW.GZV.ONE",
  website_url: "https://www.gzv.one",
  qr_caption: "QUÉT QR XÁC THỰC HỒ SƠ",
  template_front_image_url: "",
  template_back_image_url: "",
  template_overlay: true,
  demo_notice: "Thẻ demo – bản xem trước tạm thời, chưa phải thẻ chính thức.",
  official_notice: "Thẻ thành viên chính thức do GZV LTD cấp.",
  links: [],
  show_vcard: true,
}

const textFields: Array<{ key: keyof CardSettings; label: string; mono?: boolean }> = [
  { key: "company_line", label: "Dòng công ty (mặt trước)" },
  { key: "top_tagline", label: "Slogan đầu thẻ (mặt trước)" },
  { key: "card_title", label: "Tên thẻ (mặt trước)" },
  { key: "card_subtitle", label: "Dòng phụ (mặt trước)" },
  { key: "tagline", label: "Slogan cuối thẻ (mặt sau)" },
  { key: "qr_caption", label: "Chú thích dưới QR (mặt sau)" },
  { key: "email", label: "Email in trên thẻ", mono: true },
  { key: "hotline", label: "Hotline in trên thẻ", mono: true },
  { key: "website_label", label: "Website in trên thẻ" },
]

export function GZVerCardSettingsPanel() {
  const [settings, setSettings] = useState<CardSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from("gzver_card_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error("Không tải được mẫu card visit", { description: error.message })
        if (data) {
          setSettings({
            ...defaultSettings,
            ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value ?? (defaultSettings as any)[key]])),
            links: [...(Array.isArray(data.links) ? data.links : [])].sort((a: CardLink, b: CardLink) => (a.sort_order || 0) - (b.sort_order || 0)),
          })
        }
        setLoading(false)
      })
  }, [])

  const update = (patch: Partial<CardSettings>) => setSettings((prev) => ({ ...prev, ...patch }))
  const setLinks = (links: CardLink[]) => update({ links: links.map((link, index) => ({ ...link, sort_order: (index + 1) * 10 })) })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "template_front_image_url" | "template_back_image_url") => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(field)
    try {
      const extension = file.name.split(".").pop()
      const path = `gzvers/card-templates/${Date.now()}-${field}.${extension}`
      const { error } = await supabase.storage.from("media").upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path)
      update({ [field]: publicUrl })
      toast.success("Đã tải ảnh mẫu lên — bấm Lưu để áp dụng")
    } catch (error: any) {
      toast.error("Lỗi tải ảnh mẫu", { description: error.message })
    } finally {
      setUploading(null)
      e.target.value = ""
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const trimmed = Object.fromEntries(Object.entries(settings).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]))
    const payload = {
      ...trimmed,
      id: 1,
      template_front_image_url: settings.template_front_image_url.trim() || null,
      template_back_image_url: settings.template_back_image_url.trim() || null,
      links: settings.links
        .filter((link) => link.url.trim())
        .map((link, index) => ({ ...link, label: link.label.trim(), url: link.url.trim(), sort_order: (index + 1) * 10 })),
    }
    const { error } = await supabase.from("gzver_card_settings").upsert(payload)
    setSaving(false)
    if (error) toast.error("Không lưu được mẫu card visit", { description: error.message })
    else toast.success("Đã lưu mẫu card visit cho toàn bộ GZVer")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center border border-slate-200 bg-white p-10 dark:border-white/10 dark:bg-slate-900">
        <Loader2 className="h-5 w-5 animate-spin text-[#ed1c24]" />
      </div>
    )
  }

  return (
    <div className="space-y-5 border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-black uppercase text-slate-900 dark:text-white">
            <CreditCard className="h-4 w-4 text-[#ed1c24]" /> Mẫu card visit dùng chung
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Áp dụng cho mọi GZVer. Từng người có thể ghi đè ảnh thẻ, email, hotline, link trong hồ sơ (tab &quot;Thẻ online&quot;).
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || !!uploading} className="h-10 rounded-none bg-[#ed1c24] text-xs font-black uppercase hover:bg-[#c91218]">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Lưu mẫu
        </Button>
      </div>

      {/* Ảnh mẫu */}
      <div className="space-y-3 border border-slate-200 p-4 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label className="text-[10px] font-black uppercase text-slate-500">Ảnh mẫu thẻ (mặt trước / mặt sau)</Label>
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
            Vẽ thông tin GZVer lên ảnh mẫu
            <Switch checked={settings.template_overlay} onCheckedChange={(checked) => update({ template_overlay: checked })} />
          </label>
        </div>
        <p className="text-[11px] leading-5 text-slate-500">
          <b>Bật:</b> ảnh mẫu là nền, website tự in tên, chức danh, ảnh đại diện, mã QR của từng người lên trên — nên dùng nền trơn, không chữ. <b>Tắt:</b> ảnh mẫu hiển thị nguyên vẹn như một thẻ hoàn chỉnh. Khung đứng CR80, khuyến nghị <b>1080 × 1712 px</b>. Để trống = dùng nền mặc định của GZV.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["template_front_image_url", "template_back_image_url"] as const).map((field) => {
            const value = settings[field]
            return (
              <div key={field} className="space-y-2 bg-slate-50 p-3 dark:bg-slate-950">
                <Label className="text-[10px] font-black uppercase text-slate-500">{field === "template_front_image_url" ? "Mẫu mặt trước" : "Mẫu mặt sau"}</Label>
                <div className="mx-auto w-40 overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-white dark:border-white/20 dark:bg-slate-900" style={{ aspectRatio: "54 / 85.6" }}>
                  {value ? (
                    <img src={value} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 p-3 text-center text-[10px] font-bold uppercase text-slate-400">
                      <CreditCard className="h-6 w-6" />
                      Nền mặc định GZV
                    </div>
                  )}
                </div>
                <Input value={value} onChange={(e) => update({ [field]: e.target.value })} placeholder="URL ảnh mẫu" className="h-9 rounded-none font-mono text-xs" />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="relative h-9 flex-1 rounded-none text-[10px] font-black uppercase" disabled={!!uploading}>
                    {uploading === field ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />} Chèn ảnh
                    <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" disabled={!!uploading} onChange={(e) => handleUpload(e, field)} />
                  </Button>
                  <MediaLibraryButton folder="gzvers" label="Thư viện" className="h-9 flex-1" onSelect={(url) => update({ [field]: url })} />
                  {value && (
                    <Button type="button" variant="outline" onClick={() => update({ [field]: "" })} className="h-9 rounded-none text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Nội dung in trên thẻ */}
      <div className="grid gap-3 md:grid-cols-3">
        {textFields.map(({ key, label, mono }) => (
          <div key={key} className="space-y-1">
            <Label className="text-[10px] font-black uppercase text-slate-500">{label}</Label>
            <Input value={settings[key] as string} onChange={(e) => update({ [key]: e.target.value })} className={`h-10 rounded-none text-xs ${mono ? "font-mono" : ""}`} />
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase text-slate-500">Thông báo thẻ demo</Label>
          <Input value={settings.demo_notice} onChange={(e) => update({ demo_notice: e.target.value })} className="h-10 rounded-none text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase text-slate-500">Lời xác nhận thẻ chính thức</Label>
          <Input value={settings.official_notice} onChange={(e) => update({ official_notice: e.target.value })} className="h-10 rounded-none text-xs" />
        </div>
      </div>

      {/* Link chung */}
      <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500">
            <Link2 className="h-3.5 w-3.5" /> Nút liên kết chung dưới mọi thẻ
          </Label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
              Nút &quot;Lưu danh bạ&quot;
              <Switch checked={settings.show_vcard} onCheckedChange={(checked) => update({ show_vcard: checked })} />
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLinks([...settings.links, { label: "", url: "", icon: "website", visible: true, sort_order: 0 }])}
              className="h-8 rounded-none text-[10px] font-black uppercase"
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Thêm link
            </Button>
          </div>
        </div>
        {settings.links.map((link, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-[140px_1fr_2fr_auto]">
            <Select value={link.icon || "link"} onValueChange={(value) => setLinks(settings.links.map((item, i) => (i === index ? { ...item, icon: value } : item)))}>
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
            <Input value={link.label} onChange={(e) => setLinks(settings.links.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)))} placeholder="Tên nút" className="h-9 rounded-none text-xs" />
            <Input value={link.url} onChange={(e) => setLinks(settings.links.map((item, i) => (i === index ? { ...item, url: e.target.value } : item)))} placeholder="https://... / mailto:... / tel:..." className="h-9 rounded-none font-mono text-xs" />
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="icon" disabled={index === 0} onClick={() => setLinks(settings.links.map((item, i) => (i === index - 1 ? settings.links[index] : i === index ? settings.links[index - 1] : item)))} className="h-9 w-9 rounded-none">
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="outline" size="icon" disabled={index === settings.links.length - 1} onClick={() => setLinks(settings.links.map((item, i) => (i === index + 1 ? settings.links[index] : i === index ? settings.links[index + 1] : item)))} className="h-9 w-9 rounded-none">
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => setLinks(settings.links.filter((_, i) => i !== index))} className="h-9 w-9 rounded-none text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {!settings.links.length && <p className="text-xs text-slate-400">Chưa có link chung.</p>}
      </div>
    </div>
  )
}
