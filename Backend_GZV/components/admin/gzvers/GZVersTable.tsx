"use client"

import React, { useState } from "react"
import {
  Edit2,
  Trash2,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react"
import { OrderNumberInput } from "@/components/admin/OrderNumberInput"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

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
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface GZVersTableProps {
  gzvers: any[]
  onEdit: (gzver: any) => void
  onDelete: (gzver: any) => void
  onToggleStatus?: (gzver: any, nextStatus: boolean) => void
  onReorder?: (reorderedGzvers: any[]) => void
  onOrderChange?: (gzverId: string, newOrder: number) => void
}

export function GZVersTable({
  gzvers,
  onEdit,
  onDelete,
  onToggleStatus,
  onReorder,
  onOrderChange,
}: GZVersTableProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<"order" | "name" | "department" | "active">("order")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

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

  const getItemId = (item: any, idx: number) => String(item.id || item.slug || `gzver-${idx}`)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)
    if (!over || active.id === over.id) return

    const oldIndex = gzvers.findIndex((item, idx) => getItemId(item, idx) === active.id)
    const newIndex = gzvers.findIndex((item, idx) => getItemId(item, idx) === over.id)

    if (oldIndex !== -1 && newIndex !== -1 && onReorder) {
      const reordered = arrayMove(gzvers, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: (idx + 1) * 10,
      }))
      onReorder(reordered)
    }
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0 || !onReorder) return
    const reordered = arrayMove(gzvers, index, index - 1).map((item, idx) => ({
      ...item,
      order: (idx + 1) * 10,
    }))
    onReorder(reordered)
  }

  const handleMoveDown = (index: number) => {
    if (index >= gzvers.length - 1 || !onReorder) return
    const reordered = arrayMove(gzvers, index, index + 1).map((item, idx) => ({
      ...item,
      order: (idx + 1) * 10,
    }))
    onReorder(reordered)
  }

  const toggleHeaderSort = (field: "order" | "name" | "department" | "active") => {
    let nextDir: "asc" | "desc" = "asc"
    if (sortField === field) {
      nextDir = sortDir === "asc" ? "desc" : "asc"
    }
    setSortField(field)
    setSortDir(nextDir)

    if (!onReorder) return

    const sorted = [...gzvers].sort((a, b) => {
      let valA: any
      let valB: any

      if (field === "order") {
        valA = a.order ?? 0
        valB = b.order ?? 0
      } else if (field === "name") {
        valA = (a.full_name || "").toLowerCase()
        valB = (b.full_name || "").toLowerCase()
      } else if (field === "department") {
        valA = (a.gzver_departments?.name || a.department_name || "").toLowerCase()
        valB = (b.gzver_departments?.name || b.department_name || "").toLowerCase()
      } else if (field === "active") {
        valA = a.is_active ? 1 : 0
        valB = b.is_active ? 1 : 0
      }

      if (valA < valB) return nextDir === "asc" ? -1 : 1
      if (valA > valB) return nextDir === "asc" ? 1 : -1
      return 0
    })

    const reordered = sorted.map((item, idx) => ({
      ...item,
      order: (idx + 1) * 10,
    }))

    onReorder(reordered)
  }

  const activeDraggedItem = activeDragId
    ? gzvers.find((item, idx) => getItemId(item, idx) === activeDragId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto w-full min-w-0 border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-950/60">
            <TableRow className="border-slate-200 hover:bg-transparent dark:border-white/10">
              <TableHead className="w-[120px] py-3.5 pl-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <button
                  type="button"
                  onClick={() => toggleHeaderSort("order")}
                  className="flex items-center gap-1 hover:text-[#ed1c24] transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="h-3 w-3" /> Thứ tự
                </button>
              </TableHead>
              <TableHead className="w-[260px] py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <button
                  type="button"
                  onClick={() => toggleHeaderSort("name")}
                  className="flex items-center gap-1 hover:text-[#ed1c24] transition-colors cursor-pointer"
                >
                  Thành viên
                </button>
              </TableHead>
              <TableHead className="w-[170px] text-[10px] font-black uppercase tracking-wider text-slate-500">
                <button
                  type="button"
                  onClick={() => toggleHeaderSort("department")}
                  className="flex items-center gap-1 hover:text-[#ed1c24] transition-colors cursor-pointer"
                >
                  Phân Ban
                </button>
              </TableHead>
              <TableHead className="w-[200px] text-[10px] font-black uppercase tracking-wider text-slate-500">
                Chức vụ & Đơn vị
              </TableHead>
              <TableHead className="w-[110px] text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                Hồ sơ CV
              </TableHead>
              <TableHead className="w-[130px] text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                <button
                  type="button"
                  onClick={() => toggleHeaderSort("active")}
                  className="flex items-center justify-center gap-1 w-full hover:text-[#ed1c24] transition-colors cursor-pointer"
                >
                  Trạng thái
                </button>
              </TableHead>
              <TableHead className="w-[140px] pr-5 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {gzvers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  Không tìm thấy nhân sự nào trong bộ lọc hiện tại
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext
                items={gzvers.map((item, idx) => getItemId(item, idx))}
                strategy={verticalListSortingStrategy}
              >
                {gzvers.map((gzver, index) => (
                  <SortableGZVerRow
                    key={getItemId(gzver, index)}
                    rowId={getItemId(gzver, index)}
                    gzver={gzver}
                    index={index}
                    totalCount={gzvers.length}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onOrderChange={onOrderChange}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                  />
                ))}
              </SortableContext>
            )}
          </TableBody>
        </Table>

        <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeDraggedItem ? (
            <div className="flex items-center gap-4 border-2 border-[#ed1c24] bg-white p-3 shadow-2xl dark:bg-slate-900 opacity-95 rounded-none min-w-[500px]">
              <div className="flex items-center gap-2 shrink-0">
                <GripVertical className="h-4 w-4 text-[#ed1c24]" />
                <span className="flex h-6 w-8 items-center justify-center bg-[#ed1c24] text-white font-mono text-xs font-black">
                  {activeDraggedItem.order ?? 0}
                </span>
              </div>

              <Avatar className="h-10 w-10 rounded-none border border-slate-200 shrink-0">
                <AvatarImage src={activeDraggedItem.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-slate-800 text-xs font-bold text-white">
                  {activeDraggedItem.full_name?.charAt(0) || "G"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white truncate">
                  {activeDraggedItem.full_name}
                </h4>
                <p className="text-[10px] font-bold text-slate-400">
                  {activeDraggedItem.position || "Thành viên"} • {activeDraggedItem.department_name || activeDraggedItem.gzver_departments?.name || "GZV"}
                </p>
              </div>

              <span className="px-2 py-1 bg-red-100 text-[#ed1c24] font-mono text-[10px] font-black uppercase shrink-0">
                Đang di chuyển...
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

function SortableGZVerRow({
  rowId,
  gzver,
  index,
  totalCount,
  onEdit,
  onDelete,
  onToggleStatus,
  onOrderChange,
  onMoveUp,
  onMoveDown,
}: {
  rowId: string
  gzver: any
  index: number
  totalCount: number
  onEdit: (gzver: any) => void
  onDelete: (gzver: any) => void
  onToggleStatus?: (gzver: any, nextStatus: boolean) => void
  onOrderChange?: (gzverId: string, newOrder: number) => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rowId })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    position: "relative",
    zIndex: isDragging ? 20 : 1,
  }

  const department = gzver.gzver_departments?.name || gzver.department_name || "Chưa gán ban"

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`border-slate-200 transition-colors dark:border-white/10 ${
        isDragging
          ? "bg-red-50/50 dark:bg-red-950/20 border-dashed border-[#ed1c24]"
          : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
      }`}
    >
      {/* Column 0: Reorder Controls (Drag Handle + Up/Down + Order Input) */}
      <TableCell className="py-2.5 pl-4">
        <div className="flex items-center gap-1.5">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-[#ed1c24] hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
            title="Kéo thả để thay đổi vị trí thứ tự"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Up & Down arrow buttons */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              disabled={index === 0}
              onClick={onMoveUp}
              className="p-0.5 text-slate-400 hover:text-[#ed1c24] disabled:opacity-20 disabled:hover:text-slate-400 transition-colors cursor-pointer"
              title="Di chuyển lên"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              disabled={index === totalCount - 1}
              onClick={onMoveDown}
              className="p-0.5 text-slate-400 hover:text-[#ed1c24] disabled:opacity-20 disabled:hover:text-slate-400 transition-colors cursor-pointer"
              title="Di chuyển xuống"
            >
              <ArrowDown className="h-3 w-3" />
            </button>
          </div>

          {/* Order Input */}
          <div className="relative">
            <OrderNumberInput
              value={gzver.order ?? (index + 1) * 10}
              onCommit={(val) => {
                if (onOrderChange && gzver.id) onOrderChange(gzver.id, val)
              }}
              className="h-7 w-14 rounded-none border-slate-200 bg-white px-1.5 text-center font-mono text-xs font-bold text-slate-900 shadow-2xs focus:border-[#ed1c24] focus:ring-[#ed1c24] dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>
      </TableCell>

      {/* Column 1: Member Avatar & Info */}
      <TableCell className="py-2.5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-none border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-800">
            <AvatarImage src={gzver.avatar_url} className="object-cover" />
            <AvatarFallback className="rounded-none bg-slate-800 text-xs font-black text-white">
              {gzver.full_name ? gzver.full_name.charAt(0) : "G"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white truncate">
              {gzver.full_name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-slate-400 truncate">/{gzver.slug}</span>
            </div>
          </div>
        </div>
      </TableCell>

      {/* Column 2: Department */}
      <TableCell className="py-2.5">
        <div className="inline-flex items-center border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-slate-950">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200 truncate">
            {department}
          </span>
        </div>
      </TableCell>

      {/* Column 3: Role & Company */}
      <TableCell className="py-2.5">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
            {gzver.position || "Thành viên"}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate">
            {gzver.company || "GZV"}
          </span>
        </div>
      </TableCell>

      {/* Column 4: CV */}
      <TableCell className="py-2.5 text-center">
        {gzver.cv_url ? (
          <a
            href={gzver.cv_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 border border-emerald-500/30 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <CheckCircle2 size={11} /> Có CV ↗
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:border-white/10 dark:bg-slate-800">
            <AlertCircle size={11} /> Chưa có
          </span>
        )}
      </TableCell>

      {/* Column 5: Status Toggle */}
      <TableCell className="py-2.5 text-center">
        {onToggleStatus ? (
          <div className="inline-flex items-center gap-2">
            <Switch
              checked={gzver.is_active}
              onCheckedChange={(checked) => onToggleStatus(gzver, checked)}
            />
            <span
              className={`text-[10px] font-black uppercase ${
                gzver.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
              }`}
            >
              {gzver.is_active ? "Hiện" : "Ẩn"}
            </span>
          </div>
        ) : (
          <span
            className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              gzver.is_active
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-slate-100 text-slate-400 dark:bg-slate-800"
            }`}
          >
            {gzver.is_active ? "Hiển thị" : "Đang ẩn"}
          </span>
        )}
      </TableCell>

      {/* Column 6: Actions */}
      <TableCell className="py-2.5 pr-5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(gzver)}
            className="h-8 rounded-none border-slate-200 px-2.5 text-[11px] font-black uppercase tracking-wider text-slate-700 hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/10 dark:text-slate-200"
          >
            <Edit2 className="mr-1 h-3 w-3" /> Sửa
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-none border-slate-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              {gzver.cv_url && (
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer rounded-none py-2 text-xs font-bold focus:bg-emerald-600 focus:text-white"
                >
                  <a href={gzver.cv_url} target="_blank" rel="noreferrer">
                    <FileText size={13} className="mr-2" /> Mở xem CV
                  </a>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-none py-2 text-xs font-bold focus:bg-slate-100 dark:focus:bg-slate-800"
              >
                <a href={`/gzver/${gzver.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink size={13} className="mr-2" /> Xem trang Public ↗
                </a>
              </DropdownMenuItem>

              <div className="my-1 h-px bg-slate-200 dark:bg-white/10" />

              <DropdownMenuItem
                onClick={() => onDelete(gzver)}
                className="cursor-pointer rounded-none py-2 text-xs font-bold text-red-600 focus:bg-red-600 focus:text-white dark:text-red-400"
              >
                <Trash2 size={13} className="mr-2" /> Xóa nhân sự
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}
