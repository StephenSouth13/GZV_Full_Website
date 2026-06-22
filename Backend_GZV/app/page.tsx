//D:\MSC\Backend_MSC\app\page.tsx
"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FolderOpen,
  FileText,
  Star,
  Users,
  TrendingUp,
  Eye, // FIX: Đã thêm import Eye
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([])
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0)
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedContent()
  }, [])

  const loadFeaturedContent = async () => {
    try {
      setLoading(true)
      // Fetch data logic giữ nguyên...
      // (Nhớ kiểm tra tên bảng và RLS trên Supabase)
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const Carousel = ({ items, currentIndex, setCurrentIndex, type }: any) => {
    if (items.length === 0) return null

    const next = () => setCurrentIndex((currentIndex + 1) % items.length)
    const prev = () => setCurrentIndex((currentIndex - 1 + items.length) % items.length)

    const current = items[currentIndex]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={currentIndex}
            className="lg:col-span-2"
          >
            <Link href={`/admin/${type}/${current.id}`}>
              <div className="relative group overflow-hidden rounded-2xl cursor-pointer h-96 shadow-lg">
                <img
                  src={current.featured_image?.file_url || '/placeholder.jpg'}
                  alt={current.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <Badge className="w-fit mb-4 bg-blue-600">{current.category}</Badge>
                  <h2 className="text-3xl font-bold text-white mb-2">{current.title}</h2>
                  <p className="text-white/80 line-clamp-2">{current.description || current.excerpt}</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-6">
              {/* Nội dung Info Card giữ nguyên, Eye icon giờ đã hoạt động */}
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">{current.views || 0} lượt xem</span>
              </div>
              <Link href={`/admin/${type}/${current.id}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Quản lý chi tiết</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {/* FIX: Định nghĩa kiểu dữ liệu cho item và index */}
            {items.map((item: any, index: number) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex ? 'border-blue-600 scale-110' : 'border-transparent opacity-50'
                }`}
              >
                <img src={item.featured_image?.file_url || '/placeholder.jpg'} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-slate-500 font-medium">Đang khởi tạo Dashboard...</p>
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Hệ thống Quản trị MSC</h1>
        <p className="text-slate-500 mt-1">Tổng quan nội dung nổi bật trên toàn hệ thống.</p>
      </header>

      {/* Các section Carousel cho Courses, Projects, Articles... */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="text-blue-600"/> Khóa học tiêu biểu</h2>
        <Carousel items={featuredCourses} currentIndex={currentCourseIndex} setCurrentIndex={setCurrentCourseIndex} type="courses" />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><FolderOpen className="text-blue-600"/> Dự án mới</h2>
        <Carousel items={featuredProjects} currentIndex={currentProjectIndex} setCurrentIndex={setCurrentProjectIndex} type="projects" />
      </section>
    </div>
  )
}