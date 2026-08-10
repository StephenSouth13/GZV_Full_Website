"use client"

import { Edit2, Trash2, FileText, ExternalLink, CheckCircle2, AlertCircle, MoreHorizontal } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface GZVersTableProps {
  gzvers: any[]
  onEdit: (gzver: any) => void
  onDelete: (gzver: any) => void
}

export function GZVersTable({ gzvers, onEdit, onDelete }: GZVersTableProps) {
  return (
    <div className="overflow-hidden border border-white/10 bg-[#0b0b0b]">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="w-[320px] py-5 pl-6 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">GZVer</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Ban / vị trí</TableHead>
            <TableHead className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">CV</TableHead>
            <TableHead className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Trạng thái</TableHead>
            <TableHead className="w-[90px] pr-6 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {gzvers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Chưa có GZVer nào trong bộ lọc hiện tại
              </TableCell>
            </TableRow>
          ) : (
            gzvers.map((gzver) => {
              const department = gzver.gzver_departments?.name || gzver.department_name || 'Chưa gán ban'
              return (
                <TableRow key={gzver.id} className="border-white/10 transition-colors hover:bg-white/[0.03]">
                  <TableCell className="py-5 pl-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-none border-2 border-white/10">
                        <AvatarImage src={gzver.avatar_url} className="object-cover" />
                        <AvatarFallback className="rounded-none bg-gray-800 text-xs font-black text-white">GZV</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-black uppercase text-white">{gzver.full_name}</h4>
                        <p className="mt-1 text-[10px] font-mono text-gray-500">/{gzver.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="w-fit bg-[#ed1c24] px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white">{department}</span>
                      <span className="text-xs font-bold text-gray-300">{gzver.position || 'Chưa có vị trí'}</span>
                      <span className="text-[10px] font-black uppercase tracking-wide text-gray-500">{gzver.company || 'GZV'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {gzver.cv_url ? (
                      <Badge variant="outline" className="rounded-none border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                        <CheckCircle2 size={10} className="mr-1" /> Có CV
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-none border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-400">
                        <AlertCircle size={10} className="mr-1" /> Chưa có
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-widest ${gzver.is_active ? 'bg-[#ed1c24]/12 text-[#ff4b51]' : 'bg-gray-800 text-gray-500'}`}>
                      {gzver.is_active ? 'Đang hiển thị' : 'Đang ẩn'}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 rounded-none p-0 text-gray-400 hover:bg-white/10 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-none border-white/10 bg-gray-950 p-2 text-white shadow-2xl">
                        <DropdownMenuItem onClick={() => onEdit(gzver)} className="cursor-pointer rounded-none py-2.5 text-xs font-bold focus:bg-[#ed1c24] focus:text-white">
                          <Edit2 size={14} className="mr-2" /> Chỉnh sửa
                        </DropdownMenuItem>
                        {gzver.cv_url && (
                          <DropdownMenuItem asChild className="cursor-pointer rounded-none py-2.5 text-xs font-bold focus:bg-emerald-600 focus:text-white">
                            <a href={gzver.cv_url} target="_blank" rel="noreferrer">
                              <FileText size={14} className="mr-2" /> Xem CV
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild className="cursor-pointer rounded-none py-2.5 text-xs font-bold focus:bg-white/10 focus:text-white">
                          <a href={`http://localhost:3000/gzver/${gzver.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink size={14} className="mr-2" /> Xem public
                          </a>
                        </DropdownMenuItem>
                        <div className="my-1 h-px bg-white/10" />
                        <DropdownMenuItem onClick={() => onDelete(gzver)} className="cursor-pointer rounded-none py-2.5 text-xs font-bold text-red-400 focus:bg-red-600 focus:text-white">
                          <Trash2 size={14} className="mr-2" /> Xóa hồ sơ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
