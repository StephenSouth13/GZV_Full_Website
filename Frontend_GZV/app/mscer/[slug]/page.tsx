'use client'

import { useState, useEffect } from 'react'
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft, Trophy, TrendingUp, Heart, 
  GraduationCap, Briefcase, FileText, Loader2, Wrench, Star 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { api, gzver } from "@/lib/api-supabase"

export default function gzverDetailPage({ params }: { params: { slug: string } }) {
  const [gzver, setgzver] = useState<gzver | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        const data = await api.getgzverBySlug(params.slug)
        if (data) setgzver(data)
      } catch (error) {
        console.error("❌ Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [params.slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-12 w-12 text-blue-600" />
      </motion.div>
    </div>
  )

  if (!gzver) notFound()

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-b from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 pb-20">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/gzver" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs mb-12 transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
            QUAY LẠI CỘNG ĐỒNG gzvERS
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: PROFILE INFO */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="rounded-[3rem] border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white p-10 relative overflow-hidden shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10 text-center">
                  <div className="relative w-44 h-44 mx-auto mb-8">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative w-full h-full"
                    >
                      <Image 
                        src={gzver.avatar_url || '/gzvers/default.webp'} 
                        fill 
                        className="rounded-full border-8 border-white/20 shadow-2xl object-cover" 
                        alt={gzver.full_name} 
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      className="absolute bottom-2 right-2 bg-amber-400 p-3 rounded-full border-4 border-blue-600 shadow-xl"
                    >
                      <Star size={18} className="fill-white text-white" />
                    </motion.div>
                  </div>
                  <h1 className="text-3xl font-black leading-tight mb-2 tracking-tighter">{gzver.full_name}</h1>
                  <p className="font-bold text-blue-100 uppercase text-[10px] tracking-[0.2em] mb-8">{gzver.position}</p>
                  
                  {gzver.cv_url && (
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      <Button asChild className="w-full bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-black h-14 shadow-xl border-none">
                        <a href={gzver.cv_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2" size={18} /> TẢI HỒ SƠ NĂNG LỰC
                        </a>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Skills Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="rounded-[2.5rem] border-none shadow-md hover:shadow-xl transition-all duration-300 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <h3 className="font-black uppercase text-[10px] text-slate-400 tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Wrench size={14} className="text-blue-600" /> Kỹ năng chuyên môn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {gzver.skills?.map((skill: string, idx: number) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Badge className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 px-4 py-2 rounded-full font-bold text-[11px] hover:shadow-md transition-all">
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: DETAILED CONTENT */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Promotion Path */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800"
            >
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 italic text-blue-600 uppercase tracking-tighter">
                <TrendingUp /> Lộ trình thăng tiến
              </h2>
              <div className="p-8 bg-blue-50/50 dark:bg-blue-900/20 rounded-[2rem] border-l-8 border-blue-600">
                <p className="text-xl font-medium leading-relaxed italic text-slate-700 dark:text-slate-200">
                  "{gzver.promotion_path}"
                </p>
              </div>
            </motion.section>

            {/* Achievements & Education Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Achievements */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-xl font-black flex items-center gap-2 text-amber-500 uppercase tracking-tighter">
                  <Trophy /> Thành tựu nổi bật
                </h3>
                <div className="space-y-4">
                  {gzver.achievements_list?.map((item: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="p-5 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 dark:to-transparent rounded-2xl border border-amber-200 dark:border-amber-800/30 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 group"
                    >
                      <span className="text-amber-600 dark:text-amber-400 font-black flex-shrink-0">0{i + 1}</span>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Education */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h3 className="text-xl font-black flex items-center gap-2 text-indigo-500 uppercase tracking-tighter">
                  <GraduationCap /> Nền tảng học vấn
                </h3>
                <div className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border-t-4 border-indigo-500 shadow-sm hover:shadow-md transition-all">
                  <p className="text-sm leading-loose font-medium text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {gzver.background?.education}
                  </p>
                </div>
              </motion.section>
            </div>

            {/* Experience */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800"
            >
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-emerald-600 uppercase tracking-tighter">
                <Briefcase /> Kinh nghiệm thực chiến
              </h2>
              <div className="text-slate-600 dark:text-slate-400 font-medium leading-[2] whitespace-pre-line">
                {gzver.background?.experience}
              </div>
            </motion.section>

            {/* Social Impact */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-rose-600 via-rose-500 to-rose-600 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 relative overflow-hidden transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter relative z-10">
                <Heart className="fill-white" /> Tác động xã hội
              </h2>
              <p className="text-lg font-medium leading-relaxed italic relative z-10 opacity-95">
                {gzver.social_impact}
              </p>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  )
}
