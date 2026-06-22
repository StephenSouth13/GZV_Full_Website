-- Media Storage Management Tables for Supabase Storage

-- Media files metadata table
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  folder_path TEXT DEFAULT 'uploads',
  storage_path TEXT NOT NULL UNIQUE,
  storage_bucket TEXT DEFAULT 'content',
  file_type TEXT CHECK (file_type IN ('image', 'video', 'audio', 'document', 'other')),
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  metadata JSONB,
  is_public BOOLEAN DEFAULT TRUE,
  tags TEXT[],
  description TEXT,
  alt_text TEXT,
  uploaded_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_media_files_file_type (file_type),
  INDEX idx_media_files_folder_path (folder_path),
  INDEX idx_media_files_uploaded_by_id (uploaded_by_id),
  INDEX idx_media_files_created_at (created_at),
  INDEX idx_media_files_deleted_at (deleted_at)
);

-- Media usage tracking
CREATE TABLE IF NOT EXISTS public.media_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id UUID NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  used_in_entity_type TEXT NOT NULL,
  used_in_entity_id UUID NOT NULL,
  field_name TEXT,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_usage_media_file_id (media_file_id),
  INDEX idx_media_usage_entity (used_in_entity_type, used_in_entity_id)
);

-- Update media_files timestamp trigger
CREATE TRIGGER update_media_files_updated_at BEFORE UPDATE ON public.media_files
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_media_usage_created_at ON public.media_usage(used_at);
