"use client"

import React from "react"
import SectionIntro from "@/components/sections/common/SectionIntro"

export interface MscWordsProps {
  title?: string
  subtitle?: string
  body?: string
  description?: string
  lines?: string[]
  accentLetters?: string[]
  accentColor?: string
}

export default function MscWords({
  title,
  subtitle,
  body,
  description,
  lines = [],
  accentLetters = [],
  accentColor = "#ed1c24",
}: MscWordsProps) {
  const content = body || description

  return (
    <section className="bg-white py-16 text-slate-950 dark:bg-slate-950 dark:text-white lg:py-24 border-b border-slate-100 dark:border-white/5">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        {(title || subtitle) && (
          <SectionIntro
            title={title}
            subtitle={subtitle}
            align="center"
          />
        )}
        {content && (
          <div className="mt-6 whitespace-pre-line text-base sm:text-lg font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
            {content}
          </div>
        )}
        {lines.length > 0 && (
          <div className="mt-8 space-y-3">
            {lines.map((line: string, index: number) => {
              const first = accentLetters[index] || line.charAt(0)
              const rest = line.startsWith(first) ? line.slice(first.length) : line
              return (
                <h2 key={index} className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span style={{ color: accentColor }}>{first}</span>{rest}
                </h2>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
