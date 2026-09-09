"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { GZVersTable } from "@/components/admin/gzvers/GZVersTable"
import { GZVerModal } from "@/components/admin/gzvers/GZVerModal"
import { GZVerQuickAddModal } from "@/components/admin/gzvers/GZVerQuickAddModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CheckCircle2,
  FileCheck2,
  Layers,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  UserCheck,
  Users2,
  Sparkles,
  GripVertical,
} from "lucide-react"
import { toast } from "sonner"

// Drag and Drop imports
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Department = {
  id?: string
  temp_id?: string
  name: string
  slug: string
  description?: string | null
  color: string
  sort_order: number
  is_active: boolean
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

export default function AdminGzversPage() {
  const [gzvers, setGzvers] = useState<any[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [savingDepartments, setSavingDepartments] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeDepartment, setActiveDepartment] = useState("all")
  const [activeTab, setActiveTab] = useState<"members" | "departments">("members")
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGzver, setSelectedGzver] = useState<any>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [gzversResult, departmentsResult, mentorsResult] = await Promise.all([
        supabase.from("gzvers").select("*").order("order", { ascending: true }),
        supabase.from("gzver_departments").select("*").order("sort_order", { ascending: true }),
        supabase.from("mentors").select("*").order("order", { ascending: true }),
      ])
      if (gzversResult.error) throw gzversResult.error
      if (departmentsResult.error) throw departmentsResult.error

      const depts = departmentsResult.data || []
      const banCoVan = depts.find((d: any) => d.slug === "ban-co-van" || d.name?.toLowerCase().includes("cố vấn"))

      let rawGzvers = gzversResult.data || []
      const existingSlugs = new Set(rawGzvers.map((g: any) => g.slug))

      // Check if any mentors from mentors table are missing in gzvers
      const missingMentors = (mentorsResult.data || []).filter((m: any) => !existingSlugs.has(m.slug))
      if (missingMentors.length > 0 && banCoVan) {
        const rowsToInsert = missingMentors.map((m: any) => ({
          full_name: m.full_name,
          slug: m.slug,
          position: m.title || "Cố vấn chuyên môn",
          company: (m.organizations && m.organizations[0]) || "GZV Center",
          avatar_url: m.avatar_url,
          department_id: banCoVan.id,
          department_name: banCoVan.name,
          is_active: m.is_active !== false,
          order: m.order || 0,
          testimonial: m.description || "",
          background: m.background || { education: "", experience: "" },
        }))

        // Auto insert into gzvers DB with user session
        const { data: insertedData, error: insertErr } = await supabase.from("gzvers").insert(rowsToInsert).select()
        if (!insertErr && insertedData) {
          rawGzvers = [...rawGzvers, ...insertedData]
        } else {
          // If insert fails, synthesize in memory for seamless display & filtering
          const synthesized = missingMentors.map((m: any) => ({
            ...m,
            position: m.title || "Cố vấn chuyên môn",
            company: (m.organizations && m.organizations[0]) || "GZV Center",
            department_id: banCoVan.id,
            department_name: banCoVan.name,
          }))
          rawGzvers = [...rawGzvers, ...synthesized]
        }
      }

      const members = rawGzvers.map((item: any) => {
        const dept = depts.find((d: any) => d.id === item.department_id || d.slug === item.department_id)
        return {
          ...item,
          gzver_departments: dept || null,
        }
      })

      setGzvers(members)
      setDepartments(depts)
    } catch (error: any) {
      toast.error(error.message || "Không tải được dữ liệu GZVers")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const orderedDepartments = useMemo(
    () => [...departments].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [departments]
  )

  const filteredGzvers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return gzvers.filter((item) => {
      const departmentId = item.department_id || item.gzver_departments?.id || ""
      const matchesDepartment = activeDepartment === "all" || departmentId === activeDepartment
      const haystack = `${item.full_name || ""} ${item.position || ""} ${item.company || ""} ${item.department_name || ""
        } ${item.gzver_departments?.name || ""}`.toLowerCase()
      return matchesDepartment && (!query || haystack.includes(query))
    })
  }, [activeDepartment, gzvers, searchQuery])

  // Stats KPI
  const stats = useMemo(() => {
    const total = gzvers.length
    const active = gzvers.filter((g) => g.is_active).length
    const withCv = gzvers.filter((g) => Boolean(g.cv_url)).length
    const totalDepts = departments.filter((d) => d.is_active).length
    return { total, active, withCv, totalDepts }
  }, [gzvers, departments])

  const handleOpenAdd = () => {
    setIsQuickAddOpen(true)
  }

  const handleOpenEdit = (gzver: any) => {
    setSelectedGzver(gzver)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (gzver: any) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ của ${gzver.full_name}?`)) return
    const { error } = await supabase.from("gzvers").delete().eq("id", gzver.id)
    if (error) {
      toast.error(error.message || "Không xóa được")
    } else {
      toast.success("Đã xóa GZVer thành công")
      fetchData()
    }
  }

  const handleToggleStatus = async (gzver: any, nextStatus: boolean) => {
    setGzvers((items) => items.map((g) => (g.id === gzver.id ? { ...g, is_active: nextStatus } : g)))
    const { error } = await supabase.from("gzvers").update({ is_active: nextStatus }).eq("id", gzver.id)
    if (error) {
      toast.error("Lỗi khi cập nhật trạng thái")
      fetchData()
    } else {
      toast.success(`Đã ${nextStatus ? "kích hoạt hiển thị" : "tạm ẩn"} ${gzver.full_name}`)
    }
  }

  const [activeDepartmentDragId, setActiveDepartmentDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDepartmentDragStart = (event: DragStartEvent) => {
    setActiveDepartmentDragId(String(event.active.id))
  }

  const handleDepartmentDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDepartmentDragId(null)
    if (!over || active.id === over.id) return

    const oldIndex = orderedDepartments.findIndex(
      (d) => (d.id || d.temp_id || d.slug) === active.id
    )
    const newIndex = orderedDepartments.findIndex(
      (d) => (d.id || d.temp_id || d.slug) === over.id
    )

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(orderedDepartments, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        sort_order: (idx + 1) * 10,
      }))
      setDepartments(reordered)

      // Auto update in database immediately
      try {
        const updatePayloads = reordered
          .filter((d) => d.id)
          .map((d) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            description: d.description || "",
            color: d.color || "#ed1c24",
            sort_order: d.sort_order,
            is_active: d.is_active !== false,
          }))

        if (updatePayloads.length > 0) {
          const { error } = await supabase
            .from("gzver_departments")
            .upsert(updatePayloads, { onConflict: "id" })
          if (error) throw error
          toast.success("Đã cập nhật thứ tự các ban!")
        }
      } catch (err: any) {
        toast.error("Lỗi khi lưu thứ tự ban: " + err.message)
      }
    }
  }

  const addDepartment = () => {
    const name = "BAN MỚI"
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    setDepartments((items) => [
      ...items,
      {
        temp_id: tempId,
        name,
        slug: `ban-moi-${Date.now()}`,
        description: "",
        color: "#ed1c24",
        sort_order: (items.length + 1) * 10,
        is_active: true,
      },
    ])
  }

  const updateDepartment = (index: number, patch: Partial<Department>) => {
    setDepartments((items) =>
      items.map((item, idx) => {
        if (idx !== index) return item
        const next = { ...item, ...patch }
        return next
      })
    )
  }

  const removeDepartment = async (index: number) => {
    const dept = departments[index]
    if (!dept) return

    if (dept.id) {
      if (!window.confirm(`Bạn có chắc muốn xóa ban "${dept.name}"? Các thành viên thuộc ban này sẽ được chuyển về Chưa gán ban.`)) return
      const { error } = await supabase.from("gzver_departments").delete().eq("id", dept.id)
      if (error) {
        toast.error("Không xóa được ban: " + error.message)
        return
      }
    }

    setDepartments((items) => items.filter((_, idx) => idx !== index))
    toast.success(`Đã xóa ban "${dept.name}"`)
    fetchData()
  }

  const saveDepartments = async () => {
    setSavingDepartments(true)
    try {
      // Chuẩn hóa tất cả các object có đúng cùng tập keys để PostgREST không báo lỗi PGRST102
      const rows = orderedDepartments.map((department, index) => {
        const payload: any = {
          name: department.name.trim(),
          slug: department.slug?.trim() || slugify(department.name) || `ban-${index + 1}`,
          description: department.description || "",
          color: department.color || "#ed1c24",
          sort_order: (index + 1) * 10,
          is_active: department.is_active !== false,
        }
        if (department.id) {
          payload.id = department.id
        }
        return payload
      })

      // Đối với items đã có id thì upsert theo id, items mới thì insert
      const toUpdate = rows.filter((r) => r.id)
      const toInsert = rows.filter((r) => !r.id)

      if (toUpdate.length > 0) {
        const { error: updErr } = await supabase
          .from("gzver_departments")
          .upsert(toUpdate, { onConflict: "id" })
        if (updErr) throw updErr
      }

      if (toInsert.length > 0) {
        const { error: insErr } = await supabase
          .from("gzver_departments")
          .upsert(toInsert, { onConflict: "slug" })
        if (insErr) throw insErr
      }

      toast.success("Đã lưu danh sách ban thành công!")
      fetchData()
    } catch (error: any) {
      console.error("Lỗi lưu ban:", error)
      toast.error(error.message || "Không lưu được ban")
    } finally {
      setSavingDepartments(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">
      {/* Top Header Card matching site-content */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 shrink-0 bg-[#ed1c24] text-white flex items-center justify-center font-black shadow-xs">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                GZVERS MANAGEMENT
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                Đội Ngũ Nhân Sự GZVers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Quản trị nhân sự toàn hệ thống, phân bổ ban bệ, hồ sơ CV & Magazine Profile.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="h-9 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
            >
              <RefreshCcw className={`mr-1.5 h-3.5 w-3.5 text-[#ed1c24] ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>

            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="h-9 px-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm GZVer mới
            </Button>
          </div>
        </div>

        {/* 4 Control Stats inside Top Header Card */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tổng GZVers</p>
            <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{stats.total}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Đang Hiển Thị</p>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Đã Có Hồ Sơ CV</p>
            <p className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">{stats.withCv}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Cơ Cấu Phòng Ban</p>
            <p className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">{stats.totalDepts}</p>
          </div>
        </div>
      </div>

      {/* Main Tabs matching site-content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 border border-slate-200 bg-slate-100 p-1.5 rounded-none shadow-xs dark:border-white/10 dark:bg-slate-900">
          <TabsTrigger
            value="members"
            className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Users2 className="h-3.5 w-3.5 shrink-0" /> Danh Sách Nhân Sự ({gzvers.length})
          </TabsTrigger>
          <TabsTrigger
            value="departments"
            className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Layers className="h-3.5 w-3.5 shrink-0" /> Cơ Cấu Ban ({departments.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MEMBERS */}
        <TabsContent value="members" className="space-y-4">
          <div className="border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900 space-y-4">
            {/* Top Toolbar: Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-11 rounded-none border-slate-200 bg-slate-50 pl-10 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                placeholder="Tìm kiếm nhân sự theo họ tên, chức vụ, đơn vị công tác..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Bottom Toolbar: Larger Department Filter Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Lọc Theo Phòng Ban:
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Đang hiển thị <strong className="text-[#ed1c24]">{filteredGzvers.length}</strong> / {gzvers.length} nhân sự
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveDepartment("all")}
                  className={`h-11 px-5 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 border rounded-none ${activeDepartment === "all"
                      ? "border-[#ed1c24] bg-[#ed1c24] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                >
                  <span>Tất Cả Ban</span>
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-none ${activeDepartment === "all" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    {gzvers.length}
                  </span>
                </button>

                {orderedDepartments
                  .filter((d) => d.id)
                  .map((dept) => {
                    const count = gzvers.filter(
                      (g) => (g.department_id || g.gzver_departments?.id) === dept.id
                    ).length
                    const isSelected = activeDepartment === dept.id
                    return (
                      <button
                        type="button"
                        key={dept.id}
                        onClick={() => setActiveDepartment(dept.id || "")}
                        className={`h-11 px-5 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 border rounded-none ${isSelected
                            ? "border-[#ed1c24] bg-[#ed1c24] text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                          }`}
                      >
                        <span>{dept.name}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-none ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
              </div>
            </div>
          </div>

          {/* Members Table */}
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
              <RefreshCcw className="mb-3 h-8 w-8 animate-spin text-[#ed1c24]" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang tải danh sách GZVers...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <GZVersTable
                gzvers={filteredGzvers}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
              <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Hiển thị: {filteredGzvers.length} / {gzvers.length} nhân sự</span>
                <span>{departments.length} ban chuyên môn</span>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: DEPARTMENTS */}
        <TabsContent value="departments" className="space-y-4">
          <Card className="rounded-none border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#ed1c24]" /> Danh sách các Ban trực thuộc
                </CardTitle>
                <CardDescription className="text-xs font-semibold mt-1">
                  Chỉnh sửa tên ban, mô tả tóm tắt và bật/tắt trạng thái hoạt động trên toàn hệ thống.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={addDepartment}
                  className="rounded-none border-[#ed1c24] text-xs font-black uppercase text-[#ed1c24] hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Thêm Ban Mới
                </Button>

                <Button
                  onClick={saveDepartments}
                  disabled={savingDepartments}
                  className="rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {savingDepartments ? "Đang lưu..." : "Lưu Danh Sách Ban"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDepartmentDragStart}
                onDragEnd={handleDepartmentDragEnd}
              >
                <SortableContext
                  items={orderedDepartments.map((d) => d.id || d.temp_id || d.slug)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {orderedDepartments.map((department, index) => {
                      const realIndex = departments.findIndex(
                        (item) => (item.id || item.temp_id || item.slug) === (department.id || department.temp_id || department.slug)
                      )
                      const memberCount = gzvers.filter(
                        (g) => (g.department_id || g.gzver_departments?.id) === department.id
                      ).length

                      const stableKey = department.id || department.temp_id || department.slug

                      return (
                        <SortableDepartmentCard
                          key={stableKey}
                          id={stableKey}
                          department={department}
                          positionIndex={index + 1}
                          memberCount={memberCount}
                          onUpdate={(patch) => updateDepartment(realIndex, patch)}
                          onRemove={() => removeDepartment(realIndex)}
                        />
                      )
                    })}
                  </div>
                </SortableContext>

                <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
                  {activeDepartmentDragId ? (() => {
                    const dragDept = orderedDepartments.find(
                      (d) => (d.id || d.temp_id || d.slug) === activeDepartmentDragId
                    )
                    if (!dragDept) return null
                    const dragIndex = orderedDepartments.findIndex(
                      (d) => (d.id || d.temp_id || d.slug) === activeDepartmentDragId
                    )
                    return (
                      <div className="border-2 border-[#ed1c24] bg-white p-4 shadow-2xl space-y-2 dark:bg-slate-900 opacity-95 pointer-events-none rounded-none">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center bg-[#ed1c24] text-white font-mono text-[10px] font-black">
                            {dragIndex + 1}
                          </span>
                          <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                            {dragDept.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{dragDept.description || "Đang di chuyển..."}</p>
                      </div>
                    )
                  })() : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Add Modal */}
      <GZVerQuickAddModal
        open={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        departments={departments.filter((d) => d.is_active)}
        onSuccess={fetchData}
      />

      {/* Full Profile Edit Modal */}
      <GZVerModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        gzver={selectedGzver}
        departments={departments.filter((d) => d.is_active)}
        onSave={fetchData}
      />
    </div>
  )
}

function SortableDepartmentCard({
  id,
  department,
  positionIndex,
  memberCount,
  onUpdate,
  onRemove,
}: {
  id: string
  department: Department
  positionIndex: number
  memberCount: number
  onUpdate: (patch: Partial<Department>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border p-4 transition-[border-color,background-color] space-y-3 ${
        isDragging
          ? "border-dashed border-[#ed1c24] bg-red-50/20 dark:bg-red-950/20"
          : department.is_active
          ? "border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-white/10 dark:bg-slate-950/50"
          : "border-slate-200/60 bg-slate-100/40 opacity-75 dark:border-white/5 dark:bg-slate-950/20"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-white/10">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-[#ed1c24] hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
            title="Kéo thả để thay đổi vị trí thứ tự hiển thị"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Position Order Badge */}
          <span className="flex h-5 w-5 items-center justify-center bg-[#ed1c24] text-white font-mono text-[10px] font-black rounded-none">
            {positionIndex}
          </span>

          <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
            {department.name || "Ban chưa đặt tên"}
          </span>

          {!department.is_active && (
            <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Đang tắt
            </span>
          )}
        </div>

        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5">
          {memberCount} thành viên
        </span>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tên Ban</Label>
        <Input
          className="h-9 rounded-none border-slate-200 bg-white text-xs dark:border-white/10 dark:bg-slate-900"
          value={department.name}
          placeholder="Nhập tên phòng ban..."
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mô tả tóm tắt</Label>
        <Textarea
          className="min-h-16 rounded-none border-slate-200 bg-white text-xs dark:border-white/10 dark:bg-slate-900"
          value={department.description || ""}
          placeholder="Mô tả chức năng nhiệm vụ của ban..."
          onChange={(e) => onUpdate({ description: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 px-2 text-xs font-bold text-slate-400 hover:text-red-600 rounded-none"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa ban
        </Button>

        <div className="flex items-center gap-2">
          <Switch
            checked={department.is_active}
            onCheckedChange={(is_active) => onUpdate({ is_active })}
          />
          <span
            className={`text-[11px] font-bold uppercase ${department.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
              }`}
          >
            {department.is_active ? "Bật" : "Tắt"}
          </span>
        </div>
      </div>
    </div>
  )
}
