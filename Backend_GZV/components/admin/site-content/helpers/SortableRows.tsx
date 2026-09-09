import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Eye, EyeOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { HomeSection, PageBlock } from "../types"

export function SortableHomeSectionRow({
  id,
  section,
  isSelected,
  onSelect,
  onToggleVisible,
  onDelete,
}: {
  id: string
  section: HomeSection
  isSelected: boolean
  onSelect: () => void
  onToggleVisible: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
    position: "relative",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 flex items-center justify-between border bg-white dark:bg-slate-900 transition-colors ${isSelected
        ? "border-[#ed1c24] bg-red-50/40 shadow-xs dark:border-[#ed1c24] dark:bg-red-950/20"
        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
        }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white touch-none select-none"
        title="Kéo thả để sắp xếp"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="flex-1 py-2 px-1 text-left text-xs font-bold truncate flex flex-col justify-center min-w-0"
      >
        <span className={`truncate uppercase font-black text-xs ${isSelected ? "text-[#ed1c24]" : "text-slate-800 dark:text-slate-200"}`}>
          {section.title || section.section_key}
        </span>
        <span className="text-[9px] font-mono text-slate-400 lowercase font-normal truncate">
          {section.section_key}
        </span>
      </button>

      <div className="flex items-center gap-1 pr-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={onToggleVisible}
          title={section.is_visible ? "Đang hiện" : "Đang ẩn"}
        >
          {section.is_visible ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-300" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={onDelete}
          title="Xóa section"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function SortableBuilderBlockRow({
  id,
  block,
  isSelected,
  onSelect,
  onToggleVisible,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  id: string
  block: PageBlock
  isSelected: boolean
  onSelect: () => void
  onToggleVisible: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
    position: "relative",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 flex items-center justify-between border bg-white dark:bg-slate-900 transition-colors ${isSelected
        ? "border-[#ed1c24] bg-red-50/40 shadow-xs dark:border-[#ed1c24] dark:bg-red-950/20"
        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
        }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white touch-none select-none"
        title="Kéo thả để sắp xếp"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="flex-1 py-2 px-1 text-left text-xs font-bold truncate flex flex-col justify-center min-w-0"
      >
        <span className={`truncate uppercase font-black text-xs ${isSelected ? "text-[#ed1c24]" : "text-slate-800 dark:text-slate-200"}`}>
          {block.title || block.component_type || "Section"}
        </span>
        <span className="text-[9px] font-mono text-slate-400 lowercase font-normal truncate">
          {block.component_type}
        </span>
      </button>

      <div className="flex items-center gap-1 pr-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={onToggleVisible}
          title={block.is_visible !== false ? "Đang hiện" : "Đang ẩn"}
        >
          {block.is_visible !== false ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-300" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-none text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={onDelete}
          title="Xóa section"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
