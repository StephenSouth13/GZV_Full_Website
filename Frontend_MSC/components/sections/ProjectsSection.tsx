"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProjectCard from "@/components/ProjectCard" 
import { api, type Project } from "@/lib/api-supabase"

const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const projectsData = await api.getProjects()
        // Chỉ lấy các dự án có featured === true
        const featuredOnly = projectsData.filter((p: any) => p.featured === true)
        setProjects(featuredOnly)
      } catch (error) {
        console.error('❌ ProjectsSection Error:', error)
        setProjects([]) 
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // Lấy tối đa 6 dự án tiêu biểu nhất
  const displayProjects = projects.slice(0, 6)

  return (
    <section className="py-24 bg-gray-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        {/* Tiêu đề Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight uppercase ">
            DỰ ÁN TIÊU BIỂU
          </h2>
          <p className="text-xl text-gray-500 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Khám phá các dự án đào tạo thực tế tiêu biểu nhất do MSC Center triển khai.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[450px] bg-white dark:bg-neutral-800 animate-pulse rounded-[2.5rem] shadow-sm" />
            ))}
          </div>
        ) : displayProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {displayProjects.map((project, index) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Sử dụng ProjectCard để hiển thị khung dự án. 
                  Lưu ý: Bạn nên cập nhật nội dung dưới đây vào FILE ProjectCard.tsx 
                  để tối ưu hóa code.
                */}
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700 mb-12">
            <p className="text-gray-500 font-medium italic">Chưa có dự án tiêu biểu nào được chọn.</p>
          </div>
        )}  
        
        {/* Nút Xem tất cả */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Link href="/du-an">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 h-auto text-lg font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
              Xem tất cả dự án <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default ProjectsSection;