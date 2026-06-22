"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2, Upload, Save, ImageIcon, Link as LinkIcon, ArrowUpDown } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Partner, PartnerCategory } from "@/app/admin/partners/page"

interface Props {
  isOpen: boolean
  onClose: () => void
  partner: Partner | null
  existing: Partner[]
  onSuccess: () => void
}

const empty: Omit<Partner, "id" | "created_at" | "updated_at"> = {
  name: "",
  logo_url: "",
  category: "corporate",
  website_url: "",
  sort_order: 10,
  is_active: true,
}

export function PartnerModal({ isOpen, onClose, partner, existing, onSuccess }: Props) {
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (partner) {
      setForm({ ...partner })
    } else {
      const sameCat = existing.filter(p => p.category === "corporate")
      const next = sameCat.length ? Math.max(...sameCat.map(p => p.sort_order)) + 10 : 10
      setForm({ ...empty, sort_order: next })
    }
  }, [isOpen, partner])

  const recomputeNextOrder = (cat: PartnerCategory) => {
    const sameCat = existing.filter(p => p.category === cat && p.id !== partner?.id)
    return sameCat.length ? Math.max(...sameCat.map(p => p.sort_order)) + 10 : 10
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const fileName = `partner_${Date.now()}.${ext}`
      const path = `partners/${fileName}`
      const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path)
      setForm((p: any) => ({ ...p, logo_url: publicUrl }))
      toast({ title: "Đã tải lên", description: "Logo đã được cập nhật." })
    } catch (err: any) {
      toast({ title: "Lỗi tải ảnh", description: err.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập tên đối tác.", variant: "destructive" })
      return
    }
    if (!form.logo_url?.trim()) {
      toast({ title: "Thiếu logo", description: "Vui lòng tải lên hoặc dán URL logo.", variant: "destructive" })
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      logo_url: form.logo_url.trim(),
      category: form.category,
      website_url: form.website_url?.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: !!form.is_active,
    }
    const { error } = partner
      ? await supabase.from("partners").update(payload).eq("id", partner.id)
      : await supabase.from("partners").insert(payload)
    setSaving(false)
    if (error) {
      toast({ title: "Lỗi lưu", description: error.message, variant: "destructive" })
      return
    }
    toast({ title: "Thành công", description: partner ? "Đã cập nhật đối tác." : "Đã thêm đối tác mới." })
    onSuccess()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">
            {partner ? "Chỉnh sửa đối tác" : "Thêm đối tác mới"}
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Cập nhật logo, danh mục và vị trí hiển thị trên trang /dong-hanh.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Logo preview & upload */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-zinc-400 mb-2 block">Logo</Label>
            <div className="aspect-[4/3] rounded-2xl border border-dashed border-zinc-700 bg-white flex items-center justify-center overflow-hidden mb-3">
              {form.logo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={form.logo_url} alt="preview" className="max-h-full max-w-full object-contain p-6" />
              ) : (
                <div className="text-zinc-400 text-center">
                  <ImageIcon className="mx-auto mb-2" />
                  <p className="text-xs">Chưa có logo</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <label className="flex-1">
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <div className="cursor-pointer h-10 rounded-md bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center font-bold text-sm">
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <><Upload className="mr-2" size={16} /> Tải ảnh lên</>}
                </div>
              </label>
            </div>
            <div className="relative mt-3">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <Input
                value={form.logo_url}
                onChange={e => setForm({ ...form, logo_url: e.target.value })}
                placeholder="hoặc dán URL ảnh..."
                className="pl-9 bg-zinc-900 border-zinc-800 text-white text-xs"
              />
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-zinc-400">Tên đối tác *</Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Shinhan Bank"
                className="mt-1 bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-zinc-400">Danh mục *</Label>
              <Select
                value={form.category}
                onValueChange={(v: PartnerCategory) => setForm({ ...form, category: v, sort_order: recomputeNextOrder(v) })}
              >
                <SelectTrigger className="mt-1 bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="corporate">Doanh nghiệp & Tập đoàn</SelectItem>
                  <SelectItem value="education">Giáo dục & Hiệp hội</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-zinc-400">Website (tùy chọn)</Label>
              <Input
                value={form.website_url || ""}
                onChange={e => setForm({ ...form, website_url: e.target.value })}
                placeholder="https://..."
                className="mt-1 bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <ArrowUpDown size={12} /> Vị trí hiển thị (số nhỏ ở trước)
              </Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="mt-1 bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div>
                <Label className="text-sm font-bold">Hiển thị công khai</Label>
                <p className="text-[10px] text-zinc-500">Logo sẽ xuất hiện trên /dong-hanh</p>
              </div>
              <Switch
                checked={!!form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
          <Button variant="outline" onClick={onClose}
            className="border-zinc-800 bg-transparent text-white hover:bg-zinc-900">
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
            {partner ? "Lưu thay đổi" : "Thêm đối tác"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
