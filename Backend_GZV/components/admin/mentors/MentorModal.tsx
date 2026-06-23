"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Loader2, Upload, Save, Sparkles, GraduationCap, Briefcase, 
  Linkedin, Facebook, Globe, Award, Eye, EyeOff, Wrench, 
  BookOpen, Rocket, Lightbulb, Trophy, Building2, Quote, Layout
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

export function MentorModal({ isOpen, onClose, mentor, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<any>({
    full_name: '', slug: '', title: '', description: '', avatar_url: '',
    specialties: [], 
    background: { education: '', experience: '' },
    organizations: [], 
    teaching_subjects: [], 
    practical_projects: [], 
    research_projects: [], 
    awards: [], 
    tech_business_achievements: [], 
    is_active: true, order: 0,
    linkedin_url: '', facebook_url: '', portfolio_url: '',
    visible_sections: {
      description: true, // Triết lý giảng huấn
      education: true, experience: true, teaching: true, specialties: true,
      practical: true, research: true, awards: true, achievements: true
    }
  })

  useEffect(() => {
    if (mentor) setFormData({ ...mentor });
    else resetForm();
  }, [mentor, isOpen])

  const resetForm = () => setFormData({
    full_name: '', slug: '', title: '', description: '', avatar_url: '',
    specialties: [], background: { education: '', experience: '' },
    organizations: [], teaching_subjects: [], practical_projects: [],
    research_projects: [], awards: [], tech_business_achievements: [],
    is_active: true, order: 0, linkedin_url: '', facebook_url: '', portfolio_url: '',
    visible_sections: { description: true, education: true, experience: true, teaching: true, specialties: true, practical: true, research: true, awards: true, achievements: true }
  });

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `mentor_${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(`mentors/${fileName}`, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`mentors/${fileName}`);
      setFormData((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "Thành công", description: "Ảnh đã được cập nhật." });
    } catch (error: any) {
      toast({ title: "Lỗi upload", description: error.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const toggleSection = (section: string) => {
    setFormData((prev: any) => ({
      ...prev,
      visible_sections: { ...prev.visible_sections, [section]: !prev.visible_sections[section] }
    }));
  };

  const handleSave = async () => {
    setLoading(true)
    try {
      const { id, created_at, updated_at, ...payload } = formData;
      const { error } = mentor?.id 
        ? await supabase.from('mentors').update(payload).eq('id', mentor.id)
        : await supabase.from('mentors').insert([payload])
      if (error) throw error
      toast({ title: "Thành công", description: "Hồ sơ đã được lưu." });
      onSuccess(); onClose();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="hidden"><DialogDescription>Quản lý thông tin chi tiết Ban Giảng Huấn</DialogDescription></div>
        <DialogHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20"><Award className="text-white" size={24}/></div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Hồ sơ Mentor Chuyên sâu</DialogTitle>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Hệ thống quản trị gzv Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10">
            <Label className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Trạng thái Web</Label>
            <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({...formData, is_active: v})} />
          </div>
        </DialogHeader>

        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="bg-transparent border-b border-white/5 w-full justify-start rounded-none px-8 h-14 gap-6 overflow-x-auto custom-scrollbar">
            <TabsTrigger value="identity" className="uppercase text-[10px] font-black tracking-widest">1. Định danh & Bìa</TabsTrigger>
            <TabsTrigger value="academic" className="uppercase text-[10px] font-black tracking-widest">2. Học vị & Quá trình</TabsTrigger>
            <TabsTrigger value="expertise" className="uppercase text-[10px] font-black tracking-widest">3. Giảng dạy</TabsTrigger>
            <TabsTrigger value="projects" className="uppercase text-[10px] font-black tracking-widest">4. Dự án</TabsTrigger>
            <TabsTrigger value="achievements" className="uppercase text-[10px] font-black tracking-widest">5. Thành tựu</TabsTrigger>
          </TabsList>

          <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-8">
            {/* TAB 1: ĐỊNH DANH & BÌA */}
            <TabsContent value="identity" className="mt-0 space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-4 space-y-6">
                  <div className="aspect-square rounded-full border-4 border-white/5 bg-slate-900 overflow-hidden relative group shadow-2xl">
                    <img src={formData.avatar_url || '/placeholder-avatar.jpg'} className="w-full h-full object-cover" alt="Avatar"/>
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                      {uploading ? <Loader2 className="animate-spin" /> : <Upload size={30} />}
                      <input type="file" className="hidden" accept="image/*" onChange={handleUploadImage} disabled={uploading} />
                    </label>
                  </div>
                  
                  {/* HIỂN THỊ NGOÀI BÌA CARD */}
                  <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <Layout size={16} className="text-blue-400"/>
                       <Label className="text-[10px] font-black uppercase text-blue-400">Hiển thị ngoài bìa (Card)</Label>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] uppercase text-gray-500">Học vị (Badge)</Label>
                      <Input placeholder="VD: Tiến Sĩ Kinh tế" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] uppercase text-gray-500">Chức vụ & Công ty</Label>
                      <Input placeholder="VD: Chủ tịch HĐQT Công ty Smentor" value={formData.organizations[0] || ''} onChange={(e)=>{
                         let newOrgs = [...formData.organizations];
                         newOrgs[0] = e.target.value;
                         setFormData({...formData, organizations: newOrgs});
                      }} className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" />
                    </div>
                  </div>
                </div>

                <div className="col-span-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-500">Họ và tên</Label>
                      <Input value={formData.full_name} onChange={(e)=>{setFormData({...formData, full_name: e.target.value, slug: convertToSlug(e.target.value)})}} className="bg-white/5 border-white/10 h-12 rounded-xl font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-blue-500">Slug URL (Tự động)</Label>
                      <Input value={formData.slug} readOnly className="bg-blue-500/5 border-blue-500/20 h-12 rounded-xl text-blue-400 font-mono" />
                    </div>
                  </div>
{/* Thêm ô nhập thứ tự vào ngay sau phần Slug */}
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label className="text-[10px] font-black uppercase text-blue-500">Slug URL (Tự động)</Label>
    <Input value={formData.slug} readOnly className="bg-blue-500/5 border-blue-500/20 h-12 rounded-xl text-blue-400 font-mono" />
  </div>
  <div className="space-y-2">
    <Label className="text-[10px] font-black uppercase text-amber-500">Thứ tự hiển thị (Số nhỏ hiện trước)</Label>
    <Input 
      type="number" 
      value={formData.order} 
      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} 
      className="bg-amber-500/5 border-amber-500/20 h-12 rounded-xl text-amber-500 font-bold" 
    />
  </div>
</div>
                  {/* TRIẾT LÝ GIẢNG HUẤN (SHOW/HIDE) */}
                  <div className={`space-y-4 p-6 rounded-[2rem] border transition-all ${formData.visible_sections.description ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2 text-blue-400 font-black uppercase text-[10px]"><Quote size={16}/> Triết lý giảng huấn</Label>
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] text-gray-500 uppercase">{formData.visible_sections.description ? 'Đang hiện' : 'Đang ẩn'}</span>
                         <Switch checked={formData.visible_sections.description} onCheckedChange={() => toggleSection('description')} />
                      </div>
                    </div>
                    <Textarea disabled={!formData.visible_sections.description} className="bg-transparent border-white/5 h-24 text-sm resize-none" placeholder="Nhập triết lý giảng huấn của mentor..." value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-500">LinkedIn</Label>
                      <Input value={formData.linkedin_url} onChange={(e)=>setFormData({...formData, linkedin_url: e.target.value})} className="bg-white/5 border-white/10 h-10 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-gray-500">Facebook</Label>
                      <Input value={formData.facebook_url} onChange={(e)=>setFormData({...formData, facebook_url: e.target.value})} className="bg-white/5 border-white/10 h-10 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: HỌC VỊ & QUÁ TRÌNH */}
            <TabsContent value="academic" className="mt-0 space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 gap-8">
                <div className={`space-y-4 p-6 rounded-[2.5rem] border transition-all ${formData.visible_sections.education ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-indigo-400 font-black uppercase text-[10px]"><GraduationCap size={16}/> Bằng cấp & Chuyên môn</Label>
                    <Switch checked={formData.visible_sections.education} onCheckedChange={() => toggleSection('education')} />
                  </div>
                  <Textarea disabled={!formData.visible_sections.education} className="bg-transparent border-white/5 h-64 text-sm leading-relaxed" value={formData.background?.education} onChange={(e)=>setFormData({...formData, background: {...formData.background, education: e.target.value}})} />
                </div>
                <div className={`space-y-4 p-6 rounded-[2.5rem] border transition-all ${formData.visible_sections.experience ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-emerald-400 font-black uppercase text-[10px]"><Briefcase size={16}/> Quá trình công tác</Label>
                    <Switch checked={formData.visible_sections.experience} onCheckedChange={() => toggleSection('experience')} />
                  </div>
                  <Textarea disabled={!formData.visible_sections.experience} className="bg-transparent border-white/5 h-64 text-sm leading-relaxed" value={formData.background?.experience} onChange={(e)=>setFormData({...formData, background: {...formData.background, experience: e.target.value}})} />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: GIẢNG DẠY */}
            <TabsContent value="expertise" className="mt-0 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className={`space-y-4 p-6 rounded-[2.5rem] border transition-all ${formData.visible_sections.teaching ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-blue-400 font-black uppercase text-[10px]"><BookOpen size={16}/> Bộ môn giảng dạy</Label>
                    <Switch checked={formData.visible_sections.teaching} onCheckedChange={() => toggleSection('teaching')} />
                  </div>
                  <Textarea disabled={!formData.visible_sections.teaching} className="bg-transparent border-white/5 h-64 text-sm" value={formData.teaching_subjects?.join('\n')} onChange={(e)=>setFormData({...formData, teaching_subjects: e.target.value.split('\n')})} />
                </div>
                <div className={`space-y-4 p-6 rounded-[2.5rem] border transition-all ${formData.visible_sections.specialties ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-amber-400 font-black uppercase text-[10px]"><Wrench size={16}/> Chuyên môn cốt lõi</Label>
                    <Switch checked={formData.visible_sections.specialties} onCheckedChange={() => toggleSection('specialties')} />
                  </div>
                  <Textarea disabled={!formData.visible_sections.specialties} className="bg-transparent border-white/5 h-64 text-sm" value={formData.specialties?.join('\n')} onChange={(e)=>setFormData({...formData, specialties: e.target.value.split('\n')})} />
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: DỰ ÁN */}
            <TabsContent value="projects" className="mt-0 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className={`space-y-4 p-6 rounded-[2.5rem] border transition-all ${formData.visible_sections.practical ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-cyan-400 font-black uppercase text-[10px]"><Lightbulb size={16}/> Công trình thực tiễn</Label>
                    <Switch checked={formData.visible_sections.practical} onCheckedChange={() => toggleSection('practical')} />
                  </div>
                  <Textarea disabled={!formData.visible_sections.practical} className="bg-transparent border-white/5 h-64 text-sm" value={formData.practical_projects?.join('\n')} onChange={(e)=>setFormData({...formData, practical_projects: e.target.value.split('\n')})} />
                </div>
                <div className={`space-y-4 p-6 rounded-[2.5rem] border transition-all ${formData.visible_sections.research ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-purple-400 font-black uppercase text-[10px]"><Rocket size={16}/> Đề tài nghiên cứu</Label>
                    <Switch checked={formData.visible_sections.research} onCheckedChange={() => toggleSection('research')} />
                  </div>
                  <Textarea disabled={!formData.visible_sections.research} className="bg-transparent border-white/5 h-64 text-sm" value={formData.research_projects?.join('\n')} onChange={(e)=>setFormData({...formData, research_projects: e.target.value.split('\n')})} />
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: THÀNH TỰU */}
            <TabsContent value="achievements" className="mt-0 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className={`space-y-4 p-6 rounded-[2.5rem] border transition-all ${formData.visible_sections.awards ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-yellow-400 font-black uppercase text-[10px]"><Trophy size={16}/> Giải thưởng & Bằng khen</Label>
                    <Switch checked={formData.visible_sections.awards} onCheckedChange={() => toggleSection('awards')} />
                  </div>
                  <Textarea disabled={!formData.visible_sections.awards} className="bg-transparent border-white/5 h-64 text-sm" value={formData.awards?.join('\n')} onChange={(e)=>setFormData({...formData, awards: e.target.value.split('\n')})} />
                </div>
                <div className={`space-y-4 p-6 rounded-[2.5rem] border transition-all ${formData.visible_sections.achievements ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2 text-rose-400 font-black uppercase text-[10px]"><Building2 size={16}/> Thành tựu KH&CN / Kinh doanh</Label>
                    <Switch checked={formData.visible_sections.achievements} onCheckedChange={() => toggleSection('achievements')} />
                  </div>
                  <Textarea disabled={!formData.visible_sections.achievements} className="bg-transparent border-white/5 h-64 text-sm" value={formData.tech_business_achievements?.join('\n')} onChange={(e)=>setFormData({...formData, tech_business_achievements: e.target.value.split('\n')})} />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-8 bg-[#0f0f0f] border-t border-white/5 flex justify-end gap-4 shadow-2xl">
          <Button variant="ghost" onClick={onClose} className="font-black text-gray-500 rounded-full px-10 uppercase text-[10px] tracking-widest">Hủy bỏ</Button>
          <Button onClick={handleSave} disabled={loading || uploading} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-full px-14 h-14 shadow-2xl shadow-blue-600/20 transition-all hover:scale-105">
            {loading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>} LƯU HỒ SƠ CHUYÊN GIA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}