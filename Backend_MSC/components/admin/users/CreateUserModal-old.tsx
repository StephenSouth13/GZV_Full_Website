"use client"

import { useState } from 'react'
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
import { Plus, User } from 'lucide-react'

const createUserSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Vui lòng nhập email hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['admin', 'collab', 'user'], {
    required_error: 'Vui lòng chọn vai trò',
  }),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateUser: (userData: CreateUserFormData & { password: string }) => void
}

export function CreateUserModal({ isOpen, onClose, onCreateUser }: CreateUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      status: 'active',
      role: 'user',
    },
  })

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true)
    try {
      onCreateUser(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Error creating user:', error)
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
            <User className="h-5 w-5" />
            <span>Create New User</span>
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
            <Select onValueChange={(value) => setValue('role', value as any)}>
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
            <Select onValueChange={(value) => setValue('status', value as any)} defaultValue="active">
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
                <>Creating...</>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}