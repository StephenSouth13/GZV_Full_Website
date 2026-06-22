-- Nâng cấp bảng profiles để chứa các trường chuyên sâu của MSC
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS personal_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS organization TEXT[],
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS work_history TEXT[],
ADD COLUMN IF NOT EXISTS subjects TEXT[],
ADD COLUMN IF NOT EXISTS practical_works TEXT[],
ADD COLUMN IF NOT EXISTS research_projects TEXT[],
ADD COLUMN IF NOT EXISTS awards TEXT[],
ADD COLUMN IF NOT EXISTS achievements TEXT[],
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS social_impact TEXT,
ADD COLUMN IF NOT EXISTS mentoring_info TEXT;

-- Tạo index cho slug để tìm kiếm trang chi tiết nhanh hơn
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);