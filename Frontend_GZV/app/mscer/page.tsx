'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { api, MSCer } from "@/lib/api-supabase"
import PageBanner from "@/components/sections/PageBanner"

export default function MSCerPage() {
  const [mscers, setMscers] = useState<MSCer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMscers = async () => {
      try {
        setLoading(true)
        const data = await api.getMSCer()
        // Sắp xếp theo order để đảm bảo thứ tự như CMS
        setMscers(data.sort((a, b) => (a.order || 0) - (b.order || 0)))
      } catch (error) {
        console.error("❌ Error fetching MSCers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMscers()
  }, [])

  return (
    <div className="bg-white dark:bg-gray-900">
      <PageBanner
        badge="Khám phá đội ngũ"
        title="Đội ngũ MSCers"
        subtitle="Kết nối cùng chúng tôi thông qua các chương trình đào tạo và lộ trình phát triển năng lực chuyên sâu."
        stats={[
          { value: `${mscers.length}+`, label: 'Chuyên gia' },
          { value: '100%', label: 'Tâm huyết' },
          { value: '5000+', label: 'Học viên' },
          { value: '95%', label: 'Hài lòng' },
        ]}
      />

      {/* --- Grid Profiles --- */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <Loader2 className="text-blue-600" size={56} />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-black uppercase tracking-widest text-slate-400"
              >
                Đang tải dữ liệu chuyên gia...
              </motion.p>
            </motion.div>
          ) : mscers.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto items-stretch"
              >
                <AnimatePresence mode="popLayout">
                  {mscers.map((mscer, index) => (
                    <motion.div
                      key={mscer.id}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      layout
                      className="flex"
                    >
                      <Card className="flex flex-col w-full border-none bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group relative border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                        {/* Decorative top accent */}
                        <motion.div
                          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          layoutId="accent"
                        />
                        {/* Gloss effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>

                        <CardContent className="p-8 md:p-10 flex flex-col items-center text-center h-full">

                          {/* Enhanced Avatar with ring effect */}
                          <div className="relative mb-8 shrink-0">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="relative w-48 h-48 rounded-full p-1 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-900/30 dark:to-purple-900/30 shadow-2xl overflow-hidden border-4 border-white dark:border-slate-800"
                            >
                              <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-700">
                                <Image
                                  src={mscer.avatar_url || '/MSCers/default.webp'}
                                  alt={mscer.full_name}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-125"
                                />
                              </div>
                            </motion.div>
                            {/* Animated Star Badge */}
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full border-4 border-white dark:border-slate-800 shadow-xl text-white"
                            >
                              <Star size={20} className="fill-white" />
                            </motion.div>
                          </div>

                          {/* Information Container */}
                          <div className="w-full flex flex-col flex-grow">
                            {/* Role Badge */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.08 + 0.1 }}
                              className="inline-flex items-center justify-center mb-4 mx-auto"
                            >
                              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300">
                                {mscer.position}
                              </span>
                            </motion.div>

                            {/* Name */}
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                              {mscer.full_name}
                            </h3>

                            {/* Testimonial / Achievement */}
                            <div className="flex-grow flex items-center justify-center mb-8">
                              <blockquote className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed italic font-medium line-clamp-4">
                                "{mscer.testimonial || mscer.achievement_summary || 'Chuyên gia tài năng trong lĩnh vực của mình'}"
                              </blockquote>
                            </div>

                            {/* View Profile Button */}
                            <div className="w-full mt-auto">
                              <Link href={`/mscer/${mscer.slug}`} className="block group/btn">
                                <motion.button
                                  whileHover={{ y: -2 }}
                                  whileTap={{ y: 0 }}
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-14 text-base font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2 group"
                                >
                                  Xem Hồ Sơ
                                  <motion.div
                                    className="group-hover:translate-x-1 transition-transform"
                                  >
                                    <ArrowRight size={20} />
                                  </motion.div>
                                </motion.button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Result count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-12"
              >
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Hiển thị <span className="font-bold text-slate-700 dark:text-slate-300">{mscers.length}</span> chuyên gia
                </p>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-slate-500 dark:text-slate-400 text-lg">Không có dữ liệu chuyên gia</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
