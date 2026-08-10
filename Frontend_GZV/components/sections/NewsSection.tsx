"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import BlogCard from "../BlogCard"
import { api, BlogPost } from "@/lib/api-supabase"
import { getHomeSectionConfig, type HomeSectionConfig } from "@/lib/site-content"

const NewsSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [section, setSection] = useState<HomeSectionConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([api.getBlogPosts(), getHomeSectionConfig("news")])
      .then(([data, config]) => {
        if (!active) return
        setSection(config)
        setPosts((data || []).slice(0, config?.item_limit || 3))
      })
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [])

  if (!loading && (section?.is_visible === false || posts.length === 0)) return null

  return (
    <section className="overflow-hidden border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-gray-950">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="section-kicker">
            <Sparkles size={12} className="animate-pulse" /> Tri thức & Chia sẻ
          </div>
          <h2 className="section-title mb-6">{section?.title || "Tin Tức Mới Nhất"}</h2>
          {(section?.subtitle || section?.description) && (
            <p className="section-description text-slate-500 dark:text-slate-400">{section?.subtitle || section?.description}</p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 gap-4">
            <Loader2 className="h-12 w-12 text-[#ed1c24] animate-spin" />
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
                <BlogCard
                  id={post.id}
                  title={post.title}
                  excerpt={post.excerpt || ""}
                  image={post.image || "/placeholder.jpg"}
                  category={post.category || "General"}
                  slug={post.slug}
                  authors={post.authors || []}
                  publishDate={post.publish_date ? new Date(post.publish_date).toLocaleDateString("vi-VN") : ""}
                  readTime={post.read_time || "5 phút đọc"}
                />
              </motion.div>
            ))}
          </div>
        )}

        {section?.button_label && section?.button_url && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href={section.button_url}>
              <Button size="lg" className="btn-primary px-8 py-3 h-auto text-base font-semibold rounded-lg">
                {section.button_label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default NewsSection
