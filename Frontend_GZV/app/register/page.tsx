"use client"

import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthAccessLayout } from "@/components/auth/AuthAccessLayout"
import { authAPI, type RegisterData } from "@/lib/api-supabase"
import { defaultAuthSettings, loadAuthPageSettings, type AuthPageSettings } from "@/lib/auth-page-settings"

export default function RegisterPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<AuthPageSettings>(defaultAuthSettings.register)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Partial<RegisterData>>({})

  useEffect(() => {
    loadAuthPageSettings("register").then(setSettings)
  }, [])

  const validateForm = () => {
    const nextErrors: Partial<RegisterData> = {}

    if (!formData.fullName.trim()) nextErrors.fullName = "Vui lòng nhập họ và tên."
    if (!formData.email.trim()) nextErrors.email = "Vui lòng nhập email."
    else if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = "Email không hợp lệ."
    if (!formData.phone?.trim()) nextErrors.phone = "Vui lòng nhập số điện thoại."
    else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) nextErrors.phone = "Số điện thoại không hợp lệ."
    if (!formData.password) nextErrors.password = "Vui lòng nhập mật khẩu."
    else if (formData.password.length < 6) nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự."
    if (!formData.confirmPassword) nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu."
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp."

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "fullName") next.name = value
      if (field === "name") next.fullName = value
      return next
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        fullName: formData.fullName,
        phone: formData.phone,
      })

      if (response.success) {
        toast.success("Đăng ký thành công!", {
          description: "Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ.",
        })
        router.push("/login?message=registration-success")
        return
      }

      const errorMessage = response.error || "Có lỗi xảy ra khi đăng ký."
      toast.error("Đăng ký thất bại", { description: errorMessage })
      if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("already")) {
        setErrors({ email: "Email này đã được đăng ký." })
      }
    } catch (error) {
      console.error("Register error:", error)
      toast.error("Đăng ký thất bại", {
        description: "Lỗi kết nối đến server. Vui lòng thử lại.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthAccessLayout settings={settings}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput icon={<User className="h-5 w-5" />} label="Họ và tên" value={formData.fullName} error={errors.fullName} onChange={(value) => handleInputChange("fullName", value)} disabled={isLoading} />
        <TextInput icon={<Mail className="h-5 w-5" />} label="Email" type="email" value={formData.email} error={errors.email} onChange={(value) => handleInputChange("email", value)} disabled={isLoading} />
        <TextInput icon={<Phone className="h-5 w-5" />} label="Số điện thoại" type="tel" value={formData.phone || ""} error={errors.phone} onChange={(value) => handleInputChange("phone", value)} disabled={isLoading} />

        <PasswordInput label="Mật khẩu" value={formData.password} error={errors.password} show={showPassword} onToggle={() => setShowPassword((value) => !value)} onChange={(value) => handleInputChange("password", value)} disabled={isLoading} />
        <PasswordInput label="Xác nhận mật khẩu" value={formData.confirmPassword || ""} error={errors.confirmPassword} show={showConfirmPassword} onToggle={() => setShowConfirmPassword((value) => !value)} onChange={(value) => handleInputChange("confirmPassword", value)} disabled={isLoading} />

        <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-none bg-[#ed1c24] font-black uppercase text-white hover:bg-[#c91218]">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
          {isLoading ? "Đang xử lý..." : settings.submit_label}
        </Button>
      </form>
    </AuthAccessLayout>
  )
}

function TextInput({ label, value, onChange, error, disabled, type = "text", icon }: { label: string; value: string; onChange: (value: string) => void; error?: string; disabled?: boolean; type?: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`h-12 rounded-none pl-10 ${error ? "border-[#ed1c24]" : ""}`} disabled={disabled} />
      </div>
      {error ? <p className="text-xs font-bold text-[#ed1c24]">{error}</p> : null}
    </div>
  )
}

function PasswordInput({ label, value, onChange, error, disabled, show, onToggle }: { label: string; value: string; onChange: (value: string) => void; error?: string; disabled?: boolean; show: boolean; onToggle: () => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} className={`h-12 rounded-none pl-10 pr-10 ${error ? "border-[#ed1c24]" : ""}`} disabled={disabled} />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" disabled={disabled}>
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error ? <p className="text-xs font-bold text-[#ed1c24]">{error}</p> : null}
    </div>
  )
}
