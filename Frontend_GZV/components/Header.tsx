"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronRight, LogIn, Mail, Menu, Moon, Phone, Search, Sun, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { defaultNavigation, getBrandingSettings, getSiteNavigation, type SiteNavItem } from "@/lib/site-content"
import { useLanguage } from "@/components/language-provider"

const Header = () => {
  const pathname = usePathname()
  const { language, toggleLanguage, t } = useLanguage()
  const { resolvedTheme, setTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [navItems, setNavItems] = useState<SiteNavItem[]>(defaultNavigation)
  const [headerLogo, setHeaderLogo] = useState("/logo.webp")
  const [topbar, setTopbar] = useState({
    email: "gzv.one@gmail.com",
    phone: "(+84) 329 381 489",
    badge: "THE NEXT-GEN COMPANY",
  })

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    let active = true
    Promise.all([getBrandingSettings(), getSiteNavigation()]).then(([branding, navigation]) => {
      if (!active) return
      setHeaderLogo(branding.header_logo_url || "/logo.webp")
      setNavItems(navigation.filter((item) => item.is_visible !== false))
      setTopbar({
        email: branding.topbar_email_label || "gzv.one@gmail.com",
        phone: branding.topbar_phone_label || "(+84) 329 381 489",
        badge: branding.topbar_badge_label || "THE NEXT-GEN COMPANY",
      })
    })
    return () => {
      active = false
    }
  }, [])

  const activePath = navItems.find((item) => item.href !== "/" && pathname.startsWith(item.href.split("#")[0]))?.href || null
  const getLabel = (item: SiteNavItem) => language === "en" ? (item.label_en || item.label_vi) : item.label_vi
  const isDark = mounted && resolvedTheme === "dark"
  const toggleTheme = () => setTheme(isDark ? "light" : "dark")
  const navTree = useMemo(() => {
    const visible = navItems.filter((item) => item.is_visible !== false)
    const childMap = new Map<string, SiteNavItem[]>()
    visible.forEach((item) => {
      if (!item.parent_href) return
      childMap.set(item.parent_href, [...(childMap.get(item.parent_href) || []), item])
    })
    return visible
      .filter((item) => !item.parent_href)
      .map((item) => ({
        item,
        children: (childMap.get(item.href) || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
      }))
      .sort((a, b) => (a.item.sort_order || 0) - (b.item.sort_order || 0))
  }, [navItems])

  return (
    <>
      <div className={`fixed inset-x-0 top-0 z-[60] hidden h-9 border-b border-white/10 bg-[#050505] text-white transition duration-300 lg:block ${isScrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}>
        <div className="container flex h-full items-center justify-between text-[11px] font-bold uppercase">
          <div className="flex items-center gap-6 text-white/80">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[#ed1c24]" />
              {topbar.email}
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[#ed1c24]" />
              {topbar.phone}
            </span>
          </div>
          <span className="border-l-4 border-[#ed1c24] pl-3 text-white">{topbar.badge}</span>
        </div>
      </div>

      <motion.header
        className={`fixed inset-x-0 z-[70] border-b transition-all duration-300 ${
          isScrolled
            ? "top-0 border-slate-200 bg-white/96 shadow-[0_16px_38px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-[#050505]/96 lg:top-0"
            : "top-0 border-slate-200 bg-white/94 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#050505]/94 lg:top-9"
        }`}
      >
        <div className="container flex h-[74px] items-center justify-between gap-4 lg:h-[82px]">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="GZV home">
            <div className="relative h-12 w-[156px] shrink-0 lg:h-14 lg:w-[186px]">
              <Image src={headerLogo} alt="GZV" fill priority unoptimized className="object-contain" />
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navTree.map(({ item, children }) => {
              const isActive = item.href === activePath || children.some((child) => child.href === activePath)
              const hasChildren = children.length > 0
              return (
                <div key={item.href} className="group/menu relative">
                  <Link
                    href={item.href}
                    target={item.is_external ? "_blank" : undefined}
                    className={`group relative flex items-center gap-1 px-3 py-7 text-[12px] font-black transition-colors xl:px-4 ${
                      isActive ? "text-[#ed1c24]" : "text-slate-900 hover:text-[#ed1c24] dark:text-white dark:hover:text-[#ed1c24]"
                    }`}
                  >
                    {getLabel(item)}
                    {hasChildren && <ChevronDown className="h-3.5 w-3.5 transition group-hover/menu:rotate-180" />}
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-[3px] bg-[#ed1c24] transition-transform duration-300 ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                  {hasChildren && (
                    <div className="invisible absolute left-0 top-full w-72 translate-y-3 border border-slate-200 bg-white p-2 opacity-0 shadow-[0_24px_60px_rgba(0,0,0,0.16)] transition duration-200 group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100 dark:border-white/10 dark:bg-[#080808]">
                      {children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          target={child.is_external ? "_blank" : undefined}
                          className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-xs font-black uppercase text-slate-900 transition last:border-b-0 hover:bg-[#ed1c24] hover:text-white dark:border-white/10 dark:text-white"
                        >
                          {getLabel(child)}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="https://www.gzv.one/login" target="_blank" className="hidden xl:block">
              <Button className="h-11 rounded-none bg-[#ed1c24] px-5 text-xs font-black uppercase text-white hover:bg-[#c91218]">
                <LogIn className="mr-2 h-4 w-4" />
                GZVer Login
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="hidden h-11 w-11 rounded-none border-slate-300 text-slate-900 hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/15 dark:bg-[#101010] dark:text-white lg:inline-flex"
              aria-label={t("common.search")}
            >
              <Search className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden h-11 w-11 items-center justify-center border border-slate-300 bg-white text-slate-950 transition hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/15 dark:bg-[#101010] dark:text-white lg:inline-flex"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="hidden h-11 border border-slate-300 bg-white px-3 text-xs font-black uppercase text-slate-950 transition hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/15 dark:bg-[#101010] dark:text-white lg:inline-flex lg:items-center"
              aria-label="Switch language"
            >
              {language === "vi" ? "EN" : "VI"}
            </button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-none border-slate-300 dark:border-white/15 dark:bg-[#101010] dark:text-white lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label={t("nav.openMenu")}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/70 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-[100] flex w-[86vw] max-w-sm flex-col bg-[#050505] text-white lg:hidden"
            >
              <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Image src={headerLogo} alt="GZV" width={150} height={48} unoptimized className="h-12 w-auto object-contain" />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 py-6">
                {navTree.map(({ item, children }) => (
                  <div key={item.href} className="border-b border-white/10 py-3">
                    <Link
                      href={item.href}
                      target={item.is_external ? "_blank" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2 text-sm font-black uppercase tracking-wide text-white transition hover:text-[#ed1c24]"
                    >
                      {getLabel(item)}
                      <ChevronRight className="h-4 w-4 text-[#ed1c24]" />
                    </Link>
                    {children.length > 0 && (
                      <div className="mt-2 grid gap-2 border-l border-white/10 pl-4">
                        {children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            target={child.is_external ? "_blank" : undefined}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between bg-white/[0.04] px-3 py-3 text-xs font-black uppercase text-white/78 transition hover:bg-[#ed1c24] hover:text-white"
                          >
                            {getLabel(child)}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="border-t border-white/10 p-5">
                <p className="mb-4 text-xs font-bold leading-6 text-white/70">{topbar.email}<br />{topbar.phone}</p>
                <Link href="https://gzver.gzv.one/" target="_blank" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="h-12 w-full rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]">
                    {t("nav.login")}
                  </Button>
                </Link>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-12 items-center justify-center gap-2 border border-white/15 text-xs font-black uppercase text-white transition hover:border-[#ed1c24] hover:text-[#ed1c24]"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {isDark ? "Light" : "Dark"}
                  </button>
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="h-12 border border-white/15 text-xs font-black uppercase text-white transition hover:border-[#ed1c24] hover:text-[#ed1c24]"
                  >
                    {language === "vi" ? "English" : "Tiếng Việt"}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="h-[74px] lg:h-[123px]" />
    </>
  )
}

export default Header
