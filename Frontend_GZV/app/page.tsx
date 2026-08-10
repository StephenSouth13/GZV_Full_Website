import HeroVideo from "@/components/HeroVideo"
import HomeBrandSections from "@/components/sections/HomeBrandSections"
import ProjectsSection from "@/components/sections/ProjectsSection"
import MentorsSection from "@/components/sections/MentorsSection"
import DirectorsSection from "@/components/sections/DirectorsSection"
import GZVersSection from "@/components/sections/GZVersSection"
import NewsSection from "@/components/sections/NewsSection"
import PartnersCarousel from "@/components/sections/PartnersCarousel"

export default function HomePage() {
  return (
    <>
      <HeroVideo />
      <HomeBrandSections />
      <ProjectsSection />
      <MentorsSection />
      <DirectorsSection />
      <GZVersSection />
      <NewsSection />
      <PartnersCarousel />
    </>
  )
}
