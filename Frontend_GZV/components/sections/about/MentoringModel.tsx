"use client"

import SectionIntro from "@/components/sections/common/SectionIntro"

export interface MentoringModelProps {
  title?: string
  subtitle?: string
  steps?: any[]
}

export default function MentoringModel({ title, subtitle, steps = [] }: MentoringModelProps) {
  return (
    <section className="bg-white py-16 text-slate-950 dark:bg-slate-950 dark:text-white lg:py-24">
      <div className="container px-4">
        <SectionIntro title={title} subtitle={subtitle} align="left" />
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step: any, index: number) => (
            <article key={index} className="border border-slate-200 bg-slate-50 p-7 shadow-[12px_12px_0_rgba(237,28,36,0.08)] dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-6 flex h-12 w-12 items-center justify-center bg-[#ed1c24] text-lg font-black text-white">{index + 1}</div>
              <h3 className="text-xl font-black uppercase text-slate-950 dark:text-white">{step.title}</h3>
              {step.description && <p className="mt-3 text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">{step.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
