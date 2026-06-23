import HeroVideo from "@/components/HeroVideo"
import ProjectsSection from "@/components/sections/ProjectsSection"
import MentorsSection from "@/components/sections/MentorsSection"
import DirectorsSection from "@/components/sections/DirectorsSection"
import gzversSection from "@/components/sections/gzversSection"
import NewsSection from "@/components/sections/NewsSection"
import PartnersCarousel from "@/components/sections/PartnersCarousel"

export default function HomePage() {
  return (
    <>
      <HeroVideo />
      <ProjectsSection />
      <MentorsSection />
      <DirectorsSection />
      <gzversSection />
      <NewsSection />
      <PartnersCarousel />
    </>
  )
}
