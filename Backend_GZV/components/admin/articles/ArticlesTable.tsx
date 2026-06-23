//D:\gzv\Backend_gzv\components\admin\articles\ArticlesTable.tsx
"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Edit3, Trash2, Eye, ThumbsUp, ExternalLink, FileText, Star, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function ArticlesTable({ articles, onDeleteArticle, onEditArticle }: any) {
  
  const getCategoryBadge = (cat: string) => {
    const lowerCat = cat?.toLowerCase();
    const config: any = { news: 'bg-blue-100 text-blue-700 border-blue-200', tutorial: 'bg-green-100 text-green-700 border-green-200', sharing: 'bg-purple-100 text-purple-700 border-purple-200' }
    return <Badge variant="outline" className={`${config[lowerCat] || 'bg-slate-100 text-slate-600'} font-black text-[9px] px-3 py-0.5 rounded-full uppercase tracking-tighter`}>{cat || 'Blog'}</Badge>
  }

  return (
    <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="w-[450px] font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] py-6 pl-10">Tác phẩm & Nội dung</TableHead>
            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Nhóm Mentor</TableHead>
            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Phân loại</TableHead>
            <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em]">Hiệu quả</TableHead>
            <TableHead className="text-right font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] pr-10">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article: any) => (
            <TableRow key={article.id} className="hover:bg-blue-50/30 border-slate-50 transition-all duration-500 group">
              <TableCell className="py-8 pl-10">
                <div className="flex items-start gap-5">
                  <div className="relative h-20 w-32 shrink-0 rounded-2xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                    <img src={article.image || '/placeholder.jpg'} className="w-full h-full object-cover" alt="Art" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-black text-slate-800 text-lg leading-tight line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">{article.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                       <span className="flex items-center gap-1"><Clock size={12}/> {format(new Date(article.published_at || article.created_at), 'dd/MM/yyyy')}</span>
                       {article.featured && <Star size={12} className="fill-yellow-500 text-yellow-500" />}
                    </div>
                    <Badge className={`w-fit text-[8px] h-4 font-black shadow-none border-none ${article.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                      {article.status === 'published' ? 'LIVE' : 'DRAFT'}
                    </Badge>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex -space-x-3 hover:space-x-1 transition-all duration-500 cursor-help">
                  {(article.authors_details || []).map((auth: any, i: number) => (
                    <Avatar key={i} className="h-10 w-10 border-4 border-white shadow-xl">
                      <AvatarImage src={auth.avatar_url} className="object-cover" />
                      <AvatarFallback className="font-bold text-[10px]">{auth.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  {(!article.authors_details || article.authors_details.length === 0) && (
                    <div className="text-[10px] font-bold text-slate-300 italic">gzv Team</div>
                  )}
                </div>
              </TableCell>

              <TableCell>{getCategoryBadge(article.category)}</TableCell>

              <TableCell>
                <div className="flex items-center gap-6">
                  <div className="text-center"><p className="text-lg font-black text-slate-700 leading-none">{article.views || 0}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Lượt xem</p></div>
                  <div className="text-center"><p className="text-lg font-black text-slate-700 leading-none">{article.likes || 0}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Lượt thích</p></div>
                </div>
              </TableCell>

              <TableCell className="text-right pr-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-12 w-12 rounded-full hover:bg-white hover:shadow-xl border-transparent hover:border-slate-100 border transition-all"><MoreHorizontal size={22} className="text-slate-400" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-[1.5rem] shadow-2xl border-none">
                    <DropdownMenuItem className="rounded-xl py-3 cursor-pointer gap-3 font-bold text-slate-600" onClick={() => onEditArticle(article)}><Edit3 className="h-4 w-4 text-blue-500" /> Chỉnh sửa chuyên sâu</DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl py-3 cursor-pointer gap-3 font-bold text-slate-600" onClick={() => window.open(`/chia-se/${article.slug}`, '_blank')}><ExternalLink className="h-4 w-4 text-slate-400" /> Xem trên Website</DropdownMenuItem>
                    <div className="h-px bg-slate-50 my-2 mx-2" />
                    <DropdownMenuItem className="rounded-xl py-3 cursor-pointer gap-3 font-black text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => onDeleteArticle(article)}><Trash2 className="h-4 w-4" /> Xóa vĩnh viễn</DropdownMenuItem>
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