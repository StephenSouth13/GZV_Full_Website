-- Enhanced Courses with Rich Media Support

-- Update courses table to add featured content
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_image_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS preview_video_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description_rich TEXT,
ADD COLUMN IF NOT EXISTS learning_outcomes_detailed JSONB,
ADD COLUMN IF NOT EXISTS prerequisites_detailed JSONB;

-- Course videos/lessons with media
CREATE TABLE IF NOT EXISTS public.course_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_media_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
  video_duration_seconds INTEGER,
  transcript TEXT,
  order_index INTEGER NOT NULL,
  is_preview BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course_videos_course_id (course_id),
  INDEX idx_course_videos_module_id (module_id)
);

-- Course materials/resources
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.course_videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT CHECK (resource_type IN ('pdf', 'document', 'spreadsheet', 'presentation', 'code', 'other')),
  file_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
  download_count INTEGER DEFAULT 0,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course_materials_course_id (course_id),
  INDEX idx_course_materials_video_id (video_id)
);

-- Course gallery/testimonials
CREATE TABLE IF NOT EXISTS public.course_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  caption TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_course_gallery_course_id (course_id)
);

-- Create triggers
CREATE TRIGGER update_course_videos_updated_at BEFORE UPDATE ON public.course_videos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_materials_updated_at BEFORE UPDATE ON public.course_materials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add featured courses view
CREATE OR REPLACE VIEW public.featured_courses AS
SELECT 
  c.*,
  (SELECT array_agg(video_media_id) FROM public.course_videos WHERE course_id = c.id AND video_media_id IS NOT NULL LIMIT 3) as sample_videos,
  (SELECT COUNT(*) FROM public.course_enrollments WHERE course_id = c.id AND status = 'completed') as completed_count
FROM public.courses c
WHERE c.featured = TRUE AND c.status = 'published'
ORDER BY c.created_at DESC
LIMIT 10;
