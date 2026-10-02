"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Facebook,
  FileText,
  Folder,
  Globe2,
  Instagram,
  Link2,
  Linkedin,
  Loader2,
  MessageCircle,
  Music2,
  Palette,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  X,
  Youtube,
} from "lucide-react"

type LinkKind =
  | "drive_folder"
  | "drive_file"
  | "google_doc"
  | "canva"
  | "youtube"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "zalo"
  | "linkedin"
  | "x"
  | "website"

type MediaLink = {
  id: string
  title: string
  url: string
  kind: LinkKind
  note?: string | null
  is_pinned: boolean
  sort_order: number
}

const KIND_META: Record<LinkKind, { label: string; icon: any; color: string; group: "drive" | "design" | "social" | "other" }> = {
  drive_folder: { label: "Thư mục Drive", icon: Folder, color: "#1a73e8", group: "drive" },
  drive_file: { label: "File Drive", icon: FileText, color: "#1a73e8", group: "drive" },
  google_doc: { label: "Google Docs", icon: FileText, color: "#0f9d58", group: "drive" },
  canva: { label: "Canva", icon: Palette, color: "#7d2ae8", group: "design" },
  youtube: { label: "YouTube", icon: Youtube, color: "#ff0000", group: "social" },
  facebook: { label: "Facebook", icon: Facebook, color: "#1877f2", group: "social" },
  instagram: { label: "Instagram", icon: Instagram, color: "#d62976", group: "social" },
  tiktok: { label: "TikTok", icon: Music2, color: "#111111", group: "social" },
  zalo: { label: "Zalo", icon: MessageCircle, color: "#0068ff", group: "social" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "#0a66c2", group: "social" },
  x: { label: "X / Twitter", icon: X, color: "#111111", group: "social" },
  website: { label: "Website", icon: Globe2, color: "#64748b", group: "other" },
}

const FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "drive", label: "Drive & Docs" },
  { key: "design", label: "Canva" },
  { key: "social", label: "Mạng xã hội" },
  { key: "other", label: "Website khác" },
] as const

// Nhận diện loại link từ URL
function detectKind(raw: string): LinkKind {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return "website"
  }
  const host = url.hostname.replace(/^(www|m)\./, "").toLowerCase()
  const path = url.pathname
  if (host === "drive.google.com") return /\/folders\//.test(path) ? "drive_folder" : "drive_file"
  if (host === "docs.google.com") return "google_doc"
  if (host.endsWith("canva.com") || host === "canva.link") return "canva"
  if (host === "youtube.com" || host === "youtu.be" || host === "music.youtube.com") return "youtube"
  if (host.endsWith("facebook.com") || host === "fb.com" || host === "fb.watch") return "facebook"
  if (host.endsWith("instagram.com")) return "instagram"
  if (host.endsWith("tiktok.com")) return "tiktok"
  if (host === "zalo.me" || host.endsWith("zalo.me")) return "zalo"
  if (host.endsWith("linkedin.com")) return "linkedin"
  if (host === "x.com" || host === "twitter.com") return "x"
  return "website"
}

// Tên gợi ý khi chưa nhập tiêu đề
function suggestTitle(raw: string, kind: LinkKind) {
  try {
    const url = new URL(raw.trim())
    const segment = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "")
    if (kind === "website") return url.hostname.replace(/^www\./, "")
    if (["facebook", "instagram", "tiktok", "linkedin", "x"].includes(kind) && segment) return `${KIND_META[kind].label} · ${segment.replace(/^@/, "@")}`
    return KIND_META[kind].label
  } catch {
    return KIND_META[kind].label
  }
}

// URL dùng để xem ngay trong trang (null = không nhúng được, mở tab mới)
function embedUrl(link: Pick<MediaLink, "url" | "kind">): string | null {
  const url = link.url.trim()
  if (link.kind === "drive_folder") {
    const id = url.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1]
    return id ? `https://drive.google.com/embeddedfolderview?id=${id}#grid` : null
  }
  if (link.kind === "drive_file") {
    const id = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]
    return id ? `https://drive.google.com/file/d/${id}/preview` : null
  }
  if (link.kind === "google_doc") {
    const match = url.match(/docs\.google\.com\/(document|spreadsheets|presentation|forms)\/d\/([a-zA-Z0-9_-]+)/)
    if (!match) return null
    return match[1] === "forms" ? `https://docs.google.com/forms/d/${match[2]}/viewform?embedded=true` : `https://docs.google.com/${match[1]}/d/${match[2]}/preview`
  }
  if (link.kind === "canva") {
    const id = url.match(/canva\.com\/design\/([^/?#]+)/)?.[1]
    return id ? `https://www.canva.com/design/${id}/view?embed` : null
  }
  if (link.kind === "youtube") {
    try {
      const parsed = new URL(url)
      const id = parsed.hostname === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v") || parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1]
      return id ? `https://www.youtube.com/embed/${id}` : null
    } catch {
      return null
    }
  }
  return null
}

const LEGACY_DRIVE_URL_KEY = "gzv_drive_media_url"
const LEGACY_DRIVE_FOLDERS_KEY = "gzv_drive_media_folders"
const LEGACY_IMPORTED_KEY = "gzv_media_links_imported"
const LOCAL_STORAGE_KEY = "gzv_media_links_fallback"

function getLocalLinks(): MediaLink[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return []
}

function saveLocalLinks(items: MediaLink[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
  } catch (e) {}
}

const emptyForm = { title: "", url: "", note: "" }

export function MediaLinksLibrary() {
  const [links, setLinks] = useState<MediaLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("media_links")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
      
      if (error || !data) {
        const local = getLocalLinks()
        setLinks(local)
        setLoading(false)
        return local
      }

      const fetched = data as MediaLink[]
      // Merge with local fallback items if any local-only items exist
      const local = getLocalLinks()
      const mergedMap = new Map<string, MediaLink>()
      fetched.forEach((item) => mergedMap.set(item.id, item))
      local.forEach((item) => {
        if (!mergedMap.has(item.id)) mergedMap.set(item.id, item)
      })

      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => Number(b.is_pinned) - Number(a.is_pinned) || a.sort_order - b.sort_order
      )
      setLinks(combined)
      saveLocalLinks(combined)
      setLoading(false)
      return combined
    } catch (e) {
      const local = getLocalLinks()
      setLinks(local)
      setLoading(false)
      return local
    }
  }, [])

  // Chuyển các folder Drive từng lưu trong trình duyệt (localStorage) lên database, chỉ làm một lần
  const importLegacy = useCallback(async (current: MediaLink[]) => {
    try {
      if (localStorage.getItem(LEGACY_IMPORTED_KEY)) return
      const legacy: Array<{ name: string; url: string }> = []
      const mainUrl = localStorage.getItem(LEGACY_DRIVE_URL_KEY)
      if (mainUrl) legacy.push({ name: "Kho Drive (đã lưu)", url: mainUrl })
      const folders = JSON.parse(localStorage.getItem(LEGACY_DRIVE_FOLDERS_KEY) || "[]")
      if (Array.isArray(folders)) legacy.push(...folders.filter((folder) => folder?.name && folder?.url))
      const existing = new Set(current.map((link) => link.url.trim()))
      const toInsert = legacy
        .filter((item) => !existing.has(item.url.trim()))
        .map((item, index) => ({
          title: item.name,
          url: item.url.trim(),
          kind: detectKind(item.url),
          sort_order: (current.length + index + 1) * 10,
        }))
      if (toInsert.length) {
        try {
          await supabase.from("media_links").insert(toInsert)
        } catch (e) {}
        toast({ title: `Đã chuyển ${toInsert.length} link Drive cũ vào kho liên kết` })
        await load()
      }
      localStorage.setItem(LEGACY_IMPORTED_KEY, "1")
    } catch (error) {
      console.error("Không chuyển được link Drive cũ:", error)
    }
  }, [load])

  useEffect(() => {
    load().then(importLegacy)
  }, [load, importLegacy])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return links.filter((link) => {
      const meta = KIND_META[link.kind] || KIND_META.website
      const matchFilter = filter === "all" || meta.group === filter
      const matchSearch = !query || `${link.title} ${link.url} ${link.note || ""} ${meta.label}`.toLowerCase().includes(query)
      return matchFilter && matchSearch
    })
  }, [links, filter, search])

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: links.length }
    for (const link of links) {
      const group = (KIND_META[link.kind] || KIND_META.website).group
      result[group] = (result[group] || 0) + 1
    }
    return result
  }, [links])

  const preview = links.find((link) => link.id === previewId) || null
  const previewSrc = preview ? embedUrl(preview) : null

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const submit = async () => {
    let url = form.url.trim()
    if (!url) {
      toast({
        title: "Vui lòng nhập link",
        description: "Dán liên kết (Drive, Canva, Docs, Facebook...) trước khi nhấn Thêm link.",
        variant: "destructive",
      })
      return
    }

    // Auto-fix URL scheme if missing (e.g. drive.google.com -> https://drive.google.com)
    if (!/^[a-z]+:\/\//i.test(url)) {
      url = "https://" + url
    }

    const kind = detectKind(url)
    const title = form.title.trim() || suggestTitle(url, kind)
    const note = form.note.trim() || null

    setSaving(true)

    const payload = {
      title,
      url,
      kind,
      note,
    }

    let dbItem: MediaLink | null = null
    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("media_links")
          .update(payload)
          .eq("id", editingId)
          .select()
        if (!error && data && data[0]) {
          dbItem = data[0] as MediaLink
        }
      } else {
        const { data, error } = await supabase
          .from("media_links")
          .insert({ ...payload, sort_order: (links.length + 1) * 10 })
          .select()
        if (!error && data && data[0]) {
          dbItem = data[0] as MediaLink
        }
      }
    } catch (e) {
      console.warn("Supabase insert/update warning:", e)
    }

    // Fallback & reactive state update
    if (editingId) {
      const updated = links.map((link) =>
        link.id === editingId ? (dbItem ? { ...link, ...dbItem } : { ...link, ...payload }) : link
      )
      setLinks(updated)
      saveLocalLinks(updated)
    } else {
      const newLink: MediaLink = dbItem || {
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: payload.title,
        url: payload.url,
        kind: payload.kind as LinkKind,
        note: payload.note,
        is_pinned: false,
        sort_order: (links.length + 1) * 10,
      }
      const updated = [newLink, ...links]
      setLinks(updated)
      saveLocalLinks(updated)
    }

    setSaving(false)
    toast({ title: editingId ? "Đã cập nhật link" : `Đã thêm thành công: ${title}` })
    resetForm()
  }

  const remove = async (link: MediaLink) => {
    if (!confirm(`Xóa link "${link.title}" khỏi kho?`)) return
    try {
      await supabase.from("media_links").delete().eq("id", link.id)
    } catch (e) {}

    const updated = links.filter((item) => item.id !== link.id)
    setLinks(updated)
    saveLocalLinks(updated)

    if (previewId === link.id) setPreviewId(null)
    toast({ title: `Đã xóa: ${link.title}` })
  }

  const togglePin = async (link: MediaLink) => {
    const nextPinned = !link.is_pinned
    try {
      await supabase.from("media_links").update({ is_pinned: nextPinned }).eq("id", link.id)
    } catch (e) {}

    const updated = links
      .map((item) => (item.id === link.id ? { ...item, is_pinned: nextPinned } : item))
      .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || a.sort_order - b.sort_order)
    setLinks(updated)
    saveLocalLinks(updated)
  }

  // Đổi chỗ với link liền kề (trong cùng nhóm ghim/không ghim) rồi đánh lại số thứ tự
  const move = async (link: MediaLink, direction: -1 | 1) => {
    const group = links.filter((item) => item.is_pinned === link.is_pinned)
    const index = group.findIndex((item) => item.id === link.id)
    const target = index + direction
    if (target < 0 || target >= group.length) return
    const reordered = [...group]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    const updates = reordered.map((item, position) => ({ id: item.id, sort_order: (position + 1) * 10 }))
    setLinks((prev) => {
      const orderMap = new Map(updates.map((update) => [update.id, update.sort_order]))
      return [...prev]
        .map((item) => (orderMap.has(item.id) ? { ...item, sort_order: orderMap.get(item.id)! } : item))
        .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || a.sort_order - b.sort_order)
    })
    await Promise.all(updates.map((update) => supabase.from("media_links").update({ sort_order: update.sort_order }).eq("id", update.id)))
  }

  const copy = async (link: MediaLink) => {
    await navigator.clipboard.writeText(link.url)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const formKind = form.url.trim() ? detectKind(form.url) : null

  return (
    <section className="overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
      {/* Header + form thêm/sửa */}
      <div className="border-b border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">GZV Digital Archive</p>
        <h3 className="mt-1 text-xl font-black uppercase text-slate-900 dark:text-white">Kho liên kết</h3>
        <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
          Lưu và mở nhanh thư mục Google Drive, tài liệu Google, thiết kế Canva, kênh mạng xã hội và website. Danh sách dùng chung cho mọi admin.
        </p>

        <div className="mt-5 grid gap-2 lg:grid-cols-[2fr_1.2fr_1.2fr_auto]">
          <div className="relative">
            <Input
              value={form.url}
              onChange={(event) => setForm({ ...form, url: event.target.value })}
              onKeyDown={(event) => event.key === "Enter" && submit()}
              placeholder="Dán link: Drive, Canva, Docs, Facebook, TikTok..."
              className="h-10 rounded-none bg-white pr-28 font-mono text-xs dark:border-white/10 dark:bg-slate-900"
            />
            {formKind && (
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-black uppercase text-white"
                style={{ background: KIND_META[formKind].color }}
              >
                {KIND_META[formKind].label}
              </span>
            )}
          </div>
          <Input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder={formKind ? `Tên (gợi ý: ${suggestTitle(form.url, formKind)})` : "Tên hiển thị"}
            className="h-10 rounded-none bg-white text-xs dark:border-white/10 dark:bg-slate-900"
          />
          <Input
            value={form.note}
            onChange={(event) => setForm({ ...form, note: event.target.value })}
            placeholder="Ghi chú (tùy chọn)"
            className="h-10 rounded-none bg-white text-xs dark:border-white/10 dark:bg-slate-900"
          />
          <div className="flex gap-2">
            <Button type="button" onClick={submit} disabled={saving} className="h-10 flex-1 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]">
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : editingId ? <Check className="mr-1.5 h-4 w-4" /> : <Plus className="mr-1.5 h-4 w-4" />}
              {editingId ? "Lưu" : "Thêm link"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="h-10 rounded-none text-xs font-black uppercase">
                Hủy
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-black uppercase transition ${
                filter === item.key ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-[#ed1c24] dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {item.label}
              <span className={filter === item.key ? "text-white/80" : "text-slate-400"}>{counts[item.key] || 0}</span>
            </button>
          ))}
          <div className="relative ml-auto w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm link..." className="h-8 rounded-none bg-white pl-8 text-xs dark:border-white/10 dark:bg-slate-900" />
          </div>
        </div>
      </div>

      <div className={`grid ${preview ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]" : ""}`}>
        {/* Danh sách đánh số */}
        <div className="min-w-0">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-400">{links.length ? "Không có link khớp bộ lọc." : "Chưa có link nào. Dán link đầu tiên ở ô phía trên."}</div>
          ) : (
            <ol className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((link) => {
                const meta = KIND_META[link.kind] || KIND_META.website
                const Icon = meta.icon
                const number = links.findIndex((item) => item.id === link.id) + 1
                const canPreview = Boolean(embedUrl(link))
                const active = previewId === link.id
                return (
                  <li key={link.id} className={`group flex items-center gap-3 px-4 py-3 transition ${active ? "bg-red-50 dark:bg-red-950/20" : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"}`}>
                    <span className="w-7 shrink-0 text-right font-mono text-sm font-black text-slate-300 dark:text-slate-600">{String(number).padStart(2, "0")}</span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center text-white" style={{ background: meta.color }}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {link.is_pinned && <Pin className="h-3 w-3 shrink-0 text-[#ed1c24]" />}
                        <p className="truncate text-sm font-black text-slate-900 dark:text-white">{link.title}</p>
                        <span className="hidden shrink-0 border border-slate-200 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-500 dark:border-white/10 sm:inline">{meta.label}</span>
                      </div>
                      <p className="truncate font-mono text-[11px] text-slate-400">{link.url.replace(/^https?:\/\//, "")}</p>
                      {link.note && <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{link.note}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {canPreview && (
                        <button type="button" title="Xem trong trang" onClick={() => setPreviewId(active ? null : link.id)} className={`flex h-8 w-8 items-center justify-center border ${active ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-slate-200 text-slate-500 hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/10"}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <a href={link.url} target="_blank" rel="noreferrer" title="Mở tab mới" className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/10">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button type="button" title="Copy link" onClick={() => copy(link)} className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/10">
                        {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <div className="hidden items-center gap-1 group-hover:flex">
                        <button type="button" title={link.is_pinned ? "Bỏ ghim" : "Ghim lên đầu"} onClick={() => togglePin(link)} className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-[#ed1c24]">
                          {link.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                        </button>
                        <button type="button" title="Lên" onClick={() => move(link, -1)} className="flex h-8 w-6 items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" title="Xuống" onClick={() => move(link, 1)} className="flex h-8 w-6 items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Sửa"
                          onClick={() => {
                            setEditingId(link.id)
                            setForm({ title: link.title, url: link.url, note: link.note || "" })
                          }}
                          className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" title="Xóa" onClick={() => remove(link)} className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-[#ed1c24]">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {/* Xem nhanh link nhúng được */}
        {preview && (
          <div className="min-w-0 border-t border-slate-200 bg-slate-100 p-3 dark:border-white/10 dark:bg-black/30 xl:border-l xl:border-t-0">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-xs font-black uppercase text-slate-700 dark:text-slate-200">
                <Link2 className="mr-1.5 inline h-3.5 w-3.5 text-[#ed1c24]" />
                {preview.title}
              </p>
              <button type="button" onClick={() => setPreviewId(null)} className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-[#ed1c24]">
                <X className="h-4 w-4" />
              </button>
            </div>
            {previewSrc && (
              <iframe key={previewSrc} title={preview.title} src={previewSrc} className="h-[64vh] min-h-[480px] w-full border border-slate-200 bg-white dark:border-white/10" allow="autoplay; fullscreen" allowFullScreen />
            )}
            <p className="mt-2 text-center text-[11px] text-slate-500">
              Không hiện nội dung? Link cần được chia sẻ công khai, hoặc dùng nút <ExternalLink className="inline h-3 w-3" /> để mở tab mới.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
