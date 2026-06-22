-- Articles and Blog Posts Management Tables

-- Articles/Blog Posts table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  featured_image_url TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  publish_date TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_articles_slug (slug),
  INDEX idx_articles_author_id (author_id),
  INDEX idx_articles_category (category),
  INDEX idx_articles_status (status),
  INDEX idx_articles_published_at (published_at)
);

-- Article comments table
CREATE TABLE IF NOT EXISTS public.article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_comments_article_id (article_id),
  INDEX idx_article_comments_author_id (author_id),
  INDEX idx_article_comments_approved (approved)
);

-- Article views/analytics table
CREATE TABLE IF NOT EXISTS public.article_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  view_duration_seconds INTEGER,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_article_analytics_article_id (article_id),
  INDEX idx_article_analytics_user_id (user_id),
  INDEX idx_article_analytics_created_at (created_at)
);

-- Article categories table
CREATE TABLE IF NOT EXISTS public.article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_articles_created_at ON public.articles(created_at);
CREATE INDEX idx_article_comments_created_at ON public.article_comments(created_at);

-- Create trigger for articles updated_at
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_comments_updated_at BEFORE UPDATE ON public.article_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_categories_updated_at BEFORE UPDATE ON public.article_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.article_categories (name, slug, description, color) VALUES
  ('Tutorial', 'tutorial', 'Step-by-step guides and tutorials', '#3B82F6'),
  ('Technical', 'technical', 'In-depth technical articles', '#8B5CF6'),
  ('Industry News', 'industry', 'Industry news and updates', '#EC4899'),
  ('AI & Machine Learning', 'ai', 'Articles about AI and ML', '#F59E0B'),
  ('Guide', 'guide', 'How-to guides and tips', '#10B981'),
  ('News', 'news', 'General news and announcements', '#6366F1')
ON CONFLICT (slug) DO NOTHING;
