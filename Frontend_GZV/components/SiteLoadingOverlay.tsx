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
          style={{ background: `radial-gradient(circle at 30% 20%, ${settings.accent_color}33, transparent 28%), linear-gradient(135deg, ${settings.background_from}, ${settings.background_to})` }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
          <motion.div
            className="relative flex flex-col items-center px-6 text-center"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
              {settings.effect === 'orbit' && (
                <>
                  <motion.span className="absolute inset-0 rounded-full border border-white/20" />
                  <motion.span
                    className="absolute inset-2 rounded-full border-2 border-transparent border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.span
                    className="absolute inset-5 rounded-full border border-transparent border-b-white/70"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                  />
                </>
              )}
              {settings.effect === 'pulse' && (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: settings.accent_color }}
                  animate={{ opacity: [0.18, 0.34, 0.18], scale: [0.9, 1.12, 0.9] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              {settings.effect === 'bars' && (
                <div className="absolute -bottom-2 flex gap-1.5">
                  {[0, 1, 2, 3].map((item) => (
                    <motion.span
                      key={item}
                      className="h-8 w-2 rounded-full bg-white/80"
                      animate={{ scaleY: [0.45, 1, 0.45] }}
                      transition={{ duration: 0.75, repeat: Infinity, delay: item * 0.12 }}
                    />
                  ))}
                </div>
              )}
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/95 p-4 shadow-2xl ring-1 ring-white/40">
                <Image src={settings.logo_url || '/logo.webp'} alt={settings.title || 'GZV'} width={180} height={90} className="h-auto max-h-16 w-auto object-contain" priority unoptimized />
              </div>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-[0.2em]">{settings.title}</h2>
            <p className="mt-3 max-w-sm text-sm font-semibold uppercase tracking-[0.28em] text-white/75">{settings.subtitle}</p>
            <motion.div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-white/20">
              <motion.div className="h-full rounded-full bg-white" animate={{ x: ['-100%', '120%'] }} transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
