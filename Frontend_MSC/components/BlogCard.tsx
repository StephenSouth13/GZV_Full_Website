"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, ArrowRight, Users } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Định nghĩa lại Interface chuẩn để nhận mảng tác giả từ Database
interface BlogCardProps {
  id: string
  title: string
  excerpt: string
  image: string
  authors: any[] // Nhận mảng đa tác giả thay vì 1 string đơn lẻ
  publishDate: string
  category: string
  slug: string 
  readTime: string
}

const BlogCard = ({ id, title, excerpt, image, authors, publishDate, category, slug, readTime }: BlogCardProps) => {
  const maxDisplay = 2; // Hiển thị 2 avatar chính
  const displayAuthors = authors?.slice(0, maxDisplay) || [];
  const remaining = (authors?.length || 0) - maxDisplay;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group rounded-[2rem]">
        
        {/* Header Image */}
        <div className="relative overflow-hidden aspect-[16/10]">
          <Image
            src={image || "/placeholder.jpg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Badge className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md text-white border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">
            {category}
          </Badge>
        </div>

        <CardHeader className="pb-3 px-6 pt-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </CardHeader>

        <CardContent className="flex-1 pb-4 px-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6 italic font-medium">
            {excerpt}
          </p>

          {/* AUTHOR STACK - PHẦN SIÊU XỊN */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3">
                {displayAuthors.map((auth, i) => (
                  <Avatar key={i} className="h-8 w-8 border-2 border-white dark:border-slate-900 shadow-sm transition-transform hover:-translate-y-1">
                    <AvatarImage src={auth.avatar_url} className="object-cover" />
                    <AvatarFallback className="text-[10px] font-bold">{auth.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                ))}
                
                {remaining > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="h-8 w-8 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center text-[9px] font-black hover:bg-blue-600 transition-colors z-10 shadow-md">
                        +{remaining}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-md z-[100]">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                        <Users size={14} className="text-blue-600" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Chuyên gia thực hiện</span>
                      </div>
                      <div className="space-y-3">
                        {authors.map((m: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3">
                            <Avatar className="h-7 w-7"><AvatarImage src={m.avatar_url}/></Avatar>
                            <span className="text-xs font-bold text-slate-700">{m.full_name}</span>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="flex flex-col ml-1">
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 leading-none">
                  {authors?.[0]?.full_name || "MSC Team"}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
                  {publishDate}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-[10px] font-black text-slate-300 uppercase">
              <Clock className="h-3.5 w-3.5" />
              <span>{readTime}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0">
          <Link href={`/tin-tuc/${slug}`} className="w-full">
            <Button className="w-full btn-primary rounded-lg h-11 text-sm font-semibold">
              Đọc bài viết
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default BlogCard
