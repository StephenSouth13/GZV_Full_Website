"use client"

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthorTable } from '@/components/admin/authors/AuthorTable'
import { AuthorModal } from '@/components/admin/authors/AuthorModal'
import { AuthorDeleteModal } from '@/components/admin/authors/AuthorDeleteModal'
import { Button } from '@/components/ui/button'
import { Plus, Search, RefreshCw, PenTool, Users, FileText, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

export default function AuthorsAdminPage() {
  const [authors, setAuthors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalState, setModalState] = useState({ addEdit: false, delete: false })
  const [currentAuthor, setCurrentAuthor] = useState<any>(null)

  const fetchAuthors = async () => {
    setLoading(true)
    try {
      let query = supabase.from('authors').select('*').order('full_name', { ascending: true })
      
      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`)
      }

      const { data, error } = await query
      if (error) throw error
      setAuthors(data || [])
    } catch (error: any) {
      toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchAuthors() 
  }, [searchTerm])

  const stats = useMemo(() => ({
    total: authors.length,
    withAvatar: authors.filter(a => !!a.avatar_url).length,
    withBio: authors.filter(a => !!a.bio).length,
  }), [authors])

  const handleDelete = async () => {
    if (!currentAuthor) return
    setLoading(true)
    try {
      const { error } = await supabase.from('authors').delete().eq('id', currentAuthor.id)
      if (error) throw error
      toast({ title: "Thành công", description: "Đã xóa tác giả thành công." })
      setModalState({ ...modalState, delete: false })
      fetchAuthors()
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">
      {/* Top Header Card */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 shrink-0 bg-[#ed1c24] text-white flex items-center justify-center font-black shadow-xs">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                EDITORIAL & AUTHORS
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                Danh Mục Tác Giả & Biên Tập Viên
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Quản lý đội ngũ tác giả, chuyên gia cố vấn và biên tập viên bài viết trên website.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAuthors}
              disabled={loading}
              className="h-9 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 text-[#ed1c24] ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>

            <Button
              size="sm"
              onClick={() => { setCurrentAuthor(null); setModalState({...modalState, addEdit: true}) }}
              className="h-9 px-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm tác giả mới
            </Button>
          </div>
        </div>

        {/* Control Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tổng Tác Giả</p>
            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{stats.total}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Có Ảnh Đại Diện</p>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.withAvatar}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Có Tiểu Sử</p>
            <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">{stats.withBio}</p>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="border border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            className="h-11 rounded-none border-slate-200 bg-slate-50 pl-10 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white" 
            placeholder="Tìm kiếm theo tên tác giả hoặc chức danh..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      </div>

      {/* Table Section */}
      <div className="space-y-2">
        <AuthorTable 
          authors={authors} 
          onEdit={(a: any) => { setCurrentAuthor(a); setModalState({...modalState, addEdit: true}) }} 
          onDelete={(a: any) => { setCurrentAuthor(a); setModalState({...modalState, delete: true}) }}
        />
        <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>Hiển thị: {authors.length} tác giả</span>
          <span>Hệ thống biên tập GZV</span>
        </div>
      </div>

      {/* Modals */}
      <AuthorModal 
        isOpen={modalState.addEdit} 
        onClose={() => setModalState({...modalState, addEdit: false})} 
        author={currentAuthor} 
        onSuccess={fetchAuthors} 
      />
      
      <AuthorDeleteModal 
        isOpen={modalState.delete} 
        onClose={() => setModalState({...modalState, delete: false})} 
        onConfirm={handleDelete} 
        author={currentAuthor} 
        loading={loading} 
      />
    </div>
  )
}