import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, listFiles, getPublicUrl } from '@/lib/supabase-storage'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const folder = searchParams.get('folder') || 'site'
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    // 1. First try listing from Supabase Storage & Media Files table
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data: dbFiles } = await supabase
          .from('media_files')
          .select('*')
          .ilike('folder_path', `%${folder}%`)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (dbFiles && dbFiles.length > 0) {
          const files = dbFiles.map((f: any) => ({
            name: f.file_name || f.storage_path?.split('/').pop() || 'media',
            url: f.file_url,
            size: f.file_size_bytes || 0,
            mimetype: f.mime_type || 'image/jpeg',
            path: f.storage_path || `${folder}/${f.file_name}`,
          }))
          return NextResponse.json({
            success: true,
            data: { files, total: files.length },
          })
        }

        // Try direct bucket list if DB empty
        const storageList = await listFiles(folder)
        if (storageList.success && storageList.data?.files?.length > 0) {
          const files = storageList.data.files.slice(0, limit).map((f: any) => ({
            name: f.name,
            url: f.url || getPublicUrl(`${folder}/${f.name}`),
            size: f.metadata?.size || 0,
            mimetype: f.metadata?.mimetype || (f.name.endsWith('.webp') ? 'image/webp' : 'image/jpeg'),
            path: `${folder}/${f.name}`,
          }))
          return NextResponse.json({
            success: true,
            data: { files, total: files.length },
          })
        }
      } catch (sbErr) {
        console.warn('Supabase storage list error, trying fallback:', sbErr)
      }
    }

    // 2. Safe static fallback list if running in development locally
    const files: Array<{
      name: string
      url: string
      size: number
      mimetype: string
      path: string
    }> = []

    if (process.env.NODE_ENV !== 'production') {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const targetDir = path.join(process.cwd(), 'public', folder)
        if (fs.existsSync(targetDir)) {
          const dirEntries = fs.readdirSync(targetDir, { withFileTypes: true })
          for (const entry of dirEntries) {
            if (entry.isFile() && /\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|ogg|mov)$/i.test(entry.name)) {
              const filePath = path.join(targetDir, entry.name)
              const stats = fs.statSync(filePath)
              files.push({
                name: entry.name,
                url: `/${folder}/${entry.name}`,
                size: stats.size,
                mimetype: entry.name.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
                path: `${folder}/${entry.name}`,
              })
            }
          }
        }
      } catch { }
    }

    return NextResponse.json({
      success: true,
      data: {
        files: files.slice(0, limit),
        total: files.length,
      },
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch media files',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!file) {
      return NextResponse.json({ success: false, error: 'File là bắt buộc' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type) && !/\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|ogg|mov)$/i.test(file.name)) {
      return NextResponse.json({ success: false, error: `Định dạng ${file.type} không được hỗ trợ` }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'Dung lượng file vượt quá giới hạn 50MB' }, { status: 400 })
    }

    // 1. Upload to Supabase Storage as primary cloud storage
    try {
      const result = await uploadFile(file, folder, token)
      if (result.success && result.data) {
        return NextResponse.json(result)
      }
      if (result.error && !result.data) {
        console.warn('Supabase storage upload returned error:', result.error)
      }
    } catch (err) {
      console.warn('Supabase storage upload failed:', err)
    }

    // 2. In local dev environment only, allow local filesystem save fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const arrayBuffer = await file.arrayBuffer()
        const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
        const fileName = `${Date.now()}_${safeName}`

        const backendTargetDir = path.join(process.cwd(), 'public', folder)
        if (!fs.existsSync(backendTargetDir)) {
          fs.mkdirSync(backendTargetDir, { recursive: true })
        }
        const backendFilePath = path.join(backendTargetDir, fileName)
        fs.writeFileSync(backendFilePath, new Uint8Array(arrayBuffer))

        const publicUrl = `/${folder}/${fileName}`
        return NextResponse.json({
          success: true,
          data: {
            id: fileName,
            name: file.name,
            url: publicUrl,
            size: file.size,
            mimetype: file.type,
            path: `${folder}/${fileName}`,
            created_at: new Date().toISOString(),
          },
        })
      } catch (localErr) {
        console.warn('Local fallback upload failed:', localErr)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Không thể tải ảnh lên. Vui lòng kiểm tra kết nối Supabase Storage.',
      },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Không thể tải ảnh lên',
        message: error instanceof Error ? error.message : 'Lỗi không xác định',
      },
      { status: 500 }
    )
  }
}
