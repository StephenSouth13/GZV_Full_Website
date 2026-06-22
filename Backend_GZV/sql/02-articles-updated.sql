-- Enhanced Articles with Rich Content Support

-- Update articles table for rich media
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_image_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS featured_video_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS estimated_reading_time TEXT,
ADD COLUMN IF NOT EXISTS content_blocks JSONB,
ADD COLUMN IF NOT EXISTS related_articles_ids UUID[];

-- Article author profiles
CREATE TABLE IF NOT EXISTS public.article_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_id UUID REFERENCES public.media_files(id) ON DELETE SET NULL,
  social_links JSONB,
  expertise_areas TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id)
);

-- Article media gallery
CREATE TABLE IF NOT EXISTS public.article_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  caption TEXT,
  alt_text TEXT,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_gallery_article_id (article_id)
);

-- Article sections with rich content blocks
CREATE TABLE IF NOT EXISTS public.article_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  section_title TEXT,
  section_content TEXT,
  content_type TEXT CHECK (content_type IN ('text', 'heading', 'quote', 'code', 'list', 'table', 'callout')),
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_sections_article_id (article_id)
);

-- Article media embeds
CREATE TABLE IF NOT EXISTS public.article_media_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  embed_type TEXT CHECK (embed_type IN ('inline_image', 'inline_video', 'gallery', 'video_player')),
  position INTEGER,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_media_embeds_article_id (article_id)
);

-- Create triggers
CREATE TRIGGER update_article_authors_updated_at BEFORE UPDATE ON public.article_authors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_sections_updated_at BEFORE UPDATE ON public.article_sections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add featured articles view
CREATE OR REPLACE VIEW public.featured_articles AS
SELECT 
  a.*,
  p.full_name as author_name,
  (SELECT array_agg(image_id) FROM public.article_gallery WHERE article_id = a.id LIMIT 5) as gallery_images,
  (SELECT COUNT(*) FROM public.article_comments WHERE article_id = a.id AND approved = TRUE) as approved_comments_count
FROM public.articles a
LEFT JOIN public.profiles p ON a.author_id = p.id
WHERE a.featured = TRUE AND a.status = 'published'
ORDER BY a.published_at DESC
LIMIT 10;
