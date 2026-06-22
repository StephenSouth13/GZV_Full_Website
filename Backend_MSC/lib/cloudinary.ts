// Cloudinary API utility functions

export interface CloudinaryResource {
  public_id: string
  secure_url: string
  url: string
  format: string
  resource_type: string
  bytes: number
  width: number
  height: number
  created_at: string
  folder?: string
  tags: string[]
  context?: Record<string, string>
}

export interface CloudinaryUploadResult {
  success: boolean
  data?: CloudinaryResource
  error?: string
  filename?: string
}

export interface CloudinaryStats {
  usage: {
    plan: string
    credits: number
    used_percent: number
    limit: number
  }
  storage: {
    used: number
    limit: number
  }
  bandwidth: {
    used: number
    limit: number
  }
  folders: Array<{ name: string; path: string }>
  formats: Array<{ format: string; count: number }>
  totalImages: number
}

export interface CloudinaryFolder {
  name: string
  path: string
  subfolders?: CloudinaryFolder[]
}

class CloudinaryService {
  private baseUrl = '/api/images'

  async getImages(params?: {
    folder?: string
    tags?: string[]
    limit?: number
    nextCursor?: string
  }): Promise<{
    success: boolean
    data?: {
      resources: CloudinaryResource[]
      next_cursor?: string
      total_count: number
    }
    error?: string
  }> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.folder) searchParams.set('folder', params.folder)
      if (params?.tags?.length) searchParams.set('tags', params.tags.join(','))
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.nextCursor) searchParams.set('next_cursor', params.nextCursor)

      const response = await fetch(`${this.baseUrl}?${searchParams}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch images')
      }

      return result
    } catch (error) {
      console.error('Error fetching images:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch images'
      }
    }
  }

  async uploadImages(
    files: File[],
    options?: {
      folder?: string
      tags?: string[]
    }
  ): Promise<{
    success: boolean
    data?: {
      successful: CloudinaryUploadResult[]
      failed: CloudinaryUploadResult[]
      total: number
      successCount: number
      failureCount: number
    }
    error?: string
  }> {
    try {
      const formData = new FormData()
      
      files.forEach(file => formData.append('files', file))
      if (options?.folder) formData.append('folder', options.folder)
      if (options?.tags?.length) formData.append('tags', options.tags.join(','))

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload images')
      }

      return result
    } catch (error) {
      console.error('Error uploading images:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload images'
      }
    }
  }

  async deleteImage(publicId: string): Promise<{
    success: boolean
    data?: { public_id: string; status: string }
    error?: string
  }> {
    try {
      const encodedPublicId = encodeURIComponent(publicId)
      const response = await fetch(`${this.baseUrl}/${encodedPublicId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete image')
      }

      return result
    } catch (error) {
      console.error('Error deleting image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete image'
      }
    }
  }

  async getImageDetails(publicId: string): Promise<{
    success: boolean
    data?: CloudinaryResource
    error?: string
  }> {
    try {
      const encodedPublicId = encodeURIComponent(publicId)
      const response = await fetch(`${this.baseUrl}/${encodedPublicId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get image details')
      }

      return result
    } catch (error) {
      console.error('Error getting image details:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get image details'
      }
    }
  }

  async updateImage(
    publicId: string,
    updates: {
      tags?: string[]
      context?: Record<string, string>
    }
  ): Promise<{
    success: boolean
    data?: CloudinaryResource
    error?: string
  }> {
    try {
      const encodedPublicId = encodeURIComponent(publicId)
      const response = await fetch(`${this.baseUrl}/${encodedPublicId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update image')
      }

      return result
    } catch (error) {
      console.error('Error updating image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update image'
      }
    }
  }

  async getStats(): Promise<{
    success: boolean
    data?: CloudinaryStats
    error?: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get statistics')
      }

      return result
    } catch (error) {
      console.error('Error getting stats:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get statistics'
      }
    }
  }

  // Utility functions
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  generateTransformedUrl(
    publicId: string,
    transformations: Record<string, string | number> = {}
  ): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set')
      return ''
    }

    const transformString = Object.entries(transformations)
      .map(([key, value]) => `${key}_${value}`)
      .join(',')

    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`
    return transformString 
      ? `${baseUrl}/${transformString}/${publicId}`
      : `${baseUrl}/${publicId}`
  }

  generateThumbnail(publicId: string, size: number = 300): string {
    return this.generateTransformedUrl(publicId, {
      w: size,
      h: size,
      c: 'fill',
      q: 'auto',
      f: 'auto'
    })
  }
}

export const cloudinaryService = new CloudinaryService()
export default cloudinaryService