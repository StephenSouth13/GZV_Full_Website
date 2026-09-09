'use client'

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, User, Clock, Tag, Share2, ChevronRight, BookOpen, ArrowRight, Facebook, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { api, BlogPost } from "@/lib/api-supabase"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

// Custom styling for markdown content
const customMarkdownComponents = {
  h1: (props: any) => <h1 className="text-3xl font-black uppercase tracking-tight mt-10 mb-5 text-slate-950 dark:text-white sm:text-4xl" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-black uppercase tracking-tight mt-10 mb-4 text-slate-950 dark:text-white sm:text-3xl border-b border-slate-200 dark:border-white/10 pb-2" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-bold uppercase tracking-tight mt-8 mb-3 text-slate-900 dark:text-slate-100" {...props} />,
  p: (props: any) => <p className="mb-6 leading-[1.9] text-slate-700 dark:text-slate-300 text-[16.5px] font-medium" {...props} />,
  strong: (props: any) => <strong className="font-semibold text-slate-950 dark:text-white" {...props} />,
  ul: (props: any) => <ul className="mb-6 pl-4 space-y-2 text-[16.5px] text-slate-700 dark:text-slate-300" {...props} />,
  ol: (props: any) => <ol className="mb-6 pl-4 space-y-2 text-[16.5px] text-slate-700 dark:text-slate-300" {...props} />,
  li: (props: any) => <li className="ml-6 list-disc leading-relaxed font-medium" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="relative my-8 overflow-hidden border-l-4 border-[#ed1c24] bg-slate-50 p-6 text-lg font-semibold italic leading-8 text-slate-800 dark:bg-white/[0.04] dark:text-slate-200">
      <div className="relative z-10">{props.children}</div>
    </blockquote>
  ),
  img: (props: any) => (
    <figure className="my-10 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121212]">
      <Image
        src={props.src || '/placeholder.svg'}
        alt={props.alt || 'GZV News Image'}
        width={1100}
        height={650}
        unoptimized
        className="w-full h-auto object-cover rounded-none"
      />
      {props.alt && (
        <figcaption className="p-3 text-center text-sm text-slate-500 border-t border-slate-200 dark:border-white/10 dark:text-slate-400">
          {props.alt}
        </figcaption>
      )}
    </figure>
  ),
  a: (props: any) => <a className="text-[#ed1c24] hover:underline font-bold" target="_blank" rel="noopener noreferrer" {...props} />,
};

export default function NewsPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const currentPost = await api.getBlogPostBySlug(params.slug)

        if (!currentPost) {
          notFound()
          return
        }
        setPost(currentPost)

        const allPosts = await api.getBlogPosts()

        if (currentPost.category) {
          const related = allPosts
            .filter((p) => p.id !== currentPost.id && p.category === currentPost.category)
            .slice(0, 3)
          setRelatedPosts(related)
        }

        const latest = allPosts
          .filter((p) => p.id !== currentPost.id)
          .slice(0, 4)
        setLatestPosts(latest)

      } catch (error) {
        console.error('Error fetching post data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.slug])

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })
  };

  const readingTime = (content: string) => {
    if (!content) return 1
    return Math.max(1, Math.ceil(content.split(/\s+/).length / 200))
  }

  const shareArticle = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href }).catch(() => { })
    } else if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép link bài viết!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 dark:bg-[#070707]">
        <div className="w-full h-[50vh] bg-slate-200 dark:bg-slate-800 animate-pulse rounded-none" />
        <div className="container max-w-4xl mx-auto px-4 py-10">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-none w-24" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-none w-3/4" />
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-none w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    notFound();
  }

  const publishDate = formatDate(post.publish_date)
  const authorsText = post.authors && post.authors.length > 0
    ? post.authors.map(auth => auth.full_name).join(', ')
    : 'GZV Editorial'

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 dark:bg-[#070707] dark:text-slate-100 selection:bg-[#ed1c24] selection:text-white">
      {/* ══════════ HERO ══════════ */}
      <section className="relative w-full overflow-hidden">
        {/* Full-width cover image */}
        <div className="relative w-full h-[55vh] md:h-[65vh] lg:h-[70vh]">
          {post.image ? (
            <>
              <Image
                src={post.image}
                alt={post.title}
                fill
                unoptimized
                priority
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/60 to-[#070707]/20 dark:from-[#070707] dark:via-[#070707]/60 dark:to-[#070707]/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              <BookOpen className="h-20 w-20 text-white/30" />
            </div>
          )}

          {/* Floating back button */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-6 left-6 z-20">
            <Button asChild variant="secondary" size="sm" className="rounded-none border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/90 hover:bg-slate-100 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider shadow-md">
              <Link href="/tin-tuc"><ArrowLeft className="h-4 w-4 mr-1.5" />Tin tức</Link>
            </Button>
          </motion.div>

          {/* Share button */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-6 right-6 z-20">
            <Button variant="secondary" size="icon" onClick={shareArticle} className="rounded-none border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/90 hover:bg-slate-100 text-slate-900 dark:text-white h-9 w-9 shadow-md">
              <Share2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Article header - overlapping the image */}
        <div className="container max-w-4xl mx-auto px-4 -mt-32 md:-mt-40 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="border border-slate-200 border-t-4 border-t-[#ed1c24] bg-white dark:border-white/10 dark:bg-[#0d0d0d] rounded-none shadow-xl">
              <CardContent className="p-6 md:p-10">
                {/* Meta */}
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  {post.category && (
                    <Badge className="bg-[#ed1c24] text-white border border-[#ed1c24] rounded-none px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                      <Tag className="h-3 w-3 mr-1" />{post.category}
                    </Badge>
                  )}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#ed1c24]" />{post.read_time || `${readingTime(post.content || post.excerpt || '')} phút đọc`}
                  </span>
                  {publishDate && (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#ed1c24]" />{publishDate}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-4xl lg:text-[2.5rem] font-black uppercase tracking-tight leading-[1.2] text-slate-950 dark:text-white mb-4">
                  {post.title}
                </h1>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>
                )}

                {/* Author bar */}
                <div className="flex items-center gap-3.5 mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                  {post.authors && post.authors.length > 0 && post.authors[0].avatar_url ? (
                    <div className="relative w-11 h-11 rounded-none overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 shrink-0">
                      <Image
                        src={post.authors[0].avatar_url}
                        alt={post.authors[0].full_name || 'Author'}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-none bg-[#ed1c24] text-white flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">{authorsText}</p>
                    {post.authors && post.authors[0]?.title && (
                      <p className="text-[11px] font-bold text-[#ed1c24] uppercase tracking-wide">{post.authors[0].title}</p>
                    )}
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{publishDate || 'GZV News'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ══════════ ARTICLE BODY ══════════ */}
      <div className="container max-w-4xl mx-auto px-4 py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-lg max-w-none dark:prose-invert"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={customMarkdownComponents}
            >
              {post.content || post.excerpt || ''}
            </ReactMarkdown>
          </motion.article>

          {/* Bottom tags & share */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-14 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              {post.tags && post.tags.length > 0 ? (
                post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-none border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs uppercase">{tag}</Badge>
                ))
              ) : (
                <Badge variant="outline" className="rounded-none border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs uppercase">{post.category || 'GZV News'}</Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={shareArticle} className="gap-2 rounded-none border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-900 dark:text-white font-bold text-xs">
              <Share2 className="h-4 w-4" />Chia sẻ bài viết
            </Button>
          </motion.div>
        </div>

        {/* ══════════ RELATED ══════════ */}
        {relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-[#ed1c24] rounded-none" />
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white">Cùng chuyên mục</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedPosts.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <Link href={`/tin-tuc/${a.slug}`} className="group block h-full">
                    <Card className="overflow-hidden h-full border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0d0d0d] rounded-none hover:border-[#ed1c24] hover:shadow-md transition-all duration-200">
                      <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
                        {a.image ? (
                          <Image src={a.image} alt={a.title} fill unoptimized className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-slate-400 dark:text-white/20" />
                          </div>
                        )}
                        {a.category && (
                          <Badge className="absolute top-3 left-3 text-[9px] font-black uppercase rounded-none bg-white text-slate-900 dark:bg-black dark:text-white border border-slate-200 dark:border-white/10">{a.category}</Badge>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-black uppercase text-slate-950 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-[#ed1c24] transition-colors text-sm">{a.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-semibold">{a.excerpt || a.content?.replace(/<[^>]*>/g, "").slice(0, 120)}</p>
                        <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-slate-400 uppercase">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#ed1c24]" />{a.read_time || `${readingTime(a.content || '')} phút`}</span>
                          {a.publish_date && <span>{formatDate(a.publish_date)}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ══════════ LATEST ══════════ */}
        {latestPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 mb-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-[#ed1c24] rounded-none" />
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white">Bài viết mới nhất</h2>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-[#ed1c24] dark:text-slate-400 rounded-none font-bold text-xs uppercase">
                <Link href="/tin-tuc">Xem tất cả <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="space-y-2">
              {latestPosts.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/tin-tuc/${a.slug}`} className="flex items-center gap-4 p-4 rounded-none border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0d0d0d] hover:border-[#ed1c24] transition-all duration-200 group">
                    {a.image ? (
                      <Image src={a.image} alt={a.title} width={80} height={80} unoptimized className="w-20 h-20 rounded-none object-cover shrink-0 border border-slate-200 dark:border-white/10" />
                    ) : (
                      <div className="w-20 h-20 rounded-none bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10">
                        <BookOpen className="h-6 w-6 text-slate-400 dark:text-white/20" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black uppercase text-slate-950 dark:text-white text-sm line-clamp-2 group-hover:text-[#ed1c24] transition-colors leading-snug">{a.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-semibold">{a.excerpt || a.content?.replace(/<[^>]*>/g, "").slice(0, 80)}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase">
                        {a.publish_date && <span>{formatDate(a.publish_date)}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#ed1c24]" />{a.read_time || `${readingTime(a.content || '')} phút`}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#ed1c24] group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
