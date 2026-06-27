"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, Save, FolderPlus, Upload, X, 
  Lock, Unlock, Search, Edit, Tag, Type, Video, Film, Globe
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { GZVRichEditor } from '@/components/editor/GZVRichEditor'

export function CreateProjectModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [authors, setAuthors] = useState<any[]>([]) 
  const [isSlugLocked, setIsSlugLocked] = useState(true)
  
  const [formData, setFormData] = useState({
    title: '', 
    slug: '', 
    category: '', // Chính là Tag name / Lĩnh vực hiển thị trong bảng
    description: '', 
    detailproject: '', 
    image: '', 
    video_url: '', 
    status: 'ongoing', 
    author_ids: [] as string[], 
    featured: false,
    seo_title: '', 
    seo_keywords: ''
  })



  useEffect(() => {
    const fetchAuthors = async () => {
      if (!isOpen) return;
      try {
        const { data, error } = await supabase.from('authors').select('id, full_name, avatar_url, title').order('full_name', { ascending: true });
        if (error) throw error;
        setAuthors(data || []);
      } catch (err: any) { console.error("Load Authors Error:", err.message); }
    };
    fetchAuthors();
  }, [isOpen])

  // 3. LOGIC GENERATE SLUG TỰ ĐỘNG
  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/([^0-9a-z-\s])/g, "").replace(/(\s+)/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: isSlugLocked ? generateSlug(newTitle) : prev.slug,
      seo_title: isSlugLocked ? newTitle : prev.seo_title
    }));
  }

  // 4. UPLOAD MEDIA CENTER
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const folder = type === 'image' ? 'project-thumbnails' : 'project-videos'
      const { error: uploadError } = await supabase.storage.from('media').upload(`${folder}/${fileName}`, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('media').getPublicUrl(`${folder}/${fileName}`)
      setFormData(prev => ({ ...prev, [type === 'image' ? 'image' : 'video_url']: data.publicUrl }))
      toast({ title: `Tải lên thành công!` })
    } catch (error: any) { toast({ title: "Lỗi tải tệp", description: error.message, variant: "destructive" }) }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!formData.title || !formData.slug) return toast({ title: "Vui lòng nhập tiêu đề và slug", variant: "destructive" });
    setLoading(true);
    try {
      const { data, error } = await supabase.from('projects').insert([formData]).select();
      if (error) throw error;
      onSuccess(data[0]);
      onClose();
      setFormData(prev => ({ ...prev, detailproject: '' }));
      toast({ title: "Dự án đã được khởi tạo thành công!" });
    } catch (error: any) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] w-[95vw] max-h-[95vh] overflow-y-auto bg-white rounded-[2.5rem] p-0 font-montserrat shadow-2xl border-none">
        <DialogHeader className="p-8 bg-slate-900 text-white rounded-t-[2.5rem]">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg text-white"><FolderPlus size={28} /></div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Cấu hình dự án <span className="text-blue-400">Portfolio</span></DialogTitle>
              <DialogDescription className="text-slate-400 font-medium text-[11px] uppercase tracking-[0.2em] mt-1">gzv Center CMS Professional v3.0</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* CỘT TRÁI: SOẠN THẢO & SEO */}
          <div className="md:col-span-8 p-10 space-y-10 border-r border-slate-100">
            {/* THÔNG TIN CHÍNH */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><Edit size={12}/> Tiêu đề dự án (H1)</Label>
                <Input className="h-14 text-lg font-bold rounded-2xl border-slate-200" value={formData.title} onChange={handleTitleChange} />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2"><Tag size={12}/> Tag Name (Lĩnh vực dự án)</Label>
                <Input className="h-14 font-bold rounded-2xl border-slate-200" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="VD: ĐÀO TẠO DOANH NGHIỆP" />
              </div>
            </div>

            {/* SLUG & SEO TITLE (Tiêu đề nhỏ) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Search size={12}/> URL SEO (Slug)</Label>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold" onClick={() => setIsSlugLocked(!isSlugLocked)}>
                    {isSlugLocked ? <Lock size={12}/> : <Unlock size={12} className="text-amber-500"/>}
                  </Button>
                </div>
                <Input className={`h-12 font-mono text-xs font-bold rounded-xl ${isSlugLocked ? 'bg-slate-50' : 'bg-amber-50 border-amber-200'}`} value={formData.slug} readOnly={isSlugLocked} onChange={(e) => setFormData({...formData, slug: generateSlug(e.target.value)})} />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Globe size={12}/> SEO Title (Tiêu đề Google)</Label>
                <Input className="h-12 text-xs font-bold rounded-xl bg-slate-50/50" value={formData.seo_title} onChange={(e) => setFormData({...formData, seo_title: e.target.value})} placeholder="Tiêu đề hiển thị trên thanh trình duyệt..." />
              </div>
            </div>

            {/* RICH TEXT EDITOR - GOOGLE DOCS STYLE */}
            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Type size={12}/> Nội dung chi tiết (Soạn thảo chuyên sâu)</Label>
              <GZVRichEditor
                value={formData.detailproject}
                onChange={(html) => setFormData(prev => ({ ...prev, detailproject: html }))}
                uploadFolder="projects"
                minHeight={520}
                placeholder="Viết nội dung dự án… Chèn ảnh, video YouTube, tiêu đề, danh sách…"
              />
            </div>
          </div>

          {/* CỘT PHẢI: MEDIA & TEAM */}
          <div className="md:col-span-4 bg-slate-50/50 p-10 space-y-10">
            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Thumbnail Dự án</Label>
              <div className="relative aspect-video border-2 border-dashed border-slate-300 rounded-[2rem] bg-white flex flex-col items-center justify-center overflow-hidden hover:border-blue-500 transition-all shadow-sm">
                {formData.image ? (
                  <div className="relative w-full h-full group">
                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="icon" className="rounded-full shadow-xl" onClick={() => setFormData({...formData, image: ''})}><X size={18} /></Button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center p-8 text-center gap-3">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full shadow-sm">{uploading ? <Loader2 className="animate-spin" /> : <Upload size={24} />}</div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Tải ảnh bìa</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'image')} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-2"><Film size={12}/> Video Giới thiệu</Label>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <Input placeholder="Dán link Youtube..." className="text-xs h-10 rounded-xl bg-slate-50" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} />
                <div className="relative border-2 border-dashed border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50">
                  <Video size={18} className="text-slate-300" />
                  <span className="text-[9px] font-bold text-slate-400">Hoặc tải file MP4</span>
                  <input type="file" className="hidden" accept="video/*" onChange={(e) => handleMediaUpload(e, 'video')} />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black uppercase text-slate-500">Mentoring & Coaching</Label>
                <Badge className="bg-blue-600 font-black text-[9px] uppercase shadow-md">{formData.author_ids.length} Chọn</Badge>
              </div>
              <div className="grid gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar bg-white p-3 rounded-[1.5rem] border border-slate-200">
                {authors.map(a => {
                  const isSelected = formData.author_ids.includes(a.id);
                  return (
                    <div 
                      key={a.id} 
                      onClick={() => setFormData({...formData, author_ids: isSelected ? formData.author_ids.filter(id => id !== a.id) : [...formData.author_ids, a.id]})}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-transparent bg-slate-50/30'}`}
                    >
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
                        <AvatarImage src={a.avatar_url} className="object-cover" />
                        <AvatarFallback className="font-black text-[10px] bg-slate-200 uppercase">{a.full_name?.substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-black uppercase truncate ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>{a.full_name}</span>
                        <span className="text-[9px] text-slate-400 font-bold italic truncate">{a.title || 'Mentor'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-[2.5rem]">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="font-black uppercase text-[10px] text-slate-400">Huỷ bỏ</Button>
          <Button disabled={loading || uploading} className="h-14 px-12 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all" onClick={handleSave}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Xuất bản ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
