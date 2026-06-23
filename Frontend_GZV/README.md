# 🎓 gzv Center - Life Long Learning Platform

<div align="center">
  <img src="/placeholder.svg?height=120&width=400&text=gzv+CENTER+LOGO" alt="gzv Center Logo" />
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-0055FF?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
  [![Golang](https://img.shields.io/badge/Go-1.21-00ADD8?style=for-the-badge&logo=go)](https://golang.org/)
  [![Rust](https://img.shields.io/badge/Rust-1.75-000000?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
  [![Sanity](https://img.shields.io/badge/Sanity-3.0-F03E2F?style=for-the-badge&logo=sanity)](https://www.sanity.io/)
</div>

## 📖 Giới thiệu

**gzv Center** là nền tảng giáo dục trực tuyến hàng đầu Việt Nam, chuyên cung cấp các khóa học chất lượng cao về công nghệ, kinh doanh và phát triển cá nhân. Với slogan **"Life Long Learning"**, chúng tôi cam kết đồng hành cùng học viên trong suốt hành trình học tập và phát triển sự nghiệp.

### 🎯 Mục tiêu dự án
- Xây dựng nền tảng giáo dục trực tuyến hiện đại và thân thiện
- Kết nối học viên với các mentor hàng đầu trong ngành
- Cung cấp nội dung chất lượng cao và cập nhật liên tục
- Tạo cộng đồng học tập tích cực và hỗ trợ lẫn nhau

## ✨ Tính năng chính

### 🎨 Frontend Features
- **🌟 Modern UI/UX**: Thiết kế hiện đại với Tailwind CSS và shadcn/ui
- **🎭 Animations**: Hiệu ứng mượt mà với Framer Motion
- **📱 Responsive Design**: Tối ưu cho mọi thiết bị (Mobile, Tablet, Desktop)
- **🌙 Dark Mode**: Chế độ tối/sáng với theme switching
- **🌐 Multilingual**: Hỗ trợ đa ngôn ngữ (Tiếng Việt/English)
- **⚡ Performance**: Tối ưu tốc độ tải và SEO
- **♿ Accessibility**: Tuân thủ chuẩn WCAG 2.1

### 🔧 Backend Features
- **🚀 Microservices**: Kiến trúc microservices với Golang và Rust
- **🗄️ Database**: PostgreSQL với Redis caching
- **🔐 Authentication**: JWT-based authentication system
- **📧 Email Service**: Automated email notifications
- **📊 Analytics**: Real-time analytics và reporting
- **🔍 Search**: Full-text search với Elasticsearch
- **📤 File Upload**: Cloud storage integration

### 📝 Content Management
- **📰 Blog System**: Hệ thống blog với rich text editor
- **👨‍🏫 Mentor Profiles**: Quản lý thông tin mentor chi tiết
- **🎓 Course Management**: Quản lý khóa học và bài giảng
- **💬 Comments**: Hệ thống bình luận và tương tác
- **📊 Analytics**: Theo dõi engagement và performance

## 🛠 Tech Stack

\`\`\`json
{
  "frontend": {
    "framework": "Next.js 14 (App Router)",
    "language": "TypeScript 5.0",
    "styling": "Tailwind CSS 3.4",
    "ui_components": "shadcn/ui",
    "animations": "Framer Motion 11.0",
    "icons": "Lucide React",
    "forms": "React Hook Form + Zod",
    "state_management": "Zustand",
    "http_client": "Axios"
  },
  "backend": {
    "api_gateway": "Golang (Gin Framework)",
    "analytics_service": "Rust (Warp Framework)",
    "database": "PostgreSQL 15",
    "cache": "Redis 7",
    "search": "Elasticsearch 8",
    "message_queue": "RabbitMQ",
    "file_storage": "AWS S3 / Cloudinary"
  },
  "cms": {
    "headless_cms": "Sanity 3.0",
    "rich_text": "Portable Text",
    "media_management": "Sanity Assets",
    "preview": "Live Preview"
  },
  "devops": {
    "containerization": "Docker & Docker Compose",
    "orchestration": "Kubernetes",
    "ci_cd": "GitHub Actions",
    "monitoring": "Prometheus + Grafana",
    "logging": "ELK Stack"
  }
}
\`\`\`

## 🚀 Cài đặt và Chạy dự án

### 📋 Yêu cầu hệ thống
- **Node.js**: >= 18.0.0
- **npm/yarn/pnpm**: Latest version
- **PostgreSQL**: >= 15.0
- **Redis**: >= 7.0
- **Docker**: >= 24.0 (optional)
- **Go**: >= 1.21 (for backend services)
- **Rust**: >= 1.75 (for analytics service)

### 1️⃣ Clone Repository
\`\`\`bash
git clone https://github.com/gzv-center/gzv-website.git
cd gzv-website
\`\`\`

### 2️⃣ Cài đặt Dependencies
\`\`\`bash
# Frontend dependencies
npm install
# hoặc
yarn install
# hoặc
pnpm install

# Backend Go dependencies
cd backend-go
go mod download
cd ..

# Backend Rust dependencies
cd backend-rust
cargo build
cd ..
\`\`\`

### 3️⃣ Cấu hình Environment Variables
\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Chỉnh sửa file .env.local với thông tin của bạn
\`\`\`

### 4️⃣ Setup Database
\`\`\`bash
# Khởi tạo PostgreSQL database
createdb gzv_center

# Chạy migrations
npm run db:migrate

# Seed data (optional)
npm run db:seed
\`\`\`

### 5️⃣ Chạy Development Server
\`\`\`bash
# Frontend (Next.js)
npm run dev

# Backend Go service
cd backend-go && go run main.go

# Backend Rust service
cd backend-rust && cargo run

# Hoặc chạy tất cả với Docker Compose
docker-compose up -dev
\`\`\`

### 6️⃣ Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Go API**: http://localhost:8080
- **Rust Analytics**: http://localhost:3001
- **Sanity Studio**: http://localhost:3333

## 📁 Cấu trúc dự án

\`\`\`
gzv-center-website/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (auth)/                   # Auth routes group
│   │   ├── 📁 login/
│   │   └── 📁 register/
│   ├── 📁 api/                      # API routes
│   │   ├── 📁 auth/
│   │   ├── 📁 blog/
│   │   └── 📁 contact/
│   ├── 📁 tin-tuc/                  # Blog pages
│   │   ├── 📁 [slug]/               # Dynamic blog post
│   │   └── 📁 category/
│   ├── 📁 mentors/                  # Mentor pages
│   │   └── 📁 [id]/                 # Dynamic mentor profile
│   ├── 📁 gzver/                    # gzver pages
│   │   └── 📁 [id]/                 # Dynamic gzver profile
│   ├── 📁 profile/                  # User profile dashboard
│   │   ├── 📁 courses/              # Course management
│   │   ├── 📁 settings/             # User settings
│   │   └── 📁 feedback/             # Feedback system
│   ├── 📄 globals.css               # Global styles
│   ├── 📄 layout.tsx                # Root layout
│   ├── 📄 page.tsx                  # Homepage
│   └── 📄 not-found.tsx             # 404 page
├── 📁 components/                   # React components
│   ├── 📁 ui/                       # shadcn/ui components
│   │   ├── 📄 button.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 progress.tsx
│   │   ├── 📄 chart.tsx
│   │   └── 📄 ...
│   ├── 📁 sections/                 # Page sections
│   │   ├── 📄 HeroVideo.tsx
│   │   ├── 📄 ProjectsSection.tsx
│   │   ├── 📄 MentorsSection.tsx
│   │   └── 📄 ...
│   ├── 📁 profile/                  # Profile components
│   │   ├── 📄 ProfileDashboard.tsx
│   │   ├── 📄 CourseProgress.tsx
│   │   ├── 📄 SettingsPanel.tsx
│   │   └── 📄 FeedbackForm.tsx
│   ├── 📄 Header.tsx                # Site header
│   ├── 📄 Footer.tsx                # Site footer
│   ├── 📄 FloatingButtons.tsx       # Floating action buttons
│   └── 📄 Chatbot.tsx               # AI chatbot
├── 📁 data/                         # Static data
│   ├── 📄 mentors.ts                # Mentors database
│   ├── 📄 blog-posts.ts             # Blog posts data
│   ├── 📄 projects.ts               # Projects data
│   └── 📄 courses.ts                # Courses data
├── 📁 lib/                          # Utility libraries
│   ├── 📄 utils.ts                  # Common utilities
│   ├── 📄 sanity.ts                 # Sanity client
│   ├── 📄 database.ts               # Database connection
│   ├── 📄 auth.ts                   # Authentication
│   └── 📄 analytics.ts              # Analytics tracking
├── 📁 hooks/                        # Custom React hooks
│   ├── 📄 use-theme.ts              # Theme management
│   ├── 📄 use-language.ts           # Language switching
│   ├── 📄 use-mobile.ts             # Mobile detection
│   └── 📄 use-user.ts               # User data management
├── 📁 backend-go/                   # Golang microservices
│   ├── 📁 cmd/                      # Application entrypoints
│   ├── 📁 internal/                 # Internal packages
│   │   ├── 📁 api/                  # API handlers
│   │   ├── 📁 auth/                 # Authentication
│   │   ├── 📁 database/             # Database layer
│   │   └── 📁 models/               # Data models
│   ├── 📁 pkg/                      # Public packages
│   ├── 📄 go.mod                    # Go modules
│   ├── 📄 go.sum                    # Dependencies checksum
│   └── 📄 main.go                   # Main application
├── 📁 backend-rust/                 # Rust analytics service
│   ├── 📁 src/                      # Source code
│   │   ├── 📁 handlers/             # Request handlers
│   │   ├── 📁 models/               # Data models
│   │   ├── 📁 services/             # Business logic
│   │   └── 📄 main.rs               # Main application
│   ├── 📄 Cargo.toml                # Rust dependencies
│   └── 📄 Cargo.lock                # Dependencies lock
├── 📁 sanity/                       # Sanity CMS
│   ├── 📁 schemas/                  # Content schemas
│   │   ├── 📄 post.ts               # Blog post schema
│   │   ├── 📄 mentor.ts             # Mentor schema
│   │   ├── 📄 course.ts             # Course schema
│   │   └── 📄 author.ts             # Author schema
│   ├── 📄 sanity.config.ts          # Sanity configuration
│   └── 📄 sanity.cli.ts             # CLI configuration
├── 📁 public/                       # Static assets
│   ├── 📁 images/                   # Images
│   ├── 📁 videos/                   # Videos
│   ├── 📁 icons/                    # Icons
│   └── 📄 favicon.ico               # Favicon
├── 📁 scripts/                      # Utility scripts
│   ├── 📄 setup.sh                  # Project setup
│   ├── 📄 deploy.sh                 # Deployment script
│   └── 📄 migrate.sh                # Database migration
├── 📁 docs/                         # Documentation
│   ├── 📄 API.md                    # API documentation
│   ├── 📄 DEPLOYMENT.md             # Deployment guide
│   └── 📄 CONTRIBUTING.md           # Contributing guide
├── 📄 package.json                  # Node.js dependencies
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 tailwind.config.ts            # Tailwind configuration
├── 📄 next.config.mjs               # Next.js configuration
├── 📄 docker-compose.yml            # Docker services
├── 📄 Dockerfile                    # Docker image
├── 📄 .env.example                  # Environment template
├── 📄 .gitignore                    # Git ignore rules
└── 📄 README.md                     # This file
\`\`\`

## 🔌 API Documentation

### 🔐 Authentication Endpoints
\`\`\`typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

// GET /api/auth/me
interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: string;
  profile: UserProfile;
}
\`\`\`

### 👤 Profile Endpoints
\`\`\`typescript
// GET /api/profile
interface ProfileResponse {
  user: User;
  stats: {
    coursesCompleted: number;
    coursesInProgress: number;
    totalLearningHours: number;
    certificatesEarned: number;
    skillsAcquired: number;
  };
  recentActivity: Activity[];
  achievements: Achievement[];
}

// PUT /api/profile
interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLinks;
  skills?: string[];
  interests?: string[];
}

// POST /api/profile/avatar
interface UploadAvatarRequest {
  file: File;
}
\`\`\`

### 📚 Course Endpoints
\`\`\`typescript
// GET /api/courses/enrolled
interface EnrolledCoursesResponse {
  courses: EnrolledCourse[];
  pagination: Pagination;
}

interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: string;
  certificate?: Certificate;
}

// GET /api/courses/[id]/progress
interface CourseProgressResponse {
  courseId: string;
  progress: number;
  completedLessons: Lesson[];
  currentLesson?: Lesson;
  timeSpent: number;
  quiz_scores: QuizScore[];
}

// POST /api/courses/[id]/complete-lesson
interface CompleteLessonRequest {
  lessonId: string;
  timeSpent: number;
  notes?: string;
}
\`\`\`

### 💬 Feedback Endpoints
\`\`\`typescript
// POST /api/feedback
interface FeedbackRequest {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: File[];
}

// GET /api/feedback/my-feedback
interface MyFeedbackResponse {
  feedback: Feedback[];
  pagination: Pagination;
}

interface Feedback {
  id: string;
  type: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  responses: FeedbackResponse[];
}
\`\`\`

## 🗄️ Database Schema

### PostgreSQL Tables

#### Users Table
\`\`\`sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(10),
    occupation VARCHAR(255),
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
\`\`\`

#### User Profiles Table
\`\`\`sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skills TEXT[],
    interests TEXT[],
    learning_goals TEXT[],
    experience_level VARCHAR(50),
    preferred_language VARCHAR(10) DEFAULT 'vi',
    timezone VARCHAR(50),
    social_links JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Courses Table
\`\`\`sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id),
    category VARCHAR(100),
    level VARCHAR(50),
    duration_hours INTEGER,
    price DECIMAL(10,2),
    thumbnail_url TEXT,
    trailer_url TEXT,
    is_published BOOLEAN DEFAULT false,
    enrollment_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Course Enrollments Table
\`\`\`sql
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress DECIMAL(5,2) DEFAULT 0,
    last_accessed TIMESTAMP,
    time_spent INTEGER DEFAULT 0, -- in minutes
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    UNIQUE(user_id, course_id)
);
\`\`\`

#### Lessons Table
\`\`\`sql
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER,
    is_preview BOOLEAN DEFAULT false,
    resources JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Lesson Progress Table
\`\`\`sql
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    time_spent INTEGER DEFAULT 0, -- in minutes
    notes TEXT,
    last_position INTEGER DEFAULT 0, -- video position in seconds
    UNIQUE(user_id, lesson_id)
);
\`\`\`

#### User Achievements Table
\`\`\`sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);
\`\`\`

#### Feedback Table
\`\`\`sql
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    assigned_to UUID REFERENCES users(id),
    attachments TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Feedback Responses Table
\`\`\`sql
CREATE TABLE feedback_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID REFERENCES feedback(id) ON DELETE CASCADE,
    responder_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Indexes for Performance
\`\`\`sql
-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Course enrollments indexes
CREATE INDEX idx_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_progress ON course_enrollments(progress);

-- Lesson progress indexes
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_completed ON lesson_progress(completed);

-- Feedback indexes
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_type ON feedback(type);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

-- Achievements indexes
CREATE INDEX idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_achievements_type ON user_achievements(achievement_type);
\`\`\`

## 📝 CMS Sanity Configuration

### 1. Cài đặt Sanity
\`\`\`bash
# Cài đặt Sanity CLI
npm install -g @sanity/cli

# Tạo project Sanity
sanity init

# Chọn cấu hình:
# - Create new project
# - Project name: gzv Center CMS
# - Dataset: production
# - Template: Blog (schema)
\`\`\`

### 2. Sanity Schema Configuration

#### Blog Post Schema
\`\`\`typescript
// sanity/schemas/post.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Bài viết',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề',
      type: 'string',
      validation: Rule => Rule.required().max(100)
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'author',
      title: 'Tác giả',
      type: 'reference',
      to: { type: 'author' },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'mainImage',
      title: 'Ảnh đại diện',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        }
      ]
    }),
    defineField({
      name: 'categories',
      title: 'Danh mục',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Ngày xuất bản',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'excerpt',
      title: 'Tóm tắt',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.max(200)
    }),
    defineField({
      name: 'body',
      title: 'Nội dung',
      type: 'blockContent',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'featured',
      title: 'Bài viết nổi bật',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'readingTime',
      title: 'Thời gian đọc (phút)',
      type: 'number',
      validation: Rule => Rule.min(1).max(60)
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection
      return { ...selection, subtitle: author && `by ${author}` }
    },
  },
})
\`\`\`

#### Mentor Schema
\`\`\`typescript
// sanity/schemas/mentor.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'mentor',
  title: 'Mentor',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Họ và tên',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Chức danh',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'company',
      title: 'Công ty',
      type: 'string',
    }),
    defineField({
      name: 'avatar',
      title: 'Ảnh đại diện',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'bio',
      title: 'Tiểu sử',
      type: 'blockContent',
    }),
    defineField({
      name: 'experience',
      title: 'Kinh nghiệm làm việc',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'company', type: 'string', title: 'Công ty' },
            { name: 'position', type: 'string', title: 'Vị trí' },
            { name: 'duration', type: 'string', title: 'Thời gian' },
            { name: 'description', type: 'text', title: 'Mô tả công việc' },
          ]
        }
      ]
    }),
    defineField({
      name: 'education',
      title: 'Học vấn',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'school', type: 'string', title: 'Trường' },
            { name: 'degree', type: 'string', title: 'Bằng cấp' },
            { name: 'field', type: 'string', title: 'Chuyên ngành' },
            { name: 'year', type: 'string', title: 'Năm tốt nghiệp' },
          ]
        }
      ]
    }),
    defineField({
      name: 'skills',
      title: 'Kỹ năng',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'achievements',
      title: 'Thành tựu',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Liên kết xã hội',
      type: 'object',
      fields: [
        { name: 'linkedin', type: 'url', title: 'LinkedIn' },
        { name: 'github', type: 'url', title: 'GitHub' },
        { name: 'website', type: 'url', title: 'Website' },
        { name: 'twitter', type: 'url', title: 'Twitter' },
      ]
    }),
    defineField({
      name: 'specialties',
      title: 'Chuyên môn',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'hourlyRate',
      title: 'Giá theo giờ (USD)',
      type: 'number',
    }),
    defineField({
      name: 'isActive',
      title: 'Đang hoạt động',
      type: 'boolean',
      initialValue: true
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'avatar',
    },
  },
})
\`\`\`

#### Course Schema
\`\`\`typescript
// sanity/schemas/course.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'course',
  title: 'Khóa học',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tiêu đề khóa học',
      type: 'string',
      validation: Rule => Rule.required().max(200)
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Mô tả',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().max(500)
    }),
    defineField({
      name: 'instructor',
      title: 'Giảng viên',
      type: 'reference',
      to: { type: 'mentor' },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'thumbnail',
      title: 'Ảnh thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'trailer',
      title: 'Video giới thiệu',
      type: 'url',
    }),
    defineField({
      name: 'category',
      title: 'Danh mục',
      type: 'reference',
      to: { type: 'category' },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'level',
      title: 'Cấp độ',
      type: 'string',
      options: {
        list: [
          { title: 'Cơ bản', value: 'beginner' },
          { title: 'Trung cấp', value: 'intermediate' },
          { title: 'Nâng cao', value: 'advanced' },
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'duration',
      title: 'Thời lượng (giờ)',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(200)
    }),
    defineField({
      name: 'price',
      title: 'Giá (VND)',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'curriculum',
      title: 'Chương trình học',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Tiêu đề bài học' },
            { name: 'duration', type: 'number', title: 'Thời lượng (phút)' },
            { name: 'isPreview', type: 'boolean', title: 'Xem trước miễn phí' },
            { name: 'videoUrl', type: 'url', title: 'Link video' },
            { name: 'resources', type: 'array', of: [{ type: 'url' }], title: 'Tài liệu' },
          ]
        }
      ]
    }),
    defineField({
      name: 'skills',
      title: 'Kỹ năng học được',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'requirements',
      title: 'Yêu cầu',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'isPublished',
      title: 'Đã xuất bản',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'isFeatured',
      title: 'Khóa học nổi bật',
      type: 'boolean',
      initialValue: false
    }),
  ],
  preview: {
    select: {
      title: 'title',
      instructor: 'instructor.name',
      media: 'thumbnail',
    },
    prepare(selection) {
      const { instructor } = selection
      return { ...selection, subtitle: instructor && `by ${instructor}` }
    },
  },
})
\`\`\`

### 3. Sanity Client Setup
\`\`\`typescript
// lib/sanity.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)

export const urlFor = (source: any) => builder.image(source)

// GROQ Queries
export const coursesQuery = `*[_type == "course" && isPublished == true] | order(_createdAt desc) {
  _id,
  title,
  slug,
  description,
  instructor->{name, avatar, title},
  thumbnail,
  category->{title, slug},
  level,
  duration,
  price,
  skills,
  requirements,
  isFeatured
}`

export const courseBySlugQuery = `*[_type == "course" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  instructor->{name, avatar, title, bio},
  thumbnail,
  trailer,
  category->{title, slug},
  level,
  duration,
  price,
  curriculum,
  skills,
  requirements
}`

export const featuredCoursesQuery = `*[_type == "course" && isFeatured == true && isPublished == true] | order(_createdAt desc) [0...6] {
  _id,
  title,
  slug,
  description,
  instructor->{name, avatar},
  thumbnail,
  level,
  duration,
  price
}`
\`\`\`

## 🐳 Docker Configuration

### Dockerfile
\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

ENV NEXT_PUBLIC_SANITY_PROJECT_ID=$NEXT_PUBLIC_SANITY_PROJECT_ID
ENV NEXT_PUBLIC_SANITY_DATASET=$NEXT_PUBLIC_SANITY_DATASET
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### Docker Compose
\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend Next.js Application
  frontend:
    build: 
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_SANITY_PROJECT_ID: ${NEXT_PUBLIC_SANITY_PROJECT_ID}
        NEXT_PUBLIC_SANITY_DATASET: ${NEXT_PUBLIC_SANITY_DATASET}
        DATABASE_URL: ${DATABASE_URL}
        NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
        NEXTAUTH_URL: ${NEXTAUTH_URL}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/gzv_center
      - REDIS_URL=redis://redis:6379
      - NEXT_PUBLIC_SANITY_PROJECT_ID=${NEXT_PUBLIC_SANITY_PROJECT_ID}
      - NEXT_PUBLIC_SANITY_DATASET=${NEXT_PUBLIC_SANITY_DATASET}
    depends_on:
      - db
      - redis
    networks:
      - gzv-network

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: gzv_center
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - gzv-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - gzv-network

  # Golang Backend API
  backend-go:
    build: 
      context: ./backend-go
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/gzv_center
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    depends_on:
      - db
      - redis
    networks:
      - gzv-network

  # Rust Analytics Service
  backend-rust:
    build: 
      context: ./backend-rust
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/gzv_center
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - gzv-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend-go
      - backend-rust
    networks:
      - gzv-network

volumes:
  postgres_data:
  redis_data:

networks:
  gzv-network:
    driver: bridge
\`\`\`

## 🚀 Deployment

### Environment Variables
\`\`\`bash
# .env.example
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/gzv_center"
REDIS_URL="redis://localhost:6379"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-api-token"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Cloud Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Analytics
GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
FACEBOOK_PIXEL_ID="your-pixel-id"

# Social Auth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"

# API Keys
JWT_SECRET="your-jwt-secret"
ENCRYPTION_KEY="your-encryption-key"

# External APIs
OPENAI_API_KEY="your-openai-api-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
\`\`\`

## 🧪 Testing

### Unit Tests
\`\`\`bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- components/Header.test.tsx
\`\`\`

### E2E Tests
\`\`\`bash
# Run Playwright tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed

# Run specific test
npm run test:e2e -- tests/auth.spec.ts
\`\`\`

## 📊 Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: New Relic / DataDog
- **Uptime**: Pingdom / UptimeRobot
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)

### Business Analytics
- **Web Analytics**: Google Analytics 4
- **User Behavior**: Hotjar / FullStory
- **A/B Testing**: Optimizely / VWO
- **Conversion Tracking**: Facebook Pixel

## 🔒 Security

### Security Measures
- **HTTPS**: SSL/TLS encryption
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Zod schema validation
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content Security Policy (CSP)
- **CSRF Protection**: SameSite cookies
- **Rate Limiting**: Express rate limit
- **Data Encryption**: bcrypt for passwords

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Code formatting with custom config
- **Husky**: Pre-commit hooks for linting and testing
- **Conventional Commits**: Standardized commit messages
- **Semantic Versioning**: Version management

## 📞 Support & Contact

### Getting Help
- **Documentation**: Check this README and docs folder
- **Issues**: Create a GitHub issue for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Email**: tech@gzv.one

### gzv Center Contact
- **Website**: [gzv.one](https://gzv.one)
- **Email**: info@gzv.one
- **Phone**: +84 (0) 123 456 789
- **Address**: 123 Nguyen Hue, District 1, Ho Chi Minh City, Vietnam

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <img src="/placeholder.svg?height=60&width=200&text=gzv+CENTER" alt="gzv Center" />
  
  <p><strong>🚀 Life Long Learning 🚀</strong></p>
  <p>Made with ❤️ by gzv Center Team</p>
  
  <p>
    <a href="https://gzv.one">Website</a> •
    <a href="mailto:info@gzv.one">Email</a> •
    <a href="https://facebook.com/gzvcenter">Facebook</a> •
    <a href="https://linkedin.com/company/gzv-center">LinkedIn</a>
  </p>
</div>
