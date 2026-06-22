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
      // Trả về mock folders nếu chưa cấu hình
      return NextResponse.json({
        success: true,
        data: {
          folders: [
            { name: 'uploads', path: 'uploads' },
            { name: 'blog', path: 'blog' },
            { name: 'products', path: 'products' }
          ]
        },
        message: 'Using mock data - Cloudinary not configured'
      })
    }

    // Lấy danh sách folders từ Cloudinary
    const result = await cloudinary.api.root_folders()
    
    // Lấy thêm subfolders cho mỗi folder
    const foldersWithSubfolders = await Promise.all(
      result.folders.map(async (folder: any) => {
        try {
          const subfolders = await cloudinary.api.sub_folders(folder.path)
          return {
            ...folder,
            subfolders: subfolders.folders || []
          }
        } catch (error) {
          return {
            ...folder,
            subfolders: []
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        folders: foldersWithSubfolders
      }
    })

  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch folders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra cấu hình Cloudinary
    const hasCloudinaryConfig = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )

    if (!hasCloudinaryConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary not configured',
          message: 'Please configure Cloudinary environment variables'
        },
        { status: 400 }
      )
    }

    const { folderPath } = await request.json()

    if (!folderPath) {
      return NextResponse.json(
        { success: false, error: 'Folder path is required' },
        { status: 400 }
      )
    }

    // Tạo folder bằng cách tạo một asset tạm thời và sau đó xóa nó
    // Cloudinary tự động tạo folder khi có asset được upload vào đó
    const result = await cloudinary.uploader.upload('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', {
      folder: folderPath,
      public_id: 'temp_folder_marker',
      resource_type: 'image'
    })

    // Xóa asset tạm thời
    await cloudinary.uploader.destroy(result.public_id)

    return NextResponse.json({
      success: true,
      data: { folder_path: folderPath, status: 'created' }
    })

  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create folder',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Kiểm tra cấu hình Cloudinary
    const hasCloudinaryConfig = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )

    if (!hasCloudinaryConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary not configured',
          message: 'Please configure Cloudinary environment variables'
        },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get('path')

    if (!folderPath) {
      return NextResponse.json(
        { success: false, error: 'Folder path is required' },
        { status: 400 }
      )
    }

    // Xóa tất cả resources trong folder trước
    const resources = await cloudinary.search
      .expression(`folder:${folderPath}/*`)
      .execute()

    if (resources.resources.length > 0) {
      const publicIds = resources.resources.map((resource: any) => resource.public_id)
      await cloudinary.api.delete_resources(publicIds)
    }

    // Xóa folder
    await cloudinary.api.delete_folder(folderPath)

    return NextResponse.json({
      success: true,
      data: { folder_path: folderPath, status: 'deleted' }
    })

  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete folder',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Kiểm tra cấu hình Cloudinary
    const hasCloudinaryConfig = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )

    if (!hasCloudinaryConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary not configured',
          message: 'Please configure Cloudinary environment variables'
        },
        { status: 400 }
      )
    }

    const { oldPath, newPath } = await request.json()

    if (!oldPath || !newPath) {
      return NextResponse.json(
        { success: false, error: 'Both old path and new path are required' },
        { status: 400 }
      )
    }

    // Lấy tất cả resources trong folder cũ
    const resources = await cloudinary.search
      .expression(`folder:${oldPath}/*`)
      .execute()

    if (resources.resources.length > 0) {
      // Di chuyển từng resource sang folder mới
      const movePromises = resources.resources.map((resource: any) => {
        const newPublicId = resource.public_id.replace(oldPath, newPath)
        return cloudinary.uploader.rename(resource.public_id, newPublicId)
      })

      await Promise.all(movePromises)
    }

    // Xóa folder cũ
    try {
      await cloudinary.api.delete_folder(oldPath)
    } catch (error) {
      console.warn('Could not delete old folder:', error)
    }

    return NextResponse.json({
      success: true,
      data: { old_path: oldPath, new_path: newPath, status: 'renamed' }
    })

  } catch (error) {
    console.error('Error renaming folder:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to rename folder',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}