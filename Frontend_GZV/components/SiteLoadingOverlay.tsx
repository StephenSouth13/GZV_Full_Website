'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { SiteLoadingSettings } from '@/lib/site-content'

type Props = {
  settings: SiteLoadingSettings
  show: boolean
}

export default function SiteLoadingOverlay({ settings, show }: Props) {
  if (!settings.enabled) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden text-white"
          style={{ background: `linear-gradient(135deg, ${settings.background_from}, ${settings.background_to})` }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.42 } }}
        >
          <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: settings.accent_color }} />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_18px)] opacity-35" />
          <motion.div
            className="relative flex w-[min(88vw,420px)] flex-col items-center border border-white/14 bg-black/35 px-8 py-10 text-center shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
              {settings.effect === 'orbit' && (
                <>
                  <motion.span className="absolute inset-0 border border-white/20" />
                  <motion.span
                    className="absolute inset-2 border-2 border-transparent"
                    style={{ borderTopColor: settings.accent_color }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.span
                    className="absolute inset-5 border border-transparent border-b-white/80"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                  />
                </>
              )}
              {settings.effect === 'pulse' && (
                <motion.span
                  className="absolute inset-0"
                  style={{ backgroundColor: settings.accent_color }}
                  animate={{ opacity: [0.12, 0.28, 0.12], scale: [0.9, 1.08, 0.9] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {settings.effect === 'bars' && (
                <div className="absolute -bottom-2 flex gap-1.5">
                  {[0, 1, 2, 3].map((item) => (
                    <motion.span
                      key={item}
                      className="h-8 w-2"
                      style={{ backgroundColor: settings.accent_color }}
                      animate={{ scaleY: [0.45, 1, 0.45] }}
                      transition={{ duration: 0.75, repeat: Infinity, delay: item * 0.12 }}
                    />
                  ))}
                </div>
              )}
              <div className="relative z-10 flex h-24 w-24 items-center justify-center bg-white p-4 shadow-2xl ring-1 ring-white/40">
                <Image src={settings.logo_url || '/logo.webp'} alt={settings.title || 'GZV'} width={180} height={90} className="h-auto max-h-16 w-auto object-contain" priority unoptimized />
              </div>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-[0.16em]">{settings.title}</h2>
            <p className="mt-3 max-w-sm text-sm font-semibold uppercase tracking-[0.22em] text-white/72">{settings.subtitle}</p>
            <motion.div className="mt-8 h-1 w-full overflow-hidden bg-white/18">
              <motion.div className="h-full" style={{ backgroundColor: settings.accent_color }} animate={{ x: ['-100%', '120%'] }} transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut' }} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
