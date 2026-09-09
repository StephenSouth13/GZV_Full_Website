"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Linkedin, Facebook, Globe, GraduationCap, Briefcase, Award } from "lucide-react"

export function MentorQuickView({ isOpen, onClose, mentor }: any) {
  if (!mentor) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-none border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-950 dark:text-white sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Left Column: Avatar & Basic Info */}
          <div className="flex flex-col items-center text-center md:w-1/3 shrink-0">
            <div className="h-32 w-32 overflow-hidden rounded-none border-2 border-[#ed1c24] bg-slate-100 shadow-md dark:bg-slate-900">
              <img
                src={mentor.avatar_url || "/placeholder.svg"}
                alt={mentor.full_name}
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="mt-3 text-base font-black uppercase tracking-tight">{mentor.full_name}</h2>
            <p className="mt-0.5 text-[10px] font-mono text-slate-400">/{mentor.slug}</p>
            <Badge className="mt-2 rounded-none bg-[#ed1c24] text-white hover:bg-[#ed1c24] border-none text-[10px] uppercase font-bold">
              {mentor.title || "Chuyên gia"}
            </Badge>

            <div className="mt-4 flex items-center gap-3">
              {mentor.linkedin_url && (
                <a
                  href={mentor.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 transition hover:text-[#ed1c24]"
                >
                  <Linkedin size={16} />
                </a>
              )}
              {mentor.facebook_url && (
                <a
                  href={mentor.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 transition hover:text-[#ed1c24]"
                >
                  <Facebook size={16} />
                </a>
              )}
              {mentor.portfolio_url && (
                <a
                  href={mentor.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 transition hover:text-[#ed1c24]"
                >
                  <Globe size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Bio & Details */}
          <div className="space-y-4 md:w-2/3">
            {mentor.description && (
              <div className="border-l-2 border-[#ed1c24] bg-slate-50 p-3 italic text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                "{mentor.description}"
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 border border-slate-200 p-3 dark:border-white/10">
                <h4 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#ed1c24]">
                  <GraduationCap size={13} /> Học vấn & Đào tạo
                </h4>
                <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed font-medium">
                  {mentor.background?.education || "Chưa cập nhật"}
                </div>
              </div>

              <div className="space-y-1.5 border border-slate-200 p-3 dark:border-white/10">
                <h4 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Briefcase size={13} /> Kinh nghiệm thực chiến
                </h4>
                <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed font-medium">
                  {mentor.background?.experience || "Chưa cập nhật"}
                </div>
              </div>
            </div>

            {mentor.specialties && mentor.specialties.length > 0 && (
              <div className="space-y-1.5 border border-slate-200 p-3 dark:border-white/10">
                <h4 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  <Award size={13} /> Lĩnh vực chuyên môn
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mentor.specialties.map((item: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-2 py-0.5"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}