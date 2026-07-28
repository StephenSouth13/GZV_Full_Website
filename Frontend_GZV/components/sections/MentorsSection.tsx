"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import MentorCard from "../MentorCard"
import { api, Mentor } from "@/lib/api-supabase"
import { getHomeSectionConfig, type HomeSectionConfig } from "@/lib/site-content"

type MentorCardData = {
  id: string
  slug: string
  name: string
  title: string
  degree: string
  avatar: string
}

const toMentorCard = (mentor: Mentor): MentorCardData => ({
  id: mentor.id,
  slug: mentor.slug,
  name: mentor.full_name,
  title: mentor.title || mentor.company || "",
  degree: mentor.organizations || mentor.company || mentor.description || "",
  avatar: mentor.avatar_url || "/placeholder-user.jpg",
})

const MentorsSection = () => {
  const [mentors, setMentors] = useState<MentorCardData[]>([])
  const [section, setSection] = useState<HomeSectionConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([api.getMentors(), getHomeSectionConfig("mentors")])
      .then(([data, config]) => {
        if (!active) return
        setSection(config)
        setMentors((data || []).slice(0, config?.item_limit || 6).map(toMentorCard))
      })
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [])

  if (loading || section?.is_visible === false || mentors.length === 0) return null

  return (
    <section className="border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-gray-900">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {section?.title && <h2 className="section-title mb-6">{section.title}</h2>}
          {(section?.subtitle || section?.description) && (
            <p className="section-description">{section?.subtitle || section?.description}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {mentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <MentorCard {...mentor} />
            </motion.div>
          ))}
        </div>

        {section?.button_label && section?.button_url && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href={section.button_url}>
              <Button size="lg" className="btn-primary">
                {section.button_label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default MentorsSection
