"use client"

import React, { useRef } from "react"
import { motion } from "framer-motion"

interface SharedPageHeroProps {
  badge?: string
  badgeColor?: string
  title?: string
  titleColor?: string
  description?: string
  descriptionColor?: string
  useImage?: boolean
  backgroundImageUrl?: string
  imagePositionY?: string
  imageOpacity?: number
  imageGrayscale?: boolean
  bgColor?: string
  bgFrom?: string
  bgTo?: string
  overlayEnabled?: boolean
  overlayColor?: string
  overlayOpacity?: number
  textColor?: string
  titleAlignment?: "left" | "center" | "right"
  showBadge?: boolean
  showTitle?: boolean
  showDescription?: boolean
  isPreviewMode?: boolean
  onPositionChange?: (val: string) => void
  onBadgeClick?: () => void
  onTitleClick?: () => void
  onDescriptionClick?: () => void
}

export function SharedPageHero({
  badge,
  badgeColor = "#ffffff",
  title,
  titleColor = "#ffffff",
  description,
  descriptionColor = "rgba(255,255,255,0.85)",
  useImage = true,
  backgroundImageUrl,
  imagePositionY = "50%",
  imageOpacity = 100,
  imageGrayscale = false,
  bgColor = "#050505",
  bgFrom = "#050505",
  bgTo = "#ed1c24",
  overlayEnabled = true,
  overlayColor = "#050505",
  overlayOpacity = 60,
  titleAlignment = "center",
  showBadge = true,
  showTitle = true,
  showDescription = true,
  isPreviewMode = false,
  onPositionChange,
  onBadgeClick,
  onTitleClick,
  onDescriptionClick,
}: SharedPageHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const alignClass =
    titleAlignment === "left"
      ? "text-left items-start"
      : titleAlignment === "right"
      ? "text-right items-end"
      : "text-center items-center"

  const parseHtmlText = (str?: string) => {
    if (!str) return ""
    return str.replace(/<[^>]*>?/gm, "")
  }

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden min-h-[420px] md:min-h-[460px] flex items-center justify-center py-20 lg:py-24 text-white transition-all duration-300"
      style={{
        background: useImage
          ? "#050505"
          : `linear-gradient(90deg, ${bgFrom || bgColor || "#050505"}, ${bgTo || bgFrom || bgColor || "#ed1c24"})`,
      }}
    >
      {/* Background Image Layer */}
      {useImage && backgroundImageUrl && (
        <div
          className={`absolute inset-0 bg-cover bg-no-repeat transition-all duration-300 ${imageGrayscale ? "grayscale" : ""}`}
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundPosition: `center ${imagePositionY}`,
            opacity: (imageOpacity ?? 100) / 100,
          }}
          aria-hidden="true"
        />
      )}

      {/* Customizable Color Overlay Layer */}
      {useImage && overlayEnabled !== false && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            backgroundColor: overlayColor || "#050505",
            opacity: (overlayOpacity ?? 60) / 100,
          }}
          aria-hidden="true"
        />
      )}

      {/* Top Red Accent Line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-[#ed1c24]" aria-hidden="true" />

      <div className="container relative z-10 px-6">
        <div className={`mx-auto w-full max-w-[70%] flex flex-col ${alignClass}`}>
          {showBadge && badge && (
            <motion.div
              onClick={onBadgeClick}
              className={`mb-6 inline-flex items-center gap-2 border-l-4 border-[#ed1c24] bg-white/10 px-4 py-2 backdrop-blur-sm ${
                isPreviewMode ? "cursor-pointer hover:ring-2 hover:ring-[#ed1c24]" : ""
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span
                className="text-sm font-black uppercase tracking-wider"
                style={{ color: badgeColor }}
              >
                {parseHtmlText(badge)}
              </span>
            </motion.div>
          )}

          {showTitle && title && (
            <motion.h1
              onClick={onTitleClick}
              className={`mb-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-tight ${
                isPreviewMode ? "cursor-pointer hover:ring-2 hover:ring-[#ed1c24]" : ""
              }`}
              style={{ color: titleColor }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {parseHtmlText(title)}
            </motion.h1>
          )}

          {showDescription && description && (
            <motion.p
              onClick={onDescriptionClick}
              className={`mb-8 text-lg sm:text-xl font-semibold leading-relaxed ${
                isPreviewMode ? "cursor-pointer hover:ring-2 hover:ring-[#ed1c24]" : ""
              }`}
              style={{ color: descriptionColor }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {parseHtmlText(description)}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  )
}
