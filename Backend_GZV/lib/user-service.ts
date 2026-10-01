import { supabase } from './supabase'

export interface UserProfile {
  id: string
  email: string
  full_name: string // Theo cấu trúc bảng profiles
  role: 'admin' | 'editor' | 'collab' | 'user' // Hỗ trợ cả editor và collab
  status: 'active' | 'suspended'
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at?: string
  last_sign_in_at?: string
  // Stats - sẽ được tính từ các bảng khác hoặc mặc định
  courses_count?: number
  projects_count?: number
}

export interface UserProfileCreate {
  email: string
  full_name: string // Thay đổi từ 'name' thành 'full_name'
  role?: 'admin' | 'editor' | 'collab' | 'user' // Hỗ trợ cả editor và collab
  status?: 'active' | 'suspended'
  avatar_url?: string
  phone?: string
}

export class UserService {
  private static async adminRequest(path: string, init: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Phiên đăng nhập admin đã hết hạn')
    const response = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, ...(init.headers || {}) },
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Thao tác quản trị thất bại')
    return body
  }

  // Lấy tất cả người dùng với thông tin từ auth.users và profiles
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const result = await this.adminRequest('/api/admin/users')
      return (result.users || []) as UserProfile[]
      /* Legacy fallback below is retained only for source compatibility. */
      console.log('🔍 Bắt đầu lấy dữ liệu người dùng từ Supabase...')
      
      // Lấy dữ liệu từ bảng profiles (theo cấu trúc thực tế)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, created_at, phone')
        .order('created_at', { ascending: false })
      const profileRows = profiles || []

      console.log('📋 Dữ liệu từ bảng profiles:', profiles)
      console.log('❌ Lỗi profiles (nếu có):', profilesError)

      // Luôn cố gắng lấy auth users để có email
      let authUsers = null
      let authError = null

      try {
        const authResult = await supabase.auth.admin.listUsers()
        authUsers = authResult.data
        authError = authResult.error
        console.log('👥 Dữ liệu từ auth.users:', authUsers?.users?.length || 0, 'users')
        console.log('❌ Lỗi auth (nếu có):', authError)
      } catch (adminError) {
        console.log('⚠️ Admin API không khả dụng:', adminError)
        authError = adminError
      }

      // Nếu có cả profiles và auth users, kết hợp chúng
      if (profileRows.length > 0 && authUsers?.users) {
        console.log('🔄 Kết hợp dữ liệu từ profiles và auth.users...')
        
        const combinedUsers: UserProfile[] = profileRows.map(profile => {
          const authUser = authUsers.users.find((au: any) => au.id === profile.id)
          
          const user: UserProfile = {
            id: profile.id,
            email: authUser?.email || 'email@example.com',
            full_name: profile.full_name || 'Người dùng chưa đặt tên',
            role: (profile.role as 'admin' | 'editor' | 'collab' | 'user') || 'user',
            status: 'active' as 'active' | 'suspended',
            avatar_url: profile.avatar_url,
            phone: profile.phone,
            created_at: profile.created_at || authUser?.created_at,
            updated_at: authUser?.updated_at,
            last_sign_in_at: authUser?.last_sign_in_at,
            courses_count: 0,
            projects_count: 0,
          }
          
          console.log('👤 Người dùng được tạo:', user.full_name, '|', user.email, '|', user.role)
          return user
        })
        
        console.log('✅ Kết quả cuối cùng:', combinedUsers.length, 'người dùng')
        return combinedUsers
      }
      
      // Nếu chỉ có profiles (không có auth users)
      if (profileRows.length > 0) {
        console.log('📋 Chỉ sử dụng dữ liệu profiles...')
        const profilesOnly: UserProfile[] = profileRows.map(profile => ({
          id: profile.id,
          email: 'email@example.com', // Không có email trong profiles
          full_name: profile.full_name || 'Người dùng chưa đặt tên',
          role: (profile.role as 'admin' | 'editor' | 'collab' | 'user') || 'user',
          status: 'active' as 'active' | 'suspended',
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          created_at: profile.created_at,
          courses_count: 0,
          projects_count: 0,
        }))
        return profilesOnly
      }

      // Nếu không có auth users nhưng có thể lấy từ auth, thử lấy tất cả auth users
      if (authUsers?.users && authUsers.users.length > 0) {
        console.log('👥 Chỉ sử dụng dữ liệu auth.users...')
        const authOnlyUsers: UserProfile[] = authUsers.users.map((authUser: any) => ({
          id: authUser.id,
          email: authUser.email || 'email@example.com',
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Người dùng chưa đặt tên',
          role: (authUser.user_metadata?.role as 'admin' | 'editor' | 'collab' | 'user') || 'user',
          status: 'active' as 'active' | 'suspended',
          avatar_url: authUser.user_metadata?.avatar_url,
          phone: authUser.phone,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at,
          last_sign_in_at: authUser.last_sign_in_at,
          courses_count: 0,
          projects_count: 0,
        }))
        return authOnlyUsers
      }

      console.log('❌ Không có dữ liệu người dùng nào được tìm thấy')
      return []
    } catch (error) {
      console.error('❌ Lỗi khi lấy dữ liệu người dùng:', error)
      return []
    }
  }

  // Tạo người dùng mới
  static async createUser(userData: UserProfileCreate): Promise<UserProfile | null> {
    try {
      const result = await this.adminRequest('/api/admin/users', { method: 'POST', body: JSON.stringify(userData) })
      return result.user as UserProfile
      /* Legacy browser admin API below is unreachable and must never be used. */
      // Tạo user trong auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: 'TempPassword123!', // Temporary password
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Không tạo được tài khoản auth')
      const createdAuthUser = authData.user!

      // Tạo profile record theo cấu trúc bảng thực tế
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: createdAuthUser.id,
            full_name: userData.full_name,
            role: userData.role || 'user',
            avatar_url: userData.avatar_url,
            phone: userData.phone,
          }
        ])
        .select()
        .single()

      if (profileError) {
        console.warn('Không thể tạo profile:', profileError)
      }

      return {
        id: createdAuthUser.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role || 'user',
        status: 'active' as 'active' | 'suspended', // Mặc định active
        avatar_url: userData.avatar_url,
        phone: userData.phone,
        created_at: createdAuthUser.created_at,
        courses_count: 0,
        projects_count: 0,
      }
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }

  // Cập nhật thông tin người dùng
  static async updateUser(userId: string, updates: Partial<UserProfileCreate>): Promise<boolean> {
    try {
      await this.adminRequest('/api/admin/users', { method: 'PATCH', body: JSON.stringify({ id: userId, ...updates }) })
      return true
      /* Legacy browser admin API below is unreachable and must never be used. */
      // Cập nhật auth.users metadata nếu cần
      if (updates.full_name) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          userId,
          { 
            user_metadata: { full_name: updates.full_name }
          }
        )
        if (authError) console.warn('Không thể cập nhật auth metadata:', authError)
      }

      // Cập nhật profiles (chỉ những field có trong bảng profiles)
      const profileUpdates: any = {}
      if (updates.full_name) profileUpdates.full_name = updates.full_name
      if (updates.role) profileUpdates.role = updates.role
      if (updates.avatar_url !== undefined) profileUpdates.avatar_url = updates.avatar_url
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)

      if (profileError) throw profileError

      return true
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }

  // Xóa người dùng
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.adminRequest('/api/admin/users', { method: 'DELETE', body: JSON.stringify({ id: userId }) })
      return true
      /* Legacy browser admin API below is unreachable and must never be used. */
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  // Toggle user status (chỉ có thể banned/unban qua auth API)
  static async toggleUserStatus(userId: string, shouldSuspend: boolean): Promise<boolean> {
    try {
      await this.adminRequest('/api/admin/users', { method: 'PATCH', body: JSON.stringify({ id: userId, status: shouldSuspend ? 'suspended' : 'active' }) })
      return true
      /* Legacy browser admin API below is unreachable and must never be used. */
      // Supabase auth API không có trường ban_duration như mong đợi
      // Thay vào đó, chúng ta có thể sử dụng user_metadata để lưu status
      const { error } = await supabase.auth.admin.updateUserById(
        userId, 
        { 
          user_metadata: { status: shouldSuspend ? 'suspended' : 'active' },
          ban_duration: shouldSuspend ? '876000h' : 'none' // Tạm thời banned 100 năm hoặc unban
        }
      )
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error toggling user status:', error)
      return false
    }
  }
}
