"use client"

import { 
  Edit2, 
  Trash2, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  MoreHorizontal
} from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface gzversTableProps {
  gzvers: any[]
  onEdit: (gzver: any) => void
  onDelete: (gzver: any) => void
}

export function gzversTable({ gzvers, onEdit, onDelete }: gzversTableProps) {
  return (
    <div className="rounded-[2rem] border border-white/5 bg-gray-900/20 overflow-hidden backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="w-[350px] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 py-6 pl-8">Chuyên gia gzv</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Chức danh / Công ty</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Tài liệu CV</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Trạng thái</TableHead>
            <TableHead className="w-[100px] text-right pr-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gzvers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center text-gray-600 font-bold uppercase text-[10px] tracking-widest">
                Chưa có dữ liệu chuyên gia nào được khởi tạo
              </TableCell>
            </TableRow>
          ) : (
            gzvers.map((gzver) => (
              <TableRow key={gzver.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                {/* CỘT CHUYÊN GIA (ẢNH + TÊN) */}
                <TableCell className="py-5 pl-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white/10 group-hover:border-blue-500 transition-colors">
                        <AvatarImage src={gzver.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-gray-800 text-xs font-black">gzv</AvatarFallback>
                      </Avatar>
                      {gzver.is_active && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-gray-950"></span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{gzver.full_name}</h4>
                      <p className="text-[10px] font-mono text-gray-600 mt-0.5">/{gzver.slug}</p>
                    </div>
                  </div>
                </TableCell>

                {/* CỘT VỊ TRÍ */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-300">{gzver.position}</span>
                    <span className="text-[10px] font-black text-blue-500/60 uppercase tracking-tighter">{gzver.company || 'gzv Center'}</span>
                  </div>
                </TableCell>

                {/* CỘT TRẠNG THÁI CV */}
                <TableCell className="text-center">
                  {gzver.cv_url ? (
                    <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-500 rounded-full px-3 py-1 gap-1.5 font-black text-[9px] uppercase tracking-widest">
                      <CheckCircle2 size={10} /> Đã có CV
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/5 border-amber-500/20 text-amber-500 rounded-full px-3 py-1 gap-1.5 font-black text-[9px] uppercase tracking-widest">
                      <AlertCircle size={10} /> Chưa có
                    </Badge>
                  )}
                </TableCell>

                {/* CỘT TRẠNG THÁI HIỂN THỊ */}
                <TableCell className="text-center">
                   <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${gzver.is_active ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                      {gzver.is_active ? 'Đang hiển thị' : 'Đang ẩn'}
                   </div>
                </TableCell>

                {/* CỘT THAO TÁC */}
                <TableCell className="text-right pr-8">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white/10">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white rounded-2xl w-48 p-2 shadow-2xl">
                      <DropdownMenuItem 
                        onClick={() => onEdit(gzver)}
                        className="rounded-xl focus:bg-blue-600 focus:text-white cursor-pointer py-2.5 gap-3 font-bold text-xs"
                      >
                        <Edit2 size={14} /> Chỉnh sửa hồ sơ
                      </DropdownMenuItem>
                      
                      {gzver.cv_url && (
                        <DropdownMenuItem 
                          asChild
                          className="rounded-xl focus:bg-emerald-600 focus:text-white cursor-pointer py-2.5 gap-3 font-bold text-xs"
                        >
                          <a href={gzver.cv_url} target="_blank" rel="noreferrer">
                            <FileText size={14} /> Xem CV gốc (PDF)
                          </a>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem 
                        className="rounded-xl focus:bg-white/10 cursor-pointer py-2.5 gap-3 font-bold text-xs"
                      >
                        <ExternalLink size={14} /> Xem trên Website
                      </DropdownMenuItem>
                      
                      <div className="h-px bg-white/5 my-1" />
                      
                      <DropdownMenuItem 
                        onClick={() => onDelete(gzver)}
                        className="rounded-xl focus:bg-red-600 focus:text-white cursor-pointer py-2.5 gap-3 font-bold text-xs text-red-400"
                      >
                        <Trash2 size={14} /> Xóa hồ sơ
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