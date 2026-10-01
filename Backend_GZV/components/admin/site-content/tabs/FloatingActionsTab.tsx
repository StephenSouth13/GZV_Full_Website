import React, { useState } from "react"
import { ArrowDown, ArrowUp, Bot, ImageIcon, Link2, Loader2, Plus, Save, Trash2, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { FloatingAction } from "@/components/admin/site-content/types"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

type Props = { actions: FloatingAction[]; onChange: (actions: FloatingAction[]) => void; onSave: () => void; saving?: boolean }
const patchAt = (actions: FloatingAction[], index: number, patch: Partial<FloatingAction>) => actions.map((action, itemIndex) => itemIndex === index ? { ...action, ...patch } : action)
const styleOf = (action: FloatingAction) => action.style || {}

export function FloatingActionsTab({ actions, onChange, onSave, saving = false }: Props) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const uploadIcon = async (index: number, file: File) => {
    setUploadingIndex(index)
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-")
      const path = `floating-actions/${Date.now()}-${safe}`
      const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path)
      onChange(patchAt(actions, index, { icon_url: publicUrl }))
      toast({ title: "Đã tải logo kênh liên hệ" })
    } catch (error: any) {
      toast({ title: "Không thể tải logo", description: error.message, variant: "destructive" })
    } finally { setUploadingIndex(null) }
  }
  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= actions.length) return
    const next = [...actions]
    const [item] = next.splice(index, 1)
    next.splice(nextIndex, 0, item)
    onChange(next.map((action, itemIndex) => ({ ...action, sort_order: (itemIndex + 1) * 10 })))
  }
  const addAction = () => onChange([...actions, { action_key: `contact-${Date.now()}`, label: "Kênh liên hệ mới", href: "https://", icon_url: "", action_type: "link", sort_order: (actions.length + 1) * 10, is_visible: true }])
  const removeAction = (index: number) => onChange(actions.filter((_, itemIndex) => itemIndex !== index).map((action, itemIndex) => ({ ...action, sort_order: (itemIndex + 1) * 10 })))

  return (
    <Card className="rounded-none border-slate-200 dark:border-white/10">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-black uppercase"><Link2 className="h-5 w-5 text-[#ed1c24]" /> Floating contact</CardTitle>
          <p className="mt-1 text-xs text-slate-500">Chỉnh URL thật cho Facebook, YouTube, Zalo, hotline hoặc thêm kênh mới. Thay đổi sẽ đồng bộ ra website.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={addAction} className="h-9 rounded-none text-[10px] font-black uppercase"><Plus className="mr-1.5 h-3.5 w-3.5" /> Thêm kênh</Button>
          <Button type="button" onClick={onSave} disabled={saving} className="h-9 rounded-none bg-[#ed1c24] text-[10px] font-black uppercase text-white hover:bg-[#c91218]"><Save className="mr-1.5 h-3.5 w-3.5" /> {saving ? "Đang lưu" : "Lưu floating"}</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {actions.length === 0 && <div className="border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Chưa có kênh floating. Hãy thêm một kênh.</div>}
        {actions.map((action, index) => (
          <div key={action.id || action.action_key || index} className="grid gap-3 border border-slate-200 p-3 dark:border-white/10 lg:grid-cols-[minmax(130px,1fr)_minmax(220px,2fr)_minmax(150px,1fr)_auto] lg:items-end">
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">Tên hiển thị</Label><Input value={action.label || ""} onChange={(event) => onChange(patchAt(actions, index, { label: event.target.value }))} className="h-9 rounded-none text-xs" placeholder="Facebook" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">URL / đích đến</Label><Input value={action.href || ""} disabled={action.action_type === "chatbot"} onChange={(event) => onChange(patchAt(actions, index, { href: event.target.value }))} className="h-9 rounded-none font-mono text-xs" placeholder="https://... / tel:... / mailto:..." /></div>
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">Loại hành động</Label><Select value={action.action_type || "link"} onValueChange={(value: FloatingAction["action_type"]) => onChange(patchAt(actions, index, { action_type: value, href: value === "chatbot" ? null : (action.href || "") }))}><SelectTrigger className="h-9 rounded-none text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="link"><span className="flex items-center gap-2"><Link2 className="h-3.5 w-3.5" /> Mở liên kết</span></SelectItem><SelectItem value="chatbot"><span className="flex items-center gap-2"><Bot className="h-3.5 w-3.5" /> Mở chatbot</span></SelectItem></SelectContent></Select></div>
            <div className="flex items-center justify-between gap-2 lg:justify-end"><label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">Hiển thị <Switch checked={action.is_visible !== false} onCheckedChange={(checked) => onChange(patchAt(actions, index, { is_visible: checked }))} /></label><Button type="button" variant="outline" size="icon" disabled={index === 0} onClick={() => move(index, -1)} className="h-9 w-9 rounded-none"><ArrowUp className="h-3.5 w-3.5" /></Button><Button type="button" variant="outline" size="icon" disabled={index === actions.length - 1} onClick={() => move(index, 1)} className="h-9 w-9 rounded-none"><ArrowDown className="h-3.5 w-3.5" /></Button><Button type="button" variant="outline" size="icon" onClick={() => removeAction(index)} className="h-9 w-9 rounded-none text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button></div>
            <div className="grid gap-3 border-t border-slate-100 pt-3 dark:border-white/5 lg:col-span-4 lg:grid-cols-[minmax(0,1fr)_180px]">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Logo / icon kênh</Label>
                <div className="flex gap-2">
                  <Input value={action.icon_url || ""} onChange={(event) => onChange(patchAt(actions, index, { icon_url: event.target.value }))} className="h-9 rounded-none font-mono text-xs" placeholder="URL logo hoặc để trống dùng icon tự nhận diện" />
                  <label className="inline-flex h-9 shrink-0 cursor-pointer items-center border border-slate-200 px-3 text-[10px] font-black uppercase text-slate-700 hover:border-[#ed1c24] dark:border-white/10 dark:text-slate-200">
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadIcon(index, file); event.currentTarget.value = "" }} />
                    {uploadingIndex === index ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />} Tải logo
                  </label>
                </div>
                <p className="text-[10px] text-slate-400">PNG/SVG/WebP, lưu cùng cấu hình và đồng bộ realtime.</p>
              </div>
              <div className="border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-slate-950">
                <div className="flex h-20 items-center justify-center overflow-hidden bg-white dark:bg-slate-900">
                  {action.icon_url ? <img src={action.icon_url} alt="" className="h-full w-full object-contain" style={{ objectPosition: `${styleOf(action).icon_position_x ?? 50}% ${styleOf(action).icon_position_y ?? 50}%`, transform: `scale(${(styleOf(action).icon_scale ?? 100) / 100})` }} /> : <ImageIcon className="h-6 w-6 text-slate-300" />}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-[9px] font-bold text-slate-500">
                  {([['X', 'icon_position_x'], ['Y', 'icon_position_y'], ['Zoom', 'icon_scale']] as const).map(([label, key]) => <label key={key}>{label}<input type="number" min={key === 'icon_scale' ? 50 : 0} max={key === 'icon_scale' ? 200 : 100} value={Number(styleOf(action)[key] ?? (key === 'icon_scale' ? 100 : 50))} onChange={(event) => onChange(patchAt(actions, index, { style: { ...styleOf(action), [key]: Number(event.target.value) } }))} className="mt-0.5 h-6 w-full border border-slate-200 bg-white px-1 text-[10px] dark:border-white/10 dark:bg-slate-900" /></label>)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
