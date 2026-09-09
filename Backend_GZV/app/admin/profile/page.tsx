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
      <div className="mx-auto max-w-6xl py-32 flex flex-col items-center justify-center border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="animate-spin rounded-none h-8 w-8 border-2 border-[#ed1c24] border-t-transparent mx-auto"></div>
        <p className="text-slate-400 mt-4 text-xs font-black uppercase tracking-widest">Đang tải hồ sơ...</p>
      </div>
    )
  }

  const initials = (formData.fullName || formData.email || "U").slice(0, 1).toUpperCase()

  return (
    <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">
      {/* Top Header Card */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 shrink-0 bg-[#ed1c24] text-white flex items-center justify-center font-black shadow-xs">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                ADMINISTRATOR PROFILE
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                Hồ Sơ Quản Trị Viên & Phân Quyền
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Thông tin tài khoản đăng nhập và dữ liệu định danh của bạn trên hệ thống GZV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!editing ? (
              <Button
                size="sm"
                onClick={() => setEditing(true)}
                className="h-9 px-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
              >
                <UserCircle2 className="mr-1.5 h-4 w-4" /> Chỉnh sửa hồ sơ
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="h-9 rounded-none border-slate-200 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200"
                >
                  Hủy bỏ
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="h-9 px-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
                >
                  <Save className="mr-1.5 h-4 w-4" /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 4 Control Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Vai Trò Hệ Thống</p>
            <p className="mt-2 text-xl font-black text-slate-950 dark:text-white uppercase">{profile.role || "collab"}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Trạng Thái</p>
            <p className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400">Đang Hoạt Động</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Email Đăng Nhập</p>
            <p className="mt-2 text-xs font-black text-blue-600 dark:text-blue-400 truncate font-mono">{formData.email}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Quyền Hạn</p>
            <p className="mt-2 text-xl font-black text-purple-600 dark:text-purple-400">Full Access</p>
          </div>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="border border-slate-200 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5 border-b border-slate-100 dark:border-white/5 pb-6">
          <Avatar className="h-20 w-20 rounded-none border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
            <AvatarImage src={formData.avatarUrl} alt={formData.fullName || formData.email} className="object-cover" />
            <AvatarFallback className="rounded-none bg-[#ed1c24] text-white text-2xl font-black">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
              {formData.fullName || formData.email}
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{formData.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-red-50 text-[#ed1c24] dark:bg-red-950/40 border border-red-200 dark:border-red-900/40">
                {profile.role || "collab"}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40">
                {profile.status === "active" ? "Đang hoạt động" : profile.status}
              </span>
            </div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile() }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Họ và tên</Label>
                <Input
                  className="h-10 rounded-none border-slate-200 bg-slate-50 text-xs font-bold dark:border-white/10 dark:bg-slate-950"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Email đăng nhập</Label>
                <Input
                  className="h-10 rounded-none border-slate-200 bg-slate-100 text-xs font-mono dark:border-white/10 dark:bg-slate-800"
                  value={formData.email}
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Số điện thoại</Label>
                <Input
                  className="h-10 rounded-none border-slate-200 bg-slate-50 text-xs font-bold dark:border-white/10 dark:bg-slate-950"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0987654321"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Địa chỉ / Khu vực</Label>
                <Input
                  className="h-10 rounded-none border-slate-200 bg-slate-50 text-xs font-bold dark:border-white/10 dark:bg-slate-950"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="TP. Hồ Chí Minh"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Website cá nhân</Label>
                <Input
                  className="h-10 rounded-none border-slate-200 bg-slate-50 text-xs font-bold dark:border-white/10 dark:bg-slate-950"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Đường dẫn ảnh đại diện (URL)</Label>
              <Input
                className="h-10 rounded-none border-slate-200 bg-slate-50 text-xs font-mono dark:border-white/10 dark:bg-slate-950"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://.../avatar.jpg"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Giới thiệu ngắn (Bio)</Label>
              <Textarea
                className="min-h-24 rounded-none border-slate-200 bg-slate-50 text-xs font-medium dark:border-white/10 dark:bg-slate-950"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Giới thiệu đôi nét về bản thân và vai trò phụ trách..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
                className="h-10 rounded-none border-slate-200 text-xs font-black uppercase"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-10 rounded-none bg-[#ed1c24] px-6 text-xs font-black uppercase text-white hover:bg-[#c91218]"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#ed1c24]" /> Email liên lạc
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{formData.email || "Chưa có"}</p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#ed1c24]" /> Số điện thoại
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{formData.phone || "Chưa cập nhật"}</p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#ed1c24]" /> Địa chỉ / Khu vực
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{formData.location || "Chưa cập nhật"}</p>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-[#ed1c24]" /> Website cá nhân
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{formData.website || "Chưa cập nhật"}</p>
              </div>
            </div>

            {formData.bio && (
              <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Giới thiệu bản thân</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{formData.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "collab"]}>
      <ProfileContent />
    </ProtectedRoute>
  )
}