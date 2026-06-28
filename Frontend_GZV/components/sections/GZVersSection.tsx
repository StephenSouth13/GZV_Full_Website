"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { api, gzver } from "@/lib/api-supabase"

const GZVersSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gzvers, setgzvers] = useState<gzver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchgzvers = async () => {
      try {
        setLoading(true)
        const data = await api.getGzvers()
        setgzvers(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchgzvers()
  }, [])

  const nextSlide = () => {
    if (gzvers.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % gzvers.length)
  }

  const prevSlide = () => {
    if (gzvers.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + gzvers.length) % gzvers.length)
  }

  const getVisibleCards = () => {
    if (gzvers.length === 0) return []
    const cards = []
    const count = Math.min(gzvers.length, 3)
    for (let i = 0; i < count; i++) {
      const index = (currentIndex + i) % gzvers.length
      cards.push(gzvers[index])
    }
    return cards
  }

  if (loading || gzvers.length === 0) return null

  return (
    <section className="overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50 py-12 dark:from-gray-900 dark:to-gray-800 sm:py-16 lg:py-20">
      <div className="container px-4">
        <motion.div
          className="mb-10 text-center sm:mb-14 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title mb-4 text-3xl sm:text-4xl md:text-5xl">
            Đội Ngũ GZVer
          </h2>
          <p className="section-subtitle text-gray-500 dark:text-gray-400 italic">
            Hành trình trưởng thành từ GZV Center
          </p>
        </motion.div>

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-center md:gap-6">
          <Button onClick={prevSlide} variant="outline" size="icon" className="hidden shrink-0 rounded-full border-teal-200 md:inline-flex">
            <ChevronLeft className="text-teal-600" />
          </Button>

          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:flex-grow md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {getVisibleCards().map((gzver) => (
                <motion.div
                  key={`${gzver.id}-${currentIndex}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="h-full w-[82vw] max-w-[340px] flex-none snap-center sm:w-[46vw] md:w-auto md:max-w-none"
                >
                  <Card className="group flex h-full flex-col rounded-xl border-none bg-white/80 shadow-xl backdrop-blur-sm">
                    <CardContent className="flex h-full flex-col items-center p-5 text-center sm:p-6 lg:p-8">
                      <div className="relative mb-6">
                        <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg sm:h-24 sm:w-24">
                          <Image src={gzver.avatar_url || "/gzvers/default.webp"} alt={gzver.full_name} width={96} height={96} unoptimized={true} className="h-full w-full object-cover" />
                        </div>
                        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 shadow-md">
                          <Star className="h-4 w-4 fill-current text-white" />
                        </div>
                      </div>

                      <div className="flex w-full flex-grow flex-col">
                        <h3 className="mb-1 text-lg font-bold text-gray-900 sm:text-xl">{gzver.full_name}</h3>
                        <p className="mb-1 text-sm font-medium text-teal-600">{gzver.position}</p>
                        <p className="mb-4 text-xs uppercase text-gray-400">@{gzver.company}</p>

                        <div className="mt-auto flex flex-grow items-center justify-center rounded-xl bg-teal-50/50 p-4">
                          <p className="text-sm italic text-gray-600">"{gzver.achievement_summary}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-3 md:hidden">
            <Button onClick={prevSlide} variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full border-teal-200">
              <ChevronLeft className="text-teal-600" />
            </Button>
            <Button onClick={nextSlide} variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full border-teal-200">
              <ChevronRight className="text-teal-600" />
            </Button>
          </div>

          <Button onClick={nextSlide} variant="outline" size="icon" className="hidden shrink-0 rounded-full border-teal-200 md:inline-flex">
            <ChevronRight className="text-teal-600" />
          </Button>
        </div>
      </div>
    </section>
  )
}

export default GZVersSection
