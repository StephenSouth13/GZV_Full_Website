"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProjectCard from "@/components/ProjectCard"
import { api, type Project } from "@/lib/api-supabase"
import { getHomeSectionConfig, type HomeSectionConfig } from "@/lib/site-content"

const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [section, setSection] = useState<HomeSectionConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([api.getProjects(), getHomeSectionConfig("projects")])
      .then(([projectsData, config]) => {
        if (!active) return
        setSection(config)
        const featuredOnly = projectsData.filter((p: any) => p.featured === true)
        const limit = config?.item_limit || 6
        setProjects((featuredOnly.length > 0 ? featuredOnly : projectsData).slice(0, limit))
      })
      .catch(() => setProjects([]))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [])

  if (!loading && section?.is_visible === false) return null

  return (
    <section className="py-24 bg-gray-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight uppercase">
            {section?.title || "Dự án tiêu biểu"}
          </h2>
          {(section?.subtitle || section?.description) && (
            <p className="text-xl text-gray-500 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
              {section?.subtitle || section?.description}
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[450px] bg-white dark:bg-neutral-800 animate-pulse rounded-[2.5rem] shadow-sm" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        ) : null}

        {section?.button_label && section?.button_url && projects.length > 0 && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link href={section.button_url}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 h-auto text-lg font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                {section.button_label} <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default ProjectsSection
