'use client'

import { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api, gzver } from "@/lib/api-supabase"
import { getHomeSectionConfig, type HomeSectionConfig } from "@/lib/site-content"

export default function DirectorsSection() {
  const [directors, setDirectors] = useState<gzver[]>([])
  const [section, setSection] = useState<HomeSectionConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([api.getGzvers(), getHomeSectionConfig("directors")])
      .then(([data, config]) => {
        if (!active) return
        setSection(config)
        const filtered = data.filter((item) => item.is_director && item.is_active)
        setDirectors(filtered.slice(0, config?.item_limit || 6))
      })
      .catch((error) => console.error("Error fetching directors:", error))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#00539b]" size={40} />
      </div>
    )
  }

  if (section?.is_visible === false || directors.length === 0) return null

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title mb-6">
            {section?.title || "Ban điều hành"}
          </h2>
          {(section?.subtitle || section?.description) && (
            <p className="section-description">
              {section?.subtitle || section?.description}
            </p>
          )}
        </motion.div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-8 text-center md:grid-cols-2 lg:grid-cols-3">
          {directors.map((director, index) => (
            <motion.div
              key={director.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex"
            >
              <Card className="group relative flex w-full flex-col overflow-hidden rounded-none border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition-all duration-300 hover:border-[#00539b] hover:shadow-[0_24px_48px_rgba(8,47,87,0.14)] dark:border-slate-800 dark:bg-slate-900">
                <CardContent className="flex h-full flex-col items-center p-8">
                  <div className="relative mb-8 shrink-0">
                    <div className="relative h-40 w-40 overflow-hidden rounded-none border border-slate-100 bg-white p-1 shadow-xl dark:bg-slate-800">
                      <Image
                        src={director.avatar_url || '/gzvers/default.webp'}
                        alt={director.full_name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute bottom-1 right-1 rounded-none border-[4px] border-white bg-[#ed1c24] p-2.5 text-white shadow-lg dark:border-slate-900">
                      <Star size={18} className="fill-white" />
                    </div>
                  </div>

                  <div className="flex w-full flex-grow flex-col">
                    <h3 className="mb-2 text-2xl font-black uppercase leading-tight text-slate-900 transition-colors group-hover:text-[#00539b] dark:text-white">
                      {director.full_name}
                    </h3>
                    <p className="mb-6 text-base font-extrabold uppercase text-[#00539b]">
                      {director.position}
                    </p>

                    <div className="mb-8 flex flex-grow items-center justify-center">
                      <blockquote className="px-4 text-base italic leading-relaxed text-slate-500 dark:text-slate-400">
                        "{director.achievement_summary || director.testimonial || ""}"
                      </blockquote>
                    </div>

                    <div className="mt-auto w-full pt-4">
                      <Link href={`/gzver/${director.slug}`} className="block">
                        <Button className="btn-primary h-12 w-full rounded-none text-sm font-semibold">
                          Xem hồ sơ <ArrowRight size={18} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
