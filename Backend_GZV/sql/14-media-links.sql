-- Table for KHO LIÊN KẾT (Media Links Library)
CREATE TABLE IF NOT EXISTS public.media_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'website',
    note TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.media_links ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to media_links"
    ON public.media_links FOR SELECT
    USING (true);

-- Allow public write access for admin management
CREATE POLICY "Allow public write access to media_links"
    ON public.media_links FOR ALL
    USING (true)
    WITH CHECK (true);
