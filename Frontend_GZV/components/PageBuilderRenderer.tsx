"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Award, BookOpen, Target, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api, type Program } from "@/lib/api-supabase"
import { getPageBlocks, type PageBlock } from "@/lib/site-content"

const iconMap: Record<string, any> = {
  award: Award,
  book: BookOpen,
  target: Target,
  users: Users,
}

export default function PageBuilderRenderer({ slug, fallback }: { slug: string; fallback?: React.ReactNode }) {
  const [blocks, setBlocks] = useState<PageBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getPageBlocks(slug).then((data) => {
      if (!active) return
      setBlocks(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [slug])

  if (loading) return null
  if (blocks.length === 0) return <>{fallback || null}</>

  return <>{blocks.map((block) => <RenderBlock key={block.id || block.block_key} block={block} />)}</>
}

function RenderBlock({ block }: { block: PageBlock }) {
  const props = block.props || {}
  switch (block.component_type) {
    case "hero_stats":
      return <HeroStats {...props} />
    case "msc_words":
      return <MscWords {...props} />
    case "feature_grid":
      return <FeatureGrid {...props} />
    case "programs_grid":
      return <ProgramsGrid {...props} />
    case "image_gallery":
      return <ImageGallery {...props} />
    case "cta_band":
      return <CtaBand {...props} />
    case "html_rich":
      return <HtmlBlock html={block.content_html || ""} maxWidth={props.maxWidth} />
    default:
      return null
  }
}

function HeroStats({ title, subtitle, stats = [], backgroundFrom = "#1e3a8a", backgroundTo = "#0f766e" }: any) {
  return (
    <section className="py-16 sm:py-20 text-white" style={{ background: `linear-gradient(135deg, ${backgroundFrom}, ${backgroundTo})` }}>
      <div className="container px-4">
        <div className="mx-auto max-w-5xl text-center">
          {title && <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">{title}</h1>}
          {subtitle && <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/85 sm:text-xl">{subtitle}</p>}
          {stats.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
              {stats.map((stat: any, index: number) => (
                <div key={index} className="rounded-xl bg-white/5 p-3">
                  <div className="text-3xl font-black text-teal-300">{stat.value}</div>
                  <div className="mt-1 text-sm text-white/75">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function MscWords({ lines = [], accentLetters = [], accentColor = "#f97316" }: any) {
  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900 sm:py-20">
      <div className="container px-4 text-center">
        <div className="space-y-3">
          {lines.map((line: string, index: number) => {
            const first = accentLetters[index] || line.charAt(0)
            const rest = line.startsWith(first) ? line.slice(first.length) : line
            return (
              <h2 key={index} className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span style={{ color: accentColor }}>{first}</span>{rest}
              </h2>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeatureGrid({ title, subtitle, items = [], columns = 3 }: any) {
  const gridCols = Number(columns) >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
  return (
    <section className="bg-white py-16 dark:bg-gray-800 sm:py-20">
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mx-auto mb-12 max-w-4xl text-center">
            {title && <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-5xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
        )}
        <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${gridCols}`}>
          {items.map((item: any, index: number) => {
            const Icon = iconMap[item.icon] || Award
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <div className="h-full rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
                    <Icon className="h-7 w-7" style={{ color: item.color || "#2563eb" }} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{item.title}</h3>
                  {item.description && <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">{item.description}</p>}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ProgramsGrid({ title, subtitle, limit = 12 }: any) {
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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <Card key={program.id} className="overflow-hidden rounded-2xl border-none bg-white shadow-sm transition hover:shadow-2xl dark:bg-gray-800">
                <div className="relative h-56">
                  <img src={program.image || "/placeholder.jpg"} alt={program.title} className="h-full w-full object-cover" />
                  {program.level && <div className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase text-white">{program.level}</div>}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-xl font-black dark:text-white">{program.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{program.description}</p>
                  <Link href={`/dao-tao/${program.slug}`}>
                    <Button className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700">Chi tiết khóa học</Button>
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

function ImageGallery({ title, subtitle, images = [] }: any) {
  if (!images.length) return null
  return (
    <section className="bg-white py-16 dark:bg-gray-800 sm:py-20">
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mx-auto mb-12 max-w-4xl text-center">
            {title && <h2 className="text-3xl font-black uppercase text-gray-900 dark:text-white sm:text-5xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image: any, index: number) => (
            <div key={index} className="relative aspect-video overflow-hidden rounded-lg shadow-md">
              <Image src={image.src || "/placeholder.jpg"} alt={image.alt || image.title || `Image ${index + 1}`} fill className="object-cover transition hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBand({ title, description, buttonLabel, buttonUrl, backgroundFrom = "#2563eb", backgroundTo = "#0f766e" }: any) {
  return (
    <section className="py-16 text-white sm:py-20" style={{ background: `linear-gradient(90deg, ${backgroundFrom}, ${backgroundTo})` }}>
      <div className="container px-4 text-center">
        {title && <h2 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">{title}</h2>}
        {description && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">{description}</p>}
        {buttonLabel && buttonUrl && (
          <Link href={buttonUrl}>
            <Button size="lg" className="mt-8 rounded-full bg-white px-10 py-7 text-lg font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50">
              {buttonLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </div>
    </section>
  )
}

function HtmlBlock({ html, maxWidth = "960px" }: { html: string; maxWidth?: string }) {
  if (!html) return null
  return (
    <section className="bg-white py-16 dark:bg-gray-900">
      <div className="container px-4">
        <div className="prose prose-lg mx-auto max-w-none dark:prose-invert" style={{ maxWidth }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  )
}
