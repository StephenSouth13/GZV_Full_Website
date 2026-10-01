import { CV_TEMPLATES, normalizeTemplate, type CvTemplate } from "./cv-model"

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
  onChange,
}: {
  value: string
  selectedAccent?: string
  onChange: (template: CvTemplate, accent: string) => void
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

      {/* Accent Color Quick Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Màu điểm nhấn (Accent Color):
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

        <span className="text-[11px] font-medium text-slate-400 italic">
          💡 Chọn mẫu & màu sắc trực tiếp — luôn đồng bộ 100% khi in A4 hoặc tải file PDF.
        </span>
      </div>
    </div>
  )
}

