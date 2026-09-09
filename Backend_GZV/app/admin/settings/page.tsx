"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { ProtectedRoute } from "@/components/admin/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AlertCircle, Bell, Database, Eye, Globe, Lock, LogOut, Mail, MessageSquare, Palette, Save, Shield } from "lucide-react"
import { supabase } from "@/lib/supabase"

type AdminSettings = {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  securityAlerts: boolean
  activityLog: boolean
  publicProfile: boolean
  searchVisibility: boolean
  fontSize: "small" | "normal" | "large"
}

const defaultSettings: AdminSettings = {
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  marketingEmails: false,
  securityAlerts: true,
  activityLog: true,
  publicProfile: false,
  searchVisibility: true,
  fontSize: "normal",
}

const storageKey = (userId?: string) => `admin_settings_${userId || "guest"}`

function SettingsContent() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings)
  const [envStatus, setEnvStatus] = useState({ hasUrl: false, hasAnonKey: false })

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const savedSettings = localStorage.getItem(storageKey(session.user.id))
        if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
      }
      setEnvStatus({
        hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      })
    }
    getUser()
  }, [])

  const saveSettings = (next: AdminSettings) => {
    setSettings(next)
    localStorage.setItem(storageKey(user?.id), JSON.stringify(next))
  }

  const handleSettingChange = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    saveSettings({ ...settings, [key]: value })
    toast.success("Cài đặt đã được cập nhật")
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const formData = new FormData(e.target as HTMLFormElement)
      const newPassword = String(formData.get("newPassword") || "")
      const confirmPassword = String(formData.get("confirmPassword") || "")

      if (newPassword !== confirmPassword) {
        toast.error("Mật khẩu mới không trùng khớp")
        return
      }
      if (newPassword.length < 8) {
        toast.error("Mật khẩu phải có ít nhất 8 ký tự")
        return
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      toast.success("Mật khẩu đã được thay đổi")
      ;(e.target as HTMLFormElement).reset()
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi thay đổi mật khẩu")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutAllDevices = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut({ scope: "global" })
      localStorage.removeItem("user_role")
      toast.success("Đã đăng xuất khỏi tất cả các thiết bị")
      router.push("/admin-login")
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi đăng xuất")
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    const data = {
      exported_at: new Date().toISOString(),
      user: { id: user?.id, email: user?.email },
      settings,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "gzv-admin-settings.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const systemChecks = useMemo(() => [
    { label: "Supabase URL", ok: envStatus.hasUrl },
    { label: "Supabase anon key", ok: envStatus.hasAnonKey },
    { label: "Phiên đăng nhập", ok: Boolean(user?.id) },
    { label: "Lưu tùy chọn cục bộ", ok: typeof window !== "undefined" },
  ], [envStatus, user])

  return (
    <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">
      {/* Top Header Card */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 shrink-0 bg-[#ed1c24] text-white flex items-center justify-center font-black shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                SYSTEM CONFIGURATION
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                Cài Đặt Hệ Thống & Bảo Mật Admin
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Quản lý thông báo, đổi mật khẩu, cấu hình giao diện làm việc và kết nối Supabase.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Control Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tài Khoản</p>
            <p className="mt-2 text-xs font-black text-slate-950 dark:text-white truncate font-mono">{user?.email || "Admin"}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Chủ Đề</p>
            <p className="mt-2 text-xl font-black text-blue-600 dark:text-blue-400 uppercase">{theme || "system"}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Supabase API</p>
            <p className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400">{envStatus.hasUrl ? "ONLINE" : "OFFLINE"}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Bảo Mật</p>
            <p className="mt-2 text-xl font-black text-purple-600 dark:text-purple-400">ACTIVE</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-5 gap-1 border border-slate-200 bg-slate-100 p-1.5 rounded-none shadow-xs dark:border-white/10 dark:bg-slate-900">
          <TabsTrigger
            value="notifications"
            className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Bell className="h-3.5 w-3.5 shrink-0" /> Thông Báo
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Shield className="h-3.5 w-3.5 shrink-0" /> Bảo Mật
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Eye className="h-3.5 w-3.5 shrink-0" /> Riêng Tư
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Palette className="h-3.5 w-3.5 shrink-0" /> Giao Diện
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="rounded-none py-2.5 px-2 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-1.5"
          >
            <Database className="h-3.5 w-3.5 shrink-0" /> Hệ Thống
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <div className="border border-slate-200 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900 space-y-4">
            <div className="border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Cài đặt thông báo</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Chọn các kênh bạn muốn nhận thông báo khi có dữ liệu mới.</p>
            </div>
            <div className="space-y-3">
              <SettingSwitch icon={<Mail className="h-4 w-4 text-[#ed1c24]" />} title="Email thông báo" desc="Nhận email khi có tin nhắn liên hệ mới từ khách hàng." checked={settings.emailNotifications} onChange={(v) => handleSettingChange("emailNotifications", v)} />
              <SettingSwitch icon={<Bell className="h-4 w-4 text-emerald-600" />} title="Thông báo trình duyệt" desc="Hiển thị thông báo popup trong phiên làm việc admin." checked={settings.pushNotifications} onChange={(v) => handleSettingChange("pushNotifications", v)} />
              <SettingSwitch icon={<MessageSquare className="h-4 w-4 text-purple-600" />} title="SMS / Zalo Alert" desc="Nhận tin báo nhanh qua kênh tin nhắn OTT." checked={settings.smsNotifications} onChange={(v) => handleSettingChange("smsNotifications", v)} />
              <SettingSwitch icon={<AlertCircle className="h-4 w-4 text-amber-600" />} title="Cảnh báo an ninh" desc="Ưu tiên thông báo về lượt đăng nhập mới và bảo mật." checked={settings.securityAlerts} onChange={(v) => handleSettingChange("securityAlerts", v)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="border border-slate-200 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900 space-y-4">
            <div className="border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Thay đổi mật khẩu</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Cập nhật mật khẩu tài khoản đăng nhập Supabase Auth.</p>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Mật khẩu mới</Label>
                <Input className="h-10 rounded-none border-slate-200 bg-slate-50 text-xs font-bold dark:border-white/10 dark:bg-slate-950" id="newPassword" name="newPassword" type="password" required minLength={8} placeholder="Tối thiểu 8 ký tự" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Xác nhận mật khẩu mới</Label>
                <Input className="h-10 rounded-none border-slate-200 bg-slate-50 text-xs font-bold dark:border-white/10 dark:bg-slate-950" id="confirmPassword" name="confirmPassword" type="password" required minLength={8} placeholder="Nhập lại mật khẩu mới" />
              </div>
              <Button type="submit" disabled={loading} className="h-10 px-6 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]">
                <Save className="mr-1.5 h-4 w-4" /> {loading ? "Đang cập nhật..." : "Lưu mật khẩu mới"}
              </Button>
            </form>
          </div>

          <div className="border border-red-200 bg-white p-6 shadow-xs dark:border-red-900/40 dark:bg-slate-900 space-y-4">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-red-600">Đăng xuất khỏi tất cả thiết bị</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Hủy toàn bộ phiên làm việc của tài khoản trên các thiết bị khác.</p>
            </div>
            <Button onClick={handleLogoutAllDevices} disabled={loading} variant="destructive" className="h-10 rounded-none text-xs font-black uppercase">
              <LogOut className="mr-1.5 h-4 w-4" /> {loading ? "Đang xử lý..." : "Đăng xuất toàn bộ"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <div className="border border-slate-200 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900 space-y-4">
            <div className="border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Quyền riêng tư & Nhật ký</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Điều chỉnh khả năng hiển thị và ghi nhật ký hoạt động.</p>
            </div>
            <div className="space-y-3">
              <SettingSwitch icon={<Globe className="h-4 w-4 text-[#ed1c24]" />} title="Hồ sơ công khai" desc="Cho phép hiển thị thông tin tác giả trên trang bài viết." checked={settings.publicProfile} onChange={(v) => handleSettingChange("publicProfile", v)} />
              <SettingSwitch icon={<Eye className="h-4 w-4 text-emerald-600" />} title="Tìm kiếm nội bộ" desc="Cho phép tìm kiếm tài khoản trong danh sách biên tập viên." checked={settings.searchVisibility} onChange={(v) => handleSettingChange("searchVisibility", v)} />
              <SettingSwitch icon={<Database className="h-4 w-4 text-blue-600" />} title="Ghi nhật ký thao tác" desc="Lưu lịch sử thay đổi để phục vụ kiểm toán hệ thống." checked={settings.activityLog} onChange={(v) => handleSettingChange("activityLog", v)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="border border-slate-200 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900 space-y-6">
            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-3">Chủ đề giao diện</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Sáng", icon: "☀️" },
                  { id: "dark", label: "Tối", icon: "🌙" },
                  { id: "system", label: "Hệ thống", icon: "⚙️" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={`p-4 border text-center transition-all ${
                      theme === option.id
                        ? "border-[#ed1c24] bg-red-50 dark:bg-red-950/20 text-[#ed1c24]"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <p className="text-xs font-black uppercase tracking-wider">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-white/5 pt-4">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-3">Cỡ chữ hiển thị</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "small", label: "Nhỏ (Compact)" },
                  { id: "normal", label: "Chuẩn (Default)" },
                  { id: "large", label: "Lớn (Spacious)" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSettingChange("fontSize", option.id as AdminSettings["fontSize"])}
                    className={`p-3 border text-center transition-all ${
                      settings.fontSize === option.id
                        ? "border-[#ed1c24] bg-red-50 dark:bg-red-950/20 text-[#ed1c24]"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-wider">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="border border-slate-200 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900 space-y-4">
            <div className="border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Kiểm tra kết nối hệ thống</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Trạng thái kết nối Supabase Database và cấu hình biến môi trường.</p>
            </div>
            <div className="space-y-2">
              {systemChecks.map((item) => (
                <div key={item.label} className="flex items-center justify-between border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-slate-950">
                  <span className="text-xs font-black uppercase text-slate-900 dark:text-white">{item.label}</span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white ${
                    item.ok ? "bg-emerald-600" : "bg-red-600"
                  }`}>
                    {item.ok ? "HOẠT ĐỘNG" : "THIẾU CẤU HÌNH"}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Button variant="outline" onClick={exportData} className="h-10 rounded-none border-slate-200 text-xs font-black uppercase tracking-wider">
                <Database className="mr-2 h-4 w-4 text-[#ed1c24]" /> Tải xuống tệp cấu hình JSON
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SettingSwitch({ icon, title, desc, checked, onChange }: { icon: ReactNode; title: string; desc: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3.5 border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950">
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        <div>
          <Label className="text-xs font-black uppercase text-slate-900 dark:text-white cursor-pointer">{title}</Label>
          <p className="text-[11px] text-slate-500 font-semibold">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "collab"]}>
      <SettingsContent />
    </ProtectedRoute>
  )
}