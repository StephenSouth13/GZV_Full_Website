"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  FolderOpen,
  GraduationCap,
  Handshake,
  Image,
  LayoutDashboard,
  Mail,
  PenTool,
  Settings,
  Share2,
  UserCircle2,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const adminMenuItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["admin", "collab"] },
  { title: "Website Control", href: "/admin/site-content", icon: Blocks, roles: ["admin", "collab"] },
  { title: "GZVers", href: "/admin/gzvers", icon: UserCircle2, roles: ["admin", "collab"] },
  { title: "Mentors", href: "/admin/mentors", icon: GraduationCap, roles: ["admin", "collab"] },
  { title: "Đối tác", href: "/admin/partners", icon: Handshake, roles: ["admin", "collab"] },
  { title: "Tác giả", href: "/admin/authors", icon: PenTool, roles: ["admin", "collab"] },
  { title: "Tin liên hệ", href: "/admin/contacts", icon: Mail, roles: ["admin", "collab"] },
  { title: "Dự án", href: "/admin/projects", icon: FolderOpen, roles: ["admin", "collab"] },
  { title: "Tin tức", href: "/admin/articles", icon: Share2, roles: ["admin", "collab"] },
  { title: "Media", href: "/admin/images", icon: Image, roles: ["admin", "collab"] },
  { title: "Người dùng", href: "/admin/users", icon: Users, roles: ["admin"] },
  { title: "Tài chính", href: "/admin/finance", icon: DollarSign, roles: ["admin"] },
]

const userMenuItems = [
  { title: "Hồ sơ", href: "/admin/profile", icon: UserCircle2, roles: ["admin", "collab"] },
  { title: "Cài đặt", href: "/admin/settings", icon: Settings, roles: ["admin", "collab"] },
]

export function AdminSidebar({ isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState("collab")

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role") || "collab")
  }, [])

  const filteredMenuItems = adminMenuItems.filter((item) => item.roles.includes(userRole))

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 288 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative z-30 flex h-full flex-shrink-0 flex-col border-r border-white/10 bg-[#050505] shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-white/15 bg-[#00539b]">
              <span className="text-sm font-black text-white">G</span>
            </div>
            <div>
              <p className="text-sm font-black uppercase text-white">GZV Admin</p>
              <p className="text-[10px] font-black uppercase tracking-wide text-[#ed1c24]">Website Control</p>
            </div>
          </motion.div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-9 w-9 rounded-none p-1 text-white hover:bg-white/10 hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: isCollapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 border-l-2 px-3 py-3 text-sm transition-all duration-200",
                  isActive
                    ? "border-[#ed1c24] bg-white text-[#050505]"
                    : "border-transparent text-gray-400 hover:border-white/20 hover:bg-white/5 hover:text-gray-100",
                  isCollapsed && "justify-center px-2",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-bold">{item.title}</span>}
              </motion.div>
            </Link>
          )
        })}

        {!isCollapsed && (
          <>
            <div className="my-4 border-t border-white/10" />
            {userMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 border-l-2 px-3 py-3 text-sm transition-all duration-200",
                      isActive
                        ? "border-[#ed1c24] bg-[#00539b] text-white"
                        : "border-transparent text-gray-400 hover:border-white/20 hover:bg-white/5 hover:text-gray-100",
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-bold">{item.title}</span>
                  </motion.div>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {!isCollapsed && (
        <div className="border-t border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-emerald-500" />
            <span className="text-[10px] font-black uppercase text-gray-400">Hệ thống sẵn sàng</span>
          </div>
          <p className="ml-4 mt-1 text-[9px] font-medium uppercase text-gray-600">v3.0 GZV Control</p>
        </div>
      )}
    </motion.aside>
  )
}
