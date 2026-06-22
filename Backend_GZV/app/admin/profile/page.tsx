"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { ProtectedRoute } from "@/components/admin/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { Check, Copy, Globe, Mail, MapPin, Phone, Save, Shield, UserCircle2 } from "lucide-react"

type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  role: string | null
  status: string | null
  created_at: string | null
  personal_info: Record<string, any> | null
}

const emptyProfile: ProfileRow = {
  id: "",
  email: "",
  full_name: "",
  avatar_url: "",
  bio: "",
  role: "collab",
  status: "active",
  created_at: null,
  personal_info: {},
}

function ProfileContent() {
  const [authUser, setAuthUser] = useState<any>(null)
  const [profile, setProfile] = useState<ProfileRow>(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatarUrl: "",
    phone: "",
    location: "",
    website: "",
    bio: "",
  })

  const loadProfile = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      setLoading(false)
      return
    }

    setAuthUser(session.user)
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,avatar_url,bio,role,status,created_at,personal_info")
      .eq("id", session.user.id)
      .maybeSingle()

    if (error) toast.error(error.message)

    const merged: ProfileRow = {
      ...emptyProfile,
      id: session.user.id,
      email: session.user.email || data?.email || "",
      full_name: data?.full_name || session.user.user_metadata?.full_name || "",
      avatar_url: data?.avatar_url || session.user.user_metadata?.avatar_url || "",
      bio: data?.bio || session.user.user_metadata?.bio || "",
      role: data?.role || localStorage.getItem("user_role") || "collab",
      status: data?.status || "active",
      created_at: data?.created_at || session.user.created_at || null,
      personal_info: (data?.personal_info as Record<string, any>) || {},
    }

    setProfile(merged)
    localStorage.setItem("user_role", merged.role || "collab")
    setFormData({
      fullName: merged.full_name || "",
      email: merged.email || "",
      avatarUrl: merged.avatar_url || "",
      phone: merged.personal_info?.phone || session.user.user_metadata?.phone || "",
      location: merged.personal_info?.location || session.user.user_metadata?.location || "",
      website: merged.personal_info?.website || session.user.user_metadata?.website || "",
      bio: merged.bio || "",
    })
    setLoading(false)
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleCopyEmail = async () => {
    if (!formData.email) return
    await navigator.clipboard.writeText(formData.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleSaveProfile = async () => {
    if (!authUser?.id) return
    try {
      setSaving(true)
      const personalInfo = {
        ...(profile.personal_info || {}),
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
      }

      const payload = {
        id: authUser.id,
        email: formData.email || authUser.email,
        full_name: formData.fullName || null,
        avatar_url: formData.avatarUrl || null,
        bio: formData.bio || null,
        role: profile.role || "collab",
        status: profile.status || "active",
        personal_info: personalInfo,
      }

      const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" })
      if (error) throw error

      await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
          phone: formData.phone,
          location: formData.location,
          website: formData.website,
          bio: formData.bio,
        },
      })

      toast.success("Hồ sơ đã được cập nhật")
      setEditing(false)
      loadProfile()
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi cập nhật hồ sơ")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
    )
  }

  const initials = (formData.fullName || formData.email || "U").slice(0, 1).toUpperCase()

  return (
    <motion.div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">Hồ sơ quản trị</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">Thông tin này được lưu trong Supabase profiles và đồng bộ với tài khoản đăng nhập.</p>
        </div>
        {!editing && <Button onClick={() => setEditing(true)} className="gap-2"><UserCircle2 className="h-4 w-4" /> Chỉnh sửa</Button>}
      </div>

      <Card className="overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/20">
        <div className="h-28 bg-gradient-to-r from-slate-900 via-blue-800 to-cyan-700" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-12 mb-6">
            <Avatar className="h-28 w-28 border-4 border-white dark:border-gray-800 shadow-lg">
              <AvatarImage src={formData.avatarUrl} alt={formData.fullName || formData.email} />
              <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{formData.fullName || formData.email}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={profile.role === "admin" ? "bg-blue-600" : "bg-emerald-600"}><Shield className="h-3 w-3 mr-1" />{profile.role || "collab"}</Badge>
                <Badge variant="outline" className="bg-white/70 dark:bg-gray-800/70">{profile.status === "active" ? "Đang hoạt động" : profile.status || "Chưa rõ"}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoCard icon={<Mail className="h-5 w-5" />} label="Email" value={formData.email || "Chưa có"} action={<button onClick={handleCopyEmail} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">{copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}</button>} />
            <InfoCard icon={<Phone className="h-5 w-5" />} label="Điện thoại" value={formData.phone || "Chưa cập nhật"} />
            <InfoCard icon={<MapPin className="h-5 w-5" />} label="Vị trí" value={formData.location || "Chưa cập nhật"} />
            <InfoCard icon={<Globe className="h-5 w-5" />} label="Website" value={formData.website || "Chưa cập nhật"} />
          </div>
        </CardContent>
      </Card>

      {editing && (
        <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/20">
          <CardHeader>
            <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
            <CardDescription>Cập nhật thông tin hiển thị trong backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Họ và tên"><Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} /></Field>
              <Field label="Email"><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></Field>
              <Field label="Số điện thoại"><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></Field>
              <Field label="Vị trí"><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></Field>
              <Field label="Website"><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." /></Field>
              <Field label="Ảnh đại diện URL"><Input value={formData.avatarUrl} onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })} placeholder="https://..." /></Field>
            </div>
            <Field label="Tiểu sử"><Textarea rows={4} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} /></Field>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={handleSaveProfile} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? "Đang lưu..." : "Lưu thay đổi"}</Button>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>Hủy</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Thông tin tài khoản</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Meta label="ID người dùng" value={authUser?.id} mono />
            <Meta label="Ngày tạo" value={profile.created_at ? new Date(profile.created_at).toLocaleString("vi-VN") : "Chưa rõ"} />
            <Meta label="Vai trò" value={profile.role || "collab"} />
            <Meta label="Trạng thái" value={profile.status || "active"} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Tiểu sử</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{formData.bio || "Chưa có tiểu sử."}</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}

function InfoCard({ icon, label, value, action }: { icon: ReactNode; label: string; value: string; action?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
      <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0"><p className="text-sm text-gray-500">{label}</p><p className="font-medium text-gray-900 dark:text-white truncate">{value}</p></div>
      {action}
    </div>
  )
}

function Meta({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  return <div className="flex flex-col gap-1 rounded-lg bg-gray-50 dark:bg-gray-700/30 p-3"><span className="text-gray-500">{label}</span><span className={`${mono ? "font-mono text-xs break-all" : "font-medium"} text-gray-900 dark:text-white`}>{value || "N/A"}</span></div>
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "collab"]}>
      <ProfileContent />
    </ProtectedRoute>
  )
}