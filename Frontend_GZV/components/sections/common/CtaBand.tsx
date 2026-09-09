"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CtaBandProps {
  title?: string
  description?: string
  subtitle?: string
  body?: string
  buttonLabel?: string
  button_label?: string
  buttonUrl?: string
  button_url?: string
  backgroundFrom?: string
  background_from?: string
  backgroundTo?: string
  background_to?: string
  backgroundColor?: string
  background_color?: string
}

export default function CtaBand(rawProps: CtaBandProps) {
  const title = rawProps.title
  const description = rawProps.description || rawProps.body || rawProps.subtitle
  const buttonLabel = rawProps.buttonLabel || rawProps.button_label
  const buttonUrl = rawProps.buttonUrl || rawProps.button_url
  const bgFrom = rawProps.backgroundFrom || rawProps.background_from || rawProps.backgroundColor || rawProps.background_color || "#ed1c24"
  const bgTo = rawProps.backgroundTo || rawProps.background_to || rawProps.backgroundColor || rawProps.background_color || bgFrom

  return (
    <section className="py-16 text-white sm:py-20" style={{ background: `linear-gradient(90deg, ${bgFrom}, ${bgTo})` }}>
      <div className="container px-4 text-center">
        {title && <h2 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">{title}</h2>}
        {description && <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">{description}</p>}
        {buttonLabel && buttonUrl && (
          <Link href={buttonUrl}>
            <Button size="lg" className="mt-8 rounded-full bg-white px-10 py-7 text-lg font-black uppercase tracking-widest text-[#ed1c24] hover:bg-red-50">
              {buttonLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </div>
    </section>
  )
}
