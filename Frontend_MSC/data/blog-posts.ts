export interface BlogPost {
  id: string
  title: string
  category: string
  views: number
  excerpt?: string
  author?: string
  publishedAt?: string
}

export const topPosts: BlogPost[] = [
  {
    id: "1",
    title: "Hướng dẫn học lập trình Frontend hiệu quả cho người mới bắt đầu",
    category: "Frontend",
    views: 15420,
    excerpt: "Những bước đầu tiên để trở thành một frontend developer...",
    author: "MSC Team",
    publishedAt: "2024-01-15"
  },
  {
    id: "2", 
    title: "Top 10 công nghệ Backend đáng học nhất năm 2024",
    category: "Backend",
    views: 12350,
    excerpt: "Khám phá những công nghệ backend hot nhất hiện tại...",
    author: "MSC Team",
    publishedAt: "2024-01-20"
  },
  {
    id: "3",
    title: "Kinh nghiệm thực tập sinh: Từ zero đến hero trong 6 tháng",
    category: "Kinh nghiệm",
    views: 9870,
    excerpt: "Chia sẻ hành trình từ thực tập sinh đến developer...",
    author: "MSC Team", 
    publishedAt: "2024-01-10"
  },
  {
    id: "4",
    title: "Database Design: Những nguyên tắc cơ bản cần biết",
    category: "Database",
    views: 8520,
    excerpt: "Thiết kế cơ sở dữ liệu hiệu quả và tối ưu...",
    author: "MSC Team",
    publishedAt: "2024-01-25"
  },
  {
    id: "5",
    title: "DevOps cho người mới: CI/CD và deployment automation",
    category: "DevOps", 
    views: 7230,
    excerpt: "Tự động hóa quy trình phát triển và triển khai...",
    author: "MSC Team",
    publishedAt: "2024-01-30"
  }
]

export const allBlogPosts: BlogPost[] = [
  ...topPosts,
  // Có thể thêm nhiều bài viết khác ở đây
]