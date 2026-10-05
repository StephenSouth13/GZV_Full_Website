//D:\gzv\Backend_gzv\lib\supabase.ts
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
// --- Interface cho GZVers (Bổ sung vào file này) ---
export interface Gzver {
  id: string
  full_name: string
  slug: string
  company: string
  position: string
  avatar_url: string
  cv_url?: string
  achievement_summary: string
  testimonial: string
  graduation_year: string
  promotion_path: string
  social_impact: string
  course_taken: string
  skills: string[]
  achievements_list: string[]
  mentoring_content: string
  background: {
    education: string
    previous_role: string
    experience: string
  }
  is_active: boolean
  is_director: boolean
  order: number
  created_at?: string
  updated_at?: string
}
export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt?: string
  image?: string
  thumbnail_url?: string
  display_image?: string
  author?: string
  author_id?: string
  author_ids?: string[]
  authors_details?: any[]
  author_name?: string
  author_avatar?: string
  publish_date?: string
  published_at?: string
  category?: string
  content?: string
  status?: string
  read_time?: string
  views?: number
  likes?: number
  image_position_x?: number
  image_position_y?: number
  image_scale?: number
  author_bio?: string
  tags?: string[]
  comments?: number
  shares?: number
  featured?: boolean
  sort_order?: number
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
  author?: string
  author_id?: string | null
  author_ids?: string[]
  author_avatar?: string
  author_bio?: string
  category?: string
  image?: string
  thumbnail_url?: string
  image_position_x?: number
  image_position_y?: number
  image_scale?: number
  tags?: string[]
  featured?: boolean
  sort_order?: number
  status?: string
  published_at?: string
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
  detailed_content?: string
  highlights?: string[]
  content: any                    // Dữ liệu JSONB từ Tiptap
  modules?: any
  thumbnail_url?: string
  video_banner_url?: string
  video_url?: string
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
  featured?: boolean
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
