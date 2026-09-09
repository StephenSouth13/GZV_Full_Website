"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api-supabase"
import SectionIntro from "@/components/sections/common/SectionIntro"

export interface PeopleGridProps {
  title?: string
  subtitle?: string
  type?: string
  limit?: number
}

export default function PeopleGrid({
  title,
  subtitle,
  type = "directors",
  limit = 6,
}: PeopleGridProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api
      .getGzvers()
      .then((data) => {
        if (!active) return
        let rows = data || []
        if (type === "directors") rows = rows.filter((item: any) => item.is_director && item.is_active)
        else rows = rows.filter((item: any) => item.is_active)
        setItems(rows.slice(0, Number(limit) || 6))
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setItems([])
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [type, limit])

  return (
    <section className="bg-slate-50 py-16 text-slate-950 dark:bg-slate-900 dark:text-white lg:py-24">
      <div className="container px-4">
        <SectionIntro title={title} subtitle={subtitle} align="left" />
        {loading ? (
          <div className="mx-auto h-12 w-12 animate-spin border-b-2 border-[#ed1c24]" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const href = item.slug ? `/gzver/${item.slug}` : undefined
              const CardContent = (
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-900">
                  {/* Top Image Frame */}
                  <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-slate-900">
                    <img
                      src={item.avatar_url || "/gzvers/default.webp"}
                      alt={item.full_name}
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      style={{
                        objectPosition: `${item.avatar_position_x ?? 50}% ${item.avatar_position_y ?? 25}%`,
                        transform: `scale(${(item.avatar_scale || 100) / 100})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Bottom Text Content */}
                  <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
                    <h4 className="text-base font-bold text-[#ed1c24] transition-colors group-hover:text-[#c91218] dark:text-[#ff4d4f]">
                      {item.full_name}
                    </h4>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.position || item.company || item.headline || "GZVer"}
                    </p>
                  </div>
                </div>
              )

              return href ? (
                <Link key={item.id} href={href} className="block h-full">
                  {CardContent}
                </Link>
              ) : (
                <div key={item.id} className="h-full">
                  {CardContent}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
