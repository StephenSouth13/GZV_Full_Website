'use client'

import { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, ArrowRight, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api, gzver } from "@/lib/api-supabase"

export default function DirectorsSection() {
  const [directors, setDirectors] = useState<gzver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        setLoading(true)
        // Lấy toàn bộ dữ liệu gzvers đã được sắp xếp order từ API
        const data = await api.getGzvers()
        
        /**
         * LOGIC LỌC TỰ ĐỘNG:
         * Chỉ lấy những người được bật switch "is_director" trong CMS.
         */
        const filtered = data.filter(gzver => gzver.is_director && gzver.is_active);

        setDirectors(filtered)
      } catch (error) {
        console.error("❌ Error fetching Directors:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDirectors()
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  )

  if (directors.length === 0) return null

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6 text-center">
        {/* --- Header Section --- */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
        
            <h2 className="section-title mb-6">
              BAN CHỦ NHIỆM 
            </h2>
          </div>
          <p className="section-description">
            Đội ngũ lãnh đạo nòng cốt định hướng chiến lược tại gzv Center.
          </p>
        </motion.div>

        {/* --- Grid Layout: Luôn cân xứng tuyệt đối --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto items-stretch text-center">
          {directors.map((director, index) => (
            <motion.div
              key={director.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex"
            >
              <Card className="flex flex-col w-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(37,99,235,0.15)] transition-all duration-500 overflow-hidden relative group">
                <CardContent className="p-10 flex flex-col items-center h-full">
                  
                  {/* Avatar & Badge chuẩn mẫu */}
                  <div className="relative mb-8 shrink-0">
                    <div className="relative w-40 h-40 rounded-full p-1 bg-white dark:bg-slate-800 shadow-xl overflow-hidden border border-slate-100">
                      <Image
                        src={director.avatar_url || '/gzvers/default.webp'}
                        alt={director.full_name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    {/* Badge xanh dương chuẩn vị trí ảnh mẫu */}
                    <div className="absolute bottom-1 right-1 bg-[#3b82f6] p-2.5 rounded-full border-[4px] border-white dark:border-slate-900 shadow-lg text-white transform transition-transform group-hover:rotate-12">
                      <Star size={18} className="fill-white" />
                    </div>
                  </div>

                  <div className="w-full flex flex-col flex-grow">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2 uppercase group-hover:text-blue-600 transition-colors">
                      {director.full_name}
                    </h3>
                    
                    <p className="text-[#3b82f6] font-extrabold text-lg uppercase tracking-wide mb-6">
                      {director.position}
                    </p>

                    <div className="flex-grow flex items-center justify-center mb-8">
                      <blockquote className="text-slate-500 dark:text-slate-400 text-base italic leading-relaxed px-4">
                        "{director.achievement_summary || director.testimonial}"
                      </blockquote>
                    </div>

                    <div className="w-full mt-auto pt-4">
                      <Link href={`/gzver/${director.slug}`} className="block">
                        <Button className="w-full btn-primary rounded-lg h-12 text-sm font-semibold gap-2">
                          Xem Hồ Sơ <ArrowRight size={18} />
                        </Button>
                      </Link>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
