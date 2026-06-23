"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  X, Plus, Loader2, Send,
  Wand2, Globe,
  Sparkles, Layout, UserCheck, Type
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { gzvRichEditor } from '@/components/editor/gzvRichEditor'

export function CreateArticleModal({ open, onClose, onCreateArticle }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [members, setMembers] = useState<any[]>([])
  
  const [formData, setFormData] = useState({ 
    title: '', 
    slug: '', 
    excerpt: '', 
    content: '', 
    category: '', 
    image: '', 
    author_ids: [] as string[], // Nâng cấp: Mảng đa tác giả
    featured: false,
    status: 'published'
  })

  useEffect(() => {
    if (open) {
      supabase.from('mentors').select('id, full_name, avatar_url, role')
        .then(({ data }) => data && setMembers(data))
    }
  }, [open])

  const generateSlug = (text: string) => {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData(prev => ({ ...prev, title: val, slug: generateSlug(val) }))
  }

  const handleUpload = async (e: any, target: 'thumb') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(target)

    try {
      const path = `articles/${Date.now()}_${file.name}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
      setFormData(prev => ({ ...prev, image: publicUrl }))
      toast({ title: "Đã tải lên ảnh bìa!" })
    } catch (err) {
      toast({ title: "Lỗi tải lên", variant: "destructive" })
    } finally {
      setUploading(null)
    }
  }

const handleSubmit = async () => {
  // Kiểm tra mảng author_ids (phải có ít nhất 1 người)
  if (!formData.title || formData.author_ids.length === 0 || !formData.content) {
    return toast({ 
      title: "Thiếu thông tin", 
      description: "Vui lòng nhập tiêu đề, nội dung và chọn ít nhất 1 tác giả.", 
      variant: "destructive" 
    });
  }

  setLoading(true);
  try {
    const payload = {
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      excerpt: formData.excerpt,
      image: formData.image, // Đây là link ảnh đã up thành công trong hình bạn gửi
      category: formData.category,
      author_ids: formData.author_ids, // Gửi mảng ID tác giả
      status: 'published',
      featured: formData.featured,
      published_at: new Date().toISOString() // Dùng đúng tên cột trong DB
    };

    const { data, error } = await supabase
      .from('articles')
      .insert([payload])
      .select();

    if (error) throw error;

    toast({ title: "Thành công!", description: "Bài viết đã được xuất bản." });
    onCreateArticle(data[0]);
    onClose();
  } catch (err: any) {
    console.error("Lỗi xuất bản:", err);
    toast({ 
      title: "Lỗi xuất bản", 
      description: err.message || "Vui lòng kiểm tra lại các cột dữ liệu.", 
      variant: "destructive" 
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[95vh] p-0 border-none shadow-2xl overflow-hidden bg-slate-50">
        
        {/* TOP NAVIGATION BAR */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wand2 className="text-white h-5 w-5 animate-pulse" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight uppercase text-sm">gzv Content Studio</span>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-200">v3.0 PRO</Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-500 font-medium rounded-full" onClick={onClose}>Hủy bỏ</Button>
            <Button 
              disabled={loading} 
              className="bg-slate-900 hover:bg-black text-white font-bold px-8 rounded-full shadow-lg shadow-slate-200"
              onClick={handleSubmit}
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
              Xuất bản ngay
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-64px)] overflow-hidden">
          
          {/* MAIN EDITOR AREA */}
          <div className="flex-1 overflow-y-auto bg-white p-8 lg:p-12 space-y-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Title input */}
              <div className="space-y-4">
                <input 
                  className="text-5xl lg:text-6xl font-black w-full border-none focus:ring-0 placeholder:text-slate-200 text-slate-900 leading-tight" 
                  placeholder="Tiêu đề bài viết..."
                  value={formData.title}
                  onChange={handleTitleChange}
                />
                <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                  <Globe className="h-3 w-3" />
                  <span>gzventer.edu.vn/chia-se/</span>
                  <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{formData.slug || 'your-slug-here'}</span>
                </div>
              </div>

              {/* Google Docs–style Rich Editor */}
              <gzvRichEditor
                value={formData.content}
                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                placeholder="Bắt đầu câu chuyện của bạn… (định dạng giống Google Docs)"
                uploadFolder="articles"
              />

              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Mẹo: Bôi đen văn bản để định dạng nhanh • Nhấn Enter để xuống dòng • Dùng nút ảnh/YouTube trên thanh công cụ.
              </div>
            </div>
          </div>


          {/* RIGHT SIDEBAR: SETTINGS */}
          <aside className="w-[380px] border-l bg-slate-50/50 p-8 overflow-y-auto hidden lg:block space-y-8">
            
            {/* THUMBNAIL SECTION */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Layout className="h-3 w-3" /> Ảnh bìa (16:9)
              </Label>
              <div className="relative aspect-video rounded-[2rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group hover:border-blue-400 transition-all cursor-pointer shadow-sm">
                {formData.image ? (
                  <>
                    <img src={formData.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Button variant="destructive" size="icon" className="rounded-full" onClick={() => setFormData(prev => ({...prev, image: ''}))}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    {uploading === 'thumb' ? <Loader2 className="animate-spin text-blue-500" /> : <Plus className="text-slate-400" />}
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tải ảnh bìa</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'thumb')} />
                  </label>
                )}
              </div>
            </div>

            {/* AUTHORS SECTION (MULTI-SELECT) */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <UserCheck className="h-3 w-3" /> Đội ngũ thực hiện
              </Label>
              <div className="grid gap-2">
                {members.map(m => (
                  <div 
                    key={m.id}
                    onClick={() => {
                      const current = formData.author_ids;
                      const next = current.includes(m.id) ? current.filter(id => id !== m.id) : [...current, m.id];
                      setFormData(prev => ({...prev, author_ids: next}))
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      formData.author_ids.includes(m.id) 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    <Avatar className="h-8 w-8 border-2 border-white/20">
                      <AvatarImage src={m.avatar_url} />
                      <AvatarFallback>{m.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-black leading-none">{m.full_name}</span>
                      <span className={`text-[9px] uppercase font-bold ${formData.author_ids.includes(m.id) ? 'text-blue-100' : 'text-slate-400'}`}>
                        {m.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY SECTION */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Type className="h-3 w-3" /> Mô tả ngắn (SEO)
              </Label>
              <Textarea 
                placeholder="Tóm tắt bài viết của bạn trong khoảng 160 ký tự..." 
                className="bg-white rounded-2xl border-slate-100 h-32 text-xs font-medium leading-relaxed" 
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({...prev, excerpt: e.target.value}))}
              />
            </div>

            {/* CATEGORY & OPTIONS */}
            <div className="space-y-6 pt-4 border-t">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Danh mục & Lĩnh vực</Label>
                <Input 
                  placeholder="VD: Coaching, Marketing..." 
                  className="bg-white h-12 rounded-xl border-slate-100" 
                  value={formData.category} 
                  onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-black text-blue-900 uppercase">Bài viết nổi bật</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({...prev, featured: e.target.checked}))}
                  className="h-5 w-5 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>

          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}