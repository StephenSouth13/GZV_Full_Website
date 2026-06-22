"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AdminLayoutShellProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AdminLayoutShell({ children, title, description }: AdminLayoutShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen flex flex-col"
    >
      {/* Optional header section */}
      {title && (
        <div className="px-4 md:px-6 pt-6 pb-4 border-b border-white/10 dark:border-gray-700/10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Main content - responsive padding */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </motion.div>
  )
}
