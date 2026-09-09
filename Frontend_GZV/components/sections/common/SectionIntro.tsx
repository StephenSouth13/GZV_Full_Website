"use client"

export interface SectionIntroProps {
  eyebrow?: string
  title?: string
  subtitle?: string
  align?: "left" | "center"
  invert?: boolean
}

export default function SectionIntro({ title, subtitle, align = "left", invert = false }: SectionIntroProps) {
  if (!title && !subtitle) return null
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} mb-10 max-w-4xl`}>
      {title && <h2 className={`text-3xl font-black uppercase leading-tight tracking-normal sm:text-5xl ${invert ? "text-white" : "text-slate-950 dark:text-white"}`}>{title}</h2>}
      {subtitle && <p className={`mt-4 text-base font-semibold leading-8 ${invert ? "text-white/70" : "text-slate-600 dark:text-slate-300"}`}>{subtitle}</p>}
    </div>
  )
}
