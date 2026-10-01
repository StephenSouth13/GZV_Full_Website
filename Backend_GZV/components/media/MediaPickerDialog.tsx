"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Folder, Search, Upload, Loader2, Image as ImageIcon, Check, Video, Plus, Trash2, X, Link2, FileText } from 'lucide-react'
import { normalizeMediaUrl } from '@/lib/media-url'

const BUCKET = 'media'
const INITIAL_FOLDERS = [
  'site', 'uploads', 'articles', 'projects', 'courses', 'mentors', 'authors', 'gzvers'
]

type Item = { name: string; path: string; url: string; size: number; mimetype: string }

export type MediaPickResult = { url: string; alt: string; width: string }

export type MediaAccept = 'image' | 'video' | 'file' | 'any'

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (result: MediaPickResult) => void
  defaultFolder?: string
  // 'field': chọn cho một ô (avatar, ảnh bìa...) -> ẩn chọn kích thước chèn
  mode?: 'insert' | 'field'
  accept?: MediaAccept
}

const ACCEPT_PATTERN: Record<MediaAccept, RegExp> = {
  image: /\.(png|jpe?g|webp|gif|svg|avif)$/i,
  video: /\.(mp4|webm|ogg|mov)$/i,
  file: /\.(pdf|docx?|pptx?|xlsx?|png|jpe?g|webp)$/i,
  any: /\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|ogg|mov|pdf)$/i,
}

const SIZES: Array<{ label: string; value: string }> = [
  { label: 'Nhỏ (25%)', value: '25%' },
  { label: 'Vừa (50%)', value: '50%' },
  { label: 'Lớn (75%)', value: '75%' },
  { label: 'Toàn bộ (100%)', value: '100%' },
]

export function MediaPickerDialog({ open, onClose, onSelect, defaultFolder = 'site', mode = 'insert', accept = 'any' }: Props) {
  const [folders, setFolders] = useState<string[]>(INITIAL_FOLDERS)
  const [folder, setFolder] = useState<string>(defaultFolder)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Item | null>(null)
  const [width, setWidth] = useState<string>('100%')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'library' | 'url'>('library')
  const [urlInput, setUrlInput] = useState('')
  // Ảnh/video: đổi link Drive sang dạng hiển thị được; tài liệu (CV, PDF) giữ nguyên link gốc
  const pastedUrl = accept === 'file' ? urlInput.trim() : normalizeMediaUrl(urlInput, accept === 'video' ? 'video' : 'image')

  const loadFolders = useCallback(async () => {
    let custom: string[] = []
    try {
      const saved = localStorage.getItem('gzv_custom_folders')
      if (saved) custom = JSON.parse(saved)
    } catch (e) {}

    let dirs: string[] = []
    try {
      const { data } = await supabase.storage.from(BUCKET).list('', { limit: 200 })
      dirs = (data || []).filter((o) => !o.metadata || o.id === null).map((o) => o.name)
    } catch (e) {}

    const combined = Array.from(new Set([...INITIAL_FOLDERS, ...custom, ...dirs])).filter(Boolean).sort()
    setFolders(combined)
  }, [])

  const loadFolder = useCallback(async (f: string) => {
    setLoading(true)
    try {
      let fileItems: Item[] = []

      // 1. Fetch from Next.js server API (reads local uploads + synced assets)
      try {
        const res = await fetch(`/api/images?folder=${encodeURIComponent(f)}`)
        const json = await res.json()
        if (json.success && Array.isArray(json.data?.files)) {
          fileItems = json.data.files.map((file: any) => ({
            name: file.name || file.file_name,
            path: file.path || file.storage_path || (f ? `${f}/${file.name}` : file.name),
            url: file.url || file.file_url,
            size: file.size || file.file_size_bytes || 0,
            mimetype: file.mimetype || file.mime_type || '',
          }))
        }
      } catch (e) {}

      // 2. Duyệt Supabase Storage, gồm cả thư mục con (vd gzvers/avatars, gzvers/cards)
      try {
        const collect = async (prefix: string, depth = 0): Promise<void> => {
          if (depth > 4) return
          const { data } = await supabase.storage.from(BUCKET).list(prefix, {
            limit: 500,
            sortBy: { column: 'created_at', order: 'desc' },
          })
          for (const file of data || []) {
            if (!file.name || file.name === '.emptyFolderPlaceholder') continue
            const path = prefix ? `${prefix}/${file.name}` : file.name
            if (file.id === null || !file.metadata) {
              await collect(path, depth + 1)
              continue
            }
            if (fileItems.some((item) => item.path === path)) continue
            const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
            fileItems.push({
              name: prefix !== f ? path.slice(f.length + 1) : file.name,
              path,
              url: publicUrl,
              size: (file.metadata as any)?.size ?? 0,
              mimetype: (file.metadata as any)?.mimetype ?? '',
            })
          }
        }
        await collect(f)
      } catch (e) {}

      setItems(fileItems.filter((item) => ACCEPT_PATTERN[accept].test(item.path) || ACCEPT_PATTERN[accept].test(item.name)))
    } catch (err: any) {
      toast({ title: 'Lỗi tải thư mục', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [accept])

  useEffect(() => {
    if (open) {
      loadFolders()
      loadFolder(folder)
      setSelected(null)
    }
  }, [open, folder, loadFolders, loadFolder])

  useEffect(() => {
    if (open) {
      setTab('library')
      setUrlInput('')
    }
  }, [open])

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    const clean = newFolderName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '')
    if (!clean) return

    if (!folders.includes(clean)) {
      const updated = [...folders, clean].sort()
      setFolders(updated)
      try {
        localStorage.setItem('gzv_custom_folders', JSON.stringify(updated))
      } catch (e) {}
    }

    setFolder(clean)
    setNewFolderName('')
    setIsCreatingFolder(false)
    toast({ title: `Đã tạo thư mục mới: ${clean}` })
  }

  const handleDeleteFolder = (targetFolder: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (INITIAL_FOLDERS.includes(targetFolder)) {
      toast({ title: 'Không thể xóa thư mục hệ thống mặc định', variant: 'destructive' })
      return
    }

    const updated = folders.filter((f) => f !== targetFolder)
    setFolders(updated)
    try {
      localStorage.setItem('gzv_custom_folders', JSON.stringify(updated))
    } catch (err) {}

    if (folder === targetFolder) {
      setFolder('site')
    }
    toast({ title: `Đã xóa thư mục ${targetFolder}` })
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    let lastUploadedItem: Item | null = null

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        const res = await fetch('/api/images', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        })

        const json = await res.json()

        if (res.ok && json.success && json.data) {
          lastUploadedItem = {
            name: json.data.name || file.name,
            path: json.data.path || `${folder}/${file.name}`,
            url: json.data.url,
            size: json.data.size || file.size,
            mimetype: json.data.mimetype || file.type,
          }
        } else {
          // Direct fallback upload
          const safe = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
          const path = `${folder}/${Date.now()}_${safe}`
          const { data: directData, error: directErr } = await supabase.storage.from(BUCKET).upload(path, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type,
          })

          if (directErr) {
            toast({
              title: 'Lỗi tải ảnh lên',
              description: json.error || directErr.message || 'Không thể tải ảnh lên storage',
              variant: 'destructive',
            })
            setUploading(false)
            return
          }

          const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
          lastUploadedItem = {
            name: file.name,
            path,
            url: publicUrl,
            size: file.size,
            mimetype: file.type,
          }
        }
      }

      toast({ title: 'Đã tải ảnh lên thành công!' })
      await loadFolder(folder)
      if (lastUploadedItem) {
        setSelected(lastUploadedItem)
      }
    } catch (err: any) {
      toast({
        title: 'Lỗi tải ảnh',
        description: err.message || 'Lỗi hệ thống khi tải ảnh',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items
  }, [items, search])

  const confirm = () => {
    if (tab === 'url') {
      if (!/^https?:\/\//i.test(pastedUrl)) {
        toast({ title: 'URL chưa hợp lệ', description: 'Dán link đầy đủ bắt đầu bằng https://', variant: 'destructive' })
        return
      }
      onSelect({ url: pastedUrl, alt: '', width })
      onClose()
      return
    }
    if (!selected) return
    onSelect({ url: selected.url, alt: selected.name, width })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1150px] w-[95vw] h-[88vh] max-h-[850px] flex flex-col p-0 rounded-none border border-slate-200 shadow-2xl overflow-hidden">
        <DialogHeader className="px-7 py-4 border-b bg-[#050505] text-white shrink-0">
          <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <ImageIcon size={18} /> Thư viện ảnh & Truyền thông
          </DialogTitle>
          <DialogDescription className="text-white/70 text-[11px] font-bold uppercase tracking-widest">
            Chọn ảnh có sẵn, tải từ máy lên, hoặc dán URL (Google Drive, CDN...)
          </DialogDescription>
          <div className="mt-3 flex gap-1">
            {([
              { key: 'library', label: 'Thư viện', icon: ImageIcon },
              { key: 'url', label: 'Dán URL', icon: Link2 },
            ] as const).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black uppercase transition ${tab === item.key ? 'bg-[#ed1c24] text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
              >
                <item.icon size={13} /> {item.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        {tab === 'url' && (
          <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto bg-slate-50/50 p-6">
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-500">URL ảnh / video / file</p>
              <Input
                autoFocus
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirm()}
                placeholder="https://drive.google.com/file/d/... hoặc https://...jpg"
                className="h-11 rounded-none border-slate-200 bg-white font-mono text-xs"
              />
              <p className="mt-2 text-[11px] text-slate-500">
                Link Google Drive được tự chuyển sang dạng xem trực tiếp. File Drive cần chia sẻ "Bất kỳ ai có đường liên kết".
              </p>
            </div>
            {pastedUrl && pastedUrl !== urlInput.trim() && (
              <p className="break-all text-[11px] text-slate-500">
                Sẽ lưu: <span className="font-mono text-slate-700">{pastedUrl}</span>
              </p>
            )}
            <div className="flex min-h-[260px] flex-1 items-center justify-center border border-dashed border-slate-300 bg-white p-4">
              {!/^https?:\/\//i.test(pastedUrl) ? (
                <p className="text-xs font-semibold text-slate-400">Xem trước sẽ hiện ở đây</p>
              ) : /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(pastedUrl) ? (
                <video src={pastedUrl} controls className="max-h-[50vh] max-w-full" />
              ) : /\.(pdf|docx?|pptx?|xlsx?)(\?.*)?$/i.test(pastedUrl) ? (
                <div className="flex flex-col items-center gap-2 text-slate-500"><FileText size={40} /><span className="text-xs font-bold">Tài liệu</span></div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pastedUrl} alt="" className="max-h-[50vh] max-w-full object-contain" />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="h-9 rounded-none px-4 text-xs font-bold">Hủy</Button>
              <Button size="sm" onClick={confirm} disabled={!urlInput.trim()} className="h-9 rounded-none bg-[#ed1c24] px-6 text-xs font-black uppercase text-white hover:bg-[#c91218]">
                Dùng URL này
              </Button>
            </div>
          </div>
        )}

        <div className={`grid-cols-12 flex-1 min-h-0 overflow-hidden ${tab === 'library' ? 'grid' : 'hidden'}`}>
          {/* Sidebar Folders */}
          <aside className="col-span-3 border-r bg-slate-50/70 p-3 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-200/80 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thư mục ({folders.length})</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                className="h-6 px-1.5 text-[10px] font-black uppercase text-[#ed1c24] hover:bg-red-50"
                title="Tạo thư mục mới"
              >
                <Plus size={12} className="mr-0.5" /> Tạo mới
              </Button>
            </div>

            {isCreatingFolder && (
              <div className="p-2 my-2 bg-white border border-slate-200 rounded-none space-y-2 shadow-xs shrink-0">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  placeholder="Tên thư mục mới..."
                  className="h-7 text-xs rounded-none border-slate-200"
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleCreateFolder} className="h-6 flex-1 text-[10px] font-black uppercase bg-[#ed1c24] text-white rounded-none">
                    Tạo
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsCreatingFolder(false)} className="h-6 text-[10px] font-black uppercase rounded-none">
                    <X size={10} />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1 mt-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
              {folders.map((f) => {
                const isCurrent = folder === f
                const isCustom = !INITIAL_FOLDERS.includes(f)
                return (
                  <div
                    key={f}
                    onClick={() => setFolder(f)}
                    className={[
                      'group flex items-center justify-between px-3 py-2 rounded-none text-left text-[12px] font-bold cursor-pointer transition select-none',
                      isCurrent ? 'bg-[#ed1c24] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder size={13} className="shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                    {isCustom && (
                      <button
                        onClick={(e) => handleDeleteFolder(f, e)}
                        title="Xóa thư mục custom"
                        className="opacity-0 group-hover:opacity-100 text-white/80 hover:text-white transition p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="col-span-9 flex flex-col h-full overflow-hidden bg-white">
            {/* Top Toolbar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b bg-white shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Tìm ảnh trong /${folder}…`}
                  className="h-9 pl-9 text-xs rounded-none border-slate-200"
                />
              </div>

              <Button
                variant="default"
                size="sm"
                className="h-9 px-4 rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white text-xs font-black uppercase shadow-xs shrink-0"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="animate-spin mr-1.5" size={14} /> : <Upload size={14} className="mr-1.5" />}
                {uploading ? 'Đang tải lên...' : `Tải ảnh vào /${folder}`}
              </Button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  handleUpload(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>

            {/* Media Grid Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-300">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <Loader2 className="animate-spin mr-2 h-6 w-6 text-[#ed1c24] mb-2" /> Đang tải dữ liệu thư mục /{folder}…
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 gap-3">
                  <ImageIcon size={48} className="text-slate-300" />
                  <div className="text-center">
                    <p className="text-xs font-black uppercase text-slate-600">Thư mục /{folder} chưa có tệp ảnh nào</p>
                    <p className="text-[11px] text-slate-400 mt-1">Bấm nút "Tải ảnh vào /{folder}" ở trên để thêm hình ảnh mới</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {filtered.map((item) => {
                    const isSel = selected?.path === item.path
                    return (
                      <div
                        key={item.path}
                        onClick={() => setSelected(item)}
                        className={[
                          'relative group rounded-none overflow-hidden border-2 transition-all bg-white cursor-pointer select-none shadow-2xs',
                          isSel ? 'border-[#ed1c24] ring-2 ring-red-200 shadow-md scale-[1.01]' : 'border-slate-200 hover:border-red-300',
                        ].join(' ')}
                      >
                        <div className="aspect-square bg-slate-100 relative overflow-hidden">
                          {/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(item.name) ? (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#050505] text-white">
                              <Video className="h-8 w-8 text-[#ed1c24]" />
                              <span className="px-3 text-[10px] font-black uppercase">Video</span>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.name}
                              loading="lazy"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                        {isSel && (
                          <div className="absolute top-2 right-2 h-6 w-6 bg-[#ed1c24] text-white flex items-center justify-center shadow-lg">
                            <Check size={14} />
                          </div>
                        )}
                        <div className="p-2 text-[11px] font-semibold text-slate-700 truncate text-left border-t border-slate-100 bg-white">
                          {item.name}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t bg-white shrink-0">
              <div className="flex items-center gap-3">
                {selected && (
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[320px]">
                    Đã chọn: <strong className="text-[#ed1c24]">{selected.name}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onClose} className="rounded-none h-9 px-4 text-xs font-bold">
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={confirm}
                  disabled={!selected}
                  className="rounded-none h-9 px-6 bg-[#ed1c24] hover:bg-[#c91218] text-white text-xs font-black uppercase shadow-xs"
                >
                  {mode === 'field' ? 'Chọn' : 'Chèn ảnh'}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}
