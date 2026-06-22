import { NextRequest, NextResponse } from 'next/server'
import { uploadFiles } from '@/lib/supabase-storage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    const result = await uploadFiles(files, folder)

    return NextResponse.json({
      success: result.success,
      data: {
        successful: result.successful,
        failed: result.failed,
        total: files.length,
        successCount: result.successful.length,
        failureCount: result.failed.length
      }
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload files',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path is required' },
        { status: 400 }
      )
    }

    const { deleteFile } = await import('@/lib/supabase-storage')
    const result = await deleteFile(path)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      error: result.error
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete file',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
