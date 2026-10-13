"use client"

import { useEffect, useMemo, useState } from "react"
import { Archive, FileSpreadsheet, Loader2, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { addRemoteAssetsToZip, appendWorksheet, collectAssetUrls, downloadBackupBlob, safeBackupName } from "@/lib/backup-export"

const today = () => new Date().toISOString().slice(0, 10)
const textList = (value: unknown) => Array.isArray(value) ? value.join("\n") : String(value || "")

export function ProjectExportPanel() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<"excel" | "zip" | null>(null)

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
        if (error) { toast.error(error.message); break }
        rows.push(...(data || []))
        if (!data || data.length < 1000) break
      }
      if (active) { setProjects(rows); setSelected(new Set(rows.map((item) => item.id))); setLoading(false) }
    })()
    return () => { active = false }
  }, [])

  const chosen = useMemo(() => projects.filter((project) => selected.has(project.id)), [projects, selected])

  const loadData = async () => {
    const authorIds = new Set(chosen.flatMap((project) => project.author_ids || []))
    const mentorIds = new Set(chosen.flatMap((project) => project.mentor_ids || []))
    const projectIds = chosen.map((project) => project.id)
    const [{ data: authors, error: authorError }, { data: mentors, error: mentorError }, { data: gzvers, error: gzverError }, highlightResult] = await Promise.all([
      authorIds.size ? supabase.from("authors").select("*").in("id", [...authorIds]) : Promise.resolve({ data: [], error: null } as any),
      mentorIds.size ? supabase.from("mentors").select("*").in("id", [...mentorIds]) : Promise.resolve({ data: [], error: null } as any),
      supabase.from("gzvers").select("*").order("full_name", { ascending: true }),
      projectIds.length ? supabase.from("gzver_project_highlights").select("*").in("project_id", projectIds) : Promise.resolve({ data: [], error: null } as any),
    ])
    if (authorError) throw authorError; if (mentorError) throw mentorError; if (gzverError) throw gzverError; if (highlightResult.error) throw highlightResult.error
    const relatedGzvers = (gzvers || []).filter((person: any) => chosen.some((project) => (project.author_ids || []).includes(person.id) || (person.linked_author_id && (project.author_ids || []).includes(person.linked_author_id))) || (highlightResult.data || []).some((item: any) => item.gzver_id === person.id))
    return { projects: chosen, authors: authors || [], mentors: mentors || [], gzvers: relatedGzvers, highlights: highlightResult.data || [] }
  }

  const buildWorkbook = async (data: Awaited<ReturnType<typeof loadData>>) => {
    const XLSX = await import("xlsx")
    const workbook = XLSX.utils.book_new()
    const rows = data.projects.map((project) => ({
      ID: project.id, "Tên dự án": project.title, Slug: project.slug, "Danh mục": project.category, "Trạng thái": project.status,
      "Nổi bật": project.featured, "Mô tả ngắn": project.description, "Nội dung chi tiết (HTML)": project.detailproject,
      "Công nghệ": textList(project.tech_stack), Hashtags: project.hashtags, "Ảnh chính": project.image, "Ảnh thumbnail": project.thumbnail_url,
      "Thư viện ảnh": textList(project.gallery), Video: project.video_url, "Demo / liên kết": project.external_url || project.demo_url,
      "Tác giả IDs": textList(project.author_ids), "Mentor IDs": textList(project.mentor_ids), "SEO title": project.seo_title,
      "SEO keywords": project.seo_keywords, "Thứ tự": project.order_index, "Ngày tạo": project.created_at, "Cập nhật": project.updated_at,
    }))
    await appendWorksheet(workbook, "Tất cả dự án", rows)
    const categories = [...new Set(data.projects.map((item) => item.category || "Chưa phân loại"))]
    for (const category of categories) await appendWorksheet(workbook, `DM-${category}`, rows.filter((_, index) => (data.projects[index].category || "Chưa phân loại") === category))
    await appendWorksheet(workbook, "Tác giả", data.authors)
    await appendWorksheet(workbook, "Mentor", data.mentors)
    await appendWorksheet(workbook, "GZVer tham gia", data.gzvers)
    await appendWorksheet(workbook, "GZVer - Dự án", data.highlights)
    return new Blob([XLSX.write(workbook, { type: "array", bookType: "xlsx" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  }

  const exportExcel = async () => { setBusy("excel"); try { downloadBackupBlob(await buildWorkbook(await loadData()), `du-an-backup-${today()}.xlsx`) } catch (error: any) { toast.error(error.message) } finally { setBusy(null) } }
  const exportZip = async () => {
    setBusy("zip")
    try {
      const data = await loadData()
      const [{ default: JSZip }, workbook] = await Promise.all([import("jszip"), buildWorkbook(data)])
      const zip = new JSZip()
      zip.file("du-an.xlsx", workbook)
      zip.file("data/du-an.json", JSON.stringify(data.projects, null, 2))
      zip.file("data/tac-gia.json", JSON.stringify(data.authors, null, 2))
      zip.file("data/mentor.json", JSON.stringify(data.mentors, null, 2))
      zip.file("data/gzver-tham-gia.json", JSON.stringify(data.gzvers, null, 2))
      zip.file("data/gzver-du-an.json", JSON.stringify(data.highlights, null, 2))
      zip.file("README.txt", `GZV PROJECT BACKUP\nNgày xuất: ${new Date().toISOString()}\nSố dự án: ${data.projects.length}\nDanh mục: ${[...new Set(data.projects.map((item) => item.category || "Chưa phân loại"))].join(", ")}\n\nExcel chứa bảng tổng hợp và từng sheet danh mục. Thư mục images được chia theo danh mục/dự án.`)
      const assets: { folder: string; url: string; label: string }[] = []
      data.projects.forEach((project) => collectAssetUrls(project).forEach((url, index) => assets.push({ folder: `images/${safeBackupName(project.category, "chua-phan-loai")}/${safeBackupName(project.slug || project.id)}`, url, label: `image-${index + 1}` })))
      data.authors.forEach((author: any) => collectAssetUrls(author).forEach((url, index) => assets.push({ folder: `images/tac-gia/${safeBackupName(author.slug || author.id)}`, url, label: `image-${index + 1}` })))
      data.mentors.forEach((mentor: any) => collectAssetUrls(mentor).forEach((url, index) => assets.push({ folder: `images/mentor/${safeBackupName(mentor.slug || mentor.id)}`, url, label: `image-${index + 1}` })))
      data.gzvers.forEach((person) => collectAssetUrls(person).forEach((url, index) => assets.push({ folder: `images/gzver/${safeBackupName(person.slug || person.id)}`, url, label: `image-${index + 1}` })))
      data.highlights.forEach((item: any) => collectAssetUrls(item).forEach((url, index) => assets.push({ folder: `images/dong-gop/${safeBackupName(item.project_id)}/${safeBackupName(item.gzver_id)}`, url, label: `image-${index + 1}` })))
      const failures = await addRemoteAssetsToZip(zip, assets)
      if (failures.length) zip.file("images-khong-tai-duoc.txt", failures.join("\n"))
      downloadBackupBlob(await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }), `du-an-full-backup-${today()}.zip`)
    } catch (error: any) { toast.error(error.message) } finally { setBusy(null) }
  }

  if (loading || allowed === null) return <div className="border border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-slate-900"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#ed1c24]" /></div>
  if (!allowed) return <div className="flex items-center gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><ShieldAlert className="h-5 w-5" />Backup dự án dành cho tài khoản Admin và Collab.</div>
  return <div className="space-y-5 border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
    <div><h3 className="text-sm font-black uppercase">Xuất dữ liệu & Backup dự án</h3><p className="mt-1 text-xs text-slate-500">Xuất đầy đủ thông tin theo danh mục, đội ngũ liên quan và toàn bộ hình ảnh tìm thấy trong nội dung.</p></div>
    <div className="flex flex-wrap gap-2"><Button variant="outline" className="rounded-none" onClick={() => setSelected(new Set(projects.map((item) => item.id)))}>Chọn tất cả</Button><Button variant="outline" className="rounded-none" onClick={() => setSelected(new Set())}>Bỏ chọn</Button><span className="self-center text-xs font-bold text-[#ed1c24]">Đã chọn {chosen.length}/{projects.length}</span></div>
    <div className="grid max-h-64 gap-2 overflow-y-auto border border-slate-200 p-3 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <label key={project.id} className="flex items-center gap-2 border border-slate-100 p-2 text-xs dark:border-white/5"><Switch checked={selected.has(project.id)} onCheckedChange={(checked) => setSelected((current) => { const next = new Set(current); checked ? next.add(project.id) : next.delete(project.id); return next })} /><span className="min-w-0"><b className="block truncate">{project.title}</b><span className="block truncate text-slate-500">{project.category || "Chưa phân loại"}</span></span></label>)}</div>
    <div className="grid gap-3 sm:grid-cols-2"><Button disabled={!chosen.length || !!busy} onClick={() => void exportExcel()} className="h-12 rounded-none bg-emerald-600 text-white hover:bg-emerald-700">{busy === "excel" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}Excel theo danh mục</Button><Button disabled={!chosen.length || !!busy} onClick={() => void exportZip()} className="h-12 rounded-none bg-slate-900 text-white hover:bg-black">{busy === "zip" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}ZIP đầy đủ + hình ảnh</Button></div>
  </div>
}
