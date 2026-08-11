"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { getActivePartners, getHomeSectionConfig, type HomeSectionConfig } from "@/lib/site-content"

const PartnersCarousel = () => {
  const [partners, setPartners] = useState<any[]>([])
  const [section, setSection] = useState<HomeSectionConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([getHomeSectionConfig("partners"), getActivePartners(60)])
      .then(([config, data]) => {
        if (!active) return
        setSection(config)
        setPartners((data || []).slice(0, config?.item_limit || 40))
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const marqueeItems = useMemo(() => {
    if (partners.length <= 6) return [...partners, ...partners, ...partners]
    return [...partners, ...partners]
  }, [partners])

  if (loading || section?.is_visible === false || partners.length === 0) return null

  return (
    <section className="overflow-hidden bg-[#050505] py-16 text-white lg:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-4xl text-center"
        >
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#ed1c24]">GZV Network</p>
          {section?.title && <h2 className="text-4xl font-black uppercase md:text-5xl">{section.title}</h2>}
          {(section?.subtitle || section?.description) && (
            <p className="mx-auto mt-4 max-w-3xl text-base font-semibold leading-7 text-white/65">{section.subtitle || section.description}</p>
          )}
        </motion.div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050505] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050505] to-transparent" />
        <div className="flex w-max animate-[gzvPartnerMarquee_34s_linear_infinite] gap-4 px-4 hover:[animation-play-state:paused]">
          {marqueeItems.map((partner, index) => (
            <PartnerLogo key={`${partner.id || partner.name}-${index}`} partner={partner} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes gzvPartnerMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}

function PartnerLogo({ partner }: { partner: any }) {
  const logo = (
    <div className="group flex h-28 w-56 shrink-0 flex-col justify-between border border-white/12 bg-white transition hover:border-[#ed1c24]">
      <div className="flex h-20 items-center justify-center p-5">
        <Image
          src={partner.logo_url || "/placeholder.svg"}
          alt={partner.name || "GZV partner"}
          width={180}
          height={72}
          unoptimized
          className="max-h-14 w-auto max-w-full object-contain transition group-hover:scale-[1.03]"
        />
      </div>
      <div className="border-t border-slate-200 px-4 py-2">
        <p className="truncate text-xs font-black text-[#050505]">{partner.name}</p>
      </div>
    </div>
  )

  return partner.website_url ? (
    <Link href={partner.website_url} target="_blank" rel="noopener noreferrer" aria-label={partner.name}>
      {logo}
    </Link>
  ) : logo
}

export default PartnersCarousel
