"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, BookOpen, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { api, supabase } from "@/lib/api-supabase"
import { summarize } from "@/lib/utils"

const summaryOf = (article: any, max = 180) => summarize([article?.excerpt, article?.content], max)

function AuthorStack({ authors, compact = false }: { authors?: any[]; compact?: boolean }) {
  const list = Array.isArray(authors) ? authors : []
  if (!list.length) return null
  const visible = list.slice(0, 2)
  const extra = Math.max(0, list.length - visible.length)
  const size = compact ? "h-6 w-6" : "h-7 w-7"
  return <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
    <div className="flex -space-x-2">
      {visible.map((author: any, index: number) => <Avatar key={`${author.id || author.full_name}-${index}`} className={`${size} border-2 border-white dark:border-slate-900`}><AvatarImage src={author.avatar_url || author.avatar} /><AvatarFallback className="text-[9px]">{(author.full_name || author.name || "G").slice(0, 1)}</AvatarFallback></Avatar>)}
      <Popover>
        <PopoverTrigger asChild><button type="button" className={`${size} rounded-full border-2 border-white bg-slate-950 text-[9px] font-black text-white dark:border-slate-900`}>{extra ? `+${extra}` : "..."}</button></PopoverTrigger>
        <PopoverContent className="w-64 rounded-none p-3"><p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#ed1c24]">Tác giả / đội ngũ</p>{list.map((author: any, index: number) => <div key={`${author.id || author.full_name}-full-${index}`} className="flex items-center gap-2 py-1"><Avatar className="h-6 w-6"><AvatarImage src={author.avatar_url || author.avatar} /></Avatar><span className="text-xs font-bold">{author.full_name || author.name}</span></div>)}</PopoverContent>
      </Popover>
    </div>
    <div className="min-w-0"><p className={`${compact ? "max-w-[110px]" : "max-w-[150px]"} truncate text-[10px] font-black uppercase text-slate-700 dark:text-slate-200`}>{list[0].full_name || list[0].name}</p>{list.length > 1 && <p className="text-[9px] font-bold uppercase text-slate-400">& {list.length - 1} tác giả khác</p>}</div>
  </div>
}

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
  initialConfig,
  initialArticles,
}: NewsGridProps & { initialConfig?: any; initialArticles?: any[] }) {
  const [articles, setArticles] = useState<any[]>(initialArticles || [])
  const [sectionConfig, setSectionConfig] = useState<any>(initialConfig ?? null)
  const [loading, setLoading] = useState(!initialArticles)

  useEffect(() => {
    let active = true

    const fetchData = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true)
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

        // Bố cục cần tối thiểu 4 bài (1 lớn + 3 cột phải). Nếu cấu hình đặt thấp hơn
        // thì nâng lên cho đủ ô, tránh để trống một mảng lớn bên phải.
        const limit = Math.max(4, Number(combined?.item_limit) || 4)

        if (selectedIds.length > 0 && blogPosts && blogPosts.length > 0) {
          const pinned = selectedIds
            .map((id) => blogPosts.find((a: any) => String(a.id) === String(id) || a.slug === id))
            .filter(Boolean)
          const remaining = blogPosts.filter((article: any) => !pinned.some((item: any) => item.id === article.id))
          setArticles(pinned.length > 0 ? [...pinned, ...remaining].slice(0, limit) : blogPosts.slice(0, limit))
        } else if (blogPosts && blogPosts.length > 0) {
          const featuredPosts = blogPosts.filter((article: any) => article.featured)
          const ordered = featuredPosts.length ? [...featuredPosts, ...blogPosts.filter((article: any) => !featuredPosts.includes(article))] : blogPosts
          setArticles(ordered.slice(0, limit))
        } else {
          // Fallback direct query on allblogposts
          const { data } = await supabase
            .from("allblogposts")
            .select("*")
            .eq("status", "published")
            .lte("published_at", new Date().toISOString())
            .order("sort_order", { ascending: true })
            .order("publish_date", { ascending: false })
            .limit(4)
          if (active && data) {
            setArticles(data)
          }
        }
      } catch (err: any) {
        console.error("Lỗi tải tin tức:", err)
      } finally {
        if (active && showLoading) setLoading(false)
      }
    }

    fetchData(!initialArticles)

    const channel = supabase
      .channel("home-news:sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, () => fetchData(false))
      .on("postgres_changes", { event: "*", schema: "public", table: "authors" }, () => fetchData(false))
      .on("postgres_changes", { event: "*", schema: "public", table: "site_home_sections" }, () => fetchData(false))
      .on("postgres_changes", { event: "*", schema: "public", table: "site_page_blocks" }, () => fetchData(false))
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
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

  // Bố cục chuẩn: 1 bài lớn bên trái + 3 bài vừa xếp chồng bên phải.
  // Chỉ lấy tối đa 3 bài cho cột phải, không kéo giãn khi thiếu bài.
  const list = articles.filter((article: any) => article && (article.title || article.slug))
  const featured = list[0]
  const rest = list.slice(1, 4)

  // Cột phải dùng 3 ô có chiều cao bằng nhau; khi chỉ có 2 bài thì hàng thứ ba
  // tự thu về đúng chiều cao nội dung thay vì phình ra.
  const rightCards = useMemo(() => (rest.length ? rest : []), [rest.length])

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

        {/* Blog Grid: hai cột cao bằng nhau, cột phải chia đều chiều cao cho từng thẻ
            nên nội dung giãn khít và không còn khoảng trống ở đáy. */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="h-10 w-10 animate-spin border-2 border-[#ed1c24] border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex lg:col-span-6"
            >
              <FeaturedCard article={featured} />
            </motion.div>

            {/* Cột phải: 3 bài vừa xếp chồng, chia đều chiều cao thẻ lớn bên trái.
                Mỗi ô là một hàng riêng cao bằng nhau nên luôn khít, không hở đáy. */}
            <div className="flex flex-col gap-6 lg:col-span-6">
              {rightCards.map((article: any, index) => (
                <MediumCard
                  key={`${article.id || article.slug || "card"}-${index}`}
                  article={article}
                  delay={index * 0.08}
                  fill
                />
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

/* ══════════════════ Các khối thẻ dùng chung cho mọi chế độ bố cục ══════════════════ */

const cardImage = (article: any) => article?.thumbnail_url || article?.image
const cardDate = (article: any) => article?.published_at || article?.created_at || article?.publish_date
const cardHasMore = (article: any) => Boolean(article?.__repeat)
const cardLink = (article: any) => `/tin-tuc/${article?.slug}`

// Thẻ lớn: ảnh tràn viền phía trên, nội dung đầy đủ bên dưới.
// Ảnh dùng flex-1 nên tự co giãn theo chiều cao cột, giúp hai cột luôn cân nhau.
function FeaturedCard({ article }: { article: any }) {
  return (
    <Link
      href={cardLink(article)}
      className="group relative flex flex-col w-full h-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-none overflow-hidden hover:border-[#ed1c24] transition-colors"
    >
      <div className="relative h-64 sm:h-72 md:h-80 lg:h-auto lg:min-h-[300px] lg:flex-1 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {cardImage(article) ? (
          <img
            src={cardImage(article)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
            style={{
              objectPosition: `${article.image_position_x ?? 50}% ${article.image_position_y ?? 50}%`,
              transform: `scale(${(article.image_scale ?? 100) / 100})`,
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#ed1c24]/10 to-slate-100 dark:to-slate-800 flex items-center justify-center text-slate-400 font-black text-xs uppercase">
            GZV News
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
          <Badge className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider rounded-none px-3 py-1 border-0">
            {article.category || "TIN TỨC"}
          </Badge>
          {cardHasMore(article) && (
            <Badge className="bg-[#ed1c24] text-white font-black text-[10px] uppercase tracking-wider rounded-none px-3 py-1 border-0">
              Tiêu điểm
            </Badge>
          )}
        </div>

        {cardDate(article) && (
          <div className="absolute bottom-3 left-3 z-10 text-white text-xs font-bold flex items-center gap-1.5 drop-shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#ed1c24]" />
            <span>{formatDate(cardDate(article))}</span>
          </div>
        )}
      </div>

      <div className="p-5 md:p-7 bg-white dark:bg-slate-900 space-y-4 shrink-0 flex flex-col justify-between">
        <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-[#ed1c24] transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>
        {summaryOf(article, 220) && (
          <p className="line-clamp-3 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">{summaryOf(article, 220)}</p>
        )}

        <AuthorStack authors={article.authors_details || article.authors} />

        <div className="pt-2 flex items-center text-xs font-black uppercase text-[#ed1c24] tracking-wider">
          <span>{cardHasMore(article) ? "ĐỌC LẠI BÀI" : "ĐỌC BÀI"}</span>
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </div>
      </div>
    </Link>
  )
}

// Thẻ vừa: ảnh bên trái, nội dung bên phải.
// Thẻ vừa: ảnh bên trái, nội dung bên phải.
// fill=true (dùng cho 3 ô cột phải) cho thẻ tự chia đều chiều cao cột, khít thẻ lớn.
function MediumCard({ article, delay = 0, compact = false, fill = false }: { article: any; delay?: number; compact?: boolean; fill?: boolean }) {
  const hasImage = Boolean(cardImage(article))
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={fill ? "flex min-h-0 w-full flex-1" : "w-full"}
    >
      <Link
        href={cardLink(article)}
        className={`group flex w-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-none overflow-hidden hover:border-[#ed1c24] transition-colors ${fill ? "h-full" : "min-h-[230px]"}`}
      >
        <div className="relative w-[36%] max-w-[180px] shrink-0 self-stretch overflow-hidden bg-slate-100 dark:bg-slate-800">
          {hasImage ? (
            <img
              src={cardImage(article)}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none"
              style={{
                objectPosition: `${article.image_position_x ?? 50}% ${article.image_position_y ?? 50}%`,
                transform: `scale(${(article.image_scale ?? 100) / 100})`,
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300 dark:from-slate-800 dark:to-slate-900 dark:text-slate-600">
              <BookOpen className="h-7 w-7" />
            </div>
          )}

          <div className="absolute top-2 left-2 z-10">
            <span className="inline-block px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-slate-900 text-white rounded-none">
              {article.category || "TIN TỨC"}
            </span>
          </div>
        </div>

        <div className={`flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5 ${fill || compact ? "justify-center" : "justify-between"}`}>
          <div className="space-y-1.5">
            <h4 className={`font-black uppercase leading-snug text-slate-950 transition-colors group-hover:text-[#ed1c24] dark:text-white line-clamp-3 ${compact ? "text-sm" : "text-sm sm:text-base"}`}>
              {article.title}
            </h4>
            {summaryOf(article, compact ? 90 : 120) && (
              <p className={`hidden font-medium leading-relaxed text-slate-500 dark:text-slate-400 sm:line-clamp-2 ${compact ? "text-[11px]" : "text-xs"}`}>
                {summaryOf(article, compact ? 90 : 120)}
              </p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <AuthorStack compact authors={article.authors_details || article.authors} />

            {cardDate(article) && (
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                <Clock className="h-3 w-3 shrink-0 text-[#ed1c24]" />
                <span>{formatDate(cardDate(article))}</span>
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
