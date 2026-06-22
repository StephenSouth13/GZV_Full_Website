export interface Project {
  id: string
  title: string
  description: string
  detailproject?: string 
  image?: string
  technologies?: string[]
  // CẬP NHẬT ĐOẠN NÀY
  mentors?: {
    id: string;
    full_name: string;
    avatar_url: string;
    slug: string;   // Thêm dòng này
    title?: string; // Thêm dòng này
  }[]
  status?: 'ongoing' | 'completed' | 'planning'
  slug?: string
  category?: string
  featured?: boolean // Thêm nếu bạn dùng logic lọc dự án tiêu biểu
}