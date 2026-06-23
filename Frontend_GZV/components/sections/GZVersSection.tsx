"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star, Award, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase, gzver } from "@/lib/api-supabase"

const GZVersSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gzvers, setgzvers] = useState<gzver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchgzvers = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('gzvers')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true })
        if (error) throw error
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
    <section className="py-20 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
           <h2 className="section-title mb-6">
            Đội Ngũ gzvers
           </h2>
           <p className="section-subtitle text-gray-500 dark:text-gray-400 italic">
            Hành trình trưởng thành từ gzv Center
           </p>
        </motion.div>

        <div className="relative flex items-center justify-center gap-6">
          <Button onClick={prevSlide} variant="outline" size="icon" className="rounded-full shrink-0 border-teal-200">
            <ChevronLeft className="text-teal-600" />
          </Button>

          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <AnimatePresence mode="popLayout" initial={false}>
              {getVisibleCards().map((gzver) => (
                <motion.div key={`${gzver.id}-${currentIndex}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }} className="h-full">
                  <Card className="h-full border-none shadow-xl rounded-2xl flex flex-col bg-white/80 backdrop-blur-sm group">
                    <CardContent className="p-8 flex flex-col items-center h-full text-center">
                      <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                          <Image src={gzver.avatar_url || '/gzvers/default.webp'} alt={gzver.full_name} width={96} height={96} className="object-cover w-full h-full" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                          <Star className="h-4 w-4 text-white fill-current" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col flex-grow w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{gzver.full_name}</h3>
                        <p className="text-teal-600 font-medium text-sm mb-1">{gzver.position}</p>
                        <p className="text-gray-400 text-xs uppercase mb-4">@{gzver.company}</p>
                        
                        <div className="mt-auto p-4 bg-teal-50/50 rounded-xl flex-grow flex items-center justify-center">
                          <p className="text-gray-600 text-sm italic">"{gzver.achievement_summary}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Button onClick={nextSlide} variant="outline" size="icon" className="rounded-full shrink-0 border-teal-200">
            <ChevronRight className="text-teal-600" />
          </Button>
        </div>
      </div>
    </section>
  )
}
export default GZVersSection
