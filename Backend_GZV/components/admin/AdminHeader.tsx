"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Bell, ExternalLink, LogOut, Menu, Moon, Search, Settings, Sun, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface AdminHeaderProps {
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

function titleFromPath(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).pop() || "dashboard"
  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    "site-content": "Website Control",
    projects: "Dự án",
    articles: "Tin tức",
    gzvers: "GZVers",
    mentors: "Mentors",
    partners: "Đối tác",
    contacts: "Tin liên hệ",
    images: "Media",
    users: "Người dùng",
    settings: "Cài đặt",
  }
  return labels[segment] || segment.replace(/-/g, " ")
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState("collab")

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setUserRole(localStorage.getItem("user_role") || "collab")
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("user_role")
    router.push("/admin-login")
  }

  const getUserInitials = (value?: string | null) => {
    if (!value) return "G"
    return value.split(/[\s@.]+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
  }

  return (
    <header className="relative z-30 h-16 w-full border-b border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#0b0b0b]">
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="rounded-none text-slate-700 hover:bg-slate-100 lg:hidden dark:text-white dark:hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="hidden h-8 w-1 bg-[#ed1c24] sm:block" />
              <div>
                <h1 className="truncate text-lg font-black uppercase text-slate-950 dark:text-white">{titleFromPath(pathname)}</h1>
                <p className="hidden text-xs font-semibold text-slate-500 sm:block">Chỉnh, thêm, xóa và xuất bản nội dung website GZV.</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="hidden rounded-none border-slate-300 md:inline-flex" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open("http://localhost:3000", "_blank")}
            className="hidden rounded-none border-slate-300 md:inline-flex"
            aria-label="Open website"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-none border-slate-300"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" className="hidden rounded-none border-slate-300 sm:inline-flex" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-none p-0">
                <Avatar className="h-10 w-10 rounded-none">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "Admin"} />
                  <AvatarFallback className="rounded-none bg-[#00539b] text-xs font-black text-white">
                    {getUserInitials(user?.email || user?.user_metadata?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-none border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#111]">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-2">
                  <p className="truncate text-sm font-black">{user?.user_metadata?.full_name || "GZV Admin"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  <Badge className={cn("w-fit rounded-none text-xs", userRole === "admin" ? "bg-[#ed1c24]" : "bg-[#00539b]")}>
                    {userRole}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
                <User className="mr-2 h-4 w-4" />
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-[#ed1c24]">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
