-- Courses and Learning Management Tables

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'published', 'archived', 'review')) DEFAULT 'draft',
  price DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  duration_weeks INTEGER,
  duration_hours DECIMAL(10, 2),
  students_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  learning_outcomes TEXT[],
  requirements TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_courses_slug (slug),
  INDEX idx_courses_instructor_id (instructor_id),
  INDEX idx_courses_category (category),
  INDEX idx_courses_status (status),
  INDEX idx_courses_difficulty (difficulty)
);

-- Course modules/sections table
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course_modules_course_id (course_id)
);

-- Course lessons/videos table
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_duration_seconds INTEGER,
  content TEXT,
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  resources TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course_lessons_module_id (module_id),
  INDEX idx_course_lessons_course_id (course_id)
);

-- Course enrollments table
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  INDEX idx_course_enrollments_course_id (course_id),
  INDEX idx_course_enrollments_user_id (user_id),
  INDEX idx_course_enrollments_status (status),
  UNIQUE(course_id, user_id)
);

-- User lesson progress table
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  watched_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_lesson_progress_user_id (user_id),
  INDEX idx_user_lesson_progress_lesson_id (lesson_id),
  INDEX idx_user_lesson_progress_course_id (course_id),
  UNIQUE(user_id, lesson_id)
);

-- Course reviews table
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course_reviews_course_id (course_id),
  INDEX idx_course_reviews_user_id (user_id),
  INDEX idx_course_reviews_rating (rating)
);

-- Create indexes
CREATE INDEX idx_courses_created_at ON public.courses(created_at);
CREATE INDEX idx_course_modules_created_at ON public.course_modules(created_at);
CREATE INDEX idx_course_lessons_created_at ON public.course_lessons(created_at);
CREATE INDEX idx_course_enrollments_enrolled_at ON public.course_enrollments(enrolled_at);

-- Create triggers
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON public.course_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON public.user_lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_reviews_updated_at BEFORE UPDATE ON public.course_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
