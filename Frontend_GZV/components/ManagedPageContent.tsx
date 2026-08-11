'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getPageSlugFromPath, getSitePageContent, type SitePageContent } from '@/lib/site-content'
import { useLanguage } from '@/components/language-provider'

export default function ManagedPageContent() {
  const pathname = usePathname()
  const { language } = useLanguage()
  const [page, setPage] = useState<SitePageContent | null>(null)

  useEffect(() => {
    let active = true
    getSitePageContent(getPageSlugFromPath(pathname)).then((data) => {
      if (active) setPage(data)
    })
    return () => { active = false }
  }, [pathname])

  const html = language === "en" ? ((page as any)?.content_html_en || page?.content_html) : page?.content_html

  if (!html || !page?.is_visible) return null

  return (
    <section className="bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div
          className="prose prose-lg max-w-none dark:prose-invert prose-img:rounded-2xl prose-img:shadow-lg prose-a:text-[#ed1c24]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  )
}
