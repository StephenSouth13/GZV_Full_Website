'use client'

import { useState, useEffect } from 'react'
import { notFound } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft, Trophy, TrendingUp, Heart, 
  GraduationCap, Briefcase, Mail, Phone, Loader2, Wrench, Star, ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { api, Mentor } from "@/lib/api-supabase"
import { mentorDetails } from "@/data/mentor-detail"

function convertToMentor(detail: any): Mentor {
  return {
    id: detail.id || "",
    full_name: detail.name || "Unknown",
    slug: detail.slug || "",
    title: detail.title || "",
    description: detail.role || detail.bio || "",
    email: detail.personalInfo?.["Email"] || "",
    phone: detail.personalInfo?.["Điện thoại"] || "",
    avatar_url: detail.avatar || "/Mentors/default.webp",
    organizations: detail.organization?.join(", ") || "",
    company: detail.organization?.[0] || "",
    specialties: detail.subjects || [],
    practical_projects: detail.practicalWorks || [],
    research_projects: detail.researchProjects || [],
    awards: detail.awards || [],
    tech_business_achievements: detail.achievements || [],
    background: {
      education: Array.isArray(detail.education) 
        ? detail.education.map((e: any) => typeof e === 'string' ? e : `${e.degree} - ${e.school} (${e.year})`).join("\n")
        : "",
      experience: detail.workHistory?.join("\n") || ""
    },
    is_active: true
  }
}

export default function MentorDetailPage({ params }: { params: { slug: string } }) {
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getMentorBySlug(params.slug)
        if (data) {
          setMentor(data)
          return
        }

        const localMentor = mentorDetails.find(m => m.slug === params.slug)
        if (localMentor) {
          setMentor(convertToMentor(localMentor))
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
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

  if (!mentor) notFound()

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 pb-20">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/mentors" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold text-xs mb-12 transition-all group">
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
            QUAY LẠI BAN GIẢNG HUẤN
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN */}
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
                  {/* Avatar */}
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative w-full h-full"
                    >
                      <img 
                        src={mentor.avatar_url} 
                        alt={mentor.full_name}
                        className="w-full h-full rounded-full border-8 border-white/20 shadow-2xl object-cover" 
                        onError={(e) => {
                          e.currentTarget.src = '/Mentors/default.webp'
                        }}
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      className="absolute bottom-2 right-2 bg-amber-400 p-3 rounded-full border-4 border-blue-600 shadow-xl"
                    >
                      <Star size={18} className="fill-white text-white" />
                    </motion.div>
                  </div>
                  
                  <h1 className="text-3xl font-black leading-tight mb-3 tracking-tighter">{mentor.full_name}</h1>
                  <p className="font-bold text-blue-100 uppercase text-[11px] tracking-[0.2em] mb-8">{mentor.title}</p>
                  
                  {/* Contact Info */}
                  {(mentor.email || mentor.phone) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3 text-sm mb-8"
                    >
                      {mentor.email && (
                        <div className="flex items-center gap-2 justify-center text-blue-100 hover:text-white transition-colors">
                          <Mail size={14} />
                          <a href={`mailto:${mentor.email}`}>{mentor.email}</a>
                        </div>
                      )}
                      {mentor.phone && (
                        <div className="flex items-center gap-2 justify-center text-blue-100 hover:text-white transition-colors">
                          <Phone size={14} />
                          <a href={`tel:${mentor.phone}`}>{mentor.phone}</a>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <Button asChild className="w-full bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-black h-14 shadow-xl border-none">
                      <Link href="/lien-he">
                        <ExternalLink className="mr-2" size={18} /> LIÊN HỆ MENTOR
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Specialties */}
            {mentor.specialties && mentor.specialties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="rounded-[2.5rem] border-none shadow-md hover:shadow-xl transition-all duration-300 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <h3 className="font-black uppercase text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Wrench size={14} className="text-blue-600" /> Chuyên môn
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.specialties.map((s, idx) => (
                      <motion.div
                        key={s}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Badge className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 px-4 py-2 rounded-full font-bold text-[10px] hover:shadow-md transition-all">
                          {s}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Biography */}
            {mentor.description && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800"
              >
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 italic text-blue-600 uppercase tracking-tighter">
                  <TrendingUp /> Tiểu sử
                </h2>
                <div className="p-8 bg-blue-50/50 dark:bg-blue-900/20 rounded-[2rem] border-l-8 border-blue-600">
                  <p className="text-lg font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                    {mentor.description}
                  </p>
                </div>
              </motion.section>
            )}

            {/* Education & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mentor.background?.education && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-black flex items-center gap-2 text-indigo-500 uppercase tracking-tighter">
                    <GraduationCap /> Nền tảng học vấn
                  </h3>
                  <div className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border-t-4 border-indigo-500 shadow-sm hover:shadow-md transition-all">
                    <p className="text-sm leading-loose font-medium text-slate-600 dark:text-slate-400 whitespace-pre-line">
                      {mentor.background.education}
                    </p>
                  </div>
                </motion.section>
              )}

              {mentor.background?.experience && (
                <motion.section
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-black flex items-center gap-2 text-emerald-500 uppercase tracking-tighter">
                    <Briefcase /> Kinh nghiệm chuyên sâu
                  </h3>
                  <div className="p-8 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2.5rem] border-t-4 border-emerald-500 shadow-sm hover:shadow-md transition-all">
                    <p className="text-sm leading-loose font-medium text-slate-600 dark:text-slate-400 whitespace-pre-line">
                      {mentor.background.experience}
                    </p>
                  </div>
                </motion.section>
              )}
            </div>

            {/* Practical Projects */}
            {mentor.practical_projects && mentor.practical_projects.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800"
              >
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-orange-500 uppercase tracking-tighter">
                  <Trophy /> Dự án thực tiễn
                </h2>
                <div className="space-y-4">
                  {mentor.practical_projects.map((project, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="p-5 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-900/10 dark:to-transparent rounded-2xl border border-orange-200 dark:border-orange-800/30 shadow-sm hover:shadow-md transition-all flex gap-4 group"
                    >
                      <span className="text-orange-600 dark:text-orange-400 font-black text-lg flex-shrink-0">0{i + 1}</span>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">{project}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Research Projects */}
            {mentor.research_projects && mentor.research_projects.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800"
              >
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-purple-500 uppercase tracking-tighter">
                  <TrendingUp /> Dự án nghiên cứu
                </h2>
                <div className="space-y-4">
                  {mentor.research_projects.map((project, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="p-5 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/10 dark:to-transparent rounded-2xl border border-purple-200 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all flex gap-4 group"
                    >
                      <span className="text-purple-600 dark:text-purple-400 font-black text-lg flex-shrink-0">0{i + 1}</span>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">{project}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Awards */}
            {mentor.awards && mentor.awards.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-10 rounded-[3.5rem] border border-amber-100 dark:border-amber-800/30 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-amber-600 uppercase tracking-tighter">
                  <Trophy className="fill-amber-600" /> Giải thưởng & Công nhận
                </h2>
                <div className="space-y-4">
                  {mentor.awards.map((award, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-amber-100 dark:border-amber-800/30 shadow-sm hover:shadow-md transition-all flex gap-4 group"
                    >
                      <span className="text-amber-600 dark:text-amber-400 font-black text-lg flex-shrink-0">★</span>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">{award}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Organizations */}
            {mentor.organizations && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-600 to-indigo-600 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 relative overflow-hidden transition-all duration-500"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter relative z-10">
                  <Briefcase className="fill-white" /> Tổ chức công tác
                </h2>
                <p className="text-lg font-medium leading-relaxed italic relative z-10 opacity-95">
                  {mentor.organizations}
                </p>
              </motion.section>
            )}
          </div>
        </div>

        {/* Related Mentors Link */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800"
        >
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter">Các Mentor Khác</h2>
          <div className="text-center py-8">
            <Link href="/mentors" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-lg group">
              Xem danh sách đầy đủ Ban Giảng Huấn
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
