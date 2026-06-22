"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Upload,
  X,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface UploadFile {
  file: File
  id: string
  name: string
  size: string
  type: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  category: string
  tags: string
  alt: string
  preview?: string
}

interface MediaUploadProps {
  isOpen: boolean
  onClose: () => void
}

export function MediaUpload({ isOpen, onClose }: MediaUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatFileSize(file.size),
      type: getFileType(file.type),
      progress: 0,
      status: 'pending',
      category: getDefaultCategory(file.type),
      tags: '',
      alt: '',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))

    setUploadFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileType = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'document'
  }

  const getDefaultCategory = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'images'
    if (mimeType.startsWith('video/')) return 'videos'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'documents'
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="h-6 w-6 text-green-600" />
      case 'video':
        return <FileVideo className="h-6 w-6 text-purple-600" />
      case 'audio':
        return <FileAudio className="h-6 w-6 text-pink-600" />
      default:
        return <FileText className="h-6 w-6 text-orange-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return null
    }
  }

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id))
  }

  const updateFileDetails = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ))
  }

  const simulateUpload = async (file: UploadFile) => {
    updateFileDetails(file.id, { status: 'uploading' })
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      updateFileDetails(file.id, { progress })
    }
    
    // Simulate success (you could add error simulation here)
    updateFileDetails(file.id, { status: 'completed', progress: 100 })
  }

  const handleUploadAll = async () => {
    setIsUploading(true)
    
    const pendingFiles = uploadFiles.filter(file => file.status === 'pending')
    
    // Upload files in parallel (you might want to limit concurrency)
    await Promise.all(pendingFiles.map(file => simulateUpload(file)))
    
    setIsUploading(false)
  }

  const handleClose = () => {
    setUploadFiles([])
    onClose()
  }

  const allFilesCompleted = uploadFiles.length > 0 && uploadFiles.every(file => file.status === 'completed')
  const hasFiles = uploadFiles.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Upload className="h-5 w-5" />
            <span>Upload Media Files</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Upload Zone */}
          {!hasFiles && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop files here' : 'Upload media files'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop files here, or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <Badge variant="outline">Images (PNG, JPG, SVG)</Badge>
                <Badge variant="outline">Videos (MP4, MOV, AVI)</Badge>
                <Badge variant="outline">Audio (MP3, WAV, OGG)</Badge>
                <Badge variant="outline">Documents (PDF, DOC, TXT)</Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Maximum file size: 50MB per file
              </p>
            </div>
          )}

          {/* File List */}
          {hasFiles && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Files to Upload ({uploadFiles.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <div
                    {...getRootProps()}
                    className="cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      Add More
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uploadFiles.map((file) => (
                  <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      {/* File Preview */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getFileIcon(file.type)
                          )}
                        </div>
                      </div>

                      {/* File Details */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {file.size} • {file.type}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(file.status)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              disabled={file.status === 'uploading'}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                              <span className="text-gray-600 dark:text-gray-400">{file.progress}%</span>
                            </div>
                            <Progress value={file.progress} className="h-2" />
                          </div>
                        )}

                        {/* File Settings */}
                        {file.status !== 'uploading' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`category-${file.id}`} className="text-xs text-gray-600 dark:text-gray-400">
                                Category
                              </Label>
                              <Select
                                value={file.category}
                                onValueChange={(value) => updateFileDetails(file.id, { category: value })}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="images">Images</SelectItem>
                                  <SelectItem value="videos">Videos</SelectItem>
                                  <SelectItem value="audio">Audio</SelectItem>
                                  <SelectItem value="documents">Documents</SelectItem>
                                  <SelectItem value="banners">Banners</SelectItem>
                                  <SelectItem value="courses">Courses</SelectItem>
                                  <SelectItem value="projects">Projects</SelectItem>
                                  <SelectItem value="team">Team</SelectItem>
                                  <SelectItem value="branding">Branding</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor={`tags-${file.id}`} className="text-xs text-gray-600 dark:text-gray-400">
                                Tags
                              </Label>
                              <Input
                                id={`tags-${file.id}`}
                                value={file.tags}
                                onChange={(e) => updateFileDetails(file.id, { tags: e.target.value })}
                                placeholder="tag1, tag2, tag3"
                                className="h-8 text-xs"
                              />
                            </div>

                            {file.type === 'image' && (
                              <div className="space-y-1">
                                <Label htmlFor={`alt-${file.id}`} className="text-xs text-gray-600 dark:text-gray-400">
                                  Alt Text
                                </Label>
                                <Input
                                  id={`alt-${file.id}`}
                                  value={file.alt}
                                  onChange={(e) => updateFileDetails(file.id, { alt: e.target.value })}
                                  placeholder="Describe the image"
                                  className="h-8 text-xs"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasFiles && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {uploadFiles.filter(f => f.status === 'completed').length} of {uploadFiles.length} files uploaded
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleClose}>
                {allFilesCompleted ? 'Done' : 'Cancel'}
              </Button>
              {!allFilesCompleted && (
                <Button
                  onClick={handleUploadAll}
                  disabled={isUploading || uploadFiles.filter(f => f.status === 'pending').length === 0}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload All
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}