"use client"

import React, { useState, useEffect, useMemo } from "react"
import { supabase, Mentor } from "@/lib/supabase"
import { MentorTable } from "@/components/admin/mentors/MentorTable"
import { MentorModal } from "@/components/admin/mentors/MentorModal"
import { MentorDeleteModal } from "@/components/admin/mentors/MentorDeleteModal"
import { MentorQuickView } from "@/components/admin/mentors/MentorQuickView"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Award, Plus, Search, RefreshCw, GraduationCap, CheckCircle2, BookOpen } from "lucide-react"
import { toast } from "sonner"

export default function MentorsAdminPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Modals state
  const [modalState, setModalState] = useState({
    addEdit: false,
    delete: false,
    view: false,
  })
  const [currentMentor, setCurrentMentor] = useState<Mentor | null>(null)

  // Fetch data
  const fetchMentors = async () => {
    setLoading(true)
    try {
      let query = supabase.from("mentors").select("*").order("order", { ascending: true })

      if (searchTerm.trim()) {
        query = query.ilike("full_name", `%${searchTerm.trim()}%`)
      }

      const { data, error } = await query
      if (error) throw error
      setMentors(data || [])
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải dữ liệu chuyên gia")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMentors()
  }, [searchTerm])

  // Stats KPI
  const stats = useMemo(() => {
    const total = mentors.length
    const active = mentors.filter((m) => m.is_active).length
    const withSpecialties = mentors.filter((m) => (m.specialties?.length || 0) > 0).length
    return { total, active, withSpecialties }
  }, [mentors])

  const handleDelete = async () => {
    if (!currentMentor) return
    setLoading(true)
    try {
      const { error } = await supabase.from("mentors").delete().eq("id", currentMentor.id)
      if (error) throw error
      toast.success("Đã xóa hồ sơ chuyên gia thành công.")
      setModalState((prev) => ({ ...prev, delete: false }))
      fetchMentors()
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xóa chuyên gia")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (mentor: Mentor, nextStatus: boolean) => {
    setMentors((items) => items.map((m) => (m.id === mentor.id ? { ...m, is_active: nextStatus } : m)))
    const { error } = await supabase.from("mentors").update({ is_active: nextStatus }).eq("id", mentor.id)
    if (error) {
      toast.error("Lỗi khi cập nhật trạng thái")
      fetchMentors()
    } else {
      toast.success(`Đã ${nextStatus ? "kích hoạt hiển thị" : "tạm ẩn"} chuyên gia ${mentor.full_name}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center bg-[#ed1c24] text-white">
              <GraduationCap className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Hội Đồng Ban Cố Vấn (Mentors)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-semibold">
            Quản lý danh sách cố vấn chiến lược, chuyên gia chuyên môn và hồ sơ Magazine Profile của GZVers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchMentors}
            disabled={loading}
            className="h-10 rounded-none border-slate-200 dark:border-white/10 text-xs font-bold"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>

          <Button
            onClick={() => {
              setCurrentMentor(null)
              setModalState((prev) => ({ ...prev, addEdit: true }))
            }}
            className="h-10 rounded-none bg-[#ed1c24] px-4 text-xs font-black uppercase text-white hover:bg-[#c91218]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm Cố Vấn Mới
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="rounded-none border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-slate-900">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tổng Cố Vấn</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <GraduationCap className="h-4 w-4 text-[#ed1c24]" />
          </div>
        </Card>

        <Card className="rounded-none border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-slate-900">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Đang Hiển Thị</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
        </Card>

        <Card className="rounded-none border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-slate-900">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hồ Sơ Magazine Profile</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.withSpecialties}</span>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3 border border-slate-200 bg-white p-3 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-10 rounded-none border-slate-200 bg-slate-50 pl-10 text-xs text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            placeholder="Tìm kiếm cố vấn theo họ tên hoặc chức danh chuyên môn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
          <RefreshCw className="mb-3 h-8 w-8 animate-spin text-[#ed1c24]" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang tải danh sách chuyên gia...</p>
        </div>
      ) : (
        <MentorTable
          mentors={mentors}
          onEdit={(m: Mentor) => {
            setCurrentMentor(m)
            setModalState((prev) => ({ ...prev, addEdit: true }))
          }}
          onDelete={(m: Mentor) => {
            setCurrentMentor(m)
            setModalState((prev) => ({ ...prev, delete: true }))
          }}
          onView={(m: Mentor) => {
            setCurrentMentor(m)
            setModalState((prev) => ({ ...prev, view: true }))
          }}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Modals */}
      <MentorModal
        isOpen={modalState.addEdit}
        onClose={() => setModalState((prev) => ({ ...prev, addEdit: false }))}
        mentor={currentMentor}
        onSuccess={fetchMentors}
      />

      <MentorDeleteModal
        isOpen={modalState.delete}
        onClose={() => setModalState((prev) => ({ ...prev, delete: false }))}
        onConfirm={handleDelete}
        mentor={currentMentor}
        loading={loading}
      />

      <MentorQuickView
        isOpen={modalState.view}
        onClose={() => setModalState((prev) => ({ ...prev, view: false }))}
        mentor={currentMentor}
      />
    </div>
  )
}