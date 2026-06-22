"use client"

import { useState } from 'react'
import { Mentor } from '@/lib/supabase'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Trash2, Eye, MoreHorizontal, ExternalLink } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MentorTable({ mentors, onEdit, onDelete, onView }: any) {
  return (
    <div className="rounded-[2rem] border border-white/5 bg-gray-950/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="w-[80px] text-[10px] font-black uppercase text-gray-500 tracking-widest pl-8">Thứ tự</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Chuyên gia</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Chức danh</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Trạng thái</TableHead>
            <TableHead className="text-right pr-8 text-[10px] font-black uppercase text-gray-500 tracking-widest">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mentors.map((mentor: Mentor) => (
            <TableRow key={mentor.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
              <TableCell className="font-mono text-xs text-gray-500 pl-8">{mentor.order || 0}</TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white/10 group-hover:border-blue-500 transition-all">
                    <AvatarImage src={mentor.avatar_url} className="object-cover" />
                    <AvatarFallback>{mentor.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-sm text-white">{mentor.full_name}</div>
                    <div className="text-[10px] text-blue-400 font-mono">/{mentor.slug}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-400 text-xs font-medium">{mentor.title}</TableCell>
              <TableCell className="text-center">
                <Badge className={mentor.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}>
                  {mentor.is_active ? "Hiển thị" : "Đã ẩn"}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-8">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 rounded-full">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white rounded-xl">
                    <DropdownMenuItem onClick={() => onView(mentor)} className="focus:bg-blue-600 gap-2 cursor-pointer">
                      <Eye size={14}/> Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(mentor)} className="focus:bg-blue-600 gap-2 cursor-pointer">
                      <Edit size={14}/> Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(mentor)} className="focus:bg-rose-600 gap-2 cursor-pointer text-rose-400 focus:text-white">
                      <Trash2 size={14}/> Xóa hồ sơ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}