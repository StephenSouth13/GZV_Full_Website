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
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Facebook,
  Github,
  Globe2,
  Instagram,
  MessageCircle,
  Music2,
  Twitter,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  TrendingUp,
  UserRound,
  Youtube,
  LayoutGrid,
  Rows3,
} from "lucide-react"
import type { gzver } from "@/lib/api-supabase"
import { useGzverCv } from "@/hooks/use-gzver-cv"
import { MemberCardShowcase, getMemberCard } from "@/components/gzver/MemberCard"
import ProjectCard from "@/components/ProjectCard"

type ProfileSectionData = NonNullable<gzver["profile_tabs"]>[number]
type ProfileBadge = NonNullable<gzver["profile_badges"]>[number]
type SocialLink = NonNullable<gzver["social_links"]>[number]
type OnlineCard = NonNullable<gzver["online_cards"]>[number]

const defaultSections: ProfileSectionData[] = [
  { key: "overview", label: "Tổng quan", type: "overview", source: "overview", sort_order: 10, visible: true },
  { key: "journey", label: "Lộ trình", type: "text", source: "promotion_path", sort_order: 20, visible: true },
  { key: "achievements", label: "Thành tựu", type: "list", source: "achievements_list", sort_order: 30, visible: true },
  { key: "experience", label: "Kinh nghiệm", type: "background", source: "experience", sort_order: 40, visible: true },
  { key: "impact", label: "Tác động", type: "text", source: "social_impact", sort_order: 50, visible: true },
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
  zalo: MessageCircle,
  messenger: MessageCircle,
  instagram: Instagram,
  tiktok: Music2,
  x: Twitter,
  twitter: Twitter,
  youtube: Youtube,
}

const badgeIcons: Record<string, any> = {
  star: Star,
  shield: ShieldCheck,
  award: Award,
  user: UserRound,
  briefcase: Briefcase,
}

const normalizeArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (!value) return []
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed as T[] : []
    } catch {
      return []
    }
  }
  return []
}

const sortVisible = <T extends { visible?: boolean; sort_order?: number }>(items: unknown = []) =>
  normalizeArray<T>(items).filter((item) => item.visible !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

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
      title={link.label || platform}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#ed1c24] hover:bg-[#ed1c24] hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
    >
      <Icon className="h-4 w-4" />
    </a>
  )
}

function BadgePill({ badge }: { badge: ProfileBadge }) {
  const Icon = badgeIcons[(badge.icon || "shield").toLowerCase()] || ShieldCheck
  return (
    <span
      className="inline-flex items-center gap-1.5 border bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] dark:bg-white/5"
      style={{ borderColor: badge.color || "#ed1c24", color: badge.color || "#ed1c24" }}
    >
      <Icon className="h-3.5 w-3.5" />
      {badge.label}
    </span>
  )
}

function OnlineCredentialCard({ card }: { card: OnlineCard }) {
  const [side, setSide] = useState<"front" | "back">("front")
  const hasBack = Boolean(card.back_image_url)
  const imageUrl = side === "back" && card.back_image_url ? card.back_image_url : card.front_image_url

  return (
    <article className="overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#121212]">
      <div className="flex min-h-[320px] items-center justify-center bg-slate-100 p-4 dark:bg-black/30">
        {imageUrl ? (
          <Image src={imageUrl} alt={`${card.title || "Thẻ online"} - ${side === "front" ? "mặt trước" : "mặt sau"}`} width={720} height={960} unoptimized className="max-h-[480px] h-auto w-auto max-w-full object-contain" />
        ) : (
          <CreditCard className="h-16 w-16 text-slate-300" />
        )}
      </div>
      <div className="space-y-3 border-t border-slate-200 p-5 dark:border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">{card.title || "Thẻ online"}</h3>
            {card.issuer && <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{card.issuer}</p>}
          </div>
          {card.issued_at && <span className="shrink-0 text-[10px] font-bold text-slate-400">{new Date(card.issued_at).toLocaleDateString("vi-VN")}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasBack && (
            <div className="flex border border-slate-200 dark:border-white/10">
              <button type="button" onClick={() => setSide("front")} className={`px-3 py-2 text-[10px] font-black uppercase ${side === "front" ? "bg-[#ed1c24] text-white" : "text-slate-600 dark:text-slate-300"}`}>Mặt trước</button>
              <button type="button" onClick={() => setSide("back")} className={`px-3 py-2 text-[10px] font-black uppercase ${side === "back" ? "bg-[#ed1c24] text-white" : "text-slate-600 dark:text-slate-300"}`}>Mặt sau</button>
            </div>
          )}
          {card.verification_url && (
            <a href={card.verification_url} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 border border-slate-200 px-3 py-2 text-[10px] font-black uppercase text-slate-700 hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/10 dark:text-slate-200">
              Xác thực <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

const isPeriodLine = (line: string) => /^(\d{1,2}\/)?\d{4}\b|^(nay|hiện tại|present)\b/i.test(line)

// Tách khối văn bản thành các mốc timeline: mỗi đoạn cách nhau bởi dòng trống, dòng đầu là tiêu đề.
// Đoạn bắt đầu bằng mốc thời gian (vd "2025 – Present") được gộp vào chức danh phía trên.
const toTimeline = (text?: string | null) =>
  String(text || "")
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length)
    .reduce<Array<{ heading: string; details: string[] }>>((items, lines) => {
      const previous = items[items.length - 1]
      if (previous && isPeriodLine(lines[0])) previous.details.push(...lines)
      else items.push({ heading: lines[0], details: lines.slice(1) })
      return items
    }, [])

const getListItems = (member: gzver, section: ProfileSectionData) =>
  section.source === "skills" ? toList(member.skills) : section.source === "achievements_list" ? toList(member.achievements_list) : toList(section.items)

// Mục có nội dung thật mới được hiện thành tab — người ít thông tin sẽ có ít tab, không còn ô "đang cập nhật"
const sectionHasContent = (member: gzver, section: ProfileSectionData) => {
  if (section.type === "overview") {
    // headline đã hiện ngay dưới tên nên không tính vào tab Tổng quan
    return Boolean(member.achievement_summary || member.testimonial || member.mentoring_content || toList(member.skills).length)
  }
  if (section.type === "list") return getListItems(member, section).length > 0
  if (section.type === "background") {
    return Boolean(member.background?.experience?.trim() || member.background?.education?.trim() || member.background?.previous_role?.trim())
  }
  return Boolean(section.content?.trim() || getTextBySource(member, section.source).trim())
}

function Timeline({ icon: Icon, title, text }: { icon: any; title: string; text?: string | null }) {
  const items = toTimeline(text)
  if (!items.length) return null
  return (
    <div className="min-w-0">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4 text-[#ed1c24]" /> {title}
      </h3>
      <ol className="relative space-y-5 border-l-2 border-slate-200 pl-5 dark:border-white/10">
        {items.map((item, index) => (
          <li key={`${item.heading}-${index}`} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#ed1c24] shadow dark:border-[#0b0b0b]" />
            <p className="text-sm font-black leading-snug text-slate-900 dark:text-white">{item.heading}</p>
            {item.details.map((line, lineIndex) => (
              <p
                key={lineIndex}
                className={
                  isPeriodLine(line) && line.length < 40
                    ? "mt-1 text-[11px] font-black uppercase tracking-wider text-[#ed1c24]"
                    : "mt-1 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300"
                }
              >
                {line}
              </p>
            ))}
          </li>
        ))}
      </ol>
    </div>
  )
}

function ProfileSection({ member, section }: { member: gzver; section: ProfileSectionData }) {
  if (section.type === "overview") {
    const skills = toList(member.skills)
    const lead = member.achievement_summary
    return (
      <div className="space-y-6">
        {lead && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ed1c24]">
              <Award className="h-4 w-4" /> Thành tích nổi bật
            </p>
            <ul className="space-y-2">
              {lead
                .split("\n")
                .map((line) => line.replace(/^[\s\-•*–]+/, "").trim())
                .filter(Boolean)
                .map((line, index) => (
                  <li key={index} className="flex gap-2.5 text-[15px] font-semibold leading-7 text-slate-800 dark:text-slate-200">
                    <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ed1c24]" />
                    <span>{line}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
        {member.testimonial && (
          <blockquote className="border-l-4 border-[#ed1c24] bg-red-50/60 px-5 py-4 text-[15px] font-semibold leading-7 text-slate-800 dark:bg-red-950/20 dark:text-slate-200">
            {member.testimonial}
          </blockquote>
        )}
        {member.mentoring_content && <p className="whitespace-pre-line text-[15px] font-medium leading-7 text-slate-600 dark:text-slate-300">{member.mentoring_content}</p>}
        {skills.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Kỹ năng</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (section.type === "list") {
    const items = getListItems(member, section)
    return (
      <ol className="grid gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ed1c24] text-[11px] font-black text-white">{index + 1}</span>
            <p className="text-sm font-semibold leading-6 text-slate-800 dark:text-slate-200">{item}</p>
          </li>
        ))}
      </ol>
    )
  }

  if (section.type === "background") {
    const blocks = [
      { icon: Briefcase, title: "Kinh nghiệm", text: member.background?.experience },
      { icon: GraduationCap, title: "Học vấn", text: member.background?.education },
      { icon: TrendingUp, title: "Vai trò trước đây", text: member.background?.previous_role },
    ].filter((block) => block.text?.trim())
    return (
      <div className={`grid gap-8 ${blocks.length > 1 ? "md:grid-cols-2" : ""}`}>
        {blocks.map((block) => (
          <Timeline key={block.title} icon={block.icon} title={block.title} text={block.text} />
        ))}
      </div>
    )
  }

  return (
    <div className="whitespace-pre-line text-[15px] font-medium leading-8 text-slate-700 dark:text-slate-300">
      {section.content || getTextBySource(member, section.source)}
    </div>
  )
}

export default function GzverDetailPage({ params }: { params: { slug: string } }) {
  const { person: member, projects: memberProjects, loading } = useGzverCv(params.slug)
  const [activeTab, setActiveTab] = useState("")
  const [profileViewMode, setProfileViewMode] = useState<"one_view" | "tabs">("one_view")


  const sections = useMemo(() => {
    if (!member) return []
    const customSections = sortVisible<ProfileSectionData>(member.profile_tabs)
    return (customSections.length ? customSections : defaultSections).filter((section) => sectionHasContent(member, section))
  }, [member])
  useEffect(() => {
    if (member) setProfileViewMode(member.profile_view_mode === "tabs" ? "tabs" : "one_view")
  }, [member])
  const currentSection = sections.find((section, index) => (section.key || `section-${index}`) === activeTab) || sections[0]
  const badges = useMemo(() => sortVisible<ProfileBadge>(member?.profile_badges), [member])
  const socials = useMemo(() => sortVisible<SocialLink>(member?.social_links), [member])
  const onlineCards = useMemo(() => sortVisible<OnlineCard>(member?.online_cards), [member])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 text-slate-900 dark:bg-[#070707] dark:text-white flex items-center justify-center">
        <div className="relative border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-white/10 dark:bg-[#0d0d0d]">
          <div className="absolute -top-1 -left-1 -right-1 h-1 bg-[#ed1c24] animate-pulse" />
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#ed1c24] dark:bg-red-950/30">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-[#ed1c24]" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Đang tải hồ sơ GZVer...</p>
        </div>
      </div>
    )
  }

  if (!member) notFound()

  const departmentName = member.gzver_departments?.name || member.department_name || "GZVers"
  const avatarStyle = {
    objectPosition: `${member.avatar_position_x ?? 50}% ${member.avatar_position_y ?? 32}%`,
    transform: `scale(${(member.avatar_scale || 100) / 100})`,
  }
  const coverStyle = {
    objectPosition: `${member.cover_position_x ?? 50}% ${member.cover_position_y ?? 50}%`,
    transform: `scale(${(member.cover_scale || 100) / 100})`,
  }

  const shareProfile = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({ title: member?.full_name, url: window.location.href }).catch(() => { })
    } else if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      alert("Đã sao chép link hồ sơ GZVer!")
    }
  }

  return (
    <main className="min-h-screen min-w-0 overflow-x-clip bg-slate-100/60 text-slate-900 dark:bg-[#070707] dark:text-slate-100 selection:bg-[#ed1c24] selection:text-white">
      {/* ══════════ HERO COVER ══════════ */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[34vh] min-h-[250px] w-full md:h-[40vh] md:min-h-[320px] bg-slate-900">
          {member.cover_image_url ? (
            <>
              <Image src={member.cover_image_url} alt={`${member.full_name} cover`} fill unoptimized className="object-cover opacity-85" style={coverStyle} priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/60 to-[#070707]/20 dark:from-[#070707] dark:via-[#070707]/60 dark:to-[#070707]/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950" />
          )}

          {/* Floating Back Button */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
            <Link href="/gzver" className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-white/10 bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-md hover:bg-slate-100 dark:bg-black/90 dark:text-white sm:px-4 sm:text-xs">
              <ArrowLeft className="h-4 w-4" />
              <span>Cộng đồng GZVers</span>
            </Link>
          </motion.div>

          {/* Action Buttons Top Right: Share + CV */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
            <button
              onClick={shareProfile}
              aria-label="Chia sẻ hồ sơ"
              className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/90 text-slate-900 dark:text-white shadow-md hover:bg-slate-100"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {getMemberCard(member).enabled !== false && (
              <a
                href="#card-visit"
                className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/90 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white shadow-md hover:bg-slate-100"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Card visit</span>
              </a>
            )}
            {member.cv_url ? (
              <div className="flex flex-wrap gap-2">
                <a href={member.cv_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#ed1c24] bg-[#ed1c24] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-[#c91218]"><Download className="h-4 w-4" /><span>Tải CV</span></a>
                <Link href={`/gzver/${member.slug}/cv`} className="inline-flex items-center gap-2 border border-white/30 bg-slate-950/80 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white hover:bg-[#ed1c24]"><FileText className="h-4 w-4" /><span>CV trực tuyến</span></Link>
              </div>
            ) : (
              <Link href={`/gzver/${member.slug}/cv`} className="inline-flex items-center gap-2 border border-[#ed1c24] bg-[#ed1c24] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-[#c91218]">
                <Download className="h-4 w-4" /><span>Tạo CV</span>
              </Link>
            )}
          </motion.div>

        </div>

        {/* Overlapping Main Container */}
        <div className="container relative z-10 mx-auto min-w-0 max-w-5xl -mt-20 px-4 pb-10 md:-mt-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="overflow-clip border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0d0d0d]">
            {/* Đầu hồ sơ: avatar nằm ngang với thông tin, nội dung đầy đủ trải rộng bên dưới */}
            <div className="border-b border-t-4 border-slate-200 border-t-[#ed1c24] p-5 dark:border-white/10 md:p-7">
              <div className="flex flex-row items-start gap-4 sm:gap-5 md:gap-7">
                <div className="relative aspect-[4/4.5] w-24 shrink-0 overflow-hidden border-4 border-white bg-slate-200 shadow-xl sm:w-36 md:w-44 dark:border-[#0d0d0d] dark:bg-[#141414]">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={member.full_name}
                      fill
                      unoptimized
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = "none"
                      }}
                      className="object-cover object-top"
                      style={avatarStyle}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800 text-3xl font-black uppercase text-white">
                      {member.full_name?.charAt(0) || "G"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-[#ed1c24] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">{departmentName}</span>
                    {member.role_level && (
                      <span className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:border-white/20 dark:bg-white/5 dark:text-white">{member.role_level}</span>
                    )}
                  </div>

                  <h1 className="text-2xl font-black uppercase leading-none tracking-tight text-slate-950 dark:text-white sm:text-3xl md:text-4xl">{member.full_name}</h1>
                  {member.headline && <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300 md:text-base">{member.headline}</p>}

                  {(member.position || member.company) && (
                    <p className="mt-3 text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">
                      {member.position}
                      {member.company && <span className="ml-2 font-bold normal-case text-[#ed1c24]">@{member.company}</span>}
                    </p>
                  )}

                  {badges.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {badges.map((badge, index) => <BadgePill key={`${badge.label}-${index}`} badge={badge} />)}
                    </div>
                  )}

                  {(member.location || member.email || member.phone) && (
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                      {member.location && (
                        <li className="flex min-w-0 items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-[#ed1c24]" />
                          <span className="truncate">{member.location}</span>
                        </li>
                      )}
                      {member.email && (
                        <li className="min-w-0">
                          <a href={`mailto:${member.email}`} className="flex items-center gap-2 hover:text-[#ed1c24]">
                            <Mail className="h-4 w-4 shrink-0 text-[#ed1c24]" />
                            <span className="truncate">{member.email}</span>
                          </a>
                        </li>
                      )}
                      {member.phone && (
                        <li>
                          <a href={`tel:${member.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:text-[#ed1c24]">
                            <Phone className="h-4 w-4 shrink-0 text-[#ed1c24]" />
                            <span>{member.phone}</span>
                          </a>
                        </li>
                      )}
                    </ul>
                  )}

                  {((socials.length > 0 || member.website_url) || getMemberCard(member).enabled !== false) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
                      {socials.map((link, index) => <SocialButton key={`${link.href || link.url}-${index}`} link={link} />)}
                      {member.website_url && <SocialButton link={{ label: "Website", platform: "website", href: member.website_url }} />}
                      {getMemberCard(member).enabled !== false && (
                        <a href="#card-visit" className="ml-auto inline-flex items-center gap-2 border border-[#ed1c24] bg-red-50 px-3 py-2 text-[11px] font-black uppercase text-[#ed1c24] transition hover:bg-[#ed1c24] hover:text-white dark:bg-red-950/20">
                          <CreditCard className="h-4 w-4" /> Thẻ GZVer · Xem 2 mặt
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Nội dung đầy đủ: one-view ưu tiên, visitor vẫn có thể chuyển sang tabs */}
              <div className="min-w-0 bg-white p-4 sm:p-5 lg:p-7 dark:bg-[#0b0b0b]">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Hồ sơ đầy đủ</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{profileViewMode === "one_view" ? "Tất cả nội dung đang hiển thị" : "Đang xem theo từng mục"}</p>
                  </div>
                  <div className="flex border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
                    <button type="button" onClick={() => setProfileViewMode("one_view")} className={`inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase ${profileViewMode === "one_view" ? "bg-[#ed1c24] text-white" : "text-slate-600 dark:text-slate-300"}`}><LayoutGrid className="h-3.5 w-3.5" /> One-view</button>
                    <button type="button" onClick={() => setProfileViewMode("tabs")} className={`inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-black uppercase ${profileViewMode === "tabs" ? "bg-[#ed1c24] text-white" : "text-slate-600 dark:text-slate-300"}`}><Rows3 className="h-3.5 w-3.5" /> Tabs</button>
                  </div>
                </div>

                {profileViewMode === "tabs" && sections.length > 1 && (
                  <div className="sticky top-20 z-20 -mx-5 mb-6 border-b border-slate-200 bg-white/95 px-5 pb-3 pt-1 backdrop-blur sm:-mx-6 sm:px-6 dark:border-white/10 dark:bg-[#0b0b0b]/95">
                    <div role="tablist" className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {sections.map((section, index) => {
                        const key = section.key || `section-${index}`
                        const selected = currentSection === section
                        const count = section.type === "list" ? getListItems(member, section).length : 0
                        return (
                          <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            onClick={() => setActiveTab(key)}
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                              selected
                                ? "bg-[#ed1c24] text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                            }`}
                          >
                            {section.label || `Mục ${index + 1}`}
                            {count > 0 && (
                              <span className={`rounded-full px-1.5 text-[10px] ${selected ? "bg-white/25" : "bg-white text-slate-500 dark:bg-white/10"}`}>{count}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {profileViewMode === "one_view" ? (
                  <div className="space-y-4">
                    {sections.map((section, index) => (
                      <motion.section key={section.key || `section-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.2) }} className="border border-slate-200 bg-slate-50/50 p-3.5 sm:p-4 dark:border-white/10 dark:bg-white/[0.025]">
                        <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Mục {String(index + 1).padStart(2, "0")} · {section.label}</p>
                        <ProfileSection member={member} section={section} />
                      </motion.section>
                    ))}
                    {getMemberCard(member).enabled !== false && (
                      <section id="card-visit" className="scroll-mt-24 border border-slate-200 bg-slate-950 p-4 sm:p-5 dark:border-white/10">
                        <MemberCardShowcase member={member} />
                      </section>
                    )}
                  </div>
                ) : currentSection ? (
                  <motion.div key={currentSection.key || currentSection.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    {sections.length === 1 && (
                      <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#ed1c24]">{currentSection.label}</p>
                    )}
                    <ProfileSection member={member} section={currentSection} />
                  </motion.div>
                ) : (
                  <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-white/10">
                    <UserRound className="mb-3 h-8 w-8 text-slate-300" />
                    <p className="text-sm font-bold text-slate-500">Hồ sơ đang được cập nhật.</p>
                  </div>
                )}
              </div>
          </motion.div>
        </div>
      </section>

      {memberProjects.length > 0 && (
        <section className="container mx-auto max-w-5xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Nhân sự triển khai</p>
              <h2 className="mt-1 text-2xl font-black uppercase text-slate-950 dark:text-white">Dự án đã tham gia</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">{memberProjects.length} dự án</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {memberProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {profileViewMode === "tabs" && <MemberCardShowcase member={member} />}

      {onlineCards.length > 0 && (
        <section className="container max-w-5xl mx-auto px-4 py-16">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#ed1c24] text-white"><Award className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Digital credentials</p>
              <h2 className="text-2xl font-black uppercase text-slate-950 dark:text-white">Thẻ & chứng nhận khác</h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {onlineCards.map((card, index) => <OnlineCredentialCard key={`${card.title}-${index}`} card={card} />)}
          </div>
        </section>
      )}
    </main>
  )
}



