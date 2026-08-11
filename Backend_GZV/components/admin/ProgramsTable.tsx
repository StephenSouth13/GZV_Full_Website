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
  BookOpen, 
  Calendar,
  Star
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { format } from 'date-fns'
import { TrainingService } from '@/lib/training-service'
import { useToast } from '@/hooks/use-toast'

interface ProgramsTableProps {
  programs: any[]
  onRefresh: () => void
}

export function ProgramsTable({ programs, onRefresh }: ProgramsTableProps) {
  const { toast } = useToast()

  const handleDelete = async (program: any) => {
    if (confirm(`Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a khÃ³a há»c "${program.title}"?`)) {
      const success = await TrainingService.deleteProgram(program.id)
      if (success) {
        toast({ title: "ÄÃ£ xÃ³a khÃ³a há»c thÃ nh cÃ´ng" })
        onRefresh()
      } else {
        toast({ title: "Lá»—i khi xÃ³a khÃ³a há»c", variant: "destructive" })
      }
    }
  }

  const getLevelBadge = (level: string) => {
    const config: any = {
      'CÆ¡ báº£n': 'bg-red-50 text-[#c91218] border-red-200',
      'Trung cáº¥p': 'bg-amber-100 text-amber-700 border-amber-200',
      'NÃ¢ng cao': 'bg-purple-100 text-purple-700 border-purple-200',
      'ChuyÃªn gia': 'bg-rose-100 text-rose-700 border-rose-200'
    }
    return (
      <Badge variant="outline" className={`${config[level] || 'bg-slate-100 text-slate-600'} font-black text-[9px] px-3 py-0.5 rounded-full uppercase tracking-tighter`}>
        {level || 'Tá»•ng há»£p'}
      </Badge>
    )
  }

  return (
    <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="w-[450px] font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] py-6 pl-10">ChÆ°Æ¡ng trÃ¬nh & Cáº¥p Ä‘á»™</TableHead>
            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Quy mÃ´ há»c viÃªn</TableHead>
            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">PhÃ¢n loáº¡i</TableHead>
            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Há»c phÃ­</TableHead>
            <TableHead className="text-right font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] pr-10">Thao tÃ¡c</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-20 text-center font-bold text-slate-400 italic">
                ChÆ°a cÃ³ dá»¯ liá»‡u chÆ°Æ¡ng trÃ¬nh Ä‘Ã o táº¡o.
              </TableCell>
            </TableRow>
          ) : (
            programs.map((program: any) => (
              <TableRow key={program.id} className="hover:bg-red-50/30 border-slate-50 transition-all duration-500 group">
                <TableCell className="py-8 pl-10">
                  <div className="flex items-start gap-5">
                    <div className="relative h-20 w-32 shrink-0 rounded-2xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500 bg-slate-100">
                      <img 
                        src={program.image || '/placeholder.jpg'} 
                        className="w-full h-full object-cover" 
                        alt={program.title} 
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-black text-slate-800 text-lg leading-tight line-clamp-1 mb-1 group-hover:text-[#ed1c24] transition-colors">
                        {program.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <span className="flex items-center gap-1"><Clock size={12}/> {program.duration || 'N/A'}</span>
                        {program.is_featured && <Star size={12} className="fill-yellow-500 text-yellow-500" />}
                      </div>
                      <Badge className={`w-fit text-[8px] h-4 font-black shadow-none border-none ${program.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                        {program.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                      </Badge>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-black text-slate-700 leading-none">{program.students || 0}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Há»c viÃªn</p>
                    </div>
                    <div className="text-center border-l border-slate-100 pl-6">
                      <div className="flex items-center gap-1 text-slate-700 justify-center">
                        <Users size={14} className="text-[#ed1c24]" />
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Lá»›p há»c</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{getLevelBadge(program.level)}</TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <p className="text-sm font-black text-slate-700 tracking-tight">{program.price || 'Thá»a thuáº­n'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{program.category || 'Há»c viá»‡n'}</p>
                  </div>
                </TableCell>

                <TableCell className="text-right pr-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-12 w-12 rounded-full hover:bg-white hover:shadow-xl border-transparent hover:border-slate-100 border transition-all">
                        <MoreHorizontal size={22} className="text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-[1.5rem] shadow-2xl border-none">
                      <Link href={`/admin/training/${program.id}`}>
                        <DropdownMenuItem className="rounded-xl py-3 cursor-pointer gap-3 font-bold text-slate-600">
                          <Edit3 className="h-4 w-4 text-[#ed1c24]" /> Chá»‰nh sá»­a chuyÃªn sÃ¢u
                        </DropdownMenuItem>
                      </Link>
                      
                      <DropdownMenuItem 
                        className="rounded-xl py-3 cursor-pointer gap-3 font-bold text-slate-600"
                        onClick={() => window.open('/dich-vu', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 text-slate-400" /> Xem báº£n Preview
                      </DropdownMenuItem>

                      <div className="h-px bg-slate-50 my-2 mx-2" />
                      
                      <DropdownMenuItem 
                        className="rounded-xl py-3 cursor-pointer gap-3 font-black text-red-600 focus:bg-red-50 focus:text-red-700"
                        onClick={() => handleDelete(program)}
                      >
                        <Trash2 className="h-4 w-4" /> XÃ³a chÆ°Æ¡ng trÃ¬nh
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

