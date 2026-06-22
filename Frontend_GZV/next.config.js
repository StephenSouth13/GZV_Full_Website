/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Cấu hình biến môi trường thủ công (nếu cần dùng bên ngoài NEXT_PUBLIC_)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // 2. Cấu hình Headers (Xử lý CORS cho các API Route)
  async headers() {
    return [
      {
        // Áp dụng cho tất cả các đường dẫn bắt đầu bằng /api/
        source: '/api/:path*',
        headers: [
          // Cho phép mọi nguồn (Origin) truy cập vào API này
          { key: 'Access-Control-Allow-Origin', value: '*' },
          // Các phương thức HTTP được phép sử dụng
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          // Các Header được phép gửi kèm trong request
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },

  // 3. Cấu hình REDIRECTS (Chuyển hướng link cũ/dài về link Card Visit)
  async redirects() {
    return [
      {
        // NGUỒN: Link cũ hoặc link cấu trúc dài mà bạn muốn bỏ
        source: '/cv/dtk/dtk',
        // ĐÍCH: Link đẹp đã in trên Card Visit của bạn
        destination: '/mscer/duong-the-khai',
        // permanent: true trả về mã lỗi 301 (Chuyển hướng vĩnh viễn), rất tốt cho SEO
        permanent: true, 
      },
    ]
  },

  // 4. Cấu hình tối ưu hóa hình ảnh (Image Optimization)
  images: {
    // Cho phép Next.js tự động resize và tối ưu dung lượng ảnh (mặc định là false)
    unoptimized: false,
    // Danh sách các Domain (Server) bên ngoài được phép hiển thị ảnh trên web
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'yyqajxbkxiddfqnzkcmr.supabase.co', // Server ảnh Supabase của bạn
      },
    ],
  },
}

module.exports = nextConfig