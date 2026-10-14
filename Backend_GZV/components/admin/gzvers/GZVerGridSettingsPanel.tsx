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
type Device = "mobile" | "tablet" | "desktop"
type DeviceColumns = Record<Device, number>
type GridSettings = { grid_columns_mode: LayoutMode; columns: DeviceColumns; tab_columns: Record<string, DeviceColumns> }

const DEFAULT_COLUMNS: DeviceColumns = { mobile: 1, tablet: 2, desktop: 3 }
const DEFAULT_SETTINGS: GridSettings = { grid_columns_mode: "shared", columns: DEFAULT_COLUMNS, tab_columns: { all: DEFAULT_COLUMNS } }
const normalizeColumns = (value: unknown, fallback = 3) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(6, Math.max(1, Math.round(parsed))) : fallback
}

function ColumnsSelect({ value, onChange, max = 6 }: { value: number; onChange: (value: number) => void; max?: number }) {
  return <Select value={String(Math.min(max, normalizeColumns(value)))} onValueChange={(next) => onChange(normalizeColumns(next))}>
    <SelectTrigger className="h-10 rounded-none bg-white text-xs font-bold dark:bg-slate-950"><SelectValue /></SelectTrigger>
    <SelectContent>{Array.from({ length: max }, (_, index) => index + 1).map((count) => <SelectItem key={count} value={String(count)}>{count} người / hàng</SelectItem>)}</SelectContent>
  </Select>
}

function DeviceFields({ value, onChange }: { value: DeviceColumns; onChange: (device: Device, value: number) => void }) {
  return <div className="grid gap-3 sm:grid-cols-3">
    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">Điện thoại</Label><ColumnsSelect max={2} value={value.mobile} onChange={(next) => onChange("mobile", next)} /></div>
    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">Máy tính bảng</Label><ColumnsSelect max={4} value={value.tablet} onChange={(next) => onChange("tablet", next)} /></div>
    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-slate-500">Máy tính</Label><ColumnsSelect value={value.desktop} onChange={(next) => onChange("desktop", next)} /></div>
  </div>
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
      const columns: DeviceColumns = { mobile: normalizeColumns(props.columns_per_row_mobile, 1), tablet: normalizeColumns(props.columns_per_row_tablet, 2), desktop: normalizeColumns(props.columns_per_row, 3) }
      const responsive = props.tab_columns_responsive && typeof props.tab_columns_responsive === "object" ? props.tab_columns_responsive : {}
      const keys = ["all", ...departments.map((item) => item.slug || item.id || item.name)]
      setBlockId(data?.id || null)
      setSettings({
        grid_columns_mode: props.grid_columns_mode === "per_tab" ? "per_tab" : "shared",
        columns,
        tab_columns: Object.fromEntries(keys.map((key) => [key, {
          mobile: normalizeColumns(responsive[key]?.mobile, columns.mobile), tablet: normalizeColumns(responsive[key]?.tablet, columns.tablet), desktop: normalizeColumns(responsive[key]?.desktop ?? props.tab_columns?.[key], columns.desktop),
        }])),
      })
    }
    setLoading(false)
  }, [departments])

  useEffect(() => { void loadSettings() }, [loadSettings])

  const save = async () => {
    if (!blockId) return void toast.error("Không tìm thấy block danh sách GZVer của trang /gzver")
    setSaving(true)
    try {
      const { data: current, error: readError } = await supabase.from("site_page_blocks").select("props").eq("id", blockId).single()
      if (readError) throw readError
      const desktopTabs = Object.fromEntries(Object.entries(settings.tab_columns).map(([key, value]) => [key, value.desktop]))
      const nextProps = { ...((current?.props || {}) as Record<string, any>), grid_columns_mode: settings.grid_columns_mode, columns_per_row: settings.columns.desktop, columns_per_row_tablet: settings.columns.tablet, columns_per_row_mobile: settings.columns.mobile, tab_columns: desktopTabs, tab_columns_responsive: settings.tab_columns }
      const { error } = await supabase.from("site_page_blocks").update({ props: nextProps }).eq("id", blockId)
      if (error) throw error
      toast.success("Đã cập nhật lưới GZVer cho mobile, tablet và desktop")
    } catch (error: any) { toast.error(error.message || "Không lưu được cấu hình hiển thị") }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center border border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-slate-900"><Loader2 className="h-6 w-6 animate-spin text-[#ed1c24]" /></div>
  const activeDepartments = departments.filter((department) => department.is_active !== false)
  const updateShared = (device: Device, value: number) => setSettings((current) => ({ ...current, columns: { ...current.columns, [device]: value } }))
  const updateTab = (key: string, device: Device, value: number) => setSettings((current) => ({ ...current, tab_columns: { ...current.tab_columns, [key]: { ...(current.tab_columns[key] || current.columns), [device]: value } } }))

  return <div className="space-y-5 border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900">
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center bg-[#ed1c24] text-white"><LayoutGrid className="h-5 w-5" /></span><div><h3 className="text-sm font-black uppercase text-slate-950 dark:text-white">Số người trên một hàng</h3><p className="mt-0.5 text-xs text-slate-500">Thiết lập responsive trực tiếp cho trang /gzver.</p></div></div><Button onClick={save} disabled={saving || !blockId} className="h-10 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Lưu hiển thị</Button></div>
    <div className="grid gap-3 sm:grid-cols-2">{(["shared", "per_tab"] as LayoutMode[]).map((mode) => <button key={mode} type="button" onClick={() => setSettings((current) => ({ ...current, grid_columns_mode: mode }))} className={`border p-4 text-left transition ${settings.grid_columns_mode === mode ? "border-[#ed1c24] bg-red-50/60 dark:bg-red-950/20" : "border-slate-200 hover:border-slate-400 dark:border-white/10"}`}><p className="text-xs font-black uppercase text-slate-950 dark:text-white">{mode === "shared" ? "Dùng chung toàn bộ tab" : "Thiết lập riêng từng tab"}</p><p className="mt-1 text-[11px] text-slate-500">{mode === "shared" ? "Một cấu hình responsive cho mọi tab." : "Mỗi ban có cấu hình mobile, tablet và desktop riêng."}</p></button>)}</div>
    {settings.grid_columns_mode === "shared" ? <DeviceFields value={settings.columns} onChange={updateShared} /> : <div className="grid gap-3 xl:grid-cols-2"><div className="space-y-3 border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950"><Label className="text-[10px] font-black uppercase">Tab Tất cả</Label><DeviceFields value={settings.tab_columns.all || settings.columns} onChange={(device, value) => updateTab("all", device, value)} /></div>{activeDepartments.map((department) => { const key = department.slug || department.id || department.name; return <div key={key} className="space-y-3 border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950"><Label className="block truncate text-[10px] font-black uppercase">{department.name}</Label><DeviceFields value={settings.tab_columns[key] || settings.columns} onChange={(device, value) => updateTab(key, device, value)} /></div> })}</div>}
    <p className="border-l-2 border-[#ed1c24] pl-3 text-[11px] leading-relaxed text-slate-500">Mobile hỗ trợ 1–2 cột, tablet 1–4 cột và desktop 1–6 cột để giữ card dễ đọc.</p>
  </div>
}
