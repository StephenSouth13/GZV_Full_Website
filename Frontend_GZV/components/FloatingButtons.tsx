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
      <div className="fixed bottom-5 right-4 z-40 flex items-end gap-3 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.92 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group flex h-12 w-12 items-center justify-center border border-slate-200 bg-white text-[#050505] shadow-[0_18px_44px_rgba(15,23,42,0.18)] transition hover:border-[#ed1c24] hover:bg-[#ed1c24] hover:text-white"
              aria-label="Lên đầu trang"
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {visibleActions.length > 0 && (
          <div className="relative flex flex-col items-end">
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 18, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 18, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="mb-3 w-[260px] overflow-hidden border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
                >
                  <div className="border-b border-slate-200 bg-[#050505] px-4 py-3 text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ed1c24]">GZV Connect</p>
                    <p className="mt-1 text-sm font-black uppercase">{t("floating.connect")}</p>
                  </div>
                  <div className="grid gap-1 p-2">
                    {visibleActions.map((action) => (
                      <FloatingActionButton key={action.action_key} action={action} language={language} onClick={() => openAction(action)} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="flex h-14 items-center gap-3 bg-[#ed1c24] px-5 text-sm font-black uppercase text-white shadow-[0_18px_44px_rgba(237,28,36,0.28)] transition hover:bg-[#c91218]"
              aria-label={isOpen ? t("floating.close") : t("floating.open")}
            >
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </motion.span>
              {t("common.contact")}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 26, scale: 0.96 }}
            className="fixed bottom-24 right-4 z-50 w-[22rem] max-w-[calc(100vw-2rem)] sm:right-6"
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
  const content = (
    <span className="group flex w-full items-center gap-3 border border-transparent px-3 py-3 text-left transition hover:border-[#ed1c24] hover:bg-red-50">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#050505] text-white transition group-hover:bg-[#ed1c24]">
        <FloatingIcon action={action} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black text-slate-950">{label}</span>
        <span className="block truncate text-[11px] font-bold text-slate-500">
          {action.action_type === "chatbot" ? (language === "en" ? "Open chatbot" : "Mở chatbot") : action.href || (language === "en" ? "No link" : "Chưa có link")}
        </span>
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
