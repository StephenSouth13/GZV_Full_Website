"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { getBrandingSettings, getPageSlugFromPath, getSitePageContent } from "@/lib/site-content"
import { supabase } from "@/lib/api-supabase"

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

const upsertProperty = (property: string, content?: string | null) => {
  if (!content) return
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement("meta")
    tag.setAttribute("property", property)
    document.head.appendChild(tag)
  }
  tag.content = content
}

const upsertLink = (rel: string, href?: string | null) => {
  if (!href) return
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement("link")
    link.rel = rel
    document.head.appendChild(link)
  }
  link.href = href
}

const upsertSchema = (schema?: Record<string, any> | null) => {
  const id = "gzv-managed-schema"
  let script = document.getElementById(id) as HTMLScriptElement | null
  if (!schema) {
    script?.remove()
    return
  }
  if (!script) {
    script = document.createElement("script")
    script.id = id
    script.type = "application/ld+json"
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(schema)
}

const updateFavicons = (faviconUrl?: string | null) => {
  if (!faviconUrl || typeof document === "undefined") return

  const rels = ["icon", "shortcut icon", "apple-touch-icon"]
  rels.forEach((rel) => {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
    if (link) {
      link.href = faviconUrl
    } else {
      link = document.createElement("link")
      link.rel = rel
      link.href = faviconUrl
      document.head.appendChild(link)
    }
  })
}

export default function SeoBrandingManager() {
  const pathname = usePathname()

  useEffect(() => {
    let active = true
    const loadSeo = () => Promise.all([getBrandingSettings(), getSitePageContent(getPageSlugFromPath(pathname))]).then(([branding, page]) => {
      if (!active) return
      const isHome = getPageSlugFromPath(pathname) === "home" || !getPageSlugFromPath(pathname)
      const defaultSiteTitle = branding.default_title || "GZV - The Voice of Genzers"

      if (isHome) {
        document.title = defaultSiteTitle
      } else {
        const slug = getPageSlugFromPath(pathname)
        const DEFAULT_PAGE_NAMES: Record<string, string> = {
          "gioi-thieu": "Giới thiệu",
          "dich-vu": "Dịch vụ",
          "du-an": "Dự án",
          "gzver": "GZVers",
          "doi-tac": "Đối tác",
          "tin-tuc": "Tin tức",
          "lien-he": "Liên hệ",
        }

        const pageTitle = page?.title || page?.seo_title || DEFAULT_PAGE_NAMES[slug] || slug
        const siteBrand = "GZV - The Voice of Genzers"
        document.title = siteBrand ? `${pageTitle} | ${siteBrand}` : pageTitle
      }

      upsertMeta("description", page?.seo_description || branding.default_description)
      upsertMeta("keywords", branding.seo_keywords || (branding.default_keywords?.startsWith("{") ? undefined : branding.default_keywords))
      upsertMeta("author", branding.author)
      upsertMeta("robots", `${branding.robots_index === false ? "noindex" : "index"},${branding.robots_follow === false ? "nofollow" : "follow"}`)
      const pageDescription = page?.seo_description || branding.og_description || branding.default_description
      const pageTitle = document.title
      const ogImage = branding.og_image_url || "/og-cover.jpg"
      upsertProperty("og:title", branding.og_title || pageTitle)
      upsertProperty("og:description", pageDescription)
      upsertProperty("og:url", branding.og_url || branding.canonical_url || window.location.href)
      upsertProperty("og:type", "website")
      upsertProperty("og:site_name", "GZV - The Voice of Genzers")
      upsertProperty("og:image", ogImage)
      upsertProperty("og:image:alt", branding.og_image_alt || pageTitle)
      upsertProperty("og:image:width", String(branding.og_image_width || 1200))
      upsertProperty("og:image:height", String(branding.og_image_height || 630))
      upsertMeta("twitter:card", branding.twitter_card || "summary_large_image")
      upsertMeta("twitter:title", branding.twitter_title || branding.og_title || pageTitle)
      upsertMeta("twitter:description", branding.twitter_description || pageDescription)
      upsertMeta("twitter:image", branding.twitter_image_url || ogImage)
      upsertLink("canonical", branding.canonical_url || window.location.href)
      upsertSchema(branding.seo_schema_json)
      updateFavicons(branding.favicon_url)
    })
    loadSeo()
    const channel = supabase
      .channel(`site-seo:${getPageSlugFromPath(pathname)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_branding_settings" }, loadSeo)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_pages" }, loadSeo)
      .subscribe()
    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [pathname])

  return null
}
