"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Check,
  CheckSquare,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileImage,
  Film,
  Folder,
  FolderInput,
  FolderPlus,
  Grid3X3,
  HardDrive,
  Image as ImageIcon,
  Info,
  Layers3,
  LayoutPanelTop,
  Link2,
  List,
  Loader2,
  Maximize2,
  Pencil,
  RefreshCw,
  Search,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react"

const BUCKET = "media"
const DEFAULT_FOLDERS = [
  "all",
  "site",
  "site/hero",
  "site/pages",
  "site/footer",
  "articles",
  "projects",
  "project-thumbnails",
  "project-videos",
  "courses",
  "mentors",
  "authors",
  "gzvers",
  "gzvers/avatars",
  "gzvers/covers",
  "partners",
  "uploads",
]

const QUICK_TARGETS = [
  { folder: "site/hero", label: "Hero website", hint: "Banner, video poster, ảnh đầu trang" },
  { folder: "site/pages", label: "Page builder", hint: "Ảnh cho /gioi-thieu, /dich-vu, /lien-he..." },
  { folder: "gzvers/avatars", label: "Avatar GZVers", hint: "Ảnh đại diện hồ sơ" },
  { folder: "gzvers/covers", label: "Cover GZVers", hint: "Ảnh bìa profile" },
  { folder: "projects", label: "Dự án", hint: "Ảnh dự án và case study" },
  { folder: "articles", label: "Tin tức", hint: "Ảnh bài viết" },
]

type MediaItem = {
  name: string
  path: string
  folder: string
  url: string
  size: number
  mimetype: string
  created_at: string
  updated_at: string
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`
}

function isImage(mime?: string, name?: string) {
  if (mime?.startsWith("image/")) return true
  return /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(name || "")
}

function isVideo(mime?: string, name?: string) {
  if (mime?.startsWith("video/")) return true
  return /\.(mp4|webm|mov|m4v)$/i.test(name || "")
}

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
}

function sanitizeFolder(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-_/]/g, "-").replace(/-+/g, "-").replace(/^\/+|\/+$/g, "")
}

export default function AdminImagesPage() {
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS)
  const [currentFolder, setCurrentFolder] = useState("all")
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolder, setNewFolder] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "file">("all")
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [renameTarget, setRenameTarget] = useState<MediaItem | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveTargetFolder, setMoveTargetFolder] = useState("")
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const stats = useMemo(() => ({
    count: items.length,
    size: items.reduce((sum, item) => sum + item.size, 0),
    images: items.filter((item) => isImage(item.mimetype, item.name)).length,
    videos: items.filter((item) => isVideo(item.mimetype, item.name)).length,
  }), [items])

  const loadRootFolders = useCallback(async () => {
    const { data } = await supabase.storage.from(BUCKET).list("", { limit: 200 })
    if (!data) return
    const dirs = data.filter((item) => !item.metadata).map((item) => item.name)
    setFolders((prev) => Array.from(new Set([...DEFAULT_FOLDERS, ...dirs, ...prev])).sort())
  }, [])

  const loadFolder = useCallback(async (folder: string) => {
    setLoading(true)
    try {
      const foldersToLoad = folder === "all" ? DEFAULT_FOLDERS.filter((item) => item !== "all") : [folder]
      const results = await Promise.allSettled(foldersToLoad.map(async (targetFolder) => {
        const { data, error } = await supabase.storage.from(BUCKET).list(targetFolder, {
          limit: 1000,
          sortBy: { column: "created_at", order: "desc" },
        })
        if (error) return []
        return (data || []).filter((file) => file.metadata).map((file) => {
          const path = `${targetFolder}/${file.name}`
          const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
          return {
            name: file.name,
            path,
            folder: targetFolder,
            url: publicUrl,
            size: (file.metadata as any)?.size ?? 0,
            mimetype: (file.metadata as any)?.mimetype ?? "",
            created_at: file.created_at ?? "",
            updated_at: file.updated_at ?? "",
          } as MediaItem
        })
      }))
      const mapped = results
        .flatMap((result) => result.status === "fulfilled" ? result.value : [])
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      setItems(mapped)
      setSelectedItem((prev) => prev ? mapped.find((item) => item.path === prev.path) || mapped[0] || null : mapped[0] || null)
    } catch (error: any) {
      toast({ title: "Lỗi tải thư mục", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRootFolders() }, [loadRootFolders])
  useEffect(() => { loadFolder(currentFolder) }, [currentFolder, loadFolder])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.path.toLowerCase().includes(q)
      const matchType =
        typeFilter === "all" ||
        (typeFilter === "image" && isImage(item.mimetype, item.name)) ||
        (typeFilter === "video" && isVideo(item.mimetype, item.name)) ||
        (typeFilter === "file" && !isImage(item.mimetype, item.name) && !isVideo(item.mimetype, item.name))
      return matchSearch && matchType
    })
  }, [items, search, typeFilter])

  const clearSelection = () => setSelected(new Set())

  const toggleSelected = (path: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })
  }

  const copy = async (text: string, key: string, label = "Đã sao chép") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      toast({ title: label })
      setTimeout(() => setCopiedKey(null), 1400)
    } catch {
      toast({ title: "Không sao chép được", variant: "destructive" })
    }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    const uploadFolder = currentFolder === "all" ? "uploads" : currentFolder
    let ok = 0
    let fail = 0
    for (const file of Array.from(files)) {
      const path = `${uploadFolder}/${Date.now()}_${sanitizeFileName(file.name)}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "86400",
        upsert: false,
        contentType: file.type,
      })
      if (error) fail += 1
      else ok += 1
    }
    setUploading(false)
    toast({ title: "Upload hoàn tất", description: `${ok} thành công · ${fail} thất bại`, variant: fail ? "destructive" : "default" })
    loadFolder(currentFolder)
  }

  const createFolder = async () => {
    const folder = sanitizeFolder(newFolder)
    if (!folder) return
    const placeholder = new Blob([""], { type: "text/plain" })
    const { error } = await supabase.storage.from(BUCKET).upload(`${folder}/.keep`, placeholder, { upsert: true })
    if (error) return toast({ title: "Không tạo được thư mục", description: error.message, variant: "destructive" })
    setFolders((prev) => Array.from(new Set([...prev, folder])).sort())
    setCurrentFolder(folder)
    setNewFolder("")
    setCreatingFolder(false)
    toast({ title: `Đã tạo thư mục ${folder}` })
  }

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Xóa vĩnh viễn "${item.name}"?`)) return
    const { error } = await supabase.storage.from(BUCKET).remove([item.path])
    if (error) return toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" })
    toast({ title: "Đã xóa file" })
    setItems((prev) => prev.filter((media) => media.path !== item.path))
    if (selectedItem?.path === item.path) setSelectedItem(null)
  }

  const handleBulkDelete = async () => {
    if (!selected.size) return
    if (!confirm(`Xóa vĩnh viễn ${selected.size} file đã chọn?`)) return
    setBusy(true)
    const paths = Array.from(selected)
    const { error } = await supabase.storage.from(BUCKET).remove(paths)
    setBusy(false)
    if (error) return toast({ title: "Lỗi xóa hàng loạt", description: error.message, variant: "destructive" })
    toast({ title: `Đã xóa ${paths.length} file` })
    setItems((prev) => prev.filter((item) => !selected.has(item.path)))
    clearSelection()
  }

  const handleRename = async () => {
    if (!renameTarget) return
    const safe = sanitizeFileName(renameValue.trim())
    if (!safe || safe === renameTarget.name) {
      setRenameTarget(null)
      return
    }
    setBusy(true)
    const { error } = await supabase.storage.from(BUCKET).move(renameTarget.path, `${renameTarget.folder}/${safe}`)
    setBusy(false)
    if (error) return toast({ title: "Lỗi đổi tên", description: error.message, variant: "destructive" })
    toast({ title: "Đã đổi tên" })
    setRenameTarget(null)
    loadFolder(currentFolder)
  }

  const handleMove = async () => {
    const target = sanitizeFolder(moveTargetFolder)
    if (!target || target === currentFolder) return toast({ title: "Chọn thư mục đích khác", variant: "destructive" })
    const paths = Array.from(selected)
    if (!paths.length) return
    setBusy(true)
    let ok = 0
    let fail = 0
    for (const path of paths) {
      const name = path.split("/").pop()!
      const { error } = await supabase.storage.from(BUCKET).move(path, `${target}/${name}`)
      if (error) fail += 1
      else ok += 1
    }
    setBusy(false)
    toast({ title: "Di chuyển hoàn tất", description: `${ok} thành công · ${fail} thất bại`, variant: fail ? "destructive" : "default" })
    setMoveOpen(false)
    setMoveTargetFolder("")
    clearSelection()
    loadFolder(currentFolder)
  }

  const selectFolder = (folder: string) => {
    setCurrentFolder(folder)
    setSelectedItem(null)
    clearSelection()
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-montserrat text-slate-950">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-5 px-5 py-5 xl:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#050505] p-4 text-white"><HardDrive size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ed1c24]">GZV Media Control</p>
                <h1 className="text-3xl font-black uppercase tracking-tight">Thư viện ảnh & media</h1>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Bucket <span className="text-[#ed1c24]">{BUCKET}</span> · {stats.count} file · {formatBytes(stats.size)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input placeholder="Tìm file, path, tên ảnh..." value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 w-full rounded-none border-slate-300 pl-9 font-semibold lg:w-80" />
              </div>
              <Button onClick={() => loadFolder(currentFolder)} variant="outline" className="h-11 rounded-none border-slate-300">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </Button>
              <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="h-11 rounded-none bg-[#ed1c24] px-5 text-xs font-black uppercase text-white hover:bg-[#c91218]">
                {uploading ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Upload size={16} className="mr-2" />}
                Upload media
              </Button>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={(event) => { handleUpload(event.target.files); event.target.value = "" }} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {QUICK_TARGETS.map((target) => (
              <button
                key={target.folder}
                onClick={() => selectFolder(target.folder)}
                className={`border p-4 text-left transition ${currentFolder === target.folder ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-slate-200 bg-slate-50 text-slate-900 hover:border-[#ed1c24]"}`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest">{target.label}</p>
                <p className={`mt-2 text-xs font-semibold leading-5 ${currentFolder === target.folder ? "text-white/80" : "text-slate-500"}`}>{target.hint}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1680px] grid-cols-1 gap-6 px-5 py-6 xl:grid-cols-[280px_1fr_360px] xl:px-8">
        <aside className="space-y-4">
          <div className="border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24]">Folders</p>
                <h2 className="font-black uppercase">Kho media</h2>
              </div>
              <Button size="icon" variant="outline" className="h-9 w-9 rounded-none" onClick={() => setCreatingFolder((value) => !value)}>
                <FolderPlus size={16} />
              </Button>
            </div>
            {creatingFolder && (
              <div className="mb-4 grid grid-cols-[1fr_auto_auto] gap-1">
                <Input autoFocus placeholder="site/new-folder" value={newFolder} onChange={(event) => setNewFolder(event.target.value)} onKeyDown={(event) => event.key === "Enter" && createFolder()} className="h-10 rounded-none font-mono text-xs" />
                <Button size="icon" className="h-10 w-10 rounded-none bg-[#ed1c24]" onClick={createFolder}><Check size={15} /></Button>
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none" onClick={() => setCreatingFolder(false)}><X size={15} /></Button>
              </div>
            )}
            <div className="max-h-[58vh] space-y-1 overflow-y-auto pr-1">
              {folders.map((folder) => (
                <button key={folder} onClick={() => selectFolder(folder)} className={`flex w-full items-center gap-3 border px-3 py-3 text-left text-sm font-black transition ${currentFolder === folder ? "border-[#ed1c24] bg-[#050505] text-white" : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"}`}>
                  <Folder className={`h-4 w-4 ${currentFolder === folder ? "text-[#ed1c24]" : "text-slate-400"}`} />
                  <span className="min-w-0 flex-1 truncate">{folder}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 bg-[#050505] p-5 text-white">
            <div className="mb-3 flex items-center gap-2 text-[#ed1c24]"><Info size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Dùng cho site-content</span></div>
            <p className="text-xs font-semibold leading-6 text-white/70">
              Copy URL ảnh rồi dán vào Page Builder, footer, hero, profile GZVers hoặc các block nội dung trong `/admin/site-content`.
            </p>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={selectMode ? "default" : "outline"} onClick={() => { setSelectMode((value) => !value); clearSelection() }} className={`h-10 rounded-none text-[11px] font-black uppercase ${selectMode ? "bg-[#ed1c24] hover:bg-[#c91218]" : "border-slate-300"}`}>
                {selectMode ? <CheckSquare size={14} className="mr-2" /> : <Square size={14} className="mr-2" />}
                {selectMode ? "Đang chọn" : "Chọn nhiều"}
              </Button>
              <Button size="sm" variant={typeFilter === "all" ? "default" : "outline"} onClick={() => setTypeFilter("all")} className="h-10 rounded-none text-[11px] font-black uppercase">Tất cả</Button>
              <Button size="sm" variant={typeFilter === "image" ? "default" : "outline"} onClick={() => setTypeFilter("image")} className="h-10 rounded-none text-[11px] font-black uppercase"><FileImage size={14} className="mr-2" />Ảnh</Button>
              <Button size="sm" variant={typeFilter === "video" ? "default" : "outline"} onClick={() => setTypeFilter("video")} className="h-10 rounded-none text-[11px] font-black uppercase"><Film size={14} className="mr-2" />Video</Button>
            </div>
            <div className="flex items-center gap-2">
              {selectMode && (
                <>
                  <Badge className="rounded-none bg-red-50 px-3 py-2 text-[10px] font-black uppercase text-[#c91218]">{selected.size} đã chọn</Badge>
                  <Button size="sm" variant="outline" className="h-10 rounded-none" onClick={() => setSelected(new Set(filtered.map((item) => item.path)))}>Chọn tất cả</Button>
                  <Button size="sm" disabled={!selected.size || busy} className="h-10 rounded-none bg-[#050505] text-white hover:bg-[#ed1c24]" onClick={() => setMoveOpen(true)}><FolderInput size={14} className="mr-2" />Di chuyển</Button>
                  <Button size="sm" disabled={!selected.size || busy} className="h-10 rounded-none bg-red-600 text-white hover:bg-red-700" onClick={handleBulkDelete}><Trash2 size={14} className="mr-2" />Xóa</Button>
                </>
              )}
              <Button size="icon" variant={viewMode === "grid" ? "default" : "outline"} className="h-10 w-10 rounded-none" onClick={() => setViewMode("grid")}><Grid3X3 size={15} /></Button>
              <Button size="icon" variant={viewMode === "list" ? "default" : "outline"} className="h-10 w-10 rounded-none" onClick={() => setViewMode("list")}><List size={15} /></Button>
            </div>
          </div>

          <div
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); handleUpload(event.dataTransfer.files) }}
            className={`min-h-[62vh] border-2 border-dashed bg-white p-5 transition ${dragging ? "border-[#ed1c24] bg-red-50" : "border-slate-200"}`}
          >
            {loading ? (
              <div className="flex h-80 items-center justify-center text-slate-500"><Loader2 className="mr-2 animate-spin" />Đang tải media...</div>
            ) : filtered.length === 0 ? (
              <div className="flex h-80 flex-col items-center justify-center text-center">
                <div className="mb-5 border border-slate-200 bg-slate-50 p-6"><ImageIcon size={42} className="text-slate-300" /></div>
                <p className="text-lg font-black uppercase">Chưa có media</p>
                <p className="mt-2 text-sm font-semibold text-slate-500">Kéo thả file vào đây hoặc bấm Upload media.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-4">
                {filtered.map((item) => <MediaCard key={item.path} item={item} selected={selected.has(item.path)} selectMode={selectMode} copiedKey={copiedKey} onPick={setSelectedItem} onToggle={toggleSelected} onCopy={copy} onRename={(target) => { setRenameTarget(target); setRenameValue(target.name) }} onDelete={handleDelete} />)}
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200">
                {filtered.map((item) => <MediaRow key={item.path} item={item} selected={selected.has(item.path)} selectMode={selectMode} copiedKey={copiedKey} onPick={setSelectedItem} onToggle={toggleSelected} onCopy={copy} onRename={(target) => { setRenameTarget(target); setRenameValue(target.name) }} onDelete={handleDelete} />)}
              </div>
            )}
          </div>
        </main>

        <MediaInspector item={selectedItem} copiedKey={copiedKey} onCopy={copy} />
      </div>

      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black uppercase"><Pencil size={16} className="text-[#ed1c24]" />Đổi tên file</DialogTitle>
            <DialogDescription>Đường dẫn cũ: <code className="text-[#ed1c24]">{renameTarget?.path}</code></DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tên mới</Label>
            <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleRename()} className="h-11 rounded-none font-mono" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameTarget(null)} className="rounded-none">Hủy</Button>
            <Button disabled={busy} onClick={handleRename} className="rounded-none bg-[#ed1c24] hover:bg-[#c91218]">{busy ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Check size={14} className="mr-2" />}Đổi tên</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black uppercase"><FolderInput size={16} className="text-[#ed1c24]" />Di chuyển {selected.size} file</DialogTitle>
            <DialogDescription>Từ <code>{currentFolder}</code> sang thư mục đích.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thư mục đích</Label>
            <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto">
              {folders.filter((folder) => folder !== currentFolder).map((folder) => (
                <button key={folder} onClick={() => setMoveTargetFolder(folder)} className={`border px-3 py-2 text-left text-xs font-bold ${moveTargetFolder === folder ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-slate-200 hover:border-[#ed1c24]"}`}>{folder}</button>
              ))}
            </div>
            <Input placeholder="hoặc nhập thư mục mới" value={moveTargetFolder} onChange={(event) => setMoveTargetFolder(sanitizeFolder(event.target.value))} className="h-11 rounded-none font-mono text-xs" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMoveOpen(false)} className="rounded-none">Hủy</Button>
            <Button disabled={busy || !moveTargetFolder} onClick={handleMove} className="rounded-none bg-[#ed1c24] hover:bg-[#c91218]">{busy ? <Loader2 size={14} className="mr-2 animate-spin" /> : <FolderInput size={14} className="mr-2" />}Di chuyển</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MediaCard({ item, selected, selectMode, copiedKey, onPick, onToggle, onCopy, onRename, onDelete }: any) {
  return (
    <article onClick={() => selectMode ? onToggle(item.path) : onPick(item)} className={`group overflow-hidden border bg-white transition ${selected ? "border-[#ed1c24] ring-4 ring-red-100" : "border-slate-200 hover:border-[#ed1c24] hover:shadow-xl"} ${selectMode ? "cursor-pointer" : "cursor-default"}`}>
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <MediaThumb item={item} />
        <Badge className="absolute left-2 top-2 rounded-none bg-black/75 text-[9px] font-black uppercase text-white">{isVideo(item.mimetype, item.name) ? "Video" : isImage(item.mimetype, item.name) ? "Image" : "File"}</Badge>
        {selectMode && <div className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center border ${selected ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-white bg-white text-slate-500"}`}>{selected ? <Check size={15} /> : <Square size={14} />}</div>}
        {!selectMode && (
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-1 bg-black/82 p-2 transition group-hover:translate-y-0">
            <IconButton title="Copy URL" onClick={() => onCopy(item.url, item.path)} active={copiedKey === item.path}><Copy size={14} /></IconButton>
            <IconButton title="Đổi tên" onClick={() => onRename(item)}><Pencil size={14} /></IconButton>
            <IconLink title="Mở file" href={item.url}><ExternalLink size={14} /></IconLink>
            <IconLink title="Tải xuống" href={item.url} download={item.name}><Download size={14} /></IconLink>
            <IconButton title="Xóa" danger onClick={() => onDelete(item)}><Trash2 size={14} /></IconButton>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-xs font-black text-slate-900" title={item.name}>{item.name}</p>
        <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
          <span>{formatBytes(item.size)}</span>
          <button onClick={(event) => { event.stopPropagation(); onCopy(item.url, `${item.path}:small`) }} className="text-[#ed1c24]">{copiedKey === `${item.path}:small` ? "Đã chép" : "Copy"}</button>
        </div>
      </div>
    </article>
  )
}

function MediaRow({ item, selected, selectMode, copiedKey, onPick, onToggle, onCopy, onRename, onDelete }: any) {
  return (
    <div onClick={() => selectMode ? onToggle(item.path) : onPick(item)} className={`grid grid-cols-[72px_1fr_auto] items-center gap-4 bg-white p-3 ${selected ? "bg-red-50" : ""}`}>
      <div className="relative h-16 w-16 overflow-hidden bg-slate-100"><MediaThumb item={item} /></div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black">{item.name}</p>
        <p className="truncate text-xs font-semibold text-slate-500">{item.path} · {formatBytes(item.size)}</p>
      </div>
      <div className="flex gap-1">
        <IconButton title="Copy URL" onClick={() => onCopy(item.url, item.path)} active={copiedKey === item.path}><Copy size={14} /></IconButton>
        <IconButton title="Đổi tên" onClick={() => onRename(item)}><Pencil size={14} /></IconButton>
        <IconButton title="Xóa" danger onClick={() => onDelete(item)}><Trash2 size={14} /></IconButton>
      </div>
    </div>
  )
}

function MediaThumb({ item }: { item: MediaItem }) {
  if (isImage(item.mimetype, item.name)) return <img src={item.url} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
  if (isVideo(item.mimetype, item.name)) return <video src={item.url} className="h-full w-full object-cover" muted />
  return <div className="flex h-full w-full items-center justify-center text-slate-300"><ImageIcon size={30} /></div>
}

function MediaInspector({ item, copiedKey, onCopy }: { item: MediaItem | null; copiedKey: string | null; onCopy: (text: string, key: string, label?: string) => void }) {
  if (!item) {
    return (
      <aside className="border border-slate-200 bg-white p-6">
        <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
          <Layers3 className="mb-4 h-12 w-12 text-slate-200" />
          <p className="font-black uppercase">Chọn một media</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">Preview, copy URL và thông tin file sẽ hiện ở đây.</p>
        </div>
      </aside>
    )
  }
  return (
    <aside className="space-y-4 border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24]">Inspector</p>
          <h2 className="font-black uppercase">Chi tiết media</h2>
        </div>
        <a href={item.url} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center border border-slate-200 hover:border-[#ed1c24] hover:text-[#ed1c24]"><Maximize2 size={16} /></a>
      </div>
      <div className="aspect-video overflow-hidden border border-slate-200 bg-slate-100"><MediaThumb item={item} /></div>
      <div>
        <p className="break-all text-sm font-black">{item.name}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{item.mimetype || "unknown"} · {formatBytes(item.size)}</p>
      </div>
      <div className="space-y-2">
        <CopyBox label="Public URL" value={item.url} copyKey={`${item.path}:url`} copiedKey={copiedKey} onCopy={onCopy} />
        <CopyBox label="Storage path" value={item.path} copyKey={`${item.path}:path`} copiedKey={copiedKey} onCopy={onCopy} />
        <CopyBox label="Markdown image" value={`![${item.name}](${item.url})`} copyKey={`${item.path}:md`} copiedKey={copiedKey} onCopy={onCopy} />
      </div>
      <div className="border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-[#ed1c24]"><LayoutPanelTop size={15} /><span className="text-[10px] font-black uppercase tracking-widest">Gắn vào website</span></div>
        <p className="text-xs font-semibold leading-6 text-slate-600">Dùng Public URL cho hero, banner, gallery, footer, floating, GZVer profile hoặc block ảnh trong site-content.</p>
      </div>
    </aside>
  )
}

function CopyBox({ label, value, copyKey, copiedKey, onCopy }: any) {
  return (
    <div className="border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        <button onClick={() => onCopy(value, copyKey)} className="text-[#ed1c24]"><Copy size={14} /></button>
      </div>
      <p className="break-all p-3 text-[11px] font-semibold leading-5 text-slate-600">{copiedKey === copyKey ? "Đã sao chép" : value}</p>
    </div>
  )
}

function IconButton({ children, title, onClick, danger, active }: any) {
  return (
    <button title={title} onClick={(event) => { event.stopPropagation(); onClick?.() }} className={`flex h-9 w-9 items-center justify-center border border-white/10 bg-white text-slate-900 transition ${danger ? "hover:bg-red-600 hover:text-white" : "hover:bg-[#ed1c24] hover:text-white"} ${active ? "bg-[#ed1c24] text-white" : ""}`}>
      {children}
    </button>
  )
}

function IconLink({ children, title, href, download }: any) {
  return (
    <a title={title} href={href} download={download} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white text-slate-900 transition hover:bg-[#ed1c24] hover:text-white">
      {children}
    </a>
  )
}
