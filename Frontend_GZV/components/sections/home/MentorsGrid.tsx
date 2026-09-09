"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api, supabase } from "@/lib/api-supabase"

export interface MentorsGridProps {
  title?: string
  subtitle?: string
  limit?: number
  background?: string
}

export default function MentorsGrid({
  title: propTitle,
  subtitle: propSubtitle,
  limit = 9,
  background,
}: MentorsGridProps) {
  const [items, setItems] = useState<any[]>([])
  const [dbData, setDbData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const isDark = background ? String(background).toLowerCase() !== "#ffffff" && String(background).toLowerCase() !== "white" : false

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      supabase.from("site_home_sections").select("*").eq("section_key", "mentors").maybeSingle(),
      api.getMentors(),
    ])
      .then(([homeRes, data]) => {
        if (!active) return
        if (homeRes.data) {
          setDbData(homeRes.data)
        }
        const finalLimit = homeRes.data?.item_limit || limit || 9
        setItems((data || []).slice(0, Number(finalLimit)))
      })
      .catch((err) => {
        console.error("Lỗi tải danh sách mentor:", err)
        if (!active) return
        setItems([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [limit])

  if (dbData?.is_visible === false && !propTitle) {
    return null
  }

  const title = propTitle || dbData?.title || "BAN GIẢNG HUẤN"
  const subtitle = propSubtitle || dbData?.subtitle || "Đội ngũ Ban giảng huấn Mentoring & Coaching của GZV Center"

  return (
    <section className="bg-white py-16 dark:bg-gray-900 sm:py-20" style={background ? { background } : undefined}>
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mb-12 max-w-4xl text-left">
            {title && <h2 className={`text-3xl font-black uppercase sm:text-5xl ${isDark ? "text-white" : "text-gray-900 dark:text-white"}`}>{title}</h2>}
            {subtitle && <p className={`mt-4 text-lg ${isDark ? "text-white/70" : "text-gray-600 dark:text-gray-300"}`}>{subtitle}</p>}
          </div>
        )}

        {loading ? (
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#ed1c24]" />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => <MentorCardItem key={item.id || item.slug || index} item={item} />)}
          </div>
        ) : (
          <div className="py-12 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
            Chưa có danh sách mentor.
          </div>
        )}
      </div>
    </section>
  )
}

function MentorCardItem({ item }: { item: any }) {
  const title = item.full_name || item.title || item.name || "Mentor"
  const image = item.avatar_url || item.image || "/placeholder.jpg"
  const description = item.role || item.company || item.description || ""
  const href = item.slug ? `/mentors/${item.slug}` : ""

  const card = (
    <Card className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-gray-800">
      <div>
        <div className="relative h-52 bg-slate-100">
          <img src={image} alt={title} className="h-full w-full object-cover" />
        </div>
        <CardHeader className="text-center">
          <CardTitle className="line-clamp-2 text-center text-xl font-black dark:text-white">{title}</CardTitle>
        </CardHeader>
      </div>
      <CardContent className="flex flex-1 flex-col justify-between pt-0">
        {description && <p className="mb-6 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>}
        {href && (
          <Button variant="outline" className="mt-auto w-full rounded-xl border-[#ed1c24] text-xs font-black uppercase text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white transition">
            Chi tiết <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )

  if (!href) return card
  return <Link href={href}>{card}</Link>
}
