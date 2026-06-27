  'use client'

  import { createBrowserClient } from '@supabase/ssr'

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ CẢNH BÁO: Thiếu biến môi trường Supabase!");
  }

  /**
   * Khởi tạo Supabase Client cho Browser
   */
  export function createClient() {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  // Chỉ export 1 biến duy nhất này để dùng chung toàn bộ dự án
  export const supabase = createClient()
  /**
   * // // Nguồn: HÀM HELPER QUAN TRỌNG NHẤT
   * Chuyển đổi đường dẫn file trong Storage thành URL công khai.
   * Giúp hiển thị ảnh từ bucket 'media' ổn định, không bị lỗi gạch chéo hay thiếu domain.
   */
  const getPublicUrl = (path: string | null | undefined): string => {
    // 1. Nếu không có path, trả về ảnh placeholder
    if (!path) return '/placeholder-avatar.jpg';

    // 2. Nếu đã là link tuyệt đối (http/https), giữ nguyên
    const trimmed = String(path).trim();
    if (!trimmed) return '/placeholder-avatar.jpg';
    if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('/')) return trimmed;

    // 3. Nếu là đường dẫn nội bộ nhưng thiếu dấu gạch chéo, thêm vào
    // Đây là cái fix lỗi cho "authors/..." -> "/authors/..."
    const normalizedPath = trimmed.replace(/^media\//, '').replace(/^\/+/, '');

    // 4. Nếu dùng Supabase Storage, lấy public URL
    const { data } = supabase.storage.from('media').getPublicUrl(normalizedPath);
    return data.publicUrl;
  };

  const tiptapNodeToText = (node: any): string => {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(tiptapNodeToText).filter(Boolean).join('\n\n');
    if (node.type === 'text') return node.text || '';

    const children = Array.isArray(node.content) ? node.content.map(tiptapNodeToText).filter(Boolean) : [];
    if (node.type === 'bulletList' || node.type === 'orderedList') return children.join('\n');
    if (node.type === 'listItem') return children.length ? `- ${children.join(' ')}` : '';
    if (node.type === 'heading') return children.join(' ');
    if (node.type === 'paragraph') return children.join('');
    if (node.type === 'hardBreak') return '\n';
    return children.join('\n\n');
  };

  const getProgramDetailedContent = (program: any): string => {
    if (typeof program.detailed_content === 'string') return program.detailed_content;
    if (typeof program.content === 'string') return program.content;
    if (program.content && typeof program.content === 'object') return tiptapNodeToText(program.content);
    return '';
  };

  const getProgramHighlights = (program: any): string[] => {
    if (Array.isArray(program.highlights)) return program.highlights.filter(Boolean).map(String);
    if (typeof program.highlights === 'string') {
      try {
        const parsed = JSON.parse(program.highlights);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      } catch {
        return program.highlights
          .split('\n')
          .map((highlight: string) => highlight.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  // ==========================================
  // --- ĐỊNH NGHĨA TYPES (Data Models) ---
  // ==========================================

  export interface gzver {
    id: string;
    full_name: string;
    slug: string;
    company: string;
    position: string;
    avatar_url: string;
    cv_url?: string;
    achievement_summary: string;
    testimonial: string;
    graduation_year: string;
    promotion_path: string;
    social_impact: string;
    course_taken: string;
    skills: string[];
    achievements_list: string[];
    mentoring_content: string;
    background: {
      education: string;
      previous_role: string; // Đồng bộ snake_case để khớp DB
      experience: string;
    };
    is_active: boolean;
    is_director: boolean;
    order?: number;
  }

  export interface Mentor {
    id: string;
    full_name: string;
    slug: string;
    title: string;
    description: string;
    email: string;
    phone?: string;
    avatar_url: string;
    organizations?: string;
    company?: string;
    specialties: string[];
    practical_projects: string[];
    research_projects: string[];
    awards: string[];
    tech_business_achievements: string[];
    background: {
      education: string;
      experience: string;
    };
    is_active: boolean;
    order?: number;
  }

  export interface Program {
    id: string;
    title: string;
    slug: string;
    description?: string;
    short_description?: string;
    content?: any;                  // JSONB (Tiptap) – nội dung chi tiết
    detailed_content?: string;       // Markdown/HTML string used by the public detail page
    highlights?: string[];
    // Fields đã map từ DB cho UI cũ:
    image?: string;                 // map từ thumbnail_url
    duration?: string;              // map từ estimated_duration
    students?: string;              // map từ total_lessons (số bài học)
    price?: string;                 // map từ price_sale ?? price_original
    // Raw columns (đầy đủ):
    thumbnail_url?: string;
    video_banner_url?: string;
    gallery?: any;
    level?: string;
    category?: string;
    price_original?: number;
    price_sale?: number;
    total_lessons?: number;
    estimated_duration?: string;
    theme_color?: string;
    status?: 'draft' | 'published';
    is_featured?: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface Project {
    id: string;
    title: string;
    description: string;
    detailproject?: string; 
    image?: string;
    video_url?: string;
    hashtags?: string;
    order_index?: number;
    seo_title?: string;
    technologies?: string[];
    featured?: boolean;
    author_ids?: string[];
    project_authors?: {
      name: string;
      avatar: string;
      profile_link: string;
      title?: string;
    }[];
    status?: 'ongoing' | 'completed' | 'planning';
    slug: string;
    category?: string;
    created_at?: string;
  }

  export interface UserData {
    id: string;
    email: string;
    name: string;
    fullName?: string;
    avatar?: string;
    phone?: string;
    university?: string;
    major?: string;
    role?: string;
    status?: string;
  }

  export interface BlogPost {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    image?: string;
    category?: string;
    slug: string;
    publish_date: string;
    read_time?: string;
    authors: {
      full_name: string;
      avatar_url: string;
      slug: string;
      title?: string;
    }[];
    tags?: string[];
    views?: number;
  }

  export interface RegisterData {
    name: string;
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    confirmPassword?: string;
  }

  // ==========================================
  // 1. QUẢN LÝ XÁC THỰC (authAPI)
  // ==========================================
  export const authAPI = {
    /**
     * Lấy thông tin người dùng đang đăng nhập
     */
    getCurrentUser: async (): Promise<UserData | null> => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email || 'Người dùng',
        fullName: user.user_metadata?.full_name,
        avatar: getPublicUrl(user.user_metadata?.avatar_url), // Xử lý link avatar
        phone: user.user_metadata?.phone,
        university: user.user_metadata?.university,
        major: user.user_metadata?.major
      };
    },

    /**
     * Hàm Đăng ký tài khoản mới (Sign Up)
     */
    register: async (data: RegisterData) => {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password!,
          options: {
            data: {
              full_name: data.fullName,
              phone: data.phone,
            }
          }
        });

        if (authError) throw authError;
        return { success: true, data: authData };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },

    /**
     * Hàm Đăng nhập (Sign In)
     */
    login: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return {
        success: !error,
        data,
        error: error?.message
      };
    },

    /**
     * Hàm Đăng xuất (Sign Out)
     */
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };

  // ==========================================
  // 2. QUẢN LÝ DỮ LIỆU CHUNG (api)
  // ==========================================
  export const api = {
    /**
     * Lấy danh sách gzver
     */
    getGzvers: async (): Promise<gzver[]> => {
      try {
        const { data, error } = await supabase
          .from('gzvers')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true });
        if (error) throw error;
        return (data || []).map(m => ({ ...m, avatar_url: getPublicUrl(m.avatar_url || m.image) }));
      } catch (error) {
        console.error("❌ Error fetching gzvers:", error);
        return [];
      }
    },

    /**
     * Lấy danh sách Mentor (Ban giảng huấn)
     */
    getMentors: async (): Promise<Mentor[]> => {
      try {
        const { data, error } = await supabase
          .from('mentors')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true });
        if (error) throw error;
        return (data || []).map(m => ({ ...m, avatar_url: getPublicUrl(m.avatar_url) }));
      } catch (error) {
        console.error("❌ Error fetching Mentors:", error);
        return [];
      }
    },

    /**
     * Lấy chi tiết 1 Mentor qua Slug
     */
    getMentorBySlug: async (slug: string): Promise<Mentor | null> => {
      try {
        const { data, error } = await supabase
          .from('mentors')
          .select('*')
          .eq('slug', slug)
          .single();
        if (error || !data) return null;
        return { ...data, avatar_url: getPublicUrl(data.avatar_url) } as Mentor;
      } catch (error) {
        console.error("❌ Error fetching Mentor detail:", error);
        return null;
      }
    },

    /**
     * Lấy danh sách dự án (Kết hợp thông tin Author từ bảng authors)
     */
    getProjects: async (): Promise<Project[]> => {
      try {
        const { data: projects, error: pError } = await supabase
          .from('projects')
          .select('*')
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false });

        if (pError) throw pError;

        // Lấy danh sách authors (Bỏ cột 'type' do DB hiện tại không có)
        const { data: authorsData } = await supabase
          .from('authors')
          .select('id, full_name, avatar_url, slug, title, position'); 

        // ... (các dòng trên giữ nguyên)
        const mappedProjects = (projects || []).map((p: any) => {
          const matched = authorsData?.filter(a => p.author_ids?.includes(a.id)) || [];
          return {
            ...p,
            // SỬA TẠI ĐÂY: Ưu tiên thumbnail_url, nếu không có mới lấy image
            image: getPublicUrl(p.thumbnail_url || p.image),
            
            project_authors: matched.map(a => ({
              name: a.full_name,
              avatar: getPublicUrl(a.avatar_url),
              profile_link: `/mentors/${a.slug}`,
              title: a.title || a.position
            }))
          };
        });
  // ... (các dòng dưới giữ nguyên)

        return mappedProjects as Project[];
      } catch (error) {
        console.error("❌ Error fetching projects:", error);
        return [];
      }
    },

    /**
     * Lấy chi tiết dự án qua Slug
     */
    getProjectBySlug: async (slug: string): Promise<Project | null> => {
      try {
        const { data: project, error } = await supabase.from('projects').select('*').eq('slug', slug).single();
        if (error || !project) return null;

        if (project.author_ids && project.author_ids.length > 0) {
          const { data: authorsData } = await supabase
            .from('authors')
            .select('id, full_name, avatar_url, slug, title, position')
            .in('id', project.author_ids);
          
          project.project_authors = authorsData?.map(a => ({
            name: a.full_name,
            avatar: getPublicUrl(a.avatar_url),
            profile_link: `/mentors/${a.slug}`,
            title: a.title || a.position
          })) || [];
        }
        return { ...project, image: getPublicUrl(project.thumbnail_url || project.image) } as Project;
      } catch (error) {
        return null;
      }
    },

    /**
     * Lấy danh sách bài viết Blog
     */
    getBlogPosts: async (): Promise<BlogPost[]> => {
      try {
        const { data, error } = await supabase.from('allblogposts').select('*').order('publish_date', { ascending: false });
        if (error) throw error;
        return (data || []).map((post: any) => ({
          ...post,
          id: post.id.toString(),
          authors: post.authors_details || [],
          publish_date: post.publish_date || post.created_at,
          read_time: post.read_time || '5 phút đọc',
          image: getPublicUrl(post.thumbnail_url || post.image)
        }));
      } catch (error) {
        return [];
      }
    },
    getgzverBySlug: async (slug: string): Promise<gzver | null> => {
      try {
        const { data, error } = await supabase
          .from('gzvers')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) return null;

        // Xử lý ảnh đại diện qua Public URL
        return { 
          ...data, 
          avatar_url: getPublicUrl(data.avatar_url) 
        } as gzver;
      } catch (error) {
        console.error("❌ Error fetching gzver detail:", error);
        return null;
      }
    },

    /**
     * Lấy chi tiết bài viết Blog qua Slug
     */
    getBlogPostsByCategory: async (category: string): Promise<BlogPost[]> => {
      try {
        const { data, error } = await supabase
          .from('allblogposts')
          .select('*')
          .eq('category', category)
          .order('publish_date', { ascending: false });

        if (error) throw error;
        
        return (data || []).map((post: any) => ({
          ...post,
          id: post.id.toString(),
          authors: post.authors_details || [],
          publish_date: post.publish_date || post.created_at,
          read_time: post.read_time || '5 phút đọc',
          image: getPublicUrl(post.thumbnail_url || post.image)
        }));
      } catch (error) {
        console.error("❌ Error fetching posts by category:", error);
        return [];
      }
    },
    getBlogPostBySlug: async (slug: string): Promise<BlogPost | null> => {
      try {
        const { data, error } = await supabase.from('allblogposts').select('*').eq('slug', slug).single();
        if (error) return null;
        return {
          ...data,
          id: data.id.toString(),
          authors: data.authors_details || [],
          publish_date: data.publish_date || data.created_at,
          read_time: data.read_time || '5 phút đọc',
          image: getPublicUrl(data.thumbnail_url || data.image)
        } as BlogPost;
      } catch (error) {
        return null;
      }
    },

    /**
     * Lấy danh sách các chương trình đào tạo
     */
    getPrograms: async (): Promise<Program[]> => {
      try {
        // Chỉ lấy chương trình đã publish (RLS cho anon cũng chỉ cho đọc 'published')
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('status', 'published')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((p: any) => ({
          ...p,
          image: getPublicUrl(p.thumbnail_url || p.image),
          detailed_content: getProgramDetailedContent(p),
          highlights: getProgramHighlights(p),
          duration: p.estimated_duration ?? '',
          students: p.total_lessons != null ? String(p.total_lessons) : '0',
          price: p.price_sale != null
            ? String(p.price_sale)
            : p.price_original != null ? String(p.price_original) : '',
        }));
      } catch (error) {
        console.error('getPrograms error:', error);
        return [];
      }
    }
  };

  export default api;
