"use client"

import PageBanner from "@/components/sections/common/PageBanner"
import BuilderPageGate from "@/components/BuilderPageGate"
import type { ManagedPageInitialData } from "@/lib/site-content-server"

type ManagedPageClientProps = ManagedPageInitialData & {
  slug: string
  initialPartners?: any[]
}

export default function ManagedPageClient({
  slug,
  initialBlocks,
  initialPage,
  initialGlobalBanner,
  initialSyncAllBanners,
  initialPartners,
}: ManagedPageClientProps) {
  return (
    <>
      <PageBanner
        initialPage={initialPage}
        initialGlobalBanner={initialGlobalBanner}
        initialSyncAllBanners={initialSyncAllBanners}
      />
      <BuilderPageGate slug={slug} initialBlocks={initialBlocks} initialPartners={initialPartners} />
    </>
  )
}
