"use client"

import { useEffect, useState } from "react"
import { getPageBlocks, type PageBlock } from "@/lib/site-content"
import { localizeRecord, useLanguage } from "@/components/language-provider"

// Common Sections
import PageBanner from "@/components/sections/common/PageBanner"
import ContactFormBlock from "@/components/sections/common/ContactFormBlock"
import FeatureGrid from "@/components/sections/common/FeatureGrid"
import ProgramsGrid from "@/components/sections/common/ProgramsGrid"
import PeopleGrid from "@/components/sections/about/PeopleGrid"
import ImageGalleryBlock from "@/components/sections/common/ImageGalleryBlock"
import CtaBand from "@/components/sections/common/CtaBand"
import MscWords from "@/components/sections/common/MscWords"
import WhyColumns from "@/components/sections/common/WhyColumns"
import HtmlBlock from "@/components/sections/common/HtmlBlock"
import StatsBar from "@/components/sections/common/StatsBar"

// Home Sections
import HeroStats from "@/components/sections/home/HeroStats"
import ServicesThree from "@/components/sections/home/ServicesThree"
import ProjectsGrid from "@/components/sections/home/ProjectsGrid"
import NewsGrid from "@/components/sections/home/NewsGrid"
import MentorsGrid from "@/components/sections/home/MentorsGrid"
import GzversGrid from "@/components/sections/home/GzversGrid"
import PartnersGrid from "@/components/sections/home/PartnersGrid"
import PartnersListSection from "@/components/sections/PartnersListSection"
import AboutGzv from "@/components/sections/home/AboutGzv"

// About Sections
import StorySplit from "@/components/sections/about/StorySplit"
import CoreShowcase from "@/components/sections/about/CoreShowcase"
import AboutBoxes from "@/components/sections/home/AboutBoxes"
import TimelineBlock from "@/components/sections/about/TimelineBlock"
import MentoringModel from "@/components/sections/about/MentoringModel"

export default function PageBuilderRenderer({ slug, fallback }: { slug: string; fallback?: React.ReactNode }) {
  const { language } = useLanguage()
  const [blocks, setBlocks] = useState<PageBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getPageBlocks(slug).then((data) => {
      if (!active) return
      let filtered = data || []
      if (slug === "lien-he") {
        filtered = filtered.filter((b) => b.component_type !== "cta_band" && b.block_key !== "cta")
      }
      setBlocks(filtered)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [slug])

  if (loading) return null
  if (blocks.length === 0) return <>{fallback || null}</>

  return <>{blocks.map((block) => <RenderBlock key={block.id || block.block_key} block={block} language={language} />)}</>
}

function RenderBlock({ block, language }: { block: PageBlock; language: "vi" | "en" }) {
  if (block.is_visible === false) return null
  const localizedProps = localizeRecord(block.props || {}, language)
  const blockTitle = language === "en"
    ? ((block as any).title_en || localizedProps.title_en || localizedProps.title || block.title || "")
    : (localizedProps.title || block.title || "")
  const blockSubtitle = language === "en"
    ? ((block as any).subtitle_en || localizedProps.subtitle_en || localizedProps.subtitle || (block as any).subtitle || "")
    : (localizedProps.subtitle || (block as any).subtitle || "")
  const props: any = { ...localizedProps, title: blockTitle, subtitle: blockSubtitle }
  const contentHtml = language === "en" ? ((block as any).content_html_en || props.content_html_en || block.content_html || "") : (block.content_html || "")
  switch (block.component_type) {
    case "stats_bar":
    case "hero_stats":
      return <StatsBar {...props} />
    case "msc_words":
      return <MscWords {...props} />
    case "about_gzv":
      return <AboutGzv {...props} />
    case "story_split":
      return <StorySplit {...props} />
    case "timeline":
      return <TimelineBlock {...props} />
    case "mentoring_model":
      return <MentoringModel {...props} />
    case "services_three":
      return <ServicesThree {...props} />
    case "why_columns":
      return <WhyColumns language={language} {...props} />
    case "about_boxes":
      return <AboutBoxes {...props} />
    case "people_grid":
      return <PeopleGrid {...props} />
    case "feature_grid":
      return <FeatureGrid {...props} />
    case "programs_grid":
      return <ProgramsGrid language={language} {...props} />
    case "projects_grid":
      return <ProjectsGrid {...props} />
    case "news_grid":
      return <NewsGrid {...props} />
    case "mentors_grid":
      return <MentorsGrid {...props} />
    case "gzvers_grid":
      return <GzversGrid {...props} />
    case "partners_grid":
    case "partners_list":
      return <PartnersListSection {...props} />
    case "contact_form":
      return <ContactFormBlock {...props} />
    case "page_banner":
      return null
    case "core_showcase":
      return <CoreShowcase {...props} />
    case "image_gallery":
      return <ImageGalleryBlock {...props} />
    case "cta_band":
      return <CtaBand {...props} />
    case "html_rich":
      return <HtmlBlock html={contentHtml} maxWidth={props.maxWidth} />
    default:
      return null
  }
}
