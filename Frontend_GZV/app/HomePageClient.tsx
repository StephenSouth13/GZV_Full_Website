"use client"

import HeroVideo from "@/components/HeroVideo"
import AboutGzv from "@/components/sections/home/AboutGzv"
import ProjectsGrid from "@/components/sections/home/ProjectsGrid"
import ServicesThree from "@/components/sections/home/ServicesThree"
import AboutBoxes from "@/components/sections/home/AboutBoxes"
import PartnersGrid from "@/components/sections/home/PartnersGrid"
import NewsGrid from "@/components/sections/home/NewsGrid"

const HOME_SECTION_KEYS = new Set([
  "hero",
  "about_gzv",
  "projects",
  "services_three",
  "about_boxes",
  "partners",
  "news",
])

export default function HomePageClient({
  initialSections,
  initialPartners,
}: {
  initialSections: any[]
  initialPartners: any[]
}) {
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
        return <PartnersGrid key="partners" initialPartners={initialPartners} initialSectionConfig={sec} />
      case "news":
        return <NewsGrid key="news" />
      default:
        return null
    }
  }

  const sectionsToRender = initialSections.filter(
    (sec) => sec?.is_visible !== false && HOME_SECTION_KEYS.has(sec?.section_key)
  )

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
