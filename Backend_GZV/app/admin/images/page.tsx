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
  Film,
  Folder,
  FolderPlus,
  Grid3X3,
  HardDrive,
  Image as ImageIcon,
  Info,
  List,
  Loader2,
  Maximize2,
  Plus,
  RefreshCw,
  Search,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react"

const BUCKET = "media"
const INITIAL_FOLDERS = [
  "all",
  "site",
  "uploads",
  "articles",
  "projects",
  "courses",
  "mentors",
  "authors",
  "gzvers",
  "partners",
]

type MediaItem = {
  name: string
  path: string
  folder: string
  url: string
  size: number
  mimetype: string
  created_at?: string
  updated_at?: string
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
  return /\.(mp4|webm|mov|m4v|ogg)$/i.test(name || "")
}

export default function AdminImagesPage() {
  const [folders, setFolders] = useState<string[]>(INITIAL_FOLDERS)
  const [currentFolder, setCurrentFolder] = useState<string>("all")
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "file">("all")
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const stats = useMemo(() => ({
    count: items.length,
    size: items.reduce((sum, item) => sum + (item.size || 0), 0),
    images: items.filter((item) => isImage(item.mimetype, item.name)).length,
    videos: items.filter((item) => isVideo(item.mimetype, item.name)).length,
  }), [items])

  // 1. Tải danh sách thư mục (giống MediaPickerDialog)
  const loadFolders = useCallback(async () => {
    let custom: string[] = []
    try {
      const saved = localStorage.getItem("gzv_custom_folders")
      if (saved) custom = JSON.parse(saved)
    } catch (e) {}

    let dirs: string[] = []
    try {
      const { data } = await supabase.storage.from(BUCKET).list("", { limit: 200 })
      dirs = (data || []).filter((o) => !o.metadata || o.id === null).map((o) => o.name)
    } catch (e) {}

    const combined = Array.from(new Set([...INITIAL_FOLDERS, ...custom, ...dirs])).filter(Boolean)
    const sorted = ["all", ...combined.filter((f) => f !== "all").sort()]
    setFolders(sorted)
  }, [])

  // 2. Tải danh sách file theo thư mục (Logic hợp nhất từ API + Supabase Storage như MediaPickerDialog)
  const loadFolder = useCallback(async (f: string) => {
    setLoading(true)
    try {
      let fileItems: MediaItem[] = []
      const targetFolders = f === "all" ? INITIAL_FOLDERS.filter((item) => item !== "all") : [f]

      await Promise.allSettled(
        targetFolders.map(async (targetF) => {
          // A. Fetch from Next.js server API (reads local uploads + synced assets)
          try {
            const res = await fetch(`/api/images?folder=${encodeURIComponent(targetF)}`)
            const json = await res.json()
            if (json.success && Array.isArray(json.data?.files)) {
              for (const file of json.data.files) {
                if (!fileItems.some((it) => it.name === (file.name || file.file_name))) {
                  fileItems.push({
                    name: file.name || file.file_name,
                    path: file.path || file.storage_path || `${targetF}/${file.name || file.file_name}`,
                    folder: targetF,
                    url: file.url || file.file_url,
                    size: file.size || file.file_size_bytes || 0,
                    mimetype: file.mimetype || file.mime_type || "",
                    created_at: file.created_at,
                    updated_at: file.updated_at,
                  })
                }
              }
            }
          } catch (e) {}

          // B. Also fetch from Supabase Storage bucket and merge unique files
          try {
            const { data } = await supabase.storage.from(BUCKET).list(targetF, {
              limit: 500,
              sortBy: { column: "created_at", order: "desc" },
            })
            if (data && data.length > 0) {
              const validFiles = data.filter(
                (o) => o.name && o.name !== ".keep" && /\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|ogg|mov|pdf|docx?)$/i.test(o.name)
              )
              for (const file of validFiles) {
                if (!fileItems.some((item) => item.name === file.name)) {
                  const path = `${targetF}/${file.name}`
                  const {
                    data: { publicUrl },
                  } = supabase.storage.from(BUCKET).getPublicUrl(path)
                  fileItems.push({
                    name: file.name,
                    path,
                    folder: targetF,
                    url: publicUrl,
                    size: (file.metadata as any)?.size ?? 0,
                    mimetype: (file.metadata as any)?.mimetype ?? "",
                    created_at: file.created_at || undefined,
                    updated_at: file.updated_at || undefined,
                  })
                }
              }
            }
          } catch (e) {}
        })
      )

      setItems(fileItems)
      setSelectedItem((prev) => (prev ? fileItems.find((it) => it.path === prev.path) || fileItems[0] || null : fileItems[0] || null))
    } catch (err: any) {
      toast({ title: "Lỗi tải thư mục", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  useEffect(() => {
    loadFolder(currentFolder)
  }, [currentFolder, loadFolder])

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

  const copy = async (text: string, key: string, label = "Đã sao chép liên kết") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      toast({ title: label })
      setTimeout(() => setCopiedKey(null), 1400)
    } catch {
      toast({ title: "Không sao chép được", variant: "destructive" })
    }
  }

  // 3. Tải lên media (Trực tiếp Supabase Storage + API Sync)
  const handleUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    const targetFolder = currentFolder === "all" ? "uploads" : currentFolder
    let ok = 0
    let fail = 0
    let lastError = ""

    try {
      const fileArray = Array.from(files)
      for (const file of fileArray) {
        let uploaded = false

        // 1. Direct Supabase Storage Upload
        try {
          const safe = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "")
          const path = `${targetFolder}/${Date.now()}_${safe}`
          
          const { data, error: supaErr } = await supabase.storage.from(BUCKET).upload(path, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type || "image/jpeg",
          })

          if (!supaErr && data) {
            uploaded = true
            ok += 1
          } else if (supaErr) {
            lastError = supaErr.message
          }
        } catch (e: any) {
          lastError = e.message || "Lỗi Supabase Storage"
        }

        // 2. Fallback via Local Server API if direct storage failed
        if (!uploaded) {
          try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("folder", targetFolder)

            const res = await fetch("/api/images", {
              method: "POST",
              body: formData,
            })

            const json = await res.json()
            if (res.ok && json.success) {
              uploaded = true
              ok += 1
            } else {
              fail += 1
              lastError = json.error || json.message || lastError
            }
          } catch (apiErr: any) {
            fail += 1
            lastError = apiErr.message || lastError
          }
        }
      }

      if (fail && !ok) {
        toast({
          title: "Tải lên thất bại",
          description: lastError || "Không thể tải tệp lên",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Tải lên thành công",
          description: `Đã tải lên ${ok} tệp tin vào thư mục "${targetFolder}"${fail > 0 ? ` (${fail} lỗi: ${lastError})` : ""}`,
          variant: fail > 0 ? "destructive" : "default",
        })
      }
      await loadFolder(currentFolder)
    } catch (err: any) {
      toast({ title: "Lỗi tải tệp", description: err.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  // 4. Tạo thư mục mới
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    const clean = newFolderName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, "")
    if (!clean) return

    if (!folders.includes(clean)) {
      const updated = Array.from(new Set([...folders, clean])).sort()
      setFolders(updated)
      try {
        localStorage.setItem("gzv_custom_folders", JSON.stringify(updated))
      } catch (e) {}
    }

    setCurrentFolder(clean)
    setNewFolderName("")
    setIsCreatingFolder(false)
    toast({ title: `Đã tạo thư mục mới: ${clean}` })
  }

  // 5. Xóa thư mục tùy chỉnh
  const handleDeleteFolder = (targetFolder: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (INITIAL_FOLDERS.includes(targetFolder)) {
      toast({ title: "Không thể xóa thư mục hệ thống mặc định", variant: "destructive" })
      return
    }

    const updated = folders.filter((f) => f !== targetFolder)
    setFolders(updated)
    try {
      localStorage.setItem("gzv_custom_folders", JSON.stringify(updated))
    } catch (err) {}

    if (currentFolder === targetFolder) {
      setCurrentFolder("all")
    }
    toast({ title: `Đã xóa thư mục ${targetFolder}` })
  }

  // 6. Xóa tệp (đồng bộ qua API + Supabase Storage)
  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Xóa vĩnh viễn "${item.name}"?`)) return
    try {
      // Try DELETE via API
      try {
        await fetch(`/api/images?path=${encodeURIComponent(item.path)}`, { method: "DELETE" })
      } catch (e) {}

      // Delete from Supabase Storage
      await supabase.storage.from(BUCKET).remove([item.path])

      toast({ title: "Đã xóa file thành công" })
      setItems((prev) => prev.filter((media) => media.path !== item.path))
      if (selectedItem?.path === item.path) setSelectedItem(null)
    } catch (err: any) {
      toast({ title: "Lỗi xóa file", description: err.message, variant: "destructive" })
    }
  }

  // 7. Xóa hàng loạt
  const handleBulkDelete = async () => {
    if (!selected.size) return
    if (!confirm(`Xóa vĩnh viễn ${selected.size} file đã chọn?`)) return
    const paths = Array.from(selected)
    try {
      await supabase.storage.from(BUCKET).remove(paths)
      toast({ title: `Đã xóa ${paths.length} file` })
      setItems((prev) => prev.filter((item) => !selected.has(item.path)))
      clearSelection()
    } catch (err: any) {
      toast({ title: "Lỗi xóa hàng loạt", description: err.message, variant: "destructive" })
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">
      {/* Top Header Card */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 shrink-0 bg-[#ed1c24] text-white flex items-center justify-center font-black shadow-xs">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                GZV MEDIA STORAGE
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                Quản Trị Thư Viện Media & Ảnh
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Kho media đồng bộ với MediaPicker cho toàn bộ hệ thống website GZV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadFolder(currentFolder)}
              disabled={loading}
              className="h-9 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 text-[#ed1c24] ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>

            <Button
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="h-9 px-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
            >
              {uploading ? <Loader2 className="mr-2 animate-spin h-3.5 w-3.5" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
              Tải lên media
            </Button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={(event) => {
                handleUpload(event.target.files)
                event.target.value = ""
              }}
            />
          </div>
        </div>

        {/* 4 Control Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tổng Số File</p>
            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{stats.count}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tổng Dung Lượng</p>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatBytes(stats.size)}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Thư Mục Đang Xem</p>
            <p className="mt-2 text-base font-black text-blue-600 dark:text-blue-400 truncate font-mono">/{currentFolder}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Số File Đang Chọn</p>
            <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">{selected.size}</p>
          </div>
        </div>
      </div>

      {/* Toolbar & Folders */}
      <div className="border border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-slate-900 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Tìm file, tên ảnh, định dạng..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-none border-slate-200 bg-slate-50 pl-10 pr-12 text-sm font-medium dark:border-white/10 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                Xóa
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center border border-slate-200 dark:border-white/10">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className={`h-9 rounded-none px-3 text-xs font-black uppercase ${
                  viewMode === "grid" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 size={14} className="mr-1.5" /> Lưới
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={`h-9 rounded-none px-3 text-xs font-black uppercase ${
                  viewMode === "list" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <List size={14} className="mr-1.5" /> Bảng
              </Button>
            </div>

            <Button
              variant={selectMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectMode(!selectMode)
                if (selectMode) clearSelection()
              }}
              className={`h-9 rounded-none text-xs font-black uppercase ${
                selectMode ? "bg-[#ed1c24] text-white hover:bg-[#c91218]" : "border-slate-200"
              }`}
            >
              {selectMode ? <CheckSquare className="mr-1.5 h-3.5 w-3.5" /> : <Square className="mr-1.5 h-3.5 w-3.5" />}
              {selectMode ? "Hủy chọn" : "Chọn nhiều"}
            </Button>
          </div>
        </div>

        {/* Folder Navigation Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {folders.map((f) => {
              const active = currentFolder === f
              const isDefault = INITIAL_FOLDERS.includes(f)
              return (
                <div
                  key={f}
                  onClick={() => {
                    setCurrentFolder(f)
                    setSelectedItem(null)
                    clearSelection()
                  }}
                  className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer border transition-colors ${
                    active
                      ? "bg-[#ed1c24] text-white border-[#ed1c24]"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10"
                  }`}
                >
                  <Folder size={13} className={active ? "text-white" : "text-slate-400"} />
                  <span>{f === "all" ? "Tất cả file" : f}</span>
                  {!isDefault && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteFolder(f, e)}
                      className="ml-1 opacity-60 hover:opacity-100 hover:text-white"
                      title="Xóa thư mục"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )
            })}

            {/* Create Folder Inline Input */}
            {isCreatingFolder ? (
              <div className="flex items-center gap-1">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Tên folder..."
                  className="h-8 w-32 rounded-none text-xs font-mono"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder()
                    if (e.key === "Escape") setIsCreatingFolder(false)
                  }}
                />
                <Button size="sm" onClick={handleCreateFolder} className="h-8 rounded-none bg-[#ed1c24] text-white text-xs px-2">
                  <Check size={13} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsCreatingFolder(false)} className="h-8 rounded-none text-xs px-2">
                  <X size={13} />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingFolder(true)}
                className="h-8 rounded-none border-dashed border-slate-300 text-xs font-bold text-slate-600 hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/20 dark:text-slate-300 px-2.5"
              >
                <Plus size={13} className="mr-1" /> Thư mục mới
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectMode && selected.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-white text-slate-900 rounded-none border border-slate-200 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-white animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckSquare size={18} className="text-[#ed1c24]" />
            <span className="text-xs font-black uppercase tracking-wider">Đã chọn {selected.size} tệp tin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={clearSelection}
              className="h-8 rounded-none text-xs font-bold uppercase text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:bg-white/5"
            >
              Bỏ chọn
            </Button>
            <Button
              size="sm"
              onClick={handleBulkDelete}
              className="h-8 rounded-none text-xs font-black uppercase bg-[#ed1c24] hover:bg-[#c91218] text-white"
            >
              <Trash2 size={13} className="mr-1.5" /> Xóa tất cả đã chọn
            </Button>
          </div>
        </div>
      )}

      {/* Main Content: Files List / Grid + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Files Grid / Table */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragging(false)
            if (e.dataTransfer?.files?.length) {
              handleUpload(e.dataTransfer.files)
            }
          }}
          className={`lg:col-span-8 border relative transition-all bg-white dark:border-white/10 dark:bg-slate-900 shadow-xs min-h-[420px] ${
            dragging ? "border-dashed border-[#ed1c24] bg-red-50/20 ring-2 ring-[#ed1c24]/30" : "border-slate-200"
          }`}
        >
          {dragging && (
            <div className="absolute inset-0 z-30 bg-red-500/10 backdrop-blur-[2px] flex flex-col items-center justify-center border-2 border-dashed border-[#ed1c24]">
              <Upload className="h-10 w-10 text-[#ed1c24] animate-bounce mb-2" />
              <p className="text-sm font-black uppercase text-[#ed1c24]">Thả tệp vào đây để tải lên /{currentFolder === "all" ? "uploads" : currentFolder}</p>
            </div>
          )}

          {loading ? (
            <div className="py-28 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#ed1c24]" />
              <p className="text-slate-400 mt-4 font-black uppercase text-xs tracking-widest">Đang tải danh sách media...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-28 text-center space-y-3">
              <ImageIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Thư mục trống hoặc không có file phù hợp</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="rounded-none text-xs font-bold border-slate-200"
              >
                <Upload size={13} className="mr-1.5 text-[#ed1c24]" /> Tải ảnh ngay
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((item) => {
                const isSelected = selected.has(item.path)
                const isCurrentActive = selectedItem?.path === item.path

                return (
                  <div
                    key={item.path}
                    onClick={() => {
                      if (selectMode) toggleSelected(item.path)
                      else setSelectedItem(item)
                    }}
                    className={`group relative aspect-square border overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#ed1c24] ring-2 ring-[#ed1c24] bg-red-50/20"
                        : isCurrentActive
                        ? "border-[#ed1c24] ring-1 ring-[#ed1c24]"
                        : "border-slate-200 dark:border-white/10 hover:border-slate-400 bg-slate-50 dark:bg-slate-950"
                    }`}
                  >
                    {isImage(item.mimetype, item.name) ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : isVideo(item.mimetype, item.name) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-2">
                        <Film size={28} className="text-[#ed1c24] mb-1" />
                        <span className="text-[9px] font-mono truncate max-w-full">{item.name}</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 p-2">
                        <Info size={28} className="text-slate-400 mb-1" />
                        <span className="text-[9px] font-mono truncate max-w-full">{item.name}</span>
                      </div>
                    )}

                    {/* Checkbox overlay */}
                    {selectMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <div
                          className={`w-5 h-5 flex items-center justify-center border ${
                            isSelected ? "bg-[#ed1c24] border-[#ed1c24] text-white" : "bg-white/90 border-slate-300"
                          }`}
                        >
                          {isSelected && <Check size={13} />}
                        </div>
                      </div>
                    )}

                    {/* Hover Quick Overlay */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-none bg-white/90 hover:bg-white text-slate-900"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewItem(item)
                        }}
                        title="Xem phóng to"
                      >
                        <Maximize2 size={13} />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-none bg-white/90 hover:bg-white text-slate-900"
                        onClick={(e) => {
                          e.stopPropagation()
                          copy(item.url, item.path, "Đã sao chép URL")
                        }}
                        title="Sao chép URL"
                      >
                        <Copy size={13} />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item)
                        }}
                        title="Xóa tệp"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5">
                      <p className="text-[10px] text-white font-semibold truncate leading-tight">{item.name}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((item) => (
                <div
                  key={item.path}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    selectedItem?.path === item.path ? "bg-slate-50 dark:bg-slate-800/80" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 overflow-hidden">
                      {isImage(item.mimetype, item.name) ? (
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Film size={16} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{formatBytes(item.size)} · /{item.folder}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-none text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        copy(item.url, item.path, "Đã sao chép URL")
                      }}
                    >
                      <Copy size={13} className="mr-1" /> Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-none text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item)
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail & Action Inspector Panel */}
        <div className="lg:col-span-4 border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 shadow-xs space-y-5 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Info size={14} className="text-[#ed1c24]" /> Chi Tiết Media
            </h3>
            {selectedItem && (
              <Badge variant="outline" className="rounded-none text-[9px] uppercase font-bold">
                {selectedItem.folder}
              </Badge>
            )}
          </div>

          {selectedItem ? (
            <div className="space-y-4">
              {/* Preview Box */}
              <div className="relative aspect-video w-full border border-slate-200 dark:border-white/10 bg-slate-950 flex items-center justify-center overflow-hidden">
                {isImage(selectedItem.mimetype, selectedItem.name) ? (
                  <img src={selectedItem.url} alt={selectedItem.name} className="w-full h-full object-contain" />
                ) : isVideo(selectedItem.mimetype, selectedItem.name) ? (
                  <video src={selectedItem.url} controls className="w-full h-full" />
                ) : (
                  <div className="text-slate-400 text-center p-4">
                    <Info size={32} className="mx-auto mb-2" />
                    <p className="text-xs font-bold">{selectedItem.name}</p>
                  </div>
                )}
              </div>

              {/* Meta information */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Tên file:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 break-words">{selectedItem.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Dung lượng:</span>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{formatBytes(selectedItem.size)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Thư mục:</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300">/{selectedItem.folder}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Đường dẫn Storage:</span>
                  <p className="font-mono text-[10px] text-slate-600 dark:text-slate-400 break-words">{selectedItem.path}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <Button
                  className="w-full rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white text-xs font-black uppercase tracking-wider h-10 gap-2"
                  onClick={() => copy(selectedItem.url, "detail-url", "Đã sao chép Direct URL")}
                >
                  <Copy size={14} /> Sao chép URL Ảnh
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-none border-slate-200 text-xs font-bold uppercase h-9 gap-1.5"
                    onClick={() => copy(`![${selectedItem.name}](${selectedItem.url})`, "md", "Đã sao chép Markdown")}
                  >
                    <Code2 size={13} /> Markdown
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-none border-slate-200 text-xs font-bold uppercase h-9 gap-1.5"
                    onClick={() => copy(`<img src="${selectedItem.url}" alt="${selectedItem.name}" />`, "html", "Đã sao chép HTML")}
                  >
                    <Code2 size={13} /> HTML Tag
                  </Button>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-none border-slate-200 text-xs font-bold h-9 gap-1.5"
                    onClick={() => window.open(selectedItem.url, "_blank")}
                  >
                    <ExternalLink size={13} /> Mở tab mới
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-none border-slate-200 text-red-600 hover:bg-red-50 h-9 px-3"
                    onClick={() => handleDelete(selectedItem)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Info size={28} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Chọn một tệp bất kỳ bên trái để xem chi tiết và lấy mã nhúng</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-4xl p-0 bg-slate-950 border border-slate-800 text-white rounded-none overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider truncate max-w-lg">{previewItem?.name}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(previewItem?.url || "", "lightbox", "Đã copy link")}
              className="text-xs text-white rounded-none hover:bg-white/10"
            >
              <Copy size={13} className="mr-1.5" /> Copy link
            </Button>
          </div>
          <div className="p-6 flex items-center justify-center max-h-[75vh] overflow-auto">
            {previewItem && isImage(previewItem.mimetype, previewItem.name) ? (
              <img src={previewItem.url} alt={previewItem.name} className="max-h-[68vh] object-contain" />
            ) : previewItem && isVideo(previewItem.mimetype, previewItem.name) ? (
              <video src={previewItem.url} controls autoPlay className="max-h-[68vh] w-full" />
            ) : (
              <div className="p-12 text-center text-slate-400">
                <Info size={40} className="mx-auto mb-2" />
                <p className="text-sm font-bold">{previewItem?.name}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
