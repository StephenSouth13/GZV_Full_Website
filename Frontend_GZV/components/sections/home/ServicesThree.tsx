"use client"

import { useEffect, useState } from "react"
import { Award, BookOpen, Cpu, Megaphone, Rocket, ShieldCheck, Target, TrendingUp, Users } from "lucide-react"
import SectionIntro from "@/components/sections/common/SectionIntro"
import { supabase } from "@/lib/api-supabase"

const iconMap: Record<string, any> = {
  award: Award,
  book: BookOpen,
  target: Target,
  users: Users,
  shield: ShieldCheck,
  megaphone: Megaphone,
  cpu: Cpu,
  rocket: Rocket,
  trend: TrendingUp,
}

export interface ServicesThreeProps {
  title?: string
  subtitle?: string
  items?: any[]
}

const DEFAULT_SERVICES = [
  { title: "MARKETING & BRANDING", description: "Đào tạo thực chiến & tư vấn chiến lược marketing tổng thể, phát triển thương hiệu đa kênh.", link: "/dich-vu/marketing", icon: "megaphone" },
  { title: "SALES & PHÁT TRIỂN DOANH SỐ", description: "Xây dựng quy trình bán hàng, tối ưu hóa tỷ lệ chuyển đổi và mở rộng thị trường.", link: "/dich-vu", icon: "trend" },
  { title: "DIGITAL TRANSFORMATION", description: "Ứng dụng công nghệ, AI và tự động hóa quy trình vận hành doanh nghiệp hiệu quả.", link: "/dich-vu", icon: "cpu" },
]

export default function ServicesThree({
  title: propTitle,
  subtitle: propSubtitle,
  items: propItems,
}: ServicesThreeProps) {
  const [dbData, setDbData] = useState<any>(null)
  const icons = [Megaphone, TrendingUp, Cpu]

  useEffect(() => {
    let active = true
    Promise.all([
      supabase.from("site_home_sections").select("*").eq("section_key", "services_three").maybeSingle(),
      supabase.from("site_page_blocks").select("props").eq("component_type", "services_three").limit(1).maybeSingle(),
    ])
      .then(([homeRes, blockRes]) => {
        if (!active) return
        const homeData = homeRes.data
        const blockProps = blockRes.data?.props
        const combined = { ...(blockProps || {}), ...(homeData || {}), ...(homeData?.settings || {}) }
        setDbData(combined)
      })
      .catch((e) => {
        console.error("Lỗi khi tải dữ liệu ServicesThree:", e)
      })

    return () => {
      active = false
    }
  }, [])

  if (dbData?.is_visible === false && !propTitle) {
    return null
  }

  const title = propTitle || dbData?.title || "SERVICES"
  const subtitle = propSubtitle || dbData?.subtitle || "Marketing | Sales | Digital Transformation | Education | Events"
  const rawItems = propItems && propItems.length > 0 ? propItems : dbData?.services || dbData?.items || dbData?.settings?.services || dbData?.settings?.items
  const items = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : DEFAULT_SERVICES

  return (
    <section id="dich-vu" className="relative overflow-hidden bg-white py-16 text-slate-950 dark:bg-slate-950 dark:text-white lg:py-24">
      <div className="container px-4">
        <SectionIntro title={title} subtitle={subtitle} align="left" />
        <div className="grid gap-5 lg:grid-cols-3">
          {items.map((item: any, index: number) => {
            const Icon = iconMap[item.icon] || icons[index % icons.length] || Rocket
            return (
              <article key={index} className="group border border-slate-200 bg-slate-50 p-7 transition hover:border-[#ed1c24] dark:border-white/15 dark:bg-white/[0.05]">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center bg-[#ed1c24] text-white"><Icon className="h-7 w-7" /></div>
                  <span className="text-5xl font-black text-slate-200 dark:text-white/10">0{index + 1}</span>
                </div>
                <h3 className="text-2xl font-black uppercase text-slate-950 dark:text-white">{item.title}</h3>
                <p className="mt-4 text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">{item.description || item.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
