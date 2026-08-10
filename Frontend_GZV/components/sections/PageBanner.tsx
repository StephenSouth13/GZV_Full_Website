'use client'

import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getPageSlugFromPath, getSitePageContent, type SitePageContent } from '@/lib/site-content'

interface PageBannerProps {
  title: string
  subtitle?: string | ReactNode
  description?: string
  badge?: string
  stats?: Array<{
    value: string
    label: string
  }>
  className?: string
}

export default function PageBanner({
  title,
  subtitle,
  description,
  badge,
  stats,
  className = '',
}: PageBannerProps) {
  const pathname = usePathname()
  const [managedPage, setManagedPage] = useState<SitePageContent | null>(null)

  useEffect(() => {
    let active = true
    getSitePageContent(getPageSlugFromPath(pathname)).then((data) => {
      if (active) setManagedPage(data)
    })
    return () => {
      active = false
    }
  }, [pathname])

  const displayTitle = managedPage?.banner_title || title
  const displaySubtitle = managedPage?.banner_subtitle || subtitle
  const displayDescription = managedPage?.banner_description || description
  const displayBadge = managedPage?.banner_badge || badge
  const bannerImage = managedPage?.banner_image_url

  return (
    <section className={`relative overflow-hidden bg-[#050505] py-20 text-white ${className}`}>
      {bannerImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 grayscale"
          style={{ backgroundImage: `url(${bannerImage})` }}
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.88)_54%,rgba(237,28,36,0.30)_100%)]" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-1 bg-[#ed1c24]" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 h-20 w-full border-t border-white/10 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_14px)]" aria-hidden="true" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {displayBadge && (
            <motion.div
              className="mb-6 inline-flex items-center gap-2 border-l-4 border-[#ed1c24] bg-white/10 px-4 py-2 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-black uppercase tracking-wider text-white">{displayBadge}</span>
            </motion.div>
          )}

          <motion.h1
            className="mb-6 text-5xl font-black uppercase leading-tight md:text-6xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {displayTitle}
          </motion.h1>

          {displaySubtitle && (
            <motion.p
              className="mb-8 text-xl font-semibold leading-relaxed text-white/78"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {displaySubtitle}
            </motion.p>
          )}

          {displayDescription && (
            <motion.p
              className="mb-8 text-lg leading-relaxed text-white/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {displayDescription}
            </motion.p>
          )}

          {stats && stats.length > 0 && (
            <motion.div
              className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="border border-white/12 bg-white/6 px-4 py-5 text-center">
                  <div className="mb-2 text-3xl font-black text-[#ed1c24]">{stat.value}</div>
                  <div className="text-sm font-bold uppercase tracking-wide text-white/65">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
