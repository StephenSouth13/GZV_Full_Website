"use client"

import type React from "react"
import PageBuilderRenderer from "@/components/PageBuilderRenderer"

export default function BuilderPageGate({ slug, children }: { slug: string; children: React.ReactNode }) {
  return <PageBuilderRenderer slug={slug} fallback={children} />
}
