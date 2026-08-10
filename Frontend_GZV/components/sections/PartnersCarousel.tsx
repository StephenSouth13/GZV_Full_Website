"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
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

  if (loading || section?.is_visible === false || partners.length === 0) return null

  return (
    <section className="overflow-hidden bg-[#050505] py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {section?.title && (
                <h2 className="mb-6 text-4xl font-black uppercase text-white md:text-5xl">
              {section.title}
            </h2>
          )}
          {(section?.subtitle || section?.description) && (
            <p className="mx-auto max-w-3xl text-lg font-medium text-white/70">
              {section?.subtitle || section?.description}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {partners.map((partner) => {
            const logo = (
              <div className="relative h-24 rounded-none border border-white/20 bg-white p-4 transition hover:border-[#ed1c24]">
                <Image
                  src={partner.logo_url || "/placeholder.svg"}
                  alt={partner.name}
                  fill
                  unoptimized
                  className="object-contain p-4 opacity-90 transition-opacity hover:opacity-100"
                />
              </div>
            )

            return partner.website_url ? (
              <Link key={partner.id} href={partner.website_url} target="_blank" rel="noopener noreferrer" aria-label={partner.name}>
                {logo}
              </Link>
            ) : (
              <div key={partner.id}>{logo}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PartnersCarousel
