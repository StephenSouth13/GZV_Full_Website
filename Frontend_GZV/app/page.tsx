"use client"

import { useEffect, useState } from "react"
import HeroVideo from "@/components/HeroVideo"
import AboutGzv from "@/components/sections/home/AboutGzv"
import ProjectsGrid from "@/components/sections/home/ProjectsGrid"
import ServicesThree from "@/components/sections/home/ServicesThree"
import AboutBoxes from "@/components/sections/home/AboutBoxes"
import PartnersGrid from "@/components/sections/home/PartnersGrid"
import NewsGrid from "@/components/sections/home/NewsGrid"
import { supabase } from "@/lib/api-supabase"

const DEFAULT_ORDER = [
  "hero",
  "about_gzv",
  "projects",
  "services_three",
  "about_boxes",
  "partners",
  "news",
]

export default function HomePage() {
  const [sections, setSections] = useState<any[]>([])

  useEffect(() => {
    let active = true

    const loadSections = async () => {
      try {
        const { data } = await supabase
          .from("site_home_sections")
          .select("*")
          .order("sort_order", { ascending: true })

        if (!active) return

        if (data && data.length > 0) {
          const visible = data.filter((s: any) => s.is_visible !== false && DEFAULT_ORDER.includes(s.section_key))
          setSections(visible)
        } else {
          setSections(
            DEFAULT_ORDER.map((key, idx) => ({
              section_key: key,
              sort_order: (idx + 1) * 10,
              is_visible: true,
            }))
          )
        }
      } catch (e) {
        if (active) {
          setSections(
            DEFAULT_ORDER.map((key, idx) => ({
              section_key: key,
              sort_order: (idx + 1) * 10,
              is_visible: true,
            }))
          )
        }
      }
    }

    loadSections()

    return () => {
      active = false
    }
  }, [])

  const renderSection = (sec: any) => {
    switch (sec.section_key) {
      case "hero":
        return <HeroVideo key="hero" />
      case "about_gzv":
        return <AboutGzv key="about_gzv" />
      case "projects":
        return <ProjectsGrid key="projects" />
      case "services_three":
        return <ServicesThree key="services_three" />
      case "about_boxes":
        return <AboutBoxes key="about_boxes" />
      case "partners":
        return <PartnersGrid key="partners" />
      case "news":
        return <NewsGrid key="news" />
      default:
        return null
    }
  }

  const sectionsToRender =
    sections.length > 0
      ? sections
      : DEFAULT_ORDER.map((key) => ({ section_key: key }))

  return (
    <>
      {sectionsToRender.map((sec, index) => {
        const content = renderSection(sec)
        if (!content) return null
        return (
          <div key={sec.section_key || index}>
            {content}
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
          </div>
        )
      })}
    </>
  )
}