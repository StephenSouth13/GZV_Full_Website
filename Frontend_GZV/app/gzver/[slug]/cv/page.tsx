"use client"

import { useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Maximize2,
  Palette,
  Printer,
  RotateCcw,
  Share2,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import Link from "next/link"
import { useGzverCv } from "@/hooks/use-gzver-cv"
import { CvDocument, downloadCvPdf, printCvDocument } from "../../../../../shared/gzver/CvDocument"
import { CvTemplatePicker } from "../../../../../shared/gzver/CvTemplatePicker"
import { gzversData } from "@/data/gzver"

const FALLBACK_PROJECTS_MAP: Record<string, any[]> = {
  "quach-thanh-long": [
    {
      id: "proj-qtl-1",
      title: "Hệ thống Quản trị & Website GZV Center (gzv.one)",
      slug: "he-thong-quan-tri-gzv-center",
      category: "CÔNG NGHỆ & GIÁO DỤC",
      status: "completed",
      description:
        "Hệ thống quản trị nội dung CMS đa chức năng, hỗ trợ quản lý nhân sự GZVers, dự án Portfolio, Mentors và tự động xuất bản hồ sơ CV PDF chuẩn quốc tế.",
      detailproject:
        "Xây dựng trên nền tảng Supabase PostgreSQL mã nguồn mở, tối ưu hiệu năng SSR Next.js App Router, thiết kế bộ công cụ biên tập CV 6 mẫu thiết kế linh hoạt.",
      contribution:
        "Trưởng nhóm công nghệ, thiết kế kiến trúc Database & phát triển toàn bộ hệ thống frontend + backend CMS.",
      tech_stack: ["Next.js", "Supabase", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      hashtags: "#FullStack #CMS #GZVCenter",
      external_url: "https://www.gzv.one",
      order_index: 1,
    },
    {
      id: "proj-qtl-2",
      title: "Nền tảng Giải chạy Vietnam Student Marathon (VSM)",
      slug: "giai-chay-vietnam-student-marathon",
      category: "SỰ KIỆN & CỘNG ĐỒNG",
      status: "completed",
      description:
        "Hệ thống đăng ký Vận động viên, tra cứu Bib & kết quả chạy bộ tự động cho giải chạy sinh viên quy mô lớn hàng nghìn tham dự.",
      contribution: "Phát triển công cụ tra cứu tự động và đồng bộ kết quả realtime cho Ban Tổ Chức.",
      tech_stack: ["React", "Node.js", "PostgreSQL", "Realtime API"],
      hashtags: "#VSM2024 #Marathon #WebDev",
      order_index: 2,
    },
    {
      id: "proj-qtl-3",
      title: "Dự án Game Engine & Học bổng Tài năng VTC Academy",
      slug: "game-engine-vtc-academy",
      category: "GAME DEVELOPMENT",
      status: "completed",
      description:
        "Dự án xuất sắc đạt Giải Nhất Học bổng Tài năng VTC Academy 2024 ngành Lập trình & Phát triển Game.",
      contribution: "Thiết kế thuật toán vật lý, xử lý rendering 2D/3D và tối ưu hóa bộ nhớ game engine.",
      tech_stack: ["C++", "Unity", "Game Logic", "Physics Engine"],
      hashtags: "#VTCAcademy #GameDev #FirstPrize",
      order_index: 3,
    },
  ],
}

export default function GzverCvPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug || "quach-thanh-long"
  const { person: dbPerson, projects: dbProjects, loading, error, updatedAt } = useGzverCv(slug)

  const [exportError, setExportError] = useState("")
  const [exportSuccess, setExportSuccess] = useState("")
  const [design, setDesign] = useState<{ template: string; accent: string } | null>(null)
  const [showPicker, setShowPicker] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [zoomScale, setZoomScale] = useState<number>(1)
  const documentRef = useRef<HTMLDivElement>(null)

  // Merge database person or fallback static dataset for Quách Thành Long / GZVers
  const person = useMemo(() => {
    if (dbPerson) return dbPerson
    const fallback = gzversData.find((g) => g.slug === slug)
    if (fallback) {
      return {
        ...fallback,
        department_name: fallback.position || "Phòng CNTT",
        location: "TP. Hồ Chí Minh, Việt Nam",
        email: "long.qt.gzv@gmail.com",
        phone: "(+84) 329 381 489",
        website_url: "https://www.gzv.one",
        social_links: [
          { label: "LinkedIn", href: "https://linkedin.com/in/quachthanhlong", visible: true },
          { label: "Website GZV", href: "https://www.gzv.one", visible: true },
        ],
        online_cards: [
          {
            title: "Chứng nhận Giải Nhất VTC Academy 2024",
            issuer: "VTC Academy",
            issued_at: "2024",
            visible: true,
          },
          {
            title: "Chứng nhận Vô địch VSM Marathon 42km",
            issuer: "Vietnam Student Marathon",
            issued_at: "2024",
            visible: true,
          },
        ],
        cv_settings: {
          template: "executive",
          accent: "#ed1c24",
          show_contact: true,
          show_projects: true,
          show_credentials: true,
        },
      }
    }
    return null
  }, [dbPerson, slug])

  const projects = useMemo(() => {
    if (dbProjects && dbProjects.length > 0) return dbProjects
    return FALLBACK_PROJECTS_MAP[slug] || FALLBACK_PROJECTS_MAP["quach-thanh-long"] || []
  }, [dbProjects, slug])

  const previewPerson = useMemo(() => {
    if (!person) return null
    const baseSettings = person.cv_settings || { template: "executive", accent: "#ed1c24" }
    return {
      ...person,
      cv_settings: {
        ...baseSettings,
        template: design?.template || baseSettings.template || "executive",
        accent: design?.accent || baseSettings.accent || "#ed1c24",
      },
    }
  }, [person, design])

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleDownloadPdf = async () => {
    const sheet = documentRef.current?.querySelector<HTMLElement>(".gzv-cv")
    if (!sheet || exporting || !person) return
    setExporting(true)
    setExportError("")
    setExportSuccess("")
    try {
      await downloadCvPdf(sheet, person.slug, async () => (await import("html2pdf.js")).default)
      setExportSuccess("Đã tạo và tải file CV PDF thành công!")
      setTimeout(() => setExportSuccess(""), 4000)
    } catch (cause: any) {
      setExportError(cause.message || "Không xuất được PDF. Vui lòng thử lại hoặc chọn 'In A4'.")
    } finally {
      setExporting(false)
    }
  }

  const handleNativePrint = async () => {
    const sheet = documentRef.current?.querySelector<HTMLElement>(".gzv-cv")
    if (!sheet || printing) return
    setPrinting(true)
    try {
      await printCvDocument(sheet)
    } catch (err: any) {
      window.print()
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="cv-page-root min-h-screen bg-slate-900 text-slate-100 selection:bg-[#ed1c24] selection:text-white">
      {/* Sleek Topbar Navigation */}
      <header className="cv-toolbar sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-md px-4 py-3 shadow-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          {/* Back button & GZVer Identity Chip */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/gzver/${slug}`}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-slate-200 transition-all hover:border-white/20 hover:bg-white/10"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Hồ sơ GZVer</span>
            </Link>

            {person && (
              <div className="flex items-center gap-2 border-l border-white/10 pl-3 min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ed1c24] text-xs font-black uppercase text-white shrink-0 shadow-sm">
                  {person.full_name ? person.full_name.charAt(0) : "G"}
                </span>
                <div className="min-w-0">
                  <h1 className="text-xs font-black uppercase tracking-wide text-white truncate">
                    {person.full_name}
                  </h1>
                  <p className="text-[10px] font-medium text-slate-400 truncate">
                    {person.position || person.company || "GZVer"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Toolbar Actions */}
          {person && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-all ${
                  showPicker
                    ? "border-[#ed1c24] bg-[#ed1c24]/20 text-[#ff5a60]"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                <Palette size={15} />
                <span>Thiết kế CV</span>
                {showPicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-slate-300 hover:bg-white/10"
                title="Sao chép đường dẫn CV"
              >
                {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span className="hidden md:inline">{copiedLink ? "Đã sao chép" : "Chia sẻ Link"}</span>
              </button>

              <Link
                href={`/gzver/${slug}`}
                target="_blank"
                className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-slate-300 hover:bg-white/10"
                title="Mở trang hồ sơ cá nhân Public"
              >
                <span>Trang Public</span>
                <ExternalLink size={13} />
              </Link>

              <button
                type="button"
                onClick={handleNativePrint}
                disabled={printing}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3.5 text-xs font-bold text-white transition-all hover:bg-white/20 active:scale-95"
              >
                <Printer size={15} />
                <span className="hidden sm:inline">In A4</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={exporting}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#ed1c24] px-4 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#c91218] active:scale-95 disabled:opacity-60"
              >
                {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                <span>{exporting ? "Đang tạo PDF..." : "Tải CV PDF"}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Template Picker Accordion Panel */}
        {person && showPicker && (
          <div className="cv-toolbar overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-4 sm:p-6 shadow-2xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#ed1c24]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-white">
                  Bộ sưu tập 6 Mẫu thiết kế CV chuẩn Quốc Tế
                </h2>
              </div>
              {design && (
                <button
                  type="button"
                  onClick={() => setDesign(null)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white"
                >
                  <RotateCcw size={12} /> Khôi phục mẫu mặc định
                </button>
              )}
            </div>

            <CvTemplatePicker
              value={previewPerson?.cv_settings?.template || "executive"}
              selectedAccent={previewPerson?.cv_settings?.accent || "#ed1c24"}
              onChange={(template, accent) => setDesign({ template, accent })}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#ed1c24]" />
            <p className="text-xs font-black uppercase tracking-widest">Đang khởi tạo hồ sơ CV...</p>
          </div>
        )}

        {/* Error / Feedback Alert */}
        {error && !person && (
          <div role="alert" className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs font-bold text-red-300">
            {error}
          </div>
        )}

        {exportError && (
          <div role="alert" className="cv-toolbar rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 text-xs font-bold text-amber-300 flex items-center justify-between">
            <span>{exportError}</span>
            <button type="button" onClick={() => setExportError("")} className="text-xs font-mono uppercase underline">Đóng</button>
          </div>
        )}

        {exportSuccess && (
          <div role="status" className="cv-toolbar rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* Live CV Document Preview */}
        {previewPerson && (
          <div className="space-y-3">
            {/* Metadata Status Line & Zoom Controls */}
            <div className="cv-toolbar flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Mẫu: <strong className="text-white">{previewPerson.cv_settings.template}</strong> · Accent:{" "}
                <span className="inline-block h-3.5 w-3.5 rounded-full border border-white/40 align-middle shadow-xs" style={{ backgroundColor: previewPerson.cv_settings.accent }} />
              </span>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">
                  {projects.length} dự án đính kèm
                  {updatedAt ? ` · Cập nhật: ${new Date(updatedAt).toLocaleDateString("vi-VN")}` : ""}
                </span>

                {/* Scale Zoom Controls */}
                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-950 p-1">
                  <button
                    type="button"
                    onClick={() => setZoomScale(Math.max(0.7, zoomScale - 0.1))}
                    className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                    title="Thu nhỏ"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span className="px-1.5 text-[10px] font-mono font-bold text-slate-200 min-w-[38px] text-center">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomScale(Math.min(1.3, zoomScale + 0.1))}
                    className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white"
                    title="Phóng to"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomScale(1)}
                    className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white ml-0.5"
                    title="Kích thước gốc 100%"
                  >
                    <Maximize2 size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Paper Container */}
            <div className="cv-document-frame relative mx-auto overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 p-2 shadow-2xl sm:p-6 md:p-8">
              <div className="w-full overflow-x-auto flex justify-center">
                <div
                  ref={documentRef}
                  className="document-sheet-wrapper transition-transform duration-200 origin-top"
                  style={{
                    transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
                    marginBottom: zoomScale !== 1 ? `${(zoomScale - 1) * 1123}px` : undefined,
                  }}
                >
                  <CvDocument person={previewPerson} projects={projects} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Print CSS Rules */}
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          html, body {
            background: white !important;
            color: black !important;
          }
          .cv-toolbar, .cv-page-root > header {
            display: none !important;
          }
          .cv-page-root {
            padding: 0 !important;
            background: white !important;
          }
          .cv-document-frame {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}

