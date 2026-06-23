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
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500">Đang tải bài viết...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài viết</h1>
          <p className="text-gray-500">Tạo và quản lý nội dung blog của bạn</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tạo bài viết mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
            <Badge className="bg-green-100 text-green-800">Live</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt xem</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt thích</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.likes.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
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
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh sách bài viết ({filteredArticles.length})</span>
            {filteredArticles.length !== articles.length && (
              <Badge variant="outline">
                Hiển thị {filteredArticles.length} / {articles.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ArticlesTable
            articles={filteredArticles}
            onUpdateArticle={handleUpdateArticle}
            onDeleteArticle={handleDeleteArticle}
            onEditArticle={handleEditArticle}
          />
        </CardContent>
      </Card>

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