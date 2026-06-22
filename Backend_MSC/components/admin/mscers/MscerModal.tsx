"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Loader2, Upload, Save, FileText, Sparkles, 
  Trophy, Briefcase, FileCheck, X, GraduationCap, TrendingUp, Heart,
  Eye, EyeOff, Wrench, Hash, User,ShieldCheck
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const convertToSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function MscerModal({ open, onClose, mscer, onSave }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({
    full_name: '',
    slug: '',
    company: 'MSC',
    position: '',
    avatar_url: '',
    cv_url: '',
    achievement_summary: '', // Sẽ dùng cho phần "Achievement" ở Card trang chủ
    testimonial: '',
    graduation_year: '',
    promotion_path: '',
    social_impact: '',
    course_taken: '',
    skills: [],
    achievements_list: [],
    mentoring_content: '',
    background: { education: '', previous_role: '', experience: '' },
    is_active: true,
    order: 0 // Thêm trường sắp xếp
  })

  useEffect(() => {
    if (mscer) setFormData(mscer)
    else setFormData({
        full_name: '', slug: '', company: 'MSC', position: '', avatar_url: '', cv_url: '',
        achievement_summary: '', testimonial: '', graduation_year: '',
        promotion_path: '', social_impact: '', course_taken: '',
        skills: [], achievements_list: [], mentoring_content: '',
        background: { education: '', previous_role: '', experience: '' },
        is_active: true,
        order: 0
    })
  }, [mscer, open])

  const handleFileUpload = async (e: any, folder: string, field: string) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const path = `${folder}/${fileName}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
      setFormData((prev: any) => ({ ...prev, [field]: publicUrl }))
      toast({ title: `Thành công`, description: `Đã tải ${field === 'cv_url' ? 'CV' : 'ảnh'} lên!` })
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { id, created_at, updated_at, ...payload } = formData;
      const { error } = mscer?.id 
        ? await supabase.from('mscers').update(payload).eq('id', mscer.id)
        : await supabase.from('mscers').insert([payload])
      if (error) throw error
      onSave(); onClose();
      toast({ title: "Thành công", description: "Hồ sơ MSCer đã được lưu." })
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-gray-950 border-white/10 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="hidden"><DialogDescription>Quản lý hồ sơ học viên MSCer ưu tú</DialogDescription></div>
        <DialogHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white" size={24}/>
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Hồ sơ MSCer</DialogTitle>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Hệ thống quản trị Profile</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
            {formData.is_active ? <Eye className="text-emerald-500" size={18}/> : <EyeOff className="text-red-500" size={18}/>}
            <Label className="text-[10px] font-black uppercase tracking-widest">Trạng thái hiển thị</Label>
            <Switch 
              checked={formData.is_active} 
              onCheckedChange={(val) => setFormData({...formData, is_active: val})}
            />
          </div>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="bg-transparent border-b border-white/5 w-full justify-start rounded-none px-8 h-12 gap-8 overflow-x-auto custom-scrollbar">
            <TabsTrigger value="basic" className="data-[state=active]:text-blue-400 font-black uppercase text-[10px] tracking-widest flex-shrink-0">1. Thông tin Bìa</TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:text-blue-400 font-black uppercase text-[10px] tracking-widest flex-shrink-0">2. Học vấn & Kỹ năng</TabsTrigger>
            <TabsTrigger value="path" className="data-[state=active]:text-blue-400 font-black uppercase text-[10px] tracking-widest flex-shrink-0">3. Lộ trình & Tác động</TabsTrigger>
            <TabsTrigger value="experience" className="data-[state=active]:text-blue-400 font-black uppercase text-[10px] tracking-widest flex-shrink-0">4. Thành tựu</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:text-blue-400 font-black uppercase text-[10px] tracking-widest flex-shrink-0">5. CV & Tài liệu</TabsTrigger>
          </TabsList>

          <div className="p-8 max-h-[55vh] overflow-y-auto custom-scrollbar">
            
            {/* TAB: CƠ BẢN (DÙNG ĐỂ HIỂN THỊ NGOÀI CARD SECTION) */}
            <TabsContent value="basic" className="mt-0 space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-4 space-y-6">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/5 transition-all hover:border-blue-500/50 group">
                    <Label className="mb-4 uppercase text-[10px] font-black text-gray-500">Ảnh chân dung Card</Label>
                    <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-gray-900 shadow-2xl">
                      <img src={formData.avatar_url || 'https://via.placeholder.com/300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Avatar"/>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={24} className="text-white" />
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'mscers/avatars', 'avatar_url')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1.5"><Hash size={12}/> Thứ tự sắp xếp ngoài trang chủ</Label>
                    <Input type="number" className="bg-amber-500/5 border-amber-500/20 h-12 rounded-xl text-amber-500 font-black text-center text-lg" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/20">
                 <ShieldCheck className="text-blue-500" size={18}/>
                 <Label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Ban Chủ Nhiệm</Label>
                    <Switch 
                  checked={formData.is_director} 
                    onCheckedChange={(val) => setFormData({...formData, is_director: val})}
                  />
                            </div>
                <div className="md:col-span-8 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-500">Họ và tên</Label>
                      <Input className="bg-white/5 border-white/10 h-12 rounded-xl font-bold" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value, slug: convertToSlug(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-blue-500">Slug Profile (Tự động)</Label>
                      <Input className="bg-blue-500/5 border-blue-500/10 h-12 rounded-xl text-blue-400 font-mono italic" value={formData.slug} readOnly />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-500">Chức danh (Position)</Label>
                      <Input className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="VD: Phó Giám Đốc" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-500">Công ty (Company)</Label>
                      <Input className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="VD: MSC Center" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-teal-500 tracking-widest">Thành tích hiển thị Card (Achievement)</Label>
                    <Textarea className="bg-teal-500/5 border-teal-500/10 rounded-xl resize-none h-20 text-sm font-medium" placeholder="VD: Tốt nghiệp và trưởng thành từ MSC..." value={formData.achievement_summary} onChange={(e) => setFormData({...formData, achievement_summary: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-500 ml-1">Quote / Lời chứng thực (Testimonial)</Label>
                    <Textarea className="bg-white/5 border-white/10 rounded-xl resize-none h-24 italic text-sm" placeholder="Nhập câu nói tâm đắc..." value={formData.testimonial} onChange={(e) => setFormData({...formData, testimonial: e.target.value})} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB: HỌC VẤN & KỸ NĂNG */}
            <TabsContent value="education" className="mt-0 space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-amber-400 font-black uppercase text-[10px] tracking-widest"><GraduationCap size={16}/> Nền tảng học vấn chi tiết</Label>
                  <Textarea className="bg-white/5 border-white/10 h-48 rounded-2xl leading-relaxed text-sm" placeholder="VD: Thạc sĩ QTKD - Western Sydney University..." value={formData.background?.education} onChange={(e) => setFormData({...formData, background: {...formData.background, education: e.target.value}})} />
                </div>
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-blue-400 font-black uppercase text-[10px] tracking-widest"><Wrench size={16}/> Kỹ năng chuyên môn (Mỗi dòng 1 kỹ năng)</Label>
                  <Textarea className="bg-white/5 border-white/10 h-48 rounded-2xl leading-relaxed text-sm" placeholder="Lãnh đạo đội ngũ&#10;Chiến lược Marketing..." value={formData.skills?.join('\n')} onChange={(e) => setFormData({...formData, skills: e.target.value.split('\n')})} />
                </div>
              </div>
            </TabsContent>

            {/* TAB: LỘ TRÌNH & TÁC ĐỘNG */}
            <TabsContent value="path" className="mt-0 space-y-6 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-blue-400 font-black uppercase text-[10px] tracking-widest"><TrendingUp size={16}/> Lộ trình thăng tiến</Label>
                    <Textarea className="bg-white/5 border-white/10 h-40 rounded-2xl text-sm" value={formData.promotion_path} onChange={(e) => setFormData({...formData, promotion_path: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-pink-400 font-black uppercase text-[10px] tracking-widest"><Heart size={16}/> Tác động xã hội & cộng đồng</Label>
                    <Textarea className="bg-white/5 border-white/10 h-40 rounded-2xl text-sm" value={formData.social_impact} onChange={(e) => setFormData({...formData, social_impact: e.target.value})} />
                  </div>
               </div>
            </TabsContent>

            {/* TAB: KINH NGHIỆM & THÀNH TỰU CHI TIẾT */}
            <TabsContent value="experience" className="mt-0 space-y-6 animate-in fade-in duration-500">
               <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-indigo-400 font-black uppercase text-[10px] tracking-widest"><Briefcase size={16}/> Kinh nghiệm làm việc</Label>
                  <Textarea className="bg-white/5 border-white/10 h-32 rounded-2xl text-sm leading-relaxed" value={formData.background?.experience} onChange={(e) => setFormData({...formData, background: {...formData.background, experience: e.target.value}})} />
               </div>
               <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-yellow-500 font-black uppercase text-[10px] tracking-widest"><Trophy size={16}/> Danh sách thành tựu nổi bật (Mỗi dòng 1 mục)</Label>
                  <Textarea className="bg-white/5 border-white/10 h-32 rounded-2xl text-sm leading-relaxed" placeholder="Giải thưởng nhân viên xuất sắc 2023..." value={formData.achievements_list?.join('\n')} onChange={(e) => setFormData({...formData, achievements_list: e.target.value.split('\n')})} />
               </div>
            </TabsContent>

            {/* TAB: CV & TÀI LIỆU */}
            <TabsContent value="documents" className="mt-0 animate-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-blue-500/20 rounded-[3rem] bg-blue-500/5 transition-all hover:bg-blue-500/10 group">
                <div className="p-6 bg-blue-600/20 rounded-full mb-6 ring-8 ring-blue-600/5 group-hover:scale-110 transition-transform">
                  <FileText size={48} className="text-blue-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2 italic">Hồ sơ năng lực (CV)</h3>
                <p className="text-gray-500 text-xs font-medium mb-8 text-center px-10 max-w-md">
                  Đính kèm file PDF chuyên nghiệp. File này sẽ được hiển thị cho các đối tác chiến lược của MSC Center.
                </p>
                {formData.cv_url ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-[2rem]">
                      <FileCheck className="text-emerald-500" size={24} />
                      <div className="flex flex-col">
                        <span className="text-emerald-500 font-black text-sm uppercase tracking-widest">Đã xác thực PDF</span>
                        <a href={formData.cv_url} target="_blank" className="text-[10px] text-emerald-400/60 underline uppercase font-bold">Xem tài liệu</a>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, cv_url: ''})} className="ml-4 h-10 w-10 rounded-full hover:bg-red-500/20 text-red-400"><X size={18}/></Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="relative h-16 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded-full px-16 font-black transition-all shadow-xl shadow-blue-500/10 active:scale-95">
                    {loading ? <Loader2 className="animate-spin mr-3"/> : <Upload size={20} className="mr-3"/>} TẢI LÊN FILE PDF (MAX 10MB)
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" onChange={(e) => handleFileUpload(e, 'mscers/cvs', 'cv_url')} disabled={loading} />
                  </Button>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-8 bg-gray-900 border-t border-white/5 flex justify-end gap-4 shadow-2xl relative z-10">
          <Button variant="ghost" onClick={onClose} className="font-black text-gray-400 rounded-full px-10 hover:bg-white/5 uppercase text-xs tracking-widest">Hủy bỏ</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full px-14 h-14 shadow-2xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 uppercase text-xs tracking-widest">
            {loading ? <Loader2 className="animate-spin mr-3" size={20}/> : <Save size={20} className="mr-3"/>} LƯU HỒ SƠ CHI TIẾT
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}