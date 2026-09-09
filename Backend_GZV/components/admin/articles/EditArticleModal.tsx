"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
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
    if (!formData.title?.trim() || !formData.content?.trim()) {
      return toast({ title: "Thiếu thông tin", description: "Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết." })
    }
    setLoading(true)
    try {
      const authorIds = formData.author_ids?.length > 0
        ? formData.author_ids
        : (formData.author_id ? [formData.author_id] : (members.length > 0 ? [members[0].id] : []))

      const { data, error } = await supabase
        .from('articles')
        .update({
          title: formData.title.trim(),
          content: formData.content,
          excerpt: formData.excerpt || "",
          image: formData.image || "",
          author_ids: authorIds,
          author_id: authorIds[0] || null,
          category: formData.category || "Tin tức",
          status: 'published',
          updated_at: new Date().toISOString(),
          published_at: article.published_at || new Date().toISOString()
        })
        .eq('id', article.id).select()

      if (error) throw error
      onUpdateArticle(data?.[0] || formData)
      toast({ title: "Đã xuất bản bài viết thành công!" })
      onClose()
    } catch (err: any) { 
      toast({ title: "Lỗi xuất bản", description: err.message || "Không thể lưu bài viết.", variant: "destructive" }) 
    }
    finally { setLoading(false) }
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[96vh] overflow-y-auto p-0 bg-white border border-slate-200 shadow-2xl rounded-none">
        <DialogTitle className="sr-only">Chỉnh sửa bài viết</DialogTitle>
        <DialogDescription className="sr-only">Biểu mẫu chỉnh sửa và xuất bản bài viết</DialogDescription>
        {/* TOP BAR NHƯ MỘT EDITOR CHUYÊN NGHIỆP */}
        <div className="bg-slate-900 p-5 text-white flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#ed1c24] rounded-none shadow-xs"><Edit3 size={20} /></div>
            <div>
              <h2 className="font-black text-base leading-none uppercase tracking-wider">GZV Publisher Pro</h2>
              <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1"><Globe size={10}/> ĐANG CHỈNH SỬA CÔNG KHAI</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-slate-400 hover:text-white font-bold rounded-none text-xs uppercase" onClick={onClose}>Hủy bỏ</Button>
            <Button disabled={loading} className="bg-[#ed1c24] hover:bg-[#c91218] text-white font-black px-8 rounded-none h-10 text-xs uppercase shadow-xs" onClick={handleSave}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />} XÁC NHẬN XUẤT BẢN
            </Button>
          </div>
        </div>

        <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* EDITOR SECTION */}
          <div className="lg:col-span-3 space-y-8">
            <Input className="text-3xl md:text-4xl font-black py-8 border-none bg-transparent focus-visible:ring-0 placeholder:text-slate-200 text-slate-900" placeholder="Tiêu đề bài viết..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            
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
            <div className="bg-slate-50 p-6 rounded-none border border-slate-200 space-y-6 sticky top-28">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Ảnh đại diện bài viết</Label>
                <div className="relative aspect-[4/3] bg-white rounded-none flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group shadow-xs">
                  {formData.image ? (
                    <>
                      <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" alt="Thumb" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><label className="bg-white text-[#ed1c24] px-4 py-1.5 rounded-none text-[10px] font-black cursor-pointer shadow-md uppercase">ĐỔI ẢNH<input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'thumbnails')} /></label></div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">{uploading === 'thumbnails' ? <Loader2 className="animate-spin text-[#ed1c24]" /> : <Upload size={28} className="text-slate-400" />}<span className="text-[10px] font-black text-slate-400 tracking-wider">TẢI LÊN THUMBNAIL</span><input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'thumbnails')} /></label>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nhóm tác giả (Đa người viết)</Label>
                <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
                  {members.map(m => (
                    <div key={m.id} onClick={() => { const current = formData.author_ids || []; const next = current.includes(m.id) ? current.filter((id:any) => id !== m.id) : [...current, m.id]; setFormData({...formData, author_ids: next})}} className={`flex items-center gap-3 p-2.5 rounded-none border cursor-pointer transition-all ${formData.author_ids?.includes(m.id) ? 'border-[#ed1c24] bg-[#ed1c24] text-white shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-100'}`}>
                      <Avatar className="h-7 w-7 rounded-none border border-white/20"><AvatarImage src={m.avatar_url} className="object-cover" /><AvatarFallback className="rounded-none text-[9px]">{m.full_name?.charAt(0)}</AvatarFallback></Avatar>
                      <span className="text-xs font-bold leading-none">{m.full_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Mô tả ngắn thu hút</Label>
                <Textarea className="bg-white border-slate-200 rounded-none text-xs font-medium leading-relaxed h-24 resize-none shadow-xs" placeholder="Hiển thị ngoài trang chủ..." value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Danh mục</Label>
                <Input className="bg-white border-slate-200 h-10 rounded-none font-semibold text-xs shadow-xs" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}
