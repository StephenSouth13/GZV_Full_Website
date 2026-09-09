"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api, supabase } from "@/lib/api-supabase"

export interface GzversGridProps {
  title?: string
  subtitle?: string
  limit?: number
  background?: string
  show_all_tab?: boolean
  department_order?: string[]
  selected_departments?: string[]
  [key: string]: any
}

export default function GzversGrid({
  title: propTitle,
  subtitle: propSubtitle,
  limit = 50,
  background,
  show_all_tab = true,
  department_order,
  selected_departments,
}: GzversGridProps) {
  const [items, setItems] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [dbData, setDbData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")

  const isDark = background ? String(background).toLowerCase() !== "#ffffff" && String(background).toLowerCase() !== "white" : false

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      supabase.from("site_home_sections").select("*").eq("section_key", "gzvers").maybeSingle(),
      api.getGzvers(),
      supabase
        .from("gzver_departments")
        .select("id, name, slug, description, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ])
      .then(([homeRes, data, deptsRes]) => {
        if (!active) return
        if (homeRes.data) {
          setDbData(homeRes.data)
        }
        setItems(data || [])
        setDepartments(deptsRes.data || [])
      })
      .catch((err) => {
        console.error("Lỗi tải dữ liệu GZVers:", err)
        if (!active) return
        setItems([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Order active departments based strictly on section configuration
  const orderedDepts = useMemo(() => {
    const activeDepts = departments.filter((d) => d.is_active !== false)
    if (activeDepts.length === 0) return []

    // If selected_departments is provided, filter to only those keys
    let available = activeDepts
    if (Array.isArray(selected_departments) && selected_departments.length > 0) {
      const selectedSet = new Set(selected_departments)
      available = activeDepts.filter((d) => selectedSet.has(d.slug || d.id) || selectedSet.has(d.id))
    }

    // If department_order is configured, sort by that order
    if (Array.isArray(department_order) && department_order.length > 0) {
      const deptMap = new Map(available.map((d) => [d.slug || d.id, d]))
      const result: any[] = []
      const visited = new Set<string>()

      department_order.forEach((key) => {
        const d = deptMap.get(key) || available.find((item) => item.slug === key || item.id === key)
        if (d && !visited.has(d.slug || d.id)) {
          result.push(d)
          visited.add(d.slug || d.id)
        }
      })

      // Append any remaining available departments
      available.forEach((d) => {
        const key = d.slug || d.id
        if (!visited.has(key)) {
          result.push(d)
          visited.add(key)
        }
      })

      return result
    }

    return available
  }, [departments, selected_departments, department_order])

  // Build filter tabs
  const filterTabs = useMemo(() => {
    const tabs: Array<{ id: string; label: string; dept?: any }> = []
    if (show_all_tab !== false) {
      tabs.push({ id: "all", label: "Tất cả" })
    }

    orderedDepts.forEach((dept) => {
      tabs.push({
        id: dept.slug || dept.id,
        label: dept.name,
        dept,
      })
    })

    // Fallback if no departments from DB yet
    if (tabs.length === 0 || (tabs.length === 1 && tabs[0].id === "all" && orderedDepts.length === 0 && !loading)) {
      return [
        { id: "all", label: "Tất cả" },
        { id: "ban-dieu-hanh", label: "Ban điều hành" },
        { id: "ban-co-van", label: "Ban cố vấn" },
        { id: "ban-thuc-thi", label: "Ban thực thi" },
      ]
    }

    return tabs
  }, [show_all_tab, orderedDepts, loading])

  // Ensure activeFilter is valid
  useEffect(() => {
    if (filterTabs.length > 0 && !filterTabs.some((t) => t.id === activeFilter)) {
      setActiveFilter(filterTabs[0].id)
    }
  }, [filterTabs, activeFilter])

  // Department matching helper
  const matchDepartment = (m: any, tab: { id: string; label: string; dept?: any }) => {
    if (tab.id === "all") return true
    const dept = tab.dept
    const deptId = dept?.id
    const deptSlug = (dept?.slug || tab.id).toLowerCase()
    const deptName = (dept?.name || tab.label).toLowerCase()

    // 1. Direct ID match (Highest priority)
    if (deptId && (m.department_id === deptId || m.gzver_departments?.id === deptId)) {
      return true
    }

    // 2. Direct Name / Slug match
    const mDeptName = (m.department_name || m.gzver_departments?.name || "").toLowerCase()
    const mDeptSlug = (m.department_slug || m.gzver_departments?.slug || "").toLowerCase()
    if (mDeptName && (mDeptName === deptName || mDeptName.includes(deptName) || deptName.includes(mDeptName))) {
      return true
    }
    if (mDeptSlug && (mDeptSlug === deptSlug || mDeptSlug.includes(deptSlug))) {
      return true
    }

    // 3. If member already has an assigned department, do not run legacy fallbacks
    if (m.department_id || m.department_name || m.gzver_departments) {
      return false
    }

    // 4. Legacy fallback for old records without department_id
    if (deptSlug.includes("dieu-hanh") || deptName.includes("điều hành") || deptSlug.includes("director")) {
      return Boolean(
        m.is_director ||
        m.position?.toLowerCase().includes("ceo") ||
        m.position?.toLowerCase().includes("director")
      )
    }

    if (deptSlug.includes("co-van") || deptName.includes("cố vấn") || deptSlug.includes("advisor") || deptSlug.includes("mentor")) {
      return Boolean(
        m.is_advisor ||
        m.is_mentor ||
        m.position?.toLowerCase().includes("cố vấn") ||
        m.position?.toLowerCase().includes("advisor") ||
        m.position?.toLowerCase().includes("mentor")
      )
    }

    if (deptSlug.includes("thuc-thi") || deptName.includes("thực thi") || deptSlug.includes("executor") || deptSlug.includes("gzvers")) {
      return Boolean(
        !m.is_director &&
        !m.is_advisor &&
        !m.is_mentor
      )
    }

    return false
  }

  const activeTabObj = useMemo(() => {
    return filterTabs.find((t) => t.id === activeFilter) || filterTabs[0] || { id: "all", label: "Tất cả" }
  }, [filterTabs, activeFilter])

  const filteredItems = useMemo(() => {
    if (!activeTabObj) return items.slice(0, Number(limit) || 50)
    const list = items.filter((m) => matchDepartment(m, activeTabObj))
    return list.slice(0, Number(limit) || 50)
  }, [items, activeTabObj, limit])

  if (dbData?.is_visible === false && !propTitle) {
    return null
  }

  const title = propTitle || dbData?.title || "ĐỘI NGŨ NHÂN SỰ GZV"
  const subtitle = propSubtitle || dbData?.subtitle || "Đội ngũ nhân sự, cố vấn và chuyên gia đồng hành"

  // Description for the active department
  const currentDeptDescription = useMemo(() => {
    if (activeFilter === "all") return null
    if (activeTabObj?.dept?.description) return activeTabObj.dept.description

    const slug = (activeTabObj?.dept?.slug || activeFilter).toLowerCase()
    const name = (activeTabObj?.label || "").toLowerCase()
    if (slug.includes("dieu-hanh") || name.includes("điều hành")) {
      return "Chịu trách nhiệm định hướng chiến lược tổng thể, hoạch định phát triển hệ sinh thái và quản trị vận hành tổ chức GZV."
    }
    if (slug.includes("co-van") || name.includes("cố vấn")) {
      return "Hội đồng cố vấn quy tụ các chuyên gia đầu ngành, tiến sĩ, thạc sĩ định hướng nghiên cứu học thuật và cố vấn chuyên môn chuyên sâu."
    }
    if (slug.includes("thuc-thi") || name.includes("thực thi")) {
      return "Đội ngũ nhân sự nòng cốt, tài năng trực tiếp thực thi các dự án công nghệ, sáng tạo nội dung, đào tạo và vận hành chương trình."
    }
    return `Bộ phận ${activeTabObj?.label || ""} trực thuộc hệ sinh thái GZV.`
  }, [activeFilter, activeTabObj])

  return (
    <section className="bg-white py-16 dark:bg-gray-900 sm:py-20" style={background ? { background } : undefined}>
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mb-10 max-w-4xl text-left">
            {title && (
              <h2 className={`text-3xl font-black uppercase tracking-tight sm:text-5xl ${isDark ? "text-white" : "text-gray-900 dark:text-white"}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`mt-3 text-base sm:text-lg font-medium ${isDark ? "text-white/70" : "text-gray-600 dark:text-gray-300"}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Filter Tabs Toolbar */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => {
              const count = items.filter((m) => matchDepartment(m, tab)).length
              const isSelected = activeFilter === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`group relative h-11 px-5 text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 border ${isSelected
                      ? "border-[#ed1c24] bg-[#ed1c24] text-white shadow-md shadow-red-500/20"
                      : isDark
                        ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#ed1c24] hover:bg-white/10 hover:text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#ed1c24] hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold ${isSelected
                        ? "bg-white/20 text-white"
                        : isDark
                          ? "bg-white/10 text-white/70"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Department Description Card */}
          {activeFilter !== "all" && currentDeptDescription && (
            <div
              className={`border-l-4 border-l-[#ed1c24] border border-y-slate-200 border-r-slate-200 p-4 transition-all duration-300 ${isDark
                  ? "border-y-white/10 border-r-white/10 bg-white/5"
                  : "bg-slate-50/90 dark:border-y-white/10 dark:border-r-white/10 dark:bg-slate-900/90"
                }`}
            >
              <p
                className={`text-sm sm:text-base font-semibold leading-relaxed ${isDark ? "text-white" : "text-slate-900 dark:text-white"
                  }`}
              >
                {currentDeptDescription}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#ed1c24]" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang tải dữ liệu nhân sự...</p>
          </div>
        ) : activeFilter === "all" ? (
          /* Khi chọn "TẤT CẢ": Phân nhóm theo từng Ban rõ ràng, khoa học */
          <div className="space-y-12">
            {filterTabs
              .filter((tab) => tab.id !== "all")
              .map((tab) => {
                const deptMembers = items.filter((m) => matchDepartment(m, tab))
                if (deptMembers.length === 0) return null

                return (
                  <div key={tab.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-white/10 dark:bg-slate-950 lg:p-8">
                    {/* Header từng ban */}
                    <div className="mb-8 flex flex-col gap-2 border-b border-slate-200 pb-5 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">
                          Phòng ban / Đơn vị
                        </span>
                        <h3 className="mt-1 text-2xl font-black uppercase text-slate-950 dark:text-white">
                          {tab.label}
                        </h3>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        {deptMembers.length} thành viên
                      </span>
                    </div>

                    {/* Lưới danh sách thành viên */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {deptMembers.map((item, index) => (
                        <GzverCardItem key={item.id || item.slug || index} item={item} />
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        ) : filteredItems.length > 0 ? (
          /* Khi chọn một Ban cụ thể */
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-white/10 dark:bg-slate-950 lg:p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item, index) => (
                <GzverCardItem key={item.id || item.slug || index} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-slate-100 bg-slate-50 py-16 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400">
            Chưa có nhân sự trong mục này.
          </div>
        )}
      </div>
    </section>
  )
}

function GzverCardItem({ item }: { item: any }) {
  const name = item.full_name || item.title || item.name || "GZVer"
  const image = item.avatar_url || item.image || "/gzvers/default.webp"
  const position = item.position || item.role_level || item.company || "GZVer"
  const href = item.slug ? `/gzver/${item.slug}` : `/gzver`

  return (
    <Link href={href} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-900">
        {/* Top Image Frame */}
        <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-slate-900">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            style={{
              objectPosition: `${item.avatar_position_x ?? 50}% ${item.avatar_position_y ?? 25}%`,
              transform: `scale(${(item.avatar_scale || 100) / 100})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Bottom Text Content */}
        <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
          <h4 className="text-base font-bold text-[#ed1c24] transition-colors group-hover:text-[#c91218] dark:text-[#ff4d4f]">
            {name}
          </h4>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {position}
          </p>
        </div>
      </div>
    </Link>
  )
}
