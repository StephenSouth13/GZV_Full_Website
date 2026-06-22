"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Edit3 } from 'lucide-react'

const editCourseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  instructor: z.string().min(2, 'Instructor name is required'),
  category: z.enum(['frontend', 'backend', 'fullstack', 'data', 'design'], {
    required_error: 'Please select a category',
  }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select a difficulty level',
  }),
  status: z.enum(['published', 'draft', 'review'], {
    required_error: 'Please select a status',
  }),
  price: z.number().min(0, 'Price must be 0 or greater'),
  duration: z.string().min(1, 'Duration is required'),
})

type EditCourseFormData = z.infer<typeof editCourseSchema>

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

interface EditCourseModalProps {
  course: Course
  isOpen: boolean
  onClose: () => void
  onUpdateCourse: (courseData: Course) => void
}

export function EditCourseModal({ course, isOpen, onClose, onUpdateCourse }: EditCourseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditCourseFormData>({
    resolver: zodResolver(editCourseSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      category: course.category,
      difficulty: course.difficulty,
      status: course.status,
      price: course.price,
      duration: course.duration,
    },
  })

  // Update form when course changes
  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        category: course.category,
        difficulty: course.difficulty,
        status: course.status,
        price: course.price,
        duration: course.duration,
      })
    }
  }, [course, reset])

  const onSubmit = async (data: EditCourseFormData) => {
    setIsSubmitting(true)
    try {
      const updatedCourse = {
        ...course,
        ...data,
      }
      onUpdateCourse(updatedCourse)
      onClose()
    } catch (error) {
      console.error('Error updating course:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Edit3 className="h-5 w-5" />
            <span>Edit Course</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title" className="text-gray-900 dark:text-white">
                Course Title
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter course title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-gray-900 dark:text-white">
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter course description"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor" className="text-gray-900 dark:text-white">
                Instructor
              </Label>
              <Input
                id="instructor"
                {...register('instructor')}
                placeholder="Instructor name"
                className={errors.instructor ? 'border-red-500' : ''}
              />
              {errors.instructor && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.instructor.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-gray-900 dark:text-white">
                Duration
              </Label>
              <Input
                id="duration"
                {...register('duration')}
                placeholder="e.g., 8 weeks, 3 months"
                className={errors.duration ? 'border-red-500' : ''}
              />
              {errors.duration && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.duration.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-900 dark:text-white">
                Category
              </Label>
              <Select 
                onValueChange={(value) => setValue('category', value as any)}
                defaultValue={course.category}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="fullstack">Full Stack</SelectItem>
                  <SelectItem value="data">Data Science</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-gray-900 dark:text-white">
                Difficulty Level
              </Label>
              <Select 
                onValueChange={(value) => setValue('difficulty', value as any)}
                defaultValue={course.difficulty}
              >
                <SelectTrigger className={errors.difficulty ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {errors.difficulty && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.difficulty.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-900 dark:text-white">
                Price ($)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-900 dark:text-white">
                Status
              </Label>
              <Select 
                onValueChange={(value) => setValue('status', value as any)}
                defaultValue={course.status}
              >
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Course ID:</span> #{course.id}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Created:</span> {new Date(course.createdAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Students:</span> {course.students.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Rating:</span> {course.rating > 0 ? course.rating.toFixed(1) : 'No ratings yet'}
            </div>
          </div>

          <DialogFooter className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {isSubmitting ? (
                <>Updating...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Course
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}