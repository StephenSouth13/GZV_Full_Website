"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, Save, Upload, Users, Globe, Linkedin, Lock, Unlock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function AuthorModal({ isOpen, onClose, author, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isSlugLocked, setIsSlugLocked] = useState(true)
  const [formData, setFormData] = useState<any>({
    full_name: '',
    slug: '',
    title: '',
    avatar_url: '',
    bio: '',
    linkedin_url: '',
    portfolio_url: '' // ĐÃ SỬA: website_url -> portfolio_url
  })

  useEffect(() => {
    if (author && isOpen) {
      setFormData(author)
      setIsSlugLocked(true)
    } else if (isOpen) {
      setFormData({
        full_name: '', slug: '', title: '', avatar_url: '', bio: '', linkedin_url: '', portfolio_url: ''
      })
      setIsSlugLocked(false)
    }
  }, [author, isOpen])

  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/([^0-9a-z-\s])/g, "").replace(/(\s+)/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `author-${Date.now()}.${fileExt}`
      const filePath = `authors/${fileName}`

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath)
      setFormData((prev: any) => ({ ...prev, avatar_url: publicUrl }))
      toast({ title: "Thành công", description: "Đã tải ảnh tác giả lên." })
    } catch (error: any) {
      toast({ title: "Lỗi tải ảnh", description: error.message, variant: "destructive" })
    } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!formData.full_name?.trim()) {
      return toast({ title: "Thiếu thông tin", description: "Vui lòng nhập tên tác giả", variant: "destructive" });
    }

    setLoading(true);
    try {
      // Bóc tách dữ liệu: Chỉ lấy những cột thực sự có trong Database
      const payload = {
        full_name: formData.full_name,
        slug: formData.slug || generateSlug(formData.full_name),
        title: formData.title,
        avatar_url: formData.avatar_url,
        bio: formData.bio,
        linkedin_url: formData.linkedin_url,
        portfolio_url: formData.portfolio_url, // Gửi đúng cột portfolio_url
        updated_at: new Date().toISOString()
      };

      const { error } = author?.id 
        ? await supabase.from('authors').update(payload).eq('id', author.id)
        : await supabase.from('authors').insert([payload]);

      if (error) throw error;

      toast({ title: "Thành công!", description: "Hồ sơ tác giả đã được cập nhật." });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Database Error:", error);
      toast({ title: "Lỗi lưu dữ liệu", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl font-montserrat">
        <DialogHeader className="p-8 pb-6 flex flex-row items-center gap-4 bg-white/[0.02] border-b border-white/5">
          <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20">
            <Users className="text-white" size={24}/>
          </div>
          <div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Hồ sơ Tác giả <span className="text-emerald-500">Expert</span></DialogTitle>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Biên tập viên & Đội ngũ chuyên gia gzv</p>
          </div>
        </DialogHeader>

        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* CỘT TRÁI: AVATAR & LINKS */}
          <div className="space-y-8">
            <div className="relative group mx-auto w-48 h-48">
              <Avatar className="h-48 w-48 border-4 border-emerald-500/20 shadow-2xl overflow-hidden bg-slate-900 ring-8 ring-white/5">
                <AvatarImage src={formData.avatar_url} className="object-cover" />
                <AvatarFallback className="text-4xl font-black bg-emerald-900 text-emerald-400">
                  {uploading ? <Loader2 className="animate-spin" /> : "gzv"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 bg-emerald-600/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-sm border-2 border-dashed border-white/50">
                <Upload className="text-white h-8 w-8 mb-2" />
                <span className="text-[10px] font-black text-white uppercase">Tải ảnh mới</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2 px-1"><Linkedin size={14} className="text-blue-400"/> LinkedIn Profile</Label>
                <Input className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-emerald-500/20 text-sm" placeholder="https://linkedin.com/in/..." value={formData.linkedin_url || ''} onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2 px-1"><Globe size={14} className="text-emerald-400"/> Portfolio URL</Label>
                <Input className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-emerald-500/20 text-sm" placeholder="https://my-work.com" value={formData.portfolio_url || ''} onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})} />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: INFO */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest px-1">Họ và tên Tác giả</Label>
                <Input 
                  className="bg-white/5 border-white/10 h-14 rounded-2xl font-black text-xl uppercase placeholder:text-gray-700 focus:border-emerald-500/50 transition-all" 
                  placeholder="VD: NGUYỄN VĂN A"
                  value={formData.full_name || ''} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({...formData, full_name: val, slug: isSlugLocked ? generateSlug(val) : formData.slug})
                  }} 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Đường dẫn định danh (Slug)</Label>
                  <Button variant="ghost" className="h-6 text-[9px] font-black text-gray-500 hover:text-emerald-400" onClick={() => setIsSlugLocked(!isSlugLocked)}>
                    {isSlugLocked ? <Lock size={12} className="mr-1"/> : <Unlock size={12} className="mr-1 text-amber-500"/>}
                    {isSlugLocked ? "LOCKED" : "EDIT MANUAL"}
                  </Button>
                </div>
                <Input className={`bg-white/5 border-white/10 h-12 rounded-xl font-mono text-xs ${isSlugLocked ? 'text-gray-500' : 'text-emerald-400 border-emerald-500/30'}`} value={formData.slug || ''} readOnly={isSlugLocked} onChange={(e) => setFormData({...formData, slug: generateSlug(e.target.value)})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Chức danh / Chuyên môn</Label>
              <Input className="bg-white/5 border-white/10 h-12 rounded-xl font-bold italic" placeholder="VD: Creative Director / Senior Content Strategist" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Tiểu sử & Kinh nghiệm</Label>
              <Textarea rows={6} className="bg-white/5 border-white/10 rounded-2xl resize-none p-5 text-sm leading-relaxed focus:border-emerald-500/30" placeholder="Viết vài dòng giới thiệu về tác giả..." value={formData.bio || ''} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end gap-4">
          <Button variant="ghost" onClick={onClose} className="font-black text-gray-500 rounded-2xl px-8 uppercase text-[10px] tracking-widest hover:bg-white/5">Hủy thay đổi</Button>
          <Button 
            disabled={loading || uploading} 
            onClick={handleSave} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[220px] h-14 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin mr-3" size={18} /> : <Save className="mr-3" size={18} />}
            Xác nhận lưu hồ sơ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}