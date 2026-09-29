"use client"

import { forwardRef, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  Calendar,
  ContactRound,
  CreditCard,
  Download,
  Facebook,
  Globe2,
  Instagram,
  Link2,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  Music2,
  Phone,
  RotateCw,
  Share2,
  ShieldCheck,
  Youtube,
} from "lucide-react"
import { api, type gzver, type GzverCardLink, type GzverCardSettings, type GzverMemberCard } from "@/lib/api-supabase"

const SITE_URL = "https://www.gzv.one"
const NAVY = "#124c96"
const RED = "#ed1c24"
const CARD_RATIO = "54 / 85.6" // Chuẩn thẻ CR80 dựng đứng — dùng làm khung khi chèn ảnh thẻ thiết kế sẵn

type Side = "front" | "back"

const DEFAULT_SETTINGS: GzverCardSettings = {
  company_line: "CÔNG TY TNHH GZV",
  top_tagline: "THE VOICE OF GENZ",
  card_title: "THẺ THÀNH VIÊN",
  card_subtitle: "GZVER",
  tagline: "THE VOICE OF GENZ",
  email: "one.gzv@gmail.com",
  hotline: "0329 381 489",
  website_label: "WWW.GZV.ONE",
  website_url: SITE_URL,
  qr_caption: "QUÉT QR XÁC THỰC HỒ SƠ",
  template_front_image_url: null,
  template_back_image_url: null,
  template_overlay: true,
  demo_notice: "Thẻ demo – bản xem trước tạm thời, chưa phải thẻ chính thức.",
  official_notice: "Thẻ thành viên chính thức do GZV LTD cấp.",
  links: [],
  show_vcard: true,
}

const linkIcons: Record<string, any> = {
  website: Globe2,
  web: Globe2,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music2,
  zalo: MessageCircle,
  messenger: MessageCircle,
  email: Mail,
  mail: Mail,
  phone: Phone,
  calendar: Calendar,
}

// Họa tiết chìm chữ "GZV" chéo trên nền thẻ (data URI để html-to-image xuất ảnh được)
const watermark = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='170' height='90'><text x='10' y='55' transform='rotate(-24 85 45)' font-family='Arial Black,Arial' font-weight='900' font-size='18' fill='${NAVY}' fill-opacity='0.055'>GZV · GENZ</text></svg>`,
)}")`

const parseObject = <T,>(raw: unknown): T => {
  if (raw && typeof raw === "object") return raw as T
  if (typeof raw === "string") {
    try {
      return (JSON.parse(raw) || {}) as T
    } catch {
      return {} as T
    }
  }
  return {} as T
}

export const getMemberCard = (member: gzver) => parseObject<GzverMemberCard>(member.member_card)

const sortLinks = (links: unknown) =>
  (Array.isArray(links) ? (links as GzverCardLink[]) : [])
    .filter((link) => link.visible !== false && link.url?.trim())
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

const formatDate = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN")
}

const pick = (...values: Array<string | null | undefined>) => values.find((value) => value && value.trim())?.trim() || ""

type FaceSource = { image?: string; overlay: boolean }

type ResolvedCard = {
  isDemo: boolean
  companyLine: string
  topTagline: string
  cardTitle: string
  cardSubtitle: string
  tagline: string
  email: string
  hotline: string
  websiteLabel: string
  qrValue: string
  qrCaption: string
  cardNumber: string
  issuedAt?: string
  expiresAt?: string
  notice: string
  front: FaceSource
  back: FaceSource
  links: GzverCardLink[]
  showVcard: boolean
}

// Gộp cấu hình: riêng từng GZVer > mẫu chung (gzver_card_settings) > mặc định trong code
function resolveCard(member: gzver, card: GzverMemberCard, settings: GzverCardSettings): ResolvedCard {
  const profileUrl = `${SITE_URL}/gzver/${member.slug}`
  const faceSource = (personal?: string, template?: string | null): FaceSource => {
    if (personal?.trim()) return { image: personal.trim(), overlay: false }
    if (template?.trim()) return { image: template.trim(), overlay: settings.template_overlay !== false }
    return { overlay: true }
  }

  const personalLinks = sortLinks(card.links)
  if (member.website_url && !personalLinks.some((link) => link.url === member.website_url)) {
    personalLinks.unshift({ label: "Website cá nhân", url: member.website_url, icon: "website" })
  }

  const isDemo = card.status !== "official"
  return {
    isDemo,
    companyLine: pick(settings.company_line, DEFAULT_SETTINGS.company_line),
    topTagline: pick(settings.top_tagline, DEFAULT_SETTINGS.top_tagline),
    cardTitle: pick(card.card_title, settings.card_title, DEFAULT_SETTINGS.card_title),
    cardSubtitle: pick(card.card_subtitle, settings.card_subtitle, DEFAULT_SETTINGS.card_subtitle),
    tagline: pick(card.tagline, settings.tagline, DEFAULT_SETTINGS.tagline),
    email: pick(card.email, settings.email, DEFAULT_SETTINGS.email),
    hotline: pick(card.hotline, settings.hotline, DEFAULT_SETTINGS.hotline),
    websiteLabel: pick(card.website_label, settings.website_label, DEFAULT_SETTINGS.website_label),
    qrValue: pick(card.qr_url, profileUrl),
    qrCaption: pick(card.qr_caption, settings.qr_caption, DEFAULT_SETTINGS.qr_caption),
    cardNumber: pick(card.card_number, `GZV-${String(member.id || "").replace(/-/g, "").slice(0, 6).toUpperCase()}`),
    issuedAt: card.issued_at,
    expiresAt: card.expires_at,
    notice: isDemo
      ? pick(settings.demo_notice, DEFAULT_SETTINGS.demo_notice)
      : pick(card.notice, settings.official_notice, DEFAULT_SETTINGS.official_notice),
    front: faceSource(card.front_image_url, settings.template_front_image_url),
    back: faceSource(card.back_image_url, settings.template_back_image_url),
    links: [...personalLinks, ...(card.hide_default_links ? [] : sortLinks(settings.links))],
    showVcard: settings.show_vcard !== false,
  }
}

// Kích thước chữ tính theo % bề rộng thẻ (cqw) để thẻ luôn đúng tỉ lệ ở mọi cỡ màn hình
const cq = (value: number) => `${value}cqw`

function CardShell({ children, background }: { children: ReactNode; background?: string }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        borderRadius: cq(4.5),
        background: background
          ? `center / cover no-repeat url("${background}")`
          : `${watermark}, linear-gradient(160deg, #fffdf7 0%, #fbf6e9 55%, #f4ecd6 100%)`,
        boxShadow: "inset 0 0 0 1px rgba(18,76,150,.18)",
      }}
    >
      {children}
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center justify-center" style={{ gap: cq(2) }}>
      <span style={{ height: cq(0.5), width: cq(30), background: `linear-gradient(90deg, transparent, ${RED})` }} />
      <span style={{ color: RED, fontSize: cq(3.4), lineHeight: 1 }}>★</span>
      <span style={{ height: cq(0.5), width: cq(30), background: `linear-gradient(90deg, ${RED}, transparent)` }} />
    </div>
  )
}

function DemoStamp() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span style={{ transform: "rotate(-28deg)", fontSize: cq(17), fontWeight: 900, letterSpacing: cq(2), color: RED, opacity: 0.1 }}>
        DEMO
      </span>
    </div>
  )
}

function TemplateFront({ member, c }: { member: gzver; c: ResolvedCard }) {
  const department = member.gzver_departments?.name || member.department_name
  return (
    <CardShell background={c.front.image}>
      {!c.front.image && (
        <div className="absolute inset-x-0 top-0" style={{ height: cq(1.6), background: `linear-gradient(90deg, ${NAVY} 0 60%, ${RED} 60% 100%)` }} />
      )}
      <div className="relative flex h-full flex-col items-center text-center" style={{ padding: `${cq(8)} ${cq(7)} ${cq(6)}` }}>
        <p style={{ color: NAVY, fontSize: cq(3.6), fontWeight: 900, letterSpacing: cq(0.3), lineHeight: 1.35 }}>
          {c.companyLine.toUpperCase()}
          <br />
          <span style={{ color: RED }}>{c.topTagline.toUpperCase()}</span>
        </p>

        <div
          className="flex items-center justify-center rounded-full bg-white"
          style={{
            marginTop: cq(7),
            width: cq(40),
            height: cq(40),
            border: `${cq(0.9)} solid ${NAVY}`,
            boxShadow: `0 0 0 ${cq(1.4)} #fffdf7, 0 0 0 ${cq(1.9)} ${RED}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/card/gzv-mark.png" alt="GZV" style={{ width: cq(24), height: cq(24), objectFit: "contain" }} />
        </div>

        <p style={{ marginTop: cq(8), color: RED, fontSize: cq(7.6), fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap" }}>
          {c.cardTitle.toUpperCase()}
        </p>
        <p style={{ marginTop: cq(1.5), color: NAVY, fontSize: cq(14), fontWeight: 900, letterSpacing: cq(1.2), lineHeight: 1 }}>
          {c.cardSubtitle.toUpperCase()}
        </p>

        {department && (
          <span
            style={{
              marginTop: cq(5),
              background: NAVY,
              color: "#fff",
              fontSize: cq(3.2),
              fontWeight: 800,
              letterSpacing: cq(0.4),
              padding: `${cq(1.4)} ${cq(4)}`,
              borderRadius: cq(10),
              maxWidth: "100%",
            }}
          >
            {department.toUpperCase()}
          </span>
        )}

        <p style={{ marginTop: "auto", color: "#334155", fontSize: cq(2.9), fontStyle: "italic", fontWeight: 600, lineHeight: 1.5 }}>
          {c.hotline && (
            <>
              Hotline: {c.hotline}
              <br />
            </>
          )}
          {c.email && <>Email: {c.email}</>}
        </p>
        <div style={{ marginTop: cq(2.5), width: "100%" }}>
          <Divider />
        </div>
        <p style={{ marginTop: cq(2.5), color: NAVY, fontSize: cq(2.8), fontWeight: 900, letterSpacing: cq(0.6) }}>
          {c.websiteLabel.toUpperCase()} &nbsp;|&nbsp; NO. {c.cardNumber}
        </p>
      </div>
      {c.isDemo && <DemoStamp />}
    </CardShell>
  )
}

function TemplateBack({ member, c }: { member: gzver; c: ResolvedCard }) {
  const avatarStyle: CSSProperties = {
    objectPosition: `${member.avatar_position_x ?? 50}% ${member.avatar_position_y ?? 32}%`,
    transform: `scale(${(member.avatar_scale || 100) / 100})`,
  }
  const nameSize = member.full_name && member.full_name.length > 18 ? 7 : 8.6
  return (
    <CardShell background={c.back.image}>
      {!c.back.image && (
        <div className="absolute inset-x-0 top-0" style={{ height: cq(1.6), background: `linear-gradient(90deg, ${RED} 0 40%, ${NAVY} 40% 100%)` }} />
      )}
      <div className="relative flex h-full flex-col items-center text-center" style={{ padding: `${cq(8)} ${cq(7)} ${cq(6)}` }}>
        <div
          className="overflow-hidden bg-slate-200"
          style={{
            width: cq(46),
            height: cq(52),
            borderRadius: cq(6),
            border: `${cq(1.2)} solid #fff`,
            boxShadow: `0 0 0 ${cq(0.6)} ${NAVY}, 0 ${cq(2)} ${cq(5)} rgba(15,23,42,.25)`,
          }}
        >
          {member.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.avatar_url} alt={member.full_name} crossOrigin="anonymous" className="h-full w-full object-cover" style={avatarStyle} />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ background: NAVY, color: "#fff", fontSize: cq(16), fontWeight: 900 }}>
              {member.full_name?.charAt(0) || "G"}
            </div>
          )}
        </div>

        <p style={{ marginTop: cq(6), color: RED, fontSize: cq(3.4), fontWeight: 900, letterSpacing: cq(0.3), lineHeight: 1.3 }}>
          {(member.position || "GZVer").toUpperCase()}
        </p>
        <p style={{ marginTop: cq(1.5), color: NAVY, fontSize: cq(nameSize), fontWeight: 900, lineHeight: 1.1 }}>
          {member.full_name?.toUpperCase()}
        </p>

        <div
          className="bg-white"
          style={{
            marginTop: "auto",
            padding: cq(2),
            borderRadius: cq(2.5),
            border: `${cq(0.4)} solid rgba(18,76,150,.25)`,
            boxShadow: `0 ${cq(1)} ${cq(3)} rgba(15,23,42,.12)`,
          }}
        >
          <QRCodeSVG value={c.qrValue} level="M" fgColor="#0f172a" bgColor="#ffffff" style={{ width: cq(22), height: cq(22), display: "block" }} />
        </div>
        <p style={{ marginTop: cq(2), color: "#475569", fontSize: cq(2.5), fontWeight: 800, letterSpacing: cq(0.4) }}>{c.qrCaption.toUpperCase()}</p>

        <div style={{ marginTop: cq(3.5), width: "100%" }}>
          <Divider />
        </div>
        <p style={{ marginTop: cq(2.5), color: RED, fontSize: cq(3.3), fontWeight: 900, letterSpacing: cq(0.4) }}>{c.tagline.toUpperCase()}</p>
        {(c.issuedAt || c.expiresAt) && (
          <p style={{ marginTop: cq(1.2), color: "#64748b", fontSize: cq(2.4), fontWeight: 700 }}>
            {c.issuedAt && `Cấp ngày ${formatDate(c.issuedAt)}`}
            {c.issuedAt && c.expiresAt && " · "}
            {c.expiresAt && `Hiệu lực đến ${formatDate(c.expiresAt)}`}
          </p>
        )}
      </div>
      {c.isDemo && <DemoStamp />}
    </CardShell>
  )
}

type FaceProps = { member: gzver; c: ResolvedCard; side: Side; style?: CSSProperties }

// Một mặt thẻ: ảnh thẻ hoàn chỉnh (riêng từng người hoặc mẫu chung không vẽ đè), hoặc bố cục tự sinh trên nền mẫu
const CardFace = forwardRef<HTMLDivElement, FaceProps>(function CardFace({ member, c, side, style }, ref) {
  const source = side === "front" ? c.front : c.back
  return (
    <div ref={ref} className="relative w-full" style={{ aspectRatio: CARD_RATIO, containerType: "inline-size", ...style }}>
      {source.image && !source.overlay ? (
        <div className="relative h-full w-full overflow-hidden bg-white" style={{ borderRadius: cq(4.5) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={source.image}
            alt={`${member.full_name} - ${side === "front" ? "mặt trước" : "mặt sau"}`}
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
          />
          {c.isDemo && <DemoStamp />}
        </div>
      ) : side === "front" ? (
        <TemplateFront member={member} c={c} />
      ) : (
        <TemplateBack member={member} c={c} />
      )}
    </div>
  )
})

function SideLabel({ label, isDemo }: { label: string; isDemo: boolean }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">{label}</span>
      <span
        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] ${
          isDemo ? "border-[#ed1c24]/60 text-[#ff5a60]" : "border-emerald-400/60 text-emerald-300"
        }`}
      >
        {isDemo ? "Demo" : "Chính thức"}
      </span>
    </div>
  )
}

const escapeVcard = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1")

function buildVcard(member: gzver, c: ResolvedCard) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcard(member.full_name || "")};;;;`,
    `FN:${escapeVcard(member.full_name || "")}`,
    `ORG:${escapeVcard(member.company || "GZV LTD")}`,
    member.position && `TITLE:${escapeVcard(member.position)}`,
    `EMAIL;TYPE=INTERNET:${member.email || c.email}`,
    (member.phone || c.hotline) && `TEL;TYPE=CELL:${member.phone || c.hotline}`,
    `URL:${SITE_URL}/gzver/${member.slug}`,
    member.website_url && `URL:${member.website_url}`,
    "END:VCARD",
  ]
  return lines.filter(Boolean).join("\r\n")
}

const particles = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 53) % 100}%`,
  delay: `${(index * 0.7) % 9}s`,
  duration: `${9 + (index % 5) * 2}s`,
  rotate: `${(index * 37) % 180}deg`,
  gold: index % 3 !== 0,
}))

export function MemberCardShowcase({ member }: { member: gzver }) {
  const card = getMemberCard(member)
  const [settings, setSettings] = useState<GzverCardSettings>(DEFAULT_SETTINGS)
  const [flipped, setFlipped] = useState(false)
  const [downloading, setDownloading] = useState<Side | "both" | null>(null)
  const frontExportRef = useRef<HTMLDivElement>(null)
  const backExportRef = useRef<HTMLDivElement>(null)
  const bothExportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    api.getGzverCardSettings().then((data) => {
      if (active && data) setSettings({ ...DEFAULT_SETTINGS, ...data })
    })
    return () => {
      active = false
    }
  }, [])

  if (card.enabled === false) return null

  const c = resolveCard(member, card, settings)
  const profileUrl = `${SITE_URL}/gzver/${member.slug}`
  const fileBase = `the-gzver-${member.slug}`

  const download = async (target: Side | "both") => {
    const node = target === "front" ? frontExportRef.current : target === "back" ? backExportRef.current : bothExportRef.current
    if (!node) return
    setDownloading(target)
    try {
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true })
      const link = document.createElement("a")
      link.download = `${fileBase}-${target === "front" ? "mat-truoc" : target === "back" ? "mat-sau" : "2-mat"}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Không xuất được ảnh thẻ:", error)
      alert("Chưa tải được ảnh thẻ. Vui lòng thử lại sau.")
    } finally {
      setDownloading(null)
    }
  }

  const saveContact = () => {
    const blob = new Blob([buildVcard(member, c)], { type: "text/vcard;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${member.slug}.vcf`
    link.click()
    URL.revokeObjectURL(url)
  }

  const share = () => {
    const url = `${profileUrl}#card-visit`
    if (navigator.share) {
      navigator.share({ title: `Thẻ GZVer - ${member.full_name}`, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      alert("Đã sao chép link thẻ GZVer!")
    }
  }

  const buttonClass =
    "inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition hover:border-[#ed1c24] hover:bg-[#ed1c24] disabled:opacity-60"

  return (
    <section id="card-visit" className="relative scroll-mt-24 overflow-hidden bg-[#07090f] py-16 text-white md:py-20">
      {/* Nền: quầng sáng thương hiệu + kim tuyến rơi */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#124c96]/30 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#ed1c24]/20 blur-3xl" />
        {particles.map((p, index) => (
          <span
            key={index}
            className="gzv-confetti absolute top-0 block h-3 w-1.5 rounded-[1px]"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              background: p.gold ? "linear-gradient(180deg,#f7d774,#b8862b)" : RED,
              transform: `rotate(${p.rotate})`,
            }}
          />
        ))}
      </div>

      <div className="container relative max-w-5xl">
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#ff5a60]">
            <CreditCard className="h-4 w-4" /> GZVer Digital Card
          </p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-tight md:text-4xl">Card visit</h2>
        </div>

        <div
          className={`mx-auto mb-10 max-w-3xl rounded-xl border border-dashed px-5 py-4 text-center ${
            c.isDemo ? "border-[#ed1c24]/50 bg-[#ed1c24]/10" : "border-emerald-400/40 bg-emerald-500/10"
          }`}
        >
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-white ${
              c.isDemo ? "bg-[#ed1c24]" : "bg-emerald-600"
            }`}
          >
            {!c.isDemo && <ShieldCheck className="h-3.5 w-3.5" />}
            {c.isDemo ? "Card demo" : "Thẻ chính thức"}
          </span>
          <p className={`mt-2 text-sm font-semibold ${c.isDemo ? "text-[#ff6b70]" : "text-emerald-200"}`}>
            {c.notice}
            {!c.isDemo && c.issuedAt && ` Ngày cấp: ${formatDate(c.issuedAt)}.`}
          </p>
        </div>

        {/* Desktop/tablet: hai mặt đặt cạnh nhau */}
        <div className="mx-auto hidden max-w-[760px] grid-cols-2 gap-10 md:grid">
          {(["front", "back"] as Side[]).map((side) => (
            <div key={side}>
              <SideLabel label={side === "front" ? "Mặt trước" : "Mặt sau"} isDemo={c.isDemo} />
              <div className="transition duration-500 hover:-translate-y-2 hover:rotate-[0.6deg] [filter:drop-shadow(0_25px_40px_rgba(0,0,0,.55))]">
                <CardFace member={member} c={c} side={side} />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: thẻ lật 3D */}
        <div className="mx-auto w-full max-w-[300px] md:hidden">
          <SideLabel label={flipped ? "Mặt sau" : "Mặt trước"} isDemo={c.isDemo} />
          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            aria-label="Lật thẻ"
            className="block w-full [filter:drop-shadow(0_20px_30px_rgba(0,0,0,.55))]"
            style={{ perspective: "1200px" }}
          >
            <div
              className="relative w-full transition-transform duration-700"
              style={{ aspectRatio: CARD_RATIO, transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}
            >
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
                <CardFace member={member} c={c} side="front" />
              </div>
              <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <CardFace member={member} c={c} side="back" />
              </div>
            </div>
          </button>
          <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">Chạm vào thẻ để lật mặt</p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={() => setFlipped((value) => !value)} className={`${buttonClass} md:hidden`}>
            <RotateCw className="h-4 w-4" /> Lật thẻ
          </button>
          <button type="button" onClick={() => download("both")} disabled={!!downloading} className={`${buttonClass} border-[#ed1c24] bg-[#ed1c24]`}>
            {downloading === "both" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Tải thẻ 2 mặt
          </button>
          <button type="button" onClick={() => download("front")} disabled={!!downloading} className={buttonClass}>
            {downloading === "front" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Mặt trước
          </button>
          <button type="button" onClick={() => download("back")} disabled={!!downloading} className={buttonClass}>
            {downloading === "back" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Mặt sau
          </button>
          {c.showVcard && (
            <button type="button" onClick={saveContact} className={buttonClass}>
              <ContactRound className="h-4 w-4" /> Lưu danh bạ
            </button>
          )}
          <button type="button" onClick={share} className={buttonClass}>
            <Share2 className="h-4 w-4" /> Chia sẻ
          </button>
        </div>

        {c.links.length > 0 && (
          <div className="mx-auto mt-10 max-w-3xl border-t border-white/10 pt-8">
            <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Liên kết</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {c.links.map((link, index) => {
                const Icon = linkIcons[(link.icon || "").toLowerCase()] || Link2
                return (
                  <a
                    key={`${link.url}-${index}`}
                    href={link.url}
                    target={link.url?.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group flex items-center gap-3 border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-[#ed1c24] hover:bg-[#ed1c24]/10"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-white/10 text-white group-hover:bg-[#ed1c24]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-white">{link.label || link.url}</span>
                      <span className="block truncate text-[11px] font-medium text-slate-400">{link.url?.replace(/^(https?:\/\/|mailto:|tel:)/, "")}</span>
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bản dựng ngoài màn hình, cỡ cố định, chỉ dùng để xuất ảnh PNG sắc nét */}
      <div aria-hidden className="pointer-events-none fixed left-[-10000px] top-0">
        <div ref={frontExportRef} style={{ width: 540 }}>
          <CardFace member={member} c={c} side="front" />
        </div>
        <div ref={backExportRef} style={{ width: 540 }}>
          <CardFace member={member} c={c} side="back" />
        </div>
        <div ref={bothExportRef} className="flex gap-10 bg-[#07090f] p-10" style={{ width: 1240 }}>
          <div style={{ width: 560 }}>
            <CardFace member={member} c={c} side="front" />
          </div>
          <div style={{ width: 560 }}>
            <CardFace member={member} c={c} side="back" />
          </div>
        </div>
      </div>
    </section>
  )
}
