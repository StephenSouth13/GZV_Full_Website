"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Eye, EyeOff, GripVertical, Lock, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SortableNavRowProps {
  id: string | number
  item: any
  idx: number
  onEdit: () => void
  onDelete?: () => void
  onToggleVisible: () => void
  onGoToSection?: () => void
}

export function SortableNavRow({
  id,
  item,
  idx,
  onEdit,
  onDelete,
  onToggleVisible,
  onGoToSection,
}: SortableNavRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 1,
    position: "relative",
    touchAction: "none",
  }

  const DEFAULT_SYSTEM_HREFS = [
    "/",
    "/gioi-thieu",
    "/dich-vu",
    "/dich-vu/marketing",
    "/cua-hang",
    "/du-an",
    "/gzver",
    "/doi-tac",
    "/tin-tuc",
    "/lien-he",
  ]

  const isHome = item.href === "/"
  const isDefaultPage = isHome || DEFAULT_SYSTEM_HREFS.includes(item.href) || DEFAULT_SYSTEM_HREFS.includes(item.href?.split("#")[0])
  const childrenCount = item.children?.length || 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between gap-3 border bg-white p-3 shadow-xs transition-shadow dark:bg-slate-900 ${isDragging
          ? "border-[#ed1c24] shadow-lg ring-2 ring-[#ed1c24]/20"
          : item.is_visible
            ? "border-slate-200 dark:border-white/10"
            : "border-slate-200/60 bg-slate-50/50 opacity-60 dark:border-white/5 dark:bg-slate-950/40"
        }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-400 hover:text-[#ed1c24] active:cursor-grabbing dark:hover:text-[#ed1c24] p-1.5 touch-none select-none"
          aria-label="Kéo thả sắp xếp"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <span className="flex h-6 w-6 items-center justify-center bg-slate-100 text-[10px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0">
          {idx + 1}
        </span>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wide text-slate-900 dark:text-white truncate">
              {item.label_vi || item.label || "KHOẢNG TRẮNG"}
            </span>

            {item.label_en && (
              <span className="text-[10px] font-bold uppercase text-slate-400 truncate">
                ({item.label_en})
              </span>
            )}

            {isHome ? (
              <Badge variant="outline" className="rounded-none text-[9px] font-bold uppercase py-0 px-1.5 border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" /> Trang chủ cố định
              </Badge>
            ) : isDefaultPage ? (
              <Badge variant="outline" className="rounded-none text-[9px] font-bold uppercase py-0 px-1.5 border-slate-300 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" /> Trang mặc định
              </Badge>
            ) : null}

            {childrenCount > 0 && (
              <Badge variant="secondary" className="rounded-none text-[9px] font-black uppercase py-0 px-1.5 bg-red-50 text-[#ed1c24] dark:bg-red-950/40 dark:text-red-400">
                {childrenCount} menu con
              </Badge>
            )}

            {item.is_external && (
              <Badge variant="outline" className="rounded-none text-[9px] font-bold uppercase py-0 px-1.5 border-slate-300 text-slate-500">
                Link ngoài
              </Badge>
            )}
          </div>

          <p className="font-mono text-[10px] font-medium text-slate-400 truncate">
            {item.href || "#"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          title="Chỉnh sửa chi tiết menu này"
          className="h-8 px-2.5 rounded-none border-[#ed1c24] text-[#ed1c24] text-[10px] font-black uppercase hover:bg-[#ed1c24] hover:text-white transition"
        >
          Sửa
        </Button>

        {onGoToSection && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onGoToSection}
            title={isHome ? "Sửa các Section Trang chủ" : "Sửa các Section & Block của trang này"}
            className="h-8 p-1.5 rounded-none text-slate-500 hover:bg-slate-100 text-[10px] font-bold uppercase dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Section
          </Button>
        )}

        {!isHome && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleVisible}
              title={item.is_visible ? "Đang hiện (Bấm để ẩn)" : "Đang ẩn (Bấm để hiện)"}
              className={`h-8 w-8 p-0 rounded-none ${item.is_visible
                  ? "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              {item.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>

            {!isDefaultPage && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDelete}
                title="Xóa menu custom"
                className="h-8 w-8 p-0 rounded-none text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
