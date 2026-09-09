"use client"

import React from "react"
import { motion } from "framer-motion"

export interface StatItem {
  value: string
  label: string
  description?: string
}

export interface StatsBarProps {
  stats?: StatItem[]
  columns?: number
  className?: string
}

export default function StatsBar({
  stats = [
    { value: "10+", label: "Năm kinh nghiệm", description: "Đồng hành và phát triển" },
    { value: "5000+", label: "Học viên", description: "Tham gia đào tạo" },
    { value: "50+", label: "Doanh nghiệp", description: "Đối tác chiến lược" },
    { value: "98%", label: "Hài lòng", description: "Đánh giá chất lượng" },
  ],
  columns = 4,
  className = "",
}: StatsBarProps) {
  if (!stats || stats.length === 0) return null

  const gridColsClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-2 lg:grid-cols-4"

  return (
    <section className={`relative overflow-hidden bg-white dark:bg-slate-900 py-10 sm:py-12 border-b border-slate-200/80 dark:border-white/10 ${className}`}>
      <div className="container relative z-10 mx-auto px-4">
        <div className={`grid gap-4 sm:gap-6 ${gridColsClass}`}>
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="relative overflow-hidden border border-slate-100 bg-slate-50/70 p-6 text-center transition hover:border-[#ed1c24]/40 hover:bg-red-50/20 dark:border-white/5 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#ed1c24]">
                {stat.value}
              </div>
              <div className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {stat.label}
              </div>
              {stat.description && stat.description.trim() !== "" && (
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {stat.description}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
