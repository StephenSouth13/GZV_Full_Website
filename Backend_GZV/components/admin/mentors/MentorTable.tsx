"use client"

import React from "react"
import { Mentor } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Edit2, Trash2, Eye, MoreHorizontal, ExternalLink, GraduationCap, Award } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MentorTable({ mentors, onEdit, onDelete, onView, onToggleStatus }: any) {
  return (
    <div className="overflow-hidden border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-950/60">
          <TableRow className="border-slate-200 hover:bg-transparent dark:border-white/10">
            <TableHead className="w-[70px] py-3.5 pl-5 text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
              STT
            </TableHead>
            <TableHead className="w-[300px] text-[10px] font-black uppercase tracking-wider text-slate-500">
              Họ tên / Chuyên gia
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Chức danh & Học vị
            </TableHead>
            <TableHead className="text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
              Trạng thái
            </TableHead>
            <TableHead className="w-[100px] pr-5 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {mentors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-36 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                Chưa có chuyên gia nào phù hợp với tìm kiếm
              </TableCell>
            </TableRow>
          ) : (
            mentors.map((mentor: Mentor, index: number) => (
              <TableRow
                key={mentor.id}
                className="border-slate-200 transition-colors hover:bg-slate-50/80 dark:border-white/10 dark:hover:bg-slate-800/40"
              >
                <TableCell className="pl-5 text-center font-mono text-xs font-bold text-slate-400">
                  {mentor.order ?? index + 1}
                </TableCell>

                <TableCell className="py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 rounded-none border border-slate-200 dark:border-white/10">
                      <AvatarImage src={mentor.avatar_url} className="object-cover" />
                      <AvatarFallback className="rounded-none bg-slate-800 text-xs font-black text-white">
                        {mentor.full_name ? mentor.full_name.charAt(0) : "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                        {mentor.full_name}
                      </h4>
                      <p className="mt-0.5 text-[10px] font-mono text-slate-400">/{mentor.slug}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {mentor.title || "Chuyên gia đào tạo"}
                    </span>
                    {mentor.specialties && mentor.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mentor.specialties.slice(0, 2).map((spec: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 uppercase"
                          >
                            {spec}
                          </span>
                        ))}
                        {mentor.specialties.length > 2 && (
                          <span className="text-[9px] font-mono text-slate-400">
                            +{mentor.specialties.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  {onToggleStatus ? (
                    <div className="inline-flex items-center gap-2">
                      <Switch
                        checked={mentor.is_active}
                        onCheckedChange={(checked) => onToggleStatus(mentor, checked)}
                      />
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          mentor.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                        }`}
                      >
                        {mentor.is_active ? "Hiện" : "Ẩn"}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        mentor.is_active
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                      }`}
                    >
                      {mentor.is_active ? "Hiển thị" : "Đã ẩn"}
                    </span>
                  )}
                </TableCell>

                <TableCell className="pr-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 rounded-none p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-none border-slate-200 bg-white p-1 shadow-xl dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    >
                      <DropdownMenuItem
                        onClick={() => onView(mentor)}
                        className="cursor-pointer rounded-none py-2 text-xs font-bold focus:bg-slate-100 dark:focus:bg-slate-800"
                      >
                        <Eye size={13} className="mr-2" /> Xem nhanh hồ sơ
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onEdit(mentor)}
                        className="cursor-pointer rounded-none py-2 text-xs font-bold focus:bg-[#ed1c24] focus:text-white"
                      >
                        <Edit2 size={13} className="mr-2" /> Chỉnh sửa chuyên gia
                      </DropdownMenuItem>

                      <div className="my-1 h-px bg-slate-200 dark:bg-white/10" />

                      <DropdownMenuItem
                        onClick={() => onDelete(mentor)}
                        className="cursor-pointer rounded-none py-2 text-xs font-bold text-red-600 focus:bg-red-600 focus:text-white dark:text-red-400"
                      >
                        <Trash2 size={13} className="mr-2" /> Xóa chuyên gia
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}