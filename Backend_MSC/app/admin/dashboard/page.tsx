"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/admin/ProtectedRoute"
import { KPICard } from "@/components/admin/dashboard/KPICard"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FolderOpen,
  GraduationCap,
  Mail,
  Newspaper,
  RefreshCw,
  Users,
} from "lucide-react"

type Counts = {
  profiles: number
  articles: number
  projects: number
  mentors: number
  mscers: number
  programs: number
  authors: number
  contactMessages: number
  unreadMessages: number
  newMessages: number
}

type Activity = {
  id: string
  type: "message" | "article" | "project" | "profile"
  title: string
  description: string
  created_at: string
  href: string
}

const initialCounts: Counts = {
  profiles: 0,
  articles: 0,
  projects: 0,
  mentors: 0,
  mscers: 0,
  programs: 0,
  authors: 0,
  contactMessages: 0,
  unreadMessages: 0,
  newMessages: 0,
}

function formatDate(value?: string | null) {
  if (!value) return "Chưa rõ"
  return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })
}

function AdminDashboardContent() {
  const [counts, setCounts] = useState<Counts>(initialCounts)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)

    const [
      profiles,
      articles,
      projects,
      mentors,
      mscers,
      programs,
      authors,
      contactMessages,
      unreadMessages,
      newMessages,
      recentMessages,
      recentArticles,
      recentProjects,
      recentProfiles,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("articles").select("id", { count: "exact", head: true }),
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("mentors").select("id", { count: "exact", head: true }),
      supabase.from("mscers").select("id", { count: "exact", head: true }),
      supabase.from("programs").select("id", { count: "exact", head: true }),
      supabase.from("authors").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("contact_messages").select("id,name,email,message,status,created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("articles").select("id,title,slug,created_at").order("created_at", { ascending: false }).limit(4),
      supabase.from("projects").select("id,title,slug,status,created_at").order("created_at", { ascending: false }).limit(4),
      supabase.from("profiles").select("id,full_name,email,role,created_at").order("created_at", { ascending: false }).limit(4),
    ])

    const failed = [profiles, articles, projects, mentors, mscers, programs, authors, contactMessages, unreadMessages, newMessages]
      .find((result) => result.error)

    if (failed?.error) {
      setError(failed.error.message)
    }

    setCounts({
      profiles: profiles.count ?? 0,
      articles: articles.count ?? 0,
      projects: projects.count ?? 0,
      mentors: mentors.count ?? 0,
      mscers: mscers.count ?? 0,
      programs: programs.count ?? 0,
      authors: authors.count ?? 0,
      contactMessages: contactMessages.count ?? 0,
      unreadMessages: unreadMessages.count ?? 0,
      newMessages: newMessages.count ?? 0,
    })

    const nextActivities: Activity[] = [
      ...((recentMessages.data || []) as any[]).map((item) => ({
        id: `message-${item.id}`,
        type: "message" as const,
        title: item.name || item.email || "Tin nhắn liên hệ mới",
        description: item.message || `Trạng thái: ${item.status || "new"}`,
        created_at: item.created_at,
        href: "/admin/contacts",
      })),
      ...((recentArticles.data || []) as any[]).map((item) => ({
        id: `article-${item.id}`,
        type: "article" as const,
        title: item.title || "Bài viết mới",
        description: "Bài viết vừa cập nhật trong CMS",
        created_at: item.created_at,
        href: item.id ? `/admin/articles/${item.id}` : "/admin/articles",
      })),
      ...((recentProjects.data || []) as any[]).map((item) => ({
        id: `project-${item.id}`,
        type: "project" as const,
        title: item.title || "Dự án mới",
        description: `Trạng thái: ${item.status || "chưa đặt"}`,
        created_at: item.created_at,
        href: item.id ? `/admin/projects/${item.id}` : "/admin/projects",
      })),
      ...((recentProfiles.data || []) as any[]).map((item) => ({
        id: `profile-${item.id}`,
        type: "profile" as const,
        title: item.full_name || item.email || "Người dùng mới",
        description: `Vai trò: ${item.role || "user"}`,
        created_at: item.created_at,
        href: "/admin/users",
      })),
    ].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 8)

    setActivities(nextActivities)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const kpiData = useMemo(() => [
    { title: "Người dùng", value: counts.profiles, change: `${counts.mscers} MSCers`, changeType: "neutral" as const, icon: Users, iconColor: "text-blue-600 dark:text-blue-400" },
    { title: "Tin liên hệ", value: counts.contactMessages, change: `${counts.unreadMessages} chưa đọc`, changeType: counts.unreadMessages > 0 ? "positive" as const : "neutral" as const, icon: Mail, iconColor: "text-amber-600 dark:text-amber-400" },
    { title: "Nội dung", value: counts.articles, change: `${counts.authors} tác giả`, changeType: "neutral" as const, icon: Newspaper, iconColor: "text-emerald-600 dark:text-emerald-400" },
    { title: "Dự án", value: counts.projects, change: `${counts.mentors} mentors`, changeType: "neutral" as const, icon: FolderOpen, iconColor: "text-purple-600 dark:text-purple-400" },
  ], [counts])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Bảng điều khiển Admin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">
            Theo dõi dữ liệu thật từ Supabase và xử lý nhanh các khu vực quan trọng.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Tải lại
        </Button>
      </div>

      {error && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardContent className="p-4 flex gap-3 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">Không tải được một phần dữ liệu: {error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiData.map((kpi, index) => <KPICard key={kpi.title} {...kpi} index={index} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <Card className="xl:col-span-2 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Hoạt động gần đây</CardTitle>
            <Badge variant="outline">{activities.length} mục</Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />)}
              </div>
            ) : activities.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">Chưa có hoạt động nào.</div>
            ) : (
              <div className="space-y-2">
                {activities.map((activity) => <ActivityRow key={activity.id} activity={activity} />)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickAction href="/admin/contacts" icon={<Mail className="h-4 w-4" />} label="Xem hộp thư đến" value={`${counts.newMessages} tin mới`} />
            <QuickAction href="/admin/training" icon={<BookOpen className="h-4 w-4" />} label="Quản lý đào tạo" value={`${counts.programs} chương trình`} />
            <QuickAction href="/admin/mentors" icon={<GraduationCap className="h-4 w-4" />} label="Quản lý mentors" value={`${counts.mentors} hồ sơ`} />
            <QuickAction href="/admin/projects" icon={<FolderOpen className="h-4 w-4" />} label="Quản lý dự án" value={`${counts.projects} dự án`} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ActivityRow({ activity }: { activity: Activity }) {
  const iconMap = {
    message: <Mail className="h-4 w-4 text-amber-600" />,
    article: <Newspaper className="h-4 w-4 text-emerald-600" />,
    project: <FolderOpen className="h-4 w-4 text-purple-600" />,
    profile: <Users className="h-4 w-4 text-blue-600" />,
  }

  return (
    <Link href={activity.href} className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">{iconMap[activity.type]}</div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{formatDate(activity.created_at)}</span>
    </Link>
  )
}

function QuickAction({ href, icon, label, value }: { href: string; icon: ReactNode; label: string; value: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
      <span className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-100">{icon}{label}</span>
      <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />{value}</Badge>
    </Link>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "collab"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}