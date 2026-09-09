"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  ExternalLink,
  Star,
  Clock,
  Eye,
  ThumbsUp,
} from "lucide-react"
import { format } from "date-fns"

export function ArticlesTable({
  articles,
  onDeleteArticle,
  onEditArticle,
}: {
  articles: any[]
  onDeleteArticle: (articleId: number) => void
  onEditArticle: (article: any) => void
  onUpdateArticle?: (article: any) => void
}) {
  const getCategoryBadge = (cat: string) => {
    const lowerCat = cat?.toLowerCase()
    const config: Record<string, string> = {
      news: "bg-red-50 text-[#ed1c24] border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
      tutorial: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
      sharing: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
      technical: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
      industry: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
      ai: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
    }
    return (
      <Badge
        variant="outline"
        className={`${
          config[lowerCat] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10"
        } font-black text-[9px] px-2.5 py-0.5 rounded-none uppercase tracking-wider`}
      >
        {cat || "Blog"}
      </Badge>
    )
  }

  return (
    <div className="rounded-none border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="w-[420px] font-black text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider py-4 pl-6">
              Tác phẩm & Nội dung
            </TableHead>
            <TableHead className="font-black text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">
              Tác giả / Mentor
            </TableHead>
            <TableHead className="font-black text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">
              Phân loại
            </TableHead>
            <TableHead className="font-black text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider text-center">
              Hiệu quả
            </TableHead>
            <TableHead className="text-right font-black text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider pr-6">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
          {articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-slate-400 text-xs font-semibold">
                Không tìm thấy bài viết nào phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article: any) => (
              <TableRow
                key={article.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-none transition-colors group"
              >
                <TableCell className="py-4 pl-6">
                  <div className="flex items-start gap-4">
                    <div className="relative h-18 w-28 shrink-0 rounded-none overflow-hidden border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
                      <img
                        src={article.image || "/placeholder.jpg"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={article.title}
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-1 group-hover:text-[#ed1c24] transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-[#ed1c24]" />{" "}
                          {article.published_at || article.created_at
                            ? format(
                                new Date(article.published_at || article.created_at),
                                "dd/MM/yyyy"
                              )
                            : "--"}
                        </span>
                        {article.featured && (
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star size={11} className="fill-amber-500 text-amber-500" /> Nổi bật
                          </span>
                        )}
                      </div>
                      <Badge
                        className={`w-fit text-[8px] h-4 font-black shadow-none border-none rounded-none uppercase px-1.5 ${
                          article.status === "published"
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {article.status === "published" ? "XUẤT BẢN" : "BẢN NHÁP"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center -space-x-2 hover:space-x-1 transition-all">
                    {(article.authors_details || []).map((auth: any, i: number) => (
                      <Avatar
                        key={i}
                        className="h-8 w-8 rounded-none border-2 border-white dark:border-slate-900 shadow-xs"
                      >
                        <AvatarImage src={auth.avatar_url} className="object-cover" />
                        <AvatarFallback className="rounded-none font-bold text-[9px] bg-slate-200 text-slate-700">
                          {auth.full_name?.[0] || "A"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {(!article.authors_details || article.authors_details.length === 0) && (
                      <span className="text-xs font-semibold text-slate-400">
                        {article.author || "GZV Team"}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-4">{getCategoryBadge(article.category)}</TableCell>

                <TableCell className="py-4 text-center">
                  <div className="inline-flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                      <Eye size={12} className="text-slate-400" />
                      <span>{article.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                      <ThumbsUp size={12} className="text-slate-400" />
                      <span>{article.likes || 0}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4 text-right pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-none border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300 text-slate-700 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-none border border-slate-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-slate-900"
                    >
                      <DropdownMenuItem
                        className="rounded-none py-2 px-3 cursor-pointer gap-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => onEditArticle(article)}
                      >
                        <Edit3 className="h-3.5 w-3.5 text-[#ed1c24]" /> Chỉnh sửa bài viết
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="rounded-none py-2 px-3 cursor-pointer gap-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => window.open(`/chia-se/${article.slug}`, "_blank")}
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> Xem ngoài website
                      </DropdownMenuItem>
                      <div className="h-px bg-slate-100 dark:bg-white/10 my-1" />
                      <DropdownMenuItem
                        className="rounded-none py-2 px-3 cursor-pointer gap-2 text-xs font-black text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/40"
                        onClick={() => onDeleteArticle(article.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Xóa bài viết
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