"use client"

import SectionIntro from "@/components/sections/common/SectionIntro"

export interface TimelineBlockProps {
  title?: string
  subtitle?: string
  items?: any[]
}

export default function TimelineBlock({ title, subtitle, items = [] }: TimelineBlockProps) {
  return (
    <section className="bg-slate-50 py-16 text-slate-950 dark:bg-slate-900 dark:text-white lg:py-24">
      <div className="container px-4">
        <SectionIntro title={title} subtitle={subtitle} align="left" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item: any, index: number) => (
            <article key={index} className="border border-slate-200 bg-white p-6 dark:border-white/12 dark:bg-slate-950">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#ed1c24]">{item.year || item.label}</p>
              <h3 className="mt-4 text-xl font-black uppercase leading-tight text-slate-950 dark:text-white">{item.title}</h3>
              {item.description && <p className="mt-3 text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
