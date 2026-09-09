"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SectionIntro from "@/components/sections/common/SectionIntro"

export interface StorySplitProps {
  title?: string
  subtitle?: string
  body?: string
  image_url?: string
  image_alt?: string
  position_x?: number
  position_y?: number
  image_size?: number
  stats?: any[]
  button_label?: string
  button_url?: string
}

export default function StorySplit({
  title,
  subtitle,
  body,
  image_url,
  image_alt,
  position_x = 50,
  position_y = 50,
  image_size = 100,
  stats = [],
  button_label,
  button_url,
}: StorySplitProps) {
  return (
    <section className="bg-white py-16 dark:bg-slate-950 lg:py-24">
      <div className="container grid gap-10 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <SectionIntro title={title} subtitle={subtitle} align="left" />
          {body && <div className="max-w-3xl whitespace-pre-line text-base font-semibold leading-8 text-slate-600 dark:text-slate-300">{body}</div>}
          {stats.length > 0 ? (
            <div className="mt-8 grid grid-cols-3 border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
              {stats.map((stat: any, index: number) => (
                <div key={index} className="border-r border-slate-200 p-4 last:border-r-0 dark:border-white/10">
                  <p className="text-2xl font-black text-[#ed1c24]">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          ) : (button_label || button_url) ? (
            <div className="mt-8">
              <Link href={button_url || "/gioi-thieu"}>
                <Button className="h-12 rounded-xl bg-[#ed1c24] px-8 text-sm font-black uppercase text-white hover:bg-[#c91218] transition">
                  {button_label || "Xem chi tiết"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
        <div className="relative min-h-[420px] overflow-hidden border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-900">
          <img
            src={image_url || "/gioi-thieu/19.webp"}
            alt={image_alt || title || "GZV"}
            className="h-full w-full object-cover"
            style={{ objectPosition: `${Number(position_x)}% ${Number(position_y)}%`, transform: `scale(${Number(image_size) / 100})` }}
          />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#ed1c24]" />
        </div>
      </div>
    </section>
  )
}
