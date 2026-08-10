"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthAccessLayout } from "@/components/auth/AuthAccessLayout"
import { useAuth } from "@/contexts/auth-context"
import { defaultAuthSettings, loadAuthPageSettings, type AuthPageSettings } from "@/lib/auth-page-settings"

const SearchParamsHandler = dynamic(() => import("./search-params-handler"), { ssr: false })

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [settings, setSettings] = useState<AuthPageSettings>(defaultAuthSettings.login)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadAuthPageSettings("login").then(setSettings)
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(email, password)
      if (result.success) {
        router.push("/student")
      } else {
        setError(result.message || "Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Đã xảy ra lỗi không mong muốn.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SearchParamsHandler />
      <AuthAccessLayout settings={settings}>
        {error ? (
          <Alert variant="destructive" className="mb-5 rounded-none">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your.email@example.com"
                className="h-12 rounded-none pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-12 rounded-none pl-10 pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input type="checkbox" className="h-4 w-4 accent-[#ed1c24]" disabled={isLoading} />
              Ghi nhớ đăng nhập
            </label>
            <Link href="/forgot-password" className="text-sm font-black text-[#ed1c24] hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-none bg-[#ed1c24] font-black uppercase text-white hover:bg-[#c91218]">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            {isLoading ? "Đang đăng nhập..." : settings.submit_label}
          </Button>
        </form>
      </AuthAccessLayout>
    </>
  )
}
