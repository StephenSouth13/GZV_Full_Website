//D:\gzv\gzv_users\app\dao-tao\page.tsx
'use client';

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, Award, BookOpen, Target, CheckCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence, useAnimation, useInView, Variants } from 'framer-motion';
import { api, Program } from "@/lib/api-supabase";

export default function TrainingPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const programsRes = await api.getPrograms()
        setPrograms(programsRes || [])
      } catch (error) {
        console.error('❌ Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const benefits = [
    { icon: Award, title: "Chứng chỉ uy tín", description: "Nhận chứng chỉ được công nhận quốc tế và trong nước", },
    { icon: Users, title: "Học từ chuyên gia", description: "Đội ngũ giảng viên giàu kinh nghiệm thực tiễn", },
    { icon: Target, title: "Thực hành thực tế", description: "70% thời gian dành cho thực hành và case study", },
    { icon: BookOpen, title: "Tài liệu độc quyền", description: "Bộ tài liệu học tập được biên soạn riêng", },
  ];

  const galleryPhotos = [ "/dao-tao/1.webp", "/dao-tao/2.webp", "/dao-tao/3.webp", "/dao-tao/4.webp", "/dao-tao/5.webp", "/dao-tao/6.webp", "/dao-tao/7.webp", "/dao-tao/8.webp", "/dao-tao/9.webp", "/dao-tao/10.webp", "/dao-tao/11.webp", "/dao-tao/12.webp", "/dao-tao/13.webp", "/dao-tao/14.webp", "/dao-tao/15.webp", "/dao-tao/16.webp", "/dao-tao/17.webp", "/dao-tao/18.webp", ];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => { setCurrentImageIndex(index); setLightboxOpen(true); document.body.style.overflow = 'hidden'; };
  const closeLightbox = () => { setLightboxOpen(false); document.body.style.overflow = 'auto'; };
  const goToPrev = () => { setCurrentImageIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length); };
  const goToNext = () => { setCurrentImageIndex((prev) => (prev + 1) % galleryPhotos.length); };
  
  const coreValues = [
    { title: "Mentoring & Coaching kỹ năng Marketing và Sales", description: "Định hình tư duy thị trường, nâng cao kỹ năng truyền thông – bán hàng thông qua các chương trình mentoring & coaching thực chiến.", color: "text-[#0077B6]", }, 
    { title: "Đào tạo kỹ năng Nghiên cứu, Thẩm định & Đánh giá dự án", description: "Trang bị phương pháp tiếp cận và phân tích dự án theo mô hình Holding: Sản phẩm – Con người – Tài chính, giúp học viên tư duy hệ thống và ra quyết định chiến lược.", color: "text-[#2A9D8F]", }, 
    { title: "Đào tạo Quản lý dự án (Trước-Trong-Sau)", description: "Phát triển năng lực lãnh đạo dự án qua toàn bộ vòng đời: từ hoạch định – triển khai – tổng kết, kết hợp thực hành và công cụ quản trị hiện đại.", color: "text-[#F4A261]", }, 
  ];

  // ========== PHẦN ANIMATION ĐÃ FIX LỖI ==========
  const gzvSectionRef = useRef(null);
  const isgzvInView = useInView(gzvSectionRef, { once: false, amount: 0.2 });

  const controlsM = useAnimation();
  const controlsS = useAnimation();
  const controlsC = useAnimation();

  const letterAnimation: Variants = {
    initial: { scale: 1, color: "#f97316" },
    animate: { 
      scale: [1, 1.3, 1],
      transition: { 
        duration: 0.8,
        ease: "easeInOut"
      } 
    },
  };

  useEffect(() => {
    let isActive = true;

    const sequence = async () => {
      // Chỉ chạy vòng lặp nếu component đang active và đang trong tầm nhìn
      while (isActive) {
        if (!isgzvInView) {
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }

        try {
          await controlsM.start("animate");
          if (!isActive) break;
          await new Promise(resolve => setTimeout(resolve, 200));
          
          await controlsS.start("animate");
          if (!isActive) break;
          await new Promise(resolve => setTimeout(resolve, 200));
          
          await controlsC.start("animate");
          if (!isActive) break;
          
          // Thời gian nghỉ giữa các lần lặp
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          console.error("Animation interrupted");
          break;
        }
      }
    };

    sequence();

    return () => {
      isActive = false;
      controlsM.stop();
      controlsS.stop();
      controlsC.stop();
    };
  }, [isgzvInView, controlsM, controlsS, controlsC]);


  const cardVariant: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 text-white">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 font-serif"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Chương trình Đào tạo
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Khám phá các chương trình đào tạo chuyên nghiệp được thiết kế để phát triển kỹ năng và nâng cao năng lực cạnh tranh trong thời đại số.
            </motion.p>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-300">50+</div>
                <div className="text-sm text-blue-200">Chương trình</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-300">5000+</div>
                <div className="text-sm text-blue-200">Học viên</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-300">95%</div>
                <div className="text-sm text-blue-200">Hài lòng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-300">85%</div>
                <div className="text-sm text-blue-200">Thăng tiến</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* gzv CORE VALUES */}
      <section ref={gzvSectionRef} className="py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="container text-center max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
              <motion.span variants={letterAnimation} initial="initial" animate={controlsM} className="inline-block">M</motion.span>entoring For Success
            </h2>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
              <motion.span variants={letterAnimation} initial="initial" animate={controlsS} className="inline-block">S</motion.span>kills For Success
            </h2>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
              <motion.span variants={letterAnimation} initial="initial" animate={controlsC} className="inline-block">C</motion.span>oaching For Success
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
            {coreValues.map((value, index) => (
              <motion.div 
                key={index}
                className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-blue-900"
                custom={index}
                variants={cardVariant}
                initial="hidden"
                animate={isgzvInView ? "visible" : "hidden"}
              >
                <h4 className={`text-xl font-bold ${value.color} mb-3 font-serif`}>{value.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Các phần còn lại (Benefits, Programs, Gallery) giữ nguyên như code của bạn */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white font-serif">Tại sao chọn gzv Center?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Những lợi ích vượt trội khi học tập tại gzv Center</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs List */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white font-serif">Chương trình đào tạo</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Các khóa học được thiết kế chuyên nghiệp, phù hợp thực tế</p>
          </div>

          {loading ? (
            <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((program) => (
                <Card key={program.id} className="overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-800 rounded-2xl border-none">
                  <div className="relative h-56">
                    <Image src={program.image || '/placeholder.jpg'} alt={program.title} fill className="object-cover" />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">{program.level}</div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold dark:text-white line-clamp-2">{program.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1"><Clock size={16}/> {program.duration}</span>
                      <span className="flex items-center gap-1"><Users size={16}/> {program.students} học viên</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3">{program.description}</p>
                    <Link href={`/dao-tao/${program.slug}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Chi tiết khóa học</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery & CTA... */}
       <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white font-serif">THƯ VIỆN ẢNH</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Hình ảnh đào tạo tại các dự án !</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryPhotos.map((photo, index) => (
              <motion.div key={index} className="relative aspect-video overflow-hidden rounded-lg shadow-md cursor-pointer" whileHover={{ scale: 1.05 }} onClick={() => openLightbox(index)}>
                <Image src={photo} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif uppercase tracking-tight">Sẵn sàng bắt đầu hành trình?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Để lại thông tin để được đội ngũ gzv tư vấn lộ trình phát triển phù hợp nhất.</p>
          <Link href="/lien-he">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-7 rounded-full font-bold text-lg shadow-xl uppercase tracking-widest">Đăng ký tư vấn miễn phí</Button>
          </Link>
        </div>
      </section>

      {/* Lightbox logic... */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeLightbox}>
            <motion.div className="relative max-w-5xl w-full" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <button className="absolute -top-12 right-0 text-white flex items-center gap-2 hover:text-red-400" onClick={closeLightbox}><X size={32}/></button>
              <div className="relative aspect-video">
                <Image src={galleryPhotos[currentImageIndex]} alt="Gallery" fill className="object-contain" />
              </div>
              <div className="flex justify-center gap-6 mt-8">
                <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10" onClick={goToPrev}><ChevronLeft size={24}/></Button>
                <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10" onClick={goToNext}><ChevronRight size={24}/></Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}