"use client"

import { useState, useEffect } from 'react'
import { supabase, Mentor } from '@/lib/supabase'
import { MentorTable } from '@/components/admin/mentors/MentorTable'
import { MentorModal } from '@/components/admin/mentors/MentorModal'
import { MentorDeleteModal } from '@/components/admin/mentors/MentorDeleteModal'
import { MentorQuickView } from '@/components/admin/mentors/MentorQuickView'
import { Button } from '@/components/ui/button'
import { Plus, Search, RefreshCw, Award } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

export default function MentorsAdminPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Quản lý trạng thái các Modal
  const [modalState, setModalState] = useState({
    addEdit: false,
    delete: false,
    view: false
  })
  const [currentMentor, setCurrentMentor] = useState<Mentor | null>(null)

  // Hàm lấy dữ liệu từ bảng mentors
  const fetchMentors = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('mentors')
        .select('*')
        .order('order', { ascending: true })

      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`)
      }

      const { data, error } = await query
      if (error) throw error
      setMentors(data || [])
    } catch (error: any) {
      toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMentors()
  }, [searchTerm])

  // Hàm xử lý xóa mentor
  const handleDelete = async () => {
    if (!currentMentor) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('mentors')
        .delete()
        .eq('id', currentMentor.id)

      if (error) throw error
      
      toast({ title: "Thành công", description: "Đã xóa hồ sơ chuyên gia." })
      setModalState(prev => ({ ...prev, delete: false }))
      fetchMentors()
    } catch (error: any) {
      toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10 space-y-10 min-h-screen bg-[#020202] text-white">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Award className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Ban Giảng Huấn</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
              Hệ thống quản lý Magazine Profile Chuyên gia
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => { setCurrentMentor(null); setModalState(prev => ({ ...prev, addEdit: true })) }} 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 font-black shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
        >
          <Plus className="mr-2" /> THÊM CHUYÊN GIA MỚI
        </Button>
      </div>

      {/* Toolbar Section: Tìm kiếm & Refresh */}
      <div className="flex gap-4 items-center bg-white/5 p-4 rounded-3xl border border-white/5">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
          <Input 
            className="bg-transparent border-none pl-12 h-12 text-white focus-visible:ring-0 placeholder:text-gray-600" 
            placeholder="Tìm kiếm theo tên hoặc chức danh chuyên gia..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="ghost" 
          onClick={fetchMentors} 
          className="rounded-2xl hover:bg-white/10 h-12 w-12"
          disabled={loading}
        >
          <RefreshCw className={`text-gray-400 ${loading ? "animate-spin" : ""}`} size={20}/>
        </Button>
      </div>

      {/* Main Table Content */}
      <MentorTable 
        mentors={mentors} 
        onEdit={(m: Mentor) => { 
          setCurrentMentor(m); 
          setModalState(prev => ({ ...prev, addEdit: true })); 
        }} 
        onDelete={(m: Mentor) => { 
          setCurrentMentor(m); 
          setModalState(prev => ({ ...prev, delete: true })); 
        }}
        onView={(m: Mentor) => { 
          setCurrentMentor(m); 
          setModalState(prev => ({ ...prev, view: true })); 
        }}
      />

      {/* --- Hệ thống Modals --- */}
      
      {/* Modal Thêm/Sửa: Đầy đủ các trường Magazine Profile */}
      <MentorModal 
        isOpen={modalState.addEdit} 
        onClose={() => setModalState(prev => ({ ...prev, addEdit: false }))} 
        mentor={currentMentor} 
        onSuccess={fetchMentors} 
      />

      {/* Modal Xác nhận xóa an toàn */}
      <MentorDeleteModal 
        isOpen={modalState.delete} 
        onClose={() => setModalState(prev => ({ ...prev, delete: false }))} 
        onConfirm={handleDelete} 
        mentor={currentMentor} 
        loading={loading} 
      />

      {/* Modal Xem nhanh hồ sơ (Quick View) */}
      <MentorQuickView 
        isOpen={modalState.view} 
        onClose={() => setModalState(prev => ({ ...prev, view: false }))} 
        mentor={currentMentor} 
      />
    </div>
  )
}