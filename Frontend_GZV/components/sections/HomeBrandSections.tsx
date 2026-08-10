"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BarChart3, CheckCircle2, Compass, Cpu, Megaphone, Rocket, ShieldCheck, Target, Users2 } from "lucide-react"
import { getHomeSectionConfig, type HomeSectionConfig } from "@/lib/site-content"

const pillars = [
  {
    title: "Sứ mệnh",
    icon: Target,
    text: "Kết nối tri thức, chuyên gia và doanh nghiệp để tạo ra năng lực tăng trưởng có thể đo lường.",
  },
  {
    title: "Tầm nhìn",
    icon: Compass,
    text: "Trở thành hệ sinh thái mentoring, coaching và triển khai dự án thế hệ mới tại Việt Nam.",
  },
  {
    title: "Giá trị cốt lõi",
    icon: ShieldCheck,
    text: "Thực chiến, minh bạch, học hỏi liên tục và cam kết tạo tác động thật cho đối tác.",
  },
]

const services = [
  {
    title: "Marketing",
    icon: Megaphone,
    text: "Chiến lược thương hiệu, nội dung, chiến dịch tăng trưởng và hệ thống truyền thông đa kênh.",
  },
  {
    title: "Sales",
    icon: BarChart3,
    text: "Thiết kế pipeline, kịch bản bán hàng, đào tạo đội ngũ và tối ưu chuyển đổi doanh thu.",
  },
  {
    title: "Digital Transformation",
    icon: Cpu,
    text: "Chuẩn hóa quy trình, dữ liệu, tự động hóa và công cụ vận hành cho doanh nghiệp.",
  },
]

const reasons = [
  "Đội ngũ mentor và chuyên gia có kinh nghiệm triển khai thực tế.",
  "Cách làm sắc cạnh, rõ mục tiêu, ưu tiên hiệu quả kinh doanh.",
  "Mạng lưới đối tác, GZVers và dự án giúp tăng tốc kết nối thị trường.",
]

const HomeBrandSections = () => {
  const [sections, setSections] = useState<Record<string, HomeSectionConfig | null>>({})

  useEffect(() => {
    let active = true
    Promise.all([
      getHomeSectionConfig("mission"),
      getHomeSectionConfig("services"),
      getHomeSectionConfig("why_choose"),
      getHomeSectionConfig("about_cta"),
    ]).then(([mission, services, whyChoose, aboutCta]) => {
      if (!active) return
      setSections({ mission, services, why_choose: whyChoose, about_cta: aboutCta })
    })
    return () => {
      active = false
    }
  }, [])

  const mission = sections.mission
  const servicesConfig = sections.services
  const whyChoose = sections.why_choose
  const aboutCta = sections.about_cta

  return (
    <>
      {mission?.is_visible !== false && <section className="bg-white py-16 dark:bg-slate-950 lg:py-20">
        <div className="container">
          {(mission?.title || mission?.description) && (
            <div className="mb-10 max-w-3xl">
              <p className="section-kicker">GZV Core</p>
              <h2 className="section-title">{mission.title}</h2>
              {mission.description && <p className="mt-4 text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">{mission.description}</p>}
            </div>
          )}
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="group border border-slate-200 bg-white p-7 shadow-[0_16px_38px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:border-[#00539b] dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center bg-[#00539b] text-white transition group-hover:bg-[#ed1c24]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mb-3 text-2xl font-black uppercase text-slate-950 dark:text-white">{item.title}</h2>
                  <p className="text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">{item.text}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>}

      {servicesConfig?.is_visible !== false && <section id="dich-vu" className="relative overflow-hidden bg-[#050505] py-16 text-white lg:py-24">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#00539b]/20" />
        <div className="container relative z-10">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/15 pb-8 lg:flex-row lg:items-end">
            <div>
              <p className="section-kicker bg-white/10 text-white">Services</p>
              <h2 className="section-title text-white">{servicesConfig?.title || "Dịch vụ GZV"}</h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-7 text-white/70">
              {servicesConfig?.description || "Ba mũi triển khai chính giúp doanh nghiệp xây dựng thương hiệu, tăng doanh thu và vận hành bằng công nghệ."}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {services.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="group border border-white/15 bg-white/[0.06] p-7 backdrop-blur transition hover:border-[#ed1c24] hover:bg-white/[0.09]"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center bg-[#ed1c24] text-white">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-5xl font-black text-white/10">0{index + 1}</span>
                  </div>
                  <h3 className="mb-4 text-2xl font-black uppercase text-white">{item.title}</h3>
                  <p className="mb-7 text-sm font-semibold leading-7 text-white/70">{item.text}</p>
                  <Link href="/lien-he" className="inline-flex items-center text-xs font-black uppercase text-[#ed1c24] transition group-hover:text-white">
                    Trao đổi nhu cầu <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>}

      {whyChoose?.is_visible !== false && <section className="bg-slate-50 py-16 dark:bg-slate-900 lg:py-24">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              viewport={{ once: true }}
              className="relative min-h-[440px] overflow-hidden border border-slate-200 bg-slate-200 dark:border-slate-800"
            >
              <Image src="/gioi-thieu/19.webp" alt="GZV mentoring" fill unoptimized className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/12 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <p className="text-xs font-black uppercase text-[#ed1c24]">Về chúng tôi</p>
                <h2 className="mt-2 text-3xl font-black uppercase">GZV xây đội ngũ qua dự án thật</h2>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              viewport={{ once: true }}
            >
              <p className="section-kicker">Tại sao nên chọn chúng tôi</p>
              <h2 className="section-title mb-6">{whyChoose?.title || "Sắc cạnh trong tư duy, chắc tay trong triển khai"}</h2>
              <p className="mb-8 text-base font-semibold leading-8 text-slate-600 dark:text-slate-300">
                {whyChoose?.description || "GZV kết hợp mô hình mentoring với năng lực triển khai dịch vụ để tạo ra môi trường học, làm và tăng trưởng cùng nhau."}
              </p>
              <div className="grid gap-4">
                {reasons.map((reason) => (
                  <div key={reason} className="flex gap-4 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#ed1c24]" />
                    <p className="text-sm font-bold leading-7 text-slate-700 dark:text-slate-200">{reason}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-3 border border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-950">
                {[
                  ["Ban điều hành", "Directors"],
                  ["Ban cố vấn", "Mentors"],
                  ["GZVer", "Community"],
                ].map(([label, sub]) => (
                  <div key={label} className="border-r border-slate-200 p-4 last:border-r-0 dark:border-slate-800">
                    <Users2 className="mx-auto mb-2 h-5 w-5 text-[#00539b]" />
                    <p className="text-xs font-black uppercase text-slate-950 dark:text-white">{label}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>}

      {aboutCta?.is_visible !== false && <section className="bg-white py-12 dark:bg-slate-950">
        <div className="container">
          <div className="flex flex-col gap-5 border-y border-slate-200 py-8 md:flex-row md:items-center md:justify-between dark:border-slate-800">
            <div>
              <p className="text-xs font-black uppercase text-[#ed1c24]">Lộ trình phát triển của GZV</p>
              <h2 className="mt-2 text-2xl font-black uppercase text-slate-950 dark:text-white">{aboutCta?.title || "Mentoring model, project network, next-gen growth."}</h2>
            </div>
            <Link href={aboutCta?.button_url || "/gioi-thieu"} className="inline-flex items-center justify-center bg-[#00539b] px-6 py-4 text-xs font-black uppercase text-white transition hover:bg-[#ed1c24]">
              {aboutCta?.button_label || "Tìm hiểu thêm"} <Rocket className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>}
    </>
  )
}

export default HomeBrandSections
