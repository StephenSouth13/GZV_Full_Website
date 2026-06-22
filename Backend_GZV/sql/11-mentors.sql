-- Tạo bảng mentors mới
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT, -- Học vị/Học hàm (Tiến sĩ, Thạc sĩ...)
    avatar_url TEXT,
    description TEXT, -- Triết lý giảng huấn/Giới thiệu Magazine
    
    -- Các mảng dữ liệu chuyên sâu (Dùng Array text[])
    specialties TEXT[] DEFAULT '{}',          -- Lĩnh vực giảng dạy
    teaching_subjects TEXT[] DEFAULT '{}',    -- Bộ môn giảng dạy & nghiên cứu
    practical_projects TEXT[] DEFAULT '{}',   -- Công trình áp dụng thực tiễn
    research_projects TEXT[] DEFAULT '{}',    -- Đề tài & dự án nghiên cứu
    awards TEXT[] DEFAULT '{}',               -- Giải thưởng
    tech_business_achievements TEXT[] DEFAULT '{}', -- Thành tựu KHCN & KD
    
    -- Dữ liệu cấu trúc phức tạp (Dùng JSONB)
    organizations JSONB DEFAULT '[]'::jsonb,  -- Tổ chức làm việc
    background JSONB DEFAULT '{"education": "", "experience": ""}'::jsonb, -- Học vấn & Kinh nghiệm
    
    -- Liên kết xã hội & Liên hệ
    linkedin_url TEXT,
    facebook_url TEXT,
    portfolio_url TEXT,
    email TEXT,
    phone TEXT,
    
    -- Quản lý hiển thị
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm trigger cập nhật thời gian
CREATE TRIGGER update_mentors_new_modtime 
BEFORE UPDATE ON mentors 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Bật RLS
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for admin on mentors" ON mentors FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS visible_sections JSONB DEFAULT '{
  "education": true, 
  "experience": true, 
  "teaching": true, 
  "specialties": true, 
  "practical": true, 
  "research": true, 
  "awards": true, 
  "achievements": true
}'::jsonb;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS email TEXT;

