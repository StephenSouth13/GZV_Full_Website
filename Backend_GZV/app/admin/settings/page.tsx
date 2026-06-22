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
    a.download = "msc-admin-settings.json"
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
    <motion.div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">Cài đặt backend</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">Quản lý tài khoản, bảo mật, thông báo và giao diện làm việc của admin.</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/20 p-1 gap-1">
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /><span className="hidden sm:inline">Thông báo</span></TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Bảo mật</span></TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2"><Eye className="h-4 w-4" /><span className="hidden sm:inline">Riêng tư</span></TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /><span className="hidden sm:inline">Giao diện</span></TabsTrigger>
          <TabsTrigger value="system" className="gap-2"><Database className="h-4 w-4" /><span className="hidden sm:inline">Hệ thống</span></TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Cài đặt thông báo</CardTitle><CardDescription>Chọn các kênh admin muốn ưu tiên khi có cập nhật mới.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <SettingSwitch icon={<Mail className="h-5 w-5 text-blue-500" />} title="Email thông báo" desc="Nhận email khi có tin nhắn liên hệ hoặc cập nhật quan trọng." checked={settings.emailNotifications} onChange={(v) => handleSettingChange("emailNotifications", v)} />
              <SettingSwitch icon={<Bell className="h-5 w-5 text-green-500" />} title="Thông báo trình duyệt" desc="Hiển thị thông báo trong phiên làm việc admin." checked={settings.pushNotifications} onChange={(v) => handleSettingChange("pushNotifications", v)} />
              <SettingSwitch icon={<MessageSquare className="h-5 w-5 text-purple-500" />} title="SMS/Zalo" desc="Đánh dấu nhu cầu nhận thông báo qua kênh nhắn tin." checked={settings.smsNotifications} onChange={(v) => handleSettingChange("smsNotifications", v)} />
              <SettingSwitch icon={<Globe className="h-5 w-5 text-orange-500" />} title="Email marketing" desc="Nhận cập nhật sản phẩm, chương trình đào tạo và chiến dịch." checked={settings.marketingEmails} onChange={(v) => handleSettingChange("marketingEmails", v)} />
              <SettingSwitch icon={<AlertCircle className="h-5 w-5 text-red-500" />} title="Cảnh báo bảo mật" desc="Ưu tiên thông báo về đăng nhập và thay đổi tài khoản." checked={settings.securityAlerts} onChange={(v) => handleSettingChange("securityAlerts", v)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Thay đổi mật khẩu</CardTitle><CardDescription>Cập nhật mật khẩu cho tài khoản Supabase hiện tại.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="newPassword">Mật khẩu mới</Label><Input id="newPassword" name="newPassword" type="password" required minLength={8} placeholder="Tối thiểu 8 ký tự" /></div>
                  <div className="space-y-2"><Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label><Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} placeholder="Nhập lại mật khẩu mới" /></div>
                </div>
                <Button type="submit" disabled={loading} className="gap-2"><Save className="h-4 w-4" />{loading ? "Đang cập nhật..." : "Lưu mật khẩu"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900/30">
            <CardHeader><CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400"><LogOut className="h-5 w-5" />Đăng xuất tất cả thiết bị</CardTitle><CardDescription>Kết thúc mọi phiên đăng nhập của tài khoản này.</CardDescription></CardHeader>
            <CardContent><Button onClick={handleLogoutAllDevices} disabled={loading} variant="destructive">{loading ? "Đang xử lý..." : "Đăng xuất toàn bộ"}</Button></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Cài đặt riêng tư</CardTitle><CardDescription>Điều chỉnh cách hồ sơ admin hiển thị trong nội bộ.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <SettingSwitch icon={<Globe className="h-5 w-5 text-blue-500" />} title="Hồ sơ công khai" desc="Cho phép hiển thị hồ sơ trong các khu vực nội bộ phù hợp." checked={settings.publicProfile} onChange={(v) => handleSettingChange("publicProfile", v)} />
              <SettingSwitch icon={<Eye className="h-5 w-5 text-green-500" />} title="Hiển thị trong tìm kiếm" desc="Cho phép tìm thấy tài khoản trong danh sách người dùng backend." checked={settings.searchVisibility} onChange={(v) => handleSettingChange("searchVisibility", v)} />
              <SettingSwitch icon={<Database className="h-5 w-5 text-slate-500" />} title="Ghi nhật ký hoạt động" desc="Lưu lựa chọn để phục vụ audit trong phiên làm việc." checked={settings.activityLog} onChange={(v) => handleSettingChange("activityLog", v)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Giao diện</CardTitle><CardDescription>Tùy chỉnh trải nghiệm sử dụng backend.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div><Label className="text-base font-medium mb-3 block">Chủ đề</Label><div className="grid grid-cols-3 gap-3">{[{ id: "light", label: "Sáng", icon: "☀️" }, { id: "dark", label: "Tối", icon: "🌙" }, { id: "system", label: "Hệ thống", icon: "⚙️" }].map((option) => <button key={option.id} onClick={() => setTheme(option.id)} className={`p-4 rounded-lg border-2 transition-all ${theme === option.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-700/30"}`}><div className="text-2xl mb-2">{option.icon}</div><p className="font-medium text-sm">{option.label}</p></button>)}</div></div>
              <div><Label className="text-base font-medium mb-3 block">Cỡ chữ</Label><div className="grid grid-cols-3 gap-3">{[{ id: "small", label: "Nhỏ" }, { id: "normal", label: "Chuẩn" }, { id: "large", label: "Lớn" }].map((option) => <button key={option.id} onClick={() => handleSettingChange("fontSize", option.id as AdminSettings["fontSize"])} className={`p-4 rounded-lg border-2 transition-all ${settings.fontSize === option.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-700/30"}`}><p className="font-medium text-sm">{option.label}</p></button>)}</div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Trạng thái hệ thống</CardTitle><CardDescription>Kiểm tra nhanh cấu hình cần có để backend kết nối Supabase.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {systemChecks.map((item) => <div key={item.label} className="flex items-center justify-between rounded-lg border p-3"><span className="font-medium">{item.label}</span><Badge className={item.ok ? "bg-emerald-600" : "bg-red-600"}>{item.ok ? "OK" : "Thiếu"}</Badge></div>)}
              <Button variant="outline" onClick={exportData} className="w-full gap-2"><Database className="h-4 w-4" />Tải xuống cấu hình của tôi</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

function SettingSwitch({ icon, title, desc, checked, onChange }: { icon: ReactNode; title: string; desc: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">{icon}<div><Label className="text-base font-medium cursor-pointer">{title}</Label><p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p></div></div>
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