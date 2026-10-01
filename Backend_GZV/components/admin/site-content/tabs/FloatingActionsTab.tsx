import React from "react"
import { ArrowDown, ArrowUp, Bot, Link2, Plus, Save, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { FloatingAction } from "@/components/admin/site-content/types"

type Props = { actions: FloatingAction[]; onChange: (actions: FloatingAction[]) => void; onSave: () => void; saving?: boolean }
const patchAt = (actions: FloatingAction[], index: number, patch: Partial<FloatingAction>) => actions.map((action, itemIndex) => itemIndex === index ? { ...action, ...patch } : action)

export function FloatingActionsTab({ actions, onChange, onSave, saving = false }: Props) {
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
            <div className="space-y-1 lg:col-span-3"><Label className="text-[10px] font-black uppercase text-slate-500">Icon URL (tuỳ chọn)</Label><Input value={action.icon_url || ""} onChange={(event) => onChange(patchAt(actions, index, { icon_url: event.target.value }))} className="h-9 rounded-none font-mono text-xs" placeholder="https://.../icon.svg hoặc để trống dùng icon tự nhận diện" /></div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
