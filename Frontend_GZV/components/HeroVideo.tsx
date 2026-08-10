"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Pause, Play } from "lucide-react"
import { getHomeSectionConfig, type HomeSectionConfig } from "@/lib/site-content"

const DEFAULT_HERO = {
  title: "GZV Ltd",
  subtitle: "The Next-Gen Company",
  description:
    "Đồng hành cùng doanh nghiệp và thế hệ trẻ qua Marketing, Sales và Digital Transformation với tư duy triển khai thực chiến.",
  button_label: "Khám phá dịch vụ",
  button_url: "/#dich-vu",
  settings: {
    video_url: "/Intro.mp4",
    poster_url: "/og-image.jpg",
  },
}

const getEmbedUrl = (url: string) => {
  if (!url) return ""
  if (/youtube\.com\/watch\?v=/.test(url)) return url.replace("watch?v=", "embed/")
  if (/youtu\.be\//.test(url)) return url.replace("youtu.be/", "www.youtube.com/embed/")
  if (/vimeo\.com\/\d+/.test(url)) return url.replace("vimeo.com/", "player.vimeo.com/video/")
  return url
}

const isDirectVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)

const HeroVideo = () => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [hero, setHero] = useState<HomeSectionConfig | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let active = true
    getHomeSectionConfig("hero").then((section) => {
      if (active) setHero(section)
    })
    return () => {
      active = false
    }
  }, [])

  const toggleVideo = () => {
    if (!videoRef.current) return
    if (isPlaying) videoRef.current.pause()
    else videoRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const visible = hero?.is_visible ?? true
  if (!visible) return null

  const title = hero?.title || DEFAULT_HERO.title
  const subtitle = hero?.subtitle || DEFAULT_HERO.subtitle
  const description = hero?.description || DEFAULT_HERO.description
  const buttonLabel = hero?.button_label || DEFAULT_HERO.button_label
  const buttonUrl = hero?.button_url || DEFAULT_HERO.button_url
  const settings = { ...DEFAULT_HERO.settings, ...(hero?.settings || {}) }
  const videoUrl = settings.video_url || DEFAULT_HERO.settings.video_url
  const posterUrl = settings.poster_url || DEFAULT_HERO.settings.poster_url
  const directVideo = isDirectVideo(videoUrl)

  return (
    <section className="relative isolate overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#ed1c24]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(237,28,36,0.14),transparent_35%,rgba(255,255,255,0.04))]" aria-hidden="true" />

      <div className="container relative z-10 grid gap-8 py-12 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative overflow-hidden border border-white/14 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.42)]"
        >
          <div className="aspect-video bg-black">
            {directVideo ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
                poster={posterUrl}
              >
                <source src={videoUrl} />
              </video>
            ) : (
              <iframe
                src={getEmbedUrl(videoUrl)}
                className="h-full w-full"
                title="GZV hero video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
          {directVideo && (
            <button
              onClick={toggleVideo}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center border border-white/25 bg-black/65 text-white backdrop-blur transition hover:border-[#ed1c24] hover:bg-[#ed1c24]"
              aria-label={isPlaying ? "Pause hero video" : "Play hero video"}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </button>
          )}
        </motion.div>

        <div className="border-l-4 border-[#ed1c24] bg-white px-6 py-7 text-[#050505] shadow-[0_24px_70px_rgba(0,0,0,0.18)] lg:px-8 lg:py-10">
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            <div className="mb-5 inline-flex border-l-4 border-[#ed1c24] bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-900">
              {subtitle}
            </div>
            <h1 className="text-5xl font-black uppercase leading-none text-[#050505] sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-slate-600 sm:text-xl">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={buttonUrl}>
                <span className="inline-flex h-[52px] items-center justify-center bg-[#ed1c24] px-7 py-4 text-sm font-black uppercase text-white transition hover:bg-[#c91218]">
                  {buttonLabel} <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
              <Link href="/lien-he">
                <span className="inline-flex h-[52px] items-center justify-center border border-slate-300 bg-white px-7 py-4 text-sm font-black uppercase text-[#050505] transition hover:border-[#050505] hover:bg-[#050505] hover:text-white">
                  Liên hệ GZV
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroVideo
