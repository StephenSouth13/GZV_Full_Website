'use client'

import { motion, Variants } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEffect, useMemo, useState } from "react"
import { api, Project, supabase } from "@/lib/api-supabase"
import PageBanner from "@/components/sections/common/PageBanner"
import BuilderPageGate from "@/components/BuilderPageGate"
import { summarize } from "@/lib/utils"

export default function ProjectsPageClient({ initialProjects, initialBlocks, initialPage, initialGlobalBanner, initialSyncAllBanners }: any) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    let active = true

    const fetchProjects = async () => {
      try {
        const data = await api.getProjects()
        if (active) setProjects(data || [])
      } catch (err) {
        setError('Đã có lỗi xảy ra khi tải dữ liệu dự án.')
        console.error('Error fetching projects:', err)
      } finally {
        setLoading(false)
      }
    }
    if (!initialProjects?.length) fetchProjects()

    const channel = supabase
      .channel('projects-page:sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'authors' }, fetchProjects)
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  const categories = useMemo(() => [
    { id: 'all', label: 'Tất cả' },
    ...Array.from(new Set(projects.map(project => project.category).filter(Boolean)))
      .map(label => ({ id: String(label).toLowerCase(), label: String(label) })),
  ], [projects])

  const filteredProjects = useMemo(() => {
    let result = projects

    if (selectedCategory !== "all") {
      result = result.filter((project: any) => {
        const targetText = [
          project.category,
          project.field,
          project.industry,
          project.tags,
          project.title,
          project.description,
          project.excerpt,
          project.company,
        ].flatMap((val) => (Array.isArray(val) ? val : [val])).filter(Boolean).join(" ").toLowerCase()

        const searchCat = selectedCategory.toLowerCase().replace("-", " ")
        const labelCat = categories.find((c) => c.id === selectedCategory)?.label.toLowerCase() || ""

        return targetText.includes(searchCat) || targetText.includes(labelCat)
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((project: any) => {
        const targetText = [
          project.title,
          project.description,
          project.category,
          project.field,
          project.company,
          project.excerpt,
        ].filter(Boolean).join(" ").toLowerCase()
        return targetText.includes(q)
      })
    }

    return result
  }, [projects, selectedCategory, searchQuery, categories])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ed1c24]"></div>
    </div>
  )

  return (
    <>
      <PageBanner
        initialPage={initialPage}
        initialGlobalBanner={initialGlobalBanner}
        initialSyncAllBanners={initialSyncAllBanners}
      />
      <BuilderPageGate slug="du-an" initialBlocks={initialBlocks}>
      <div className="bg-white dark:bg-gray-900">
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
            <div className="container px-4 mx-auto">

              {/* SEARCH BAR & CATEGORY FILTER BUTTONS */}
              <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`rounded-none px-5 py-2 text-xs font-black uppercase tracking-wider transition ${
                          isActive
                            ? "bg-[#ed1c24] text-white shadow-md"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    )
                  })}
                </div>

                {/* SMALL SEARCH INPUT */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm dự án..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full rounded-none border border-slate-200 bg-white pl-10 pr-9 text-xs font-bold text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-[#ed1c24] focus:outline-none focus:ring-1 focus:ring-[#ed1c24] dark:border-white/10 dark:bg-slate-900 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {filteredProjects.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  {filteredProjects.map((project) => {
                    const authors = project.project_authors || [];
                    const maxDisplay = 3;
                    const displayAuthors = authors.slice(0, maxDisplay);
                    const remaining = authors.length - maxDisplay;

                    return (
                      <motion.div key={project.id} variants={itemVariants}>
                        <Card className="h-full flex flex-col group overflow-hidden border border-slate-200 hover:border-[#ed1c24] hover:shadow-xl transition-all duration-300 rounded-none bg-white dark:border-white/10 dark:bg-gray-800 dark:hover:border-[#ed1c24]">
                          <CardHeader className="p-0">
                            <div className="relative aspect-[16/10] overflow-hidden">
                              <Image
                                src={project.image || '/placeholder-project.jpg'}
                                alt={project.title}
                                fill
                                unoptimized={true}
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                style={{
                                  objectPosition: `${project.image_position_x ?? 50}% ${project.image_position_y ?? 50}%`,
                                  transform: `scale(${(project.image_scale ?? 100) / 100})`,
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t to-transparent"></div>
                              <Badge className="absolute top-4 left-4 bg-white/95 text-black font-bold border-none">
                                {project.category}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="p-8 flex flex-col flex-grow">
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-[#ed1c24] transition-colors">
                              {project.title}
                            </CardTitle>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow line-clamp-3">
                              {summarize([project.description, project.excerpt, project.detailproject], 200)}
                            </p>

                            {/* --- PHẦN MENTORING & COACHING (AVATAR STACK) --- */}
                            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24] dark:text-[#ed1c24] mb-3">Mentoring & Coaching</p>
                              <div className="flex -space-x-3 items-center mb-8">
                                {displayAuthors.map((author: any, idx: number) => (
                                  <Avatar key={idx} className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-md">
                                    <AvatarImage src={author.avatar} className="object-cover" />
                                    <AvatarFallback className="bg-red-50 text-[#ed1c24] text-xs font-bold">{author.name[0]}</AvatarFallback>
                                  </Avatar>
                                ))}

                                {remaining > 0 && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button className="h-10 w-10 rounded-full bg-slate-900 text-white border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-black hover:bg-[#ed1c24] transition-all z-10">
                                        +{remaining}
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-4 rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border-none z-[100]">
                                      <p className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Đội ngũ chuyên gia</p>
                                      <div className="space-y-3">
                                        {authors.map((author: any, i: number) => (
                                          <div key={i} className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage src={author.avatar} className="object-cover" />
                                              <AvatarFallback>{author.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{author.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            </div>

                            {/* NÚT XEM CHI TIẾT */}
                            <Link href={`/du-an/${project.slug}`}>
                              <Button className="w-full h-12 bg-[#ed1c24] hover:bg-[#c91218] text-white rounded-none font-black uppercase text-xs shadow-sm group">
                                Xem chi tiết dự án
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem]">
                  <p className="text-xl text-gray-500 italic">Không tìm thấy dự án nào khớp với kết quả tìm kiếm.</p>
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-white dark:bg-gray-800">
            <div className="container px-4 mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white font-serif uppercase tracking-tight">
                  Bạn có dự án cần triển khai?
                </h2>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                  Hãy để GZV Center trở thành đối tác đồng hành, thiết kế chương trình đào tạo riêng biệt và hiệu quả cho tổ chức của bạn.
                </p>

                <Link href="/lien-he">
                  <Button size="lg" className="h-16 px-10 bg-[#ed1c24] hover:bg-[#ed1c24] text-white rounded-2xl text-lg font-bold shadow-2xl shadow-red-500/30">
                    Liên hệ ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>
          </div>
      </BuilderPageGate>
    </>
  )
}
