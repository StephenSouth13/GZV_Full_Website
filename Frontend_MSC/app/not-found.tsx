"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Home, Search, ArrowLeft, BookOpen, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  const suggestions = [
    {
      title: "Khám phá các khóa học",
      description: "Tìm hiểu các chương trình đào tạo chuyên nghiệp",
      href: "/dao-tao",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Gặp gỡ Mentors",
      description: "Kết nối với các chuyên gia hàng đầu",
      href: "/mentors",
      icon: Users,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Cộng đồng MSCer",
      description: "Tham gia cộng đồng học viên thành công",
      href: "/mscer",
      icon: Award,
      color: "from-purple-500 to-purple-600",
    },
  ]

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated 404 */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="relative">
              {/* MSC Logo Background */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center opacity-5"
              >
                <div className="w-96 h-96 border-8 border-blue-200 rounded-full flex items-center justify-center">
                  <div className="text-8xl font-bold text-blue-300">MSC</div>
                </div>
              </motion.div>

              {/* 404 Text */}
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10"
              >
                <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-gradient-to-r from-blue-600 via-teal-500 to-blue-800 bg-clip-text leading-none">
                  404
                </h1>
              </motion.div>

              {/* Floating Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full opacity-60"
                    animate={{
                      y: [0, -100, 0],
                      x: [0, Math.random() * 100 - 50, 0],
                      opacity: [0.6, 1, 0.6],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">Oops! Trang không tồn tại</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Có vẻ như bạn đã đi lạc trong hành trình học tập. Đừng lo lắng, MSC Center sẽ giúp bạn tìm đúng đường!
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/">
              <Button size="lg" className="btn-primary px-8 py-4">
                <Home className="mr-2 h-5 w-5" />
                Về trang chủ
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent px-8 py-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Quay lại
            </Button>
            <Link href="/tin-tuc">
              <Button size="lg" variant="outline" className="bg-transparent px-8 py-4">
                <Search className="mr-2 h-5 w-5" />
                Tìm kiếm
              </Button>
            </Link>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Có thể bạn quan tâm</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href={suggestion.href}>
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6 text-center">
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${suggestion.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <suggestion.icon className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                          {suggestion.title}
                        </h4>
                        <p className="text-gray-600 text-sm">{suggestion.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-4">Vẫn không tìm thấy những gì bạn cần?</h4>
            <p className="text-gray-600 mb-6">Đội ngũ hỗ trợ của MSC Center luôn sẵn sàng giúp đỡ bạn 24/7</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/lien-he">
                <Button className="btn-secondary">Liên hệ hỗ trợ</Button>
              </Link>
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => window.open("tel:(+84) 329 381 489", "_self")}
              >
                Gọi hotline: (+84) 329 381 489
              </Button>
            </div>
          </motion.div>

          {/* Fun Fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-500 italic">
              💡 Fun fact: Lỗi 404 được đặt tên theo phòng 404 tại CERN - nơi máy chủ web đầu tiên được đặt!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
