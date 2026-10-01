"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ImageGalleryBlockProps {
  title?: string
  subtitle?: string
  images?: any[]
}

export default function ImageGalleryBlock({ title, subtitle, images = [] }: ImageGalleryBlockProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  if (!images.length) return null
  return (
    <section className="bg-white py-16 dark:bg-gray-950 sm:py-20">
      <div className="container px-4">
        {(title || subtitle) && (
          <div className="mb-10 max-w-4xl border-l-4 border-[#ed1c24] pl-5">
            {title && <h2 className="text-3xl font-black uppercase text-gray-900 dark:text-white sm:text-5xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-base font-semibold leading-7 text-gray-600 dark:text-gray-300">{subtitle}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {images.map((image: any, index: number) => {
            const positionX = Number(image.position_x ?? 50)
            const positionY = Number(image.position_y ?? 50)
            return (
              <button type="button" key={index} onClick={() => setActiveIndex(index)} className="group overflow-hidden border border-slate-200 bg-white text-left shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-[#ed1c24] dark:border-white/10 dark:bg-slate-900">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image src={image.src || "/placeholder.jpg"} alt={image.alt || image.title || `Image ${index + 1}`} fill className="object-cover transition duration-700 group-hover:scale-110" style={{ objectPosition: `${positionX}% ${positionY}%` }} />
                  {image.category && <span className="absolute left-3 top-3 bg-[#ed1c24] px-3 py-1.5 text-[10px] font-black uppercase text-white">{image.category}</span>}
                  <span className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center bg-slate-950/80 text-white opacity-0 transition group-hover:opacity-100"><ExternalLink className="h-4 w-4" /></span>
                </div>
                <div className="p-4">
                  {image.title && <h3 className="text-base font-black uppercase leading-tight text-slate-950 dark:text-white">{image.title}</h3>}
                  {image.description && <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{image.description}</p>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      {activeIndex !== null && images[activeIndex] && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm" onClick={() => setActiveIndex(null)}>
          <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col items-center" onClick={(event) => event.stopPropagation()}>
            <Button type="button" variant="outline" size="icon" aria-label="Đóng" className="absolute right-0 top-0 z-10 rounded-none border-white/20 bg-slate-950/80 text-white hover:bg-[#ed1c24]" onClick={() => setActiveIndex(null)}><X className="h-5 w-5" /></Button>
            <div className="relative h-[70vh] w-full">
              <Image src={images[activeIndex].src || "/placeholder.jpg"} alt={images[activeIndex].alt || images[activeIndex].title || "GZV"} fill className="object-contain" sizes="100vw" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" aria-label="Ảnh trước" className="rounded-none border-white/20 bg-white/10 text-white hover:bg-[#ed1c24]" onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)}><ChevronLeft className="h-5 w-5" /></Button>
              <span className="min-w-20 text-center text-xs font-black uppercase tracking-widest text-white">{activeIndex + 1} / {images.length}</span>
              <Button type="button" variant="outline" size="icon" aria-label="Ảnh sau" className="rounded-none border-white/20 bg-white/10 text-white hover:bg-[#ed1c24]" onClick={() => setActiveIndex((activeIndex + 1) % images.length)}><ChevronRight className="h-5 w-5" /></Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
