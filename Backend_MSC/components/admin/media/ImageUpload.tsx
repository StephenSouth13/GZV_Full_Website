"use client"

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload,
  X,
  FileImage,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderOpen
} from 'lucide-react'

interface UploadFile {
  file: File
  id: string
  name: string
  size: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  errorMessage?: string
  preview?: string
}

interface ImageUploadProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: () => void
  currentFolder?: string
}

export function ImageUpload({ isOpen, onClose, onUploadComplete, currentFolder = '' }: ImageUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [folder, setFolder] = useState(currentFolder || 'uploads')
  const [tags, setTags] = useState('')

  // Cập nhật folder khi currentFolder thay đổi
  useEffect(() => {
    setFolder(currentFolder || 'uploads')
  }, [currentFolder])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: 'pending',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))

    setUploadFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const updateFileStatus = (fileId: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ))
  }

  const uploadFile = async (uploadFile: UploadFile) => {
    updateFileStatus(uploadFile.id, { status: 'uploading', progress: 0 })
    
    try {
      const formData = new FormData()
      formData.append('files', uploadFile.file)
      formData.append('folder', folder)
      if (tags) {
        formData.append('tags', tags)
      }

      const xhr = new XMLHttpRequest()
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          updateFileStatus(uploadFile.id, { progress })
        }
      })

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          if (response.success) {
            updateFileStatus(uploadFile.id, { 
              status: 'completed', 
              progress: 100 
            })
          } else {
            updateFileStatus(uploadFile.id, { 
              status: 'error', 
              errorMessage: response.error || 'Upload failed' 
            })
          }
        } else {
          updateFileStatus(uploadFile.id, { 
            status: 'error', 
            errorMessage: `HTTP ${xhr.status}: ${xhr.statusText}` 
          })
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        updateFileStatus(uploadFile.id, { 
          status: 'error', 
          errorMessage: 'Network error occurred' 
        })
      })

      // Start upload
      xhr.open('POST', '/api/images/upload')
      xhr.send(formData)

    } catch (error) {
      updateFileStatus(uploadFile.id, { 
        status: 'error', 
        errorMessage: error instanceof Error ? error.message : 'Upload failed' 
      })
    }
  }

  const handleUploadAll = async () => {
    setIsUploading(true)
    
    const pendingFiles = uploadFiles.filter(file => file.status === 'pending')
    
    // Upload files one by one to avoid overwhelming the server
    for (const file of pendingFiles) {
      await uploadFile(file)
    }
    
    setIsUploading(false)
  }

  const handleClose = () => {
    if (isUploading) return // Don't close during upload
    
    // Clean up preview URLs
    uploadFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    
    setUploadFiles([])
    setFolder(currentFolder || 'uploads') // Reset về folder hiện tại
    setTags('')
    onClose()
  }

  const handleComplete = () => {
    if (onUploadComplete) {
      onUploadComplete()
    }
    handleClose()
  }

  const allFilesCompleted = uploadFiles.length > 0 && uploadFiles.every(file => file.status === 'completed')
  const hasFiles = uploadFiles.length > 0
  const completedCount = uploadFiles.filter(file => file.status === 'completed').length
  const errorCount = uploadFiles.filter(file => file.status === 'error').length

  return (
    <Dialog open={isOpen} onOpenChange={!isUploading ? handleClose : undefined}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Images</span>
          </DialogTitle>
          <DialogDescription>
            Upload images to {folder && folder !== 'uploads' ? `folder: "${folder}"` : 'default uploads folder'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Upload Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Folder
              </Label>
              <Input
                id="folder"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Enter folder name (e.g., msc/news)"
                disabled={isUploading}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Upload Zone */}
          {!hasFiles && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${isUploading ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
              </p>
              <p className="text-gray-500 mb-4">or click to select files</p>
              <Badge variant="outline">PNG, JPG, GIF, WebP up to 10MB</Badge>
            </div>
          )}

          {/* Files List */}
          {hasFiles && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Files to Upload ({uploadFiles.length})</h3>
                {!isUploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      uploadFiles.forEach(file => {
                        if (file.preview) URL.revokeObjectURL(file.preview)
                      })
                      setUploadFiles([])
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <FileImage className="w-12 h-12 text-gray-400" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                      
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-1" />
                      )}
                      
                      {file.status === 'error' && file.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">{file.errorMessage}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      {file.status === 'uploading' && (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      )}
                      
                      {!isUploading && file.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Summary */}
              {(completedCount > 0 || errorCount > 0) && (
                <Alert>
                  <AlertDescription>
                    Upload complete: {completedCount} successful, {errorCount} failed
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {allFilesCompleted ? 'Close' : 'Cancel'}
          </Button>
          
          <div className="flex gap-2">
            {hasFiles && !allFilesCompleted && (
              <Button 
                onClick={handleUploadAll}
                disabled={isUploading || uploadFiles.every(f => f.status !== 'pending')}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload All
                  </>
                )}
              </Button>
            )}
            
            {allFilesCompleted && (
              <Button onClick={handleComplete}>
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}