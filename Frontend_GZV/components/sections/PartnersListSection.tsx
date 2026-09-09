"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Users, ChevronDown, ChevronUp, Layers, Loader2, Sparkles } from "lucide-react"
import { supabase } from "@/lib/api-supabase"
import { Card } from "@/components/ui/card"

export interface PartnersListSectionProps {
  title?: string
  subtitle?: string
  description?: string
  background?: string
  columns?: number
  show_sidebar?: boolean
  sidebar_title?: string
  groups?: Array<{ key: string; label?: string; visible?: boolean }>
  show_cta?: boolean
  cta_title?: string
  cta_desc?: string
  cta_btn_label?: string
  cta_btn_url?: string
  [key: string]: any
}

interface CategoryItem {
  key: string
  label: string
  aliases?: string[]
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { key: "don-vi-chi-dao", label: "ĐƠN VỊ CHỈ ĐẠO THỰC HIỆN", aliases: ["don-vi-chi-dao", "chi-dao", "governance"] },
  { key: "doi-tac-dong-hanh", label: "ĐỐI TÁC ĐỒNG HÀNH", aliases: ["doi-tac-dong-hanh", "corporate", "dong-hanh"] },
  { key: "dai-hoc-cao-dang", label: "ĐẠI HỌC / CAO ĐẲNG", aliases: ["dai-hoc-cao-dang", "education", "dai-hoc"] },
  { key: "don-vi-bao-tro", label: "ĐƠN VỊ BẢO TRỢ", aliases: ["don-vi-bao-tro", "sponsor", "bao-tro"] },
  { key: "don-vi-thuc-hien", label: "ĐƠN VỊ THỰC HIỆN", aliases: ["don-vi-thuc-hien", "organizer", "thuc-hien"] },
  { key: "doi-tac-khac", label: "ĐỐI TÁC KHÁC", aliases: ["doi-tac-khac", "other", "khac", ""] },
]

export default function PartnersListSection({
  title: propTitle,
  subtitle: propSubtitle,
  description: propDescription,
  background,
  columns = 4,
  show_sidebar = true,
  sidebar_title = "Nhóm đối tác",
  groups: configuredGroups,
  show_cta = false,
  cta_title = "HỢP TÁC CÙNG GZV",
  cta_desc = "Kết nối nguồn nhân lực chất lượng cao, triển khai dự án thực chiến và mở rộng mạng lưới kinh doanh cùng GZV.",
  cta_btn_label = "LIÊN HỆ HỢP TÁC",
  cta_btn_url = "/lien-he",
}: PartnersListSectionProps) {
  const [partners, setPartners] = useState<any[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0)
  const isScrollingRef = useRef(false)

  const isDark = background
    ? String(background).toLowerCase() !== "#ffffff" && String(background).toLowerCase() !== "white"
    : false

  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("partners")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true })

        if (!active) return
        if (error) console.error("Lỗi tải đối tác:", error)
        const loaded = data || []
        setPartners(loaded)

        // Discover custom categories dynamically
        const existingKeys = new Set(INITIAL_CATEGORIES.map((c) => c.key))
        const dynamicCats = [...INITIAL_CATEGORIES]

        loaded.forEach((p) => {
          const catKey = p.category
          if (catKey && !existingKeys.has(catKey)) {
            const isAliased = INITIAL_CATEGORIES.some((c) => c.aliases?.includes(catKey))
            if (!isAliased) {
              existingKeys.add(catKey)
              dynamicCats.push({
                key: catKey,
                label: catKey.replace(/-/g, " ").toUpperCase(),
              })
            }
          }
        })

        setCategories(dynamicCats)
      } catch (err) {
        console.error("Lỗi tải đối tác:", err)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  const matchCategory = (partner: any, catKey: string) => {
    const cat = categories.find((c) => c.key === catKey)
    if (!cat) return partner.category === catKey
    return partner.category === cat.key || (cat.aliases && cat.aliases.includes(partner.category))
  }

  // Group partners into categories
  const groupedPartners = useMemo(() => {
    const result: Array<{ key: string; label: string; partners: any[] }> = []

    let orderedCategories = categories
    if (Array.isArray(configuredGroups) && configuredGroups.length > 0) {
      const catMap = new Map(categories.map((c) => [c.key, c]))
      const customOrdered: CategoryItem[] = []

      configuredGroups.forEach((cg) => {
        if (cg.visible === false) return
        const existing = catMap.get(cg.key) || { key: cg.key, label: cg.label || cg.key }
        customOrdered.push({
          ...existing,
          label: cg.label || existing.label,
        })
        catMap.delete(cg.key)
      })

      orderedCategories = customOrdered
    }

    // Reorder categories so 'doi-tac-khac' (ĐỐI TÁC KHÁC) is always pushed to the very end
    const nonOtherCats = orderedCategories.filter(
      (c) => c.key !== "doi-tac-khac" && !c.aliases?.includes("doi-tac-khac")
    )
    const otherCat = orderedCategories.find(
      (c) => c.key === "doi-tac-khac" || c.aliases?.includes("doi-tac-khac")
    ) || { key: "doi-tac-khac", label: "ĐỐI TÁC KHÁC", aliases: ["doi-tac-khac", "other", "khac", ""] }

    const finalOrderedCats = [...nonOtherCats, otherCat]

    finalOrderedCats.forEach((cat) => {
      const groupPartners = partners.filter((p) => matchCategory(p, cat.key))
      if (groupPartners.length > 0) {
        result.push({
          key: cat.key,
          label: cat.label,
          partners: groupPartners.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
        })
      }
    })

    return result
  }, [categories, partners, configuredGroups])

  // ScrollSpy to highlight active category in sidebar
  useEffect(() => {
    if (groupedPartners.length === 0) return

    const handleScroll = () => {
      if (isScrollingRef.current) return

      const scrollPosition = window.scrollY + 180

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100
      if (isAtBottom) {
        setActiveGroupIndex(groupedPartners.length - 1)
        return
      }

      let activeIndex = 0
      for (let i = 0; i < groupedPartners.length; i++) {
        const el = document.getElementById(`partner-group-${i}`)
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY
          if (scrollPosition >= top) {
            activeIndex = i
          } else {
            break
          }
        }
      }
      setActiveGroupIndex(activeIndex)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [groupedPartners, collapsedGroups])

  const scrollToSection = (index: number) => {
    setActiveGroupIndex(index)
    isScrollingRef.current = true
    const element = document.getElementById(`partner-group-${index}`)
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top: y, behavior: "smooth" })
      setTimeout(() => {
        isScrollingRef.current = false
      }, 800)
    } else {
      isScrollingRef.current = false
    }
  }

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }))
  }

  const gridClass =
    columns === 5
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        : columns === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"

  const title = propTitle || "MẠNG LƯỚI ĐỐI TÁC CHIẾN LƯỢC"
  const subtitle =
    propDescription ||
    propSubtitle ||
    "Đồng hành cùng các tập đoàn, doanh nghiệp và viện trường hàng đầu kiến tạo giá trị thực chiến."

  const renderPartnerCard = (partner: any, index: number) => {
    const cardContent = (
      <motion.div
        key={partner.id}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ delay: index * 0.04, duration: 0.35 }}
        className="h-full"
      >
        <Card className="group relative p-4 h-full bg-white border border-slate-200/90 rounded-none dark:border-white/10 dark:bg-slate-900 flex flex-col items-center justify-between transition-all duration-300 hover:border-[#ed1c24] hover:shadow-md overflow-hidden text-center">
          {/* Logo container */}
          <div className="w-full h-24 flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={partner.logo_url || "/placeholder.jpg"}
              alt={partner.name}
              className="max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Partner info */}
          <div className="w-full pt-2 border-t border-slate-100 dark:border-white/5 space-y-1">
            <h4
              className="text-xs font-black uppercase tracking-tight text-slate-800 dark:text-slate-200 group-hover:text-[#ed1c24] transition-colors line-clamp-2 leading-tight"
              title={partner.name}
            >
              {partner.name}
            </h4>

            {partner.website_url && (
              <div className="pt-1.5 flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-slate-400 group-hover:text-[#ed1c24] transition-colors">
                <span>Truy cập website</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    )

    return partner.website_url ? (
      <a
        key={partner.id}
        href={partner.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full outline-none"
      >
        {cardContent}
      </a>
    ) : (
      <div key={partner.id} className="h-full">
        {cardContent}
      </div>
    )
  }

  return (
    <section
      className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-white/10 select-none"
      style={background ? { background } : undefined}
    >
      <div className="container max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 max-w-4xl text-left">
          <h2
            className={`text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight ${isDark ? "text-white" : "text-slate-900 dark:text-white"
              }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`mt-3 text-base sm:text-lg font-medium leading-relaxed max-w-3xl ${isDark ? "text-slate-300" : "text-slate-600 dark:text-slate-400"
                }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <Loader2 className="h-10 w-10 animate-spin text-[#ed1c24] mb-3" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Đang tải danh sách đối tác...</p>
          </div>
        ) : groupedPartners.length === 0 ? (
          <div className="border border-slate-200 border-l-4 border-l-[#ed1c24] bg-slate-50 p-12 max-w-xl mx-auto text-center rounded-none dark:border-white/10 dark:bg-slate-900">
            <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-base font-black uppercase tracking-widest text-slate-900 dark:text-white">
              Chưa có đối tác nào
            </p>
            <p className="text-xs text-slate-500 mt-2 font-semibold">
              GZV đang mở rộng và chào đón những đối tác chiến lược cùng đồng hành.
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-14 items-start">
            {/* SIDEBAR BÊN TRÁI: DANH MỤC ĐỐI TÁC CỐ ĐỊNH & SCROLLSPY */}
            {show_sidebar && (
              <div className="w-full lg:w-[320px] shrink-0">
                <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-white/10 border-l-4 border-l-[#ed1c24] p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3.5 mb-3.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#ed1c24]" />
                      {sidebar_title}
                    </h3>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5">
                      {partners.length} ĐƠN VỊ
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {groupedPartners.map((group, i) => {
                      const numString = (i + 1).toString().padStart(2, "0")
                      const isActive = activeGroupIndex === i

                      return (
                        <li key={group.key}>
                          <button
                            type="button"
                            onClick={() => scrollToSection(i)}
                            className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-none text-xs uppercase font-black transition-all ${isActive
                                ? "bg-[#ed1c24] text-white shadow-sm"
                                : "hover:bg-slate-100 text-slate-600 hover:text-slate-950 dark:hover:bg-slate-800 dark:text-slate-300"
                              }`}
                          >
                            <div className="flex items-center gap-2.5 text-left truncate pr-2">
                              <span className="font-mono text-[11px] opacity-75 shrink-0">{numString}</span>
                              <span className="truncate">{group.label}</span>
                            </div>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-none shrink-0 ${isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                }`}
                            >
                              {group.partners.length}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* NỘI DUNG CHÍNH BÊN PHẢI: CÁC KHỐI NHÓM ĐỐI TÁC */}
            <div className={`${show_sidebar ? "flex-1 min-w-0" : "w-full"} space-y-10 sm:space-y-14`}>
              {groupedPartners.map((group, i) => {
                const numString = (i + 1).toString().padStart(2, "0")
                const isCollapsed = collapsedGroups[group.key]

                return (
                  <div key={group.key} id={`partner-group-${i}`} className="scroll-mt-28">
                    {/* Header Nhóm có nút Toggle Collapse/Expand */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className="w-full flex items-center gap-3 mb-5 text-left group/header focus:outline-none cursor-pointer border-b border-slate-200 dark:border-white/10 pb-3"
                    >
                      <span className="text-[#ed1c24] font-black text-lg font-mono">{numString}</span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide group-hover/header:text-[#ed1c24] transition-colors">
                        {group.label}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
                        {group.partners.length} đối tác
                      </span>
                      <div className="flex-1" />
                      <div className="text-slate-400 group-hover/header:text-[#ed1c24] transition-colors p-1">
                        {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                      </div>
                    </button>

                    {/* Lưới Logo Đối Tác */}
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          key={`group-content-${group.key}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28 }}
                          className="overflow-hidden"
                        >
                          <div className={`grid gap-4 sm:gap-5 ${gridClass} pb-2`}>
                            {group.partners.map((partner, index) => renderPartnerCard(partner, index))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Optional Embedded CTA Section */}
        {show_cta && (
          <div className="mt-16 sm:mt-20 border border-slate-200 border-t-4 border-t-[#ed1c24] bg-white p-8 sm:p-12 text-center rounded-none dark:border-white/10 dark:bg-slate-900 shadow-2xs">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-3">
              {cta_title}
            </h3>
            {cta_desc && (
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mb-6 font-medium leading-relaxed">
                {cta_desc}
              </p>
            )}
            <a
              href={cta_btn_url || "/lien-he"}
              className="inline-flex items-center justify-center px-8 h-11 bg-[#ed1c24] text-white text-xs font-black uppercase tracking-widest hover:bg-[#c91218] transition-colors shadow-sm"
            >
              {cta_btn_label || "LIÊN HỆ HỢP TÁC"}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
