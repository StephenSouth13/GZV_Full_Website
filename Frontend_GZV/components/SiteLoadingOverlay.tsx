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
          style={{ background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.14), transparent 34%), linear-gradient(135deg, ${settings.background_from}, ${settings.background_to})` }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28 } }}
        >
          <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: settings.accent_color }} />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.10)_0,transparent_24%,transparent_76%,rgba(255,255,255,0.08)_100%)] opacity-80" />
          <motion.div
            className="relative flex w-[min(88vw,390px)] flex-col items-center border border-white/18 bg-black/28 px-7 py-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          >
            <div className="relative mb-7 flex h-32 w-32 items-center justify-center">
              {settings.effect === 'orbit' && (
                <>
                  <motion.span className="absolute inset-0 border border-white/20" />
                  <motion.span
                    className="absolute inset-2 border-2 border-transparent"
                    style={{ borderTopColor: settings.accent_color }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.05, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.span
                    className="absolute inset-5 border border-transparent border-b-white/80"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.65, repeat: Infinity, ease: 'linear' }}
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
              <div className="relative z-10 flex h-24 w-24 items-center justify-center bg-white p-4 shadow-2xl ring-1 ring-white/50">
                <Image src={settings.logo_url || '/logo.webp'} alt={settings.title || 'GZV'} width={180} height={90} className="h-auto max-h-16 w-auto object-contain" priority unoptimized />
              </div>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-[0.16em]">{settings.title}</h2>
            <p className="mt-3 max-w-sm text-xs font-semibold uppercase tracking-[0.2em] text-white/74">{settings.subtitle}</p>
            <motion.div className="mt-7 h-1 w-full overflow-hidden bg-white/18">
              <motion.div className="h-full" style={{ backgroundColor: settings.accent_color }} animate={{ x: ['-100%', '120%'] }} transition={{ duration: 0.82, repeat: Infinity, ease: 'easeInOut' }} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
