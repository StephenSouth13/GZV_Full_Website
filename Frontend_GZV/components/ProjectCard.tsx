"use client"

import Link from "next/link"
import { ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Project } from "@/lib/api-supabase"

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const mentors = project.project_authors || []
  const maxDisplay = 3
  const displayMentors = mentors.slice(0, maxDisplay)
  const remainingCount = mentors.length - maxDisplay
  const imageUrl = project.image || project.thumbnail_url || "/placeholder.jpg"

  return (
    <Card className="group h-full overflow-hidden rounded-[28px] border border-slate-200/90 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(37,99,235,0.18)] dark:border-neutral-700 dark:bg-neutral-900">
      <CardHeader className="p-3">
        <div className="relative overflow-hidden rounded-[22px] border border-slate-100 bg-slate-100 aspect-[16/10] dark:border-neutral-700 dark:bg-neutral-800">
          <img
            src={imageUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <Badge className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#095095] shadow-lg backdrop-blur">
            {project.category || "Dự án"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col px-6 pb-6 pt-3 sm:px-7 sm:pb-7">
        <CardTitle className="mb-3 line-clamp-2 text-[19px] font-black uppercase leading-tight text-slate-950 transition-colors group-hover:text-[#095095] dark:text-white">
          {project.title}
        </CardTitle>

        <p className="mb-6 line-clamp-3 flex-1 text-sm font-medium leading-7 text-slate-500 dark:text-neutral-400">
          {project.description}
        </p>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-neutral-700 dark:bg-neutral-800/70">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#095095]">
              Mentoring & Coaching
            </span>

            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-400 shadow-sm dark:bg-neutral-900">
              {mentors.length || 1} mentor
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {displayMentors.map((mentor, i) => (
                <Avatar key={i} className="h-10 w-10 border-[3px] border-white shadow-md dark:border-neutral-900">
                  <AvatarImage src={mentor.avatar} className="object-cover" />
                  <AvatarFallback className="bg-blue-50 text-xs font-black text-[#095095]">
                    {mentor.name?.charAt(0) || "G"}
                  </AvatarFallback>
                </Avatar>
              ))}

              {remainingCount > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="z-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-slate-950 text-[10px] font-black text-white shadow-md transition hover:bg-[#095095] dark:border-neutral-900">
                      +{remainingCount}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="z-[100] w-72 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Users size={16} className="text-[#095095]" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        Đội ngũ chuyên gia
                      </span>
                    </div>

                    <div className="max-h-[300px] space-y-4 overflow-y-auto pr-2">
                      {mentors.map((m, idx) => (
                        <Link key={idx} href={m.profile_link || "#"} className="group/item flex items-center gap-3">
                          <Avatar className="h-10 w-10 shadow-sm">
                            <AvatarImage src={m.avatar} />
                            <AvatarFallback className="font-bold">{m.name?.[0] || "G"}</AvatarFallback>
                          </Avatar>

                          <div className="flex flex-col">
                            <span className="text-sm font-black leading-none text-slate-700 transition-colors group-hover/item:text-[#095095]">
                              {m.name}
                            </span>
                            <span className="mt-1.5 text-[10px] font-bold uppercase text-slate-400">
                              {m.title || "Mentor"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                {mentors[0]?.name || "GZV Team"}
              </p>
              <p className="mt-1 truncate text-[10px] font-black uppercase tracking-wide text-slate-400">
                {mentors.length > 1 ? `& ${mentors.length - 1} chuyên gia khác` : "Chuyên gia đào tạo"}
              </p>
            </div>
          </div>
        </div>

        <Link href={`/du-an/${project.slug || project.id}`} className="mt-5">
          <Button className="h-13 w-full rounded-2xl bg-[#095095] text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#063d73]">
            Xem chi tiết dự án
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}