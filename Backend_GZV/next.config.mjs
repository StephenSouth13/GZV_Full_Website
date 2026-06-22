/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    // Thêm domain của Supabase vào đây để Next.js cho phép hiển thị ảnh
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-project-id.supabase.co', // Thay project id của bạn vào đây
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Cho phép kết nối API từ bên ngoài (CORS)
  async headers() {
    return [
      {
        // Áp dụng cho tất cả các route API v1
        source: "/api/v1/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://msc.edu.vn" }, // Domain Frontend của bạn
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
  allowedDevOrigins: ['*'],
}

export default nextConfig