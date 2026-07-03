'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { useEffect, useState } from 'react'
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
    return () => { active = false }
  }, [pathname])

  const displayTitle = managedPage?.banner_title || title
  const displaySubtitle = managedPage?.banner_subtitle || subtitle
  const displayDescription = managedPage?.banner_description || description
  const displayBadge = managedPage?.banner_badge || badge
  const bannerImage = managedPage?.banner_image_url

  return (
    <section className={`py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 text-white relative overflow-hidden ${className}`}>
      {bannerImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${bannerImage})` }}
          aria-hidden="true"
        />
      )}
      {bannerImage && <div className="absolute inset-0 bg-blue-950/65" aria-hidden="true" />}
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {displayBadge && (
            <motion.div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-semibold text-teal-300 uppercase tracking-wider">{displayBadge}</span>
            </motion.div>
          )}

          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 font-serif"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {displayTitle}
          </motion.h1>

          {displaySubtitle && (
            <motion.p
              className="text-xl text-blue-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {displaySubtitle}
            </motion.p>
          )}

          {displayDescription && (
            <motion.p
              className="text-lg text-blue-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {displayDescription}
            </motion.p>
          )}

          {stats && stats.length > 0 && (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl font-bold text-teal-300 mb-2">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
