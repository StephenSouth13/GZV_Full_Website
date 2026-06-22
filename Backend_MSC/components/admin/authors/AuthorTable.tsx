"use client"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Trash2, MoreHorizontal, Link as LinkIcon } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AuthorTable({ authors, onEdit, onDelete }: any) {
  return (
    <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0a] overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-8 py-5">Tác giả</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Chức danh</TableHead>
            <TableHead className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Slug</TableHead>
            <TableHead className="text-right pr-8 text-[10px] font-black uppercase text-gray-500 tracking-widest">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {authors.map((author: any) => (
            <TableRow key={author.id} className="border-white/5 hover:bg-emerald-500/[0.02] transition-colors group">
              <TableCell className="pl-8">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-white/10 group-hover:border-emerald-500 transition-all">
                    <AvatarImage src={author.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-emerald-900 text-emerald-200">
                      {author.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-sm text-white">{author.full_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-400 text-xs">{author.title || 'Biên tập viên'}</TableCell>
              <TableCell className="font-mono text-[10px] text-emerald-500/70">{author.slug}</TableCell>
              <TableCell className="text-right pr-8">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 rounded-full">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white rounded-xl">
                    <DropdownMenuItem onClick={() => onEdit(author)} className="focus:bg-emerald-600 gap-2 cursor-pointer">
                      <Edit size={14}/> Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(author)} className="focus:bg-rose-600 gap-2 cursor-pointer text-rose-400 focus:text-white">
                      <Trash2 size={14}/> Xóa tác giả
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {authors.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-20 text-gray-500 italic text-sm">
                Chưa có tác giả nào trong danh sách.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}