'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, Eye, BookOpen, TrendingUp, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { api, BlogPost } from "@/lib/api-supabase"
import PageBanner from "@/components/sections/PageBanner"

export default function BlogPage() {
  const [allBlogPosts, setAllBlogPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        const blogPosts = await api.getBlogPosts()
        setAllBlogPosts(blogPosts || [])

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(blogPosts?.map(p => p.category).filter(Boolean))) as string[]
        setCategories(uniqueCategories)
      } catch (err) {
        setError('Lỗi tải dữ liệu bài viết')
        console.error('Error:', err)
      } finally { setLoading(false) }
    }
    fetchBlogPosts()
  }, [])

  // Filter and sort posts
  useEffect(() => {
    let filtered = [...allBlogPosts]

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.publish_date || 0).getTime()
      const dateB = new Date(b.publish_date || 0).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

    setFilteredPosts(filtered)
  }, [allBlogPosts, selectedCategory, sortBy])

  const featuredPost = filteredPosts[0] || allBlogPosts[0]
  const displayPosts = selectedCategory ? filteredPosts : filteredPosts.slice(0)

  if (loading) return (
    <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
      <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600"></div>
    </div>
  )

  if (error || !featuredPost) return <div className="p-40 text-center font-bold text-slate-300 italic">Hiện tại chưa có bài viết nào được xuất bản.</div>

  return (
    <div className="bg-white dark:bg-gray-900">
      <PageBanner
        badge="Knowledge Hub"
        title="Chia sẻ & Tri thức"
        subtitle="Nơi hội tụ kiến thức thực tiễn từ chuyên gia gzv Center, chia sẻ kinh nghiệm và phát triển chuyên môn."
        stats={[
          { value: `${allBlogPosts.length}+`, label: 'Bài viết chuyên môn' },
          { value: '10K+', label: 'Lượt đọc/tháng' },
          { value: '10+', label: 'Chuyên gia' },
          { value: `${categories.length}+`, label: 'Lĩnh vực' },
        ]}
      />

      {/* FEATURED - Cinematic Article (Show only when no filter applied) */}
      {!selectedCategory && featuredPost && (
        <section className="py-20 container px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Link href={`/tin-tuc/${featuredPost.slug}`}>
              <div className="relative group overflow-hidden rounded-[3.5rem] bg-slate-900 aspect-[21/9] shadow-2xl shadow-blue-900/20">
                <Image src={featuredPost.image || '/placeholder.jpg'} fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="Cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent p-10 md:p-20 flex flex-col justify-end">
                  <Badge className="w-fit mb-4 bg-red-600 text-white font-black px-4 py-1 uppercase text-[10px]">Tiêu biểu</Badge>
                  <h2 className="text-3xl md:text-6xl font-black text-white mb-6 max-w-4xl leading-tight tracking-tight">{featuredPost.title}</h2>
                  <p className="text-lg text-slate-300 mb-10 max-w-2xl line-clamp-2 italic font-medium">"{featuredPost.excerpt}"</p>
                  <div className="flex flex-wrap items-center gap-8">
                     <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 pr-6 rounded-full border border-white/10 shadow-xl">
                        <div className="flex -space-x-3">
                          {featuredPost.authors?.map((auth, i) => (
                            <Avatar key={i} className="border-2 border-slate-900 w-12 h-12"><AvatarImage src={auth.avatar_url}/></Avatar>
                          ))}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-blue-400 leading-none mb-1">Expert Authors</span>
                          <span className="text-sm font-bold text-white">{featuredPost.authors?.map(a => a.full_name).join(', ')}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-6 text-slate-400 text-xs font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2"><Calendar size={16}/> {new Date(featuredPost.publish_date || '').toLocaleDateString('vi-VN')}</div>
                        <div className="flex items-center gap-2"><Clock size={16}/> {featuredPost.read_time}</div>
                     </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </section>
      )}

      {/* FILTERS & ALL POSTS */}
      <section className="py-20 container px-4">
        {/* Header with Title and Filters */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 pb-8 border-b border-slate-100">
            <div>
              <h2 className="section-title mb-2">
                {selectedCategory ? `Bài Viết Về ${selectedCategory}` : 'Tất Cả Bài Viết'}
              </h2>
              <p className="section-subtitle text-slate-500">
                {selectedCategory
                  ? `${filteredPosts.length} bài viết về lĩnh vực ${selectedCategory.toLowerCase()}`
                  : `${filteredPosts.length} bài viết chuyên môn`
                }
              </p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-colors"
              >
                <X size={18} /> Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <Filter size={18} /> Chủ đề:
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                !selectedCategory
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất cả ({allBlogPosts.length})
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category} ({allBlogPosts.filter(p => p.category === category).length})
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap gap-3 items-center mt-6">
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <Clock size={18} /> Sắp xếp:
            </div>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                sortBy === 'newest'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                sortBy === 'oldest'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cũ nhất
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {displayPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {displayPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 3) * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/tin-tuc/${post.slug}`}>
                  <Card className="h-full flex flex-col group overflow-hidden rounded-[2.5rem] border-none bg-white shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div className="relative aspect-video overflow-hidden">
                      <Image src={post.image || '/placeholder-image.jpg'} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <Badge className="bg-white/90 backdrop-blur-md text-slate-900 absolute top-6 left-6 font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full shadow-xl border-none">{post.category}</Badge>
                    </div>
                    <CardContent className="p-10 flex flex-col flex-grow">
                      <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{post.title}</h3>
                      <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-10 italic leading-relaxed">{post.excerpt}</p>
                      <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex -space-x-2">
                            {post.authors?.map((auth, i) => (
                              <Avatar key={i} className="h-9 w-9 border-2 border-white shadow-sm"><AvatarImage src={auth.avatar_url}/></Avatar>
                            ))}
                         </div>
                         <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">{new Date(post.publish_date || '').toLocaleDateString('vi-VN')}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[2rem]">
            <p className="text-slate-500 font-bold text-lg">Không có bài viết nào trong danh mục này.</p>
          </div>
        )}
      </section>
    </div>
  )
}
