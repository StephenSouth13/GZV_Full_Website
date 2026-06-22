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

interface CloudinaryParams {
  params: {
    publicId: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: CloudinaryParams
) {
  try {
    const publicId = decodeURIComponent(params.publicId)

    // Lấy thông tin chi tiết về resource
    const result = await cloudinary.api.resource(publicId, {
      colors: true,
      faces: true,
      quality_analysis: true,
      accessibility_analysis: true,
      cinemagraph_analysis: true
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error fetching image details:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch image details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: CloudinaryParams
) {
  try {
    const publicId = decodeURIComponent(params.publicId)

    // Xóa hình ảnh từ Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        data: { public_id: publicId, status: 'deleted' }
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete image',
          details: result
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: CloudinaryParams
) {
  try {
    const publicId = decodeURIComponent(params.publicId)
    const body = await request.json()
    const { tags, context } = body

    const updateParams: any = {}

    if (tags) {
      updateParams.tags = Array.isArray(tags) ? tags.join(',') : tags
    }

    if (context) {
      updateParams.context = context
    }

    // Cập nhật metadata
    const result = await cloudinary.api.update(publicId, updateParams)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}