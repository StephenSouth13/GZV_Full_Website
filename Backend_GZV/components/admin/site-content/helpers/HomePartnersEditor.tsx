"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutTemplate, X, GripVertical, Plus, ArrowRight, ArrowLeft, Pause, Sparkles, Handshake } from "lucide-react"

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Component thẻ tag danh mục có thể kéo thả
function SortableTag({ id, label, onRemove }: { id: string; label: string; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-none text-xs font-bold border ${isDragging
          ? "bg-red-50/80 border-[#ed1c24] shadow-md text-[#ed1c24] scale-105"
          : "bg-white border-slate-200 text-slate-700 hover:border-[#ed1c24]/50 dark:bg-slate-900 dark:border-white/10 dark:text-slate-200"
        } transition-all duration-200 select-none`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#ed1c24] transition-colors"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className="truncate max-w-[150px] uppercase text-[11px]">{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(id)
        }}
        className="ml-1 text-slate-400 hover:text-red-600 transition-colors rounded-none hover:bg-red-50 dark:hover:bg-red-950/40 p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

interface MultiSelectGroupsProps {
  label: string
  subtitleNote: string
  selectedGroups: string[]
  allGroups: Array<{ key: string; label: string }>
  disabledGroups?: string[]
  onChange: (groups: string[]) => void
  direction: string
  onDirectionChange: (dir: string) => void
}

// Khối cấu hình cho từng hàng
function RowConfigBlock({
  label,
  subtitleNote,
  selectedGroups,
  allGroups,
  disabledGroups = [],
  onChange,
  direction,
  onDirectionChange,
}: MultiSelectGroupsProps) {
  const availableGroups = allGroups.filter(
    (g) => !selectedGroups.includes(g.key) && !disabledGroups.includes(g.key)
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = selectedGroups.indexOf(active.id as string)
      const newIndex = selectedGroups.indexOf(over.id as string)
      onChange(arrayMove(selectedGroups, oldIndex, newIndex))
    }
  }

  const getLabel = (key: string) => {
    const found = allGroups.find((g) => g.key === key)
    return found ? found.label : key.replace(/-/g, " ").toUpperCase()
  }

  return (
    <div className="flex flex-col md:flex-row md:items-stretch gap-4 p-4 bg-slate-50/70 border border-slate-200 rounded-none transition-all hover:border-[#ed1c24]/40 dark:bg-slate-900/40 dark:border-white/10">
      {/* Cột trái: Cài đặt hàng */}
      <div className="w-full md:w-[280px] shrink-0 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wide">{label}</Label>
            <span className="text-[10px] text-slate-400 font-semibold">{subtitleNote}</span>
          </div>
          <div className="h-1 w-8 bg-[#ed1c24] rounded-none mt-1 mb-3" />

          {/* Chọn Hướng trượt */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Hướng trượt</Label>
            <Select value={direction || "left"} onValueChange={onDirectionChange}>
              <SelectTrigger className="h-9 text-xs bg-white border-slate-200 focus:ring-red-200 shadow-2xs rounded-none font-semibold text-slate-900 dark:bg-slate-900 dark:border-white/10 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-slate-200 dark:border-white/10">
                <SelectItem value="still">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Pause className="h-3 w-3 text-slate-500" /> Đứng yên
                  </span>
                </SelectItem>
                <SelectItem value="left">
                  <span className="flex items-center gap-1.5 font-bold">
                    <ArrowLeft className="h-3 w-3 text-[#ed1c24]" /> Trượt sang trái
                  </span>
                </SelectItem>
                <SelectItem value="right">
                  <span className="flex items-center gap-1.5 font-bold">
                    Trượt sang phải <ArrowRight className="h-3 w-3 text-[#ed1c24]" />
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Thêm danh mục vào hàng</Label>
          <Select
            value=""
            onValueChange={(val) => {
              if (val) onChange([...selectedGroups, val])
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-red-50/50 border-red-200 hover:bg-red-50 transition-colors focus:ring-red-200 shadow-2xs font-bold text-[#ed1c24] rounded-none dark:bg-red-950/20 dark:border-red-900/30">
              <SelectValue placeholder="+ Thêm danh mục..." />
            </SelectTrigger>
            <SelectContent className="rounded-none border-slate-200 dark:border-white/10">
              {availableGroups.length === 0 ? (
                <SelectItem value="empty" disabled className="text-[11px] text-slate-400">
                  Không còn danh mục khả dụng
                </SelectItem>
              ) : (
                availableGroups.map((g) => (
                  <SelectItem key={g.key} value={g.key} className="text-xs font-semibold">
                    <span className="flex items-center gap-2">
                      <Plus className="h-3 w-3 text-[#ed1c24]" /> {g.label}
                    </span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cột phải: Vùng kéo thả thẻ danh mục */}
      <div className="flex-1 min-h-[120px] bg-white rounded-none border border-dashed border-slate-200 p-4 flex flex-wrap gap-2.5 items-start relative dark:bg-slate-900 dark:border-white/10">
        <span className="absolute top-2 right-3 text-[9px] font-bold text-slate-300 uppercase tracking-widest select-none dark:text-slate-600">
          Thứ tự danh mục
        </span>
        {selectedGroups.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 py-6">
            <LayoutTemplate className="h-6 w-6 mb-2 text-slate-300 stroke-1" />
            <span className="text-xs font-semibold italic">Hàng này đang trống (Chưa có danh mục nào)</span>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedGroups} strategy={rectSortingStrategy}>
              {selectedGroups.map((gKey) => (
                <SortableTag
                  key={gKey}
                  id={gKey}
                  label={getLabel(gKey)}
                  onRemove={(idToRemove) => {
                    onChange(selectedGroups.filter((g) => g !== idToRemove))
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

interface HomePartnersEditorProps {
  settings: any
  updateSectionSettings: (patch: Record<string, any>) => void
  title: string
  subtitle: string
  onTitleChange: (title: string) => void
  onSubtitleChange: (subtitle: string) => void
}

const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  "don-vi-chi-dao": "ĐƠN VỊ CHỈ ĐẠO THỰC HIỆN",
  "doi-tac-dong-hanh": "ĐỐI TÁC ĐỒNG HÀNH",
  "dai-hoc-cao-dang": "ĐẠI HỌC / CAO ĐẲNG",
  "don-vi-bao-tro": "ĐƠN VỊ BẢO TRỢ",
  "don-vi-thuc-hien": "ĐƠN VỊ THỰC HIỆN",
  "doi-tac-khac": "ĐỐI TÁC KHÁC",
}

export function HomePartnersEditor({
  settings = {},
  updateSectionSettings,
  title,
  subtitle,
  onTitleChange,
  onSubtitleChange,
}: HomePartnersEditorProps) {
  const [allGroups, setAllGroups] = useState<Array<{ key: string; label: string }>>([])

  useEffect(() => {
    let active = true
    supabase
      .from("partners")
      .select("category")
      .eq("is_active", true)
      .then(({ data, error }) => {
        if (!active || error || !data) return

        const foundKeys = new Set<string>()
        const dynamicGroups: Array<{ key: string; label: string }> = []

        data.forEach((p: any) => {
          const rawCat = (p.category || "").trim()
          const cat = rawCat || "doi-tac-khac"
          if (!foundKeys.has(cat)) {
            foundKeys.add(cat)
            dynamicGroups.push({
              key: cat,
              label: DEFAULT_CATEGORY_LABELS[cat] || cat.replace(/-/g, " ").toUpperCase(),
            })
          }
        })

        setAllGroups(dynamicGroups)
      })

    return () => {
      active = false
    }
  }, [])

  const row1Groups: string[] = settings.row1_groups || (settings.row1_group ? [settings.row1_group] : [])
  const row2Groups: string[] = settings.row2_groups || (settings.row2_group ? [settings.row2_group] : [])
  const row3Groups: string[] = settings.row3_groups || (settings.row3_group ? [settings.row3_group] : [])

  return (
    <div className="space-y-6 select-none">
      <Card className="border-slate-200 dark:border-white/10 rounded-none shadow-2xs bg-white dark:bg-slate-900">
        <CardHeader className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/40">
          <CardTitle className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <Handshake className="h-4 w-4 text-[#ed1c24]" />
            Cấu hình Marquee Đối Tác & Nhà Tài Trợ Trang Chủ
          </CardTitle>
          <CardDescription className="text-xs font-medium text-slate-500">
            Thiết lập tiêu đề, danh mục và hướng trượt cho từng hàng marquee
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-5">    
          {/* 3 Hàng Cấu hình Marquee */}
          <div className="space-y-4">
            <RowConfigBlock
              label="Hàng 1 (Logo To)"
              subtitleNote="Kích thước ô: 197 × 210px"
              selectedGroups={row1Groups}
              allGroups={allGroups}
              disabledGroups={[...row2Groups, ...row3Groups]}
              onChange={(groups) => updateSectionSettings({ row1_groups: groups })}
              direction={settings.row1_dir || "still"}
              onDirectionChange={(val) => updateSectionSettings({ row1_dir: val })}
            />

            <RowConfigBlock
              label="Hàng 2 (Logo Vừa)"
              subtitleNote="Kích thước ô: 148 × 158px"
              selectedGroups={row2Groups}
              allGroups={allGroups}
              disabledGroups={[...row1Groups, ...row3Groups]}
              onChange={(groups) => updateSectionSettings({ row2_groups: groups })}
              direction={settings.row2_dir || "left"}
              onDirectionChange={(val) => updateSectionSettings({ row2_dir: val })}
            />

            <RowConfigBlock
              label="Hàng 3 (Logo Nhỏ)"
              subtitleNote="Kích thước ô: 148 × 158px"
              selectedGroups={row3Groups}
              allGroups={allGroups}
              disabledGroups={[...row1Groups, ...row2Groups]}
              onChange={(groups) => updateSectionSettings({ row3_groups: groups })}
              direction={settings.row3_dir || "right"}
              onDirectionChange={(val) => updateSectionSettings({ row3_dir: val })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
