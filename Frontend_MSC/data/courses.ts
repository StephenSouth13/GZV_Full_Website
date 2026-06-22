export interface Course {
  id: string
  title: string
  description?: string
  price: number
  image: string
  duration?: string
  level?: string
  category?: string
  instructor?: string
  students?: number
  rating?: number
  progress?: number
}

export interface EnrolledCourse extends Course {
  progress: number
  lastAccessed: string
  nextLesson: string
}

export interface CompletedCourse extends Course {
  progress: 100
  completedDate: string
  certificate: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedDate: string
}

export interface UserProgressData {
  enrolledCourses: EnrolledCourse[]
  completedCourses: CompletedCourse[]
  achievements: Achievement[]
  stats: {
    totalCourses: number
    completedCourses: number
    inProgressCourses: number
    totalHours: number
    certificatesEarned: number
  }
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Demo data for courses - sử dụng data từ Supabase làm base
export const courses: Course[] = [
  {
    id: "27254ebd-c948-45c7-b77b-137ce71ac55",
    title: "Project Management Professional (PMP)",
    description: "Khóa học quản lý dự án chuyên nghiệp theo tiêu chuẩn quốc tế PMP",
    price: 15000000,
    image: "/dao-tao/1.webp",
    duration: "4 tháng",
    level: "Intermediate",
    category: "Management",
    instructor: "MSC Expert",
    students: 250,
    rating: 4.8,
    progress: 0
  },
  {
    id: "41acb243-c111-41eb-8140-8b20a318320a",
    title: "Digital Marketing Mastery",
    description: "Làm chủ marketing số từ cơ bản đến nâng cao",
    price: 12000000,
    image: "/dao-tao/2.webp", 
    duration: "2.5 tháng",
    level: "Beginner",
    category: "Marketing",
    instructor: "MSC Marketing Team",
    students: 180,
    rating: 4.7,
    progress: 0
  },
  {
    id: "8a27ed84-547b-4787-a391-6f34f445e200",
    title: "Leadership & Management Excellence",
    description: "Phát triển kỹ năng lãnh đạo và quản lý hiệu quả",
    price: 18000000,
    image: "/dao-tao/3.webp",
    duration: "3 tháng", 
    level: "Advanced",
    category: "Leadership",
    instructor: "MSC Leadership Coach",
    students: 120,
    rating: 4.9,
    progress: 0
  },
  {
    id: "demo-course-4",
    title: "Data Analytics Foundation", 
    description: "Nền tảng phân tích dữ liệu với Excel và Power BI",
    price: 8500000,
    image: "/dao-tao/4.webp",
    duration: "6 tuần",
    level: "Beginner", 
    category: "Data Science",
    instructor: "MSC Data Team",
    students: 95,
    rating: 4.6,
    progress: 0
  },
  {
    id: "demo-course-5",
    title: "Business Communication Skills",
    description: "Kỹ năng giao tiếp kinh doanh hiệu quả",
    price: 6000000,
    image: "/dao-tao/5.webp",
    duration: "4 tuần",
    level: "Beginner",
    category: "Soft Skills", 
    instructor: "MSC Communication Expert",
    students: 200,
    rating: 4.5,
    progress: 0
  }
]

// Demo user progress data
export const userProgress: UserProgressData = {
  enrolledCourses: [
    {
      ...courses[0],
      progress: 75,
      lastAccessed: "2025-09-20",
      nextLesson: "Module 4: Risk Management"
    } as EnrolledCourse,
    {
      ...courses[1], 
      progress: 30,
      lastAccessed: "2025-09-19",
      nextLesson: "Module 2: Social Media Strategy"
    } as EnrolledCourse
  ],
  completedCourses: [
    {
      ...courses[4],
      progress: 100,
      completedDate: "2025-08-15",
      certificate: true
    } as CompletedCourse
  ],
  achievements: [
    {
      id: "first-course",
      title: "Khóa học đầu tiên",
      description: "Hoàn thành khóa học đầu tiên",
      icon: "🎓",
      earnedDate: "2025-08-15"
    },
    {
      id: "fast-learner",
      title: "Học nhanh",
      description: "Hoàn thành khóa học trong thời gian kỷ lục",
      icon: "⚡",
      earnedDate: "2025-08-15"
    }
  ],
  stats: {
    totalCourses: 3,
    completedCourses: 1,
    inProgressCourses: 2,
    totalHours: 120,
    certificatesEarned: 1
  }
}