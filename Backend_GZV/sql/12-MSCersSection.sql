-- Tạo bảng mscers
CREATE TABLE IF NOT EXISTS public.mscers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    position TEXT,          -- Chức vụ (VD: Trưởng phòng CNTT)
    company TEXT,           -- Công ty (VD: MSC Center)
    avatar_url TEXT,        -- Link ảnh lưu trên Storage
    achievement TEXT,       -- Thành tích nổi bật (VD: Tốt nghiệp khóa 2022)
    order INTEGER DEFAULT 0, -- Thứ tự sắp xếp (Số nhỏ hiện trước)
    is_active BOOLEAN DEFAULT true, -- Ẩn/Hiện trên Web
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật quyền truy cập công khai (để FE có thể fetch data)
ALTER TABLE mscers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on mscers" ON mscers FOR SELECT USING (true);
CREATE POLICY "Allow admin all on mscers" ON mscers FOR ALL USING (true) WITH CHECK (true);