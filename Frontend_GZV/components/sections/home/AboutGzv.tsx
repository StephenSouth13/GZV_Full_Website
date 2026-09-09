"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SectionIntro from "@/components/sections/common/SectionIntro"
import { supabase } from "@/lib/api-supabase"
import { isVideoUrl, looksLikeHtml, normalizeMediaUrl } from "@/lib/media-url"

export interface AboutGzvProps {
  title?: string
  subtitle?: string
  body?: string
  description?: string
  image_url?: string
  video_url?: string
  media_type?: string
  image_alt?: string
  position_x?: number
  position_y?: number
  image_size?: number
  button_label?: string
  button_url?: string
  show_button?: boolean
}

export default function AboutGzv(props: AboutGzvProps) {
  const [dbData, setDbData] = useState<any>(null)

  useEffect(() => {
    if (props.title || props.body || props.description) return
    let active = true

    async function loadData() {
      const { data } = await supabase
        .from("site_home_sections")
        .select("*")
        .eq("section_key", "about_gzv")
        .maybeSingle()

      if (!active || !data) return
      setDbData({
        is_visible: data.is_visible,
        title: data.title,
        subtitle: data.subtitle,
        body: data.description,
        image_url: data.settings?.image_url || data.settings?.image || data.image_url,
        ...data.settings,
        button_label: data.button_label,
        button_url: data.button_url,
      })
    }

    loadData()
    return () => {
      active = false
    }
  }, [props.title, props.body, props.description])

  const data = { ...dbData, ...props }
  if (data.is_visible === false) return null

  const body = data.body || data.description || ""
  const mediaUrl = data.video_url || data.image_url || ""
  const isVideo = data.media_type === "video" || isVideoUrl(mediaUrl)
  const normalizedMediaUrl = normalizeMediaUrl(mediaUrl, isVideo ? "video" : "image")
  const showButton = data.show_button !== false && (data.button_label || data.button_url)

  if (!data.title && !data.subtitle && !body && !mediaUrl) return null

  return (
    <section className="overflow-hidden bg-white py-12 dark:bg-slate-950 sm:py-16 lg:py-20">
      <div className={`container grid gap-8 px-4 sm:px-6 lg:items-stretch ${mediaUrl ? "lg:grid-cols-[0.95fr_1.05fr]" : ""}`}>
        <div className="min-w-0 self-center">
          <SectionIntro title={data.title} subtitle={data.subtitle} align="left" />
          {body && looksLikeHtml(body) ? (
            <div
              className="prose prose-slate max-w-3xl text-slate-600 dark:prose-invert dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : body ? (
            <div className="max-w-3xl whitespace-pre-line text-base font-semibold leading-8 text-slate-600 dark:text-slate-300">{body}</div>
          ) : null}
          {showButton && (
            <div className="mt-8">
              <Link href={data.button_url || "/gioi-thieu"}>
                <Button className="h-12 rounded-xl bg-[#ed1c24] px-6 text-xs font-black uppercase text-white transition hover:bg-[#c91218] sm:px-8 sm:text-sm">
                  {data.button_label || "Xem chi tiết"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {mediaUrl && (
          <div className="relative min-h-[280px] overflow-hidden border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900 sm:min-h-[360px] lg:h-full lg:min-h-[420px]">
            {isVideo ? (
              /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(normalizedMediaUrl) ? (
                <video src={normalizedMediaUrl} className="h-full w-full object-cover" controls playsInline />
              ) : (
                <iframe
                  src={normalizedMediaUrl}
                  className="h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : (
              <img
                src={normalizedMediaUrl}
                alt={data.image_alt || data.title || "GZV"}
                className="h-full w-full object-cover"
                style={{
                  objectPosition: `${Number(data.position_x ?? 50)}% ${Number(data.position_y ?? 50)}%`,
                  transform: `scale(${Number(data.image_size ?? 100) / 100})`,
                }}
              />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-[#ed1c24]" />
          </div>
        )}
      </div>
    </section>
  )
}

