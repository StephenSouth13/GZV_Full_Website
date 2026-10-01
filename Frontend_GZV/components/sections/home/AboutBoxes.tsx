"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { api, supabase } from "@/lib/api-supabase"
import SectionIntro from "@/components/sections/common/SectionIntro"
import { combineSectionConfig, groupTeamByDepartment, type TeamData } from "@/lib/home-data"

export interface AboutBoxesProps {
  title?: string
  subtitle?: string
  boxes?: any[]
  limitPerDepartment?: number
  limit?: number
  // Dữ liệu tải sẵn trên server: có thì hiển thị ngay, không nháy nội dung
  initialConfig?: any
  initialTeam?: TeamData
}

function MemberCard({ member, fallbackRole }: { member: any; fallbackRole?: string }) {
  const content = (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-900">
      <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.avatar_url || "/gzvers/default.webp"}
          alt={member.full_name}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          style={{
            objectPosition: `${member.avatar_position_x ?? 50}% ${member.avatar_position_y ?? 25}%`,
            transform: `scale(${(member.avatar_scale || 100) / 100})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="flex min-h-20 flex-1 flex-col items-center justify-center px-3 py-4 text-center">
        <h4 className="text-sm font-bold leading-snug text-[#ed1c24] transition-colors group-hover:text-[#c91218] dark:text-[#ff4d4f] xl:text-base">
          {member.full_name}
        </h4>
        <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {member.position || member.company || member.headline || fallbackRole}
        </p>
      </div>
    </div>
  )
  return member.slug ? (
    <Link href={`/gzver/${member.slug}`} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  )
}

// "Về chúng tôi": mỗi ban (Ban điều hành, Ban cố vấn, GZVers...) là một khối riêng,
// xếp từ trên xuống theo thứ tự kéo-thả trong Admin → GZVer → Cơ cấu ban
export default function AboutBoxes({
  title: propTitle,
  subtitle: propSubtitle,
  limitPerDepartment,
  limit,
  initialConfig,
  initialTeam,
}: AboutBoxesProps) {
  const [config, setConfig] = useState<any>(initialConfig ?? null)
  const [team, setTeam] = useState<TeamData | null>(initialTeam ?? null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [homeRes, blockRes, departmentsRes, members] = await Promise.all([
          supabase.from("site_home_sections").select("*").eq("section_key", "about_boxes").maybeSingle(),
          supabase.from("site_page_blocks").select("props").eq("component_type", "about_boxes").limit(1).maybeSingle(),
          supabase.from("gzver_departments").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
          api.getGzvers(),
        ])
        if (!active) return
        setConfig(combineSectionConfig(homeRes.data, blockRes.data?.props))
        setTeam({ departments: departmentsRes.data || [], members: members || [] })
      } catch (error) {
        console.error("Lỗi tải dữ liệu đội ngũ:", error)
      }
    }

    if (!initialTeam) load()

    const channel = supabase
      .channel("about-boxes:sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "gzvers" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "gzver_departments" }, load)
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [initialTeam])

  const groups = useMemo(() => (team ? groupTeamByDepartment(team) : []), [team])

  if (config?.is_visible === false && !propTitle) return null

  const title = propTitle || config?.title || "VỀ CHÚNG TÔI"
  const subtitle = propSubtitle || config?.subtitle || "Đội ngũ nhân sự, chuyên gia và phòng ban nòng cốt tạo nên giá trị cho GZV."
  // Lưới 4 cột: làm tròn số người mỗi ban lên đủ hàng để không lẻ ô
  const configuredLimit = Number(limitPerDepartment || limit || config?.limitPerDepartment || config?.limit_per_department) || 8
  const maxPerDepartment = Math.ceil(configuredLimit / 4) * 4

  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-900 lg:py-24">
      <div className="container px-4">
        <SectionIntro title={title} subtitle={subtitle} align="left" />

        {!team ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-[4/5.4] animate-pulse rounded-2xl bg-slate-200/70 dark:bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-14 lg:space-y-16">
            {groups.map(({ department, members }) => {
              const shown = members.slice(0, maxPerDepartment)
              const hasMore = members.length > shown.length
              return (
                <div key={department.id}>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ed1c24]">Đội ngũ</p>
                      <h3 className="mt-1 text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white sm:text-3xl">{department.name}</h3>
                      {department.description && (
                        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{department.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{members.length} thành viên</span>
                      {hasMore && (
                        <Link
                          href="/gzver"
                          className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-[#ed1c24] hover:underline"
                        >
                          Xem tất cả <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {shown.map((member) => (
                      <MemberCard key={member.id} member={member} fallbackRole={department.name} />
                    ))}
                  </div>
                </div>
              )
            })}
            {groups.length === 0 && (
              <div className="border border-dashed border-slate-300 p-8 text-center text-sm font-bold text-slate-500 dark:border-white/15 dark:text-slate-400">
                Chưa có hồ sơ public. Thêm GZVer vào đúng ban trong Admin để hiển thị tại đây.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
