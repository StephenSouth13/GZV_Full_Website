"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Trash2, BookOpen, Users, Star } from 'lucide-react'

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  category: 'frontend' | 'backend' | 'fullstack' | 'data' | 'design'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'published' | 'draft' | 'review'
  price: number
  duration: string
  students: number
  rating: number
  createdAt: string
  updatedAt: string
}

interface DeleteCourseModalProps {
  course: Course
  isOpen: boolean
  onClose: () => void
  onDeleteCourse: (courseId: number) => void
}

export function DeleteCourseModal({ course, isOpen, onClose, onDeleteCourse }: DeleteCourseModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      onDeleteCourse(course.id)
      onClose()
    } catch (error) {
      console.error('Error deleting course:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      frontend: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      backend: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      fullstack: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      data: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      design: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    }
    return (
      <Badge className={categoryColors[category as keyof typeof categoryColors]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Published</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Draft</Badge>
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">In Review</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Delete Course</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            This action cannot be undone. This will permanently delete the course and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800 dark:text-red-300">
                <p className="font-medium mb-2">You are about to permanently delete:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">{course.title}</span>
                  </div>
                  <p className="text-sm">by {course.instructor}</p>
                  <div className="flex items-center space-x-2">
                    {getCategoryBadge(course.category)}
                    {getStatusBadge(course.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Impact of deletion:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span><strong>{course.students.toLocaleString()}</strong> enrolled students will lose access</span>
              </li>
              <li className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>All course ratings and reviews will be removed</span>
              </li>
              <li>• Course content and materials will be permanently deleted</li>
              <li>• Student progress and certificates will be lost</li>
              <li>• Purchase history will remain but course access will be revoked</li>
            </ul>
          </div>

          {course.status === 'published' && course.students > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                  Warning: This is a published course with active students. Consider archiving instead.
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3">
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Course Details:</p>
              <div className="grid grid-cols-2 gap-2">
                <span>Duration: {course.duration}</span>
                <span>Price: ${course.price}</span>
                <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                <span>Rating: {course.rating > 0 ? course.rating.toFixed(1) : 'No ratings'}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>Deleting...</>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Course
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}