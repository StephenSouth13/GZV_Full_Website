'use client'

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Users, Loader2, PlayCircle, Hash, CheckCircle2, Clock, Calendar, ExternalLink, Sparkles, FolderGit2, Cpu, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api, Project } from "@/lib/api-supabase"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

interface Props {
  params: { slug: string }
}

export default function ProjectDetailPage({ params }: Props) {
  const [project, setProject] = useState<Project | null>(null)
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        setLoading(true)
        const currentProject = await api.getProjectBySlug(params.slug)
        if (!active) return
        setProject(currentProject)

        if (currentProject) {
          const allProjects = await api.getProjects()
          if (!active) return
          const related = allProjects
            .filter((p) => p.id !== currentProject.id && (p.category === currentProject.category || !currentProject.category))
            .slice(0, 3)
          setRelatedProjects(related)
        }
      } catch (error) {
        console.error('Error fetching project data:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchData()
    return () => {
      active = false
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-[#ed1c24] animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang tải dự án...</p>
        </div>
      </div>
    )
  }

  if (!project) notFound()

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return { text: 'Đã hoàn thành', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' }
      case 'ongoing':
        return { text: 'Đang thực hiện', bg: 'bg-red-500/10 text-[#ed1c24] border-red-500/20' }
      case 'planning':
        return { text: 'Đang lên kế hoạch', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
      default:
        return { text: 'Đang triển khai', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20' }
    }
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/')
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/')
    }
    return url
  }

  const statusInfo = getStatusBadge(project.status)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4 pt-4 pb-2">
        <Link
          href="/du-an"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-[#ed1c24] transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Tất cả dự án</span>
        </Link>
      </div>

      <div className="container max-w-7xl mx-auto px-4 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Content (8 cols) */}
          <main className="lg:col-span-8 space-y-8">
            {/* Hero Cover Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
            >
              <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  unoptimized={true}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Title overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-white">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                    {project.title}
                  </h1>
                </div>
              </div>

              {/* Quick Overview Text & Hashtags */}
              <div className="p-6 sm:p-8 space-y-6">
                {project.description && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#ed1c24] mb-3 flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5" /> Tổng quan dự án
                    </h3>
                    <div className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {project.hashtags && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    {project.hashtags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10"
                      >
                        <Hash className="h-3 w-3 mr-0.5 text-[#ed1c24]" />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Video Section (if available) */}
            {project.video_url && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 dark:border-white/10">
                  <div className="h-8 w-8 bg-[#ed1c24]/10 text-[#ed1c24] flex items-center justify-center font-bold">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      Video Giới Thiệu Dự Án
                    </h2>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trải nghiệm hình ảnh thực tế</p>
                  </div>
                </div>

                <div className="aspect-video w-full overflow-hidden bg-slate-950 border border-slate-200 dark:border-white/10 shadow-inner">
                  <iframe
                    className="w-full h-full"
                    src={getEmbedUrl(project.video_url)}
                    title="Project Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.section>
            )}

            {/* Mentoring & Coaching Authors Section */}
            {project.project_authors && project.project_authors.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 bg-[#ed1c24]/10 text-[#ed1c24] flex items-center justify-center font-bold">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        Đội Ngũ Mentoring & Coaching
                      </h2>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chuyên gia & Cố vấn đồng hành</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.project_authors.map((author, idx) => (
                    <Link key={idx} href={author.profile_link || "#"}>
                      <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] hover:border-[#ed1c24] hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-all duration-200 group">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-200 shadow-sm">
                          <Image
                            src={author.avatar || '/placeholder-avatar.jpg'}
                            alt={author.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            unoptimized={true}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white group-hover:text-[#ed1c24] transition-colors truncate">
                            {author.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate mt-0.5">
                            {author.title || 'Mentor'}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#ed1c24] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            Xem hồ sơ <ArrowUpRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Markdown Detailed Implementation Section */}
            {project.detailproject && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-slate-100 dark:border-white/10">
                  <div className="h-8 w-8 bg-[#ed1c24]/10 text-[#ed1c24] flex items-center justify-center font-bold">
                    <FolderGit2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      Chi Tiết Triển Khai
                    </h2>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thông tin và giải pháp kỹ thuật</p>
                  </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-[#ed1c24] prose-a:font-bold prose-img:border prose-img:border-slate-200 dark:prose-img:border-white/10 prose-img:rounded-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeRaw]}>
                    {project.detailproject}
                  </ReactMarkdown>
                </div>
              </motion.section>
            )}
          </main>

          {/* Sidebar Right (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Info Card */}
            <div className="border border-slate-200 border-l-[5px] border-l-[#ed1c24] dark:border-white/10 dark:border-l-[#ed1c24] bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-white/10 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24] block">
                  PROJECT SPECIFICATIONS
                </span>
                <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                  Thông Tin Dự Án
                </h3>
              </div>

              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Trạng thái:</span>
                  <span className={`px-2.5 py-0.5 text-[11px] font-bold border ${statusInfo.bg}`}>
                    {statusInfo.text}
                  </span>
                </div>

                {project.category && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400">Lĩnh vực / Danh mục:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{project.category}</span>
                  </div>
                )}

                {project.order_index !== undefined && project.order_index !== null && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400">Số thứ tự:</span>
                    <span className="font-black text-[#ed1c24]">#{project.order_index}</span>
                  </div>
                )}
              </div>

              {/* Technologies List (if any) */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                    Công nghệ & Nền tảng
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div className="pt-2">
                <Link href="/lien-he" className="block w-full">
                  <Button className="w-full h-11 rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-2">
                    <span>Liên hệ tư vấn dự án</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Projects Section */}
        {relatedProjects.length >= 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24] block">
                  EXPLORE MORE
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                  Dự Án Liên Quan
                </h2>
              </div>
              <Link
                href="/du-an"
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-[#ed1c24] dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((rp) => (
                <Link key={rp.id} href={`/du-an/${rp.slug}`} className="group block">
                  <div className="border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:border-[#ed1c24] transition-all duration-300 flex flex-col h-full">
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <Image
                        src={rp.image || "/placeholder.svg"}
                        alt={rp.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                      {rp.category && (
                        <span className="absolute top-3 left-3 bg-[#ed1c24] text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {rp.category}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white group-hover:text-[#ed1c24] transition-colors line-clamp-2 leading-snug">
                          {rp.title}
                        </h3>
                        {rp.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 font-medium">
                            {rp.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#ed1c24]">
                        <span>Xem chi tiết</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}