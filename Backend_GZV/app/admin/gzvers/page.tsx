"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { GZVersTable } from "@/components/admin/gzvers/GZVersTable"
import { GZVerModal } from "@/components/admin/gzvers/GZVerModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowDown, ArrowUp, Plus, RefreshCcw, Save, Search, Trash2, Users2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type Department = {
  id?: string
  name: string
  slug: string
  description?: string | null
  color: string
  sort_order: number
  is_active: boolean
}

const slugify = (text: string) => text
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGzver, setSelectedGzver] = useState<any>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [gzversResult, departmentsResult] = await Promise.all([
        supabase.from("gzvers").select("*, gzver_departments(*)").order("order", { ascending: true }),
        supabase.from("gzver_departments").select("*").order("sort_order", { ascending: true }),
      ])
      if (gzversResult.error) throw gzversResult.error
      if (departmentsResult.error) throw departmentsResult.error
      setGzvers(gzversResult.data || [])
      setDepartments(departmentsResult.data || [])
    } catch (error: any) {
      toast({ title: "Không tải được dữ liệu GZVers", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const orderedDepartments = useMemo(() => [...departments].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)), [departments])
  const filteredGzvers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return gzvers.filter((item) => {
      const departmentId = item.department_id || item.gzver_departments?.id || ""
      const matchesDepartment = activeDepartment === "all" || departmentId === activeDepartment
      const haystack = `${item.full_name || ""} ${item.position || ""} ${item.company || ""} ${item.department_name || ""} ${item.gzver_departments?.name || ""}`.toLowerCase()
      return matchesDepartment && (!query || haystack.includes(query))
    })
  }, [activeDepartment, gzvers, searchQuery])

  const handleOpenModal = (gzver: any = null) => {
    setSelectedGzver(gzver)
    setIsModalOpen(true)
  }

  const handleDelete = async (gzver: any) => {
    if (!window.confirm(`Xóa hồ sơ của ${gzver.full_name}?`)) return
    const { error } = await supabase.from("gzvers").delete().eq("id", gzver.id)
    if (error) toast({ title: "Không xóa được", description: error.message, variant: "destructive" })
    else {
      toast({ title: "Đã xóa GZVer" })
      fetchData()
    }
  }

  const addDepartment = () => {
    const name = "BAN MỚI"
    setDepartments((items) => [...items, {
      name,
      slug: `ban-moi-${Date.now()}`,
      description: "",
      color: "#ed1c24",
      sort_order: (items.length + 1) * 10,
      is_active: true,
    }])
  }

  const updateDepartment = (index: number, patch: Partial<Department>) => {
    setDepartments((items) => items.map((item, idx) => {
      if (idx !== index) return item
      const next = { ...item, ...patch }
      if (patch.name && (!item.id || next.slug.startsWith("ban-moi-"))) next.slug = slugify(patch.name)
      return next
    }))
  }

  const moveDepartment = (index: number, direction: -1 | 1) => {
    setDepartments((items) => {
      const ordered = [...items].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const target = index + direction
      if (target < 0 || target >= ordered.length) return items
      const current = ordered[index]
      ordered[index] = ordered[target]
      ordered[target] = current
      return ordered.map((item, itemIndex) => ({ ...item, sort_order: (itemIndex + 1) * 10 }))
    })
  }

  const deleteDepartment = async (department: Department, index: number) => {
    if (!window.confirm(`Xóa ${department.name}? GZVers thuộc ban này sẽ chuyển sang chưa gán ban.`)) return
    setDepartments((items) => items.filter((_, idx) => idx !== index))
    if (!department.id) return
    await supabase.from("gzvers").update({ department_id: null, department_name: null }).eq("department_id", department.id)
    const { error } = await supabase.from("gzver_departments").delete().eq("id", department.id)
    if (error) toast({ title: "Không xóa được ban", description: error.message, variant: "destructive" })
    else {
      toast({ title: "Đã xóa ban" })
      fetchData()
    }
  }

  const saveDepartments = async () => {
    setSavingDepartments(true)
    try {
      const rows = orderedDepartments.map((department, index) => ({
        ...department,
        slug: department.slug || slugify(department.name),
        sort_order: (index + 1) * 10,
      }))
      const { error } = await supabase.from("gzver_departments").upsert(rows, { onConflict: "slug" })
      if (error) throw error
      toast({ title: "Đã lưu danh sách ban" })
      fetchData()
    } catch (error: any) {
      toast({ title: "Không lưu được ban", description: error.message, variant: "destructive" })
    } finally {
      setSavingDepartments(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] p-5 text-white md:p-8">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 border-l-4 border-[#ed1c24] pl-3 text-xs font-black uppercase tracking-[0.24em] text-[#ed1c24]">GZV Organization</p>
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">Quản lý GZVers theo ban</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-gray-400">Tạo ban, đổi tên, sắp xếp vị trí, bật/tắt và gán từng GZVer vào đúng vị trí hiển thị trên website.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} className="h-11 rounded-none border-white/10 bg-white/5 text-white hover:bg-white/10">
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button onClick={() => handleOpenModal()} className="h-11 rounded-none bg-[#ed1c24] px-5 text-xs font-black uppercase text-white hover:bg-[#c91218]">
            <Plus size={18} className="mr-2" /> Thêm GZVer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
        <aside className="space-y-4">
          <div className="border border-white/10 bg-[#0b0b0b] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase">Danh sách ban</h2>
                <p className="mt-1 text-xs text-gray-500">Tạo, sửa, xóa, kéo thứ tự bằng nút lên/xuống.</p>
              </div>
              <Button variant="outline" size="sm" onClick={addDepartment} className="rounded-none border-[#ed1c24] text-[#ed1c24]">
                <Plus className="mr-1 h-4 w-4" /> Ban
              </Button>
            </div>
            <div className="space-y-3">
              {orderedDepartments.map((department, index) => {
                const realIndex = departments.findIndex((item) => (item.id || item.slug) === (department.id || department.slug))
                return (
                  <div key={department.id || department.slug} className="space-y-3 border border-white/10 bg-white/[0.03] p-4">
                    <div className="grid grid-cols-[1fr_82px] gap-2">
                      <Field label="Tên ban"><Input className="h-10 rounded-none border-white/10 bg-white/5 text-white" value={department.name} onChange={(e) => updateDepartment(realIndex, { name: e.target.value })} /></Field>
                      <Field label="Thứ tự"><Input type="number" className="h-10 rounded-none border-white/10 bg-white/5 text-white" value={department.sort_order} onChange={(e) => updateDepartment(realIndex, { sort_order: Number(e.target.value) || 0 })} /></Field>
                    </div>
                    <Field label="Mô tả"><Textarea className="min-h-20 rounded-none border-white/10 bg-white/5 text-white" value={department.description || ""} onChange={(e) => updateDepartment(realIndex, { description: e.target.value })} /></Field>
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-end gap-2">
                      <Field label="Màu"><Input type="color" className="h-10 rounded-none border-white/10 bg-white/5" value={department.color || "#ed1c24"} onChange={(e) => updateDepartment(realIndex, { color: e.target.value })} /></Field>
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-none border-white/10 bg-white/5 text-white" disabled={index === 0} onClick={() => moveDepartment(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-none border-white/10 bg-white/5 text-white" disabled={index === orderedDepartments.length - 1} onClick={() => moveDepartment(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
                      <div className="flex h-10 items-center gap-2 border border-white/10 px-3"><Switch checked={department.is_active} onCheckedChange={(is_active) => updateDepartment(realIndex, { is_active })} /><span className="text-[10px] font-black uppercase text-gray-400">Bật</span></div>
                      <Button variant="destructive" size="icon" className="h-10 w-10 rounded-none" onClick={() => deleteDepartment(department, realIndex)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )
              })}
            </div>
            <Button onClick={saveDepartments} disabled={savingDepartments} className="mt-4 h-11 w-full rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]">
              {savingDepartments ? "Đang lưu..." : <><Save className="mr-2 h-4 w-4" />Lưu danh sách ban</>}
            </Button>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="border border-white/10 bg-[#0b0b0b] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input className="h-12 rounded-none border-white/10 bg-white/5 pl-11 text-white placeholder:text-gray-600" placeholder="Tìm theo tên, chức danh, ban..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterButton active={activeDepartment === "all"} onClick={() => setActiveDepartment("all")}>Tất cả</FilterButton>
                {orderedDepartments.filter((department) => department.id).map((department) => (
                  <FilterButton key={department.id} active={activeDepartment === department.id} onClick={() => setActiveDepartment(department.id || "")}>{department.name}</FilterButton>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-80 flex-col items-center justify-center border border-white/10 bg-[#0b0b0b]">
              <RefreshCcw className="mb-4 h-10 w-10 animate-spin text-[#ed1c24]" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">Đang đồng bộ dữ liệu...</p>
            </div>
          ) : (
            <GZVersTable gzvers={filteredGzvers} onEdit={handleOpenModal} onDelete={handleDelete} />
          )}

          <div className="flex items-center justify-between border-t border-white/10 px-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span>Tổng hiển thị: {filteredGzvers.length}</span>
            <span className="inline-flex items-center gap-2"><Users2 className="h-4 w-4 text-[#ed1c24]" /> {departments.length} ban</span>
          </div>
        </main>
      </div>

      <GZVerModal open={isModalOpen} onClose={() => setIsModalOpen(false)} gzver={selectedGzver} departments={departments.filter((department) => department.is_active)} onSave={fetchData} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</Label>{children}</div>
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`h-10 border px-3 text-[10px] font-black uppercase transition ${active ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-white/10 bg-white/5 text-gray-300 hover:border-[#ed1c24]"}`}>
      {children}
    </button>
  )
}
