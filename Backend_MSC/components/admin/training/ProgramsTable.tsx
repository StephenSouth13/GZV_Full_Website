'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Users, 
  Star,
  Palette,
  Eye
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { TrainingService } from '@/lib/training-service'
import { useToast } from '@/hooks/use-toast'

interface ProgramsTableProps {
  programs: any[]
  onRefresh: () => void
}

export function ProgramsTable({ programs, onRefresh }: ProgramsTableProps) {
  const { toast } = useToast()

  const handleDelete = async (program: any) => {
    if (confirm(`Sếp có chắc chắn muốn xóa khóa học "${program.title}"? Hành động này không thể hoàn tác.`)) {
      try {
        const success = await TrainingService.deleteProgram(program.id)
        if (success) {
          toast({ title: "ĐÃ XÓA", description: "Dữ liệu tri thức đã được loại bỏ khỏi hệ thống." })
          onRefresh()
        }
      } catch (error) {
        toast({ title: "LỖI", description: "Không thể xóa. Vui lòng kiểm tra lại kết nối.", variant: "destructive" })
      }
    }
  }

  const getLevelBadge = (level: string) => {
    const config: any = {
      'Cơ bản': 'bg-blue-50 text-blue-600 border-blue-100',
      'Trung cấp': 'bg-amber-50 text-amber-600 border-amber-100',
      'Nâng cao': 'bg-purple-50 text-purple-600 border-purple-100',
      'Chuyên gia': 'bg-rose-50 text-rose-600 border-rose-100'
    }
    return (
      <Badge variant="outline" className={`${config[level] || 'bg-slate-50 text-slate-500'} font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest border-2`}>
        {level || 'TỔNG HỢP'}
      </Badge>
    )
  }

  return (
    <div className="rounded-[3rem] border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="w-[500px] font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] py-8 pl-12">Nội dung khóa học & Visual</TableHead>
            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Chỉ số học viên</TableHead>
            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Phân loại</TableHead>
            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Decor Color</TableHead>
            <TableHead className="text-right font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] pr-12">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-32 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <Trash2 size={32} />
                  </div>
                  <p className="font-black text-slate-300 uppercase text-xs tracking-widest">Kho dữ liệu đang trống, thưa sếp!</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            programs.map((program: any) => (
              <TableRow key={program.id} className="hover:bg-blue-50/20 border-slate-50 transition-all duration-500 group">
                <TableCell className="py-10 pl-12">
                  <div className="flex items-center gap-6">
                    {/* Thumbnail xịn xò */}
                    <div className="relative h-24 w-40 shrink-0 rounded-[1.5rem] overflow-hidden shadow-xl group-hover:scale-105 transition-transform duration-700 bg-slate-100 border-2 border-white">
                      <img 
                        src={program.image || '/placeholder.jpg'} 
                        className="w-full h-full object-cover" 
                        alt={program.title} 
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>
                    
                    <div className="flex flex-col justify-center space-y-2">
                      <h3 className="font-black text-slate-800 text-xl leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors uppercase italic tracking-tighter">
                        {program.title}
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Clock size={12} className="text-blue-500" /> {program.duration || 'Flexible'}
                        </div>
                        <Badge className={`w-fit text-[8px] h-5 px-3 font-black shadow-none border-none rounded-full ${program.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                          {program.status === 'published' ? '• LIVE' : '• DRAFT'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-700 leading-none">{program.students || 0}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Đã đăng ký</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{getLevelBadge(program.level)}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-2xl shadow-inner border-4 border-white"
                      style={{ backgroundColor: program.theme_color || '#0077B6' }}
                    />
                    <code className="text-[10px] font-black text-slate-400 uppercase">{program.theme_color || '#0077B6'}</code>
                  </div>
                </TableCell>

                <TableCell className="text-right pr-12">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-14 w-14 rounded-full hover:bg-white hover:shadow-2xl border-transparent hover:border-slate-100 border transition-all active:scale-90">
                        <MoreHorizontal size={24} className="text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 p-3 rounded-[2rem] shadow-2xl border-none bg-white/90 backdrop-blur-xl">
                      <Link href={`/admin/training/${program.id}`}>
                        <DropdownMenuItem className="rounded-2xl py-4 cursor-pointer gap-4 font-black text-slate-600 focus:bg-blue-600 focus:text-white transition-all">
                          <Edit3 className="h-5 w-5" /> CHỈNH SỬA CHUYÊN SÂU
                        </DropdownMenuItem>
                      </Link>
                      
                      <DropdownMenuItem 
                        className="rounded-2xl py-4 cursor-pointer gap-4 font-black text-slate-600 focus:bg-slate-900 focus:text-white transition-all"
                        onClick={() => window.open(`/dao-tao/${program.slug}`, '_blank')}
                      >
                        <Eye className="h-5 w-5" /> XEM TRƯỚC GIAO DIỆN
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="my-2 bg-slate-100" />
                      
                      <DropdownMenuItem 
                        className="rounded-2xl py-4 cursor-pointer gap-4 font-black text-red-600 focus:bg-red-500 focus:text-white transition-all"
                        onClick={() => handleDelete(program)}
                      >
                        <Trash2 className="h-5 w-5" /> XÓA KHỎI HỆ THỐNG
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          ))}
        </TableBody>
      </Table>
    </div>
  )
}