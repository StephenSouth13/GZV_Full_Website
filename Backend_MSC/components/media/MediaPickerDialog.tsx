"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Folder, Search, Upload, Loader2, Image as ImageIcon, Check } from 'lucide-react'

const BUCKET = 'media'
const DEFAULT_FOLDERS = [
  'articles', 'projects', 'project-thumbnails', 'project-videos',
  'courses', 'mentors', 'authors', 'mscers', 'training', 'uploads',
]

type Item = { name: string; path: string; url: string; size: number; mimetype: string }

export type MediaPickResult = { url: string; alt: string; width: string }

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (result: MediaPickResult) => void
  defaultFolder?: string
}

const SIZES: Array<{ label: string; value: string }> = [
  { label: 'Nhỏ (25%)', value: '25%' },
  { label: 'Vừa (50%)', value: '50%' },
  { label: 'Lớn (75%)', value: '75%' },
  { label: 'Toàn bộ (100%)', value: '100%' },
]

export function MediaPickerDialog({ open, onClose, onSelect, defaultFolder = 'articles' }: Props) {
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS)
  const [folder, setFolder] = useState<string>(defaultFolder)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Item | null>(null)
  const [width, setWidth] = useState<string>('100%')
  const fileRef = useRef<HTMLInputElement>(null)

  const loadFolders = useCallback(async () => {
    const { data } = await supabase.storage.from(BUCKET).list('', { limit: 200 })
    const dirs = (data || []).filter(o => !o.metadata).map(o => o.name)
    setFolders(Array.from(new Set([...DEFAULT_FOLDERS, ...dirs])).sort())
  }, [])

  const loadFolder = useCallback(async (f: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(f, {
        limit: 500, sortBy: { column: 'created_at', order: 'desc' },
      })
      if (error) throw error
      const files = (data || []).filter(o => o.metadata && /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(o.name))
      setItems(files.map(file => {
        const path = `${f}/${file.name}`
        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
        return {
          name: file.name, path, url: publicUrl,
          size: (file.metadata as any)?.size ?? 0,
          mimetype: (file.metadata as any)?.mimetype ?? '',
        }
      }))
    } catch (err: any) {
      toast({ title: 'Lỗi tải thư mục', description: err.message, variant: 'destructive' })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (open) { loadFolders(); loadFolder(folder); setSelected(null) } }, [open, folder, loadFolders, loadFolder])

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const safe = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
      await supabase.storage.from(BUCKET).upload(`${folder}/${Date.now()}_${safe}`, file, {
        cacheControl: '3600', upsert: false, contentType: file.type,
      })
    }
    setUploading(false)
    toast({ title: 'Đã tải lên' })
    loadFolder(folder)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? items.filter(i => i.name.toLowerCase().includes(q)) : items
  }, [items, search])

  const confirm = () => {
    if (!selected) return
    onSelect({ url: selected.url, alt: selected.name, width })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1100px] w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-3xl border-none">
        <DialogHeader className="px-7 py-5 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-3xl">
          <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <ImageIcon size={18} /> Chèn ảnh từ thư viện
          </DialogTitle>
          <DialogDescription className="text-blue-100 text-[11px] font-bold uppercase tracking-widest">
            Chọn ảnh → chọn kích thước → bấm Chèn
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 max-h-[70vh]">
          {/* Sidebar folders */}
          <aside className="col-span-3 border-r bg-slate-50/50 p-3 overflow-y-auto">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-2">Thư mục</div>
            <div className="flex flex-col gap-0.5">
              {folders.map(f => (
                <button key={f} onClick={() => setFolder(f)}
                  className={[
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[12px] font-bold transition',
                    folder === f ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')}>
                  <Folder size={13} /> <span className="truncate">{f}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <main className="col-span-9 flex flex-col">
            <div className="flex items-center gap-2 px-5 py-3 border-b bg-white">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm ảnh trong thư mục…" className="h-9 pl-9 text-sm rounded-lg" />
              </div>
              <Button variant="outline" size="sm" className="h-9 rounded-lg" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin mr-1" size={14} /> : <Upload size={14} className="mr-1" />} Tải mới
              </Button>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                onChange={e => { handleUpload(e.target.files); e.target.value = '' }} />
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30">
              {loading ? (
                <div className="flex items-center justify-center h-60 text-slate-400">
                  <Loader2 className="animate-spin mr-2" /> Đang tải…
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-slate-400 gap-2">
                  <ImageIcon size={32} /> <span className="text-xs font-bold">Thư mục trống</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {filtered.map(item => {
                    const isSel = selected?.path === item.path
                    return (
                      <button key={item.path} onClick={() => setSelected(item)}
                        className={[
                          'relative group rounded-xl overflow-hidden border-2 transition-all bg-white',
                          isSel ? 'border-blue-600 ring-4 ring-blue-100 shadow-lg scale-[1.02]' : 'border-transparent hover:border-blue-200',
                        ].join(' ')}>
                        <div className="aspect-square bg-slate-100">
                          <img src={item.url} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                        </div>
                        {isSel && (
                          <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                            <Check size={14} />
                          </div>
                        )}
                        <div className="p-2 text-[10px] font-bold text-slate-600 truncate text-left">{item.name}</div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer with size + confirm */}
            <div className="border-t bg-white px-5 py-4 flex items-center gap-4 flex-wrap">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kích thước</Label>
              <div className="flex gap-1">
                {SIZES.map(s => (
                  <button key={s.value} onClick={() => setWidth(s.value)}
                    className={[
                      'px-3 h-8 rounded-lg text-[11px] font-black uppercase tracking-wider transition border',
                      width === s.value ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                    ].join(' ')}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" onClick={onClose} className="h-10 font-bold text-slate-500">Hủy</Button>
                <Button disabled={!selected} onClick={confirm}
                  className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-wider shadow-lg">
                  <Check size={14} className="mr-1.5" /> Chèn ảnh
                </Button>
              </div>
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MediaPickerDialog
