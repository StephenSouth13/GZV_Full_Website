"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Award,
  Briefcase,
  Download,
  ExternalLink,
  Facebook,
  Github,
  Globe2,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  TrendingUp,
  UserRound,
  Youtube,
} from "lucide-react"
import { api, gzver } from "@/lib/api-supabase"

type ProfileSectionData = NonNullable<gzver["profile_tabs"]>[number]
type ProfileBadge = NonNullable<gzver["profile_badges"]>[number]
type SocialLink = NonNullable<gzver["social_links"]>[number]

const defaultSections: ProfileSectionData[] = [
  { key: "overview", label: "Tổng quan", type: "overview", source: "overview", sort_order: 10, visible: true },
  { key: "journey", label: "Lộ trình phát triển", type: "text", source: "promotion_path", sort_order: 20, visible: true },
  { key: "achievements", label: "Thành tựu nổi bật", type: "list", source: "achievements_list", sort_order: 30, visible: true },
  { key: "experience", label: "Năng lực thực chiến", type: "background", source: "experience", sort_order: 40, visible: true },
  { key: "impact", label: "Tác động xã hội", type: "text", source: "social_impact", sort_order: 50, visible: true },
]

const socialIcons: Record<string, any> = {
  facebook: Facebook,
  linkedin: Linkedin,
  github: Github,
  website: Globe2,
  web: Globe2,
  email: Mail,
  mail: Mail,
  phone: Phone,
  zalo: Phone,
  youtube: Youtube,
}

const badgeIcons: Record<string, any> = {
  star: Star,
  shield: ShieldCheck,
  award: Award,
  user: UserRound,
  briefcase: Briefcase,
}

const sortVisible = <T extends { visible?: boolean; sort_order?: number }>(items: T[] = []) =>
  items.filter((item) => item.visible !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

const toList = (value: unknown) => Array.isArray(value) ? value.filter(Boolean).map(String) : []

const getTextBySource = (member: gzver, source?: string) => {
  if (!source || source === "overview") return ""
  if (source === "experience") return member.background?.experience || ""
  if (source === "education") return member.background?.education || ""
  if (source === "previous_role") return member.background?.previous_role || ""
  const value = (member as any)[source]
  if (Array.isArray(value)) return value.join("\n")
  if (value && typeof value === "object") return Object.values(value).filter(Boolean).join("\n")
  return value ? String(value) : ""
}

function SocialButton({ link }: { link: SocialLink }) {
  const href = link.href || link.url || ""
  if (!href) return null
  const platform = (link.platform || link.icon || link.label || "website").toLowerCase()
  const Icon = socialIcons[platform] || ExternalLink
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={link.label || platform}
      className="inline-flex h-11 w-11 items-center justify-center border border-white/15 bg-white/10 text-white transition hover:border-[#ed1c24] hover:bg-[#ed1c24]"
    >
      <Icon className="h-4 w-4" />
    </a>
  )
}

function BadgePill({ badge }: { badge: ProfileBadge }) {
  const Icon = badgeIcons[(badge.icon || "shield").toLowerCase()] || ShieldCheck
  return (
    <span
      className="inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em]"
      style={{ borderColor: badge.color || "#ed1c24", color: badge.color || "#ed1c24" }}
    >
      <Icon className="h-3.5 w-3.5" />
      {badge.label}
    </span>
  )
}

function ProfileInfoCard({ icon: Icon, title, text }: { icon: any; title: string; text?: string }) {
  return (
    <div className="border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0f0f0f]">
      <h3 className="mb-4 flex items-center gap-3 text-xl font-black uppercase text-slate-950 dark:text-white">
        <Icon className="h-5 w-5 text-[#ed1c24]" />
        {title}
      </h3>
      <p className="whitespace-pre-line text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">{text || "Đang cập nhật."}</p>
    </div>
  )
}

function ProfileSection({ member, section, index }: { member: gzver; section: ProfileSectionData; index: number }) {
  const title = section.label || "Nội dung"
  const sourceText = getTextBySource(member, section.source)
  const listSource = section.source === "skills" ? member.skills : section.source === "achievements_list" ? member.achievements_list : toList(section.items)

  if (section.type === "overview") {
    return (
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="border border-slate-200 bg-white p-6 lg:col-span-2 dark:border-white/10 dark:bg-[#0f0f0f]">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Section {String(index + 1).padStart(2, "0")}</p>
          <h2 className="text-2xl font-black uppercase text-slate-950 dark:text-white">{member.headline || member.achievement_summary || member.position}</h2>
          {member.testimonial && <p className="mt-5 border-l-4 border-[#ed1c24] bg-red-50 p-5 text-base font-semibold leading-8 text-slate-700 dark:bg-red-950/20 dark:text-slate-200">{member.testimonial}</p>}
          {member.mentoring_content && <p className="mt-5 whitespace-pre-line text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">{member.mentoring_content}</p>}
        </div>
        <div className="border border-slate-200 bg-[#050505] p-6 text-white dark:border-white/10">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Kỹ năng</p>
          <div className="flex flex-wrap gap-2">
            {(member.skills || []).map((skill) => <span key={skill} className="border border-white/15 px-3 py-2 text-xs font-bold text-white/85">{skill}</span>)}
          </div>
        </div>
      </section>
    )
  }

  if (section.type === "list") {
    return (
      <section className="border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0f0f0f]">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Section {String(index + 1).padStart(2, "0")}</p>
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-black uppercase text-slate-950 dark:text-white"><Award className="text-[#ed1c24]" />{title}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {listSource.map((item, itemIndex) => (
            <div key={`${item}-${itemIndex}`} className="border-l-4 border-[#ed1c24] bg-slate-50 p-5 dark:bg-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24]">{String(itemIndex + 1).padStart(2, "0")}</span>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-700 dark:text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (section.type === "background") {
    return (
      <section className="grid gap-5 md:grid-cols-2">
        <ProfileInfoCard icon={Briefcase} title="Kinh nghiệm" text={member.background?.experience} />
        <ProfileInfoCard icon={GraduationCap} title="Học vấn" text={member.background?.education} />
        {member.background?.previous_role && <ProfileInfoCard icon={TrendingUp} title="Vai trò trước đây" text={member.background.previous_role} />}
      </section>
    )
  }

  return (
    <section className="border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0f0f0f]">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Section {String(index + 1).padStart(2, "0")}</p>
      <h2 className="mb-5 text-2xl font-black uppercase text-slate-950 dark:text-white">{title}</h2>
      <div className="whitespace-pre-line text-base font-medium leading-8 text-slate-700 dark:text-slate-300">
        {section.content || sourceText || "Admin có thể cập nhật nội dung section này trong hồ sơ GZVer."}
      </div>
    </section>
  )
}

export default function GzverDetailPage({ params }: { params: { slug: string } }) {
  const [member, setMember] = useState<gzver | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const fetchDetail = async () => {
      try {
        setLoading(true)
        const data = await api.getgzverBySlug(params.slug)
        if (active) setMember(data)
      } catch (error) {
        console.error("Error fetching GZVer detail:", error)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchDetail()
    return () => {
      active = false
    }
  }, [params.slug])

  const sections = useMemo(() => sortVisible(member?.profile_tabs?.length ? member.profile_tabs : defaultSections), [member])
  const badges = useMemo(() => sortVisible(member?.profile_badges || []), [member])
  const socials = useMemo(() => sortVisible(member?.social_links || []), [member])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="border border-white/10 p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin border-2 border-white/15 border-t-[#ed1c24]" />
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/50">Đang tải hồ sơ GZVer</p>
        </div>
      </div>
    )
  }

  if (!member) notFound()

  const departmentName = member.gzver_departments?.name || member.department_name || "GZVers"
  const avatarStyle = {
    objectPosition: `${member.avatar_position_x ?? 50}% ${member.avatar_position_y ?? 50}%`,
    transform: `scale(${(member.avatar_scale || 100) / 100})`,
  }
  const coverStyle = {
    objectPosition: `${member.cover_position_x ?? 50}% ${member.cover_position_y ?? 50}%`,
    transform: `scale(${(member.cover_scale || 100) / 100})`,
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 text-slate-950 dark:bg-[#050505] dark:text-white">
      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#080808]">
        <div className="container py-8">
          <Link href="/gzver" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500 transition hover:text-[#ed1c24]">
            <ArrowLeft className="h-4 w-4" />
            Quay lại cộng đồng GZVers
          </Link>
        </div>
      </section>

      <section className="container py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="overflow-hidden border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-[#0d0d0d]">
          <div className="relative h-56 overflow-hidden bg-[#050505] sm:h-72 lg:h-80">
            {member.cover_image_url ? (
              <Image src={member.cover_image_url} alt={`${member.full_name} cover`} fill unoptimized className="object-cover opacity-80" style={coverStyle} />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#050505_0%,#220608_45%,#ed1c24_100%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
            <div className="absolute bottom-6 left-5 right-5 flex flex-wrap items-end justify-between gap-4 sm:left-8 sm:right-8">
              <div>
                <p className="mb-3 inline-flex bg-[#ed1c24] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">{departmentName}</p>
                <h1 className="max-w-4xl text-4xl font-black uppercase leading-none text-white sm:text-6xl">{member.full_name}</h1>
              </div>
              {member.cv_url && (
                <a href={member.cv_url} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 bg-white px-5 text-xs font-black uppercase text-[#050505] transition hover:bg-[#ed1c24] hover:text-white">
                  <Download className="h-4 w-4" />
                  Tải CV
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
            <aside className="border-b border-slate-200 bg-[#050505] p-6 text-white dark:border-white/10 lg:border-b-0 lg:border-r lg:border-white/10 sm:p-8">
              <div className="-mt-24 mb-6 h-48 w-48 overflow-hidden border-8 border-[#050505] bg-slate-100 shadow-2xl">
                <Image src={member.avatar_url || "/gzvers/default.webp"} alt={member.full_name} width={260} height={260} unoptimized className="h-full w-full object-cover" style={avatarStyle} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ed1c24]">{member.role_level || "GZVer profile"}</p>
              <h2 className="mt-2 text-2xl font-black uppercase leading-tight">{member.position}</h2>
              {member.company && <p className="mt-3 text-sm font-bold text-white/60">@{member.company}</p>}
              {member.headline && <p className="mt-5 text-sm font-semibold leading-7 text-white/75">{member.headline}</p>}

              <div className="mt-6 flex flex-wrap gap-2">
                {badges.map((badge, index) => <BadgePill key={`${badge.label}-${index}`} badge={badge} />)}
                {!badges.length && <BadgePill badge={{ label: departmentName, icon: "shield", color: "#ed1c24" }} />}
              </div>

              <div className="mt-7 space-y-3 border-t border-white/10 pt-6 text-sm font-semibold text-white/70">
                {member.location && <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#ed1c24]" />{member.location}</p>}
                {member.email && <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#ed1c24]" />{member.email}</p>}
                {member.phone && <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#ed1c24]" />{member.phone}</p>}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {socials.map((link, index) => <SocialButton key={`${link.href || link.url}-${index}`} link={link} />)}
                {member.website_url && <SocialButton link={{ label: "Website", platform: "website", href: member.website_url }} />}
              </div>
            </aside>

            <div className="space-y-5 p-5 sm:p-8">
              <div className="border-l-4 border-[#ed1c24] bg-slate-50 p-5 dark:bg-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Profile sections</p>
                <h2 className="mt-2 text-2xl font-black uppercase text-slate-950 dark:text-white">Hồ sơ chi tiết</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                  Các section bên dưới được quản trị tự do trong admin và hiển thị theo đúng thứ tự xuất bản.
                </p>
              </div>
              {sections.map((section, index) => (
                <ProfileSection key={section.key || `${section.label}-${index}`} member={member} section={section} index={index} />
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
