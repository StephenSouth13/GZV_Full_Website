"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/api-supabase"

type DisplayMode = "grid" | "marquee" | "carousel"
type TileSize = "lg" | "md"

type PartnerDisplay = {
  grayscale: boolean
  showNames: boolean
}

// Ô logo đồng đều: cùng tỉ lệ, có khoảng đệm, nền trắng để logo luôn rõ (kể cả dark mode)
function PartnerTile({ partner, size, display }: { partner: any; size: TileSize; display: PartnerDisplay }) {
  const name = partner.name || partner.title || "Đối tác GZV"
  const scale = (partner.logo_scale ?? 100) / 100
  const tile = (
    <div className="group/tile flex h-full flex-col">
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300 group-hover/tile:-translate-y-1 group-hover/tile:border-[#ed1c24]/40 group-hover/tile:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.35)] dark:border-white/10 ${
          size === "lg" ? "aspect-[4/3] p-6 md:p-8" : "aspect-[4/3] p-4 md:p-5"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={partner.logo_url || partner.image || "/placeholder.jpg"}
          alt={name}
          loading="lazy"
          draggable={false}
          className={`max-h-full max-w-full object-contain transition duration-300 ${display.grayscale ? "opacity-70 grayscale group-hover/tile:opacity-100 group-hover/tile:grayscale-0" : ""}`}
          style={{
            objectPosition: `${partner.logo_position_x ?? 50}% ${partner.logo_position_y ?? 50}%`,
            transform: scale !== 1 ? `scale(${scale})` : undefined,
          }}
        />
      </div>
      {display.showNames && (
        <p className="mt-2.5 line-clamp-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 transition group-hover/tile:text-[#ed1c24] dark:text-slate-400">
          {name}
        </p>
      )}
    </div>
  )

  return partner.website_url ? (
    <a href={partner.website_url} target="_blank" rel="noopener noreferrer" title={name} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[#ed1c24]">
      {tile}
    </a>
  ) : (
    <div title={name} className="h-full">
      {tile}
    </div>
  )
}

const tileWidth = (size: TileSize) =>
  size === "lg" ? "w-[calc(50%-8px)] sm:w-[200px] lg:w-[220px]" : "w-[calc(33.333%-11px)] sm:w-[150px] lg:w-[170px]"

// Lưới tĩnh: căn giữa, cách đều — ít hay nhiều logo đều cân đối
function GridRow({ items, size, display }: { items: any[]; size: TileSize; display: PartnerDisplay }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-5">
      {items.map((partner, index) => (
        <div key={partner.id || `${partner.name}-${index}`} className={`shrink-0 ${tileWidth(size)}`}>
          <PartnerTile partner={partner} size={size} display={display} />
        </div>
      ))}
    </div>
  )
}

// Băng chuyền chạy liên tục, dừng khi rê chuột
function MarqueeRow({ items, size, direction, display }: { items: any[]; size: TileSize; direction: string; display: PartnerDisplay }) {
  let base = [...items]
  while (base.length < 8) base = [...base, ...items]
  const duration = Math.max(25, base.length * 4)
  return (
    <div
      className="group/marquee relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className="flex w-max gap-5 py-2 group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animation: `${direction === "right" ? "gzv-partners-right" : "gzv-partners-left"} ${duration}s linear infinite` }}
      >
        {[...base, ...base].map((partner, index) => (
          <div key={`${partner.id || partner.name}-${index}`} className={`shrink-0 ${size === "lg" ? "w-[180px] md:w-[220px]" : "w-[140px] md:w-[170px]"}`}>
            <PartnerTile partner={partner} size={size} display={display} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Carousel: kéo/vuốt, nút trước/sau, chấm trang, tự chạy (dừng khi rê chuột)
function CarouselRow({ items, size, display, autoplay, interval }: { items: any[]; size: TileSize; display: PartnerDisplay; autoplay: boolean; interval: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(1)
  const [paused, setPaused] = useState(false)

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const total = Math.max(1, Math.ceil(track.scrollWidth / track.clientWidth - 0.05))
    setPages(total)
    setPage(Math.min(total - 1, Math.round(track.scrollLeft / track.clientWidth)))
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [measure, items.length])

  const go = useCallback((target: number) => {
    const track = trackRef.current
    if (!track) return
    const next = (target + pages) % pages
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" })
  }, [pages])

  useEffect(() => {
    if (!autoplay || paused || pages <= 1) return
    const timer = setInterval(() => go(page + 1), Math.max(2, interval) * 1000)
    return () => clearInterval(timer)
  }, [autoplay, paused, pages, page, interval, go])

  const perView = size === "lg" ? "basis-1/2 sm:basis-1/3 lg:basis-1/4" : "basis-1/3 sm:basis-1/4 lg:basis-1/6"

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div
        ref={trackRef}
        onScroll={measure}
        className={`-mx-2 flex snap-x snap-mandatory overflow-x-auto scroll-smooth py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${pages <= 1 ? "justify-center" : ""}`}
      >
        {items.map((partner, index) => (
          <div key={partner.id || `${partner.name}-${index}`} className={`shrink-0 snap-start px-2 ${perView}`}>
            <PartnerTile partner={partner} size={size} display={display} />
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" aria-label="Trước" onClick={() => go(page - 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#ed1c24] hover:bg-[#ed1c24] hover:text-white dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pages }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Trang ${index + 1}`}
                onClick={() => go(index)}
                className={`h-2 rounded-full transition-all ${index === page ? "w-7 bg-[#ed1c24]" : "w-2 bg-slate-300 hover:bg-slate-400 dark:bg-white/20"}`}
              />
            ))}
          </div>
          <button type="button" aria-label="Sau" onClick={() => go(page + 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-[#ed1c24] hover:bg-[#ed1c24] hover:text-white dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export interface PartnersGridProps {
  title?: string
  subtitle?: string
  limit?: number
  background?: string
  hp?: any
  initialPartners?: any[]
  initialSectionConfig?: any
}

const partnerGroup = (partner: any) => (partner.group_name || partner.category || "").trim() || "doi-tac-khac"

export default function PartnersGrid({ title: propTitle, subtitle: propSubtitle, hp, initialPartners, initialSectionConfig }: PartnersGridProps) {
  const [allPartners, setAllPartners] = useState<any[]>(initialPartners || [])
  const [sectionConfig, setSectionConfig] = useState<any>(initialSectionConfig ? { ...initialSectionConfig, ...(initialSectionConfig.settings || {}) } : null)

  useEffect(() => {
    let active = true

    const fetchData = async () => {
      try {
        const [homeRes, blockRes, partnersRes] = await Promise.all([
          supabase.from("site_home_sections").select("*").eq("section_key", "partners").maybeSingle(),
          supabase.from("site_page_blocks").select("props").eq("component_type", "partners_grid").limit(1).maybeSingle(),
          supabase.from("partners").select("*").order("sort_order", { ascending: true }),
        ])
        if (!active) return
        const homeData = homeRes.data
        setSectionConfig({ ...(blockRes.data?.props || {}), ...(homeData || {}), ...(homeData?.settings || {}) })
        if (partnersRes.data) setAllPartners(partnersRes.data.filter((partner: any) => partner.is_active !== false))
      } catch (error) {
        console.error("Lỗi tải đối tác:", error)
      }
    }

    if (!initialPartners || !initialSectionConfig) fetchData()

    const channel = supabase
      .channel("public-partners-grid")
      .on("postgres_changes", { event: "*", schema: "public", table: "partners" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_home_sections" }, fetchData)
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [initialPartners, initialSectionConfig])

  if (sectionConfig?.is_visible === false && !propTitle) return null

  const meta = hp?.partners_section || sectionConfig || {}
  const title = propTitle || meta.title || meta.name || "ĐỐI TÁC"
  const subtitle = propSubtitle || meta.subtitle || meta.description || ""

  const partners = allPartners.filter((partner) => partner.is_active !== false)
  if (!partners.length) return null

  // Mỗi hàng là một nhóm danh mục do admin chọn; chưa chọn nhóm nào thì hiện toàn bộ đối tác
  const rowConfigs = [1, 2, 3]
    .map((row) => {
      const groups: string[] = meta[`row${row}_groups`] || (meta[`row${row}_group`] ? [meta[`row${row}_group`]] : [])
      const items = groups.length ? groups.flatMap((group) => partners.filter((partner) => partnerGroup(partner) === group)) : []
      return { row, items, direction: meta[`row${row}_dir`] || (row === 3 ? "right" : "left"), size: (row === 1 ? "lg" : "md") as TileSize }
    })
    .filter((row) => row.items.length > 0)
  const rows = rowConfigs.length ? rowConfigs : [{ row: 1, items: partners, direction: "left", size: "lg" as TileSize }]

  // Kiểu hiển thị: cấu hình mới display_mode; dữ liệu cũ chỉ có hướng trượt thì suy ra từ đó
  const legacyMoving = rows.some((row) => row.direction && row.direction !== "still")
  const mode: DisplayMode = meta.display_mode || (legacyMoving ? "marquee" : "grid")
  const display: PartnerDisplay = { grayscale: meta.logo_grayscale === true, showNames: meta.show_partner_names === true }

  return (
    <section className="relative border-t border-slate-200/60 bg-slate-50 py-16 dark:border-white/10 dark:bg-slate-950 md:py-20">
      <style>{`
        @keyframes gzv-partners-left { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes gzv-partners-right { from { transform: translateX(-50%) } to { transform: translateX(0) } }
      `}</style>

      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl font-black uppercase leading-tight tracking-tight text-slate-950 dark:text-white md:text-5xl">{title}</h2>
          {subtitle && subtitle !== title && <p className="mt-3 text-base font-medium leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">{subtitle}</p>}
        </div>

        <div className="space-y-8">
          {rows.map((row) =>
            mode === "carousel" ? (
              <CarouselRow key={row.row} items={row.items} size={row.size} display={display} autoplay={meta.carousel_autoplay !== false} interval={Number(meta.carousel_interval) || 4} />
            ) : mode === "marquee" && row.direction !== "still" ? (
              <MarqueeRow key={row.row} items={row.items} size={row.size} direction={row.direction} display={display} />
            ) : (
              <GridRow key={row.row} items={row.items} size={row.size} display={display} />
            ),
          )}
        </div>
      </div>
    </section>
  )
}
