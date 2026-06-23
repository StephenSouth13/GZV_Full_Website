"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  BookOpen,
  Award,
  Clock,
  Target,
  Settings,
  MessageSquare,
  TrendingUp,
  Star,
  Trophy,
  Zap,
  Brain,
  Heart,
  Edit3,
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CourseProgress from "./CourseProgress"
import SettingsPanel from "./SettingsPanel"
import FeedbackForm from "./FeedbackForm"
import AchievementsGrid from "./AchievementsGrid"
import ProfileEditor from "./ProfileEditor"

interface UserProfile {
  id: string
  fullName: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  phone?: string
  occupation?: string
  company?: string
  joinedDate: string
  lastLogin: string
  stats: {
    coursesCompleted: number
    coursesInProgress: number
    totalLearningHours: number
    certificatesEarned: number
    skillsAcquired: number
    streakDays: number
    totalPoints: number
    currentLevel: number
  }
  recentActivity: Array<{
    id: string
    type: "course_completed" | "lesson_finished" | "achievement_earned" | "quiz_passed"
    title: string
    description: string
    timestamp: string
    points?: number
  }>
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    earnedAt: string
    rarity: "common" | "rare" | "epic" | "legendary"
    // THÊM 2 DÒNG NÀY VÀO ĐÂY
    category: string 
    isUnlocked: boolean
  }>
  skills: string[]
  interests: string[]
}

const ProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [user, setUser] = useState<UserProfile>({
    id: "user-123",
    fullName: "Quách Thành Long",
    email: "stephensouth1307@gmail.com",
    avatar: "/gzvers/QTL.webp",
    bio: "Passionate developer với 5 năm kinh nghiệm trong lĩnh vực web development. Luôn học hỏi và cập nhật những công nghệ mới nhất.",
    location: "Hồ Chí Minh, Việt Nam",
    website: "https://nguyenvanan.dev",
    phone: "+84 123 456 789",
    occupation: "Senior Frontend Developer",
    company: "Tech Innovation Co.",
    joinedDate: "2023-01-15",
    lastLogin: "2024-01-20T10:30:00Z",
    stats: {
      coursesCompleted: 12,
      coursesInProgress: 3,
      totalLearningHours: 156,
      certificatesEarned: 8,
      skillsAcquired: 24,
      streakDays: 15,
      totalPoints: 2850,
      currentLevel: 7,
    },
    recentActivity: [
      {
        id: "1",
        type: "course_completed",
        title: "Advanced React Patterns",
        description: "Hoàn thành khóa học với điểm số 95%",
        timestamp: "2024-01-20T09:00:00Z",
        points: 150,
      },
      {
        id: "2",
        type: "achievement_earned",
        title: "Speed Learner",
        description: "Hoàn thành 3 bài học trong 1 ngày",
        timestamp: "2024-01-19T15:30:00Z",
        points: 50,
      },
      {
        id: "3",
        type: "lesson_finished",
        title: "State Management with Zustand",
        description: "Hoàn thành bài học và quiz",
        timestamp: "2024-01-19T14:15:00Z",
        points: 25,
      },
    ],
    achievements: [
      {
        id: "1",
        name: "First Steps",
        description: "Hoàn thành khóa học đầu tiên",
        icon: "🎯",
        earnedAt: "2023-02-01",
        rarity: "common",
        category: "Học tập", 
        isUnlocked: true,
      },
      {
        id: "2",
        name: "Speed Demon",
        description: "Hoàn thành 5 bài học trong 1 ngày",
        icon: "⚡",
        earnedAt: "2023-03-15",
        rarity: "rare",
        // THÊM 2 DÒNG NÀY VÀO
        category: "Học tập",
        isUnlocked: true,
      },
      {
        id: "3",
        name: "Knowledge Seeker",
        description: "Đạt 100 giờ học tập",
        icon: "🧠",
        earnedAt: "2023-06-20",
        rarity: "epic",
        // THÊM 2 DÒNG NÀY VÀO
        category: "Tiến độ",
        isUnlocked: true,
      },
      {
        id: "4",
        name: "Master Learner",
        description: "Hoàn thành 10 khóa học",
        icon: "👑",
        earnedAt: "2023-12-01",
        rarity: "legendary",
        // THÊM 2 DÒNG NÀY VÀO
        category: "Hoàn thành",
        isUnlocked: true,
      },
    ],
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker"],
    interests: ["Web Development", "AI/ML", "Cloud Computing", "Mobile Development"],
  })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course_completed":
        return <Award className="h-4 w-4 text-green-600" />
      case "lesson_finished":
        return <BookOpen className="h-4 w-4 text-blue-600" />
      case "achievement_earned":
        return <Trophy className="h-4 w-4 text-yellow-600" />
      case "quiz_passed":
        return <Target className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Vừa xong"
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} ngày trước`
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container py-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="mb-8 overflow-hidden bg-gradient-to-r from-blue-600 to-teal-600 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white/20">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.fullName} />
                    <AvatarFallback className="text-2xl bg-white/20">
                      {user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-white text-blue-600 hover:bg-gray-100"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.fullName}</h1>
                    <Badge className="bg-white/20 text-white border-white/30">Level {user.stats.currentLevel}</Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
                    {user.occupation && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{user.occupation}</span>
                      </div>
                    )}
                    {user.company && (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        <span>{user.company}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                  </div>

                  {user.bio && <p className="text-white/90 mb-4 max-w-2xl">{user.bio}</p>}

                  <div className="flex flex-wrap gap-2">
                    {user.skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-white/20 text-white border-white/30">
                        {skill}
                      </Badge>
                    ))}
                    {user.skills.length > 6 && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        +{user.skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Chỉnh sửa hồ sơ
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
        >
          <Card className="text-center p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{user.stats.coursesCompleted}</div>
            <div className="text-sm text-gray-600">Khóa học hoàn thành</div>
          </Card>

          <Card className="text-center p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{user.stats.totalLearningHours}</div>
            <div className="text-sm text-gray-600">Giờ học tập</div>
          </Card>

          <Card className="text-center p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{user.stats.certificatesEarned}</div>
            <div className="text-sm text-gray-600">Chứng chỉ</div>
          </Card>

          <Card className="text-center p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center mb-2">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{user.stats.skillsAcquired}</div>
            <div className="text-sm text-gray-600">Kỹ năng</div>
          </Card>

          <Card className="text-center p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{user.stats.streakDays}</div>
            <div className="text-sm text-gray-600">Ngày liên tiếp</div>
          </Card>

          <Card className="text-center p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-pink-600">{user.stats.totalPoints}</div>
            <div className="text-sm text-gray-600">Điểm tích lũy</div>
          </Card>

          <Card className="text-center p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-teal-600">{user.stats.coursesInProgress}</div>
            <div className="text-sm text-gray-600">Đang học</div>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Tổng quan</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Khóa học</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Thành tựu</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Cài đặt</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Góp ý</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="overview" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Recent Activity */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          Hoạt động gần đây
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {user.recentActivity.map((activity) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900">{activity.title}</h4>
                              <p className="text-sm text-gray-600">{activity.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                                {activity.points && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{activity.points} điểm
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Learning Progress */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-600" />
                          Tiến độ học tập
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Cấp độ hiện tại</span>
                            <span className="font-medium">Level {user.stats.currentLevel}</span>
                          </div>
                          <Progress value={75} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">750/1000 điểm để lên cấp</p>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Streak học tập</span>
                            <span className="font-medium flex items-center gap-1">
                              <Zap className="h-4 w-4 text-orange-500" />
                              {user.stats.streakDays} ngày
                            </span>
                          </div>
                          <Progress value={60} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">Mục tiêu: 30 ngày liên tiếp</p>
                        </div>

                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-3">Thành tựu gần đây</h4>
                          <div className="space-y-2">
                            {user.achievements.slice(0, 3).map((achievement) => (
                              <div key={achievement.id} className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{achievement.icon}</span>
                                <span className="font-medium">{achievement.name}</span>
                                <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                                  {achievement.rarity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-600" />
                          Sở thích
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {user.interests.map((interest) => (
                            <Badge key={interest} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="courses">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CourseProgress />
                </motion.div>
              </TabsContent>

              <TabsContent value="achievements">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AchievementsGrid achievements={user.achievements} />
                </motion.div>
              </TabsContent>

              <TabsContent value="settings">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SettingsPanel user={user} onUpdateUser={setUser} />
                </motion.div>
              </TabsContent>

              <TabsContent value="feedback">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <FeedbackForm />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>

        {/* Profile Editor Modal */}
        <AnimatePresence>
          {isEditingProfile && (
            <ProfileEditor
              user={user}
              onClose={() => setIsEditingProfile(false)}
              onSave={(updatedUser) => {
                setUser(updatedUser)
                setIsEditingProfile(false)
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ProfileDashboard
