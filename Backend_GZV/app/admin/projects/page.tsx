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
    <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">
      {/* Top Header Card */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 shrink-0 bg-[#ed1c24] text-white flex items-center justify-center font-black shadow-xs">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                PROJECTS & PORTFOLIO
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                Quản Trị Dự Án & Portfolio GZV
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Quản lý các dự án, case study, hình ảnh và sắp xếp thứ tự ưu tiên hiển thị.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProjects(currentPage, true)}
              disabled={isRefreshing}
              className="h-9 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
            >
              <RefreshCcw className={`mr-1.5 h-3.5 w-3.5 text-[#ed1c24] ${isRefreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>

            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-9 px-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm dự án mới
            </Button>
          </div>
        </div>

        {/* 4 Control Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tổng Dự Án</p>
            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{totalCount}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Đang Tải Trang</p>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{projects.length}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Trang Hiện Tại</p>
            <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">{currentPage} / {totalPages || 1}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Số Lượng / Trang</p>
            <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">{ITEMS_PER_PAGE}</p>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="border border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            className="h-11 rounded-none border-slate-200 bg-slate-50 pl-10 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white" 
            placeholder="Tìm kiếm dự án theo tên hoặc danh mục..." 
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

      {/* Main Content */}
      <div className="border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900 overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#ed1c24]" />
              <p className="text-slate-400 mt-4 font-black uppercase text-xs tracking-widest">Đang tải danh sách dự án...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-24 text-center">
              <AlertCircle className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Không tìm thấy dự án nào phù hợp</p>
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Trang <span className="text-[#ed1c24] font-black">{currentPage}</span> / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="h-8 rounded-none border-slate-200 dark:border-white/10 font-bold text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Trước
              </Button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    className={`w-8 h-8 p-0 rounded-none font-bold text-xs ${
                      currentPage === i + 1 ? 'bg-[#ed1c24] text-white border-[#ed1c24]' : 'border-slate-200 dark:border-white/10'
                    }`}
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
                className="h-8 rounded-none border-slate-200 dark:border-white/10 font-bold text-xs"
              >
                Sau <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
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