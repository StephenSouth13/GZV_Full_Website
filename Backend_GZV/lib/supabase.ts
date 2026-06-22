//D:\MSC\Backend_MSC\lib\supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
// --- Interface cho Ban Giảng Huấn ---
export interface Mentor {
  id: string
  full_name: string
  slug: string
  title: string
  description: string
  avatar_url: string
  linkedin_url?: string
  facebook_url?: string
  portfolio_url?: string
  specialties: string[]
  background: {
    education: string
    experience: string
  }
  is_active: boolean
  order: number
  created_at?: string
  updated_at?: string
}

// --- Interface cho Tác giả (Authors) ---
export interface Author {
  id: string
  full_name: string
  slug: string
  title: string
  avatar_url: string
  bio?: string
  linkedin_url?: string
  website_url?: string
  created_at?: string
}
export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt?: string
  image?: string
  author?: string
  author_avatar?: string
  publish_date?: string
  category?: string
  content?: string
  read_time?: string
  views?: number
  likes?: number
  author_bio?: string
  tags?: string[]
  comments?: number
  shares?: number
  featured?: boolean
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  created_at?: string
  updated_at?: string
}

export interface BlogPostCreate {
  title: string
  slug: string
  content: string
  excerpt?: string
  author: string
  author_avatar?: string
  author_bio?: string
  category?: string
  image?: string
  tags?: string[]
  featured?: boolean
  publish_date?: string
  read_time?: string
  views?: number
  likes?: number
  shares?: number
  comments?: number
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}
// --- Interface cho Chương trình Đào tạo (Programs) ---
export interface Program {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  content: any                    // Dữ liệu JSONB từ Tiptap
  thumbnail_url?: string
  video_banner_url?: string
  gallery?: any
  level?: string                  // 'Cơ bản' | 'Trung cấp' | 'Nâng cao' | 'Chuyên gia'
  category?: string
  price_original?: number
  price_sale?: number
  total_lessons?: number
  estimated_duration?: string
  theme_color?: string
  status: 'draft' | 'published'
  is_featured?: boolean
  created_by?: string
  created_at: string
  updated_at: string

  // Aliases để tương thích code admin cũ (đọc-only, không lưu DB):
  image?: string
  duration?: string
  students?: string
  price?: string
}

export interface ProgramSchedule {
  id: string
  program_id: string
  start_date: string
  status: 'opening' | 'full' | 'closed'
}