'use client'

import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getBrandingSettings, getPageSlugFromPath, getSitePageContent, type SitePageContent } from '@/lib/site-content'
import { supabase } from '@/lib/api-supabase'

interface PageBannerProps {
  title?: string
  subtitle?: string | ReactNode
  description?: string
  badge?: string
  stats?: Array<{
    value: string
    label: string
  }>
  className?: string
  useImage?: boolean
  backgroundImageUrl?: string
  bgFrom?: string
  bgTo?: string
  overlayEnabled?: boolean
  overlayColor?: string
  overlayOpacity?: number
  imageOpacity?: number
  imageGrayscale?: boolean
}

export default function PageBanner({
  title,
  subtitle,
  description,
  badge,
  stats,
  className = '',
  useImage,
  backgroundImageUrl,
  bgFrom,
  bgTo,
  overlayEnabled,
  overlayColor,
  overlayOpacity,
  imageOpacity,
  imageGrayscale,
}: PageBannerProps) {
  const pathname = usePathname()
  const [managedPage, setManagedPage] = useState<SitePageContent | null>(null)
  const [globalBanner, setGlobalBanner] = useState<any>(null)
  const [syncAll, setSyncAll] = useState(true)

  useEffect(() => {
    let active = true
    const slug = getPageSlugFromPath(pathname)

    getSitePageContent(slug).then((data) => {
      if (active && data) setManagedPage(data)
    })

    getBrandingSettings().then((branding: any) => {
      if (!active || !branding) return
      try {
        if (branding.default_keywords && branding.default_keywords.startsWith('{')) {
          const meta = JSON.parse(branding.default_keywords)
          if (meta.global_banner) {
            setGlobalBanner(meta.global_banner)
          }
          if (typeof meta.sync_all_banners === 'boolean') {
            setSyncAll(meta.sync_all_banners)
          }
        }
      } catch (e) { }
    })

    return () => {
      active = false
    }
  }, [pathname])

  const displayTitle = managedPage?.banner_title || title || globalBanner?.title || ''
  const displayDescription = managedPage?.banner_subtitle || managedPage?.banner_description || subtitle || description || globalBanner?.subtitle || ''
  const displayBadge = managedPage?.banner_badge || badge || globalBanner?.badge || ''

  const showBadge = syncAll
    ? globalBanner?.show_badge !== false
    : (managedPage?.show_badge !== undefined && managedPage?.show_badge !== null ? managedPage.show_badge : globalBanner?.show_badge !== false)

  const showTitle = syncAll
    ? globalBanner?.show_title !== false
    : (managedPage?.show_title !== undefined && managedPage?.show_title !== null ? managedPage.show_title : globalBanner?.show_title !== false)

  const showDescription = syncAll
    ? (globalBanner?.show_subtitle !== false && globalBanner?.show_description !== false)
    : (managedPage?.show_subtitle !== undefined && managedPage?.show_subtitle !== null ? managedPage.show_subtitle : (globalBanner?.show_subtitle !== false && globalBanner?.show_description !== false))

  const isUseImage = useImage !== undefined
    ? useImage
    : (globalBanner?.use_image !== undefined ? globalBanner.use_image : true)

  const bannerImage = backgroundImageUrl || managedPage?.banner_image_url || globalBanner?.cover_url
  const imagePosY = globalBanner?.imagePositionY || '50%'
  const imgOpacity = (imageOpacity ?? globalBanner?.image_opacity ?? 100) / 100
  const isGrayscale = imageGrayscale ?? globalBanner?.image_grayscale ?? false

  const isOverlayEnabled = overlayEnabled !== undefined
    ? overlayEnabled
    : (globalBanner?.overlay_enabled !== false)

  const ovColor = overlayColor || globalBanner?.overlay_color || '#050505'
  const ovOpacity = (overlayOpacity ?? globalBanner?.overlay_opacity ?? 60) / 100

  const gradientFrom = bgFrom || globalBanner?.bg_from || globalBanner?.bg_color || '#050505'
  const gradientTo = bgTo || globalBanner?.bg_to || '#ed1c24'

  const alignment = globalBanner?.titleAlignment || 'center'
  const alignClass =
    alignment === 'left'
      ? 'text-left items-start'
      : alignment === 'right'
        ? 'text-right items-end'
        : 'text-center items-center'

  return (
    <section
      className={`relative overflow-hidden min-h-[420px] md:min-h-[460px] flex items-center justify-center py-20 lg:py-24 text-white transition-all duration-300 ${className}`}
      style={{
        background: isUseImage
          ? '#050505'
          : `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      {/* Background Image */}
      {isUseImage && bannerImage && (
        <div
          className={`absolute inset-0 bg-cover bg-no-repeat transition-all duration-300 ${isGrayscale ? 'grayscale' : ''}`}
          style={{
            backgroundImage: `url(${bannerImage})`,
            backgroundPosition: `center ${imagePosY}`,
            opacity: imgOpacity,
          }}
          aria-hidden="true"
        />
      )}

      {/* Customizable Color Overlay */}
      {isUseImage && isOverlayEnabled && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            backgroundColor: ovColor,
            opacity: ovOpacity,
          }}
          aria-hidden="true"
        />
      )}

      {/* Top Red Line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-[#ed1c24]" aria-hidden="true" />

      <div className="container relative z-10">
        <div className={`mx-auto w-full max-w-[70%] flex flex-col ${alignClass}`}>
          {showBadge && displayBadge && (
            <motion.div
              className="mb-6 inline-flex items-center gap-2 border-l-4 border-[#ed1c24] bg-white/10 px-4 py-2 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-black uppercase tracking-wider text-white">
                {typeof displayBadge === 'string' ? displayBadge.replace(/<[^>]*>?/gm, '') : displayBadge}
              </span>
            </motion.div>
          )}

          {showTitle && displayTitle && (
            <motion.h1
              className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {typeof displayTitle === 'string' ? displayTitle.replace(/<[^>]*>?/gm, '') : displayTitle}
            </motion.h1>
          )}

          {showDescription && displayDescription && (
            <motion.p
              className="mb-8 text-lg sm:text-xl leading-relaxed text-white/85 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {typeof displayDescription === 'string' ? displayDescription.replace(/<[^>]*>?/gm, '') : displayDescription}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  )
}
