"use client"

import type React from "react"
import PageBuilderRenderer from "@/components/PageBuilderRenderer"
import type { PageBlock } from "@/lib/site-content"
import type { TeamData } from "@/lib/home-data"

export default function BuilderPageGate({
  slug,
  children,
  initialBlocks,
  initialPartners,
  initialTeam,
}: {
  slug: string
  children?: React.ReactNode
  initialBlocks?: PageBlock[]
  initialPartners?: any[]
  initialTeam?: TeamData
}) {
  return <PageBuilderRenderer slug={slug} fallback={children} initialBlocks={initialBlocks} initialPartners={initialPartners} initialTeam={initialTeam} />
}
