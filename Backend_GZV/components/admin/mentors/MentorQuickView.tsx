"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Linkedin, Facebook, Globe, GraduationCap, Briefcase } from 'lucide-react'

export function MentorQuickView({ isOpen, onClose, mentor }: any) {
  if (!mentor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-gray-900 border-white/10 text-white rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
        <div className="flex gap-10">
          <div className="w-1/3 flex flex-col items-center text-center space-y-4">
            <div className="w-40 h-40 rounded-full border-4 border-blue-500/20 overflow-hidden shadow-2xl">
              <img src={mentor.avatar_url} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-black uppercase leading-tight">{mentor.full_name}</h2>
            <Badge className="bg-blue-600 text-white border-none">{mentor.title}</Badge>
            <div className="flex gap-3 pt-4">
               {mentor.linkedin_url && <Linkedin className="text-gray-500" size={18}/>}
               {mentor.facebook_url && <Facebook className="text-gray-500" size={18}/>}
               {mentor.portfolio_url && <Globe className="text-gray-500" size={18}/>}
            </div>
          </div>

          <div className="w-2/3 space-y-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 italic text-gray-300">
               "{mentor.description}"
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div>
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><GraduationCap size={14}/> Học vấn</h4>
                  <div className="text-xs text-gray-400 whitespace-pre-line leading-relaxed">{mentor.background?.education}</div>
               </div>
               <div>
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Briefcase size={14}/> Kinh nghiệm</h4>
                  <div className="text-xs text-gray-400 whitespace-pre-line leading-relaxed">{mentor.background?.experience}</div>
               </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}