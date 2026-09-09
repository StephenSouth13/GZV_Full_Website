"use client"

import React from "react"
import { Edit2, Trash2, FileText, ExternalLink, CheckCircle2, AlertCircle, MoreHorizontal, User, Sparkles } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

interface GZVersTableProps {
  gzvers: any[]
  onEdit: (gzver: any) => void
  onDelete: (gzver: any) => void
  onToggleStatus?: (gzver: any, nextStatus: boolean) => void
}

export function GZVersTable({ gzvers, onEdit, onDelete, onToggleStatus }: GZVersTableProps) {
  return (
    <div className="overflow-hidden border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-950/60">
          <TableRow className="border-slate-200 hover:bg-transparent dark:border-white/10">
            <TableHead className="w-[280px] py-3.5 pl-5 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Thành viên
            </TableHead>
            <TableHead className="w-[180px] text-[10px] font-black uppercase tracking-wider text-slate-500">
              Phân Ban
            </TableHead>
            <TableHead className="w-[220px] text-[10px] font-black uppercase tracking-wider text-slate-500">
              Chức vụ & Đơn vị
            </TableHead>
            <TableHead className="w-[130px] text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
              Hồ sơ CV
            </TableHead>
            <TableHead className="w-[140px] text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
              Trạng thái
            </TableHead>
            <TableHead className="w-[160px] pr-5 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {gzvers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-40 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                Không tìm thấy nhân sự nào trong bộ lọc hiện tại
              </TableCell>
            </TableRow>
          ) : (
            gzvers.map((gzver) => {
              const department = gzver.gzver_departments?.name || gzver.department_name || "Chưa gán ban"
              const deptColor = gzver.gzver_departments?.color || "#ed1c24"

              return (
                <TableRow
                  key={gzver.id}
                  className="border-slate-200 transition-colors hover:bg-slate-50/80 dark:border-white/10 dark:hover:bg-slate-800/40"
                >
                  {/* Column 1: Member Avatar & Info */}
                  <TableCell className="py-3 pl-5">
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
                  <TableCell className="py-3">
                    <div className="inline-flex items-center border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-slate-950">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200 truncate">
                        {department}
                      </span>
                    </div>
                  </TableCell>

                  {/* Column 3: Role & Company */}
                  <TableCell className="py-3">
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
                  <TableCell className="py-3 text-center">
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
                  <TableCell className="py-3 text-center">
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
                  <TableCell className="py-3 pr-5 text-right">
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
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
