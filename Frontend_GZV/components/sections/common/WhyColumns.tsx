"use client"

import SectionIntro from "@/components/sections/common/SectionIntro"

export interface WhyColumnsProps {
  title?: string
  subtitle?: string
  columns?: any[]
  language?: "vi" | "en"
}

export default function WhyColumns({ title, subtitle, columns = [], language = "vi" }: WhyColumnsProps) {
  return (
    <section className="bg-white py-16 dark:bg-slate-950 lg:py-24">
      <div className="container px-4">
        <SectionIntro title={title} subtitle={subtitle} align="center" />
        <div className="grid gap-5 md:grid-cols-3">
          {columns.map((column: any, index: number) => (
            <article key={index} className="border border-slate-200 bg-slate-50 p-7 dark:border-white/10 dark:bg-slate-900">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#ed1c24]">{language === "en" ? "Column" : "Cột"} {index + 1}</p>
              <h3 className="text-xl font-black uppercase text-slate-950 dark:text-white">{column.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">{column.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
