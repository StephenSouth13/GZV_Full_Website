"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface MentorCardProps {
  id: string
  slug?: string
  name: string
  title: string
  degree: string
  avatar: string
  specialties?: string[]
  linkPrefix?: "mentors" | "gzver"
}

export default function MentorCard({
  id,
  slug,
  name,
  title,
  degree,
  avatar,
  specialties = [],
  linkPrefix = "mentors",
}: MentorCardProps) {
  return (
    <Link href={`/${linkPrefix}/${slug || id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="group cursor-pointer border border-slate-200 bg-white p-6 text-center shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:border-[#ed1c24] dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mx-auto mb-5 h-40 w-40 overflow-hidden border-4 border-slate-100 transition group-hover:border-[#ed1c24] dark:border-slate-800">
          <Image
            src={avatar || "/placeholder.svg"}
            alt={name}
            width={160}
            height={160}
            unoptimized={true}
            className="w-full h-full object-cover"
          />
        </div>

        <h3 className="mb-1 text-lg font-black uppercase text-gray-900 dark:text-white">
          {name}
        </h3>
        <p className="mb-1 font-bold text-[#ed1c24] dark:text-red-200">
          {title}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {degree}
        </p>

        {/* 
{specialties && specialties.length > 0 && (
  <div className="mt-2 flex flex-wrap justify-center gap-2">
    {specialties.map((s) => (
      <span
        key={s}
        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full"
      >
        {s}
      </span>
    ))}
  </div>
)} 
*/}

      </motion.div>
    </Link>
  )
}
