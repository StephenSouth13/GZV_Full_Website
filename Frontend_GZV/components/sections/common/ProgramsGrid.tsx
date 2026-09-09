"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api, type Program } from "@/lib/api-supabase"

export interface ProgramsGridProps {
  title?: string
  subtitle?: string
  limit?: number
  language?: "vi" | "en"
}

export default function ProgramsGrid({ title, subtitle, limit = 12, language = "vi" }: ProgramsGridProps) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.getPrograms().then((data) => {
      if (!active) return
      setPrograms((data || []).slice(0, Number(limit) || 12))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [limit])

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900 sm:py-20">
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mx-auto mb-12 max-w-4xl text-center">
            {title && <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-5xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
        )}
        {loading ? (
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#ed1c24]" />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Card key={program.id} className="overflow-hidden rounded-2xl border-none bg-white shadow-sm transition hover:shadow-2xl dark:bg-gray-800">
                <div className="relative h-56">
                  <img src={program.image || "/placeholder.jpg"} alt={program.title} className="h-full w-full object-cover" />
                  {program.level && <div className="absolute left-4 top-4 rounded-full bg-[#ed1c24] px-3 py-1 text-xs font-bold uppercase text-white">{program.level}</div>}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-xl font-black dark:text-white">{program.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{program.description}</p>
                  <Link href="/dich-vu">
                    <Button className="w-full rounded-none bg-[#ed1c24] text-white hover:bg-[#ed1c24]">{language === "en" ? "Service details" : "Chi tiết dịch vụ"}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
