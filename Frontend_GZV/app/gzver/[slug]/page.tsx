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
  Share2,
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
      className="inline-flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-[#ed1c24] hover:bg-[#ed1c24] hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
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

function ProfileInfoCard({ icon: Icon, title, text }: { icon: any; title: string; text?: string }) {
  return (
    <div className="border border-slate-200 bg-white p-6 shadow-xs transition duration-300 hover:border-[#ed1c24] hover:shadow-md dark:border-white/10 dark:bg-[#121212]">
      <h3 className="mb-4 flex items-center gap-3 text-lg font-black uppercase text-slate-900 dark:text-white">
        <div className="flex h-9 w-9 items-center justify-center bg-red-50 text-[#ed1c24] dark:bg-red-950/30">
          <Icon className="h-4.5 w-4.5" />
        </div>
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
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="border border-slate-200 bg-white p-7 shadow-xs lg:col-span-2 dark:border-white/10 dark:bg-[#121212]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Mục {String(index + 1).padStart(2, "0")}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng quan</span>
          </div>
          <h2 className="text-2xl font-black uppercase leading-snug text-slate-900 dark:text-white">{member.headline || member.achievement_summary || member.position}</h2>
          {member.testimonial && (
            <div className="relative mt-6 overflow-hidden border-l-4 border-[#ed1c24] bg-red-50/60 p-6 text-base font-semibold leading-8 text-slate-800 dark:bg-red-950/20 dark:text-slate-200">
              <span className="absolute -right-4 -bottom-4 text-7xl font-serif font-black text-red-600/10 selection:bg-transparent">“</span>
              <p className="relative z-10">{member.testimonial}</p>
            </div>
          )}
          {member.mentoring_content && <p className="mt-6 whitespace-pre-line text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">{member.mentoring_content}</p>}
        </div>

        <div className="border border-slate-200 bg-white p-7 shadow-xs flex flex-col justify-between dark:border-white/10 dark:bg-[#121212]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 bg-[#ed1c24]" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Kỹ năng chuyên môn</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(member.skills || []).map((skill) => (
                <span key={skill} className="border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  {skill}
                </span>
              ))}
              {!(member.skills || []).length && <p className="text-xs font-medium text-slate-400">Đang cập nhật kỹ năng.</p>}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (section.type === "list") {
    return (
      <section className="border border-slate-200 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#121212]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-red-50 text-[#ed1c24] dark:bg-red-950/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Mục {String(index + 1).padStart(2, "0")}</p>
              <h2 className="text-2xl font-black uppercase text-slate-900 dark:text-white">{title}</h2>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {listSource.map((item, itemIndex) => (
            <div key={`${item}-${itemIndex}`} className="group border border-slate-200 bg-slate-50/50 p-5 transition duration-300 hover:border-[#ed1c24] hover:bg-white dark:border-white/5 dark:bg-[#181818]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ed1c24]">{String(itemIndex + 1).padStart(2, "0")}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#ed1c24] opacity-0 group-hover:opacity-100 transition" />
              </div>
              <p className="mt-3 text-sm font-bold leading-6 text-slate-800 dark:text-slate-200">{item}</p>
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
    <section className="border border-slate-200 bg-white p-7 shadow-xs dark:border-white/10 dark:bg-[#121212]">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">Mục {String(index + 1).padStart(2, "0")}</p>
      <h2 className="mb-5 text-2xl font-black uppercase text-slate-900 dark:text-white">{title}</h2>
      <div className="whitespace-pre-line text-base font-medium leading-8 text-slate-700 dark:text-slate-300">
        {section.content || sourceText || "Nội dung section này đang được cập nhật."}
      </div>
    </section>
  )
}

export default function GzverDetailPage({ params }: { params: { slug: string } }) {
  const [member, setMember] = useState<gzver | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("")

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

  const sections = useMemo(() => {
    const customSections = sortVisible<ProfileSectionData>(member?.profile_tabs)
    return customSections.length ? customSections : defaultSections
  }, [member])
  const badges = useMemo(() => sortVisible<ProfileBadge>(member?.profile_badges), [member])
  const socials = useMemo(() => sortVisible<SocialLink>(member?.social_links), [member])

  useEffect(() => {
    if (sections.length && !activeTab) {
      setActiveTab(sections[0].key || `section-0`)
    }
  }, [sections, activeTab])

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
    <main className="min-h-screen bg-slate-100/60 text-slate-900 dark:bg-[#070707] dark:text-slate-100 selection:bg-[#ed1c24] selection:text-white">
      {/* ══════════ HERO COVER ══════════ */}
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full h-[45vh] md:h-[55vh] lg:h-[60vh] bg-slate-900">
          {member.cover_image_url ? (
            <>
              <Image src={member.cover_image_url} alt={`${member.full_name} cover`} fill unoptimized className="object-cover opacity-85" style={coverStyle} priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/60 to-[#070707]/20 dark:from-[#070707] dark:via-[#070707]/60 dark:to-[#070707]/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950" />
          )}

          {/* Floating Back Button */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-6 left-6 z-20">
            <Link href="/gzver" className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/90 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white shadow-md hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
              <span>Cộng đồng GZVers</span>
            </Link>
          </motion.div>

          {/* Action Buttons Top Right: Share + CV */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button
              onClick={shareProfile}
              aria-label="Chia sẻ hồ sơ"
              className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-black/90 text-slate-900 dark:text-white shadow-md hover:bg-slate-100"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {member.cv_url && (
              <a href={member.cv_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#ed1c24] bg-[#ed1c24] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-[#c91218]">
                <Download className="h-4 w-4" />
                <span>Tải CV</span>
              </a>
            )}
          </motion.div>
        </div>

        {/* Overlapping Main Container */}
        <div className="container max-w-5xl mx-auto px-4 -mt-32 md:-mt-40 relative z-10 pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="overflow-hidden border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0d0d0d]">
            {/* Header Banner Inside Card */}
            <div className="p-6 md:p-10 border-b border-slate-200 dark:border-white/10 border-t-4 border-t-[#ed1c24]">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-[#ed1c24] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  {departmentName}
                </span>
                {member.role_level && (
                  <span className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:border-white/20 dark:bg-white/5 dark:text-white">
                    {member.role_level}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-950 dark:text-white leading-none">{member.full_name}</h1>
              {member.headline && <p className="mt-3 text-base md:text-lg font-semibold text-slate-600 dark:text-slate-300">{member.headline}</p>}
            </div>

            {/* Layout Grid: Sidebar Left + Content Right */}
            <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
              {/* Sidebar Left */}
              <aside className="border-b border-slate-200 bg-slate-50/70 p-6 text-slate-900 sm:p-8 lg:border-b-0 lg:border-r lg:border-slate-200 dark:border-white/10 dark:bg-[#090909] dark:text-white">
                {/* Avatar Box */}
                <div className="relative mb-6 aspect-square w-44 overflow-hidden border-4 border-white bg-slate-200 shadow-xl sm:w-48 dark:border-[#0d0d0d] dark:bg-[#141414]">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={member.full_name}
                      width={260}
                      height={260}
                      unoptimized
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = "none"
                      }}
                      className="h-full w-full object-cover"
                      style={avatarStyle}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800 text-3xl font-black uppercase text-white">
                      {member.full_name?.charAt(0) || "G"}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-black uppercase leading-tight text-slate-900 dark:text-white">{member.position}</h2>
                  {member.company && <p className="text-xs font-bold text-[#ed1c24]">@{member.company}</p>}
                </div>

                {/* Badges List */}
                {badges.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {badges.map((badge, index) => <BadgePill key={`${badge.label}-${index}`} badge={badge} />)}
                  </div>
                )}

                {/* Contact Info Items */}
                <div className="mt-6 space-y-2.5 border-t border-slate-200 pt-5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
                  {member.location && (
                    <div className="flex items-center gap-2.5 rounded-none bg-white p-2.5 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/5">
                      <MapPin className="h-4 w-4 shrink-0 text-[#ed1c24]" />
                      <span className="truncate">{member.location}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2.5 rounded-none bg-white p-2.5 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/5">
                      <Mail className="h-4 w-4 shrink-0 text-[#ed1c24]" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2.5 rounded-none bg-white p-2.5 border border-slate-200/80 dark:bg-white/[0.03] dark:border-white/5">
                      <Phone className="h-4 w-4 shrink-0 text-[#ed1c24]" />
                      <span className="truncate">{member.phone}</span>
                    </div>
                  )}
                </div>

                {/* Social Channels */}
                <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/10">
                  <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Kênh kết nối</p>
                  <div className="flex flex-wrap gap-2">
                    {socials.map((link, index) => <SocialButton key={`${link.href || link.url}-${index}`} link={link} />)}
                    {member.website_url && <SocialButton link={{ label: "Website", platform: "website", href: member.website_url }} />}
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="bg-white p-6 sm:p-8 dark:bg-[#0b0b0b]">
                {/* Filter Tabs Navigation */}
                {sections.length > 1 && (
                  <div className="sticky top-20 z-20 mb-8 overflow-x-auto border border-slate-200 bg-white/90 p-1.5 backdrop-blur-md scrollbar-none dark:border-white/10 dark:bg-[#121212]/90">
                    <div className="flex items-center gap-1">
                      {sections.map((section, idx) => {
                        const key = section.key || `section-${idx}`
                        const isActive = activeTab === key
                        return (
                          <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`whitespace-nowrap px-4 py-2.5 text-xs font-black uppercase tracking-wider transition ${isActive
                              ? "bg-[#ed1c24] text-white shadow-xs"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                              }`}
                          >
                            {section.label || `Section ${idx + 1}`}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Active Tab Content Only */}
                <div>
                  {(() => {
                    const currentSectionIndex = sections.findIndex(
                      (s, idx) => (s.key || `section-${idx}`) === activeTab
                    )
                    const activeSection = currentSectionIndex !== -1 ? sections[currentSectionIndex] : sections[0]
                    const actualIndex = currentSectionIndex !== -1 ? currentSectionIndex : 0

                    if (!activeSection) return null

                    return (
                      <motion.div
                        key={activeSection.key || `section-${actualIndex}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ProfileSection member={member} section={activeSection} index={actualIndex} />
                      </motion.div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}



