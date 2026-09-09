"use client"

import { useRef, useState, useEffect } from "react"
import { supabase } from "@/lib/api-supabase"

interface InfiniteMarqueeRowProps {
  items: any[]
  direction: string
  sizeClass: string
  logoClass: string
  maxVisible: number
}

const InfiniteMarqueeRow = ({
  items,
  direction,
  sizeClass,
  logoClass,
  maxVisible,
}: InfiniteMarqueeRowProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const contentWidth = contentRef.current.scrollWidth

        // Kiểm tra xem logo có thực sự tràn màn hình hay không
        setIsOverflowing(items.length > maxVisible || contentWidth > containerWidth + 5)
      }
    }

    checkOverflow()
    window.addEventListener("resize", checkOverflow)
    const timer = setTimeout(checkOverflow, 500)

    return () => {
      window.removeEventListener("resize", checkOverflow)
      clearTimeout(timer)
    }
  }, [items, maxVisible])

  if (!items.length) return null

  const renderLogo = (partner: any) => {
    const imgNode = (
      <img
        src={partner.logo_url || partner.image || "/placeholder.jpg"}
        alt={partner.name || partner.title || "GZV Partner"}
        className={`object-contain ${logoClass}`}
        loading="lazy"
      />
    )

    return partner.website_url ? (
      <a
        href={partner.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-full flex items-center justify-center outline-none"
      >
        {imgNode}
      </a>
    ) : (
      <div className="w-full h-full flex items-center justify-center">{imgNode}</div>
    )
  }

  // ĐÃ XÓA HOVER: Không nổi viền shadow, không nổi z-index khi rê chuột
  const logoBoxClass = `flex items-center justify-center shrink-0 relative border border-slate-200/80 bg-white -ml-px -mt-px dark:border-white/10 dark:bg-slate-900 ${sizeClass}`

  // LOGIC: Sẽ kích hoạt trượt nếu Vượt quá số ô HOẶC Admin cố tình cài đặt hướng trượt (khác "still")
  const shouldScroll = isOverflowing || direction !== "still"

  // TRẠNG THÁI 1: ÍT Ô & ADMIN CHỌN "ĐỨNG YÊN" (Không trượt)
  if (!shouldScroll) {
    return (
      <div className="w-full flex justify-center items-center overflow-hidden">
        <div ref={containerRef} className="absolute inset-0 pointer-events-none opacity-0" />
        <div ref={contentRef} className="flex flex-nowrap justify-center items-stretch">
          {items.map((partner, idx) => (
            <div key={partner.id || `${partner.name}-${idx}`} className={logoBoxClass}>
              {renderLogo(partner)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // TRẠNG THÁI 2: CHẠY MARQUEE
  // Nếu Admin quên set nhưng bị tràn, tự động ép chạy sang trái để giữ an toàn layout
  const effectiveDirection = direction === "still" ? "left" : direction

  // TÍNH TOÁN NHÂN BẢN: Nếu số lượng item quá ít mà ép chạy, phải nhân bản cho đến khi vượt màn hình
  let baseItems = [...items]
  while (baseItems.length < maxVisible + 2) {
    baseItems = [...baseItems, ...items]
  }
  const repeatedItems = [...baseItems, ...baseItems, ...baseItems]

  const animationClass = effectiveDirection === "left" ? "animate-marquee-left" : "animate-marquee-right"

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden relative"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
      }}
    >
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div ref={contentRef} className="flex flex-nowrap items-center">
          {items.map((partner, idx) => (
            <div key={`measure-${partner.id || idx}`} className={logoBoxClass}>
              <img src={partner.logo_url || partner.image || ""} alt="" />
            </div>
          ))}
        </div>
      </div>

      {/* ĐÃ XÓA HOVER: Bỏ group-hover:[animation-play-state:paused] - Trượt liên tục không dừng */}
      <div className={`flex items-stretch w-max ${animationClass}`}>
        {repeatedItems.map((partner, idx) => (
          <div key={`${partner.id || partner.name}-${idx}`} className={logoBoxClass}>
            {renderLogo(partner)}
          </div>
        ))}
      </div>
    </div>
  )
}

export interface PartnersGridProps {
  title?: string
  subtitle?: string
  limit?: number
  background?: string
  hp?: any
}

export default function PartnersGrid({
  title: propTitle,
  subtitle: propSubtitle,
  hp,
}: PartnersGridProps) {
  const [allPartners, setAllPartners] = useState<any[]>([])
  const [sectionConfig, setSectionConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const [homeRes, blockRes, partnersRes] = await Promise.all([
          supabase.from("site_home_sections").select("*").eq("section_key", "partners").maybeSingle(),
          supabase.from("site_page_blocks").select("props").eq("component_type", "partners_grid").limit(1).maybeSingle(),
          supabase
            .from("partners")
            .select("*")
            .order("sort_order", { ascending: true }),
        ])

        if (!active) return

        const homeData = homeRes.data
        const blockProps = blockRes.data?.props
        const combined = { ...(blockProps || {}), ...(homeData || {}), ...(homeData?.settings || {}) }
        setSectionConfig(combined)

        if (partnersRes.data && partnersRes.data.length > 0) {
          const activeOnly = partnersRes.data.filter((p: any) => p.is_active !== false)
          setAllPartners(activeOnly.length > 0 ? activeOnly : partnersRes.data)
        }
      } catch (err: any) {
        console.error("Lỗi tải đối tác:", err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()

    return () => {
      active = false
    }
  }, [])

  if (sectionConfig?.is_visible === false && !propTitle) {
    return null
  }

  const meta = hp?.partners_section || sectionConfig || {}
  const title = propTitle || meta.title || meta.name || ""
  const subtitle = propSubtitle || meta.subtitle || meta.description || ""

  const displayTitle = title || subtitle || "ĐỐI TÁC"

  const row1Dir = meta.row1_dir || "still"
  const row2Dir = meta.row2_dir || "left"
  const row3Dir = meta.row3_dir || "right"

  if (loading && !allPartners.length) {
    return (
      <section className="py-20 relative bg-white dark:bg-slate-950 text-center">
        <div className="mx-auto h-10 w-10 animate-spin border-2 border-[#ed1c24] border-t-transparent" />
      </section>
    )
  }

  if (!allPartners.length) return null

  // Categorize partners into 3 rows strictly according to admin configuration
  const row1Groups: string[] = meta.row1_groups || (meta.row1_group ? [meta.row1_group] : [])
  const row2Groups: string[] = meta.row2_groups || (meta.row2_group ? [meta.row2_group] : [])
  const row3Groups: string[] = meta.row3_groups || (meta.row3_group ? [meta.row3_group] : [])

  const hasConfiguredRows = row1Groups.length > 0 || row2Groups.length > 0 || row3Groups.length > 0

  let row1Partners = row1Groups.length > 0 ? allPartners.filter((p) => {
    const grp = p.group_name || p.category
    return grp && row1Groups.includes(grp)
  }) : []

  let row2Partners = row2Groups.length > 0 ? allPartners.filter((p) => {
    const grp = p.group_name || p.category
    return grp && row2Groups.includes(grp)
  }) : []

  let row3Partners = row3Groups.length > 0 ? allPartners.filter((p) => {
    const grp = p.group_name || p.category
    return grp && row3Groups.includes(grp)
  }) : []

  // If admin has not added any categories to any row, do not display logos
  if (!hasConfiguredRows) {
    return null
  }

  return (
    <section className="py-20 relative border-t border-slate-200/60 bg-white dark:bg-slate-950 dark:border-white/10">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-33.3333%); } }
        @keyframes scrollRight { 0% { transform: translateX(-33.3333%); } 100% { transform: translateX(0); } }
        .animate-marquee-left { animation: scrollLeft 40s linear infinite; }
        .animate-marquee-right { animation: scrollRight 40s linear infinite; }
      `,
        }}
      />

      <div className="container mx-auto px-4 text-left mb-12 relative z-10 max-w-7xl">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-tight">
          {displayTitle.includes("VƯỢT TRỘI") ? (
            <>
              {displayTitle.split("VƯỢT TRỘI")[0]}
              <span className="text-[#ed1c24]">VƯỢT TRỘI</span>
              {displayTitle.split("VƯỢT TRỘI")[1]}
            </>
          ) : (
            displayTitle
          )}
        </h2>
        {subtitle && subtitle !== displayTitle && (
          <p className="mt-3 text-base sm:text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-400 max-w-3xl">
            {subtitle.includes("VƯỢT TRỘI") ? (
              <>
                {subtitle.split("VƯỢT TRỘI")[0]}
                <span className="text-[#ed1c24]">VƯỢT TRỘI</span>
                {subtitle.split("VƯỢT TRỘI")[1]}
              </>
            ) : (
              subtitle
            )}
          </p>
        )}
      </div>

      <div className="w-full max-w-[1184px] mx-auto relative z-0 flex flex-col">
        {row1Partners.length > 0 && (
          <InfiniteMarqueeRow
            items={row1Partners}
            direction={row1Dir}
            sizeClass="w-[197.33px] h-[210px]"
            logoClass="max-w-[150px] max-h-[110px]"
            maxVisible={6}
          />
        )}

        {row2Partners.length > 0 && (
          <InfiniteMarqueeRow
            items={row2Partners}
            direction={row2Dir}
            sizeClass="w-[148px] h-[158px]"
            logoClass="max-w-[110px] max-h-[80px]"
            maxVisible={8}
          />
        )}

        {row3Partners.length > 0 && (
          <InfiniteMarqueeRow
            items={row3Partners}
            direction={row3Dir}
            sizeClass="w-[148px] h-[158px]"
            logoClass="max-w-[110px] max-h-[80px]"
            maxVisible={8}
          />
        )}
      </div>
    </section>
  )
}
