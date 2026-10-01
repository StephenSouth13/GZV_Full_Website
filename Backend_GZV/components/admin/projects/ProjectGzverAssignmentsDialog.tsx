"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Users, Loader2, Check, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

type Props = { project: any; open: boolean; onClose: () => void; onSaved: () => void }
type GzverOption = { id: string; full_name: string; slug: string; linked_author_id: string | null; avatar_url: string | null; position: string | null; is_active: boolean }

export function ProjectGzverAssignmentsDialog({ project, open, onClose, onSaved }: Props) {
  const [people, setPeople] = useState<GzverOption[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open || !project) return
    let active = true
    setLoading(true)
    setError("")
    setSelectedIds([])
    const load = async () => {
      try {
        const rows: GzverOption[] = []
        for (let from = 0; ; from += 1000) {
          const { data, error: queryError } = await supabase
            .from("gzvers")
            .select("id,full_name,slug,linked_author_id,avatar_url,position,is_active")
            .order("full_name", { ascending: true })
            .range(from, from + 999)
          if (queryError) throw queryError
          rows.push(...((data || []) as GzverOption[]))
          if (!data || data.length < 1000) break
        }
        if (!active) return
        setPeople(rows)
        const linked = new Set(rows.map((person) => person.linked_author_id).filter(Boolean))
        const existing = (project.author_ids || []) as string[]
        setSelectedIds(rows.filter((person) => person.linked_author_id && existing.includes(person.linked_author_id)).map((person) => person.id))
        const legacyLinks = existing.filter((id) => !linked.has(id))
        if (legacyLinks.length) setError(`${legacyLinks.length} tác giả/mentor đang được gán vẫn được giữ nguyên.`)
      } catch (e: any) {
        if (active) setError(e.message || "Không tải được danh sách GZVer.")
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [open, project])

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi")
    return people.filter((person) => !query || `${person.full_name} ${person.position || ""} ${person.slug}`.toLocaleLowerCase("vi").includes(query))
  }, [people, search])

  const toggle = (id: string, checked: boolean) => setSelectedIds((current) => checked ? [...new Set([...current, id])] : current.filter((item) => item !== id))

  const save = async () => {
    setSaving(true)
    try {
      const selectedPeople = people.filter((person) => selectedIds.includes(person.id))
      const selectedAuthorIds = selectedPeople.map((person) => person.linked_author_id).filter(Boolean) as string[]
      const allGzverAuthorIds = new Set(people.map((person) => person.linked_author_id).filter(Boolean))
      const preservedIds = ((project.author_ids || []) as string[]).filter((id) => !allGzverAuthorIds.has(id))
      const { error: updateError } = await supabase.from("projects").update({ author_ids: [...new Set([...preservedIds, ...selectedAuthorIds])] }).eq("id", project.id)
      if (updateError) throw updateError
      toast({ title: "Đã cập nhật đội ngũ dự án", description: `${selectedPeople.length} GZVer được gán vào ${project.title}.` })
      onSaved()
      onClose()
    } catch (e: any) {
      toast({ title: "Không thể cập nhật GZVer", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-1rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-none p-0 sm:w-full">
        <DialogHeader className="border-b border-slate-200 p-5 pr-12 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-[#ed1c24] text-white"><Users className="h-5 w-5" /></span>
            <div className="min-w-0"><DialogTitle className="text-left text-base font-black uppercase">GZVer tham gia dự án</DialogTitle><DialogDescription className="mt-1 line-clamp-1 text-left">{project?.title}</DialogDescription></div>
          </div>
        </DialogHeader>
        <div className="border-b border-slate-200 p-4 dark:border-white/10">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, chức danh..." className="h-10 rounded-none pl-9" /></div>
          <div className="mt-3 flex items-center justify-between text-xs"><span className="font-bold text-slate-500">Đã chọn <strong className="text-[#ed1c24]">{selectedIds.length}</strong> / {people.length}</span><button type="button" className="font-bold text-[#ed1c24] hover:underline" onClick={() => setSelectedIds(filteredPeople.filter((person) => person.linked_author_id).map((person) => person.id))}>Chọn toàn bộ kết quả</button></div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {loading ? <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-[#ed1c24]" /></div> : error && people.length === 0 ? <p role="alert" className="p-8 text-center text-sm text-red-600">{error}</p> : filteredPeople.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">Không tìm thấy GZVer phù hợp.</p> : (
            <div className="space-y-1">
              {filteredPeople.map((person) => {
                const checked = selectedIds.includes(person.id)
                return <label key={person.id} className={`flex items-center gap-3 border p-3 transition ${!person.linked_author_id ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[#ed1c24]"} ${checked ? "border-[#ed1c24] bg-red-50/60 dark:bg-red-950/20" : "border-slate-200 dark:border-white/10"}`}>
                  <Checkbox checked={checked} disabled={!person.linked_author_id} onCheckedChange={(value) => toggle(person.id, value === true)} />
                  {person.avatar_url ? <img src={person.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-black text-slate-500 dark:bg-slate-800">{person.full_name?.[0] || "G"}</span>}
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{person.full_name}</span><span className="block truncate text-xs text-slate-500">{person.position || person.slug}{!person.linked_author_id && " · Chưa liên kết hồ sơ tác giả"}</span></span>
                  {checked && <Check className="h-4 w-4 text-[#ed1c24]" />}
                </label>
              })}
            </div>
          )}
          {error && people.length > 0 && <p className="mt-3 border-l-2 border-amber-500 bg-amber-50 p-2 text-xs text-amber-800">{error}</p>}
        </div>
        <DialogFooter className="border-t border-slate-200 p-4 dark:border-white/10">
          <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-none">Hủy</Button>
          <Button onClick={save} disabled={loading || saving || !!(error && people.length === 0)} className="rounded-none bg-[#ed1c24] font-bold text-white hover:bg-red-700"><Save className="mr-2 h-4 w-4" />{saving ? "Đang lưu..." : "Lưu đội ngũ"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
