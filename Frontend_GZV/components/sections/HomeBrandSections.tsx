"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BarChart3, CheckCircle2, Compass, Cpu, Megaphone, Rocket, ShieldCheck, Target, Users2 } from "lucide-react"
import { getHomeSectionConfig, type HomeSectionConfig } from "@/lib/site-content"

const pillars = [
  {
    title: "Sá»© má»‡nh",
    icon: Target,
    text: "Káº¿t ná»‘i tri thá»©c, chuyÃªn gia vÃ  doanh nghiá»‡p Ä‘á»ƒ táº¡o ra nÄƒng lá»±c tÄƒng trÆ°á»Ÿng cÃ³ thá»ƒ Ä‘o lÆ°á»ng.",
  },
  {
    title: "Táº§m nhÃ¬n",
    icon: Compass,
    text: "Trá»Ÿ thÃ nh há»‡ sinh thÃ¡i mentoring, coaching vÃ  triá»ƒn khai dá»± Ã¡n tháº¿ há»‡ má»›i táº¡i Viá»‡t Nam.",
  },
  {
    title: "GiÃ¡ trá»‹ cá»‘t lÃµi",
    icon: ShieldCheck,
    text: "Thá»±c chiáº¿n, minh báº¡ch, há»c há»i liÃªn tá»¥c vÃ  cam káº¿t táº¡o tÃ¡c Ä‘á»™ng tháº­t cho Ä‘á»‘i tÃ¡c.",
  },
]

const services = [
  {
    title: "Marketing",
    icon: Megaphone,
    text: "Chiáº¿n lÆ°á»£c thÆ°Æ¡ng hiá»‡u, ná»™i dung, chiáº¿n dá»‹ch tÄƒng trÆ°á»Ÿng vÃ  há»‡ thá»‘ng truyá»n thÃ´ng Ä‘a kÃªnh.",
  },
  {
    title: "Sales",
    icon: BarChart3,
    text: "Thiáº¿t káº¿ pipeline, ká»‹ch báº£n bÃ¡n hÃ ng, Ä‘Ã o táº¡o Ä‘á»™i ngÅ© vÃ  tá»‘i Æ°u chuyá»ƒn Ä‘á»•i doanh thu.",
  },
  {
    title: "Digital Transformation",
    icon: Cpu,
    text: "Chuáº©n hÃ³a quy trÃ¬nh, dá»¯ liá»‡u, tá»± Ä‘á»™ng hÃ³a vÃ  cÃ´ng cá»¥ váº­n hÃ nh cho doanh nghiá»‡p.",
  },
]

const reasons = [
  "Äá»™i ngÅ© mentor vÃ  chuyÃªn gia cÃ³ kinh nghiá»‡m triá»ƒn khai thá»±c táº¿.",
  "CÃ¡ch lÃ m sáº¯c cáº¡nh, rÃµ má»¥c tiÃªu, Æ°u tiÃªn hiá»‡u quáº£ kinh doanh.",
  "Máº¡ng lÆ°á»›i Ä‘á»‘i tÃ¡c, GZVers vÃ  dá»± Ã¡n giÃºp tÄƒng tá»‘c káº¿t ná»‘i thá»‹ trÆ°á»ng.",
]


const iconMap: Record<string, any> = {
  target: Target,
  compass: Compass,
  shield: ShieldCheck,
  megaphone: Megaphone,
  chart: BarChart3,
  cpu: Cpu,
  rocket: Rocket,
  users: Users2,
}
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
  const missionPillars = Array.isArray(mission?.settings?.pillars) && mission.settings.pillars.length ? mission.settings.pillars : pillars
  const serviceItems = Array.isArray(servicesConfig?.settings?.services) && servicesConfig.settings.services.length ? servicesConfig.settings.services : services
  const reasonItems = Array.isArray(whyChoose?.settings?.reasons) && whyChoose.settings.reasons.length ? whyChoose.settings.reasons : reasons
  const whyImage = typeof whyChoose?.settings?.image_url === "string" && whyChoose.settings.image_url ? whyChoose.settings.image_url : "/gioi-thieu/19.webp"

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
            {missionPillars.map((item: any, index: number) => {
              const Icon = typeof item.icon === "string" ? iconMap[item.icon] || Target : item.icon || pillars[index]?.icon || Target
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="group border border-slate-200 bg-white p-7 shadow-[0_16px_38px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:border-[#ed1c24] dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center bg-[#ed1c24] text-white transition group-hover:bg-[#ed1c24]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mb-3 text-2xl font-black uppercase text-slate-950 dark:text-white">{item.title}</h2>
                  <p className="text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">{item.text || item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>}

      {servicesConfig?.is_visible !== false && <section id="dich-vu" className="relative overflow-hidden bg-[#050505] py-16 text-white lg:py-24">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#ed1c24]/20" />
        <div className="container relative z-10">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/15 pb-8 lg:flex-row lg:items-end">
            <div>
              <p className="section-kicker bg-white/10 text-white">Services</p>
              <h2 className="section-title text-white">{servicesConfig?.title || "Dá»‹ch vá»¥ GZV"}</h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-7 text-white/70">
              {servicesConfig?.description || "Ba mÅ©i triá»ƒn khai chÃ­nh giÃºp doanh nghiá»‡p xÃ¢y dá»±ng thÆ°Æ¡ng hiá»‡u, tÄƒng doanh thu vÃ  váº­n hÃ nh báº±ng cÃ´ng nghá»‡."}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {serviceItems.map((item: any, index: number) => {
              const Icon = typeof item.icon === "string" ? iconMap[item.icon] || Rocket : item.icon || services[index]?.icon || Rocket
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
                  <p className="mb-7 text-sm font-semibold leading-7 text-white/70">{item.text || item.description}</p>
                  <Link href="/lien-he" className="inline-flex items-center text-xs font-black uppercase text-[#ed1c24] transition group-hover:text-white">
                    Trao Ä‘á»•i nhu cáº§u <ArrowRight className="ml-2 h-4 w-4" />
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
              <Image src={whyImage} alt="GZV mentoring" fill unoptimized className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/12 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <p className="text-xs font-black uppercase text-[#ed1c24]">Vá» chÃºng tÃ´i</p>
                <h2 className="mt-2 text-3xl font-black uppercase">GZV xÃ¢y Ä‘á»™i ngÅ© qua dá»± Ã¡n tháº­t</h2>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              viewport={{ once: true }}
            >
              <p className="section-kicker">Táº¡i sao nÃªn chá»n chÃºng tÃ´i</p>
              <h2 className="section-title mb-6">{whyChoose?.title || "Sáº¯c cáº¡nh trong tÆ° duy, cháº¯c tay trong triá»ƒn khai"}</h2>
              <p className="mb-8 text-base font-semibold leading-8 text-slate-600 dark:text-slate-300">
                {whyChoose?.description || "GZV káº¿t há»£p mÃ´ hÃ¬nh mentoring vá»›i nÄƒng lá»±c triá»ƒn khai dá»‹ch vá»¥ Ä‘á»ƒ táº¡o ra mÃ´i trÆ°á»ng há»c, lÃ m vÃ  tÄƒng trÆ°á»Ÿng cÃ¹ng nhau."}
              </p>
              <div className="grid gap-4">
                {reasonItems.map((reason: any) => (
                  <div key={typeof reason === "string" ? reason : reason.title || reason.text} className="flex gap-4 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#ed1c24]" />
                    <p className="text-sm font-bold leading-7 text-slate-700 dark:text-slate-200">{typeof reason === "string" ? reason : reason.text || reason.description || reason.title}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-3 border border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-950">
                {[
                  ["Ban Ä‘iá»u hÃ nh", "Directors"],
                  ["Ban cá»‘ váº¥n", "Mentors"],
                  ["GZVer", "Community"],
                ].map(([label, sub]) => (
                  <div key={label} className="border-r border-slate-200 p-4 last:border-r-0 dark:border-slate-800">
                    <Users2 className="mx-auto mb-2 h-5 w-5 text-[#ed1c24]" />
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
              <p className="text-xs font-black uppercase text-[#ed1c24]">Lá»™ trÃ¬nh phÃ¡t triá»ƒn cá»§a GZV</p>
              <h2 className="mt-2 text-2xl font-black uppercase text-slate-950 dark:text-white">{aboutCta?.title || "Mentoring model, project network, next-gen growth."}</h2>
            </div>
            <Link href={aboutCta?.button_url || "/gioi-thieu"} className="inline-flex items-center justify-center bg-[#ed1c24] px-6 py-4 text-xs font-black uppercase text-white transition hover:bg-[#ed1c24]">
              {aboutCta?.button_label || "TÃ¬m hiá»ƒu thÃªm"} <Rocket className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>}
    </>
  )
}

export default HomeBrandSections

