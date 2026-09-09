"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Handshake,
  RotateCcw,
  LayoutGrid,
  Sidebar,
  GripVertical,
  Layers,
} from "lucide-react"

export interface PartnerGroupConfigItem {
  key: string
  label: string
  visible: boolean
}

export interface PartnersPageConfig {
  groups?: PartnerGroupConfigItem[]
  show_sidebar?: boolean
  sidebar_title?: string
  columns?: number
}

interface SortableGroupRowProps {
  group: PartnerGroupConfigItem
  count: number
  onToggleVisible: (checked: boolean) => void
}

function SortableGroupRow({ group, count, onToggleVisible }: SortableGroupRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isVisible = group.visible !== false

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-3 border border-slate-200 bg-white px-4 py-3 rounded-none select-none dark:border-white/10 dark:bg-slate-900 ${isDragging ? "bg-red-50/50 border-[#ed1c24] shadow-md z-50 cursor-grabbing" : ""
        }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#ed1c24] p-1 shrink-0 rounded-none transition-colors"
          title="Kéo thả để đổi thứ tự nhóm"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <span className="font-black text-xs uppercase tracking-tight text-slate-900 dark:text-white truncate">
          {group.label}
        </span>

        <span className="bg-slate-100 text-slate-600 text-[10px] font-black rounded-none border border-slate-200 px-2 py-0.5 shrink-0 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10">
          {count} đối tác
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Switch checked={isVisible} onCheckedChange={onToggleVisible} />
        <span
          className={`text-[10px] font-black uppercase tracking-wider ${isVisible ? "text-slate-900 dark:text-white" : "text-slate-400"
            }`}
        >
          {isVisible ? "Hiển thị" : "Đang ẩn"}
        </span>
      </div>
    </div>
  )
}

export function PartnersSectionEditor({
  value = {},
  updateKey,
  onChange,
}: {
  value: Record<string, any>
  updateKey: (key: string, nextValue: any) => void
  onChange: (patch: Record<string, any>) => void
}) {
  const [partners, setPartners] = useState<any[]>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(true)

  // Query partners from DB to count per group
  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        setIsLoadingPartners(true)
        const { data, error } = await supabase
          .from("partners")
          .select("id, name, category, sort_order, is_active")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })

        if (!active) return
        if (error) console.error("Lỗi lấy danh sách đối tác:", error)
        setPartners(data || [])
      } catch (err) {
        console.error("Lỗi tải đối tác:", err)
      } finally {
        if (active) setIsLoadingPartners(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  // Calculate group counts
  const groupCounts: Record<string, number> = {}
  partners.forEach((p) => {
    const rawG = (p.category || "").trim()
    const gKey = rawG || "doi-tac-khac"
    groupCounts[gKey] = (groupCounts[gKey] || 0) + 1
  })

  // Format label from category key
  const formatLabel = (key: string) => {
    if (key === "don-vi-chi-dao") return "ĐƠN VỊ CHỈ ĐẠO THỰC HIỆN"
    if (key === "doi-tac-dong-hanh") return "ĐỐI TÁC ĐỒNG HÀNH"
    if (key === "dai-hoc-cao-dang") return "ĐẠI HỌC / CAO ĐẲNG"
    if (key === "don-vi-bao-tro") return "ĐƠN VỊ BẢO TRỢ"
    if (key === "don-vi-thuc-hien") return "ĐƠN VỊ THỰC HIỆN"
    if (key === "doi-tac-khac") return "ĐỐI TÁC KHÁC"
    return key.replace(/-/g, " ").toUpperCase()
  }

  // Get or merge current groups config
  const groupConfigs: PartnerGroupConfigItem[] = React.useMemo(() => {
    const savedGroups: PartnerGroupConfigItem[] = value.groups || []
    const dbGroupKeys = Object.keys(groupCounts)

    if (dbGroupKeys.length === 0) {
      return savedGroups.length > 0
        ? savedGroups
        : [
          { key: "doi-tac-khac", label: "ĐỐI TÁC KHÁC", visible: true },
        ]
    }

    const merged: PartnerGroupConfigItem[] = []
    savedGroups.forEach((sg) => {
      if (dbGroupKeys.includes(sg.key)) {
        merged.push({
          key: sg.key,
          label: sg.label || formatLabel(sg.key),
          visible: sg.visible !== false,
        })
      }
    })

    dbGroupKeys.forEach((dbKey) => {
      if (!merged.some((m) => m.key === dbKey)) {
        merged.push({
          key: dbKey,
          label: formatLabel(dbKey),
          visible: true,
        })
      }
    })

    return merged
  }, [value.groups, groupCounts])

  const showSidebar = value.show_sidebar !== false
  const sidebarTitle = value.sidebar_title || "Nhóm đối tác"
  const columns = Number(value.columns) || 4

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const keys = groupConfigs.map((g) => g.key)
      const oldIndex = keys.indexOf(active.id as string)
      const newIndex = keys.indexOf(over.id as string)
      const reordered = arrayMove(groupConfigs, oldIndex, newIndex)
      updateKey("groups", reordered)
    }
  }

  const handleToggleVisible = (idx: number, checked: boolean) => {
    const next = [...groupConfigs]
    next[idx] = { ...next[idx], visible: checked }
    updateKey("groups", next)
  }

  const handleResetDefaults = () => {
    const dbGroupKeys = Object.keys(groupCounts)
    const defaultList = (dbGroupKeys.length > 0
      ? dbGroupKeys
      : ["don-vi-chi-dao", "doi-tac-dong-hanh", "dai-hoc-cao-dang", "don-vi-bao-tro", "don-vi-thuc-hien", "doi-tac-khac"]
    ).map((k) => ({
      key: k,
      label: formatLabel(k),
      visible: true,
    }))

    onChange({
      ...value,
      groups: defaultList,
      show_sidebar: true,
      sidebar_title: "Nhóm đối tác",
      columns: 4,
    })
  }

  const visibleGroups = groupConfigs.filter((g) => g.visible !== false)

  return (
    <div className="space-y-6 select-none">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-none dark:border-white/10 dark:bg-slate-900 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Handshake className="h-5 w-5 text-[#ed1c24]" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Cấu hình Section Đối tác (Partners Grid)
            </h3>
            <p className="text-[11px] font-semibold text-slate-500">
              Quản lý thứ tự & ẩn/hiện các nhóm đối tác, tiêu đề Sidebar, số cột và khối CTA.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetDefaults}
          className="h-8 px-3 rounded-none text-[10px] font-black uppercase tracking-wider border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1 text-[#ed1c24]" />
          Mặc định
        </Button>
      </div>

      {/* Main Editing Controls Container */}
      <div className="space-y-5">
        {/* 0. Tiêu đề & Mô tả Section */}
        <div className="bg-white border border-slate-200 p-5 rounded-none space-y-4 dark:border-white/10 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Handshake className="h-4 w-4 text-[#ed1c24]" />
              Tiêu đề & Mô tả Section
            </h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">Tiêu đề chính (Title)</Label>
              <Input
                value={value.title ?? "MẠNG LƯỚI ĐỐI TÁC CHIẾN LƯỢC"}
                onChange={(e) => updateKey("title", e.target.value)}
                placeholder="MẠNG LƯỚI ĐỐI TÁC CHIẾN LƯỢC"
                className="rounded-none h-9 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">Mô tả Section (Description)</Label>
              <Input
                value={value.description ?? value.subtitle ?? "Đồng hành cùng các tập đoàn, doanh nghiệp và viện trường hàng đầu kiến tạo giá trị thực chiến."}
                onChange={(e) => {
                  updateKey("description", e.target.value)
                  updateKey("subtitle", e.target.value)
                }}
                placeholder="Mô tả cho danh mục đối tác..."
                className="rounded-none h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 1. Sắp xếp & Bật/Tắt Nhóm đối tác */}
        <div className="bg-white border border-slate-200 p-5 rounded-none space-y-4 dark:border-white/10 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#ed1c24]" />
              1. Sắp xếp & Hiển thị các nhóm đối tác
            </h4>
            <span className="text-[10px] font-bold text-slate-400">
              Kéo thả icon để đổi thứ tự
            </span>
          </div>

          {isLoadingPartners ? (
            <div className="space-y-2 py-4 animate-pulse">
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-none" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-none" />
            </div>
          ) : groupConfigs.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-white/10 p-4">
              <p className="text-xs font-bold uppercase text-slate-400">
                Chưa tìm thấy nhóm đối tác nào trong dữ liệu.
              </p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={groupConfigs.map((g) => g.key)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {groupConfigs.map((group, idx) => (
                    <SortableGroupRow
                      key={group.key}
                      group={group}
                      count={groupCounts[group.key] || 0}
                      onToggleVisible={(checked) => handleToggleVisible(idx, checked)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* 2. Cấu hình Bố cục Layout (Sidebar & Số cột) */}
        <div className="bg-white border border-slate-200 p-5 rounded-none space-y-4 dark:border-white/10 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-[#ed1c24]" />
              2. Cấu hình Bố cục (Sidebar & Số cột trên 1 hàng)
            </h4>
          </div>

          <div className="space-y-4">
            {/* Toggle Sidebar */}
            <div className="flex items-center justify-between border border-slate-200 bg-slate-50/60 dark:border-white/10 dark:bg-slate-950/40 p-3.5 rounded-none">
              <div className="flex items-center gap-2.5">
                <Sidebar className="h-4 w-4 text-[#ed1c24]" />
                <div>
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block cursor-pointer">
                    Sidebar nhóm bên trái
                  </Label>
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    Hiển thị cột danh sách chuyển nhanh nhóm đối tác ở bên trái (ScrollSpy).
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={showSidebar} onCheckedChange={(v) => updateKey("show_sidebar", v)} />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {showSidebar ? "Đang bật" : "Đang tắt"}
                </span>
              </div>
            </div>

            {/* Edit Sidebar Title */}
            {showSidebar && (
              <div>
                <Label className="text-[11px] font-bold uppercase text-slate-900 dark:text-white mb-1 block">
                  Tiêu đề Sidebar nhóm
                </Label>
                <Input
                  value={sidebarTitle}
                  onChange={(e) => updateKey("sidebar_title", e.target.value)}
                  placeholder="Nhóm đối tác"
                  className="h-9 rounded-none text-xs font-semibold"
                />
              </div>
            )}

            {/* Number of columns selector */}
            <div>
              <Label className="text-[11px] font-bold uppercase text-slate-900 dark:text-white mb-2 block">
                Số lượng đối tác trên 1 hàng (Số cột)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((colNum) => (
                  <button
                    key={colNum}
                    type="button"
                    onClick={() => updateKey("columns", colNum)}
                    className={`h-9 border rounded-none text-xs font-black uppercase tracking-wider transition-all ${columns === colNum
                        ? "bg-[#ed1c24] text-white border-[#ed1c24] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-white/10 dark:text-slate-300"
                      }`}
                  >
                    {colNum} cột
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
