"use client"

import { useCallback, useEffect, useState } from "react"
import { LayoutGrid, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Department = { id?: string; name: string; slug: string; is_active: boolean }
type LayoutMode = "shared" | "per_tab"
type GridSettings = { grid_columns_mode: LayoutMode; columns_per_row: number; tab_columns: Record<string, number> }

const DEFAULT_SETTINGS: GridSettings = { grid_columns_mode: "shared", columns_per_row: 3, tab_columns: { all: 3 } }
const normalizeColumns = (value: unknown, fallback = 3) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(6, Math.max(1, Math.round(parsed))) : fallback
}

function ColumnsSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <Select value={String(normalizeColumns(value))} onValueChange={(next) => onChange(normalizeColumns(next))}>
      <SelectTrigger className="h-10 rounded-none bg-white text-xs font-bold dark:bg-slate-950"><SelectValue /></SelectTrigger>
      <SelectContent>{[1, 2, 3, 4, 5, 6].map((count) => <SelectItem key={count} value={String(count)}>{count} người / hàng</SelectItem>)}</SelectContent>
    </Select>
  )
}

export function GZVerGridSettingsPanel({ departments }: { departments: Department[] }) {
  const [settings, setSettings] = useState<GridSettings>(DEFAULT_SETTINGS)
  const [blockId, setBlockId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from("site_page_blocks").select("id, props").eq("page_slug", "gzver").eq("component_type", "gzvers_grid").order("sort_order", { ascending: true }).limit(1).maybeSingle()
    if (error) toast.error(error.message || "Không tải được cấu hình hiển thị /gzver")
    else {
      const props = (data?.props || {}) as Record<string, any>
      setBlockId(data?.id || null)
      setSettings({
        grid_columns_mode: props.grid_columns_mode === "per_tab" ? "per_tab" : "shared",
        columns_per_row: normalizeColumns(props.columns_per_row),
        tab_columns: typeof props.tab_columns === "object" && props.tab_columns
          ? Object.fromEntries(Object.entries(props.tab_columns).map(([key, value]) => [key, normalizeColumns(value)]))
          : { all: normalizeColumns(props.columns_per_row) },
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => { void loadSettings() }, [loadSettings])

  const save = async () => {
    if (!blockId) return void toast.error("Không tìm thấy block danh sách GZVers của trang /gzver")
    setSaving(true)
    try {
      const { data: current, error: readError } = await supabase.from("site_page_blocks").select("props").eq("id", blockId).single()
      if (readError) throw readError
      const nextProps = { ...((current?.props || {}) as Record<string, any>), grid_columns_mode: settings.grid_columns_mode, columns_per_row: normalizeColumns(settings.columns_per_row), tab_columns: settings.tab_columns }
      const { error } = await supabase.from("site_page_blocks").update({ props: nextProps }).eq("id", blockId)
      if (error) throw error
      toast.success("Đã cập nhật số người trên mỗi hàng tại /gzver")
    } catch (error: any) { toast.error(error.message || "Không lưu được cấu hình hiển thị") }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center border border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-slate-900"><Loader2 className="h-6 w-6 animate-spin text-[#ed1c24]" /></div>

  const activeDepartments = departments.filter((department) => department.is_active !== false)
  const updateTab = (key: string, value: number) => setSettings((current) => ({ ...current, tab_columns: { ...current.tab_columns, [key]: value } }))

  return (
    <div className="space-y-5 border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center bg-[#ed1c24] text-white"><LayoutGrid className="h-5 w-5" /></span><div><h3 className="text-sm font-black uppercase text-slate-950 dark:text-white">Số lượng người trên một hàng</h3><p className="mt-0.5 text-xs text-slate-500">Áp dụng trực tiếp cho danh sách tại trang /gzver.</p></div></div>
        <Button onClick={save} disabled={saving || !blockId} className="h-10 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Lưu hiển thị</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["shared", "per_tab"] as LayoutMode[]).map((mode) => <button key={mode} type="button" onClick={() => setSettings((current) => ({ ...current, grid_columns_mode: mode }))} className={`border p-4 text-left transition ${settings.grid_columns_mode === mode ? "border-[#ed1c24] bg-red-50/60 dark:bg-red-950/20" : "border-slate-200 hover:border-slate-400 dark:border-white/10"}`}><p className="text-xs font-black uppercase text-slate-950 dark:text-white">{mode === "shared" ? "Dùng chung toàn bộ tab" : "Thiết lập riêng từng tab"}</p><p className="mt-1 text-[11px] leading-relaxed text-slate-500">{mode === "shared" ? "Mọi tab sử dụng cùng một số người trên hàng." : "Tab Tất cả và mỗi ban có thể có số cột khác nhau."}</p></button>)}
      </div>
      {settings.grid_columns_mode === "shared" ? <div className="max-w-sm space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Áp dụng cho toàn bộ tab</Label><ColumnsSelect value={settings.columns_per_row} onChange={(columns_per_row) => setSettings((current) => ({ ...current, columns_per_row }))} /></div> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5 border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950"><Label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Tab Tất cả</Label><ColumnsSelect value={settings.tab_columns.all ?? settings.columns_per_row} onChange={(value) => updateTab("all", value)} /></div>
          {activeDepartments.map((department) => { const key = department.slug || department.id || department.name; return <div key={key} className="space-y-1.5 border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950"><Label className="block truncate text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">{department.name}</Label><ColumnsSelect value={settings.tab_columns[key] ?? settings.columns_per_row} onChange={(value) => updateTab(key, value)} /></div> })}
        </div>
      )}
      <p className="border-l-2 border-[#ed1c24] pl-3 text-[11px] leading-relaxed text-slate-500">Trên điện thoại danh sách luôn hiển thị 1 người/hàng; trên máy tính bảng tối đa 2 người/hàng để bảo đảm nội dung card dễ đọc.</p>
    </div>
  )
}
