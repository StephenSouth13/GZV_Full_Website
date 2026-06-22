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
    // Kiểm tra các biến môi trường
    const config = {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    }

    const hasCloudinaryConfig = config.cloud_name && config.api_key && config.api_secret

    if (!hasCloudinaryConfig) {
      return NextResponse.json({
        success: false,
        error: 'Cloudinary configuration incomplete',
        config_status: config,
        message: 'Please check your environment variables'
      })
    }

    // Test connection bằng cách lấy thông tin tài khoản
    const result = await cloudinary.api.ping()

    return NextResponse.json({
      success: true,
      message: 'Cloudinary connection successful',
      data: {
        status: result.status,
        config_status: config,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Cloudinary connection test failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cloudinary connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        config_status: {
          cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
          api_key: !!process.env.CLOUDINARY_API_KEY,
          api_secret: !!process.env.CLOUDINARY_API_SECRET,
        }
      },
      { status: 500 }
    )
  }
}