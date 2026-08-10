"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { ArrowUp, Bot, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import Chatbot from "./Chatbot"
import { getFloatingActions, type FloatingAction } from "@/lib/site-content"

const listVariants: Variants = {
  hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = (index: number): Variants => ({
  hidden: { opacity: 0, y: 10, x: 10 },
  visible: {
    opacity: 1,
    y: -(index * 76 + 76),
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
})

const FloatingButtons = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [actions, setActions] = useState<FloatingAction[]>([])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let active = true
    getFloatingActions().then((data) => {
      if (active) setActions(data)
    })
    return () => {
      active = false
    }
  }, [])

  const visibleActions = actions.filter((action) => action.is_visible)

  return (
    <>
      <div className="fixed right-5 bottom-5 z-40">
        <AnimatePresence>
          {showScrollTop && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }} className="group relative mt-4">
              <Button size="icon" className="h-14 w-14 rounded-full bg-white shadow-lg hover:shadow-xl dark:bg-neutral-700" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <ArrowUp className="h-6 w-6 text-neutral-500 group-hover:text-primary dark:text-neutral-400" />
              </Button>
              <Tooltip text="Lên đầu trang" />
            </motion.div>
          )}
        </AnimatePresence>

        {visibleActions.length > 0 && (
          <motion.div className="relative mt-4 flex items-end flex-col gap-y-4" variants={listVariants} initial="hidden" animate={isMenuOpen ? "visible" : "hidden"}>
            <Button size="icon" className="h-16 w-16 rounded-full shadow-xl bg-neutral-800 text-white hover:bg-neutral-900 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-white z-10" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "Đóng menu" : "Mở menu liên hệ"}>
              <motion.div animate={{ rotate: isMenuOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
                <Plus className="h-6 w-6" />
              </motion.div>
            </Button>

            {visibleActions.map((button, index) => (
              <motion.div key={button.action_key} variants={itemVariants(index)} className="group absolute bottom-0">
                <Button
                  asChild={button.action_type === "link" && Boolean(button.href)}
                  size="icon"
                  className="h-14 w-14 rounded-full bg-transparent shadow-none hover:scale-105 transition-transform"
                  onClick={button.action_type === "chatbot" ? () => setShowChatbot(true) : undefined}
                >
                  {button.action_type === "link" && button.href ? (
                    <Link href={button.href} target="_blank" rel="noopener noreferrer" aria-label={button.label}>
                      <FloatingIcon action={button} />
                    </Link>
                  ) : (
                    <FloatingIcon action={button} />
                  )}
                </Button>
                <Tooltip text={button.label} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showChatbot && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} transition={{ duration: 0.3 }} className="fixed bottom-5 right-5 z-50 w-[20rem] max-w-[90vw] sm:w-[18rem]">
            <Chatbot onClose={() => setShowChatbot(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const FloatingIcon = ({ action }: { action: FloatingAction }) => {
  if (action.action_type === "chatbot") {
    return <Bot className="h-7 w-7 text-neutral-500 group-hover:text-[#ed1c24] dark:text-neutral-400" />
  }

  if (action.icon_url) {
    return <Image src={action.icon_url} alt={action.label} width={32} height={32} className="transition-transform group-hover:scale-110" unoptimized />
  }

  return <Plus className="h-6 w-6 text-neutral-500" />
}

const Tooltip = ({ text }: { text: string }) => (
  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1 bg-neutral-800 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-md dark:bg-neutral-600">
    {text}
    <div className="absolute left-full top-1/2 -translate-y-1/2 border-l-4 border-l-neutral-800 border-y-4 border-y-transparent h-0 w-0 dark:border-l-neutral-600"></div>
  </div>
)

export default FloatingButtons
