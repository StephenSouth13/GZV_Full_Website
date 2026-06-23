"use client"

import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Loader2, Sparkles } from "lucide-react"
import { useLanguage } from "../language-provider"
import { Button } from "@/components/ui/button"
import BlogCard from "../BlogCard"
import { api, BlogPost } from "@/lib/api-supabase"

const NewsSection = () => {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoading(true)
        // Lấy dữ liệu thật từ bảng articles qua View allblogposts
        const data = await api.getBlogPosts()
        // Chỉ hiển thị 3 bài viết mới nhất ở trang chủ để giữ layout đẹp
        setPosts(data.slice(0, 3))
      } catch (error) {
        console.error('❌ Error fetching news section:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestNews()
  }, [])

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <div className="container px-4">
        {/* Tiêu đề Section với Badge xịn */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm border border-blue-100 dark:border-blue-800">
            <Sparkles size={12} className="animate-pulse" /> Tri thức & Chia sẻ
          </div>
          <h2 className="section-title mb-6 text-5xl md:text-6xl">
            Tin Tức Mới Nhất
          </h2>
          <p className="section-description text-slate-500 dark:text-slate-400">
            Cập nhật những góc nhìn chuyên sâu và giải pháp đào tạo đột phá từ đội ngũ chuyên gia gzv.
          </p>
        </motion.div>

        {loading ? (
          /* Trạng thái Loading chuyên nghiệp */
          <div className="flex flex-col justify-center items-center h-80 gap-4">
            <div className="relative">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <div className="absolute inset-0 h-12 w-12 border-4 border-blue-100 rounded-full"></div>
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Đang tải tri thức...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* BlogCard nhận trực tiếp mảng authors từ Database */}
                <BlogCard 
                    id={post.id}
                    title={post.title}
                    excerpt={post.excerpt || ""}
                    image={post.image || "/placeholder.jpg"}
                    category={post.category || "General"}
                    slug={post.slug}
                    authors={post.authors || []} 
                    publishDate={post.publish_date ? new Date(post.publish_date).toLocaleDateString('vi-VN') : ""}
                    readTime={post.read_time || "5 phút đọc"}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Thông báo nếu trống dữ liệu */}
        {!loading && posts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">Hiện chưa có bài viết mới nào được xuất bản.</p>
            </div>
        )}

        {/* Nút Xem tất cả */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/tin-tuc">
            <Button size="lg" className="btn-primary px-8 py-3 h-auto text-base font-semibold rounded-lg">
              Khám phá tất cả tin tức
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default NewsSection
