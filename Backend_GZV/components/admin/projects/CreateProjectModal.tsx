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
  Lock, Unlock, Search, Edit, Tag, Type, Video, Film, Globe, FolderOpen
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { GZVRichEditor } from '@/components/editor/GZVRichEditor'
import { MediaPickerDialog } from '@/components/media/MediaPickerDialog'
import { ImageCropField } from '@/components/media/ImageCropField'

export function CreateProjectModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [authors, setAuthors] = useState<any[]>([])
  const [isSlugLocked, setIsSlugLocked] = useState(true)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '', // Chính là Tag name / Lĩnh vực hiển thị trong bảng
    description: '',
    detailproject: '',
    image: '',
    thumbnail_url: '',
    image_position_x: 50,
    image_position_y: 50,
    image_scale: 100,
    video_url: '',
    tech_stack: [] as string[],
    status: 'ongoing',
    author_ids: [] as string[],
    authors_section_title: 'MENTORING & COACHING',
    featured: false,
    hashtags: '',
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
      setFormData(prev => type === 'image'
        ? { ...prev, image: data.publicUrl, thumbnail_url: data.publicUrl }
        : { ...prev, video_url: data.publicUrl }
      )
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
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[96vh] overflow-y-auto p-0 bg-white border border-slate-200 shadow-2xl rounded-none">

        {/* HEADER MODAL */}
        <DialogHeader className="p-8 bg-slate-900 text-white flex flex-row items-center justify-between sticky top-0 z-50 rounded-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#ed1c24] text-white rounded-none shadow-xs">
              <FolderPlus size={24} />
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Mô tả ngắn</Label>
              <Textarea
                className="min-h-28 resize-none rounded-none border-slate-200 text-sm leading-relaxed"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tóm tắt bài toán, giải pháp và giá trị nổi bật của dự án..."
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Hashtags</Label>
                <Input className="h-11 rounded-none border-slate-200 text-xs" value={formData.hashtags} onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })} placeholder="chuyển đổi số, đào tạo, AI" />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Công nghệ & nền tảng</Label>
                <Input
                  className="h-11 rounded-none border-slate-200 text-xs"
                  value={formData.tech_stack.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value.split(',').map(item => item.trim()).filter(Boolean) })}
                  placeholder="Next.js, Supabase, AI"
                />
              </div>
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-wider text-white">Khởi tạo Dự án & Portfolio mới</DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-bold mt-1">Đầy đủ tính năng Media, Đội ngũ thực thi & Tối ưu SEO chuẩn quốc tế</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* CỘT TRÁI: FORM NỘI DUNG CHÍNH */}
          <div className="md:col-span-8 p-8 md:p-10 space-y-8 bg-white border-r border-slate-200">

            {/* TIÊU ĐỀ & TAG NAME */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Edit size={12} /> Tên dự án *</Label>
                <Input className="h-12 font-black text-sm rounded-none border-slate-200 focus-visible:ring-1 focus-visible:ring-[#ed1c24]" placeholder="Nhập tên dự án thực tế..." value={formData.title} onChange={handleTitleChange} />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-[#ed1c24] tracking-widest flex items-center gap-2"><Tag size={12} /> Tag Name (Lĩnh vực)</Label>
                <Input className="h-12 font-bold text-xs rounded-none border-slate-200" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="VD: ĐÀO TẠO DOANH NGHIỆP" />
              </div>
            </div>

            {/* SLUG & SEO TITLE (Tiêu đề nhỏ) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Search size={12} /> URL SEO (Slug)</Label>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold rounded-none" onClick={() => setIsSlugLocked(!isSlugLocked)}>
                    {isSlugLocked ? <Lock size={12} /> : <Unlock size={12} className="text-amber-500" />}
                  </Button>
                </div>
                <Input className={`h-11 font-mono text-xs font-bold rounded-none ${isSlugLocked ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200'}`} value={formData.slug} readOnly={isSlugLocked} onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })} />
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Globe size={12} /> SEO Title (Tiêu đề Google)</Label>
                <Input className="h-11 text-xs font-bold rounded-none bg-slate-50 border-slate-200" value={formData.seo_title} onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })} placeholder="Tiêu đề hiển thị trên thanh trình duyệt..." />
              </div>
            </div>

            {/* RICH TEXT EDITOR - GOOGLE DOCS STYLE */}
            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Type size={12} /> Nội dung chi tiết (Soạn thảo chuyên sâu)</Label>
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
          <div className="md:col-span-4 bg-slate-50/50 p-8 space-y-8">
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Thumbnail Dự án</Label>
              <div className="relative aspect-video border-2 border-dashed border-slate-300 rounded-none bg-white flex flex-col items-center justify-center overflow-hidden hover:border-[#ed1c24] transition-colors shadow-xs">
                {formData.image ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={formData.image}
                      className="w-full h-full object-cover"
                      alt="Preview"
                      style={{
                        objectPosition: `${formData.image_position_x}% ${formData.image_position_y}%`,
                        transform: `scale(${formData.image_scale / 100})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="icon" className="rounded-none h-8 w-8 shadow-md" onClick={() => setFormData({ ...formData, image: '', thumbnail_url: '' })}><X size={16} /></Button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center p-6 text-center gap-2">
                    <div className="p-3 bg-red-50 text-[#ed1c24] rounded-none shadow-xs">{uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}</div>
                    <span className="text-[10px] font-black uppercase text-slate-400">Tải ảnh bìa</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'image')} />
                  </label>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" className="h-9 rounded-none text-[10px] font-black uppercase" onClick={() => setMediaPickerOpen(true)}>
                  <FolderOpen className="mr-1.5 h-3.5 w-3.5" /> Thư viện
                </Button>
                <label className="flex h-9 cursor-pointer items-center justify-center border border-slate-200 bg-white text-[10px] font-black uppercase">
                  <Upload className="mr-1.5 h-3.5 w-3.5" /> Tải ảnh
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'image')} />
                </label>
              </div>
              {formData.image && (
                <ImageCropField
                  imageUrl={formData.image}
                  positionX={formData.image_position_x}
                  positionY={formData.image_position_y}
                  scale={formData.image_scale}
                  minScale={100}
                  aspect="16/10"
                  label="Căn chỉnh ảnh dự án"
                  onChange={(patch) => setFormData(prev => ({
                    ...prev,
                    image_position_x: patch.position_x ?? prev.image_position_x,
                    image_position_y: patch.position_y ?? prev.image_position_y,
                    image_scale: patch.scale ?? prev.image_scale,
                  }))}
                />
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-2"><Film size={12} /> Video Giới thiệu</Label>
              <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs space-y-3">
                <Input placeholder="Dán link Youtube..." className="text-xs h-10 rounded-none bg-slate-50 border-slate-200" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} />
                <div className="relative border-2 border-dashed border-slate-200 rounded-none p-3 flex flex-col items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                  <Video size={16} className="text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400">Hoặc tải file MP4</span>
                  <input type="file" className="hidden" accept="video/*" onChange={(e) => handleMediaUpload(e, 'video')} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Trạng thái</Label>
                <select
                  className="h-10 w-full rounded-none border border-slate-200 bg-white px-3 text-xs font-bold"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="planning">Lên kế hoạch</option>
                  <option value="ongoing">Đang thực hiện</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
              </div>
              <label className="mt-6 flex h-10 cursor-pointer items-center justify-between border border-slate-200 bg-white px-3">
                <span className="text-[10px] font-black uppercase text-slate-600">Nổi bật</span>
                <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="h-4 w-4 accent-[#ed1c24]" />
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-black uppercase text-slate-500">MENTORING & COACHING / Tên khu vực</Label>
                <Badge className="bg-[#ed1c24] font-black text-[9px] uppercase shadow-none rounded-none">{formData.author_ids.length} Chọn</Badge>
              </div>
              <Input
                value={formData.authors_section_title}
                onChange={(e) => setFormData({ ...formData, authors_section_title: e.target.value })}
                placeholder="MENTORING & COACHING"
                className="h-10 rounded-none border-slate-200 text-xs font-bold"
              />
              <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1 bg-white p-3 rounded-none border border-slate-200">
                {authors.map(a => {
                  const isSelected = formData.author_ids.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      onClick={() => setFormData({ ...formData, author_ids: isSelected ? formData.author_ids.filter(id => id !== a.id) : [...formData.author_ids, a.id] })}
                      className={`flex items-center gap-3 p-2.5 rounded-none border cursor-pointer transition-all ${isSelected ? 'border-[#ed1c24] bg-red-50/50 shadow-xs' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'}`}
                    >
                      <Avatar className="h-8 w-8 border border-white shrink-0 rounded-none">
                        <AvatarImage src={a.avatar_url} className="object-cover" />
                        <AvatarFallback className="font-black text-[10px] bg-slate-200 uppercase rounded-none">{a.full_name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-black uppercase truncate ${isSelected ? 'text-[#c91218]' : 'text-slate-700'}`}>{a.full_name}</span>
                        <span className="text-[9px] text-slate-400 font-bold italic truncate">{a.title || 'Mentor'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center rounded-none">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="font-black uppercase text-xs text-slate-500 rounded-none">Huỷ bỏ</Button>
          <Button disabled={loading || uploading} className="h-11 px-8 bg-[#ed1c24] hover:bg-[#c91218] text-white rounded-none font-black uppercase tracking-wider text-xs shadow-xs" onClick={handleSave}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Xuất bản ngay
          </Button>
        </DialogFooter>
      </DialogContent>

      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        defaultFolder="projects"
        onSelect={(res) => {
          if (res?.url) setFormData(prev => ({ ...prev, image: res.url, thumbnail_url: res.url }))
          setMediaPickerOpen(false)
        }}
      />
    </Dialog>
  )
}
