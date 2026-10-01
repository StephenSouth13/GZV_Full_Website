"use client"

import { useRef, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react"
import Link from "next/link"
import { useGzverCv } from "@/hooks/use-gzver-cv"
import { CvDocument, downloadCvPdf } from "../../../../../shared/gzver/CvDocument"
import { CvTemplatePicker } from "../../../../../shared/gzver/CvTemplatePicker"

export default function GzverCvPage() {
  const params = useParams<{ slug: string }>()
  const { person, projects, loading, error, updatedAt } = useGzverCv(params.slug)
  const [exportError, setExportError] = useState("")
  const [design, setDesign] = useState<{ slug: string; template: string; accent: string } | null>(null)
  const [exporting, setExporting] = useState(false)
  const documentRef = useRef<HTMLDivElement>(null)

  const previewPerson = person ? { ...person, cv_settings: { ...person.cv_settings, ...(design?.slug === params.slug ? { template: design.template, accent: design.accent } : {}) } } : null

  const download = async () => {
    const sheet = documentRef.current?.querySelector<HTMLElement>(".gzv-cv")
    if (!sheet || exporting) return
    setExporting(true)
    setExportError("")
    try {
      await downloadCvPdf(sheet, person.slug, async () => (await import("html2pdf.js")).default)
    } catch (cause: any) {
      setExportError(cause.message || "Không xuất được PDF. Vui lòng thử lại.")
    } finally { setExporting(false) }
  }

  return <div className="cv-page min-h-screen bg-slate-100 px-3 py-6 text-slate-900 sm:px-6 sm:py-10">
    <div className="cv-toolbar mx-auto mb-5 flex max-w-[794px] flex-wrap items-center justify-between gap-3">
      <Link href={`/gzver/${params.slug}`} className="inline-flex items-center gap-2 text-xs font-bold"><ArrowLeft size={16} />Hồ sơ GZVer</Link>
      {person && <div className="flex gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold"><Printer size={15} />In A4</button><button type="button" onClick={download} disabled={exporting} className="inline-flex items-center gap-2 bg-[#ed1c24] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60">{exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{exporting ? "Đang tạo PDF…" : "Tải CV PDF"}</button></div>}
    </div>
    {person && <details className="cv-toolbar mx-auto mb-5 max-w-[794px] rounded-lg border border-slate-200 bg-white p-4"><summary className="cursor-pointer text-xs font-bold">Chọn thiết kế CV · 6 mẫu</summary><div className="mt-4"><CvTemplatePicker value={previewPerson.cv_settings.template || "executive"} onChange={(template, accent) => setDesign({ slug: params.slug, template, accent })} /></div><p className="mt-3 text-[11px] text-slate-500">Đổi mẫu để xem và tải. Nội dung luôn đồng bộ với hồ sơ đã lưu.</p></details>}
    {loading && <p role="status" className="py-20 text-center text-sm">Đang tải hồ sơ CV…</p>}
    {error && <p role="alert" className="cv-toolbar mx-auto mb-4 max-w-[794px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {exportError && <p role="alert" className="cv-toolbar mx-auto mb-4 max-w-[794px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{exportError}</p>}
    {person && <><p className="cv-toolbar mx-auto mb-3 max-w-[794px] text-[11px] text-slate-500">CV & Portfolio · {projects.length} dự án · Đồng bộ trực tiếp{updatedAt ? ` · ${new Date(updatedAt).toLocaleString("vi-VN", { timeZone: "Asia/Bangkok" })}` : ""}</p><div ref={documentRef}><CvDocument person={previewPerson} projects={projects} /></div></>}
    <style>{`@page{size:A4;margin:0}@media print{html,body{background:white!important}.cv-toolbar{display:none!important}.cv-page{padding:0!important;background:white!important}}`}</style>
  </div>
}
