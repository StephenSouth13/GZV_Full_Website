-- Tạo bảng gzvers
CREATE TABLE IF NOT EXISTS public.gzvers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    position TEXT,          -- Chức vụ (VD: Trưởng phòng CNTT)
    company TEXT,           -- Công ty (VD: gzv Center)
    avatar_url TEXT,        -- Link ảnh lưu trên Storage
    achievement TEXT,       -- Thành tích nổi bật (VD: Tốt nghiệp khóa 2022)
    order INTEGER DEFAULT 0, -- Thứ tự sắp xếp (Số nhỏ hiện trước)
    is_active BOOLEAN DEFAULT true, -- Ẩn/Hiện trên Web
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật quyền truy cập công khai (để FE có thể fetch data)
ALTER TABLE gzvers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on gzvers" ON gzvers FOR SELECT USING (true);
CREATE POLICY "Allow admin all on gzvers" ON gzvers FOR ALL USING (true) WITH CHECK (true);