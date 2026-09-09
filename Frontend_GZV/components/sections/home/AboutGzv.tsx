"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SectionIntro from "@/components/sections/common/SectionIntro"
import { supabase } from "@/lib/api-supabase"

export interface AboutGzvProps {
  title?: string
  subtitle?: string
  body?: string
  description?: string
  image_url?: string
  image_alt?: string
  position_x?: number
  position_y?: number
  image_size?: number
  button_label?: string
  button_url?: string
  show_button?: boolean
}

export default function AboutGzv({
  title: propTitle,
  subtitle: propSubtitle,
  body: propBody,
  description: propDescription,
  image_url: propImageUrl,
  image_alt: propImageAlt,
  position_x: propPositionX,
  position_y: propPositionY,
  image_size: propImageSize,
  button_label: propButtonLabel,
  button_url: propButtonUrl,
  show_button: propShowButton,
}: AboutGzvProps) {
  const [dbData, setDbData] = useState<any>(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const { data: homeData } = await supabase
          .from("site_home_sections")
          .select("*")
          .eq("section_key", "about_gzv")
          .maybeSingle()

        if (active && homeData) {
          setDbData({
            is_visible: homeData.is_visible,
            title: homeData.title,
            subtitle: homeData.subtitle,
            body: homeData.description,
            image_url: homeData.settings?.image_url || homeData.settings?.image || homeData.image_url,
            image_alt: homeData.settings?.image_alt,
            position_x: homeData.settings?.position_x,
            position_y: homeData.settings?.position_y,
            image_size: homeData.settings?.image_size,
            button_label: homeData.button_label,
            button_url: homeData.button_url,
            show_button: homeData.settings?.show_button !== false,
            ...homeData.settings,
          })
          return
        }

        const { data: blockData } = await supabase
          .from("site_page_blocks")
          .select("props")
          .in("component_type", ["about_gzv", "story_split"])
          .limit(1)
          .maybeSingle()

        if (active && blockData?.props) {
          setDbData(blockData.props)
        }
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu AboutGzv:", e)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  if (dbData?.is_visible === false && !propTitle) {
    return null
  }

  const DEFAULT_TITLE = "CÂU CHUYỆN GZV"
  const DEFAULT_SUBTITLE = "Từ một cộng đồng học hỏi đến hệ sinh thái triển khai thực chiến."
  const DEFAULT_BODY = "GZV được xây dựng để kết nối thế hệ trẻ, chuyên gia và doanh nghiệp trong cùng một môi trường học tập - làm thật - tạo tác động thật. Chúng tôi tin rằng năng lực chỉ bền vững khi được rèn trong dự án thực tế, dưới sự đồng hành của những người có kinh nghiệm."
  const DEFAULT_IMAGE = "/gioi-thieu/19.webp"

  const rawTitle = propTitle || dbData?.title
  const title = (rawTitle && !rawTitle.includes("GZV LTD -")) ? rawTitle : DEFAULT_TITLE

  const rawSubtitle = propSubtitle || dbData?.subtitle
  const subtitle = (rawSubtitle && rawSubtitle.length > 5) ? rawSubtitle : DEFAULT_SUBTITLE

  const rawBody = propBody || propDescription || dbData?.body || dbData?.description
  const body = (rawBody && rawBody.length > 40) ? rawBody : DEFAULT_BODY

  const imageUrl = propImageUrl || dbData?.image_url || DEFAULT_IMAGE
  const imageAlt = propImageAlt || dbData?.image_alt || title
  const positionX = propPositionX ?? dbData?.position_x ?? 50
  const positionY = propPositionY ?? dbData?.position_y ?? 50
  const imageSize = propImageSize ?? dbData?.image_size ?? 100
  const buttonLabel = propButtonLabel || dbData?.button_label || "XEM CHI TIẾT"
  const buttonUrl = propButtonUrl || dbData?.button_url || "/gioi-thieu"
  const showButton = propShowButton ?? dbData?.show_button ?? true

  return (
    <section className="bg-white py-16 dark:bg-slate-950 lg:py-24">
      <div className="container grid gap-10 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <SectionIntro title={title} subtitle={subtitle} align="left" />
          {body && <div className="max-w-3xl whitespace-pre-line text-base font-semibold leading-8 text-slate-600 dark:text-slate-300">{body}</div>}
          {showButton && (buttonLabel || buttonUrl) && (
            <div className="mt-8">
              <Link href={buttonUrl || "/gioi-thieu"}>
                <Button className="h-12 rounded-xl bg-[#ed1c24] px-8 text-sm font-black uppercase text-white hover:bg-[#c91218] transition">
                  {buttonLabel || "Xem chi tiết"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="relative min-h-[420px] overflow-hidden border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover"
            style={{ objectPosition: `${Number(positionX)}% ${Number(positionY)}%`, transform: `scale(${Number(imageSize) / 100})` }}
          />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#ed1c24]" />
        </div>
      </div>
    </section>
  )
}
