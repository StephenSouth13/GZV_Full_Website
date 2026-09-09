"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Search,
  Calendar,
  Tag,
  BookOpen,
  TrendingUp,
  Mail,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api, BlogPost, supabase } from "@/lib/api-supabase"
import PageBanner from "@/components/sections/common/PageBanner"
import StatsBar from "@/components/sections/common/StatsBar"
import BuilderPageGate from "@/components/BuilderPageGate"
import { toast } from "@/hooks/use-toast"

export default function NewsPage() {
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 6

  useEffect(() => {
    let active = true

    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const data = await api.getBlogPosts()
        if (active) {
          setArticles(data || [])
        }
      } catch (err) {
        console.error("Error fetching blog posts:", err)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    fetchPosts()

    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => {
      if (a.category) set.add(a.category)
    })
    return Array.from(set)
  }, [articles])

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch =
        !search ||
        (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.excerpt || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.content || "").toLowerCase().includes(search.toLowerCase())

      const matchCategory = !category || a.category === category

      return matchSearch && matchCategory
    })
  }, [articles, search, category])

  const handleCategoryChange = (cat: string | null) => {
    setCategory(cat)
    setCurrentPage(1)
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  // Determine featured article
  const featured = useMemo(() => {
    return (
      filtered.find((a: any) => a.is_featured) ||
      filtered[0] ||
      articles.find((a: any) => a.is_featured) ||
      articles[0]
    )
  }, [articles, filtered])

  // Non-featured are all other items in the filtered list
  const nonFeatured = filtered.filter((a) => a.id !== featured?.id)

  // Paginate non-featured
  const totalPages = Math.max(1, Math.ceil(nonFeatured.length / pageSize))
  const paginatedArticles = nonFeatured.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getPaginationItems = () => {
    const items = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i)
      }
    } else {
      items.push(1)
      if (currentPage > 3) {
        items.push("...")
      }
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        if (!items.includes(i)) {
          items.push(i)
        }
      }
      if (currentPage < totalPages - 2) {
        items.push("...")
      }
      if (!items.includes(totalPages)) {
        items.push(totalPages)
      }
    }
    return items
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setIsSubscribing(true)
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: newsletterEmail.trim().toLowerCase() })
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Thông báo", description: "Email này đã đăng ký nhận tin rồi!" })
        } else {
          throw error
        }
      } else {
        setSubscribed(true)
        toast({ title: "Thành công!", description: "Cảm ơn bạn đã đăng ký nhận bản tin thành công!" })
      }
      setNewsletterEmail("")
    } catch {
      toast({ title: "Lỗi", description: "Có lỗi xảy ra, vui lòng thử lại!", variant: "destructive" })
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <>
      <PageBanner
        badge="Knowledge Hub"
        title="Chia sẻ & Tri thức"
        subtitle="Nơi hội tụ kiến thức thực tiễn từ chuyên gia GZV Center, chia sẻ kinh nghiệm và phát triển chuyên môn."
      />

      <StatsBar
        stats={[
          { value: "100+", label: "Bài viết chuyên sâu", description: "Cập nhật liên tục" },
          { value: "10+", label: "Chuyên mục", description: "Marketing, Sales, Tech, v.v." },
          { value: "50K+", label: "Lượt đọc", description: "Độc giả theo dõi hàng tháng" },
          { value: "24/7", label: "Cập nhật", description: "Xu hướng thị trường mới nhất" },
        ]}
      />

        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-10 md:py-14 border-t border-slate-200 dark:border-white/10">
          <div className="container mx-auto px-4 max-w-7xl space-y-10">
            {/* ── SECTION 1: SEARCH & CATEGORY FILTERS ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 border-l-4 border-l-[#ed1c24] rounded-none p-5 space-y-4 shadow-xs">
              <div className="max-w-md">
                <span className="text-[10px] tracking-widest text-[#ed1c24] font-black uppercase block mb-1.5">
                  TÌM KIẾM TIN TỨC
                </span>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Nhập từ khóa tìm kiếm bài viết..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 h-9 rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 text-xs font-semibold placeholder:text-slate-400 focus-visible:border-[#ed1c24] focus-visible:ring-1 focus-visible:ring-[#ed1c24]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-white/10 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] tracking-widest text-slate-500 font-black uppercase mr-1 flex items-center gap-1">
                    Chuyên mục:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange(null)}
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all duration-200 rounded-none border ${
                      !category
                        ? "bg-[#ed1c24] text-white border-[#ed1c24]"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    TẤT CẢ
                  </button>
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => handleCategoryChange(c)}
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all duration-200 rounded-none border ${
                        category === c
                          ? "bg-[#ed1c24] text-white border-[#ed1c24]"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {c.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 md:text-right select-none">
                  Hiển thị <span className="text-slate-900 dark:text-white font-bold">{filtered.length}</span> / {articles.length} bài viết
                </div>
              </div>
            </div>

            {/* ── SECTION 2: FEATURED ARTICLE ── */}
            {featured && !search && !category && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 border-t-4 border-t-[#ed1c24] rounded-none p-5 md:p-6 group relative overflow-hidden transition-all space-y-4 shadow-xs">
                <div className="pb-1">
                  <h3 className="text-base md:text-xl font-black uppercase tracking-wider text-[#ed1c24]">
                    BÀI VIẾT NỔI BẬT
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
                  {/* Left Column: Thumbnail */}
                  <div className="relative overflow-hidden aspect-[16/10] w-full rounded-none border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 select-none">
                    {featured.image ? (
                      <img
                        src={featured.image}
                        alt={featured.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <BookOpen className="h-14 w-14 text-slate-300 dark:text-slate-700" />
                      </div>
                    )}
                    {featured.category && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-[#ed1c24] text-white border border-[#ed1c24] uppercase font-black tracking-wider text-[8.5px] px-2.5 py-0.5 rounded-none">
                          {featured.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Content */}
                  <div className="flex h-full flex-col">
                    <div className="flex flex-1 flex-col justify-center space-y-3 py-6">
                      <Link href={`/tin-tuc/${featured.slug}`}>
                        <h2 className="text-left font-black uppercase tracking-tight text-lg md:text-2xl text-slate-900 dark:text-white hover:text-[#ed1c24] transition-colors leading-snug line-clamp-3">
                          {featured.title}
                        </h2>
                      </Link>

                      <p className="text-left leading-relaxed text-slate-600 dark:text-slate-400 text-xs line-clamp-3 font-semibold">
                        {featured.excerpt ||
                          (featured.content
                            ? featured.content.replace(/<[^>]*>/g, "").slice(0, 220)
                            : "")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        {featured.publish_date && (
                          <span className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-[#ed1c24]" />
                            {new Date(featured.publish_date).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>

                      <Link href={`/tin-tuc/${featured.slug}`}>
                        <Button className="h-9 rounded-none bg-[#ed1c24] px-5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#c91218]">
                          ĐỌC BÀI ĐẦY ĐỦ
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 3: LATEST ARTICLES GRID ── */}
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-white/10 pb-2.5 text-center">
                <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white inline-flex items-center justify-center gap-2">
                  Bài viết mới nhất
                </h3>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(pageSize)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border border-slate-200 dark:border-white/10 rounded-none bg-white dark:bg-slate-900">
                      <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 animate-pulse border-b border-slate-200 dark:border-white/10 rounded-none" />
                      <CardContent className="p-4 space-y-3">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-none w-20 animate-pulse" />
                        <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-none w-4/5 animate-pulse" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : paginatedArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden flex flex-col h-full group cursor-pointer hover:border-[#ed1c24] hover:shadow-md transition-all duration-200"
                    >
                      <Link
                        href={`/tin-tuc/${article.slug}`}
                        className="flex flex-col h-full w-full"
                      >
                        {/* Image */}
                        <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-white/10 select-none aspect-[16/10]">
                          {article.image ? (
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                            </div>
                          )}
                          {article.category && (
                            <Badge className="absolute top-3 left-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 uppercase font-black tracking-wider text-[8px] px-2.5 py-0.5 rounded-none">
                              {article.category}
                            </Badge>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight leading-snug group-hover:text-[#ed1c24] transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            {article.excerpt && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-semibold">
                                {article.excerpt}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-black tracking-widest text-slate-500 pt-3 border-t border-slate-200 dark:border-white/10 mt-3">
                            {article.publish_date ? (
                              <span className="uppercase font-mono flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-[#ed1c24] shrink-0" />
                                {new Date(article.publish_date).toLocaleDateString("vi-VN")}
                              </span>
                            ) : (
                              <span />
                            )}

                            <span className="text-[#ed1c24] uppercase group-hover:underline flex items-center gap-0.5">
                              ĐỌC TIẾP →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-white/10 border-l-4 border-l-[#ed1c24] bg-white dark:bg-slate-900 rounded-none p-8 max-w-xl mx-auto text-center">
                  <div className="w-12 h-12 rounded-none bg-slate-100 dark:bg-slate-800 mx-auto mb-3 flex items-center justify-center">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    Không tìm thấy bài viết phù hợp
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5 px-6 leading-relaxed font-semibold">
                    Thử tìm kiếm với từ khóa khác hoặc chọn chuyên mục khác.
                  </p>
                </div>
              )}
            </div>

            {/* ── PAGINATION CONTROLS ── */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8 select-none">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold rounded-none border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-900 dark:text-white"
                >
                  Trước
                </Button>
                {getPaginationItems().map((item, idx) => {
                  if (item === "...") {
                    return (
                      <span key={`dots-${idx}`} className="px-2 py-1 text-xs font-semibold text-slate-400">
                        ...
                      </span>
                    )
                  }
                  return (
                    <Button
                      key={`page-${item}`}
                      onClick={() => setCurrentPage(item as number)}
                      variant={currentPage === item ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 text-xs font-black rounded-none ${
                        currentPage === item
                          ? "bg-[#ed1c24] text-white border-[#ed1c24]"
                          : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-white/10 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </Button>
                  )
                })}
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold rounded-none border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-900 dark:text-white"
                >
                  Sau
                </Button>
              </div>
            )}

            {/* ── SECTION 4: NEWSLETTER SUBSCRIPTION ── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-4"
            >
              <Card className="rounded-none border border-slate-200 dark:border-white/10 border-t-4 border-t-[#ed1c24] bg-white dark:bg-slate-900 overflow-hidden relative shadow-xs">
                <CardContent className="p-6 md:p-10 relative z-10">
                  <div className="max-w-xl mx-auto text-center">
                    <div className="w-12 h-12 rounded-none bg-[#ed1c24] text-white mx-auto mb-4 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-2">
                      Đăng ký nhận bản tin mới nhất
                    </h2>
                    <p className="text-slate-500 mb-6 text-xs leading-relaxed font-semibold">
                      Nhận các thông báo mới nhất về tri thức, bài viết chuyên môn và các sự kiện từ GZV.
                    </p>

                    {subscribed ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 py-3 px-5 rounded-none w-fit mx-auto"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Cảm ơn bạn đã đăng ký nhận bản tin thành công!
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <Input
                          type="email"
                          required
                          placeholder="Nhập email của bạn..."
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className="h-10 rounded-none bg-white dark:bg-slate-950 border-slate-200 dark:border-white/10 flex-1 text-xs font-semibold placeholder:text-slate-400 focus-visible:border-[#ed1c24] focus-visible:ring-1 focus-visible:ring-[#ed1c24]"
                        />
                        <Button
                          type="submit"
                          disabled={isSubscribing}
                          className="h-10 px-5 rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218] font-black text-xs uppercase tracking-widest gap-2 shrink-0 transition-colors"
                        >
                          {isSubscribing ? (
                            <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          <span>Đăng ký</span>
                        </Button>
                      </form>
                    )}

                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-3 font-bold select-none">
                      Chúng tôi cam kết bảo mật tuyệt đối email của bạn.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Stats bar */}
            {!isLoading && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="pt-6 border-t border-slate-200 dark:border-white/10"
              >
                <div className="flex items-center justify-center gap-8 text-[9px] font-black uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-[#ed1c24] shrink-0" /> {articles.length} bài viết
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-[#ed1c24] shrink-0" /> {categories.length} chuyên mục
                  </span>
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-[#ed1c24] shrink-0" /> Cập nhật thường xuyên
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
    </>
  )
}
