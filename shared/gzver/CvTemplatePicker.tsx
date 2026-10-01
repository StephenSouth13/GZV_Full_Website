import { CV_TEMPLATES, normalizeTemplate, type CvTemplate } from "./cv-model"

function EyeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

function LayoutGridIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}

function Rows3Icon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="4" x="3" y="3" rx="1" />
      <rect width="18" height="4" x="3" y="10" rx="1" />
      <rect width="18" height="4" x="3" y="17" rx="1" />
    </svg>
  )
}

export const ACCENT_PALETTES = [
  { hex: "#ed1c24", label: "Crimson Red (Mặc định GZV)" },
  { hex: "#10b981", label: "Emerald Green" },
  { hex: "#2563eb", label: "Royal Blue" },
  { hex: "#d97706", label: "Amber Gold" },
  { hex: "#8b5cf6", label: "Vibrant Purple" },
  { hex: "#475569", label: "Slate Gray" },
]

export function CvTemplatePicker({
  value,
  selectedAccent,
  showProjects = true,
  projectLayout = "grid-1",
  onChange,
  onToggleProjects,
  onChangeProjectLayout,
}: {
  value: string
  selectedAccent?: string
  showProjects?: boolean
  projectLayout?: "grid-1" | "grid-2" | "grid-3"
  onChange: (template: CvTemplate, accent: string) => void
  onToggleProjects?: (show: boolean) => void
  onChangeProjectLayout?: (layout: "grid-1" | "grid-2" | "grid-3") => void
}) {
  const currentTemplate = normalizeTemplate(value)

  return (
    <div className="cv-picker-wrapper space-y-5">
      {/* Template selector grid */}
      <div
        className="cv-template-picker grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6"
        role="group"
        aria-label="Chọn thiết kế CV"
      >
        {CV_TEMPLATES.map((template) => {
          const isSelected = currentTemplate === template.id
          const activeAccent = isSelected && selectedAccent ? selectedAccent : template.color

          return (
            <button
              key={template.id}
              type="button"
              aria-pressed={isSelected}
              className={`cv-template-option group relative flex flex-col justify-between rounded-xl p-3 text-left transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? "border-[#ed1c24] bg-red-500/10 shadow-lg ring-2 ring-[#ed1c24]/30 dark:border-[#ed1c24] dark:bg-red-950/30"
                  : "border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-800/80 hover:shadow-md"
              }`}
              onClick={() => onChange(template.id, activeAccent)}
            >
              {isSelected && (
                <span className="absolute -top-2 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-[#ed1c24] text-[10px] font-black text-white shadow-md ring-2 ring-slate-950">
                  ✓
                </span>
              )}

              {/* Visual Card Mini Graphic Preview */}
              <div
                className={`cv-template-mini cv-template-mini-${template.id} relative h-28 w-full overflow-hidden rounded-lg border border-slate-700/50 shadow-inner transition-transform duration-200 group-hover:scale-[1.02]`}
                style={
                  {
                    background: template.background,
                    color: template.id === "midnight" ? "#f8fafc" : "#1e293b",
                    "--mini-accent": activeAccent,
                  } as any
                }
                aria-hidden="true"
              >
                {/* Header branding */}
                <div className="flex items-center justify-between px-2 pt-2">
                  <span className="cv-mini-brand font-black text-[9px] tracking-wider uppercase" style={{ color: activeAccent }}>
                    GZV
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: activeAccent }} />
                </div>

                {/* Typography demo */}
                <div className="px-2 pt-1">
                  <span className={`cv-mini-title block font-black leading-none ${template.id === "editorial" ? "font-serif text-xl" : "text-lg"}`}>
                    Aa
                  </span>
                  <span className="block text-[5px] font-bold tracking-widest text-slate-400 uppercase">
                    PORTFOLIO / CV
                  </span>
                </div>

                {/* Layout simulation bars */}
                {template.id === "executive" && (
                  <div className="absolute inset-x-2 bottom-2 flex gap-1.5">
                    <div className="w-1/3 rounded-xs p-1" style={{ background: activeAccent, opacity: 0.2 }}>
                      <div className="h-1 w-full bg-current opacity-60 rounded-xs mb-1" />
                      <div className="h-1 w-2/3 bg-current opacity-40 rounded-xs" />
                    </div>
                    <div className="flex-1 space-y-1 pt-0.5">
                      <div className="h-1 w-full bg-slate-400/40 rounded-xs" />
                      <div className="h-1 w-5/6 bg-slate-400/40 rounded-xs" />
                      <div className="h-1 w-3/4 bg-slate-400/40 rounded-xs" />
                    </div>
                  </div>
                )}

                {template.id === "minimal" && (
                  <div className="absolute inset-x-2 bottom-2 space-y-1">
                    <div className="h-0.5 w-full" style={{ background: activeAccent }} />
                    <div className="h-1 w-full bg-slate-400/30 rounded-xs" />
                    <div className="h-1 w-4/5 bg-slate-400/30 rounded-xs" />
                    <div className="h-1 w-2/3 bg-slate-400/30 rounded-xs" />
                  </div>
                )}

                {template.id === "midnight" && (
                  <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1.5">
                    <div className="flex-1 space-y-1">
                      <div className="h-1 w-full bg-slate-300/40 rounded-xs" />
                      <div className="h-1 w-4/5 bg-slate-300/40 rounded-xs" />
                    </div>
                    <div className="w-1/3 h-6 rounded-xs border border-amber-500/40 p-0.5" style={{ background: activeAccent, opacity: 0.25 }} />
                  </div>
                )}

                {template.id === "editorial" && (
                  <div className="absolute inset-x-2 bottom-2 pt-1 border-t border-slate-300">
                    <div className="h-1 w-full bg-amber-900/30 rounded-xs mb-1" />
                    <div className="h-1 w-3/4 bg-amber-900/20 rounded-xs" />
                  </div>
                )}

                {template.id === "studio" && (
                  <div className="absolute inset-x-0 bottom-0 top-10 p-1.5" style={{ background: activeAccent }}>
                    <div className="h-2 w-12 bg-white/90 rounded-xs mb-1" />
                    <div className="h-1 w-full bg-white/50 rounded-xs mb-0.5" />
                    <div className="h-1 w-2/3 bg-white/50 rounded-xs" />
                  </div>
                )}

                {template.id === "portfolio" && (
                  <div className="absolute inset-x-2 bottom-1.5">
                    <div className="h-6 w-full rounded-xs overflow-hidden opacity-30 mb-1" style={{ background: activeAccent }} />
                    <div className="h-1 w-full bg-slate-500/40 rounded-xs" />
                  </div>
                )}
              </div>

              {/* Title & Caption */}
              <div className="mt-2.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wide text-white truncate">
                    {template.name}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-white/30 shrink-0"
                    style={{ backgroundColor: activeAccent }}
                  />
                </div>
                <p className="text-[10px] font-medium leading-tight text-slate-400 line-clamp-2">
                  {template.caption}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Control Bar: Accent Color & Project Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-white/10">
        {/* Accent Color Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Màu điểm nhấn:
          </span>
          <div className="flex items-center gap-2">
            {ACCENT_PALETTES.map((color) => {
              const active = (selectedAccent || "").toLowerCase() === color.hex.toLowerCase()
              return (
                <button
                  key={color.hex}
                  type="button"
                  title={color.label}
                  onClick={() => onChange(currentTemplate, color.hex)}
                  className={`relative h-6 w-6 rounded-full transition-all duration-200 border-2 cursor-pointer ${
                    active
                      ? "scale-115 border-white ring-2 ring-[#ed1c24]/50 shadow-md"
                      : "border-transparent opacity-75 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-xs">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Project Section Display Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Projects On/Off */}
          {onToggleProjects && (
            <button
              type="button"
              onClick={() => onToggleProjects(!showProjects)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                showProjects
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                  : "border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              {showProjects ? <EyeIcon size={14} /> : <EyeOffIcon size={14} />}
              <span>{showProjects ? "Đang Hiện Dự Án" : "Đã Tắt Mục Dự Án"}</span>
            </button>
          )}

          {/* Project Grid Column Mode */}
          {showProjects && onChangeProjectLayout && (
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900 p-1">
              <span className="px-2 text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">Bố cục dự án:</span>
              
              <button
                type="button"
                onClick={() => onChangeProjectLayout("grid-1")}
                className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  projectLayout === "grid-1"
                    ? "bg-[#ed1c24] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="1 cột full chiều rộng"
              >
                <Rows3Icon size={13} />
                <span>1 Cột</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeProjectLayout("grid-2")}
                className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  projectLayout === "grid-2"
                    ? "bg-[#ed1c24] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="2 ô / hàng"
              >
                <LayoutGridIcon size={13} />
                <span>2 Ô</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeProjectLayout("grid-3")}
                className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  projectLayout === "grid-3"
                    ? "bg-[#ed1c24] text-white shadow-xs ring-1 ring-white/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Xếp gọn 3 ô dự án 1 hàng"
              >
                <LayoutGridIcon size={13} />
                <span>3 Ô (Xếp gọn)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



