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
      className={`group transition-colors border-b border-slate-100 dark:border-white/5 ${
        isDragging ? 'bg-red-50/50 shadow-md ring-1 ring-red-200' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
      }`}
    >
      <TableCell className="w-[50px] pl-6">
        <button 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1.5 text-slate-300 hover:text-[#ed1c24] transition-colors rounded-none"
        >
          <GripVertical size={18} />
        </button>
      </TableCell>
      
      <TableCell className="text-center font-bold text-slate-400 text-xs w-[60px]">
        {stt < 10 ? `0${stt}` : stt}
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 overflow-hidden shrink-0">
            {p.image ? (
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageIcon size={18} />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate leading-tight group-hover:text-[#ed1c24] transition-colors">
                {p.title}
              </span>
              {p.featured && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-1 border border-amber-200 dark:border-amber-800 rounded-none">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-[#ed1c24] font-black uppercase tracking-wider mt-1">
              {p.category || "CHƯA PHÂN LOẠI"}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-center py-4">
        <Badge variant="outline" className="border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-300 font-bold text-[10px] px-2.5 py-0.5 rounded-none bg-white dark:bg-slate-800 shadow-none">
          #{p.order_index}
        </Badge>
      </TableCell>

      <TableCell className="text-right pr-6 py-4">
        <div className="flex justify-end gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onEdit(p)} 
            className="h-8 w-8 rounded-none border-slate-200 bg-white hover:bg-slate-100 hover:text-[#ed1c24] dark:border-white/10 dark:bg-slate-800 dark:text-white shadow-none transition-colors"
          >
            <Edit3 size={15}/>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onDelete(p)} 
            className="h-8 w-8 rounded-none border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-slate-800 dark:text-white shadow-none transition-colors"
          >
            <Trash2 size={15}/>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProjectsTable({ projects, onEdit, onDelete, currentPage, itemsPerPage, onReorder }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
      <div className="bg-white dark:bg-slate-900 rounded-none border-none overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[50px] pl-6"></TableHead>
              <TableHead className="w-[80px] text-center font-black uppercase text-[10px] text-slate-600 dark:text-slate-400 tracking-wider py-4">STT</TableHead>
              <TableHead className="font-black uppercase text-[10px] text-slate-600 dark:text-slate-400 tracking-wider">Dự án & Lĩnh vực đào tạo</TableHead>
              <TableHead className="w-[120px] text-center font-black uppercase text-[10px] text-slate-600 dark:text-slate-400 tracking-wider">Thứ tự</TableHead>
              <TableHead className="text-right pr-6 font-black uppercase text-[10px] text-slate-600 dark:text-slate-400 tracking-wider">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-white/5">
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