"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Award, BookOpen, Target, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api, type Program } from "@/lib/api-supabase"
import ContactForm from "@/components/ContactForm"
import PageBanner from "@/components/sections/PageBanner"
import { getActivePartners, getPageBlocks, type PageBlock } from "@/lib/site-content"

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
    case "projects_grid":
      return <DynamicGrid source="projects" {...props} />
    case "news_grid":
      return <DynamicGrid source="news" {...props} />
    case "mentors_grid":
      return <DynamicGrid source="mentors" {...props} />
    case "gzvers_grid":
      return <DynamicGrid source="gzvers" {...props} />
    case "partners_grid":
      return <DynamicGrid source="partners" {...props} />
    case "contact_form":
      return <ContactFormBlock {...props} />
    case "page_banner":
      return <PageBanner {...props} />
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

function DynamicGrid({ source, title, subtitle, limit = 9, background = "#ffffff" }: any) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      const loaders: Record<string, () => Promise<any[]>> = {
        projects: () => api.getProjects(),
        news: () => api.getBlogPosts(),
        mentors: () => api.getMentors(),
        gzvers: () => api.getGzvers(),
        partners: () => getActivePartners(Number(limit) || 40),
      }
      const data = await (loaders[source] || loaders.projects)()
      if (!active) return
      setItems((data || []).slice(0, Number(limit) || 9))
      setLoading(false)
    }
    load().catch(() => {
      if (!active) return
      setItems([])
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [source, limit])

  return (
    <section className="py-16 dark:bg-gray-900 sm:py-20" style={{ background }}>
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => <DynamicCard key={item.id || item.slug || index} item={item} source={source} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function DynamicCard({ item, source }: { item: any; source: string }) {
  const title = item.title || item.full_name || item.name || "Untitled"
  const image = item.image || item.avatar_url || item.logo_url || "/placeholder.jpg"
  const description = item.description || item.excerpt || item.role || item.company || item.website_url || ""
  const href = getDynamicHref(item, source)
  const card = (
    <Card className="h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-gray-800">
      <div className="relative h-52 bg-slate-100">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-xl font-black dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {description && <p className="line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>}
      </CardContent>
    </Card>
  )

  if (!href) return card
  return <Link href={href}>{card}</Link>
}

function getDynamicHref(item: any, source: string) {
  if (source === "projects" && item.slug) return `/du-an/${item.slug}`
  if (source === "news" && item.slug) return `/tin-tuc/${item.slug}`
  if (source === "mentors" && item.slug) return `/mentors/${item.slug}`
  if (source === "gzvers" && item.slug) return `/gzver/${item.slug}`
  if (source === "partners") return item.website_url || ""
  return ""
}

function ContactFormBlock({ title, subtitle }: any) {
  return (
    <section className="bg-white py-16 dark:bg-gray-900 sm:py-20">
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {title && <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-5xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
        )}
        <ContactForm />
      </div>
    </section>
  )
}

function HeroStats({ title, subtitle, stats = [], backgroundFrom = "#050505", backgroundTo = "#ed1c24" }: any) {
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
                    <Icon className="h-7 w-7" style={{ color: item.color || "#ed1c24" }} />
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
                  <Link href="/#dich-vu">
                    <Button className="w-full rounded-none bg-[#ed1c24] text-white hover:bg-[#ed1c24]">Chi tiết dịch vụ</Button>
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
    <section className="bg-white py-16 dark:bg-gray-950 sm:py-20">
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mb-10 max-w-4xl border-l-4 border-[#ed1c24] pl-5">
            {title && <h2 className="text-3xl font-black uppercase text-gray-900 dark:text-white sm:text-5xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-base font-semibold leading-7 text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {images.map((image: any, index: number) => (
            <article key={index} className="group overflow-hidden border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-[#ed1c24] dark:border-white/10 dark:bg-slate-900">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <Image src={image.src || "/placeholder.jpg"} alt={image.alt || image.title || `Image ${index + 1}`} fill className="object-cover transition duration-700 group-hover:scale-110" />
                {image.category && <span className="absolute left-3 top-3 bg-[#ed1c24] px-3 py-1.5 text-[10px] font-black uppercase text-white">{image.category}</span>}
              </div>
              <div className="p-4">
                {image.title && <h3 className="text-base font-black uppercase leading-tight text-slate-950 dark:text-white">{image.title}</h3>}
                {image.description && <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{image.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBand({ title, description, buttonLabel, buttonUrl, backgroundFrom = "#ed1c24", backgroundTo = "#ed1c24" }: any) {
  return (
    <section className="py-16 text-white sm:py-20" style={{ background: `linear-gradient(90deg, ${backgroundFrom}, ${backgroundTo})` }}>
      <div className="container px-4 text-center">
        {title && <h2 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">{title}</h2>}
        {description && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">{description}</p>}
        {buttonLabel && buttonUrl && (
          <Link href={buttonUrl}>
            <Button size="lg" className="mt-8 rounded-full bg-white px-10 py-7 text-lg font-black uppercase tracking-widest text-[#ed1c24] hover:bg-red-50">
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
