//D:\gzv\Backend_gzv\app\admin\articles\page.tsx
"use client"

import { useState, useEffect } from 'react'
import { BlogPost } from '@/lib/supabase'
import { BlogService } from '@/lib/blog-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArticlesTable } from '@/components/admin/articles/ArticlesTable'
import { CreateArticleModal } from '@/components/admin/articles/CreateArticleModal'
import { EditArticleModal } from '@/components/admin/articles/EditArticleModal'
import { Search, Plus, Filter, FileText, Eye, ThumbsUp, Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [filteredArticles, setFilteredArticles] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null)

  // Fetch articles from Supabase
  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      setIsLoading(true)
      const data = await BlogService.getAllPosts()
      setArticles(data)
      setFilteredArticles(data)
    } catch (error) {
      console.error('Error loading articles:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài viết",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter articles based on search term, status, and category
  useEffect(() => {
    let filtered = articles

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => {
        const isPublished = article.publish_date && new Date(article.publish_date) <= new Date()
        if (statusFilter === 'published') return isPublished
        if (statusFilter === 'draft') return !isPublished
        return true
      })
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.category === categoryFilter)
    }

    setFilteredArticles(filtered)
  }, [articles, searchTerm, statusFilter, categoryFilter])

  const handleCreateArticle = (newArticle: BlogPost) => {
    setArticles(prev => [newArticle, ...prev])
    toast({
      title: "Thành công",
      description: "Bài viết đã được tạo thành công",
    })
  }

  const handleUpdateArticle = async (updatedArticle: BlogPost) => {
    try {
      const success = await BlogService.updatePost(updatedArticle.id, updatedArticle)
      if (success) {
        setArticles(prev => prev.map(article => 
          article.id === updatedArticle.id ? updatedArticle : article
        ))
        toast({
          title: "Thành công",
          description: "Bài viết đã được cập nhật",
        })
      }
    } catch (error) {
      console.error('Error updating article:', error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài viết",
        variant: "destructive"
      })
    }
  }

  const handleDeleteArticle = (articleId: number) => {
    setArticles(prev => prev.filter(article => article.id !== articleId))
    toast({
      title: "Thành công",
      description: "Bài viết đã được xóa",
    })
  }

  const handleEditArticle = (article: BlogPost) => {
    setSelectedArticle(article)
    setEditModalOpen(true)
  }

  const getStats = () => {
    const totalArticles = articles.length
    const publishedArticles = articles.filter(article => 
      article.publish_date && new Date(article.publish_date) <= new Date()
    ).length
    const draftArticles = totalArticles - publishedArticles
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0)
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0)

    return {
      total: totalArticles,
      published: publishedArticles,
      drafts: draftArticles,
      views: totalViews,
      likes: totalLikes
    }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl py-32 flex flex-col items-center justify-center border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="animate-spin rounded-none h-8 w-8 border-2 border-[#ed1c24] border-t-transparent mx-auto"></div>
        <p className="text-slate-400 mt-4 text-xs font-black uppercase tracking-widest">Đang tải danh sách bài viết...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">
      {/* Top Header Card */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 shrink-0 bg-[#ed1c24] text-white flex items-center justify-center font-black shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                ARTICLES & BLOG POSTS
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                Quản Trị Tin Tức & Bài Viết Blog
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Tạo, chỉnh sửa và quản lý nội dung bài viết, tin tức công nghệ và cẩm nang GZV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={loadArticles}
              disabled={isLoading}
              className="h-9 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
            >
              <Clock className={`mr-1.5 h-3.5 w-3.5 text-[#ed1c24] ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>

            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="h-9 px-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo bài viết mới
            </Button>
          </div>
        </div>

        {/* 4 Control Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tổng Bài Viết</p>
            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{stats.total}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Đã Xuất Bản</p>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.published}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Bản Nháp</p>
            <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{stats.drafts}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tổng Lượt Xem</p>
            <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">{stats.views.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="border border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-slate-900 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, tóm tắt hoặc tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 pr-12 rounded-none border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 rounded-none border-slate-200 bg-slate-50 text-xs font-bold dark:border-white/10 dark:bg-slate-950">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 rounded-none border-slate-200 bg-slate-50 text-xs font-bold dark:border-white/10 dark:bg-slate-950">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="tutorial">Hướng dẫn</SelectItem>
                <SelectItem value="technical">Kỹ thuật</SelectItem>
                <SelectItem value="industry">Ngành nghề</SelectItem>
                <SelectItem value="ai">AI & Machine Learning</SelectItem>
                <SelectItem value="guide">Chỉ dẫn</SelectItem>
                <SelectItem value="news">Tin tức</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Articles Table Card */}
      <div className="space-y-2">
        <div className="overflow-hidden border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
          <ArticlesTable
            articles={filteredArticles}
            onUpdateArticle={handleUpdateArticle}
            onDeleteArticle={handleDeleteArticle}
            onEditArticle={handleEditArticle}
          />
        </div>
        <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>Hiển thị: {filteredArticles.length} / {articles.length} bài viết</span>
          <span>Hệ thống xuất bản GZV</span>
        </div>
      </div>

      {/* Create Article Modal */}
      <CreateArticleModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateArticle={handleCreateArticle}
      />

      {/* Edit Article Modal */}
      <EditArticleModal
        open={editModalOpen}
        article={selectedArticle}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedArticle(null)
        }}
        onUpdateArticle={handleUpdateArticle}
      />
    </div>
  )
}