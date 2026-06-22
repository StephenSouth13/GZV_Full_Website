"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  X,
  Edit,
  Download,
  Copy,
  ExternalLink,
  Tag,
  Calendar,
  User,
  Eye,
  FileText,
  Share2,
  Settings
} from 'lucide-react'

interface MediaItem {
  id: number
  name: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  thumbnail: string
  size: string
  dimensions: string
  category: string
  tags: string[]
  uploadedAt: string
  uploadedBy: string
  alt: string
  usage: number
  lastUsed: string
}

interface MediaDetailsProps {
  media: MediaItem
  onClose: () => void
}

export function MediaDetails({ media, onClose }: MediaDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: media.name,
    alt: media.alt,
    category: media.category,
    tags: media.tags.join(', ')
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(media.url)
    // You could add a toast notification here
  }

  const handleSaveChanges = () => {
    // Here you would typically save the changes to your backend
    console.log('Saving changes:', editForm)
    setIsEditing(false)
  }

  const getFileIcon = () => {
    switch (media.type) {
      case 'image':
        return '🖼️'
      case 'video':
        return '🎥'
      case 'audio':
        return '🎵'
      case 'document':
        return '📄'
      default:
        return '📁'
    }
  }

  return (
    <>
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20 sticky top-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Media Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Media Preview */}
          <div className="space-y-3">
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              {media.type === 'image' ? (
                <img
                  src={media.thumbnail}
                  alt={media.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{getFileIcon()}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {media.type.charAt(0).toUpperCase() + media.type.slice(1)} File
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4 mr-1" />
                Copy URL
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Button>
            </div>
          </div>

          <Separator />

          {/* File Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">File Information</h3>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">File Name:</span>
                <span className="font-medium text-gray-900 dark:text-white">{media.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">File Size:</span>
                <span className="font-medium text-gray-900 dark:text-white">{media.size}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                <span className="font-medium text-gray-900 dark:text-white">{media.dimensions}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                <Badge variant="outline">{media.category}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Usage Statistics */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Usage Statistics</h3>
            
            <div className="grid gap-3">
              <div className="flex items-center space-x-2 text-sm">
                <Eye className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Used</span>
                <span className="font-medium text-gray-900 dark:text-white">{media.usage} times</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Last used</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(media.lastUsed)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Uploaded by</span>
                <span className="font-medium text-gray-900 dark:text-white">{media.uploadedBy}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Upload date</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(media.uploadedAt)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-gray-900 dark:text-white">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {media.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* SEO Information */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">SEO & Accessibility</h3>
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">Alt Text:</span>
              <p className="mt-1 text-gray-900 dark:text-white">{media.alt || 'No alt text provided'}</p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Share2 className="h-4 w-4 mr-2" />
              Share Media
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
              <X className="h-4 w-4 mr-2" />
              Delete Media
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Settings className="h-5 w-5" />
              <span>Edit Media Details</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 dark:text-white">
                File Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter file name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt" className="text-gray-900 dark:text-white">
                Alt Text (for accessibility)
              </Label>
              <Textarea
                id="alt"
                value={editForm.alt}
                onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                placeholder="Describe this image for screen readers"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-900 dark:text-white">
                Category
              </Label>
              <Input
                id="category"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                placeholder="Enter category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gray-900 dark:text-white">
                Tags
              </Label>
              <Input
                id="tags"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="Enter tags separated by commas"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Separate multiple tags with commas
              </p>
            </div>
          </div>

          <DialogFooter className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveChanges}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}