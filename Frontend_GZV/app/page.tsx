import HeroVideo from "@/components/HeroVideo"
import PageBuilderRenderer from "@/components/PageBuilderRenderer"

export default function HomePage() {
  return (
    <>
      <HeroVideo />
      <PageBuilderRenderer slug="home" />
    </>
  )
}
