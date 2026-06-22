-- 1. Tạo bảng mentors
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    title TEXT, -- Ví dụ: Chuyên gia Marketing, Senior Dev
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[], -- Mảng các kỹ năng
    social_links JSONB DEFAULT '{}'::jsonb, -- Lưu link FB, LinkedIn...
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Thêm Trigger tự động cập nhật updated_at
CREATE TRIGGER update_mentors_modtime 
BEFORE UPDATE ON mentors 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 3. Bật RLS và cấp quyền
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for admin" ON mentors FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.mentors 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS company TEXT, -- Nơi công tác (VD: VTC Academy)
ADD COLUMN IF NOT EXISTS position TEXT, -- Vị trí (VD: Senior Frontend Developer)
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[], -- Mảng các kỹ năng (React, UI/UX...)
ADD COLUMN IF NOT EXISTS detailed_bio TEXT; -- Nội dung Markdown chi tiết


-- 1. Cho phép mọi người xem ảnh (SELECT)
CREATE POLICY "Cho phép truy cập công khai folder mentors"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media' AND (storage.foldername(name))[1] = 'mentors' );

-- 2. Cho phép mọi người tải ảnh lên (INSERT)
CREATE POLICY "Cho phép tải ảnh lên folder mentors"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'media' AND (storage.foldername(name))[1] = 'mentors' );

-- 3. Cho phép cập nhật/thay thế ảnh (UPDATE)
CREATE POLICY "Cho phép cập nhật ảnh trong folder mentors"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'media' AND (storage.foldername(name))[1] = 'mentors' );

-- 4. Cho phép xóa ảnh (DELETE)
CREATE POLICY "Cho phép xóa ảnh trong folder mentors"
ON storage.objects FOR DELETE
USING ( bucket_id = 'media' AND (storage.foldername(name))[1] = 'mentors' );