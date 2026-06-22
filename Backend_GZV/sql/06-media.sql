-- Media and File Management Tables

-- Media files table
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  cloudinary_id TEXT,
  cloudinary_public_id TEXT,
  file_type TEXT CHECK (file_type IN ('image', 'video', 'audio', 'document', 'other')) NOT NULL,
  folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
  uploaded_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  metadata JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  description TEXT,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_media_files_file_type (file_type),
  INDEX idx_media_files_folder_id (folder_id),
  INDEX idx_media_files_uploaded_by_id (uploaded_by_id),
  INDEX idx_media_files_created_at (created_at),
  INDEX idx_media_files_cloudinary_id (cloudinary_id)
);

-- Media folders table
CREATE TABLE IF NOT EXISTS public.media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  description TEXT,
  created_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_folders_parent_folder_id (parent_folder_id),
  INDEX idx_media_folders_created_by_id (created_by_id)
);

-- Media usage/tracking table
CREATE TABLE IF NOT EXISTS public.media_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  used_in_entity_type TEXT NOT NULL,
  used_in_entity_id UUID NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_usage_media_file_id (media_file_id),
  INDEX idx_media_usage_used_in_entity_type (used_in_entity_type)
);

-- Image optimization/variants table
CREATE TABLE IF NOT EXISTS public.media_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  variant_type TEXT CHECK (variant_type IN ('thumbnail', 'preview', 'optimized', 'webp', 'custom')) NOT NULL,
  width INTEGER,
  height INTEGER,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  cloudinary_transformation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_variants_original_media_file_id (original_media_file_id),
  INDEX idx_media_variants_variant_type (variant_type)
);

-- Media trash table (for soft deletes)
CREATE TABLE IF NOT EXISTS public.media_trash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  deleted_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  original_url TEXT NOT NULL,
  trash_retention_days INTEGER DEFAULT 30,
  deleted_permanently_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_media_trash_media_file_id (media_file_id),
  INDEX idx_media_trash_deleted_at (deleted_at)
);

-- Media settings/quotas table
CREATE TABLE IF NOT EXISTS public.media_storage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  total_quota_bytes BIGINT NOT NULL,
  used_bytes BIGINT DEFAULT 0,
  plan_type TEXT CHECK (plan_type IN ('free', 'basic', 'professional', 'enterprise')) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_storage_quotas_organization_id (organization_id)
);

-- Create indexes
CREATE INDEX idx_media_files_updated_at ON public.media_files(updated_at);
CREATE INDEX idx_media_files_deleted_at ON public.media_files(deleted_at);
CREATE INDEX idx_media_folders_updated_at ON public.media_folders(updated_at);
CREATE INDEX idx_media_variants_created_at ON public.media_variants(created_at);

-- Create triggers
CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON public.media_files
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_folders_updated_at BEFORE UPDATE ON public.media_folders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_storage_quotas_updated_at BEFORE UPDATE ON public.media_storage_quotas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create default folders
INSERT INTO public.media_folders (name, slug, created_by_id) VALUES
  ('Uploads', 'uploads', 'admin-system-user'),
  ('Blog', 'blog', 'admin-system-user'),
  ('Courses', 'courses', 'admin-system-user'),
  ('Projects', 'projects', 'admin-system-user'),
  ('Archive', 'archive', 'admin-system-user')
ON CONFLICT DO NOTHING;
