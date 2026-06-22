'use client'

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Users, Loader2, PlayCircle, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api, Project } from "@/lib/api-supabase"
import { useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github.css'

interface Props {
  params: { slug: string }
}

export default function ProjectDetailPage({ params }: Props) {
  const [project, setProject] = useState<Project | null>(null)
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const currentProject = await api.getProjectBySlug(params.slug)
        if (!currentProject) {
          notFound()
          return
        }
        setProject(currentProject)

        const allProjects = await api.getProjects()
        const related = allProjects
          .filter((p) => p.id !== currentProject.id && p.category === currentProject.category)
          .slice(0, 3)
        setRelatedProjects(related)
      } catch (error) {
        console.error('Error fetching project data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!project) notFound()

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'ongoing': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed': return 'Đã hoàn thành'
      case 'ongoing': return 'Đang thực hiện'
      case 'planning': return 'Đang lên kế hoạch'
      default: return 'Không xác định'
    }
  }

  // Hàm xử lý link Video Youtube
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-50 dark:bg-gray-900">
      <div className="container py-8 mx-auto px-4">
        <div className="mb-8">
          <Link href="/du-an">
            <Button variant="ghost" className="rounded-full shadow-sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              {/* Cover Image */}
              <div className="relative h-96">
                <Image 
                  src={project.image || "/placeholder.svg"} 
                  alt={project.title} 
                  fill 
                  className="object-cover" 
                  unoptimized={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <div className="flex gap-2 mb-4">
                    {project.category && <Badge className="bg-blue-600">{project.category}</Badge>}
                    <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-white uppercase">{project.title}</h1>
                </div>
              </div>

              <div className="p-8">
                {/* 1. HIỂN THỊ VIDEO NẾU CÓ */}
                {project.video_url && (
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <PlayCircle className="text-blue-600" /> Video giới thiệu dự án
                    </h2>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black">
                      <iframe 
                        className="w-full h-full"
                        src={getEmbedUrl(project.video_url)}
                        title="Project Video"
                        allowFullScreen
                      />
                    </div>
                  </section>
                )}

                {/* 2. MÔ TẢ NGẮN & HASHTAGS */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">Tổng quan dự án</h2>
                  <div className="prose dark:prose-invert max-w-none italic text-gray-600 dark:text-gray-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
                  </div>
                  
                  {project.hashtags && (
                    <div className="flex flex-wrap gap-2 mt-6">
                      {project.hashtags.split(',').map((tag, i) => (
                        <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 font-bold">
                          <Hash size={10} className="mr-1" /> {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </section>

                {/* 3. CHUYÊN GIA PHỤ TRÁCH (MỚI BỔ SUNG) */}
                {project.project_authors && project.project_authors.length > 0 && (
                  <section className="mb-12 pt-8 border-t border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Users className="text-blue-600" /> Mentoring & Coaching
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.project_authors.map((author, idx) => (
                        <Link key={idx} href={author.profile_link}>
                          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                            <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                              <Image 
                                src={author.avatar || '/placeholder-avatar.jpg'} 
                                alt={author.name} 
                                fill 
                                className="object-cover"
                                unoptimized={true}
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{author.name}</h4>
                              <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{author.title || 'Mentor'}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {project.technologies && project.technologies.length > 0 && (
                  <section className="mb-12">
                    <h3 className="text-xl font-bold mb-4">Công nghệ sử dụng</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. CHI TIẾT TRIỂN KHAI (MARKDOWN) */}
                {project.detailproject && (
                  <section className="pt-10 border-t border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-black mb-8 uppercase tracking-tight">Chi tiết triển khai</h2>
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeRaw]}>
                        {project.detailproject}
                      </ReactMarkdown>
                    </div>
                  </section>
                )}
              </div>
            </article>

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-8">Dự án liên quan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedProjects.map((rp) => (
                    <Card key={rp.id} className="overflow-hidden group rounded-2xl border-none shadow-md hover:shadow-xl transition-all">
                      <div className="relative aspect-video">
                        <Image src={rp.image || "/placeholder.svg"} alt={rp.title} fill className="object-cover transition group-hover:scale-105" unoptimized={true} />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase text-sm">{rp.title}</h3>
                        <Link href={`/du-an/${rp.slug}`}>
                          <Button variant="link" className="p-0 text-blue-600 h-auto font-bold text-xs">XEM CHI TIẾT</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-28 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-6 italic border-l-4 border-blue-600 pl-3">Thông tin dự án</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Trạng thái:</span>
                  <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Danh mục:</span>
                  <span className="font-bold">{project.category}</span>
                </div>
                {project.order_index && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Độ ưu tiên:</span>
                    <span className="font-bold text-blue-600">#{project.order_index}</span>
                  </div>
                )}
              </div>
              
              <Link href="/lien-he">
                <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-bold shadow-lg shadow-blue-100">
                  Liên hệ tư vấn
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}