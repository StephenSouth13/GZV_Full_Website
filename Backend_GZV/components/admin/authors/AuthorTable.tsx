"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Edit2, Trash2, MoreHorizontal, GripVertical, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { OrderNumberInput } from "@/components/admin/OrderNumberInput"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

interface AuthorTableProps {
  authors: any[]
  onEdit: (author: any) => void
  onDelete: (author: any) => void
  onReorder?: (reorderedAuthors: any[]) => void
  onOrderChange?: (authorId: string, newOrder: number) => void
}

export function AuthorTable({
  authors,
  onEdit,
  onDelete,
  onReorder,
  onOrderChange,
}: AuthorTableProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<"order" | "name" | "title" | "slug">("order")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const getItemId = (item: any, idx: number) => String(item.id || item.slug || `author-${idx}`)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)
    if (!over || active.id === over.id) return

    const oldIndex = authors.findIndex((item, idx) => getItemId(item, idx) === active.id)
    const newIndex = authors.findIndex((item, idx) => getItemId(item, idx) === over.id)

    if (oldIndex !== -1 && newIndex !== -1 && onReorder) {
      const reordered = arrayMove(authors, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        sort_order: (idx + 1) * 10,
      }))
      onReorder(reordered)
    }
  }

  const handleMoveUp = (index: number) => {
    if (index <= 0 || !onReorder) return
    const reordered = arrayMove(authors, index, index - 1).map((item, idx) => ({
      ...item,
      sort_order: (idx + 1) * 10,
    }))
    onReorder(reordered)
  }

  const handleMoveDown = (index: number) => {
    if (index >= authors.length - 1 || !onReorder) return
    const reordered = arrayMove(authors, index, index + 1).map((item, idx) => ({
      ...item,
      sort_order: (idx + 1) * 10,
    }))
    onReorder(reordered)
  }

  const toggleHeaderSort = (field: "order" | "name" | "title" | "slug") => {
    let nextDir: "asc" | "desc" = "asc"
    if (sortField === field) {
      nextDir = sortDir === "asc" ? "desc" : "asc"
    }
    setSortField(field)
    setSortDir(nextDir)

    if (!onReorder) return

    const sorted = [...authors].sort((a, b) => {
      let valA: any
      let valB: any

      if (field === "order") {
        valA = a.sort_order ?? a.order ?? 0
        valB = b.sort_order ?? b.order ?? 0
      } else if (field === "name") {
        valA = (a.full_name || "").toLowerCase()
        valB = (b.full_name || "").toLowerCase()
      } else if (field === "title") {
        valA = (a.title || "").toLowerCase()
        valB = (b.title || "").toLowerCase()
      } else if (field === "slug") {
        valA = (a.slug || "").toLowerCase()
        valB = (b.slug || "").toLowerCase()
      }

      if (valA < valB) return nextDir === "asc" ? -1 : 1
      if (valA > valB) return nextDir === "asc" ? 1 : -1
      return 0
    })

    const reordered = sorted.map((item, idx) => ({
      ...item,
      sort_order: (idx + 1) * 10,
    }))

    onReorder(reordered)
  }

  const activeDraggedItem = activeDragId
    ? authors.find((item, idx) => getItemId(item, idx) === activeDragId)
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
              <TableHead className="py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-500 w-[260px]">
                <button
                  type="button"
                  onClick={() => toggleHeaderSort("name")}
                  className="flex items-center gap-1 hover:text-[#ed1c24] transition-colors cursor-pointer"
                >
                  Tác giả / Biên tập viên
                </button>
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-500 w-[220px]">
                <button
                  type="button"
                  onClick={() => toggleHeaderSort("title")}
                  className="flex items-center gap-1 hover:text-[#ed1c24] transition-colors cursor-pointer"
                >
                  Chức danh
                </button>
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                <button
                  type="button"
                  onClick={() => toggleHeaderSort("slug")}
                  className="flex items-center gap-1 hover:text-[#ed1c24] transition-colors cursor-pointer"
                >
                  Đường dẫn tĩnh (Slug)
                </button>
              </TableHead>
              <TableHead className="text-right pr-5 text-[10px] font-black uppercase tracking-wider text-slate-500 w-[140px]">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {authors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  Chưa có tác giả nào trong danh sách
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext
                items={authors.map((item, idx) => getItemId(item, idx))}
                strategy={verticalListSortingStrategy}
              >
                {authors.map((author, index) => (
                  <SortableAuthorRow
                    key={getItemId(author, index)}
                    rowId={getItemId(author, index)}
                    author={author}
                    index={index}
                    totalCount={authors.length}
                    onEdit={onEdit}
                    onDelete={onDelete}
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
            <div className="flex items-center gap-4 border-2 border-[#ed1c24] bg-white p-3 shadow-2xl dark:bg-slate-900 opacity-95 rounded-none min-w-[450px]">
              <div className="flex items-center gap-2 shrink-0">
                <GripVertical className="h-4 w-4 text-[#ed1c24]" />
                <span className="flex h-6 w-8 items-center justify-center bg-[#ed1c24] text-white font-mono text-xs font-black">
                  {activeDraggedItem.sort_order ?? activeDraggedItem.order ?? 0}
                </span>
              </div>

              <Avatar className="h-10 w-10 rounded-none border border-slate-200 shrink-0">
                <AvatarImage src={activeDraggedItem.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-slate-800 text-xs font-bold text-white">
                  {activeDraggedItem.full_name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white truncate">
                  {activeDraggedItem.full_name}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 truncate">
                  {activeDraggedItem.title || "Biên tập viên"} • /{activeDraggedItem.slug}
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

function SortableAuthorRow({
  rowId,
  author,
  index,
  totalCount,
  onEdit,
  onDelete,
  onOrderChange,
  onMoveUp,
  onMoveDown,
}: {
  rowId: string
  author: any
  index: number
  totalCount: number
  onEdit: (author: any) => void
  onDelete: (author: any) => void
  onOrderChange?: (authorId: string, newOrder: number) => void
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
          <button
            {...attributes}
            {...listeners}
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-[#ed1c24] hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
            title="Kéo thả để di chuyển thứ tự"
          >
            <GripVertical className="h-4 w-4" />
          </button>

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

          <div className="relative">
            <OrderNumberInput
              value={author.sort_order ?? author.order ?? (index + 1) * 10}
              onCommit={(val) => {
                if (onOrderChange && author.id) onOrderChange(author.id, val)
              }}
              className="h-7 w-14 rounded-none border-slate-200 bg-white px-1.5 text-center font-mono text-xs font-bold text-slate-900 shadow-2xs focus:border-[#ed1c24] focus:ring-[#ed1c24] dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>
      </TableCell>

      {/* Column 1: Author Avatar & Name */}
      <TableCell className="py-2.5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-none border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-800">
            <AvatarImage src={author.avatar_url} className="object-cover" />
            <AvatarFallback className="rounded-none bg-slate-800 text-xs font-black text-white">
              {author.full_name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white truncate">
              {author.full_name}
            </h4>
            {author.email && (
              <p className="text-[10px] font-mono text-slate-400 truncate">{author.email}</p>
            )}
          </div>
        </div>
      </TableCell>

      {/* Column 2: Title */}
      <TableCell className="py-2.5">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block">
          {author.title || "Biên tập viên"}
        </span>
      </TableCell>

      {/* Column 3: Slug */}
      <TableCell className="py-2.5">
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 inline-block truncate max-w-[200px]">
          /{author.slug}
        </span>
      </TableCell>

      {/* Column 4: Actions */}
      <TableCell className="py-2.5 pr-5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(author)}
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
              className="w-40 rounded-none border-slate-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-slate-950 dark:text-white"
            >
              <DropdownMenuItem
                onClick={() => onEdit(author)}
                className="cursor-pointer rounded-none py-2 text-xs font-bold focus:bg-slate-100 dark:focus:bg-slate-800"
              >
                <Edit2 size={13} className="mr-2" /> Chỉnh sửa
              </DropdownMenuItem>

              <div className="my-1 h-px bg-slate-200 dark:bg-white/10" />

              <DropdownMenuItem
                onClick={() => onDelete(author)}
                className="cursor-pointer rounded-none py-2 text-xs font-bold text-red-600 focus:bg-red-600 focus:text-white dark:text-red-400"
              >
                <Trash2 size={13} className="mr-2" /> Xóa tác giả
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}