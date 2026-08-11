"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type Language = "vi" | "en"

type TranslationMap = Record<string, string>

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: string, fallback?: string) => string
  localize: <T,>(viValue: T, enValue?: T | null) => T
}

const translations: Record<Language, TranslationMap> = {
  vi: {
    "nav.about": "GIỚI THIỆU",
    "nav.services": "DỊCH VỤ",
    "nav.projects": "DỰ ÁN",
    "nav.gzvers": "GZVers",
    "nav.news": "TIN TỨC",
    "nav.contact": "LIÊN HỆ",
    "nav.login": "GZVer Login",
    "nav.openMenu": "Mở menu",
    "nav.closeMenu": "Đóng menu",
    "common.search": "Tìm kiếm",
    "common.loading": "Đang tải dữ liệu...",
    "common.viewDetails": "Xem chi tiết",
    "common.contact": "Liên hệ",
    "common.backToTop": "Lên đầu trang",
    "floating.connect": "Kết nối nhanh",
    "floating.open": "Mở menu liên hệ",
    "floating.close": "Đóng menu liên hệ",
    "footer.links": "Liên kết",
    "footer.connect": "Kết nối",
    "footer.newsletter": "Đăng ký nhận tin mới",
    "footer.newsletterDesc": "Nhận thông tin sự kiện, dự án và tin tức mới nhất từ GZV.",
    "footer.emailPlaceholder": "Email của bạn...",
    "footer.contact": "Liên hệ GZV",
    "page.maintenanceTitle": "Trang đang được bảo trì",
    "page.maintenanceDesc": "Nội dung này đang được admin tạm ẩn và sẽ quay lại khi hoàn tất cập nhật.",
  },
  en: {
    "nav.about": "ABOUT",
    "nav.services": "SERVICES",
    "nav.projects": "PROJECTS",
    "nav.gzvers": "GZVers",
    "nav.news": "NEWS",
    "nav.contact": "CONTACT",
    "nav.login": "GZVer Login",
    "nav.openMenu": "Open menu",
    "nav.closeMenu": "Close menu",
    "common.search": "Search",
    "common.loading": "Loading data...",
    "common.viewDetails": "View details",
    "common.contact": "Contact",
    "common.backToTop": "Back to top",
    "floating.connect": "Quick connect",
    "floating.open": "Open contact menu",
    "floating.close": "Close contact menu",
    "footer.links": "Links",
    "footer.connect": "Connect",
    "footer.newsletter": "Subscribe",
    "footer.newsletterDesc": "Get the latest GZV events, projects and insights.",
    "footer.emailPlaceholder": "Your email...",
    "footer.contact": "Contact GZV",
    "page.maintenanceTitle": "Page under maintenance",
    "page.maintenanceDesc": "This content is temporarily hidden by admin and will return after the update is complete.",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi")

  useEffect(() => {
    const saved = localStorage.getItem("language")
    if (saved === "vi" || saved === "en") setLanguageState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "vi"
  }, [language])

  const value = useMemo<LanguageContextType>(() => {
    const setLanguage = (lang: Language) => {
      setLanguageState(lang)
      localStorage.setItem("language", lang)
    }

    return {
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "vi" ? "en" : "vi"),
      t: (key, fallback) => translations[language][key] || fallback || key,
      localize: (viValue, enValue) => (language === "en" && enValue ? enValue : viValue),
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider")
  return context
}

export function localizeRecord<T extends Record<string, any>>(record: T, language: Language): T {
  if (language !== "en" || !record || typeof record !== "object") return record

  const localized: Record<string, any> = { ...record, ...(record.en && typeof record.en === "object" ? record.en : {}) }

  for (const [key, value] of Object.entries(record)) {
    if (!key.endsWith("_en")) continue
    const baseKey = key.slice(0, -3)
    if (value !== undefined && value !== null && value !== "") localized[baseKey] = value
  }

  for (const [key, value] of Object.entries(localized)) {
    if (Array.isArray(value)) localized[key] = value.map((item) => (item && typeof item === "object" ? localizeRecord(item, language) : item))
    else if (value && typeof value === "object" && key !== "en") localized[key] = localizeRecord(value, language)
  }

  return localized as T
}
