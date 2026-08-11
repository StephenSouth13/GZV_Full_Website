"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, Bot, Facebook, MessageCircle, MessageSquare, Phone, Plus, Send, X, Youtube } from "lucide-react"
import Chatbot from "./Chatbot"
import { getFloatingActions, type FloatingAction } from "@/lib/site-content"
import { useLanguage } from "@/components/language-provider"

const fallbackActions: FloatingAction[] = [
  { action_key: "chatbot", label: "Chat với GZV", action_type: "chatbot", sort_order: 10, is_visible: true },
  { action_key: "facebook", label: "Facebook", href: "https://www.facebook.com/gzv.one", icon_url: "", action_type: "link", sort_order: 20, is_visible: true },
  { action_key: "youtube", label: "YouTube", href: "https://www.youtube.com/@gzvLifeLongLearning", icon_url: "", action_type: "link", sort_order: 30, is_visible: true },
  { action_key: "zalo", label: "Zalo", href: "https://zalo.me/g/acumou501", icon_url: "", action_type: "link", sort_order: 40, is_visible: true },
]

export default function FloatingButtons() {
  const { language, t } = useLanguage()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [actions, setActions] = useState<FloatingAction[]>([])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 360)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let active = true
    getFloatingActions().then((data) => {
      if (active) setActions(data.length ? data : fallbackActions)
    })
    return () => {
      active = false
    }
  }, [])

  const visibleActions = useMemo(
    () => actions.filter((action) => action.is_visible).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [actions],
  )

  const openAction = (action: FloatingAction) => {
    if (action.action_type === "chatbot") {
      setShowChatbot(true)
      setIsOpen(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-4 right-3 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {isOpen && visibleActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="w-[min(calc(100vw-1.5rem),360px)] overflow-hidden border border-white/12 bg-white shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
            >
              <div className="relative overflow-hidden bg-[#050505] px-5 py-4 text-white">
                <div className="absolute inset-x-0 top-0 h-1 bg-[#ed1c24]" />
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ed1c24]">GZV Connect</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-black uppercase leading-none">{t("floating.connect")}</p>
                    <p className="mt-2 text-xs font-semibold text-white/55">{language === "en" ? "Choose a channel to connect." : "Chọn kênh kết nối nhanh."}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center border border-white/15 bg-white/8">
                    <MessageSquare className="h-5 w-5 text-[#ed1c24]" />
                  </div>
                </div>
              </div>

              <div className="grid gap-2 bg-slate-50 p-3">
                {visibleActions.map((action) => (
                  <FloatingActionButton key={action.action_key} action={action} language={language} onClick={() => openAction(action)} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.92 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex h-12 w-12 items-center justify-center border border-slate-200 bg-white text-[#050505] shadow-[0_18px_44px_rgba(15,23,42,0.18)] transition hover:border-[#ed1c24] hover:bg-[#ed1c24] hover:text-white"
                aria-label="Lên đầu trang"
              >
                <ArrowUp className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {visibleActions.length > 0 && (
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="group flex h-14 items-center gap-3 bg-[#ed1c24] px-5 text-sm font-black uppercase text-white shadow-[0_18px_44px_rgba(237,28,36,0.28)] transition hover:bg-[#c91218]"
              aria-label={isOpen ? t("floating.close") : t("floating.open")}
            >
              <span className="flex h-7 w-7 items-center justify-center bg-white text-[#ed1c24] transition group-hover:bg-[#050505] group-hover:text-white">
                {isOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
              {t("common.contact")}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 26, scale: 0.96 }}
            className="fixed bottom-24 right-3 z-50 w-[22rem] max-w-[calc(100vw-1.5rem)] sm:right-6"
          >
            <Chatbot onClose={() => setShowChatbot(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function FloatingActionButton({ action, language, onClick }: { action: FloatingAction; language: "vi" | "en"; onClick: () => void }) {
  const label = language === "en" ? ((action as any).label_en || (action as any).en?.label || action.label) : action.label
  const isChatbot = action.action_type === "chatbot"
  const description = isChatbot
    ? (language === "en" ? "Open GZV assistant" : "Mở trợ lý GZV")
    : getActionDescription(action, language)

  const content = (
    <span className="group flex w-full items-center gap-3 border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-[#ed1c24] hover:bg-red-50">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#050505] text-white transition group-hover:bg-[#ed1c24]">
        <FloatingIcon action={action} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-slate-950">{label}</span>
        <span className="mt-0.5 block truncate text-[11px] font-bold text-slate-500">{description}</span>
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 text-slate-400 transition group-hover:border-[#ed1c24] group-hover:bg-[#ed1c24] group-hover:text-white">
        {isChatbot ? <Bot className="h-4 w-4" /> : <Plus className="h-4 w-4 rotate-45" />}
      </span>
    </span>
  )

  if (action.action_type === "link" && action.href) {
    return (
      <Link href={action.href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className="w-full" aria-label={label}>
      {content}
    </button>
  )
}

function getActionDescription(action: FloatingAction, language: "vi" | "en") {
  const key = `${action.action_key} ${action.label}`.toLowerCase()
  if (key.includes("facebook")) return language === "en" ? "Follow GZV on Facebook" : "Theo dõi GZV trên Facebook"
  if (key.includes("youtube")) return language === "en" ? "Watch GZV videos" : "Xem video GZV"
  if (key.includes("zalo")) return language === "en" ? "Connect through Zalo" : "Kết nối qua Zalo"
  if (key.includes("phone") || key.includes("call")) return language === "en" ? "Call GZV" : "Gọi trực tiếp GZV"
  if (key.includes("mail") || key.includes("email")) return language === "en" ? "Send email" : "Gửi email"
  return language === "en" ? "Open contact channel" : "Mở kênh liên hệ"
}

function FloatingIcon({ action }: { action: FloatingAction }) {
  const key = `${action.action_key} ${action.label}`.toLowerCase()

  if (action.icon_url) {
    return <Image src={action.icon_url} alt={action.label} width={22} height={22} className="h-5 w-5 object-contain" unoptimized />
  }
  if (action.action_type === "chatbot") return <Bot className="h-5 w-5" />
  if (key.includes("facebook")) return <Facebook className="h-5 w-5" />
  if (key.includes("youtube")) return <Youtube className="h-5 w-5" />
  if (key.includes("zalo")) return <MessageCircle className="h-5 w-5" />
  if (key.includes("phone") || key.includes("call")) return <Phone className="h-5 w-5" />
  if (key.includes("mail") || key.includes("email")) return <Send className="h-5 w-5" />
  return <MessageSquare className="h-5 w-5" />
}
