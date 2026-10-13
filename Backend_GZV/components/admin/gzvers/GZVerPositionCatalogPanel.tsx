"use client"

import { useEffect, useState } from "react"
import { BriefcaseBusiness, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { GZVerPosition } from "./PositionPicker"

export function GZVerPositionCatalogPanel({ positions, onRefresh }: { positions: GZVerPosition[]; onRefresh: () => Promise<void> | void }) {
  const [items, setItems] = useState(positions)
  const [saving, setSaving] = useState(false)
  useEffect(() => setItems(positions), [positions])
  const add = () => setItems((current) => [...current, { name: "", sort_order: (current.length + 1) * 10, is_active: true }])
  const update = (index: number, patch: Partial<GZVerPosition>) => setItems((current) => current.map((item, i) => i === index ? { ...item, ...patch } : item))
  const remove = async (index: number) => {
    const item = items[index]
    if (item.id && !window.confirm(`Xóa chức danh “${item.name}”? Hồ sơ hiện có vẫn giữ nguyên tên chức danh.`)) return
    if (item.id) { const { error } = await supabase.from("gzver_positions").delete().eq("id", item.id); if (error) return void toast.error(error.message) }
    setItems((current) => current.filter((_, i) => i !== index)); await onRefresh()
  }
  const save = async () => {
    const rows = items.map((item, index) => ({ ...(item.id ? { id: item.id } : {}), name: item.name.trim(), sort_order: (index + 1) * 10, is_active: item.is_active !== false })).filter((item) => item.name)
    setSaving(true)
    const existing = rows.filter((row) => row.id)
    const additions = rows.filter((row) => !row.id).map(({ id: _id, ...row }) => row)
    const results = await Promise.all([
      ...existing.map(({ id, ...row }) => supabase.from("gzver_positions").update(row).eq("id", id)),
      ...(additions.length ? [supabase.from("gzver_positions").insert(additions)] : []),
    ])
    const error = results.find((result) => result.error)?.error
    setSaving(false)
    if (error) toast.error(error.message); else { toast.success("Đã cập nhật danh mục chức danh"); await onRefresh() }
  }
  return <div className="space-y-4 border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center bg-[#ed1c24] text-white"><BriefcaseBusiness className="h-5 w-5" /></span><div><h3 className="text-sm font-black uppercase">Danh mục chức danh</h3><p className="text-xs text-slate-500">Danh sách chọn nhanh khi tạo hoặc chỉnh sửa GZVer.</p></div></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={add} className="rounded-none"><Plus className="mr-2 h-4 w-4" />Thêm</Button><Button type="button" onClick={save} disabled={saving} className="rounded-none bg-[#ed1c24] text-white"><Save className="mr-2 h-4 w-4" />Lưu danh mục</Button></div></div>
    <div className="space-y-2">{items.map((item, index) => <div key={item.id || `new-${index}`} className="grid grid-cols-[minmax(0,1fr)_80px_42px] items-center gap-2 border border-slate-200 p-2 dark:border-white/10"><Input value={item.name} onChange={(e) => update(index, { name: e.target.value })} placeholder="VD: Trưởng ban Marketing" className="h-9 rounded-none" /><div className="flex items-center justify-center gap-2"><Switch checked={item.is_active !== false} onCheckedChange={(is_active) => update(index, { is_active })} /><span className="text-[9px] font-bold uppercase text-slate-500">{item.is_active !== false ? "Bật" : "Tắt"}</span></div><Button type="button" variant="ghost" size="icon" onClick={() => void remove(index)} className="rounded-none text-red-600"><Trash2 className="h-4 w-4" /></Button></div>)}</div>
  </div>
}
