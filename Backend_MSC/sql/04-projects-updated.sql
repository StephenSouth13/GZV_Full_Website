-- Enhanced Projects with Portfolio Showcase

-- Update projects table for portfolio features
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_image_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description_rich TEXT,
ADD COLUMN IF NOT EXISTS case_study TEXT,
ADD COLUMN IF NOT EXISTS results_metrics JSONB,
ADD COLUMN IF NOT EXISTS client_testimonial TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));

-- Project portfolio gallery
CREATE TABLE IF NOT EXISTS public.project_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  caption TEXT,
  display_order INTEGER,
  is_cover BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_gallery_project_id (project_id),
  INDEX idx_project_gallery_is_cover (is_cover)
);

-- Project deliverables
CREATE TABLE IF NOT EXISTS public.project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
  delivery_date DATE,
  status TEXT CHECK (status IN ('pending', 'delivered', 'approved', 'revision_requested')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_deliverables_project_id (project_id),
  INDEX idx_project_deliverables_status (status)
);

-- Project process/behind-the-scenes
CREATE TABLE IF NOT EXISTS public.project_process (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
  video_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
  process_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_process_project_id (project_id)
);

-- Create triggers
CREATE TRIGGER update_project_deliverables_updated_at BEFORE UPDATE ON public.project_deliverables
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add featured projects view
CREATE OR REPLACE VIEW public.featured_projects AS
SELECT 
  p.*,
  (SELECT COUNT(*) FROM public.project_gallery WHERE project_id = p.id) as gallery_count,
  (SELECT image_id FROM public.project_gallery WHERE project_id = p.id AND is_cover = TRUE LIMIT 1) as cover_image_id
FROM public.projects p
WHERE p.featured = TRUE AND p.status = 'completed'
ORDER BY p.completed_date DESC
LIMIT 10;
