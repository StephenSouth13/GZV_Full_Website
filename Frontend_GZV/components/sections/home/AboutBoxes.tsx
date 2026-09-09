"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { api, supabase } from "@/lib/api-supabase"
import SectionIntro from "@/components/sections/common/SectionIntro"

export interface DepartmentItem {
  id: string
  name?: string
  description?: string
  color?: string
  sort_order?: number
  [key: string]: any
}

export interface AboutBoxesProps {
  title?: string
  subtitle?: string
  boxes?: any[]
  limitPerDepartment?: number
}

const ORDER_PRIORITY: Record<string, number> = {
  "ban điều hành": 1,
  "ban dieuhanh": 1,
  "ban co van": 2,
  "ban cố vấn": 2,
  "gzver": 3,
  "gzvers": 3,
  "đội ngũ gzver": 3,
}

export default function AboutBoxes({
  title: propTitle,
  subtitle: propSubtitle,
  boxes = [],
  limitPerDepartment = 6,
}: AboutBoxesProps) {
  const [departments, setDepartments] = useState<DepartmentItem[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [activeDepartment, setActiveDepartment] = useState("")
  const [dbProps, setDbProps] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    setLoading(true)
    Promise.all([
      supabase.from("site_home_sections").select("*").eq("section_key", "about_boxes").maybeSingle(),
      supabase.from("site_page_blocks").select("props").eq("component_type", "about_boxes").limit(1).maybeSingle(),
      supabase.from("gzver_departments").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
      api.getGzvers(),
    ])
      .then(([homeRes, blockRes, departmentResult, gzvers]) => {
        if (!active) return
        const homeData = homeRes.data
        const blockProps = blockRes.data?.props
        const combined = { ...(blockProps || {}), ...(homeData || {}), ...(homeData?.settings || {}) }
        setDbProps(combined)

        const departmentRows = departmentResult.data || []
        setDepartments(departmentRows)
        setMembers(gzvers || [])
      })
      .catch((err) => {
        console.error("Lỗi tải dữ liệu phòng ban:", err)
        if (!active) return
        setDepartments([])
        setMembers([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [propTitle, propSubtitle])

  if (dbProps?.is_visible === false && !propTitle) {
    return null
  }

  const title = propTitle || dbProps?.title || "VỀ CHÚNG TÔI"
  const subtitle = propSubtitle || dbProps?.subtitle || "Đội ngũ nhân sự, chuyên gia và phòng ban nòng cốt tạo nên giá trị cho GZV."

  const visibleDepartments = useMemo<DepartmentItem[]>(() => {
    let rawList: DepartmentItem[] = []
    if (departments.length) {
      rawList = departments
    } else {
      rawList = boxes.map((box: any, index: number) => ({
        id: box.key || box.title || String(index),
        name: box.title,
        description: box.description,
        color: "#ed1c24",
        sort_order: index * 10,
      }))
    }

    return [...rawList].sort((a, b) => {
      return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)
    })
  }, [departments, boxes])

  useEffect(() => {
    if (visibleDepartments.length > 0 && !activeDepartment) {
      setActiveDepartment(visibleDepartments[0].id)
    }
  }, [visibleDepartments, activeDepartment])

  const active = visibleDepartments.find((department) => department.id === activeDepartment) || visibleDepartments[0]
  const activeMembers = useMemo(() => {
    if (!active?.id) return []
    const rows = members.filter((member) => {
      const department = member.gzver_departments
      return member.department_id === active.id || department?.id === active.id || member.department_name === active.name || department?.name === active.name
    })
    return rows.slice(0, Number(limitPerDepartment) || 6)
  }, [active, members, limitPerDepartment])

  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-900 lg:py-24">
      <div className="container px-4">
        <SectionIntro title={title} subtitle={subtitle} align="left" />
        <div className="grid gap-5 md:grid-cols-3">
          {visibleDepartments.map((department) => {
            const selected = active?.id === department.id
            return (
              <button
                key={department.id}
                type="button"
                onClick={() => setActiveDepartment(department.id)}
                className={`group flex min-h-[110px] items-center justify-center border p-6 text-center transition ${selected
                  ? "border-[#ed1c24] bg-[#ed1c24] text-white"
                  : "border-slate-200 bg-white text-slate-950 hover:border-[#ed1c24] dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  }`}
              >
                <h3 className="text-2xl font-black uppercase tracking-wide">{department.name}</h3>
              </button>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-white/10 dark:bg-slate-950 lg:p-8">
          <div className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-white/10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Đội ngũ</p>
              <h3 className="mt-1 text-2xl font-black uppercase text-slate-950 dark:text-white sm:text-3xl">{active?.name || "GZVers"}</h3>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{activeMembers.length} hồ sơ đang hiển thị</p>
          </div>

          {loading ? (
            <div className="h-36 animate-pulse bg-slate-100 dark:bg-white/5" />
          ) : activeMembers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-900"
                >
                  {/* Top Image Frame */}
                  <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-slate-900">
                    <img
                      src={member.avatar_url || "/gzvers/default.webp"}
                      alt={member.full_name}
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      style={{
                        objectPosition: `${member.avatar_position_x ?? 50}% ${member.avatar_position_y ?? 25}%`,
                        transform: `scale(${(member.avatar_scale || 100) / 100})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Bottom Text Content */}
                  <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
                    <h4 className="text-base font-bold text-[#ed1c24] transition-colors group-hover:text-[#c91218] dark:text-[#ff4d4f]">
                      {member.full_name}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {member.position || member.company || member.headline || active?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 p-8 text-center text-sm font-bold text-slate-500 dark:border-white/15 dark:text-slate-400">
              Ban này chưa có hồ sơ public. Thêm GZVer vào đúng ban trong admin để hiển thị tại đây.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
