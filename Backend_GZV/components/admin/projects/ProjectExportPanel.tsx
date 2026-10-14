"use client"

import { useEffect, useMemo, useState } from "react"
import { Archive, FileSpreadsheet, Loader2, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addRemoteAssetsToZip, appendWorksheet, collectAssetUrls, downloadBackupBlob, safeBackupName } from "@/lib/backup-export"

type Format = "xlsx" | "csv" | "json" | "zip"
const today = () => new Date().toISOString().slice(0, 10)
const cell = (value: unknown) => value && typeof value === "object" ? JSON.stringify(value) : value ?? ""

export function ProjectExportPanel() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(["*"]))
  const [format, setFormat] = useState<Format>("xlsx")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    void (async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) { if (active) { setAllowed(false); setLoading(false) }; return }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle()
      const canExport = profile?.role === "admin" || profile?.role === "collab"
      if (!active) return
      setAllowed(canExport)
      if (!canExport) { setLoading(false); return }
      const rows: any[] = []
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase.from("projects").select("*").order("order_index", { ascending: true }).range(from, from + 999)
        if (error) throw error
        rows.push(...(data || []))
        if (!data || data.length < 1000) break
      }
      if (active) { setProjects(rows); setSelected(new Set(rows.map((item) => item.id))); setLoading(false) }
    })().catch((error) => { toast.error(error.message); if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const chosen = useMemo(() => projects.filter((project) => selected.has(project.id)), [projects, selected])
  const fields = useMemo(() => [...new Set(projects.flatMap((project) => Object.keys(project)))], [projects])
  const exportedFields = useMemo(() => selectedFields.has("*") ? fields : fields.filter((field) => selectedFields.has(field)), [fields, selectedFields])
  const rowsFor = (rows: any[]) => rows.map((row) => Object.fromEntries(exportedFields.map((field) => [field, cell(row[field])])))

  const loadRelatedData = async () => {
    const authorIds = [...new Set(chosen.flatMap((project) => project.author_ids || []))]
    const mentorIds = [...new Set(chosen.flatMap((project) => project.mentor_ids || []))]
    const projectIds = chosen.map((project) => project.id)
    const [authors, mentors, gzvers, highlights] = await Promise.all([
      authorIds.length ? supabase.from("authors").select("*").in("id", authorIds) : Promise.resolve({ data: [], error: null } as any),
      mentorIds.length ? supabase.from("mentors").select("*").in("id", mentorIds) : Promise.resolve({ data: [], error: null } as any),
      supabase.from("gzvers").select("*").order("full_name"),
      projectIds.length ? supabase.from("gzver_project_highlights").select("*").in("project_id", projectIds) : Promise.resolve({ data: [], error: null } as any),
    ])
    for (const result of [authors, mentors, gzvers, highlights]) if (result.error) throw result.error
    const relatedGzvers = (gzvers.data || []).filter((person: any) => chosen.some((project) => (project.author_ids || []).includes(person.id) || (person.linked_author_id && (project.author_ids || []).includes(person.linked_author_id))) || (highlights.data || []).some((item: any) => item.gzver_id === person.id))
    return { projects: chosen, authors: authors.data || [], mentors: mentors.data || [], gzvers: relatedGzvers, highlights: highlights.data || [] }
  }

  const workbook = async (data: Awaited<ReturnType<typeof loadRelatedData>>) => {
    const XLSX = await import("xlsx"); const book = XLSX.utils.book_new(); const rows = rowsFor(data.projects)
    await appendWorksheet(book, "Tất cả dự án", rows)
    for (const category of [...new Set(data.projects.map((item) => item.category || "Chưa phân loại"))]) await appendWorksheet(book, `DM-${category}`, rowsFor(data.projects.filter((item) => (item.category || "Chưa phân loại") === category)))
    await appendWorksheet(book, "Tác giả liên quan", data.authors); await appendWorksheet(book, "Mentor liên quan", data.mentors); await appendWorksheet(book, "GZVer liên quan", data.gzvers); await appendWorksheet(book, "Đóng góp GZVer", data.highlights)
    return new Blob([XLSX.write(book, { type: "array", bookType: "xlsx" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  }

  const runExport = async () => {
    setBusy(true)
    try {
      const data = await loadRelatedData(); const rows = rowsFor(data.projects)
      if (format === "xlsx") downloadBackupBlob(await workbook(data), `du-an-${today()}.xlsx`)
      else if (format === "json") downloadBackupBlob(new Blob([JSON.stringify(rows, null, 2)], { type: "application/json;charset=utf-8" }), `du-an-${today()}.json`)
      else if (format === "csv") { const XLSX = await import("xlsx"); const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(rows)); downloadBackupBlob(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), `du-an-${today()}.csv`) }
      else {
        const [{ default: JSZip }, xlsx] = await Promise.all([import("jszip"), workbook(data)]); const zip = new JSZip()
        zip.file("du-an.xlsx", xlsx); zip.file("data/du-an-day-du.json", JSON.stringify(data.projects, null, 2)); zip.file("data/tac-gia.json", JSON.stringify(data.authors, null, 2)); zip.file("data/mentor.json", JSON.stringify(data.mentors, null, 2)); zip.file("data/gzver.json", JSON.stringify(data.gzvers, null, 2)); zip.file("data/dong-gop.json", JSON.stringify(data.highlights, null, 2))
        zip.file("README.txt", `GZV PROJECT BACKUP\nNgày xuất: ${new Date().toISOString()}\nSố hàng: ${data.projects.length}\nSố cột Excel: ${exportedFields.length}\nZIP luôn giữ JSON raw đầy đủ mọi trường và ảnh.`)
        const assets: { folder: string; url: string; label: string }[] = []
        const addGroup = (records: any[], root: string, folderName: (row: any) => string) => records.forEach((row) => collectAssetUrls(row).forEach((url, index) => assets.push({ folder: `${root}/${safeBackupName(folderName(row))}`, url, label: `image-${index + 1}` })))
        addGroup(data.projects, "images/du-an", (row) => `${row.category || "chua-phan-loai"}/${row.slug || row.id}`); addGroup(data.authors, "images/tac-gia", (row) => row.slug || row.id); addGroup(data.mentors, "images/mentor", (row) => row.slug || row.id); addGroup(data.gzvers, "images/gzver", (row) => row.slug || row.id); addGroup(data.highlights, "images/dong-gop", (row) => `${row.project_id}/${row.gzver_id}`)
        const failures = await addRemoteAssetsToZip(zip, assets); if (failures.length) zip.file("images-khong-tai-duoc.txt", failures.join("\n"))
        downloadBackupBlob(await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }), `du-an-full-backup-${today()}.zip`)
      }
      toast.success(`Đã chuẩn bị ${chosen.length} hàng × ${exportedFields.length} cột`)
    } catch (error: any) { toast.error(error.message) } finally { setBusy(false) }
  }

  if (loading || allowed === null) return <div className="border border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-slate-900"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#ed1c24]" /></div>
  if (!allowed) return <div className="flex items-center gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><ShieldAlert className="h-5 w-5" />Xuất dữ liệu dự án dành cho Admin và Collab.</div>
  return <div className="space-y-5 border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
    <div><h3 className="text-sm font-black uppercase">Xuất dữ liệu chuyên sâu</h3><p className="mt-1 text-xs text-slate-500">Chọn chính xác hàng, cột và định dạng. ZIP chứa thêm dữ liệu raw đầy đủ cùng hình ảnh.</p></div>
    <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setSelected(new Set(projects.map((item) => item.id)))} className="rounded-none">Chọn tất cả hàng</Button><Button variant="outline" onClick={() => setSelected(new Set())} className="rounded-none">Bỏ chọn</Button><b className="self-center text-xs text-[#ed1c24]">{chosen.length}/{projects.length} hàng</b></div>
    <div className="grid max-h-56 gap-2 overflow-y-auto border p-3 sm:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <label key={project.id} className="flex items-center gap-2 border p-2 text-xs"><Switch checked={selected.has(project.id)} onCheckedChange={(checked) => setSelected((current) => { const next = new Set(current); checked ? next.add(project.id) : next.delete(project.id); return next })} /><span className="min-w-0"><b className="block truncate">{project.title}</b><span className="text-slate-500">{project.category || "Chưa phân loại"}</span></span></label>)}</div>
    <div className="space-y-2 border p-3"><div className="flex flex-wrap justify-between gap-2"><b className="text-xs uppercase">Chọn cột ({exportedFields.length}/{fields.length})</b><div className="flex gap-3"><button onClick={() => setSelectedFields(new Set(["*"]))} className="text-xs font-bold text-[#ed1c24]">Tất cả</button><button onClick={() => setSelectedFields(new Set())} className="text-xs font-bold text-slate-500">Bỏ chọn</button></div></div><div className="grid max-h-44 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-4">{fields.map((field) => <label key={field} className="flex items-center gap-2 p-1 text-xs"><input type="checkbox" checked={selectedFields.has("*") || selectedFields.has(field)} onChange={(event) => setSelectedFields((current) => { const next = current.has("*") ? new Set(fields) : new Set(current); event.target.checked ? next.add(field) : next.delete(field); return next })} />{field}</label>)}</div></div>
    <div className="grid gap-3 sm:grid-cols-[220px_1fr]"><Select value={format} onValueChange={(value) => setFormat(value as Format)}><SelectTrigger className="h-12 rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="xlsx">Excel (.xlsx)</SelectItem><SelectItem value="csv">CSV (.csv)</SelectItem><SelectItem value="json">JSON (.json)</SelectItem><SelectItem value="zip">ZIP + dữ liệu + ảnh</SelectItem></SelectContent></Select><Button disabled={!chosen.length || !exportedFields.length || busy} onClick={() => void runExport()} className="h-12 rounded-none bg-slate-900 text-white hover:bg-black">{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : format === "zip" ? <Archive className="mr-2 h-4 w-4" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}Xuất {format.toUpperCase()} · {chosen.length} hàng × {exportedFields.length} cột</Button></div>
  </div>
}
