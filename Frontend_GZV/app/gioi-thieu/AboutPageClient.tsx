"use client"

import PageBanner from "@/components/sections/common/PageBanner"
import BuilderPageGate from "@/components/BuilderPageGate"
import type { PageBlock, SitePageContent } from "@/lib/site-content"

type AboutPageClientProps = {
  initialBlocks?: PageBlock[]
  initialPage?: SitePageContent | null
  initialGlobalBanner?: Record<string, any> | null
  initialSyncAllBanners?: boolean
}

export default function AboutPageClient({
  initialBlocks = [],
  initialPage = null,
  initialGlobalBanner = null,
  initialSyncAllBanners = true,
}: AboutPageClientProps) {
  return (
    <>
      <PageBanner
        initialPage={initialPage}
        initialGlobalBanner={initialGlobalBanner}
        initialSyncAllBanners={initialSyncAllBanners}
      />
      <BuilderPageGate slug="gioi-thieu" initialBlocks={initialBlocks} />
    </>
  )
}

