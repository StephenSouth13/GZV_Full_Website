"use client"

import { useState } from 'react'
import { UserService, UserProfileCreate } from '@/lib/user-service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { toast } from '@/hooks/use-toast'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onCreateUser: (user: any) => void
}

export function CreateUserModal({ open, onClose, onCreateUser }: CreateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'user' as 'admin' | 'editor' | 'user',
    status: 'active' as 'active' | 'suspended',
    phone: '',
    bio: '',
    avatar_url: '',
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ email",
        variant: "destructive"
      })
      return false
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "Lỗi",
        description: "Địa chỉ email không hợp lệ",
        variant: "destructive"
      })
      return false
    }
    
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên người dùng",
        variant: "destructive"
      })
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const userData: UserProfileCreate = {
        email: formData.email.trim(),
        full_name: formData.name.trim(),
        role: formData.role,
        status: formData.status,
        phone: formData.phone.trim() || undefined,
        //bio: formData.bio.trim() || undefined,
        avatar_url: formData.avatar_url.trim() || undefined,
      }
      
      const newUser = await UserService.createUser(userData)
      
      if (newUser) {
        toast({
          title: "Thành công",
          description: "Người dùng đã được tạo thành công",
        })
        onCreateUser(newUser)
        onClose()
        resetForm()
      } else {
        throw new Error('Không thể tạo người dùng')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo người dùng. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'user',
      status: 'active',
      phone: '',
      bio: '',
      avatar_url: '',
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
          <DialogDescription>
            Tạo tài khoản người dùng mới trong hệ thống. Mật khẩu tạm thời sẽ được gửi qua email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Tên đầy đủ *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nguyễn Văn An"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="0901234567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Mô tả</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Thông tin mô tả về người dùng"
                rows={3}
              />
            </div>
          </div>

          {/* Role & Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quyền hạn & Trạng thái</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select value={formData.role} onValueChange={(value: 'admin' | 'editor' | 'user') => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="editor">Biên tập viên</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'suspended') => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="suspended">Tạm khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Avatar</h3>
            
            <div className="space-y-2">
              <Label htmlFor="avatar_url">URL Avatar</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Đang tạo...' : 'Tạo người dùng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}