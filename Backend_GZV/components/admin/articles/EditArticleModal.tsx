"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, Edit3, Upload, CheckCircle2, Globe } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { GZVRichEditor } from '@/components/editor/GZVRichEditor'

export function EditArticleModal({ open, onClose, article, onUpdateArticle }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [formData, setFormData] = useState<any>(null)

  useEffect(() => {
    if (article && open) {
      setFormData({
        ...article,
        author_ids: article.author_ids || (article.author_id ? [article.author_id] : [])
      })
      supabase.from('authors').select('id, full_name, avatar_url, title').order('full_name', { ascending: true }).then(({ data }) => data && setMembers(data))
    }
  }, [article, open])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'thumbnails') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(target)
    try {
      const path = `blog/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
      setFormData((p: any) => ({ ...p, image: publicUrl }))
      toast({ title: "Tải lên ảnh bìa thành công!" })
    } catch (err: any) { toast({ title: "Lỗi tải lên", variant: "destructive" }) }
    finally { setUploading(null) }
  }

  const handleSave = async () => {
    if (!formData.title) return toast({ title: "Thiếu tiêu đề bài viết" })
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          image: formData.image,
          author_ids: formData.author_ids,
          category: formData.category,
          status: 'published', // Ép về published khi nhấn Save
          updated_at: new Date().toISOString(),
          published_at: article.published_at || new Date().toISOString()
        })
        .eq('id', article.id).select()

      if (error) throw error
      onUpdateArticle(data?.[0] || formData)
      toast({ title: "Đã xuất bản bài viết thành công!" })
      onClose()
    } catch (err: any) { toast({ title: "Lỗi", description: err.message, variant: "destructive" }) }
    finally { setLoading(false) }
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[96vh] overflow-y-auto p-0 bg-white border-none shadow-2xl rounded-[2rem]">
        {/* TOP BAR NHƯ MỘT EDITOR CHUYÊN NGHIỆP */}
        <div className="bg-slate-900 p-5 text-white flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20"><Edit3 size={22} /></div>
            <div>
              <h2 className="font-black text-lg leading-none uppercase tracking-tighter">gzv Publisher Pro</h2>
              <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1"><Globe size={10}/> ĐANG CHỈNH SỬA CÔNG KHAI</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-slate-400 hover:text-white font-bold" onClick={onClose}>Hủy bỏ</Button>
            <Button disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 rounded-full h-12 shadow-xl shadow-blue-500/30" onClick={handleSave}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />} XÁC NHẬN XUẤT BẢN
            </Button>
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* EDITOR SECTION */}
          <div className="lg:col-span-3 space-y-8">
            <Input className="text-5xl font-black py-16 border-none bg-transparent focus-visible:ring-0 placeholder:text-slate-100" placeholder="Tiêu đề bài viết..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            
            <div className="space-y-4">
              <GZVRichEditor
                value={formData.content || ''}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="Chỉnh sửa nội dung bài viết… (định dạng giống Google Docs)"
                uploadFolder="blog"
                minHeight={640}
              />
            </div>
          </div>

          {/* SETTINGS SECTION */}
          <aside className="space-y-8">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-8 sticky top-32">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ảnh đại diện bài viết</Label>
                <div className="relative aspect-[4/3] bg-white rounded-[2rem] flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group shadow-sm">
                  {formData.image ? (
                    <>
                      <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="Thumb" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><label className="bg-white text-blue-600 px-6 py-2 rounded-full text-[10px] font-black cursor-pointer shadow-2xl hover:scale-110 transition-all">ĐỔI ẢNH<input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'thumbnails')} /></label></div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3">{uploading === 'thumbnails' ? <Loader2 className="animate-spin text-blue-600" /> : <Upload size={32} className="text-slate-300" />}<span className="text-[10px] font-black text-slate-400 tracking-tighter">TẢI LÊN THUMBNAIL</span><input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'thumbnails')} /></label>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nhóm tác giả (Đa người viết)</Label>
                <div className="grid gap-2 max-h-60 overflow-y-auto pr-2">
                  {members.map(m => (
                    <div key={m.id} onClick={() => { const current = formData.author_ids || []; const next = current.includes(m.id) ? current.filter((id:any) => id !== m.id) : [...current, m.id]; setFormData({...formData, author_ids: next})}} className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${formData.author_ids?.includes(m.id) ? 'border-blue-600 bg-blue-50/50 shadow-md scale-[1.02]' : 'border-transparent bg-white hover:bg-slate-100'}`}>
                      <Avatar className="h-8 w-8 shadow-sm"><AvatarImage src={m.avatar_url} className="object-cover" /><AvatarFallback>{m.full_name?.charAt(0)}</AvatarFallback></Avatar>
                      <span className="text-xs font-black text-slate-700 leading-none">{m.full_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mô tả ngắn thu hút</Label>
                <Textarea className="bg-white border-slate-200 rounded-2xl text-xs font-medium leading-relaxed h-24 shadow-sm" placeholder="Hiển thị ngoài trang chủ..." value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} />
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Danh mục</Label>
                <Input className="bg-white border-slate-200 h-12 rounded-2xl font-bold shadow-sm" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}
