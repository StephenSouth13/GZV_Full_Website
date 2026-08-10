"use client"

import { useState, useEffect } from 'react'
import { UserProfile, UserService } from '@/lib/user-service'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { CreateUserModal } from '@/components/admin/users/CreateUserModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Users, Edit, Trash2, UserCheck, UserX, User } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

function UsersManagementContent() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Load users from Supabase
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Bắt đầu tải danh sách người dùng...')
      const data = await UserService.getAllUsers()
      console.log('✅ Đã tải được dữ liệu người dùng:', data)
      
      // Kiểm tra từng user
      data.forEach((user, index) => {
        console.log(`👤 Người dùng ${index + 1}:`, {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          status: user.status
        })
      })
      
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error('❌ Lỗi khi tải danh sách người dùng:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const handleCreateUser = (newUser: UserProfile) => {
    setUsers(prev => [newUser, ...prev])
    setIsCreateModalOpen(false)
    toast({
      title: "Thành công",
      description: "Người dùng đã được tạo thành công",
    })
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const shouldSuspend = currentStatus === 'active'
      const success = await UserService.toggleUserStatus(userId, shouldSuspend)
      
      if (success) {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, status: shouldSuspend ? 'suspended' : 'active' }
            : user
        ))
        toast({
          title: "Thành công",
          description: `Người dùng đã được ${shouldSuspend ? 'tạm khóa' : 'kích hoạt'}`,
        })
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast({
        title: "Lỗi",
        description: "Không thể thay đổi trạng thái người dùng",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return
    
    try {
      const success = await UserService.deleteUser(userId)
      if (success) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        toast({
          title: "Thành công",
          description: "Người dùng đã được xóa",
        })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng",
        variant: "destructive"
      })
    }
  }

  const roleStats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    editor: users.filter(u => u.role === 'editor').length,
    collab: users.filter(u => u.role === 'collab').length,
    user: users.filter(u => u.role === 'user').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ed1c24] mx-auto"></div>
          <p className="text-gray-500">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý tài khoản người dùng, phân quyền và theo dõi hoạt động trên hệ thống.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{roleStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-[#ed1c24]" />
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Quản trị viên</p>
              <p className="text-xl font-bold text-red-600">{roleStats.admin}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Biên tập viên</p>
              <p className="text-xl font-bold text-green-600">{roleStats.editor}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Cộng tác viên</p>
              <p className="text-xl font-bold text-purple-600">{roleStats.collab}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Người dùng</p>
              <p className="text-xl font-bold text-[#ed1c24]">{roleStats.user}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</p>
              <p className="text-xl font-bold text-green-600">{roleStats.active}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Tạm khóa</p>
              <p className="text-xl font-bold text-red-600">{roleStats.suspended}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Danh bạ người dùng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{filteredUsers.length} người dùng</Badge>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Đăng nhập cuối</TableHead>
                  <TableHead>Khóa học</TableHead>
                  <TableHead>Dự án</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'editor' ? 'bg-green-100 text-green-800' :
                        user.role === 'collab' ? 'bg-purple-100 text-purple-800' : 
                        'bg-red-50 text-[#c91218]'
                      }>
                        {user.role === 'admin' ? 'Quản trị' :
                         user.role === 'editor' ? 'Biên tập' :
                         user.role === 'collab' ? 'Cộng tác viên' : 'Người dùng'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }>
                        {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                    <TableCell>{user.courses_count || 0}</TableCell>
                    <TableCell>{user.projects_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          className={`${user.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                        >
                          {user.status === 'active' ? 'Tạm khóa' : 'Kích hoạt'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateUser={handleCreateUser}
      />
    </div>
  )
}

export default function UsersManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <UsersManagementContent />
    </ProtectedRoute>
  )
}