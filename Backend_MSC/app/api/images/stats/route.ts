import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest) {
  try {
    // Kiểm tra cấu hình Cloudinary
    const hasCloudinaryConfig = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )

    if (!hasCloudinaryConfig) {
      // Trả về mock stats nếu chưa cấu hình
      return NextResponse.json({
        success: true,
        data: {
          usage: {
            plan: 'Free',
            credits: 0,
            used_percent: 0,
            limit: 25000
          },
          storage: {
            used: 0,
            limit: 1000000000
          },
          bandwidth: {
            used: 0,
            limit: 25000000000
          },
          folders: [],
          formats: [
            { format: 'jpg', count: 1 },
            { format: 'png', count: 1 }
          ],
          totalImages: 2
        },
        message: 'Using mock data - Cloudinary not configured'
      })
    }

    // Lấy thống kê sử dụng
    const usage = await cloudinary.api.usage()
    
    // Lấy thông tin về folders
    const folders = await cloudinary.api.root_folders()
    
    // Lấy danh sách resources để tính toán format (vì aggregation không hỗ trợ)
    const imageResources = await cloudinary.search
      .expression('resource_type:image')
      .max_results(500) // Lấy nhiều để phân tích format
      .execute()

    // Tính toán format counts từ results
    const formatCounts = imageResources.resources.reduce((acc: Record<string, number>, resource: any) => {
      const format = resource.format || 'unknown'
      acc[format] = (acc[format] || 0) + 1
      return acc
    }, {})

    const formats = Object.entries(formatCounts).map(([format, count]) => ({
      format,
      count
    }))

    return NextResponse.json({
      success: true,
      data: {
        usage: {
          plan: usage.plan,
          credits: usage.credits,
          used_percent: usage.used_percent,
          limit: usage.limit
        },
        storage: {
          used: usage.storage?.used || 0,
          limit: usage.storage?.limit || 0
        },
        bandwidth: {
          used: usage.bandwidth?.used || 0,
          limit: usage.bandwidth?.limit || 0
        },
        folders: folders.folders,
        formats: formats,
        totalImages: imageResources.total_count || imageResources.resources.length
      }
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}