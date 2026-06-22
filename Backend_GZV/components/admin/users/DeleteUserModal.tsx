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
import { AlertTriangle, Trash2 } from 'lucide-react'

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

interface DeleteUserModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onDeleteUser: (userId: number) => void
}

export function DeleteUserModal({ user, isOpen, onClose, onDeleteUser }: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      onDeleteUser(user.id)
      onClose()
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Admin</Badge>
      case 'editor':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Editor</Badge>
      default:
        return <Badge variant="outline">User</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Delete User</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            This action cannot be undone. This will permanently delete the user account and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800 dark:text-red-300">
                <p className="font-medium mb-1">You are about to permanently delete:</p>
                <div className="space-y-1">
                  <p><strong>{user.name}</strong> ({user.email})</p>
                  <div className="flex items-center space-x-2">
                    <span>Role:</span>
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Data that will be deleted:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• User profile and account information</li>
              <li>• {user.courses} associated course enrollments</li>
              <li>• {user.projects} project participations</li>
              <li>• All activity history and progress</li>
              <li>• Comments and contributions</li>
            </ul>
          </div>

          {user.role === 'admin' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                  Warning: You are deleting an admin user. Make sure there are other admins available.
                </p>
              </div>
            </div>
          )}
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
                Delete User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}