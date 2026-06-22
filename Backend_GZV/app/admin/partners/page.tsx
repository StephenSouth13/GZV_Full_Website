"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Plus, Search, RefreshCw, Handshake, Pencil, Trash2,
  ArrowUp, ArrowDown, Building2, GraduationCap, Eye, EyeOff,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { PartnerModal } from "@/components/admin/partners/PartnerModal"
import { PartnerDeleteModal } from "@/components/admin/partners/PartnerDeleteModal"

export type PartnerCategory = "corporate" | "education"

export interface Partner {
  id: string
  name: string
  logo_url: string
  category: PartnerCategory
  website_url: string | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

const CATEGORY_LABEL: Record<PartnerCategory, string> = {
  corporate: "Doanh nghiệp",
  education: "Giáo dục & Hiệp hội",
}

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"all" | PartnerCategory>("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [current, setCurrent] = useState<Partner | null>(null)

  const fetchPartners = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
    if (error) {
      toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" })
    } else {
      setPartners((data as Partner[]) || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  const filtered = useMemo(() => {
    return partners.filter(p => {
      if (tab !== "all" && p.category !== tab) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [partners, tab, search])

  const stats = useMemo(() => ({
    total: partners.length,
    corporate: partners.filter(p => p.category === "corporate").length,
    education: partners.filter(p => p.category === "education").length,
    active: partners.filter(p => p.is_active).length,
  }), [partners])

  const toggleActive = async (p: Partner) => {
    // optimistic
    setPartners(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
    const { error } = await supabase.from("partners").update({ is_active: !p.is_active }).eq("id", p.id)
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
      fetchPartners()
    }
  }

  const move = async (p: Partner, dir: -1 | 1) => {
    const siblings = partners
      .filter(x => x.category === p.category)
      .sort((a, b) => a.sort_order - b.sort_order)
    const idx = siblings.findIndex(s => s.id === p.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= siblings.length) return
    const other = siblings[swapIdx]
    const a = p.sort_order
    const b = other.sort_order
    setPartners(prev => prev.map(x => {
      if (x.id === p.id) return { ...x, sort_order: b }
      if (x.id === other.id) return { ...x, sort_order: a }
      return x
    }))
    const [r1, r2] = await Promise.all([
      supabase.from("partners").update({ sort_order: b }).eq("id", p.id),
      supabase.from("partners").update({ sort_order: a }).eq("id", other.id),
    ])
    if (r1.error || r2.error) {
      toast({ title: "Lỗi sắp xếp", description: (r1.error || r2.error)?.message, variant: "destructive" })
      fetchPartners()
    }
  }

  const openAdd = () => { setCurrent(null); setModalOpen(true) }
  const openEdit = (p: Partner) => { setCurrent(p); setModalOpen(true) }
  const openDelete = (p: Partner) => { setCurrent(p); setDeleteOpen(true) }

  const handleDelete = async () => {
    if (!current) return
    const { error } = await supabase.from("partners").delete().eq("id", current.id)
    if (error) {
      toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Đã xóa", description: `Đã xóa ${current.name}.` })
      setDeleteOpen(false)
      fetchPartners()
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-[#020202] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30">
            <Handshake className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
              Đối tác & Đồng hành
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
              Quản lý logo và vị trí đối tác trên trang /dong-hanh
            </p>
          </div>
        </div>
        <Button
          onClick={openAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 h-12 font-black shadow-2xl shadow-emerald-600/30 transition-all active:scale-95"
        >
          <Plus className="mr-2" size={18} /> Thêm đối tác
        </Button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Tổng đối tác" value={stats.total} icon={Handshake} accent="from-slate-700 to-slate-900" />
        <StatTile label="Doanh nghiệp" value={stats.corporate} icon={Building2} accent="from-emerald-600 to-teal-700" />
        <StatTile label="Giáo dục" value={stats.education} icon={GraduationCap} accent="from-indigo-600 to-blue-700" />
        <StatTile label="Đang hiển thị" value={stats.active} icon={Eye} accent="from-amber-500 to-orange-600" />
      </div>

      {/* Toolbar */}
      <Card className="bg-zinc-950 border-zinc-800 p-4 flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex gap-2">
          {(["all", "corporate", "education"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 h-10 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                tab === t
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {t === "all" ? "Tất cả" : CATEGORY_LABEL[t]}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên đối tác..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-white w-64"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchPartners}
            className="border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </Card>

      {/* Grid of logos */}
      {loading && partners.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-zinc-950 border-zinc-800 p-16 text-center">
          <Handshake className="mx-auto text-zinc-700 mb-4" size={48} />
          <p className="text-zinc-400 font-semibold">Không có đối tác nào phù hợp.</p>
          <Button onClick={openAdd} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2" size={16} /> Thêm đối tác mới
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(p => (
            <PartnerCard
              key={p.id}
              partner={p}
              onEdit={() => openEdit(p)}
              onDelete={() => openDelete(p)}
              onToggle={() => toggleActive(p)}
              onUp={() => move(p, -1)}
              onDown={() => move(p, 1)}
            />
          ))}
        </div>
      )}

      <PartnerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        partner={current}
        existing={partners}
        onSuccess={() => { setModalOpen(false); fetchPartners() }}
      />
      <PartnerDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        partner={current}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function StatTile({ label, value, icon: Icon, accent }: {
  label: string; value: number; icon: any; accent: string
}) {
  return (
    <Card className={`relative overflow-hidden border-zinc-800 bg-gradient-to-br ${accent} p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70">{label}</p>
          <p className="text-3xl font-black text-white mt-1">{value}</p>
        </div>
        <Icon className="text-white/30" size={36} />
      </div>
    </Card>
  )
}

function PartnerCard({ partner, onEdit, onDelete, onToggle, onUp, onDown }: {
  partner: Partner
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onUp: () => void
  onDown: () => void
}) {
  const isUrl = partner.logo_url.startsWith("http")
  return (
    <Card className="group relative overflow-hidden bg-zinc-950 border-zinc-800 rounded-2xl">
      <div className="relative h-32 bg-white flex items-center justify-center p-4">
        {isUrl ? (
          <Image
            src={partner.logo_url}
            alt={partner.name}
            width={300}
            height={200}
            className="max-h-full w-auto object-contain"
            unoptimized
          />
        ) : (
          // local public assets in Frontend project — preview directly
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={partner.logo_url} alt={partner.name} className="max-h-full w-auto object-contain" />
        )}
        {!partner.is_active && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge className="bg-red-600">Đang ẩn</Badge>
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-white truncate text-sm">{partner.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">
              {CATEGORY_LABEL[partner.category]} · #{partner.sort_order}
            </p>
          </div>
          <Switch checked={partner.is_active} onCheckedChange={onToggle} />
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={onUp}
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
            <ArrowUp size={14} />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDown}
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
            <ArrowDown size={14} />
          </Button>
          <div className="flex-1" />
          <Button size="icon" variant="ghost" onClick={onEdit}
            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-950">
            <Pencil size={14} />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete}
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
