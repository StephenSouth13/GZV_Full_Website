"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthAccessLayout } from "@/components/auth/AuthAccessLayout"
import { defaultAuthSettings, loadAuthPageSettings, type AuthPageSettings } from "@/lib/auth-page-settings"
import { supabase } from "@/lib/api-supabase"

export default function ForgotPasswordPage() {
  const [settings, setSettings] = useState<AuthPageSettings>(defaultAuthSettings["forgot-password"])
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadAuthPageSettings("forgot-password").then(setSettings)
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })

      if (resetError) throw resetError
      setMessage("Nếu email tồn tại trong hệ thống, GZV đã gửi hướng dẫn đặt lại mật khẩu.")
    } catch (err: any) {
      setError(err?.message || "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthAccessLayout settings={settings}>
      {message ? (
        <Alert className="mb-5 rounded-none border-emerald-200 bg-emerald-50 text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive" className="mb-5 rounded-none">
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

        <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-none bg-[#ed1c24] font-black uppercase text-white hover:bg-[#c91218]">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
          {isLoading ? "Đang gửi..." : settings.submit_label}
        </Button>
      </form>
    </AuthAccessLayout>
  )
}
