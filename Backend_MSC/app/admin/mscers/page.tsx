"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { MscersTable } from '@/components/admin/mscers/MscersTable'
import { MscerModal } from '@/components/admin/mscers/MscerModal'
import { Button } from '@/components/ui/button'
import { Plus, UserCircle2, Search, Loader2, RefreshCcw, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

export default function AdminMscersPage() {
  // State quản lý dữ liệu và hiển thị
  const [mscers, setMscers] = useState<any[]>([])
  const [filteredMscers, setFilteredMscers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMscer, setSelectedMscer] = useState<any>(null)

  // 1. Hàm lấy dữ liệu (READ)
  const fetchMscers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('mscers')
        .select('*')
        .order('order', { ascending: true })
      
      if (error) throw error
      if (data) {
        setMscers(data)
        setFilteredMscers(data)
      }
    } catch (error: any) {
      toast({
        title: "Lỗi tải dữ liệu",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMscers()
  }, [fetchMscers])

  // 2. Xử lý tìm kiếm (Local Search)
  useEffect(() => {
    const results = mscers.filter(m => 
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.position?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredMscers(results)
  }, [searchQuery, mscers])

  // 3. Hàm xóa (DELETE)
  const handleDelete = async (mscer: any) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ của ${mscer.full_name}? Hành động này không thể hoàn tác.`)) {
      try {
        const { error } = await supabase
          .from('mscers')
          .delete()
          .eq('id', mscer.id)
        
        if (error) throw error
        
        toast({ title: "Đã xóa thành công" })
        fetchMscers() // Tải lại danh sách
      } catch (error: any) {
        toast({
          title: "Lỗi khi xóa",
          description: error.message,
          variant: "destructive"
        })
      }
    }
  }

  // 4. Mở modal để thêm mới hoặc chỉnh sửa (CREATE/UPDATE)
  const handleOpenModal = (mscer: any = null) => {
    setSelectedMscer(mscer)
    setIsModalOpen(true)
  }

  return (
    <div className="p-8 space-y-8 bg-[#050505] min-h-screen text-white">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <UserCircle2 className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Quản lý MSCers</h1>
          </div>
          <p className="text-gray-500 font-medium text-sm mt-2">
            Hệ thống quản trị hồ sơ chuyên gia, lộ trình thăng tiến và thành tựu của đội ngũ MSC.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={fetchMscers} 
            className="border-white/10 bg-white/5 hover:bg-white/10 rounded-full"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button 
            onClick={() => handleOpenModal()} 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Plus size={18} className="mr-2"/> Thêm chuyên gia mới
          </Button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-gray-900/40 p-4 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <Input 
            className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-blue-500 text-gray-200 placeholder:text-gray-600" 
            placeholder="Tìm theo tên, chức danh chuyên gia..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 border-white/10 bg-white/5 rounded-xl gap-2 font-bold text-gray-400">
          <Filter size={18} /> Lọc trạng thái
        </Button>
      </div>

      {/* DATA TABLE SECTION */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-gray-900/20">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
          <p className="text-gray-500 font-black uppercase text-xs tracking-widest animate-pulse">Đang đồng bộ dữ liệu MSCers...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <MscersTable 
            mscers={filteredMscers} 
            onEdit={handleOpenModal} 
            onDelete={handleDelete} 
          />
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="flex justify-between items-center px-4 py-2 border-t border-white/5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
        <span>Tổng số chuyên gia: {filteredMscers.length}</span>
        <span className="flex items-center gap-2">
           <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> 
           Kết nối Supabase ổn định
        </span>
      </div>

      {/* MODAL COMPONENT */}
      <MscerModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mscer={selectedMscer} 
        onSave={fetchMscers} 
      />
    </div>
  )
}