"use client"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Edit2, Trash2, MoreHorizontal, ExternalLink } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AuthorTable({ authors, onEdit, onDelete }: any) {
  return (
    <div className="overflow-hidden border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-950/60">
          <TableRow className="border-slate-200 hover:bg-transparent dark:border-white/10">
            <TableHead className="py-3.5 pl-5 text-[10px] font-black uppercase tracking-wider text-slate-500 w-[280px]">
              Tác giả / Biên tập viên
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-500 w-[220px]">
              Chức danh
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Đường dẫn tĩnh (Slug)
            </TableHead>
            <TableHead className="text-right pr-5 text-[10px] font-black uppercase tracking-wider text-slate-500 w-[140px]">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {authors.map((author: any) => (
            <TableRow key={author.id} className="border-slate-200 transition-colors hover:bg-slate-50/80 dark:border-white/10 dark:hover:bg-slate-800/40">
              <TableCell className="py-3 pl-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-none border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-slate-800">
                    <AvatarImage src={author.avatar_url} className="object-cover" />
                    <AvatarFallback className="rounded-none bg-slate-800 text-xs font-black text-white">
                      {author.full_name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                      {author.full_name}
                    </h4>
                    {author.email && (
                      <p className="text-[10px] font-mono text-slate-400">{author.email}</p>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell className="py-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {author.title || 'Biên tập viên'}
                </span>
              </TableCell>

              <TableCell className="py-3">
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
                  /{author.slug}
                </span>
              </TableCell>

              <TableCell className="py-3 pr-5 text-right">
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
                    <DropdownMenuContent align="end" className="w-40 rounded-none border-slate-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-slate-950 dark:text-white">
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
          ))}

          {authors.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-40 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                Chưa có tác giả nào trong danh sách
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}