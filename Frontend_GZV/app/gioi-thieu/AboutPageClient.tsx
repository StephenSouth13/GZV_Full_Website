"use client"

import PageBanner from "@/components/sections/common/PageBanner"
import BuilderPageGate from "@/components/BuilderPageGate"
import type { PageBlock, SitePageContent } from "@/lib/site-content"
import type { TeamData } from "@/lib/home-data"

type AboutPageClientProps = {
  initialBlocks?: PageBlock[]
  initialPage?: SitePageContent | null
  initialGlobalBanner?: Record<string, any> | null
  initialSyncAllBanners?: boolean
  initialTeam?: TeamData
}

export default function AboutPageClient({
  initialBlocks = [],
  initialPage = null,
  initialGlobalBanner = null,
  initialSyncAllBanners = true,
  initialTeam,
}: AboutPageClientProps) {
  return (
    <>
      <PageBanner
        initialPage={initialPage}
        initialGlobalBanner={initialGlobalBanner}
        initialSyncAllBanners={initialSyncAllBanners}
      />
      <BuilderPageGate slug="gioi-thieu" initialBlocks={initialBlocks} initialTeam={initialTeam} />
    </>
  )
}

