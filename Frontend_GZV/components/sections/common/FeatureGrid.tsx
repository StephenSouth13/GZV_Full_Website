"use client"

import { motion } from "framer-motion"
import { Award, BookOpen, Compass, Cpu, Megaphone, Rocket, ShieldCheck, Target, TrendingUp, Users } from "lucide-react"

const iconMap: Record<string, any> = {
  award: Award,
  book: BookOpen,
  target: Target,
  users: Users,
  compass: Compass,
  shield: ShieldCheck,
  megaphone: Megaphone,
  cpu: Cpu,
  rocket: Rocket,
  trend: TrendingUp,
}

export interface FeatureGridProps {
  title?: string
  subtitle?: string
  items?: any[]
  columns?: number
}

export default function FeatureGrid({ title, subtitle, items = [], columns = 3 }: FeatureGridProps) {
  const gridCols = Number(columns) >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
  return (
    <section className="bg-white py-16 dark:bg-gray-800 sm:py-20">
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mx-auto mb-12 max-w-4xl text-center">
            {title && <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-5xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
        )}
        <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${gridCols}`}>
          {items.map((item: any, index: number) => {
            const Icon = iconMap[item.icon] || Award
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                <div className="h-full border border-slate-100 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#ed1c24] hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center bg-white shadow-sm dark:bg-slate-800">
                    <Icon className="h-7 w-7" style={{ color: item.color || "#ed1c24" }} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{item.title}</h3>
                  {item.description && <p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">{item.description}</p>}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
