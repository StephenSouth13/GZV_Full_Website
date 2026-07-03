"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Facebook, Youtube, Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { defaultFooterSettings, getBrandingSettings, getFooterSettings, type FooterSettings } from "@/lib/site-content"

const iconMap: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  zalo: <MessageCircle className="h-5 w-5" />,
}

const FacebookSDKLoader = ({ pageUrl }: { pageUrl?: string | null }) => {
  useEffect(() => {
    if (!pageUrl) return
    if (document.getElementById("facebook-jssdk")) {
      if (window.FB) window.FB.XFBML.parse()
      return
    }
    const fbRoot = document.createElement("div")
    fbRoot.id = "fb-root"
    document.body.insertBefore(fbRoot, document.body.firstChild)

    const script = document.createElement("script")
    script.id = "facebook-jssdk"
    script.src = "https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v18.0&autoLogAppEvents=1"
    script.async = true
    script.defer = true
    script.crossOrigin = "anonymous"
    script.onload = () => {
      if (window.FB) window.FB.XFBML.parse()
    }
    document.body.appendChild(script)
  }, [pageUrl])
  return null
}

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

  return (
    <footer className="relative text-white" style={{ backgroundColor: settings.background_color }}>
      <FacebookSDKLoader pageUrl={settings.facebook_page_url} />

      <div className="relative z-10 container mx-auto px-4 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="min-w-0 lg:col-span-2"
          >
            <Link href="/" className="mb-5 inline-block w-auto">
              <div className="w-full max-w-[180px] rounded-xl bg-white p-3 shadow-lg sm:max-w-[220px] sm:p-4">
                <Image src={settings.logo_url || "/logo.webp"} alt="GZV" width={260} height={90} className="w-full h-auto object-contain" priority unoptimized />
              </div>
            </Link>

            <p className="text-white/80 mb-6 leading-relaxed text-base sm:text-lg">{settings.intro_text}</p>

            {settings.facebook_page_url && (
              <div className="w-full max-w-[320px] rounded-xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm">
                <div
                  className="fb-page"
                  data-href={settings.facebook_page_url}
                  data-tabs="timeline"
                  data-width=""
                  data-height="130"
                  data-small-header="true"
                  data-adapt-container-width="true"
                  data-hide-cover="false"
                  data-show-facepile="false"
                />
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}>
            <h3 className="text-xl font-bold mb-6 font-serif text-white">Thông tin liên hệ</h3>
            <div className="space-y-4">
              {settings.address && (
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 shrink-0 bg-white/10 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-white/80">{settings.address}</p>
                </div>
              )}
              {settings.phone_label && (
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 shrink-0 bg-white/10 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <a href={settings.phone_url || "#"} className="text-white/80 hover:text-white">{settings.phone_label}</a>
                </div>
              )}
              {settings.email_label && (
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 shrink-0 bg-white/10 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <a href={settings.email_url || "#"} className="text-white/80 hover:text-white">{settings.email_label}</a>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
            <h3 className="text-xl font-bold mb-6 font-serif text-white">{settings.newsletter_title}</h3>
            {settings.newsletter_description && <p className="text-white/80 mb-4">{settings.newsletter_description}</p>}

            <form onSubmit={handleNewsletterSubmit} className="mb-8">
              <div className="flex min-w-0">
                <Input type="email" placeholder="Email của bạn" className="min-w-0 rounded-r-none bg-white/20 border-white/20 text-white placeholder-white/60 focus:ring-white focus:border-white" required />
                <Button type="submit" className="shrink-0 rounded-l-none bg-white px-4 hover:bg-gray-200" style={{ color: settings.background_color }}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="flex gap-3 sm:gap-4">
              {settings.social_links.filter((item) => item.visible !== false && item.href).map((item) => (
                <Link key={`${item.label}-${item.href}`} href={item.href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-[#095095] transition-all duration-300" aria-label={item.label}>
                  {iconMap[item.icon || ""] || <MessageCircle className="h-5 w-5" />}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/20" style={{ backgroundColor: settings.bottom_background_color }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
            <p className="text-white/70 text-sm">© {new Date().getFullYear()} {settings.copyright_text}</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {settings.links.filter((item) => item.visible !== false && item.href).map((item) => (
                <Link key={`${item.label}-${item.href}`} href={item.href} className="text-white/70 hover:text-white">{item.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

declare global {
  interface Window {
    FB?: any
  }
}

export default Footer
