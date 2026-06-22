"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthorTable } from '@/components/admin/authors/AuthorTable'
import { AuthorModal } from '@/components/admin/authors/AuthorModal'
import { AuthorDeleteModal } from '@/components/admin/authors/AuthorDeleteModal'
import { Button } from '@/components/ui/button'
import { Plus, Search, RefreshCw, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function AuthorsAdminPage() {
  // SỬA LỖI TẠI ĐÂY: Thêm <any[]> để tránh lỗi never[]
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
    } catch (error) {
      console.error("❌ Lỗi lấy dữ liệu tác giả:", error)
    } finally {
      setLoading(false)
    }
  }

  // Tự động tải lại khi tìm kiếm hoặc load trang
  useEffect(() => { 
    fetchAuthors() 
  }, [searchTerm])

  const handleDelete = async () => {
    if (!currentAuthor) return
    setLoading(true)
    try {
      const { error } = await supabase.from('authors').delete().eq('id', currentAuthor.id)
      if (error) throw error
      setModalState({ ...modalState, delete: false })
      fetchAuthors()
    } catch (error) {
      console.error("❌ Lỗi xóa tác giả:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10 space-y-10 min-h-screen bg-[#050505] text-white">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-600 rounded-2xl">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Danh mục Tác giả</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Quản lý biên tập viên bài viết</p>
          </div>
        </div>
        <Button 
          onClick={() => { setCurrentAuthor(null); setModalState({...modalState, addEdit: true}) }} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-12 font-black shadow-2xl"
        >
          <Plus className="mr-2" /> THÊM TÁC GIẢ MỚI
        </Button>
      </div>

      {/* Filter Section */}
      <div className="flex gap-4 items-center bg-white/5 p-4 rounded-3xl border border-white/5">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
          <Input 
            className="bg-transparent border-none pl-12 h-12 text-white focus-visible:ring-0" 
            placeholder="Tìm kiếm tên tác giả..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="ghost" onClick={fetchAuthors} className="rounded-2xl hover:bg-white/10">
          <RefreshCw className={loading ? "animate-spin" : ""} size={18}/>
        </Button>
      </div>

      {/* Table Section */}
      <AuthorTable 
        authors={authors} 
        onEdit={(a: any) => { setCurrentAuthor(a); setModalState({...modalState, addEdit: true}) }} 
        onDelete={(a: any) => { setCurrentAuthor(a); setModalState({...modalState, delete: true}) }}
      />

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