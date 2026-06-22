"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Play, 
  BookOpen, 
  Users, 
  Clock, 
  Star,
  FileText,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [gallery, setGallery] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState<any>(null)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          featured_image:media_files(file_url, alt_text),
          preview_video:media_files(file_url, duration_seconds)
        `)
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError

      setCourse(courseData)

      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from('course_videos')
        .select(`
          *,
          video_media:media_files(file_url, duration_seconds)
        `)
        .eq('course_id', courseId)
        .order('order_index')

      if (!videosError && videosData) {
        setVideos(videosData)
        if (videosData.length > 0) {
          setActiveVideo(videosData[0])
        }
      }

      // Fetch materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('course_materials')
        .select(`
          *,
          file:media_files(file_url, file_name, file_size_bytes)
        `)
        .eq('course_id', courseId)
        .order('order_index')

      if (!materialsError && materialsData) {
        setMaterials(materialsData)
      }

      // Fetch gallery
      const { data: galleryData, error: galleryError } = await supabase
        .from('course_gallery')
        .select(`
          *,
          image:media_files(file_url, alt_text)
        `)
        .eq('course_id', courseId)
        .order('order_index')

      if (!galleryError && galleryData) {
        setGallery(galleryData)
      }
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6">
        <p>Không tìm thấy khóa học</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
          </div>
          <Badge>{course.status}</Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Featured Image */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
              {course.featured_image?.file_url ? (
                <img
                  src={course.featured_image.file_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <BookOpen className="h-20 w-20 text-white/30" />
                </div>
              )}
            </div>
          </div>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลคอร์ส</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ระดับความยาก</p>
                <Badge variant="outline">{course.difficulty}</Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ราคา</p>
                <p className="text-2xl font-bold text-primary-600">${course.price}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration_weeks || course.duration_hours || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{course.students_count || 0} นักเรียน</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4" />
                  <span>{course.rating || 0} / 5</span>
                </div>
              </div>

              <Button className="w-full">Chỉnh sửa Khóa học</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="videos">
              <Play className="h-4 w-4 mr-2" />
              Video ({videos.length})
            </TabsTrigger>
            <TabsTrigger value="materials">
              <FileText className="h-4 w-4 mr-2" />
              Tài liệu ({materials.length})
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <ImageIcon className="h-4 w-4 mr-2" />
              Thư viện ({gallery.length})
            </TabsTrigger>
            <TabsTrigger value="details">Chi tiết</TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            {activeVideo && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-black rounded-t-lg flex items-center justify-center">
                    {activeVideo.video_media?.file_url ? (
                      <video
                        src={activeVideo.video_media.file_url}
                        controls
                        className="w-full h-full"
                      />
                    ) : (
                      <Play className="h-16 w-16 text-gray-600" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2">{activeVideo.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{activeVideo.description}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold">Danh sách video ({videos.length})</h3>
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveVideo(video)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    activeVideo?.id === video.id
                      ? 'bg-primary-100 dark:bg-primary-900/20 border-l-4 border-primary-600'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Play className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{index + 1}. {video.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {video.video_media?.duration_seconds
                          ? `${Math.floor(video.video_media.duration_seconds / 60)}m`
                          : 'Duration N/A'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-4">
            {materials.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-600">
                  Không có tài liệu nào
                </CardContent>
              </Card>
            ) : (
              materials.map(material => (
                <Card key={material.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{material.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {material.description}
                      </p>
                    </div>
                    {material.file && (
                      <Button variant="outline" size="sm">
                        Tải xuống
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            {gallery.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-600">
                  Không có hình ảnh nào
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map(item => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      {item.image?.file_url && (
                        <img
                          src={item.image.file_url}
                          alt={item.caption}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    {item.caption && (
                      <CardContent className="p-3">
                        <p className="text-sm">{item.caption}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mô tả</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {course.learning_outcomes && (
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả học tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(Array.isArray(course.learning_outcomes) ? course.learning_outcomes : []).map((outcome: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-primary-600 font-bold">✓</span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
