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
        <h1 className="text-2xl font-bold mb-2">Khóa học của tôi</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quản lý và tiếp tục học các khóa học đã đăng ký
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Đang học</span>
            </div>
            <div className="text-2xl font-bold mt-1">{enrolledCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <span className="font-medium">Hoàn thành</span>
            </div>
            <div className="text-2xl font-bold mt-1">{completedCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Tổng giờ</span>
            </div>
            <div className="text-2xl font-bold mt-1">{userProgress.stats.totalHours}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Khóa học đang học</h2>
        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-gray-600 dark:text-gray-400 mb-4">
                Bạn chưa có khóa học nào đang học.
              </div>
              <Link href="/dao-tao">
                <Button>Khám phá khóa học</Button>
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
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {course.progress}%
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Tiếp theo: {course.nextLesson}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tiến độ</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="w-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Truy cập lần cuối: {new Date(course.lastAccessed).toLocaleDateString('vi-VN')}
                      </span>
                      <Button size="sm">Tiếp tục học</Button>
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
          <h2 className="text-xl font-semibold mb-4">Khóa học đã hoàn thành</h2>
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
                      Hoàn thành
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Hoàn thành: {new Date(course.completedDate).toLocaleDateString('vi-VN')}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    {course.certificate && (
                      <Button variant="outline" size="sm">
                        <Award className="h-4 w-4 mr-2" />
                        Tải chứng chỉ
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      Xem lại bài học
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
