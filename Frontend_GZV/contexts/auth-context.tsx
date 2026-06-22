"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserData, authAPI } from '@/lib/api-supabase';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuthStatus = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔑 AuthContext: Attempting login for:', email);
      const response = await authAPI.login(email, password);
      
      console.log('🔑 AuthContext: Raw login response:', response);
      console.log('🔑 AuthContext: Response structure check:', {
        hasResponse: !!response,
        isSuccess: response?.success,
        hasData: !!response?.data,
        hasUser: !!response?.data?.user,
        userType: typeof response?.data?.user,
        userId: response?.data?.user?.id,
        userEmail: response?.data?.user?.email
      });
      
      if (response.success && response.data?.user) {
        console.log('🔑 AuthContext: Login successful, processing user data...');
        console.log('🔑 AuthContext: User data from response:', response.data.user);
        
        // Create userData from response, handling both auth and users table data
        const userData: UserData = {
          id: response.data.user.id,
          email: response.data.user.email || '',
          name: response.data.user.user_metadata?.full_name || response.data.user.email || 'Người dùng',
          fullName: response.data.user.user_metadata?.full_name || response.data.user.email || 'Người dùng',
          avatar: (response.data.user.user_metadata as any)?.avatar_url,
          phone: (response.data.user.user_metadata as any)?.phone,
          university: (response.data.user.user_metadata as any)?.university,
          major: (response.data.user.user_metadata as any)?.major
        };
        
        // If we have additional userData from users table (when using direct table login)
        if ((response.data as any).userData) {
          console.log('🔑 AuthContext: Found users table data, enhancing user info...');
          const userTableData = (response.data as any).userData;
          userData.id = userTableData.id || userData.id;
          userData.name = userTableData.name || userData.name;
          userData.fullName = userTableData.fullName || userData.fullName;
          userData.avatar = userTableData.avatar || userData.avatar;
          userData.phone = userTableData.phone || userData.phone;
          userData.university = userTableData.university || userData.university;
          userData.major = userTableData.major || userData.major;
          userData.role = userTableData.role;
          userData.status = userTableData.status;
        }
        
        console.log('🔑 AuthContext: Final processed user data:', userData);
        
        setUser(userData);
        console.log('🔑 AuthContext: User state updated successfully');
        return { success: true, message: 'Đăng nhập thành công' };
      } else {
        console.log('🔑 AuthContext: Login failed. Response details:', {
          success: response.success,
          hasData: !!response.data,
          hasUser: !!response.data?.user,
          error: (response as any).error,
          message: (response as any).message
        });
        return { 
          success: false, 
          message: (response as any).error || (response as any).message || 'Đăng nhập thất bại' 
        };
      }
    } catch (error) {
      console.error('🔑 AuthContext: Exception during login:', error);
      return { success: false, message: 'Lỗi kết nối đến server' };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
