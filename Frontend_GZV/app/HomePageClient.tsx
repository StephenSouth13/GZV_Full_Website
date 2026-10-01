"use client"

import HeroVideo from "@/components/HeroVideo"
import AboutGzv from "@/components/sections/home/AboutGzv"
import ProjectsGrid from "@/components/sections/home/ProjectsGrid"
import ServicesThree from "@/components/sections/home/ServicesThree"
import AboutBoxes from "@/components/sections/home/AboutBoxes"
import PartnersGrid from "@/components/sections/home/PartnersGrid"
import NewsGrid from "@/components/sections/home/NewsGrid"
import { combineSectionConfig, pickHomeArticles, type TeamData } from "@/lib/home-data"

const HOME_SECTION_KEYS = new Set([
  "hero",
  "about_gzv",
  "projects",
  "services_three",
  "about_boxes",
  "partners",
  "news",
])

// Mọi section nhận dữ liệu tải sẵn từ server (app/page.tsx) nên hiện đúng nội dung ngay lần đầu
export default function HomePageClient({
  sections: initialSections,
  blockProps,
  projects,
  posts,
  team,
  partners: initialPartners,
}: {
  sections: any[]
  blockProps: Record<string, any>
  projects: any[]
  posts: any[]
  team: TeamData
  partners: any[]
}) {
  const renderSection = (sec: any) => {
    switch (sec.section_key) {
      case "hero":
        return <HeroVideo key="hero" initialSection={sec} />
      case "about_gzv":
        return <AboutGzv key="about_gzv" initialSection={sec} />
      case "projects":
        return <ProjectsGrid key="projects" initialConfig={combineSectionConfig(sec, blockProps.projects_grid)} initialItems={projects} />
      case "services_three":
        return <ServicesThree key="services_three" initialConfig={combineSectionConfig(sec, blockProps.services_three)} />
      case "about_boxes":
        return <AboutBoxes key="about_boxes" initialConfig={combineSectionConfig(sec, blockProps.about_boxes)} initialTeam={team} />
      case "partners":
        return <PartnersGrid key="partners" initialPartners={initialPartners} initialSectionConfig={sec} />
      case "news": {
        const config = combineSectionConfig(sec, blockProps.news_grid)
        return <NewsGrid key="news" initialConfig={config} initialArticles={pickHomeArticles(config, posts)} />
      }
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
