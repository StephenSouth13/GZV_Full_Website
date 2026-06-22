"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
})

type LoginForm = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        setError('Email hoặc mật khẩu không đúng')
        return
      }

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              role: 'collab'
            })

          if (insertError) {
            console.error('Error creating profile:', insertError)
            setError('Có lỗi xảy ra khi tạo profile người dùng')
            return
          }
          
          localStorage.setItem('user_role', 'collab')
        } else {
          localStorage.setItem('user_role', profile.role || 'collab')
        }
        
        router.push('/admin/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Có lỗi xảy ra trong quá trình đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  const floatingVariants = {
    floating: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ 
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [100, 0, 100],
          y: [50, 0, 50],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-blue-500/20 rounded-full blur-3xl"
      />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      {/* Radial gradient */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-900/50 to-slate-900" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Glowing background card */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 rounded-3xl blur-2xl opacity-75" />

        {/* Main card */}
        <motion.div
          variants={itemVariants}
          className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl shadow-2xl overflow-hidden group hover:border-white/30 transition-all duration-300"
        >
          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-r from-primary-500/50 via-accent-500/50 to-primary-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-px rounded-3xl bg-gradient-to-br from-white/10 to-white/5" />

          {/* Content */}
          <div className="relative px-8 py-12 space-y-8">
            {/* Header with animated icon */}
            <motion.div
              variants={itemVariants}
              className="space-y-4 text-center"
            >
              <motion.div
                variants={floatingVariants}
                animate="floating"
                className="flex justify-center"
              >
                <div className="relative">
                  {/* Icon glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-xl opacity-75" />
                  
                  {/* Icon container */}
                  <div className="relative p-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-2xl border border-primary-400/50">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
              </motion.div>

              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  Cổng Quản Trị MSC
                </h1>
                <p className="text-white/60 text-sm font-medium tracking-wide">
                  Đăng nhập để truy cập hệ thống quản lý
                </p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.form
              variants={itemVariants}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Email Field */}
              <motion.div
                variants={itemVariants}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-white/90 font-semibold text-sm block">
                  Email
                </Label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-500 to-accent-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin_msc@gmail.com"
                    {...form.register('email')}
                    className="pl-4 pr-10 h-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                  />
                </div>
                {form.formState.errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 font-medium"
                  >
                    {form.formState.errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                variants={itemVariants}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-white/90 font-semibold text-sm block">
                  Mật Khẩu
                </Label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-500 to-accent-500 rounded-l-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-white/40 pointer-events-none" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...form.register('password')}
                    className="pl-4 pr-14 h-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all duration-300 backdrop-blur-sm hover:bg-white/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 font-medium"
                  >
                    {form.formState.errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 backdrop-blur-sm"
                >
                  <p className="text-sm text-red-300 font-medium">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                variants={itemVariants}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary-500/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed border border-primary-400/50 hover:border-primary-300/50"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-5 w-5" />
                      <span>Đang đăng nhập...</span>
                    </motion.div>
                  ) : (
                    <span>Đăng Nhập</span>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="pt-6 border-t border-white/10"
            >
              <p className="text-center text-white/50 text-xs font-medium">
                Hệ thống quản trị an toàn với xác thực đa tầng
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-full blur-2xl opacity-50"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-full blur-2xl opacity-50"
        />
      </motion.div>
    </div>
  )
}
