import { NextRequest, NextResponse } from 'next/server'
import { getMediaFiles } from '@/lib/supabase-storage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const folder = searchParams.get('folder') || 'uploads'
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const fileType = searchParams.get('file_type') || undefined

    const result = await getMediaFiles({
      folder,
      limit,
      offset,
      file_type: fileType
    })

    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch media files',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
