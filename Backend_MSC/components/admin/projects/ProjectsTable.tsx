"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Edit3, Trash2, Star, Image as ImageIcon } from "lucide-react"
import { toast } from '@/hooks/use-toast'

function SortableRow({ p, stt, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      className={`group transition-all border-slate-50 ${isDragging ? 'bg-blue-50/50 shadow-2xl ring-1 ring-blue-200' : 'hover:bg-slate-50/80'}`}
    >
      <TableCell className="w-[50px]">
        <button 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-blue-600 transition-colors"
        >
          <GripVertical size={20} />
        </button>
      </TableCell>
      
      <TableCell className="text-center font-black text-slate-400 italic text-xs w-[60px]">
        {stt < 10 ? `0${stt}` : stt}
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-4">
          {/* Preview Ảnh nhỏ để admin dễ nhận diện dự án */}
          <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
            {p.image ? (
              <img src={p.image} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <ImageIcon size={16} />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800 uppercase text-[13px] tracking-tight truncate leading-tight">
                {p.title}
              </span>
              {p.featured && (
                <div className="bg-amber-100 p-1 rounded-md">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                </div>
              )}
            </div>
            {/* TAG NAME / CATEGORY hiển thị cực đẹp */}
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.15em] mt-1">
              {p.category || "CHƯA PHÂN LOẠI"}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-center">
        <Badge variant="outline" className="border-slate-200 text-slate-500 font-black text-[10px] px-3 py-1 rounded-lg bg-white shadow-sm">
          #{p.order_index}
        </Badge>
      </TableCell>

      <TableCell className="text-right px-8">
        <div className="flex justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(p)} 
            className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all shadow-none"
          >
            <Edit3 size={16}/>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(p)} 
            className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all shadow-none"
          >
            <Trash2 size={16}/>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProjectsTable({ projects, onEdit, onDelete, currentPage, itemsPerPage, onReorder }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Tránh click nhầm khi muốn kéo
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = projects.findIndex((i: any) => i.id === active.id);
      const newIndex = projects.findIndex((i: any) => i.id === over.id);
      const newOrder = arrayMove(projects, oldIndex, newIndex);
      
      onReorder(newOrder);

      try {
        const updates = newOrder.map((p: any, idx: number) => ({
          id: p.id,
          order_index: (currentPage - 1) * itemsPerPage + idx + 1
        }));

        // Sử dụng Promise.all để update đồng loạt nhanh hơn
        await Promise.all(
          updates.map(up => 
            supabase.from('projects').update({ order_index: up.order_index }).eq('id', up.id)
          )
        );
        
        toast({ title: "Sắp xếp thành công", description: "Thứ tự dự án đã được cập nhật." });
      } catch (err) {
        toast({ title: "Lỗi sắp xếp", variant: "destructive" });
      }
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="bg-white rounded-[2rem] border-slate-100 shadow-xl overflow-hidden font-montserrat mx-4 mb-4">
        <Table>
          <TableHeader className="bg-slate-900 border-none hover:bg-slate-900">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[80px] text-center font-black uppercase text-[10px] text-slate-500 tracking-widest">STT</TableHead>
              <TableHead className="font-black uppercase text-[10px] text-slate-500 tracking-widest">Dự án & Lĩnh vực đào tạo</TableHead>
              <TableHead className="w-[120px] text-center font-black uppercase text-[10px] text-slate-500 tracking-widest">Ưu tiên</TableHead>
              <TableHead className="text-right px-10 font-black uppercase text-[10px] text-slate-500 tracking-widest">Quản trị</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            <SortableContext items={projects.map((p: any) => p.id)} strategy={verticalListSortingStrategy}>
              {projects.map((p: any, index: number) => (
                <SortableRow 
                  key={p.id} 
                  p={p} 
                  stt={(currentPage - 1) * itemsPerPage + index + 1} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </div>
    </DndContext>
  )
}