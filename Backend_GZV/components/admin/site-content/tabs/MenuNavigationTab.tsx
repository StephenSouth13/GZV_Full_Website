import React from "react"
import { DndContext, closestCenter, type SensorDescriptor, type SensorOptions } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { LayoutTemplate, Plus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { NavItem } from "../types"
import { SortableNavRow } from "../SortableNavRow"

export function MenuNavigationTab({
  navItems,
  sensors,
  onDragEnd,
  onAddNavItem,
  onEditNavItem,
  onDeleteNavItem,
  onToggleNavVisible,
  onGoToPageSections,
  onSaveNavigation,
  saving,
}: {
  navItems: NavItem[]
  sensors: SensorDescriptor<SensorOptions>[]
  onDragEnd: (event: any) => void
  onAddNavItem: () => void
  onEditNavItem: (index: number) => void
  onDeleteNavItem: (index: number) => void
  onToggleNavVisible: (index: number) => void
  onGoToPageSections: (href: string) => void
  onSaveNavigation: () => void
  saving: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-none border border-slate-200 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-[#ed1c24] shrink-0" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Cấu trúc Menu Điều Hướng
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddNavItem}
            className="h-8 px-3 rounded-none text-[10px] font-black uppercase border-slate-200 text-slate-900 dark:border-white/10 dark:text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1 text-[#ed1c24]" /> Thêm menu chính
          </Button>
          <Button
            size="sm"
            onClick={onSaveNavigation}
            disabled={saving}
            className="h-8 px-3.5 rounded-none text-[10px] font-black uppercase bg-[#ed1c24] text-white hover:bg-[#c91218]"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? "Đang lưu..." : "Lưu thay đổi Menu"}
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={navItems.map((i) => String(i.id || i.href))} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {navItems.map((item, idx) => (
                <SortableNavRow
                  key={item.id || item.href || idx}
                  id={String(item.id || item.href || idx)}
                  item={item}
                  idx={idx}
                  onEdit={() => onEditNavItem(idx)}
                  onDelete={() => onDeleteNavItem(idx)}
                  onToggleVisible={() => onToggleNavVisible(idx)}
                  onGoToSection={() => onGoToPageSections(item.href)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
