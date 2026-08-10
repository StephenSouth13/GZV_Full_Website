"use client"

import Link from "next/link"
import { Building2, CheckCircle2 } from "lucide-react"
import type { ReactNode } from "react"
import type { AuthPageSettings } from "@/lib/auth-page-settings"
import { Button } from "@/components/ui/button"

type AuthAccessLayoutProps = {
  settings: AuthPageSettings
  children: ReactNode
}

export function AuthAccessLayout({ settings, children }: AuthAccessLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f6f6f6] text-[#050505]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#050505] text-white lg:block">
          <div className="absolute inset-y-0 right-0 w-2 bg-[#ed1c24]" />
          <div className="absolute left-10 top-10 h-20 w-20 border-8 border-[#ed1c24]" />
          <div className="absolute bottom-10 right-16 h-32 w-32 border border-white/15" />
          <div className="relative z-10 flex min-h-screen flex-col justify-between p-12">
            <Link href="/" className="inline-flex items-center gap-3">
              <img src="/logo.webp" alt="GZV" className="h-14 w-auto bg-white p-2" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ed1c24]">GZV</p>
                <p className="text-lg font-black uppercase">The Next-Gen Company</p>
              </div>
            </Link>

            <div className="max-w-xl">
              <p className="mb-4 border-l-4 border-[#ed1c24] pl-4 text-xs font-black uppercase tracking-[0.3em] text-white/60">
                {settings.eyebrow}
              </p>
              <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-normal">
                {settings.side_title}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-white/70">
                {settings.side_description}
              </p>
              <div className="mt-10 grid gap-3">
                {settings.hero_points.map((point) => (
                  <div key={point} className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#ed1c24]" />
                    <span className="font-bold">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/35">gzv.one</p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[460px]">
            <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
              <img src="/logo.webp" alt="GZV" className="h-12 w-auto" />
              <span className="text-sm font-black uppercase tracking-[0.22em]">GZV</span>
            </Link>

            <div className="border border-[#d7d7d7] bg-white shadow-[16px_16px_0_#050505]">
              <div className="border-b border-[#e5e5e5] p-7">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-[#ed1c24]">{settings.eyebrow}</p>
                <h2 className="text-3xl font-black uppercase tracking-normal">{settings.title}</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{settings.subtitle}</p>
              </div>

              <div className="p-7">
                {children}

                {settings.hrm_label && settings.hrm_url ? (
                  <Link href={settings.hrm_url} target="_blank" className="mt-4 block">
                    <Button type="button" variant="outline" className="h-12 w-full rounded-none border-[#050505] font-black uppercase">
                      <Building2 className="mr-2 h-4 w-4 text-[#ed1c24]" />
                      {settings.hrm_label}
                    </Button>
                  </Link>
                ) : null}

                <div className="mt-6 border-t border-[#e5e5e5] pt-5 text-center text-sm font-semibold text-slate-600">
                  {settings.footer_text}{" "}
                  <Link href={settings.footer_link_href || "/login"} className="font-black text-[#ed1c24] hover:underline">
                    {settings.footer_link_label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
