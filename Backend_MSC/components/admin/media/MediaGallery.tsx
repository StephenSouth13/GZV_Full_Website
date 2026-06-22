"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal,
  Image,
  Video,
  FileText,
  Music,
  Download,
  Edit,
  Trash2,
  Copy,
  Eye,
  ExternalLink
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

interface MediaGalleryProps {
  media: MediaItem[]
  viewMode: 'grid' | 'list'
  onSelectMedia: (media: MediaItem) => void
  selectedMedia: MediaItem | null
}

export function MediaGallery({ media, viewMode, onSelectMedia, selectedMedia }: MediaGalleryProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-green-600" />
      case 'video':
        return <Video className="h-5 w-5 text-purple-600" />
      case 'audio':
        return <Music className="h-5 w-5 text-pink-600" />
      case 'document':
        return <FileText className="h-5 w-5 text-orange-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const typeColors = {
      image: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      video: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      audio: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      document: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    }
    return (
      <Badge className={typeColors[type as keyof typeof typeColors]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    // You could add a toast notification here
  }

  if (viewMode === 'list') {
    return (
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            {media.map((item) => (
              <div
                key={item.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMedia?.id === item.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                }`}
                onClick={() => onSelectMedia(item)}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {item.type === 'image' ? (
                      <img
                        src={item.thumbnail}
                        alt={item.alt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getFileIcon(item.type)
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    {getTypeBadge(item.type)}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.size}</span>
                    <span>{item.dimensions}</span>
                    <span>Used {item.usage} times</span>
                    <span>Uploaded {formatDate(item.uploadedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
                      <DropdownMenuItem onClick={() => handleCopyUrl(item.url)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in New Tab
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {media.length === 0 && (
            <div className="text-center py-12">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No media files found.</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-lg border-2 cursor-pointer transition-all ${
                selectedMedia?.id === item.id
                  ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                  : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
              }`}
              onClick={() => onSelectMedia(item)}
            >
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                {item.type === 'image' ? (
                  <img
                    src={item.thumbnail}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getFileIcon(item.type)}
                    <div className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </div>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" className="mr-2">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="secondary">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
                        <DropdownMenuItem onClick={() => handleCopyUrl(item.url)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open in New Tab
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  {getTypeBadge(item.type)}
                </div>

                {/* Usage indicator */}
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-white/90 dark:bg-gray-800/90 text-xs">
                    {item.usage} uses
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>{item.size}</span>
                  <span>{item.dimensions}</span>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 2}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Uploaded {formatDate(item.uploadedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {media.length === 0 && (
          <div className="text-center py-12">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No media files found.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}