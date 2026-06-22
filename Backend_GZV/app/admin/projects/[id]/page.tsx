//D:\MSC\Backend_MSC\app\admin\projects\[id]\page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Loader2, Edit3, Globe } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) loadProjectData()
  }, [projectId])

  const loadProjectData = async () => {
    try {
      setLoading(true)
      // 1. Lấy thông tin dự án từ bảng chính
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectError) throw projectError
      setProject(projectData)

      // 2. Lấy thông tin Mentor từ mảng mentor_ids
      if (projectData.mentor_ids && projectData.mentor_ids.length > 0) {
        const { data: mentorData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', projectData.mentor_ids)
        
        if (mentorData) setMentors(mentorData)
      }
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!project) return <div className="p-20 text-center text-gray-500">Không tìm thấy dự án</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/projects">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" /> Quay lại</Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 truncate max-w-[300px]">{project.title}</h1>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-blue-600 px-3 py-1">{project.status}</Badge>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => window.open(`/du-an/${project.slug}`, '_blank')}>
                <Globe size={14}/> Xem thực tế
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        {/* Banner Dự án */}
        <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-white">
          <div className="relative h-[450px] w-full bg-slate-200">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            <Badge className="absolute top-6 left-6 bg-blue-600 text-white border-none px-4 py-1 text-md uppercase font-bold">
              {project.category}
            </Badge>
          </div>

          <CardContent className="p-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{project.title}</h2>
            <p className="text-xl text-gray-600 leading-relaxed italic mb-8 border-l-4 border-blue-500 pl-4">
              {project.description}
            </p>

            {/* Hiển thị Mentors theo ảnh Avatar lồng nhau */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
              <div className="flex -space-x-3 overflow-hidden">
                {mentors.map((m) => (
                  <Avatar key={m.id} className="inline-block border-4 border-white h-12 w-12 ring-2 ring-slate-50">
                    <AvatarImage src={m.avatar_url} />
                    <AvatarFallback>{m.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-500">
                {mentors.length > 0 ? `Đội ngũ chuyên gia (${mentors.length})` : 'Chưa gán chuyên gia'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Nội dung bài viết chi tiết (Markdown) */}
        <Card className="border-none shadow-lg rounded-3xl p-10 bg-white">
           <h3 className="text-xl font-bold mb-6 text-slate-400 uppercase tracking-widest">Chi tiết dự án</h3>
           <article className="prose prose-slate lg:prose-xl max-w-none">
              <ReactMarkdown>{project.detailproject}</ReactMarkdown>
           </article>
        </Card>
      </div>
    </div>
  )
}