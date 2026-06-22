-- 1. Tạo bảng mscers với đầy đủ các trường dữ liệu thực tế
CREATE TABLE IF NOT EXISTS public.mscers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name text NOT NULL, -- Họ và tên
    slug text UNIQUE NOT NULL, -- Đường dẫn URL chuẩn SEO (ví dụ: pham-hoang-minh-khanh)
    company text DEFAULT 'MSC', -- Công ty hiện tại
    position text, -- Chức danh chuyên môn
    avatar_url text, -- Link ảnh chân dung
    cv_url text, -- Link file PDF hồ sơ năng lực (nâng cao)
    
    -- Các khối nội dung tạp chí (Magazine Highlights)
    achievement_summary text, -- Thành tựu tóm tắt
    testimonial text, -- Câu nói tâm đắc hoặc cảm nhận
    graduation_year text, -- Năm tốt nghiệp/Khóa học
    promotion_path text, -- Lộ trình thăng tiến (ví dụ: Trưởng phòng -> Giám đốc)
    social_impact text, -- Tác động xã hội và cộng đồng
    
    -- Danh sách mảng kỹ năng và thành tích
    course_taken text, -- Khóa học tiêu biểu đã tham gia
    skills text[] DEFAULT '{}', -- Mảng các kỹ năng chuyên môn
    achievements_list text[] DEFAULT '{}', -- Mảng danh sách các cột mốc thành tựu
    mentoring_content text, -- Nội dung chia sẻ hoặc định hướng mentoring
    
    -- Thông tin nền tảng (Lưu dạng JSONB để dễ mở rộng)
    background jsonb DEFAULT '{
        "education": "",
        "previous_role": "",
        "experience": ""
    }'::jsonb, --
    
    -- Liên kết mạng xã hội
    social_links jsonb DEFAULT '{
        "facebook": "",
        "linkedin": "",
        "github": "",
        "website": ""
    }'::jsonb, --
    
    -- Quản lý hệ thống
    is_active boolean DEFAULT true, -- Trạng thái hiển thị trên web
    "order" int DEFAULT 0, -- Thứ tự sắp xếp thủ công
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Thiết lập Row Level Security (RLS) để bảo mật dữ liệu
ALTER TABLE public.mscers ENABLE ROW LEVEL SECURITY;

-- Cho phép mọi người xem thông tin (Public Read)
CREATE POLICY "Allow public read access" 
ON public.mscers FOR SELECT 
USING (true);

-- Chỉ cho phép người dùng đã đăng nhập (Admin) thao tác CRUD
CREATE POLICY "Allow individual delete for admin" 
ON public.mscers FOR ALL 
USING (auth.role() = 'authenticated');

-- 3. Tạo function tự động cập nhật thời gian 'updated_at'
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mscer_modtime
    BEFORE UPDATE ON public.mscers
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();