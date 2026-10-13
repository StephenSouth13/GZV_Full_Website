"use client"

import { Input } from "@/components/ui/input"

export type GZVerPosition = { id?: string; name: string; sort_order?: number; is_active?: boolean }

export function PositionPicker({ value, onChange, positions, id }: { value: string; onChange: (value: string) => void; positions: GZVerPosition[]; id: string }) {
  const active = positions.filter((item) => item.is_active !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  return (
    <div className="space-y-2">
      <Input list={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Chọn hoặc nhập chức danh…" className="h-11 rounded-none border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white" />
      <datalist id={id}>{active.map((item) => <option key={item.id || item.name} value={item.name} />)}</datalist>
      {active.length > 0 && <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1">{active.slice(0, 10).map((item) => <button key={item.id || item.name} type="button" onClick={() => onChange(item.name)} className={`shrink-0 border px-2 py-1 text-[10px] font-bold ${value === item.name ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"}`}>{item.name}</button>)}</div>}
    </div>
  )
}
