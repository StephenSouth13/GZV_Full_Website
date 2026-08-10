"use client"

import type React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Briefcase, FileCheck, FileText, Hash, Loader2, Save, ShieldCheck, Sparkles, Upload, User, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type Department = {
  id: string
  name: string
  slug: string
  color?: string | null
  sort_order?: number | null
}

const convertToSlug = (text: string) => text
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '')

const defaultForm = {
  full_name: '',
  slug: '',
  company: 'GZV',
  position: '',
  role_level: '',
  department_id: '',
  department_name: '',
  avatar_url: '',
  cv_url: '',
  achievement_summary: '',
  testimonial: '',
  graduation_year: '',
  promotion_path: '',
  social_impact: '',
  course_taken: '',
  skills: [] as string[],
  achievements_list: [] as string[],
  mentoring_content: '',
  background: { education: '', previous_role: '', experience: '' },
  is_active: true,
  is_director: false,
  order: 0,
}

export function GZVerModal({ open, onClose, gzver, onSave, departments = [] }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>(defaultForm)

  useEffect(() => {
    if (!open) return
    if (gzver) {
      setFormData({
        ...defaultForm,
        ...gzver,
        department_id: gzver.department_id || gzver.gzver_departments?.id || '',
        department_name: gzver.department_name || gzver.gzver_departments?.name || '',
        skills: gzver.skills || [],
        achievements_list: gzver.achievements_list || [],
        background: gzver.background || defaultForm.background,
        is_active: gzver.is_active ?? true,
        is_director: gzver.is_director ?? false,
        order: gzver.order ?? 0,
      })
    } else {
      const firstDepartment = departments[0]
      setFormData({
        ...defaultForm,
        department_id: firstDepartment?.id || '',
        department_name: firstDepartment?.name || '',
      })
    }
  }, [gzver, open, departments])

  const handleFileUpload = async (e: any, folder: string, field: string) => {
    const file = e.target.files?.[0]
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
      toast({ title: 'Đã tải lên', description: field === 'cv_url' ? 'CV đã sẵn sàng.' : 'Ảnh đại diện đã sẵn sàng.' })
    } catch (error: any) {
      toast({ title: 'Lỗi upload', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const setDepartment = (departmentId: string) => {
    const department = departments.find((item: Department) => item.id === departmentId)
    setFormData({ ...formData, department_id: departmentId, department_name: department?.name || '' })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { id, created_at, updated_at, gzver_departments, ...payload } = formData
      const cleanPayload = {
        ...payload,
        department_id: payload.department_id || null,
        department_name: payload.department_name || null,
        role_level: payload.role_level || null,
        skills: (payload.skills || []).filter(Boolean),
        achievements_list: (payload.achievements_list || []).filter(Boolean),
      }
      const { error } = gzver?.id
        ? await supabase.from('gzvers').update(cleanPayload).eq('id', gzver.id)
        : await supabase.from('gzvers').insert([cleanPayload])
      if (error) throw error
      toast({ title: 'Đã lưu GZVer' })
      onSave()
      onClose()
    } catch (error: any) {
      toast({ title: 'Không lưu được', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl overflow-hidden rounded-none border-white/10 bg-gray-950 p-0 text-white shadow-2xl">
        <DialogDescription className="sr-only">Quản lý hồ sơ GZVer</DialogDescription>
        <DialogHeader className="border-b border-white/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#ed1c24] p-3">
                <Sparkles className="text-white" size={22} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Hồ sơ GZVer</DialogTitle>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Profile, ban và vị trí hiển thị</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3">
              <Label className="text-[10px] font-black uppercase tracking-widest">Hiển thị public</Label>
              <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData({ ...formData, is_active: val })} />
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="h-12 w-full justify-start gap-4 overflow-x-auto rounded-none border-b border-white/10 bg-transparent px-6">
            <TabsTrigger value="basic" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">Thông tin</TabsTrigger>
            <TabsTrigger value="story" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">Năng lực</TabsTrigger>
            <TabsTrigger value="docs" className="rounded-none text-[10px] font-black uppercase tracking-widest data-[state=active]:text-[#ed1c24]">CV</TabsTrigger>
          </TabsList>

          <div className="max-h-[60vh] overflow-y-auto p-6">
            <TabsContent value="basic" className="mt-0 space-y-6">
              <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/10 bg-white/5 p-5 text-center">
                    <Label className="mb-4 block text-[10px] font-black uppercase text-gray-500">Ảnh đại diện</Label>
                    <div className="relative mx-auto h-44 w-44 overflow-hidden bg-black">
                      <img src={formData.avatar_url || 'https://via.placeholder.com/300'} className="h-full w-full object-cover" alt="Avatar" />
                      <input type="file" className="absolute inset-0 cursor-pointer opacity-0" accept="image/*" onChange={(e) => handleFileUpload(e, 'gzvers/avatars', 'avatar_url')} />
                    </div>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">Click ảnh để upload</p>
                  </div>
                  <Field label="Thứ tự">
                    <Input type="number" className="h-12 rounded-none border-white/10 bg-white/5 text-center text-lg font-black text-white" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 0 })} />
                  </Field>
                  <div className="flex items-center justify-between border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#ed1c24]" />
                      <Label className="text-[10px] font-black uppercase tracking-widest">Ban chủ nhiệm</Label>
                    </div>
                    <Switch checked={formData.is_director} onCheckedChange={(val) => setFormData({ ...formData, is_director: val })} />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Họ và tên">
                      <Input className="h-12 rounded-none border-white/10 bg-white/5 font-bold text-white" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value, slug: convertToSlug(e.target.value) })} />
                    </Field>
                    <Field label="Slug">
                      <Input className="h-12 rounded-none border-white/10 bg-white/5 font-mono text-[#ed1c24]" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: convertToSlug(e.target.value) })} />
                    </Field>
                    <Field label="Ban">
                      <Select value={formData.department_id || ''} onValueChange={setDepartment}>
                        <SelectTrigger className="h-12 rounded-none border-white/10 bg-white/5 text-white"><SelectValue placeholder="Chọn ban" /></SelectTrigger>
                        <SelectContent className="rounded-none border-white/10 bg-gray-950 text-white">
                          {departments.map((department: Department) => (
                            <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Role level / nhãn nổi bật">
                      <Input className="h-12 rounded-none border-white/10 bg-white/5 text-white" placeholder="VD: Founder, Lead, Member..." value={formData.role_level || ''} onChange={(e) => setFormData({ ...formData, role_level: e.target.value })} />
                    </Field>
                    <Field label="Chức danh">
                      <Input className="h-12 rounded-none border-white/10 bg-white/5 text-white" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                    </Field>
                    <Field label="Đơn vị / công ty">
                      <Input className="h-12 rounded-none border-white/10 bg-white/5 text-white" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Thành tích hiển thị trên card">
                    <Textarea className="min-h-24 rounded-none border-white/10 bg-white/5 text-white" value={formData.achievement_summary || ''} onChange={(e) => setFormData({ ...formData, achievement_summary: e.target.value })} />
                  </Field>
                  <Field label="Quote / testimonial">
                    <Textarea className="min-h-28 rounded-none border-white/10 bg-white/5 text-white" value={formData.testimonial || ''} onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })} />
                  </Field>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="story" className="mt-0 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Kỹ năng, mỗi dòng một mục">
                  <Textarea className="min-h-44 rounded-none border-white/10 bg-white/5 text-white" value={(formData.skills || []).join('\n')} onChange={(e) => setFormData({ ...formData, skills: e.target.value.split('\n') })} />
                </Field>
                <Field label="Thành tựu, mỗi dòng một mục">
                  <Textarea className="min-h-44 rounded-none border-white/10 bg-white/5 text-white" value={(formData.achievements_list || []).join('\n')} onChange={(e) => setFormData({ ...formData, achievements_list: e.target.value.split('\n') })} />
                </Field>
                <Field label="Học vấn">
                  <Textarea className="min-h-36 rounded-none border-white/10 bg-white/5 text-white" value={formData.background?.education || ''} onChange={(e) => setFormData({ ...formData, background: { ...formData.background, education: e.target.value } })} />
                </Field>
                <Field label="Kinh nghiệm">
                  <Textarea className="min-h-36 rounded-none border-white/10 bg-white/5 text-white" value={formData.background?.experience || ''} onChange={(e) => setFormData({ ...formData, background: { ...formData.background, experience: e.target.value } })} />
                </Field>
              </div>
              <Field label="Lộ trình phát triển">
                <Textarea className="min-h-28 rounded-none border-white/10 bg-white/5 text-white" value={formData.promotion_path || ''} onChange={(e) => setFormData({ ...formData, promotion_path: e.target.value })} />
              </Field>
              <Field label="Tác động xã hội / cộng đồng">
                <Textarea className="min-h-28 rounded-none border-white/10 bg-white/5 text-white" value={formData.social_impact || ''} onChange={(e) => setFormData({ ...formData, social_impact: e.target.value })} />
              </Field>
            </TabsContent>

            <TabsContent value="docs" className="mt-0">
              <div className="flex min-h-[280px] flex-col items-center justify-center border-2 border-dashed border-white/10 bg-white/5 p-8 text-center">
                <div className="mb-5 bg-[#ed1c24]/15 p-5">
                  <FileText size={44} className="text-[#ed1c24]" />
                </div>
                {formData.cv_url ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 border border-emerald-500/25 bg-emerald-500/10 px-6 py-4 text-emerald-400">
                      <FileCheck size={22} />
                      <a href={formData.cv_url} target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest">Xem CV đã upload</a>
                      <Button variant="ghost" size="icon" onClick={() => setFormData({ ...formData, cv_url: '' })} className="rounded-none text-red-400 hover:bg-red-500/20"><X size={16} /></Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="relative h-14 rounded-none border-[#ed1c24] px-10 text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white">
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : <Upload size={18} className="mr-2" />} Tải file PDF
                    <input type="file" className="absolute inset-0 cursor-pointer opacity-0" accept=".pdf" onChange={(e) => handleFileUpload(e, 'gzvers/cvs', 'cv_url')} disabled={loading} />
                  </Button>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 border-t border-white/10 bg-[#0b0b0b] p-6">
          <Button variant="ghost" onClick={onClose} className="rounded-none px-8 text-xs font-black uppercase text-gray-400 hover:bg-white/5">Hủy</Button>
          <Button onClick={handleSubmit} disabled={loading} className="h-12 rounded-none bg-[#ed1c24] px-10 text-xs font-black uppercase text-white hover:bg-[#c91218]">
            {loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : <Save size={18} className="mr-2" />} Lưu hồ sơ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
        <Hash className="h-3 w-3 text-[#ed1c24]" />
        {label}
      </Label>
      {children}
    </div>
  )
}
