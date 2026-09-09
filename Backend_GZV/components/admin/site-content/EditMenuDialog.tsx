"use client"

import React, { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GripVertical, Plus, Trash2 } from "lucide-react"

interface EditMenuDialogProps {
  isOpen: boolean
  onClose: () => void
  item: any
  onSave: (updatedItem: any) => void
}

function SortableChildRow({ id, child, index, onUpdate, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 border border-slate-200 bg-slate-50 p-2 text-xs dark:border-white/10 dark:bg-slate-900"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Input
        value={child.label_vi || child.label || ""}
        onChange={(e) => onUpdate(index, { label_vi: e.target.value, label: e.target.value })}
        placeholder="Tên menu con (VI)"
        className="h-8 text-xs rounded-none border-slate-200 dark:border-white/10"
      />

      <Input
        value={child.href || ""}
        onChange={(e) => onUpdate(index, { href: e.target.value })}
        placeholder="/du-an/sub-path"
        className="h-8 font-mono text-xs rounded-none border-slate-200 dark:border-white/10"
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onDelete(index)}
        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function EditMenuDialog({ isOpen, onClose, item, onSave }: EditMenuDialogProps) {
  const [formData, setFormData] = useState<any>(item || {})

  React.useEffect(() => {
    setFormData(item || {})
  }, [item])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!item) return null

  const children = formData.children || []

  const handleAddChild = () => {
    const newChild = {
      id: `child-${Date.now()}`,
      href: `${formData.href || "/link"}/sub-${children.length + 1}`,
      label_vi: "Menu con mới",
      label_en: "New sub menu",
      sort_order: (children.length + 1) * 10,
      is_visible: true,
    }
    setFormData({ ...formData, children: [...children, newChild] })
  }

  const handleUpdateChild = (index: number, patch: any) => {
    const updated = children.map((c: any, idx: number) => (idx === index ? { ...c, ...patch } : c))
    setFormData({ ...formData, children: updated })
  }

  const handleDeleteChild = (index: number) => {
    const updated = children.filter((_: any, idx: number) => idx !== index)
    setFormData({ ...formData, children: updated })
  }

  const handleChildDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = children.findIndex((c: any) => (c.id || c.href) === active.id)
    const newIndex = children.findIndex((c: any) => (c.id || c.href) === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newChildren = [...children]
    const [removed] = newChildren.splice(oldIndex, 1)
    newChildren.splice(newIndex, 0, removed)
    setFormData({ ...formData, children: newChildren })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-none border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase text-slate-900 dark:text-white">
            Chỉnh sửa Menu: <span className="text-[#ed1c24]">{formData.label_vi || formData.label}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Tên Tiếng Việt</Label>
              <Input
                value={formData.label_vi || formData.label || ""}
                onChange={(e) => setFormData({ ...formData, label_vi: e.target.value, label: e.target.value })}
                placeholder="Ví dụ: GIỚI THIỆU"
                className="h-9 text-xs rounded-none border-slate-200 dark:border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Tên Tiếng Anh (nếu có)</Label>
              <Input
                value={formData.label_en || ""}
                onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                placeholder="Ví dụ: ABOUT"
                className="h-9 text-xs rounded-none border-slate-200 dark:border-white/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Đường dẫn URL (href)</Label>
            <Input
              value={formData.href || ""}
              onChange={(e) => setFormData({ ...formData, href: e.target.value })}
              placeholder="/gioi-thieu hoặc https://..."
              className="h-9 font-mono text-xs rounded-none border-slate-200 dark:border-white/10"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-white/10">
            <div>
              <Label className="text-xs font-bold">Mở trong tab mới (External Link)</Label>
              <p className="text-[10px] text-slate-400">Bật nếu đây là liên kết dẫn tới trang bên ngoài</p>
            </div>
            <Switch
              checked={!!formData.is_external}
              onCheckedChange={(val) => setFormData({ ...formData, is_external: val })}
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-white/10">
            <div>
              <Label className="text-xs font-bold">Hiển thị trên thanh điều hướng</Label>
              <p className="text-[10px] text-slate-400">Ẩn nếu muốn tạm thời không cho xem trên website</p>
            </div>
            <Switch
              checked={formData.is_visible !== false}
              onCheckedChange={(val) => setFormData({ ...formData, is_visible: val })}
            />
          </div>

          {/* Sub-menus Section */}
          <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-white/10">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-black uppercase text-slate-900 dark:text-white">
                Danh sách Menu con ({children.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddChild}
                className="h-7 text-[10px] font-black uppercase rounded-none border-slate-200 dark:border-white/10"
              >
                <Plus className="h-3.5 w-3.5 mr-1 text-[#ed1c24]" /> Thêm menu con
              </Button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChildDragEnd}>
                <SortableContext
                  items={children.map((c: any) => c.id || c.href)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1.5">
                    {children.map((child: any, idx: number) => (
                      <SortableChildRow
                        key={child.id || child.href || idx}
                        id={child.id || child.href || idx}
                        child={child}
                        index={idx}
                        onUpdate={handleUpdateChild}
                        onDelete={handleDeleteChild}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {children.length === 0 && (
                <p className="py-4 text-center text-xs italic text-slate-400">Chưa có menu con nào.</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-200 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-none border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-300"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218]"
            >
              Cập nhật Menu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
