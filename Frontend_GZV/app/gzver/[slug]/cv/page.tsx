"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/api-supabase"
import { CvDocument, downloadCvPdf } from "../../../../../shared/gzver/CvDocument"

export default function GzverCvPage() {
  const params = useParams<{ slug: string }>()
  const [person, setPerson] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [exporting, setExporting] = useState(false)
  const documentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError("")
    setPerson(null)
    setProjects([])
    const load = async () => {
      try {
        const { data, error: profileError } = await supabase.from("gzvers").select("*").eq("slug", params.slug).eq("is_active", true).maybeSingle()
        if (profileError) throw profileError
        if (!data) throw new Error("Không tìm thấy hồ sơ CV.")
        let selected: any[] = []
        if (data.cv_settings?.show_projects !== false) {
          const [byProfile, highlights] = await Promise.all([
            supabase.from("projects").select("*").contains("author_ids", [data.id]).order("order_index", { ascending: true }),
            supabase.from("gzver_project_highlights").select("project_id,contribution,is_visible").eq("gzver_id", data.id),
          ])
          if (byProfile.error) throw byProfile.error
          if (highlights.error) throw highlights.error
          const rows = highlights.data || []
          const extraIds = rows.filter((item: any) => item.is_visible !== false).map((item: any) => item.project_id)
          const extra = extraIds.length ? await supabase.from("projects").select("*").in("id", extraIds) : { data: [], error: null }
          if (extra.error) throw extra.error
          const excluded = new Set(rows.filter((item: any) => item.is_visible === false).map((item: any) => item.project_id))
          const contributions = new Map(rows.map((item: any) => [item.project_id, item.contribution]))
          selected = Array.from(new Map([...(byProfile.data || []), ...(extra.data || [])].filter((item: any) => !excluded.has(item.id)).map((item: any) => [item.id, item])).values())
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((item: any) => ({ ...item, contribution: contributions.get(item.id) }))
        }
        if (alive) { setPerson(data); setProjects(selected) }
      } catch (cause: any) {
        if (alive) setError(cause.message || "Không tải được hồ sơ CV. Vui lòng thử lại.")
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [params.slug])

  const download = async () => {
    const sheet = documentRef.current?.querySelector<HTMLElement>(".gzv-cv")
    if (!sheet || exporting) return
    setExporting(true)
    setError("")
    try {
      await downloadCvPdf(sheet, person.slug, async () => (await import("html2pdf.js")).default)
    } catch (cause: any) {
      setError(cause.message || "Không xuất được PDF. Vui lòng thử lại.")
    } finally { setExporting(false) }
  }

  return <div className="cv-page min-h-screen bg-slate-100 px-3 py-6 text-slate-900 sm:px-6 sm:py-10">
    <div className="cv-toolbar mx-auto mb-5 flex max-w-[794px] flex-wrap items-center justify-between gap-3">
      <Link href={`/gzver/${params.slug}`} className="inline-flex items-center gap-2 text-xs font-bold"><ArrowLeft size={16} />Hồ sơ GZVer</Link>
      {person && <div className="flex gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold"><Printer size={15} />In A4</button><button type="button" onClick={download} disabled={exporting} className="inline-flex items-center gap-2 bg-[#ed1c24] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60">{exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{exporting ? "Đang tạo PDF…" : "Tải CV PDF"}</button></div>}
    </div>
    {loading && <p role="status" className="py-20 text-center text-sm">Đang tải hồ sơ CV…</p>}
    {error && <p role="alert" className="cv-toolbar mx-auto mb-4 max-w-[794px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {person && <div ref={documentRef}><CvDocument person={person} projects={projects} /></div>}
    <style>{`@page{size:A4;margin:0}@media print{html,body{background:white!important}.cv-toolbar{display:none!important}.cv-page{padding:0!important;background:white!important}}`}</style>
  </div>
}
