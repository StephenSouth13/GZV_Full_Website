"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Phone, Eye, EyeOff, Facebook, Chrome, ArrowRight, Shield, CheckCircle, Star, Loader2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
// SỬA LỖI: Import đúng authAPI từ lib
import { authAPI, type RegisterData } from "@/lib/api-supabase"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Partial<RegisterData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev: RegisterData) => {
      const updated = { ...prev, [field]: value }
      if (field === 'fullName') updated.name = value
      if (field === 'name') updated.fullName = value
      return updated
    })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      // SỬA LỖI: Gọi đúng hàm authAPI.register
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        fullName: formData.fullName,
        phone: formData.phone
      })
      
      if (response.success) {
        toast.success('Đăng ký thành công!', {
          description: 'Chào mừng bạn đến với gzv Center. Đang chuyển đến trang đăng nhập...'
        })
        
        setTimeout(() => {
          router.push('/login?message=registration-success')
        }, 1000)
      } else {
        const errorMessage = response.error || 'Có lỗi xảy ra khi đăng ký'
        toast.error('Đăng ký thất bại', { description: errorMessage })

        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('already')) {
          setErrors({ email: 'Email này đã được đăng ký' })
        }
      }
      
    } catch (error: any) {
      console.error('Lỗi đăng ký:', error)
      toast.error('Đăng ký thất bại', {
        description: 'Lỗi kết nối đến server. Vui lòng kiểm tra lại.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative min-h-screen flex">
        {/* Left Side - Benefits */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-teal-600 via-teal-700 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10" />
          <div className="relative flex flex-col justify-center p-12 text-white">
            <div className="max-w-md">
              <h2 className="text-4xl font-bold mb-6 italic font-serif">Bắt đầu hành trình thành công</h2>
              <p className="text-xl text-teal-100 mb-8 leading-relaxed">
                Tham gia gzv Center và trở thành phiên bản tốt nhất của chính mình.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Miễn phí 3 bài học đầu</h3>
                    <p className="text-teal-100 text-sm opacity-80">Trải nghiệm chất lượng trước khi quyết định</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Mentorship 1-1</h3>
                    <p className="text-teal-100 text-sm opacity-80">Hướng dẫn bởi chuyên gia hàng đầu</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Cam kết chất lượng</h3>
                    <p className="text-teal-100 text-sm opacity-80">Đảm bảo hiệu quả đào tạo tối ưu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <Link href="/" className="inline-block">
                <span className="text-3xl font-black bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent uppercase tracking-tighter">
                  gzv Center
                </span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Tạo tài khoản mới</h1>
            </div>

            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-center text-teal-600 uppercase">Đăng ký</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Họ tên */}
                  <div className="space-y-1">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Họ và tên"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`pl-10 h-12 rounded-xl bg-white/50 ${errors.fullName ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email của bạn"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 h-12 rounded-xl bg-white/50 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="Số điện thoại"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`pl-10 h-12 rounded-xl bg-white/50 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                  </div>

                  {/* Mật khẩu */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 h-12 rounded-xl bg-white/50 ${errors.password ? 'border-red-500' : ''}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Xác nhận mật khẩu"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 h-12 rounded-xl bg-white/50 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl shadow-lg font-bold">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                  </Button>
                </form>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Hoặc</span></div>
                </div>

                <div className="space-y-3">
                  <Link href="https://gzver.gzv.one/" target="_blank" className="w-full block">
                    <Button variant="outline" className="w-full h-12 rounded-xl border-blue-100 hover:bg-blue-50">
                      <Building2 className="h-5 w-5 mr-2 text-blue-700" />
                      Hệ thống nội bộ HRM
                    </Button>
                  </Link>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-11 rounded-xl">
                      <Facebook className="h-5 w-5 mr-2 text-blue-600" /> Facebook
                    </Button>
                    <Button variant="outline" className="h-11 rounded-xl">
                      <Chrome className="h-5 w-5 mr-2 text-red-500" /> Google
                    </Button>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Đã có tài khoản? <Link href="/login" className="text-teal-600 font-bold hover:underline">Đăng nhập</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}