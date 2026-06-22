'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Users, BookOpen, ChevronRight, GraduationCap, Briefcase, Sparkles, Loader2, Award,TrendingUp, Star, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api, Mentor } from "@/lib/api-supabase"
import { mentorDetails } from "@/data/mentor-detail"
import PageBanner from "@/components/sections/PageBanner"

// Helper to convert mentorDetails to Mentor
function convertToMentor(detail: any): Mentor {
  return {
    id: detail.id,
    full_name: detail.name,
    slug: detail.slug,
    title: detail.title,
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
      education: "",
      experience: ""
    },
    is_active: true
  }
}

export default function MentorsPage() {
  const [activeTab, setActiveTab] = useState('faculty')
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true)
        const data = await api.getMentors()

        // If Supabase is empty, use local data
        if (data && data.length > 0) {
          setMentors(data.sort((a, b) => (a.order || 0) - (b.order || 0)))
        } else {
          // Fallback to local data
          const localMentors = mentorDetails.map(convertToMentor)
          setMentors(localMentors)
        }
      } catch (error) {
        console.error("❌ Error fetching mentors:", error)
        // Fallback to local data on error
        const localMentors = mentorDetails.map(convertToMentor)
        setMentors(localMentors)
      } finally {
        setLoading(false)
      }
    }
    fetchMentors()
  }, [])

  const teachingMethods = [
    { 
      icon: GraduationCap, 
      title: "10% - Học tập chính quy", 
      text: "Nắm vững kiến thức nền tảng và các mô hình quản trị tiên tiến thông qua bài giảng chuyên sâu từ các chuyên gia.",
      color: "from-blue-600 to-indigo-600"
    },
    { 
      icon: Users, 
      title: "20% - Học hỏi xã hội", 
      text: "Tương tác, thảo luận và nhận sự dẫn dắt (mentoring) trực tiếp từ những người đi trước giàu kinh nghiệm.",
      color: "from-teal-500 to-emerald-500"
    },
    { 
      icon: Briefcase, 
      title: "70% - Học qua trải nghiệm", 
      text: "Áp dụng kiến thức vào dự án thực tế, giải quyết các bài toán doanh nghiệp để hình thành năng lực thực chiến.",
      color: "from-orange-500 to-red-500"
    }
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="bg-white dark:bg-gray-950">
      <PageBanner
        badge="Lãnh đạo & Chuyên gia hàng đầu"
        title="Ban Giảng Huấn"
        subtitle="Nơi hội tụ những nhà lãnh đạo, chuyên gia đầu ngành mang tâm thế phụng sự và khát vọng chuyển giao tri thức"
        stats={[
          { value: '20+', label: 'Chuyên gia hàng đầu' },
          { value: '15+', label: 'Năm kinh nghiệm' },
          { value: '1000+', label: 'Học viên' },
          { value: '100%', label: 'Tâm huyết' },
        ]}
      />

      {/* ===== STICKY TAB NAVIGATION ===== */}
      <section className="sticky top-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-30 border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 md:gap-4 overflow-x-auto py-4 custom-scrollbar">
            {[
              { id: 'faculty', label: 'Ban Giảng Huấn', icon: Users },
              { id: 'methods', label: 'Phương pháp 70-20-10', icon: BookOpen },
              { id: 'successors', label: 'Phát triển Kế thừa', icon: Sparkles },
            ].map((tab) => (
              <motion.div key={tab.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className={`rounded-xl px-6 h-12 font-bold uppercase text-[11px] tracking-widest transition-all duration-300 flex-shrink-0 ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <tab.icon className="mr-2 h-4 w-4" /> {tab.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto py-24 px-4">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: BAN GIẢNG HUẤN (MENTOR GRID) */}
          {activeTab === 'faculty' && (
            <motion.div key="faculty" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="text-blue-600 h-12 w-12" />
                  </motion.div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest mt-4">Đang tải danh sách chuyên gia...</span>
                </div>
              ) : (
                <>
                  {/* Intro Text */}
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">
                      Đội Ngũ Chuyên Gia Hàng Đầu
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                      Những chuyên gia giàu kinh nghiệm, có tâm huyết giáo dục, sẵn sàng chia sẻ và hướng dẫn bạn trên con đường phát triển chuyên nghiệp.
                    </p>
                  </div>

                  {/* Mentor Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mentors.map((mentor) => (
                      <motion.div key={mentor.id} variants={itemVariants}>
                        <Link href={`/mentors/${mentor.slug}`}>
                          <Card className="h-full flex flex-col group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden text-center cursor-pointer relative">
                            {/* Hover Background Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <CardContent className="p-10 flex flex-col items-center h-full relative z-10">
                              {/* Avatar with Ring */}
                              <div className="relative w-44 h-44 mb-8">
                                <div className="absolute inset-0 rounded-full border-[6px] border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                  <Image 
                                    src={mentor.avatar_url || "/Mentors/default.webp"} 
                                    alt={mentor.full_name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                  />
                                </div>
                                {/* Star Badge */}
                                <div className="absolute bottom-1 right-1 bg-gradient-to-br from-amber-400 to-amber-500 p-3 rounded-full border-4 border-white dark:border-gray-900 shadow-lg">
                                  <Star size={16} className="fill-white text-white" />
                                </div>
                              </div>

                              {/* Name */}
                              <CardTitle className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight group-hover:text-blue-600 transition-colors uppercase">
                                {mentor.full_name}
                              </CardTitle>

                              {/* Title Badge */}
                              <Badge className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-300 border-none px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                                {mentor.title}
                              </Badge>

                              {/* Description */}
                              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-10 leading-relaxed italic line-clamp-3 px-2 flex-grow">
                                "{mentor.description || (typeof mentor.organizations === 'string' ? mentor.organizations : 'Chuyên gia tài năng')}"
                              </p>

                              {/* CTA Button */}
                              <div className="w-full mt-auto">
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black h-14 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 gap-2 group/btn uppercase text-xs tracking-widest">
                                  XEM HỒ SƠ 
                                  <motion.div
                                    initial={{ x: 0 }}
                                    whileHover={{ x: 4 }}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </motion.div>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB 2: PHƯƠNG PHÁP (70-20-10 MODEL) */}
          {activeTab === 'methods' && (
            <motion.div key="methods" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6">
                  Mô Hình Đào Tạo <span className="text-blue-600">70-20-10</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                  Chúng tôi áp dụng mô hình chuẩn quốc tế, kết hợp lý thuyết, tương tác xã hội và trải nghiệm thực chiến để phát triển năng lực toàn diện.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {teachingMethods.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card className="border-none bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-md hover:shadow-2xl transition-all duration-500 text-center group h-full">
                      <div className={`w-24 h-24 rounded-[2rem] bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                        <item.icon className="text-white w-12 h-12" />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{item.text}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: NHÂN SỰ KẾ THỪA (TALENT DEVELOPMENT) */}
          {activeTab === 'successors' && (
            <motion.div key="successors" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-4xl mx-auto py-12">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-500/40">
                <Sparkles className="text-white w-12 h-12 animate-pulse" />
              </div>

              <h2 className="text-5xl font-black mb-8 uppercase tracking-tighter text-gray-900 dark:text-white">
                Phát Triển Tài Năng <span className="text-blue-600">Kế Thừa</span>
              </h2>

              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium italic mb-12">
                "Chương trình chiến lược nhằm phát hiện, bồi dưỡng và đồng hành cùng thế hệ lãnh đạo trẻ, định hướng trở thành những nhân sự cốt cán trong hệ sinh thái MSC Center."
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { icon: GraduationCap, title: 'Phát hiện Tài năng', desc: 'Tìm kiếm và đánh giá những ứng viên tiềm năng' },
                  { icon: Award, title: 'Bồi dưỡng Kỹ năng', desc: 'Đào tạo chuyên sâu qua mentoring trực tiếp' },
                  { icon: TrendingUp, title: 'Thăng tiến Sự nghiệp', desc: 'Tạo cơ hội phát triển và lãnh đạo' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 text-center">
                      <item.icon className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-black text-gray-900 dark:text-white mb-2 uppercase text-sm">{item.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Link href="/lien-he">
                <Button size="lg" className="rounded-full px-14 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-500/30">
                  <ArrowUpRight className="mr-2" size={20} /> Nhận Tư Vấn Lộ Trình
                </Button>
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
