"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { ProjectsTable } from '@/components/admin/projects/ProjectsTable'
import { CreateProjectModal } from '@/components/admin/projects/CreateProjectModal'
import { EditProjectModal } from '@/components/admin/projects/EditProjectModal'
import { DeleteProjectModal } from '@/components/admin/projects/DeleteProjectModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, Search, FolderOpen, Loader2, RefreshCcw, 
  ChevronLeft, ChevronRight, Filter, AlertCircle 
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const ITEMS_PER_PAGE = 8;

function ProjectsManagementContent() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [deletingProject, setDeletingProject] = useState<any>(null)

  const handleReorder = (newOrder: any[]) => {
    setProjects(newOrder);
  };

  const fetchProjects = useCallback(async (page = 1, silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Logic sắp xếp: Ưu tiên order_index tăng dần, sau đó đến created_at mới nhất
      const { data, error, count } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order('order_index', { ascending: true }) 
        .order('created_at', { ascending: false }) 
        .range(from, to);    
      
      if (error) throw error;
      
      setProjects(data || []);
      if (count !== null) setTotalCount(count);
    } catch (error: any) {
      toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage, fetchProjects]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const handleCreateSuccess = () => {
    fetchProjects(1);
    setIsCreateModalOpen(false);
  };

  const handleUpdateSuccess = () => {
    fetchProjects(currentPage, true);
    setEditingProject(null);
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Đã xóa thành công" });
      if (projects.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchProjects(currentPage, true);
      }
      setDeletingProject(null);
    } catch (error: any) {
      toast({ title: "Lỗi khi xóa", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-montserrat">
      {/* Header Section - Đã tối ưu hóa Montserrat & Italic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Hệ thống <span className="text-blue-500">Dự án</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
            Quản trị & Sắp xếp mức độ ưu tiên hiển thị Portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-xl border-slate-700 text-white hover:bg-slate-800" onClick={() => fetchProjects(currentPage, true)} disabled={isRefreshing}>
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-xl shadow-lg shadow-blue-500/20">
            <Plus className="h-4 w-4 mr-2" /> Thêm dự án mới
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 px-10 py-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="TÌM KIẾM DỰ ÁN..." 
                className="pl-12 bg-slate-50 border-none h-12 rounded-xl font-black text-[10px] uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">
                DATABASE: {totalCount} DỰ ÁN
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="py-40 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-slate-400 mt-6 font-black uppercase text-[10px] tracking-[0.3em]">Đang đồng bộ dữ liệu...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-40 text-center">
                <AlertCircle className="h-16 w-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Không tìm thấy kết quả phù hợp</p>
              </div>
            ) : (
              <ProjectsTable 
                projects={filteredProjects}
                onEdit={setEditingProject}
                onDelete={setDeletingProject}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onReorder={handleReorder}
              />
            )}
          </AnimatePresence>
        </CardContent>

        {/* Pagination Footer - Đã tinh chỉnh font Montserrat */}
        {totalPages > 1 && (
          <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Trang <span className="text-blue-600">{currentPage}</span> / {totalPages}
            </p>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="rounded-xl font-black text-[9px] uppercase tracking-tighter"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Trước
              </Button>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "ghost"}
                    size="sm"
                    className={`w-10 h-10 p-0 rounded-xl font-black text-[10px] ${currentPage === i + 1 ? 'bg-blue-600 shadow-lg shadow-blue-500/30 text-white' : ''}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="rounded-xl font-black text-[9px] uppercase tracking-tighter"
              >
                Sau <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals - Truyền props chuẩn để kích hoạt CRUD */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={handleCreateSuccess} 
      />

      {editingProject && (
        <EditProjectModal 
          isOpen={!!editingProject} 
          project={editingProject} 
          onClose={() => setEditingProject(null)} 
          onSuccess={handleUpdateSuccess} 
        />
      )}

      {deletingProject && (
        <DeleteProjectModal 
          isOpen={!!deletingProject} 
          project={deletingProject} 
          onClose={() => setDeletingProject(null)} 
          onDelete={handleDeleteConfirm} 
        />
      )}
    </div>
  )
}

export default function ProjectsManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'collab']}>
      <ProjectsManagementContent />
    </ProtectedRoute>
  )
}