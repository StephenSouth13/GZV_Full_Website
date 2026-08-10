"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Facebook, Mail, MapPin, MessageCircle, Phone, Send, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { defaultFooterSettings, getBrandingSettings, getFooterSettings, type FooterSettings } from "@/lib/site-content"

const fallbackLinks = [
  { label: "GIỚI THIỆU", href: "/gioi-thieu", visible: true },
  { label: "DỊCH VỤ", href: "/#dich-vu", visible: true },
  { label: "DỰ ÁN", href: "/du-an", visible: true },
  { label: "GZVers", href: "/gzver", visible: true },
  { label: "TIN TỨC", href: "/tin-tuc", visible: true },
  { label: "LIÊN HỆ", href: "/lien-he", visible: true },
]

const iconMap: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  zalo: <MessageCircle className="h-5 w-5" />,
}

const FooterHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-sm font-black uppercase text-white">{children}</h3>
    <div className="mt-3 h-[2px] w-36 bg-[#ed1c24]" />
  </div>
)

const Footer = () => {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings)

  useEffect(() => {
    let active = true
    Promise.all([getFooterSettings(), getBrandingSettings()]).then(([data, branding]) => {
      if (active) setSettings({ ...data, logo_url: data.logo_url || branding.footer_logo_url })
    })
    return () => {
      active = false
    }
  }, [])

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const footerLinks = useMemo(() => {
    const configured = (settings.links || []).filter((item) => item.visible !== false && item.href)
    return configured.length ? configured : fallbackLinks
  }, [settings.links])

  const socialLinks = (settings.social_links || []).filter((item) => item.visible !== false && item.href)
  const backgroundColor = settings.background_color || "#050505"
  const bottomBackgroundColor = settings.bottom_background_color || backgroundColor

  return (
    <footer className="border-t-4 border-[#ed1c24] text-white" style={{ backgroundColor }}>
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr_1fr_1.15fr] xl:gap-14">
          <div>
            <Link href="/" className="mb-6 inline-flex">
              <Image
                src={settings.logo_url || "/logo.webp"}
                alt="GZV"
                width={230}
                height={86}
                priority
                unoptimized
                className="h-auto w-[210px] object-contain"
              />
            </Link>
            {settings.intro_text && <p className="mb-5 max-w-sm text-sm font-bold leading-6 text-white/78">{settings.intro_text}</p>}

            <div className="space-y-4 text-sm font-bold leading-6 text-white/85">
              {settings.address && (
                <p className="flex gap-3">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#ed1c24]" />
                  <span>{settings.address}</span>
                </p>
              )}
              {settings.phone_label && (
                <a href={settings.phone_url || "#"} className="flex gap-3 transition hover:text-[#ed1c24]">
                  <Phone className="mt-1 h-4 w-4 shrink-0 text-[#ed1c24]" />
                  <span>{settings.phone_label}</span>
                </a>
              )}
              {settings.email_label && (
                <a href={settings.email_url || "#"} className="flex gap-3 transition hover:text-[#ed1c24]">
                  <Mail className="mt-1 h-4 w-4 shrink-0 text-[#ed1c24]" />
                  <span>{settings.email_label}</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <FooterHeading>Liên kết</FooterHeading>
            <ul className="space-y-3">
              {footerLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <Link href={item.href} className="group inline-flex items-center gap-3 text-sm font-bold text-white/85 transition hover:text-white">
                    <span className="h-2 w-2 bg-[#8c1116] transition group-hover:bg-[#ed1c24]" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading>Kết nối</FooterHeading>
            <div className="mb-5 flex gap-3">
              {socialLinks.map((item) => (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center bg-[#ed1c24] text-white transition hover:bg-white hover:text-[#050505]"
                  aria-label={item.label}
                >
                  {iconMap[item.icon || ""] || <MessageCircle className="h-5 w-5" />}
                </Link>
              ))}
            </div>
            <div className="border border-white/12 bg-white p-3 text-[#050505]">
              <div className="flex items-center gap-3">
                <Image src="/logo/favicon-32x32.png" alt="GZV" width={36} height={36} className="h-9 w-9" />
                <div>
                  <p className="line-clamp-1 text-sm font-black">GZV - The Next-Gen Company</p>
                  <p className="text-xs font-bold text-slate-500">{settings.facebook_page_url || "facebook.com/gzv.one"}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <FooterHeading>{settings.newsletter_title || "Đăng ký nhận tin mới"}</FooterHeading>
            <p className="mb-5 text-sm font-bold leading-6 text-white/80">
              {settings.newsletter_description || "Nhận thông tin sự kiện, dự án và tin tức mới nhất từ GZV."}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mb-5 flex">
              <Input
                type="email"
                placeholder="Email của bạn..."
                className="h-12 min-w-0 rounded-none border-0 bg-white px-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#ed1c24]"
                required
              />
              <Button type="submit" className="h-12 w-14 shrink-0 rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218]">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="border border-white/12 bg-white px-5 py-4 text-sm leading-6 text-slate-900">
              <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-500">Liên hệ GZV</p>
              <p className="font-black">GZV Ltd</p>
              <p className="font-semibold">{settings.phone_label || "(+84) 329 381 489"}</p>
              <p className="font-semibold">{settings.email_label || "Email: gzv.one@gmail.com"}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: bottomBackgroundColor }} className="border-t border-white/20">
        <div className="container flex flex-col gap-4 py-5 text-sm font-bold text-white/80 md:flex-row md:items-center md:justify-between">
          <p>{settings.copyright_text || "Copyright of www.gzv.one"}</p>
          <p>www.gzv.one</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
