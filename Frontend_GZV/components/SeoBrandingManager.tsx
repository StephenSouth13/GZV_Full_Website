"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getBrandingSettings, getPageSlugFromPath, getSitePageContent } from "@/lib/site-content"

const upsertMeta = (name: string, content?: string | null) => {
  if (!content) return
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement("meta")
    tag.name = name
    document.head.appendChild(tag)
  }
  tag.content = content
}

const upsertLink = (rel: string, href?: string | null) => {
  if (!href) return
  let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!tag) {
    tag = document.createElement("link")
    tag.rel = rel
    document.head.appendChild(tag)
  }
  tag.href = href
}

export default function SeoBrandingManager() {
  const pathname = usePathname()

  useEffect(() => {
    let active = true
    Promise.all([getBrandingSettings(), getSitePageContent(getPageSlugFromPath(pathname))]).then(([branding, page]) => {
      if (!active) return
      const rawTitle = page?.seo_title || page?.title || branding.default_title
      document.title = rawTitle === branding.default_title
        ? rawTitle
        : branding.title_template.replace("%s", rawTitle)
      upsertMeta("description", page?.seo_description || branding.default_description)
      upsertMeta("keywords", branding.default_keywords)
      upsertLink("icon", branding.favicon_url)
      upsertLink("apple-touch-icon", branding.favicon_url)
    })
    return () => {
      active = false
    }
  }, [pathname])

  return null
}
