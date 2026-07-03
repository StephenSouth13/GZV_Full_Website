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
    <section className="py-20 bg-gradient-to-r from-blue-900 via-teal-800 to-blue-900 overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {section?.title && (
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-sans mb-6">
              {section.title}
            </h2>
          )}
          {(section?.subtitle || section?.description) && (
            <p className="text-lg text-blue-100 max-w-3xl mx-auto font-medium">
              {section?.subtitle || section?.description}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {partners.map((partner) => {
            const logo = (
              <div className="relative h-24 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/20">
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
