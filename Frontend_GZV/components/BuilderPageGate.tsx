"use client"

import type React from "react"
import PageBuilderRenderer from "@/components/PageBuilderRenderer"
import type { PageBlock } from "@/lib/site-content"

export default function BuilderPageGate({
  slug,
  children,
  initialBlocks,
}: {
  slug: string
  children: React.ReactNode
  initialBlocks?: PageBlock[]
}) {
  return <PageBuilderRenderer slug={slug} fallback={children} initialBlocks={initialBlocks} />
}
