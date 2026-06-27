"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import MentorCard from "../MentorCard"
import { api, Mentor } from "@/lib/api-supabase"

type MentorCardData = {
  id: string
  slug: string
  name: string
  title: string
  degree: string
  avatar: string
}

const fallbackMentors: MentorCardData[] = [
  {
    id: "phan-huynh-anh",
    slug: "phan-huynh-anh",
    name: "TS. Phan Huỳnh Anh",
    title: "Tiến sĩ Kinh tế",
    degree: "Chủ tịch HĐQT Công ty Smentor",
    avatar: "/Mentors/PHA.webp",
  },
  {
    id: "hoang-cuu-long",
    slug: "hoang-cuu-long",
    name: "Hoàng Cửu Long",
    title: "Phó Giáo sư - Tiến sĩ",
    degree: "Giảng viên Đại học Kinh tế TP. Hồ Chí Minh",
    avatar: "/Mentors/HCL.webp",
  },
  {
    id: "doan-duc-minh",
    slug: "doan-duc-minh",
    name: "Đoàn Đức Minh",
    title: "Thạc sĩ - Nghiên cứu sinh",
    degree: "Giảng viên Đại học Western Sydney",
    avatar: "/Mentors/DDM.webp",
  },
  {
    id: "nguyen-chi-thanh",
    slug: "nguyen-chi-thanh",
    name: "Nguyễn Chí Thành",
    title: "CEO",
    degree: "Làng Kết nối Kinh doanh VABIX",
    avatar: "/Mentors/NCT.webp",
  },
  {
    id: "le-nhat-truong-chinh",
    slug: "le-nhat-truong-chinh",
    name: "Lê Nhật Trường Chinh",
    title: "CEO & Founder",
    degree: "SUCCESS Partner Co.Ltd",
    avatar: "/Mentors/LNTC.webp",
  },
  {
    id: "phan-phat-huy",
    slug: "phan-phat-huy",
    name: "Phan Phát Huy",
    title: "CEO & Founder",
    degree: "HILTOW LANDMARK",
    avatar: "/Mentors/PPH.webp",
  },
]

const toMentorCard = (mentor: Mentor): MentorCardData => ({
  id: mentor.id,
  slug: mentor.slug,
  name: mentor.full_name,
  title: mentor.title || mentor.company || "",
  degree: mentor.organizations || mentor.company || mentor.description || "",
  avatar: mentor.avatar_url || "/Mentors/default.webp",
})

const MentorsSection = () => {
  const [mentors, setMentors] = useState<MentorCardData[]>(fallbackMentors)

  useEffect(() => {
    let active = true

    api.getMentors().then(data => {
      if (!active || data.length === 0) return
      setMentors(data.slice(0, 6).map(toMentorCard))
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-6">Ban Giảng Huấn</h2>
          <p className="section-description">
            Đội ngũ Ban giảng huấn Mentoring & Coaching của GZV Center
          </p>
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/mentors">
            <Button size="lg" className="btn-primary">
              Xem tất cả mentors
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default MentorsSection
