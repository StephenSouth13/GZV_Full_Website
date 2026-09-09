"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api, supabase } from "@/lib/api-supabase"

export interface NewsGridProps {
  title?: string
  subtitle?: string
  limit?: number
  background?: string
  hp?: any
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ""
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return ""
  }
}

export default function NewsGrid({
  title: propTitle,
  subtitle: propSubtitle,
  hp,
}: NewsGridProps) {
  const [articles, setArticles] = useState<any[]>([])
  const [sectionConfig, setSectionConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const [homeRes, blockRes, blogPosts] = await Promise.all([
          supabase.from("site_home_sections").select("*").eq("section_key", "news").maybeSingle(),
          supabase.from("site_page_blocks").select("props").eq("component_type", "news_grid").limit(1).maybeSingle(),
          api.getBlogPosts(),
        ])

        if (!active) return

        const homeData = homeRes.data
        const blockProps = blockRes.data?.props
        const combined = { ...(blockProps || {}), ...(homeData || {}), ...(homeData?.settings || {}) }
        setSectionConfig(combined)

        const selectedIds: string[] = combined?.selected_article_ids || []

        if (selectedIds.length > 0 && blogPosts && blogPosts.length > 0) {
          const sorted = selectedIds
            .map((id) => blogPosts.find((a: any) => String(a.id) === String(id) || a.slug === id))
            .filter(Boolean)
          setArticles(sorted.length > 0 ? sorted : blogPosts.slice(0, combined?.item_limit || 4))
        } else if (blogPosts && blogPosts.length > 0) {
          const limit = combined?.item_limit || 4
          setArticles(blogPosts.slice(0, Number(limit) || 4))
        } else {
          // Fallback direct query on allblogposts
          const { data } = await supabase
            .from("allblogposts")
            .select("*")
            .order("publish_date", { ascending: false })
            .limit(4)
          if (active && data) {
            setArticles(data)
          }
        }
      } catch (err: any) {
        console.error("Lỗi tải tin tức:", err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()

    return () => {
      active = false
    }
  }, [])

  if (sectionConfig?.is_visible === false && !propTitle) {
    return null
  }

  const meta = hp?.blog_section || sectionConfig || {}
  const title = propTitle || meta.title || "TIN TỨC MỚI NHẤT"
  const subtitle = propSubtitle || meta.subtitle || meta.description || "Cập nhật tin tức, kiến thức và câu chuyện truyền cảm hứng"
  const ctaLabel = meta.button_label || meta.cta_label || "Xem tất cả bài viết"
  const ctaUrl = meta.button_url || "/tin-tuc"

  if (!loading && !articles.length) {
    return (
      <section className="py-16 relative bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 select-none text-left">
        <div className="container mx-auto px-4 max-w-7xl space-y-4">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-950 dark:text-white leading-tight">
            {title}
          </h2>
          <p className="mt-3 text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400 max-w-2xl tracking-wider">
            {subtitle}
          </p>
          <div className="p-8 border border-dashed border-slate-200 dark:border-white/10 rounded-none bg-slate-50 dark:bg-slate-900 text-xs font-black uppercase tracking-wider text-slate-400 max-w-md mt-6">
            Chưa có bài viết nào được xuất bản hoặc được chọn
          </div>
        </div>
      </section>
    )
  }

  const featured = articles[0]
  const rest = articles.slice(1, 4)

  return (
    <section className="py-20 md:py-28 relative bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 select-none">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-12 max-w-3xl"
        >
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white uppercase leading-tight">
            {title.includes("VƯỢT TRỘI") ? (
              <>
                {title.split("VƯỢT TRỘI")[0]}
                <span className="text-[#ed1c24]">VƯỢT TRỘI</span>
                {title.split("VƯỢT TRỘI")[1]}
              </>
            ) : (
              title
            )}
          </h2>
          {subtitle && (
            <p className="mt-3 text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400 max-w-2xl tracking-wider">
              {subtitle.includes("VƯỢT TRỘI") ? (
                <>
                  {subtitle.split("VƯỢT TRỘI")[0]}
                  <span className="text-[#ed1c24]">VƯỢT TRỘI</span>
                  {subtitle.split("VƯỢT TRỘI")[1]}
                </>
              ) : (
                subtitle
              )}
            </p>
          )}
        </motion.div>

        {/* Blog Grid */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="h-10 w-10 animate-spin border-2 border-[#ed1c24] border-t-transparent" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Featured Article (Left Side - 7 Cols) */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-7 flex"
              >
                <Link
                  href={`/tin-tuc/${featured.slug}`}
                  className="group relative flex flex-col justify-between w-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-none overflow-hidden hover:border-[#ed1c24] transition-colors"
                >
                  {/* Image Area */}
                  <div className="relative h-72 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {featured.thumbnail_url || featured.image ? (
                      <img
                        src={featured.thumbnail_url || featured.image}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#ed1c24]/10 to-slate-100 dark:to-slate-800 flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                        GZV News
                      </div>
                    )}
                    {/* Gradient for date contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Category Badge Top-Left */}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider rounded-none px-3 py-1 border-0">
                        {featured.category || "TIN TỨC"}
                      </Badge>
                    </div>

                    {/* Published Date Bottom-Left */}
                    {(featured.published_at || featured.created_at || featured.publish_date) && (
                      <div className="absolute bottom-3 left-3 z-10 text-white text-xs font-bold flex items-center gap-1.5 drop-shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-[#ed1c24]" />
                        <span>{formatDate(featured.published_at || featured.created_at || featured.publish_date)}</span>
                      </div>
                    )}
                  </div>

                  {/* Text Content Area */}
                  <div className="p-6 md:p-7 bg-white dark:bg-slate-900 space-y-4 flex-1 flex flex-col justify-between">
                    <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-[#ed1c24] transition-colors line-clamp-2 leading-snug">
                      {featured.title}
                    </h3>

                    <div className="pt-2 flex items-center text-xs font-black uppercase text-[#ed1c24] tracking-wider">
                      <span>ĐỌC BÀI</span>
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Secondary Articles List (Right Side - 5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">
              {rest.map((article: any, i: number) => (
                <motion.div
                  key={article.id || article.slug || i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={`/tin-tuc/${article.slug}`}
                    className="group grid grid-cols-[130px_minmax(0,1fr)] sm:grid-cols-[160px_minmax(0,1fr)] min-h-[145px] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-none overflow-hidden hover:border-[#ed1c24] transition-colors"
                  >
                    {/* Thumbnail Image Left (Fixed 160px grid col) */}
                    <div className="w-full h-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {article.thumbnail_url || article.image ? (
                        <img
                          src={article.thumbnail_url || article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-400 uppercase">
                          GZV
                        </div>
                      )}

                      {/* Category Badge Top-Left of Image */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-slate-900 text-white rounded-none">
                          {article.category || "TIN TỨC"}
                        </span>
                      </div>
                    </div>

                    {/* Content Right */}
                    <div className="min-w-0 p-4 sm:p-5 flex flex-col justify-between">
                      <h4 className="font-black text-sm sm:text-base uppercase line-clamp-3 text-slate-950 dark:text-white group-hover:text-[#ed1c24] transition-colors leading-snug">
                        {article.title}
                      </h4>

                      {(article.published_at || article.created_at || article.publish_date) && (
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5 pt-2">
                          <Clock className="w-3 h-3 text-[#ed1c24] shrink-0" />
                          <span>{formatDate(article.published_at || article.created_at || article.publish_date)}</span>
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* View All Button */}
        {articles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              className="rounded-none px-8 h-11 font-black text-xs uppercase tracking-wider border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-xs"
              asChild
            >
              <Link href={ctaUrl}>
                <span>{ctaLabel}</span>
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
