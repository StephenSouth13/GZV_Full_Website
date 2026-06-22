"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Upload, Search, Copy, Trash2, Image as ImageIcon, Folder, FolderPlus,
  Loader2, Download, ExternalLink, RefreshCw, Check, X, HardDrive, Code2,
  Pencil, FolderInput, CheckSquare, Square,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const BUCKET = 'media'
// Default folders for the MSC ecosystem
const DEFAULT_FOLDERS = [
  'articles', 'projects', 'project-thumbnails', 'project-videos',
  'courses', 'mentors', 'authors', 'mscers', 'training', 'uploads',
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
  if (!bytes) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${u[i]}`
}

function isImage(mime?: string, name?: string) {
  if (mime?.startsWith('image/')) return true
  return /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(name || '')
}
function isVideo(mime?: string, name?: string) {
  if (mime?.startsWith('video/')) return true
  return /\.(mp4|webm|mov|m4v)$/i.test(name || '')
}

export default function AdminImagesPage() {
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS)
  const [currentFolder, setCurrentFolder] = useState<string>('articles')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolder, setNewFolder] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [stats, setStats] = useState({ count: 0, size: 0 })

  // selection + bulk ops
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [renameTarget, setRenameTarget] = useState<MediaItem | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveTargetFolder, setMoveTargetFolder] = useState('')
  const [busy, setBusy] = useState(false)

  const toggleSelected = (path: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })
  }
  const clearSelection = () => setSelected(new Set())

  const loadRootFolders = useCallback(async () => {
    const { data } = await supabase.storage.from(BUCKET).list('', { limit: 200 })
    if (!data) return
    const dirs = data
      .filter(o => !o.metadata) // folders have no metadata
      .map(o => o.name)
    setFolders(prev => Array.from(new Set([...DEFAULT_FOLDERS, ...dirs, ...prev])).sort())
  }, [])

  const loadFolder = useCallback(async (folder: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      })
      if (error) throw error
      const files = (data || []).filter(o => o.metadata) // only files
      const mapped: MediaItem[] = files.map(f => {
        const path = `${folder}/${f.name}`
        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
        return {
          name: f.name,
          path,
          folder,
          url: publicUrl,
          size: (f.metadata as any)?.size ?? 0,
          mimetype: (f.metadata as any)?.mimetype ?? '',
          created_at: f.created_at ?? '',
          updated_at: f.updated_at ?? '',
        }
      })
      setItems(mapped)
      setStats({ count: mapped.length, size: mapped.reduce((s, i) => s + i.size, 0) })
    } catch (err: any) {
      toast({ title: 'Lỗi tải thư mục', description: err.message, variant: 'destructive' })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadRootFolders() }, [loadRootFolders])
  useEffect(() => { loadFolder(currentFolder) }, [currentFolder, loadFolder])

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    let ok = 0, fail = 0
    for (const file of Array.from(files)) {
      const safe = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
      const path = `${currentFolder}/${Date.now()}_${safe}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600', upsert: false, contentType: file.type,
      })
      if (error) fail++; else ok++
    }
    setUploading(false)
    toast({
      title: 'Tải lên hoàn tất',
      description: `${ok} thành công · ${fail} thất bại`,
      variant: fail ? 'destructive' : 'default',
    })
    loadFolder(currentFolder)
  }

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Xoá vĩnh viễn "${item.name}"?`)) return
    const { error } = await supabase.storage.from(BUCKET).remove([item.path])
    if (error) return toast({ title: 'Lỗi xoá', description: error.message, variant: 'destructive' })
    toast({ title: 'Đã xoá' })
    setItems(prev => prev.filter(i => i.path !== item.path))
  }

  const handleBulkDelete = async () => {
    if (!selected.size) return
    if (!confirm(`Xoá vĩnh viễn ${selected.size} tệp đã chọn?`)) return
    setBusy(true)
    const paths = Array.from(selected)
    const { error } = await supabase.storage.from(BUCKET).remove(paths)
    setBusy(false)
    if (error) return toast({ title: 'Lỗi xoá hàng loạt', description: error.message, variant: 'destructive' })
    toast({ title: `Đã xoá ${paths.length} tệp` })
    setItems(prev => prev.filter(i => !selected.has(i.path)))
    clearSelection()
  }

  const handleRename = async () => {
    if (!renameTarget) return
    const safe = renameValue.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
    if (!safe || safe === renameTarget.name) { setRenameTarget(null); return }
    const newPath = `${renameTarget.folder}/${safe}`
    setBusy(true)
    const { error } = await supabase.storage.from(BUCKET).move(renameTarget.path, newPath)
    setBusy(false)
    if (error) return toast({ title: 'Lỗi đổi tên', description: error.message, variant: 'destructive' })
    toast({ title: 'Đã đổi tên' })
    setRenameTarget(null)
    loadFolder(currentFolder)
  }

  const handleMove = async () => {
    const target = moveTargetFolder.trim()
    if (!target || target === currentFolder) return toast({ title: 'Chọn thư mục đích khác', variant: 'destructive' })
    const paths = Array.from(selected)
    if (!paths.length) return
    setBusy(true)
    let ok = 0, fail = 0
    for (const p of paths) {
      const name = p.split('/').pop()!
      const { error } = await supabase.storage.from(BUCKET).move(p, `${target}/${name}`)
      if (error) fail++; else ok++
    }
    setBusy(false)
    toast({ title: 'Di chuyển hoàn tất', description: `${ok} thành công · ${fail} thất bại`, variant: fail ? 'destructive' : 'default' })
    setMoveOpen(false); setMoveTargetFolder('')
    clearSelection()
    loadFolder(currentFolder)
  }


  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPath(key)
      toast({ title: 'Đã sao chép URL' })
      setTimeout(() => setCopiedPath(null), 1500)
    } catch { toast({ title: 'Không sao chép được', variant: 'destructive' }) }
  }

  const createFolder = async () => {
    const f = newFolder.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    if (!f) return
    // Supabase has no real "create folder"; upload a placeholder
    const placeholder = new Blob([''], { type: 'text/plain' })
    await supabase.storage.from(BUCKET).upload(`${f}/.keep`, placeholder, { upsert: true })
    setFolders(prev => Array.from(new Set([...prev, f])).sort())
    setCurrentFolder(f)
    setNewFolder(''); setCreatingFolder(false)
    toast({ title: `Đã tạo thư mục "${f}"` })
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(i => i.name.toLowerCase().includes(q))
  }, [items, search])

  return (
    <div className="min-h-screen bg-slate-50 font-montserrat">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-8 py-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
              <HardDrive className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Thư viện ảnh & Media</h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-0.5">
                Bucket: <span className="text-blue-600">{BUCKET}</span> · {stats.count} tệp · {formatBytes(stats.size)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Tìm theo tên tệp…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-11 pl-9 w-72 rounded-xl border-slate-200"
              />
            </div>
            <Button
              onClick={() => loadFolder(currentFolder)}
              variant="outline"
              className="h-11 rounded-xl border-slate-200"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
            <Button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-500/30"
            >
              {uploading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Upload size={16} className="mr-2" />}
              Tải lên
            </Button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={e => { handleUpload(e.target.files); e.target.value = '' }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR FOLDERS */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thư mục</span>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-600" onClick={() => setCreatingFolder(v => !v)}>
                <FolderPlus size={14} />
              </Button>
            </div>
            {creatingFolder && (
              <div className="flex gap-1 mb-3 px-1">
                <Input
                  autoFocus
                  placeholder="tên-thư-mục"
                  value={newFolder}
                  onChange={e => setNewFolder(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createFolder()}
                  className="h-9 text-xs rounded-lg"
                />
                <Button size="sm" className="h-9 rounded-lg" onClick={createFolder}><Check size={14} /></Button>
                <Button size="sm" variant="ghost" className="h-9 rounded-lg" onClick={() => setCreatingFolder(false)}><X size={14} /></Button>
              </div>
            )}
            <div className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto">
              {folders.map(f => (
                <button
                  key={f}
                  onClick={() => setCurrentFolder(f)}
                  className={[
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-bold',
                    currentFolder === f
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')}
                >
                  <Folder size={15} className={currentFolder === f ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'} />
                  <span className="flex-1 truncate">{f}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Code2 size={14} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Mẹo sử dụng</span>
            </div>
            <p className="text-[12px] leading-6 text-slate-300">
              Bấm <span className="font-black text-white">Sao chép URL</span> trên mỗi tệp để nhúng vào bài viết,
              dự án hay khoá học. Tệp công khai, có thể chia sẻ ngay.
            </p>
          </div>
        </aside>

        {/* GRID */}
        <main className="lg:col-span-9 space-y-4">
          {/* BULK TOOLBAR */}
          <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm">
            <Button
              size="sm" variant={selectMode ? 'default' : 'outline'}
              onClick={() => { setSelectMode(v => !v); clearSelection() }}
              className={`h-9 rounded-lg font-black uppercase text-[11px] tracking-wider ${selectMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {selectMode ? <CheckSquare size={14} className="mr-1.5" /> : <Square size={14} className="mr-1.5" />}
              {selectMode ? 'Đang chọn' : 'Chọn nhiều'}
            </Button>

            {selectMode && (
              <>
                <Button size="sm" variant="ghost" className="h-9 text-xs font-bold"
                  onClick={() => setSelected(new Set(filtered.map(i => i.path)))}>
                  Chọn tất cả ({filtered.length})
                </Button>
                <Button size="sm" variant="ghost" className="h-9 text-xs font-bold" onClick={clearSelection}>
                  Bỏ chọn
                </Button>
                <div className="h-6 w-px bg-slate-200 mx-1" />
                <Badge className="bg-blue-100 text-blue-700 border-none font-black text-[10px] uppercase">
                  {selected.size} đã chọn
                </Badge>
                <Button size="sm" disabled={!selected.size || busy}
                  onClick={() => { setMoveTargetFolder(''); setMoveOpen(true) }}
                  className="h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-wider">
                  <FolderInput size={14} className="mr-1.5" /> Di chuyển
                </Button>
                <Button size="sm" disabled={!selected.size || busy}
                  onClick={handleBulkDelete}
                  className="h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-wider">
                  {busy ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Trash2 size={14} className="mr-1.5" />}
                  Xoá hàng loạt
                </Button>
              </>
            )}
          </div>

          <div
            onDragOver={e => { e.preventDefault() }}
            onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files) }}
            className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 min-h-[60vh]"
          >
            {loading ? (
              <div className="flex items-center justify-center h-80 text-slate-400">
                <Loader2 className="animate-spin mr-2" /> Đang tải…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-center gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl"><ImageIcon size={42} className="text-slate-300" /></div>
                <div>
                  <p className="text-base font-black text-slate-700">Thư mục trống</p>
                  <p className="text-xs text-slate-400 mt-1">Kéo & thả ảnh vào đây hoặc bấm "Tải lên".</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(item => {
                  const isSel = selected.has(item.path)
                  return (
                  <div
                    key={item.path}
                    onClick={() => { if (selectMode) toggleSelected(item.path) }}
                    className={[
                      'group bg-white rounded-2xl border overflow-hidden transition-all',
                      isSel ? 'border-blue-600 ring-4 ring-blue-100 shadow-lg' : 'border-slate-200 hover:shadow-xl hover:border-blue-300',
                      selectMode ? 'cursor-pointer' : '',
                    ].join(' ')}
                  >
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      {isImage(item.mimetype, item.name) ? (
                        <img src={item.url} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : isVideo(item.mimetype, item.name) ? (
                        <video src={item.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32} /></div>
                      )}
                      {selectMode && (
                        <div className={`absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center shadow-lg ${isSel ? 'bg-blue-600 text-white' : 'bg-white/95 text-slate-400'}`}>
                          {isSel ? <Check size={14} /> : <Square size={12} />}
                        </div>
                      )}
                      {!selectMode && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); copy(item.url, item.path) }}
                              className="flex-1 h-9 rounded-lg bg-white/95 text-slate-900 font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5 hover:bg-blue-600 hover:text-white transition"
                              title="Sao chép URL"
                            >
                              {copiedPath === item.path ? <><Check size={12} /> Đã chép</> : <><Copy size={12} /> URL</>}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setRenameTarget(item); setRenameValue(item.name) }}
                              className="h-9 w-9 rounded-lg bg-white/95 text-slate-900 flex items-center justify-center hover:bg-amber-500 hover:text-white transition"
                              title="Đổi tên"
                            ><Pencil size={13} /></button>
                            <a
                              href={item.url} target="_blank" rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="h-9 w-9 rounded-lg bg-white/95 text-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                              title="Mở tab mới"
                            ><ExternalLink size={13} /></a>
                            <a
                              href={item.url} download={item.name}
                              onClick={(e) => e.stopPropagation()}
                              className="h-9 w-9 rounded-lg bg-white/95 text-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                              title="Tải xuống"
                            ><Download size={13} /></a>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(item) }}
                              className="h-9 w-9 rounded-lg bg-white/95 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition"
                              title="Xoá"
                            ><Trash2 size={13} /></button>
                          </div>
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2 bg-black/60 text-white border-none text-[9px] font-black uppercase backdrop-blur">
                        {isVideo(item.mimetype, item.name) ? 'VIDEO' : isImage(item.mimetype, item.name) ? 'IMG' : 'FILE'}
                      </Badge>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-[12px] font-bold text-slate-800 truncate" title={item.name}>{item.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span>{formatBytes(item.size)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); copy(item.url, item.path + ':sm') }}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Copy size={10} /> {copiedPath === item.path + ':sm' ? 'Đã chép' : 'Chia sẻ'}
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* RENAME DIALOG */}
      <Dialog open={!!renameTarget} onOpenChange={(v) => !v && setRenameTarget(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <Pencil size={16} className="text-amber-500" /> Đổi tên tệp
            </DialogTitle>
            <DialogDescription className="text-xs">Đường dẫn cũ: <code className="text-blue-600">{renameTarget?.path}</code></DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tên mới</Label>
            <Input value={renameValue} onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              className="h-11 rounded-xl font-mono text-sm" />
            <p className="text-[10px] text-slate-400">Khoảng trắng sẽ thành dấu gạch; chỉ giữ chữ/số/._-</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>Hủy</Button>
            <Button disabled={busy} onClick={handleRename} className="bg-amber-500 hover:bg-amber-600">
              {busy ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Check size={14} className="mr-1.5" />} Đổi tên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MOVE DIALOG */}
      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <FolderInput size={16} className="text-indigo-500" /> Di chuyển {selected.size} tệp
            </DialogTitle>
            <DialogDescription className="text-xs">Từ <code className="text-blue-600">{currentFolder}</code> → chọn thư mục đích.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thư mục đích</Label>
            <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto p-1">
              {folders.filter(f => f !== currentFolder).map(f => (
                <button key={f} onClick={() => setMoveTargetFolder(f)}
                  className={[
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[12px] font-bold border transition',
                    moveTargetFolder === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                  ].join(' ')}>
                  <Folder size={12} /> <span className="truncate">{f}</span>
                </button>
              ))}
            </div>
            <Input placeholder="…hoặc nhập thư mục mới" value={moveTargetFolder}
              onChange={e => setMoveTargetFolder(e.target.value.trim().toLowerCase().replace(/[^a-z0-9-_/]/g, '-'))}
              className="h-10 rounded-xl font-mono text-xs" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMoveOpen(false)}>Hủy</Button>
            <Button disabled={busy || !moveTargetFolder} onClick={handleMove} className="bg-indigo-600 hover:bg-indigo-700">
              {busy ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <FolderInput size={14} className="mr-1.5" />} Di chuyển
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
