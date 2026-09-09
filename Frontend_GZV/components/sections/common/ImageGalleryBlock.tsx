"use client"

import Image from "next/image"

export interface ImageGalleryBlockProps {
  title?: string
  subtitle?: string
  images?: any[]
}

export default function ImageGalleryBlock({ title, subtitle, images = [] }: ImageGalleryBlockProps) {
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
              <article key={index} className="group overflow-hidden border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-[#ed1c24] dark:border-white/10 dark:bg-slate-900">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image src={image.src || "/placeholder.jpg"} alt={image.alt || image.title || `Image ${index + 1}`} fill className="object-cover transition duration-700 group-hover:scale-110" style={{ objectPosition: `${positionX}% ${positionY}%` }} />
                  {image.category && <span className="absolute left-3 top-3 bg-[#ed1c24] px-3 py-1.5 text-[10px] font-black uppercase text-white">{image.category}</span>}
                </div>
                <div className="p-4">
                  {image.title && <h3 className="text-base font-black uppercase leading-tight text-slate-950 dark:text-white">{image.title}</h3>}
                  {image.description && <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{image.description}</p>}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
