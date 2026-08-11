"use client"

import { useAuth } from "@/contexts/auth-context"
import { userProgress, formatCurrency } from "../../../data/courses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Clock, Award } from "lucide-react"

export default function MyCoursesPage() {
  const { user } = useAuth()
  if (!user) return null

  const enrolledCourses = userProgress.enrolledCourses
  const completedCourses = userProgress.completedCourses

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">KhÃ³a há»c cá»§a tÃ´i</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quáº£n lÃ½ vÃ  tiáº¿p tá»¥c há»c cÃ¡c khÃ³a há»c Ä‘Ã£ Ä‘Äƒng kÃ½
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-[#ed1c24]" />
              <span className="font-medium">Äang há»c</span>
            </div>
            <div className="text-2xl font-bold mt-1">{enrolledCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <span className="font-medium">HoÃ n thÃ nh</span>
            </div>
            <div className="text-2xl font-bold mt-1">{completedCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Tá»•ng giá»</span>
            </div>
            <div className="text-2xl font-bold mt-1">{userProgress.stats.totalHours}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">KhÃ³a há»c Ä‘ang há»c</h2>
        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-gray-600 dark:text-gray-400 mb-4">
                Báº¡n chÆ°a cÃ³ khÃ³a há»c nÃ o Ä‘ang há»c.
              </div>
              <Link href="/dich-vu">
                <Button>KhÃ¡m phÃ¡ dá»‹ch vá»¥</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="relative">
                  <Image 
                    src={course.image} 
                    alt={course.title} 
                    width={400} 
                    height={200} 
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-[#ed1c24] text-white px-2 py-1 rounded text-sm font-medium">
                      {course.progress}%
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tiáº¿p theo: {course.nextLesson}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tiáº¿n Ä‘á»™</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="w-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Truy cáº­p láº§n cuá»‘i: {new Date(course.lastAccessed).toLocaleDateString('vi-VN')}
                      </span>
                      <Button size="sm">Tiáº¿p tá»¥c há»c</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">KhÃ³a há»c Ä‘Ã£ hoÃ n thÃ nh</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="relative">
                  <Image 
                    src={course.image} 
                    alt={course.title} 
                    width={400} 
                    height={200} 
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                      <Award className="inline h-3 w-3 mr-1" />
                      HoÃ n thÃ nh
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    HoÃ n thÃ nh: {new Date(course.completedDate).toLocaleDateString('vi-VN')}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    {course.certificate && (
                      <Button variant="outline" size="sm">
                        <Award className="h-4 w-4 mr-2" />
                        Táº£i chá»©ng chá»‰
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      Xem láº¡i bÃ i há»c
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

