"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, X, Eye } from 'lucide-react'
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatePresence, motion } from "framer-motion"
import PageBanner from "@/components/sections/PageBanner"

// Định nghĩa Interface để fix lỗi TypeScript "Property does not exist"
interface GalleryImage {
  id: number;
  src: string;
  title: string;
  category: string;
  description: string;
}

const AboutPageClient = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { t } = useLanguage()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // CẬP NHẬT: Bổ sung đầy đủ dữ liệu để render UI xịn hơn
  const galleryImages: GalleryImage[] = [
    {
      id: 1,
      src: "/gioi-thieu/4.webp",
      title: "Môi trường đào tạo",
      category: "Cơ sở vật chất",
      description: "Không gian học tập hiện đại, đầy đủ tiện nghi tại MSC Center."
    },
    {
      id: 2,
      src: "/gioi-thieu/8.webp",
      title: "Lễ tốt nghiệp học viên",
      category: "Sự kiện",
      description: "Khoảnh khắc vinh danh những nỗ lực tuyệt vời của các học viên."
    },
    {
      id: 3,
      src: "/gioi-thieu/6.webp",
      title: "Hội thảo chuyên gia",
      category: "Hợp tác",
      description: "Kết nối tri thức cùng các chuyên gia hàng đầu trong ngành."
    },
    {
      id: 4,
      src: "/gioi-thieu/19.webp",
      title: "Buổi Mentoring trực tiếp",
      category: "Đào tạo",
      description: "Sự dẫn dắt sát sao giúp học viên phát triển tư duy đột phá."
    },
    {
      id: 5,
      src: "/gioi-thieu/9.webp",
      title: "Giao lưu doanh nghiệp",
      category: "Kết nối",
      description: "Mở rộng cơ hội nghề nghiệp thông qua các buổi networking."
    },
    {
      id: 6,
      src: "/gioi-thieu/1.webp",
      title: "Hoạt động ngoại khóa",
      category: "Văn hóa",
      description: "Xây dựng tinh thần đồng đội và kỹ năng mềm thiết yếu."
    },
    {
      id: 7,
      src: "/gioi-thieu/20.webp",
      title: "Thực hành dự án",
      category: "Học tập",
      description: "Áp dụng kiến thức vào các dự án thực tế ngay tại lớp học."
    },
    {
      id: 8,
      src: "/gioi-thieu/21.webp",
      title: "Đội ngũ Mentor tâm huyết",
      category: "Nhân sự",
      description: "Những người truyền lửa giàu kinh nghiệm và chuyên môn."
    },
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  const getVisibleThumbnails = () => {
    const thumbnails = []
    for (let i = 0; i < 4; i++) {
      const index = (currentImageIndex + i) % galleryImages.length
      thumbnails.push(galleryImages[index])
    }
    return thumbnails
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <PageBanner
        badge="Về chúng tôi"
        title="Giới thiệu"
        subtitle="Trung tâm Mentoring & Coaching đầu tiên tại Việt Nam, nơi kết nối tri thức và phát triển tiềm năng con người."
        stats={[
          { value: '10+', label: 'Năm kinh nghiệm' },
          { value: '10000+', label: 'Học viên' },
          { value: '100+', label: 'Mentor' },
          { value: '95%', label: 'Thành công' },
        ]}
      />

      {/* Philosophy Section */}
      <section className="py-20 bg-white dark:bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white font-serif">
              {t("about.learning.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              {t("about.learning.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { id: 'yolo', src: '/Introduction/yolo.png', delay: 0.1 },
              { id: 'pdca', src: '/Introduction/pdca.png', delay: 0.2 },
              { id: 'kaizen', src: '/Introduction/kaizen.png', delay: 0.3 }
            ].map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: item.delay }}
                viewport={{ once: true }}
                className="text-center cursor-pointer"
                onClick={() => setSelectedImage(item.src)}
              >
                <Image
                  src={item.src}
                  alt={item.id.toUpperCase()}
                  width={300}
                  height={200}
                  className="rounded-lg shadow-lg mx-auto mb-6"
                />
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {t(`about.${item.id}.title`)}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t(`about.${item.id}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox logic cho Philosophy Section */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl"
            >
               <img src={selectedImage} alt="Enlarged" className="max-h-[90vh] rounded-lg shadow-2xl" />
               <button className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-black"><X size={20}/></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Gallery Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white font-serif">
              THƯ VIỆN HÌNH ẢNH
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Những khoảnh khắc đáng nhớ trong hành trình phát triển và đào tạo tại MSC Center
            </p>
          </motion.div>

          {/* Main Carousel */}
          <div className="relative mb-8">
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group/main">
              <Image
                src={galleryImages[currentImageIndex].src}
                alt={galleryImages[currentImageIndex].title}
                fill
                className="object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <Badge className="mb-4 bg-blue-600">
                  {galleryImages[currentImageIndex].category}
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  {galleryImages[currentImageIndex].title}
                </h3>
                <p className="text-blue-100 text-lg">
                  {galleryImages[currentImageIndex].description}
                </p>
              </div>

              <button
                onClick={() => openLightbox(currentImageIndex)}
                className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
              >
                <Eye className="h-5 w-5 text-white" />
              </button>

              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40"><ChevronLeft className="text-white"/></button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40"><ChevronRight className="text-white"/></button>
            </div>

            <div className="flex justify-center mt-6 space-x-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentImageIndex ? "bg-blue-600 scale-125" : "bg-gray-300"}`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getVisibleThumbnails().map((image, index) => {
              const actualIndex = (currentImageIndex + index) % galleryImages.length
              return (
                <motion.div
                  key={`${image.id}-${actualIndex}`}
                  className="relative group cursor-pointer"
                  onClick={() => setCurrentImageIndex(actualIndex)}
                >
                  <div className="relative h-32 rounded-xl overflow-hidden shadow-md">
                    <Image src={image.src} alt={image.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="text-white fill-white" size={24}/>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-[10px] mb-1 uppercase tracking-wider">{image.category}</Badge>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{image.title}</h4>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
             <button onClick={closeLightbox} className="absolute -top-12 right-0 text-white flex items-center gap-2 hover:text-red-400 transition-colors">
                <X /> Đóng
             </button>
             <div className="relative aspect-video">
                <Image
                  src={galleryImages[lightboxIndex].src}
                  alt={galleryImages[lightboxIndex].title}
                  fill
                  className="object-contain"
                />
             </div>
             <div className="mt-6 text-center text-white">
                <Badge className="bg-blue-600 mb-2">{galleryImages[lightboxIndex].category}</Badge>
                <h3 className="text-2xl font-bold">{galleryImages[lightboxIndex].title}</h3>
                <p className="text-gray-400 mt-2">{galleryImages[lightboxIndex].description}</p>
                <div className="mt-4 flex justify-center gap-4">
                   <Button variant="outline" size="icon" onClick={prevLightboxImage} className="rounded-full"><ChevronLeft/></Button>
                   <span className="flex items-center text-sm font-mono">{lightboxIndex + 1} / {galleryImages.length}</span>
                   <Button variant="outline" size="icon" onClick={nextLightboxImage} className="rounded-full"><ChevronRight/></Button>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AboutPageClient
