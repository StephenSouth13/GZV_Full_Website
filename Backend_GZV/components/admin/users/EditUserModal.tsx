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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Edit3 } from 'lucide-react'

const editUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'editor', 'user'], {
    required_error: 'Please select a role',
  }),
  status: z.enum(['active', 'suspended'], {
    required_error: 'Please select a status',
  }),
})

type EditUserFormData = z.infer<typeof editUserSchema>

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'editor' | 'user'
  status: 'active' | 'suspended'
  joinDate: string
  lastLogin: string
  courses: number
  projects: number
}

interface EditUserModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onUpdateUser: (userData: User) => void
}

export function EditUserModal({ user, isOpen, onClose, onUpdateUser }: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  })

  // Update form when user changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      })
    }
  }, [user, reset])

  const onSubmit = async (data: EditUserFormData) => {
    setIsSubmitting(true)
    try {
      const updatedUser = {
        ...user,
        ...data,
      }
      onUpdateUser(updatedUser)
      onClose()
    } catch (error) {
      console.error('Error updating user:', error)
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
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Edit3 className="h-5 w-5" />
            <span>Edit User</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900 dark:text-white">
              Full Name
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter full name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-900 dark:text-white">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-900 dark:text-white">
              Role
            </Label>
            <Select 
              onValueChange={(value) => setValue('role', value as any)}
              defaultValue={user.role}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-900 dark:text-white">
              Status
            </Label>
            <Select 
              onValueChange={(value) => setValue('status', value as any)}
              defaultValue={user.status}
            >
              <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">User ID:</span> #{user.id}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Joined:</span> {new Date(user.joinDate).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Activity:</span> {user.courses} courses, {user.projects} projects
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
                  Update User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}