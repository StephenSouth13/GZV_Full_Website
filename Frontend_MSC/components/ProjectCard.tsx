"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Project } from "@/lib/api-supabase"

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const mentors = project.project_authors || [];
  const maxDisplay = 3; 
  const displayMentors = mentors.slice(0, maxDisplay);
  const remainingCount = mentors.length - maxDisplay;

  return (
    <Card className="h-full flex flex-col overflow-hidden rounded-[2rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 group bg-white dark:bg-neutral-800">
      {/* 1. PHẦN ẢNH DỰ ÁN */}
      <CardHeader className="p-0">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={project.image || '/placeholder.jpg'}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-60"></div>
          <Badge className="absolute top-6 left-6 bg-white/95 dark:bg-neutral-900/90 text-slate-900 font-black shadow-xl border-none px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em]">
            {project.category}
          </Badge>
        </div>
      </CardHeader>
      
      {/* 2. NỘI DUNG DỰ ÁN */}
      <CardContent className="p-8 flex flex-col flex-grow">
        <CardTitle className="text-xl font-black text-gray-900 dark:text-white mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors uppercase">
          {project.title}
        </CardTitle>
        <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed mb-8 flex-grow line-clamp-3 italic font-medium">
          {project.description}
        </p>
        
        {/* 3. PHẦN ĐỘI NGŨ MENTOR - CHUẨN UI ẢNH MẪU */}
        <div className="mt-auto pt-6 border-t border-slate-50 dark:border-neutral-700">
          <div className="flex flex-col items-start">
            
            {/* THÊM DÒNG CHỮ NÀY - NẰM TRÊN AVATAR NHƯ ẢNH MẪU */}
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400 mb-4">
              Mentoring & Coaching
            </span>

            <div className="flex items-center gap-4 w-full">
              {/* Avatar Stack */}
              <div className="flex -space-x-3 items-center flex-shrink-0">
                {displayMentors.map((mentor, i: number) => (
                  <Avatar key={i} className="h-10 w-10 border-2 border-white dark:border-neutral-800 shadow-md">
                    <AvatarImage src={mentor.avatar} className="object-cover" />
                    <AvatarFallback className="text-[10px] font-black bg-blue-50 text-blue-600">
                      {mentor.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}

                {remainingCount > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="h-10 w-10 rounded-full bg-slate-900 text-white border-2 border-white flex items-center justify-center text-[10px] font-black hover:bg-blue-600 transition-all shadow-lg z-20">
                        +{remainingCount}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-5 rounded-[2rem] shadow-2xl border-none bg-white/95 backdrop-blur-xl z-[100]">
                      <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <Users size={16} className="text-blue-600" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Đội ngũ chuyên gia</span>
                      </div>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {mentors.map((m, idx: number) => (
                          <Link key={idx} href={m.profile_link || "#"} className="flex items-center gap-3 group/item">
                            <Avatar className="h-9 w-9 shadow-sm">
                              <AvatarImage src={m.avatar} />
                              <AvatarFallback className="font-bold">{m.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-700 group-hover/item:text-blue-600 transition-colors leading-none">{m.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{m.title || "Mentor"}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Tên hiển thị bên phải Avatar */}
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-slate-900 dark:text-white leading-none">
                  {mentors[0]?.name || "MSC Team"}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-black mt-1.5 tracking-tighter">
                  {mentors.length > 1 ? `& ${mentors.length - 1} chuyên gia khác` : "Chuyên gia đào tạo"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 4. NÚT XEM CHI TIẾT - Chuẩn UI bo góc và màu sắc */}
        <Link href={`/du-an/${project.slug || project.id}`} className="mt-8">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-14 group/btn shadow-lg shadow-blue-500/20 transition-all uppercase text-xs tracking-widest">
            Xem chi tiết dự án
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}