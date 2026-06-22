"use client"

import { useAuth } from "@/contexts/auth-context"
// import { useCart } from "@/components/cart/CartProvider"
import { courses, formatCurrency, userProgress, type EnrolledCourse, type Achievement, type Course } from "../../../data/courses"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, Award, TrendingUp, Clock, User, Mail, Phone } from "lucide-react"

// Mock cart data for now
const mockCartItems: any[] = []

export default function StudentDashboard() {
  const { user, isLoading } = useAuth()
  // const { items } = useCart()
  const items = mockCartItems // Mock for now

  const recommended = courses.slice(0, 3)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section với thông tin user thực */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <Image 
                src={user.avatar} 
                alt={user.name || "User"} 
                width={64} 
                height={64} 
                className="rounded-full"
              />
            ) : (
              <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Chào mừng, {user?.fullName || user?.name || "Học viên"}!
            </h1>
            <div className="text-gray-600 dark:text-gray-400 space-y-1 mt-2">
              {user?.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              )}
              {user?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              {user?.role && (
                <Badge variant="secondary" className="mt-2">
                  {user.role === 'user' ? 'Học viên' : user.role}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Khóa học</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{userProgress.stats.totalCourses}</div>
              <p className="text-xs text-gray-500">Tổng số đăng ký</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tiến độ</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{userProgress.stats.inProgressCourses}</div>
              <p className="text-xs text-gray-500">Đang học</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Hoàn thành</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{userProgress.stats.completedCourses}</div>
              <p className="text-xs text-gray-500">Chứng chỉ</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Thời gian</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{userProgress.stats.totalHours}h</div>
              <p className="text-xs text-gray-500">Đã học</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Learning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Tiếp tục học</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userProgress.enrolledCourses.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Bạn chưa có khóa học nào. Thêm vào giỏ và thanh toán để bắt đầu.
            </div>
          ) : (
            <div className="space-y-4">
              {userProgress.enrolledCourses.map((course: EnrolledCourse) => (
                <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Image 
                    src={course.image} 
                    alt={course.title} 
                    width={80} 
                    height={60} 
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{course.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Tiến độ: {course.progress}% • {course.nextLesson}
                    </p>
                    <Progress value={course.progress} className="w-full" />
                  </div>
                  <Button variant="outline" size="sm">
                    Tiếp tục học
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shopping Cart */}
      <Card>
        <CardHeader>
          <CardTitle>Giỏ hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Giỏ hàng trống. <Link className="text-blue-600 hover:underline" href="/dao-tao">Xem khóa học</Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm">{items.length} khóa học trong giỏ</span>
              <Link href="/cart">
                <Button>Xem giỏ hàng</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Thành tích</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userProgress.achievements.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Chưa có thành tích nào. Hoàn thành khóa học để nhận thành tích!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProgress.achievements.map((achievement: Achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {new Date(achievement.earnedDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Gợi ý cho bạn</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommended.map((course: Course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Image 
                src={course.image} 
                alt={course.title} 
                width={400} 
                height={200} 
                className="w-full h-36 object-cover"
              />
              <CardHeader>
                <CardTitle className="text-base">{course.title}</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="outline">{course.level}</Badge>
                  <span>•</span>
                  <span>{course.duration}</span>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm font-semibold text-blue-600">
                  {formatCurrency(course.price)}
                </div>
                <Link href={`/dao-tao/${course.id}`}>
                  <Button variant="outline" size="sm">Chi tiết</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
