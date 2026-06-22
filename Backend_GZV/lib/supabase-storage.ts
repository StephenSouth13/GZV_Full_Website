import { supabase } from './supabase'

export interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  mimetype: string
  bucket: string
  path: string
  created_at: string
}

export interface StorageResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

const BUCKET_NAME = 'content'
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * Upload a single file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  folder: string = 'uploads'
): Promise<StorageResponse> {
  try {
    // Validate file
    if (!file) {
      return {
        success: false,
        error: 'File is required'
      }
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: `File type ${file.type} is not allowed`
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const filename = `${timestamp}-${random}-${file.name}`
    const path = `${folder}/${filename}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    // Store metadata in database
    const { error: dbError } = await supabase
      .from('media_files')
      .insert({
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type,
        file_url: publicUrlData.publicUrl,
        folder_path: folder,
        storage_path: data.path,
        storage_bucket: BUCKET_NAME,
        is_public: true
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // File uploaded but metadata not saved - still return success
    }

    return {
      success: true,
      data: {
        id: filename,
        name: file.name,
        url: publicUrlData.publicUrl,
        size: file.size,
        mimetype: file.type,
        bucket: BUCKET_NAME,
        path: data.path,
        created_at: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Upload multiple files to Supabase Storage
 */
export async function uploadFiles(
  files: File[],
  folder: string = 'uploads'
): Promise<{
  success: boolean
  successful: UploadedFile[]
  failed: Array<{ filename: string; error: string }>
}> {
  const successful: UploadedFile[] = []
  const failed: Array<{ filename: string; error: string }> = []

  for (const file of files) {
    const result = await uploadFile(file, folder)
    if (result.success && result.data) {
      successful.push(result.data)
    } else {
      failed.push({
        filename: file.name,
        error: result.error || 'Unknown error'
      })
    }
  }

  return {
    success: failed.length === 0,
    successful,
    failed
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(path: string): Promise<StorageResponse> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    // Delete metadata from database
    await supabase
      .from('media_files')
      .delete()
      .eq('storage_path', path)

    return {
      success: true,
      message: 'File deleted successfully'
    }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

/**
 * List files in a folder
 */
export async function listFiles(folder: string = 'uploads'): Promise<StorageResponse> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URLs
    const files = data.map(file => ({
      ...file,
      url: getPublicUrl(`${folder}/${file.name}`)
    }))

    return {
      success: true,
      data: {
        files,
        folder
      }
    }
  } catch (error) {
    console.error('List error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'List failed'
    }
  }
}

/**
 * Get media files from database with filters
 */
export async function getMediaFiles(options?: {
  folder?: string
  limit?: number
  offset?: number
  file_type?: string
}): Promise<StorageResponse> {
  try {
    let query = supabase
      .from('media_files')
      .select('*', { count: 'exact' })

    if (options?.folder) {
      query = query.eq('folder_path', options.folder)
    }

    if (options?.file_type) {
      query = query.eq('file_type', options.file_type)
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .limit(options?.limit || 50)
      .offset(options?.offset || 0)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      data: {
        files: data,
        total: count,
        limit: options?.limit || 50,
        offset: options?.offset || 0
      }
    }
  } catch (error) {
    console.error('Get media error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch media'
    }
  }
}
