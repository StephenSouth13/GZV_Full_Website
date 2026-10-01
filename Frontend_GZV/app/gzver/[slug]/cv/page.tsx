"use client"

import { useEffect, useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Briefcase, GraduationCap, Globe2, Mail, Phone, Printer, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/api-supabase"

export default function GzverCvPage() {
  const params = useParams<{ slug: string }>()
  const [person, setPerson] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    let alive = true
    const load = async () => {
      const { data } = await supabase.from("gzvers").select("*").eq("slug", params.slug).eq("is_active", true).maybeSingle()
      if (!alive || !data) return
      setPerson(data)
      if (data.cv_settings?.show_projects !== false) {
        const [byProfile, highlights] = await Promise.all([
          supabase.from("projects").select("*").contains("author_ids", [data.id]).order("order_index", { ascending: true }).limit(12),
          supabase.from("gzver_project_highlights").select("project_id,contribution,is_visible").eq("gzver_id", data.id),
        ])
        const rows = highlights.data || []
        const extraIds = rows.filter((item: any) => item.is_visible !== false).map((item: any) => item.project_id)
        const extra = extraIds.length ? await supabase.from("projects").select("*").in("id", extraIds) : { data: [] as any[] }
        const excluded = new Set(rows.filter((item: any) => item.is_visible === false).map((item: any) => item.project_id))
        const contributionById = new Map(rows.filter((item: any) => item.is_visible !== false).map((item: any) => [item.project_id, item.contribution]))
        const combined = [...(byProfile.data || []), ...(extra.data || [])].filter((item: any) => !excluded.has(item.id))
        const unique = Array.from(new Map(combined.map((item: any) => [item.id, item])).values()).map((item: any) => ({ ...item, contribution: contributionById.get(item.id) }))
        if (alive) setProjects(unique)
      }
    }
    load()
    return () => { alive = false }
  }, [params.slug])

  if (!person) return <main className="min-h-screen bg-slate-100 p-8 text-center text-sm font-bold text-slate-500">Đang tải hồ sơ CV…</main>
  const settings = person.cv_settings || {}
  const accent = settings.accent || "#ed1c24"
  const experience = person.background?.experience || ""
  const education = person.background?.education || ""
  const skills = Array.isArray(person.skills) ? person.skills : []
  const achievements = Array.isArray(person.achievements_list) ? person.achievements_list : []

  return <main className={`cv-root min-h-screen bg-slate-100 px-4 py-6 text-slate-900 ${settings.template === "midnight" ? "cv-midnight" : settings.template === "minimal" ? "cv-minimal" : "cv-executive"}`} style={{ "--cv-accent": accent } as CSSProperties}>
    <div className="no-print mx-auto mb-4 flex max-w-[210mm] items-center justify-between gap-3"><Link href={`/gzver/${person.slug}`} className="inline-flex items-center gap-2 text-xs font-black uppercase"><ArrowLeft className="h-4 w-4" />Hồ sơ</Link><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 bg-[var(--cv-accent)] px-4 py-2 text-xs font-black uppercase text-white"><Printer className="h-4 w-4" />In / Lưu PDF</button></div>
    <article className="cv-sheet relative mx-auto min-h-[297mm] max-w-[210mm] bg-white px-9 py-10 shadow-xl sm:px-14 sm:py-14">
      <header className="flex gap-6 border-b-2 pb-7" style={{ borderColor: accent }}>
        {person.avatar_url && <div className="relative h-32 w-28 shrink-0 overflow-hidden"><Image src={person.avatar_url} alt={person.full_name} fill unoptimized className="object-cover" /></div>}
        <div className="min-w-0 flex-1 self-center"><p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: accent }}>{person.department_name || "GZV · THE VOICE OF GENZERS"}</p><h1 className="mt-2 text-3xl font-black uppercase leading-tight sm:text-4xl">{person.full_name}</h1><p className="mt-2 text-sm font-bold text-slate-600">{person.position}{person.company ? ` · ${person.company}` : ""}</p>{person.headline && <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{person.headline}</p>}</div>
      </header>
      {settings.show_contact !== false && <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-200 py-4 text-xs font-semibold text-slate-600">{person.email && <span className="inline-flex items-center gap-2"><Mail className="h-3.5 w-3.5" style={{ color: accent }} />{person.email}</span>}{person.phone && <span className="inline-flex items-center gap-2"><Phone className="h-3.5 w-3.5" style={{ color: accent }} />{person.phone}</span>}{person.website_url && <span className="inline-flex items-center gap-2"><Globe2 className="h-3.5 w-3.5" style={{ color: accent }} />{person.website_url}</span>}</div>}
      <div className="space-y-7 py-7">
        {(person.achievement_summary || person.testimonial) && <section><SectionTitle accent={accent}>Tóm tắt hồ sơ</SectionTitle><p className="whitespace-pre-line text-sm leading-7 text-slate-700">{person.achievement_summary || person.testimonial}</p></section>}
        {experience && <section><SectionTitle accent={accent}><Briefcase className="mr-2 inline h-4 w-4" />Kinh nghiệm</SectionTitle><p className="whitespace-pre-line text-sm leading-7 text-slate-700">{experience}</p></section>}
        {education && <section><SectionTitle accent={accent}><GraduationCap className="mr-2 inline h-4 w-4" />Học vấn</SectionTitle><p className="whitespace-pre-line text-sm leading-7 text-slate-700">{education}</p></section>}
        {skills.length > 0 && <section><SectionTitle accent={accent}>Năng lực</SectionTitle><div className="flex flex-wrap gap-2">{skills.map((skill: string) => <span key={skill} className="border border-slate-200 px-2.5 py-1 text-xs font-semibold">{skill}</span>)}</div></section>}
        {achievements.length > 0 && <section><SectionTitle accent={accent}>Thành tựu</SectionTitle><ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">{achievements.map((item: string) => <li key={item}>{item}</li>)}</ul></section>}
        {person.promotion_path && <section><SectionTitle accent={accent}>Lộ trình</SectionTitle><p className="whitespace-pre-line text-sm leading-7 text-slate-700">{person.promotion_path}</p></section>}
        {person.social_impact && <section><SectionTitle accent={accent}>Tác động</SectionTitle><p className="whitespace-pre-line text-sm leading-7 text-slate-700">{person.social_impact}</p></section>}
        {projects.length > 0 && <section className="cv-projects"><SectionTitle accent={accent}>Dự án tiêu biểu</SectionTitle><div className="grid grid-cols-2 gap-3">{projects.map((project) => <div key={project.id} className="overflow-hidden border border-slate-200"><div className="relative aspect-[16/8] bg-slate-100">{project.image && <Image src={project.image} alt={project.title} fill unoptimized className="object-cover" />}</div><div className="p-3"><p className="text-xs font-black uppercase">{project.title}</p><p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">{project.excerpt || project.description}</p></div></div>)}</div></section>}
      </div>
      <footer className="cv-footer border-t border-slate-200 pt-3 text-center text-[10px] font-bold uppercase tracking-widest" style={{ color: accent }}>GZV.ONE · THE VOICE OF GENZERS</footer>
    </article>
    <style jsx global>{`@page{size:A4;margin:0} @media print{html,body{background:#fff!important}.no-print{display:none!important}.cv-root{padding:0!important;background:#fff!important}.cv-sheet{box-shadow:none!important;max-width:none!important;width:210mm;min-height:297mm;padding:16mm 18mm 20mm!important}.cv-footer{position:fixed;bottom:8mm;left:18mm;right:18mm;background:#fff;padding-top:3mm}.cv-projects{break-inside:avoid}section{break-inside:avoid}a{color:inherit;text-decoration:none}} .cv-midnight .cv-sheet{background:#101522;color:#f8fafc}.cv-midnight .cv-sheet p,.cv-midnight .cv-sheet span,.cv-midnight .cv-sheet li{color:#d5dbe7}.cv-midnight .cv-sheet section>div>div{border-color:#30394b}.cv-midnight .cv-footer{background:#101522}.cv-minimal .cv-sheet{box-shadow:none;border-top:5px solid var(--cv-accent)}`}</style>
  </main>
}

function SectionTitle({ accent, children }: { accent: string; children: ReactNode }) {
  return <h2 className="mb-3 border-l-[3px] pl-3 text-xs font-black uppercase tracking-[0.18em]" style={{ borderColor: accent }}>{children}</h2>
}
