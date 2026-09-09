import type React from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon } from "lucide-react"

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}

export function SwitchLine({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3 rounded-lg border p-3"><Label>{label}</Label><Switch checked={checked} onCheckedChange={onChange} /></div>
}

export function ListCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card className="rounded-none border-slate-200 dark:border-white/10"><CardHeader><CardTitle className="text-base font-black uppercase">{title}</CardTitle></CardHeader><CardContent className="space-y-2">{children}</CardContent></Card>
}

export function ControlStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

export function PickerInput({ value, onChange, onPick }: { value: string; onChange: (value: string) => void; onPick: () => void }) {
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-none" />
      <Button type="button" variant="outline" onClick={onPick} className="rounded-none"><ImageIcon className="h-4 w-4" /></Button>
    </div>
  )
}
