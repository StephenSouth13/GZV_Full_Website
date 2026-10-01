"use client"

import { useRef, useState } from "react"
import { Download, Loader2, Printer } from "lucide-react"
import { CvDocument, downloadCvPdf, printCvDocument } from "../../../../shared/gzver/CvDocument"

export function CvPreview({ person, projects, mobile = false }: { person: any; projects: any[]; mobile?: boolean }) {
  const documentRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")
  const print = async () => {
    const sheet = documentRef.current?.querySelector<HTMLElement>(".gzv-cv")
    if (!sheet) return
    setError("")
    try { await printCvDocument(sheet) } catch (cause: any) { setError(cause.message) }
  }
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
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
      <div><p className="text-xs font-black uppercase">Bản xem trước CV</p><p className="mt-1 text-[11px] text-slate-500">Dữ liệu đang biên tập · Có logo GZV · PDF một trang liền mạch</p></div>
      <div className="flex gap-2"><button type="button" onClick={print} className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2.5 text-xs font-bold"><Printer size={15} />In A4</button><button type="button" onClick={download} disabled={exporting} className="inline-flex items-center gap-2 bg-[#ed1c24] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60">{exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{exporting ? "Đang tạo PDF…" : "Tải CV PDF"}</button></div>
    </div>
    {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-auto bg-slate-100 p-3 sm:p-6" ref={documentRef}><div className="mx-auto" style={{ width: mobile ? 375 : 794, maxWidth: "100%" }}><CvDocument person={person} projects={projects} compact={mobile} /></div></div>
  </div>
}
