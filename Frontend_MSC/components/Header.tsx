"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, ChevronRight, Sun, Moon, User, LogIn, UserPlus, LogOut } from 'lucide-react'
import { useTheme } from "next-themes"
import { useLanguage } from "./language-provider"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// --- ANIMATION VARIANTS ---
const mobileNavVariants = {
  open: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};
const mobileNavItemVariants = {
  open: { y: 0, opacity: 1, transition: { y: { stiffness: 1000, velocity: -100 } } },
  closed: { y: 50, opacity: 0, transition: { y: { stiffness: 1000 } } }
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const pathname = usePathname()

  // Constants cho kích thước
  const TOPBAR_HEIGHT = 36
  const HEADER_BASE_HEIGHT = 100
  const HEADER_SCROLLED_HEIGHT = 72

  // 1. FIX LỖI TS 2345: Hàm getInitials an toàn với dữ liệu undefined/null
  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== 'string') return 'U';
    const initials = name
      .trim()
      .split(/\s+/)
      .map(n => n[0])
      .join('')
      .toUpperCase();
    return initials.slice(0, 2) || 'U';
  }

  // Khóa cuộn trang khi mở menu mobile
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  // Xử lý scroll và resize
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    }
  }, [])

  const navItems = [
    { href: "/gioi-thieu", label: t("nav.about") },
    { href: "/dao-tao", label: t("nav.training") },
    { href: "/du-an", label: t("nav.projects") },
    { href: "/mentors", label: t("nav.mentors") },
    { href: "/mscer", label: t("nav.mscer") },
    { href: "/dong-hanh", label: t("nav.partners") },
    { href: "/tin-tuc", label: "Tin tức" },
    { href: "/lien-he", label: t("nav.contact") },
  ]

  const activePath = navItems.find(item => pathname.startsWith(item.href))?.href || null;

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* --- TOPBAR --- */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            key="topbar"
            initial={{ y: -TOPBAR_HEIGHT, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -TOPBAR_HEIGHT, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-0 left-0 right-0 z-[60] bg-[#095095] text-white text-sm shadow-md"
            style={{ height: TOPBAR_HEIGHT }}
          >
            <div className="absolute inset-0 opacity-30">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                animate={{ x: ["-100%", "100%"] }} 
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </div>
            <div className="container mx-auto flex justify-between items-center h-full px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex items-center space-x-4 text-xs">
                <span className="hidden sm:block">📧 msc.edu.vn@gmail.com</span>
                <span className="hidden md:block">📞 (+84) 329 381 489</span>
                <span className="block font-bold">🌟 MSC CENTER</span>
              </div>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-white hover:bg-white/20 h-7">
                      <span className="text-sm">{language === "vi" ? "🇻🇳" : "🇬🇧"}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setLanguage("vi")}>🇻🇳 Tiếng Việt</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("en")}>🇬🇧 English</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {!isLoading && (
                  <>
                    {!isAuthenticated ? (
                      <Link href="https://mscer.msc.edu.vn/" target="_blank" className="hidden sm:block">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-7 text-xs">
                          <LogIn className="h-3 w-3 mr-1" />
                          {t("nav.mscerlogin")}
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="hidden sm:inline-flex items-center space-x-2 bg-white/95 text-gray-800 px-4 py-1.5 rounded-md text-xs font-semibold shadow-sm border border-gray-200/50 backdrop-blur-sm max-w-[180px]">
                          <User className="h-3 w-3 text-blue-600 flex-shrink-0" />
                          <span className="whitespace-nowrap truncate">{user?.fullName ?? user?.email ?? 'Người dùng'}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="hidden sm:flex text-white hover:bg-white/20 h-7 text-xs items-center space-x-1" onClick={handleLogout}>
                          <LogOut className="h-3 w-3" />
                          <span>Đăng xuất</span>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN HEADER --- */}
      <motion.header 
        className={`fixed left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md"}`} 
        style={{ top: isScrolled ? 0 : `${TOPBAR_HEIGHT}px`, height: isScrolled ? `${HEADER_SCROLLED_HEIGHT}px` : `${HEADER_BASE_HEIGHT}px` }}
      >
        <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex-shrink-0">
            <motion.div animate={{ scale: isScrolled ? 0.75 : 1 }} transition={{ duration: 0.4, ease: "circOut" }} className="flex items-center origin-left">
              <Image src="/logo.webp" alt="Mekong Skill Center" width={240} height={72} className="h-auto transition-all duration-300" style={{ width: isScrolled ? '270px' : '280px' }} priority />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center font-bold lg:flex lg:space-x-1 xl:space-x-3">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`relative group rounded-md py-2 text-gray-700 transition-colors duration-300 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 lg:px-2 xl:px-3 lg:text-[11px] xl:text-[12px] 2xl:text-sm uppercase tracking-wider ${item.href === activePath ? "text-blue-600 dark:text-blue-400" : ""}`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-blue-600 transition-all duration-300 ${item.href === activePath ? 'w-1/2' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Account Dropdown */}
            {!isLoading && isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full p-0 flex items-center justify-center border-2 border-blue-100 dark:border-blue-900/30">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-teal-600 text-white text-xs font-bold">
                        {getInitials(user?.fullName ?? user?.email ?? 'User')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px] bg-white/95 backdrop-blur-md shadow-xl rounded-2xl border-none">
                  <div className="flex items-center gap-3 p-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                        {getInitials(user?.fullName ?? user?.email ?? 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <p className="text-sm font-bold truncate">{user.fullName ?? 'Thành viên'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  <DropdownMenuItem asChild className="p-3 focus:bg-blue-50 cursor-pointer">
                    <Link href="/student" className="flex items-center w-full">
                      <User className="mr-3 h-4 w-4 text-blue-600" /> Hồ sơ cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  <DropdownMenuItem onClick={handleLogout} className="p-3 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer font-medium">
                    <LogOut className="mr-3 h-4 w-4" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </motion.header>
      
      {/* --- MOBILE MENU PANEL --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div key="mobile-menu-panel" className="fixed top-0 left-0 bottom-0 z-[100] w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-2xl lg:hidden flex flex-col" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.4, ease: "anticipate" }}>
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}><Image src="/logo.webp" alt="Logo" width={120} height={32} /></Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full"><X className="h-5 w-5" /></Button>
              </div>
              <motion.nav className="flex-1 p-6 space-y-2 overflow-y-auto" variants={mobileNavVariants} initial="closed" animate="open">
                {navItems.map((item) => (
                  <motion.div key={item.href} variants={mobileNavItemVariants}>
                    <Link 
                      href={item.href} 
                      className={`group flex items-center justify-between p-4 rounded-2xl transition-all ${item.href === activePath ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30" : "hover:bg-slate-50 dark:hover:bg-gray-800"}`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="font-bold text-sm uppercase tracking-wide">{item.label}</span>
                      <ChevronRight size={16} className={`${item.href === activePath ? 'text-blue-500' : 'text-gray-400'}`} />
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
              <div className="p-6 mt-auto border-t dark:border-gray-800">
                {!isLoading && (
                  isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4">
                        <Avatar className="h-10 w-10"><AvatarFallback className="bg-blue-600 text-white font-bold">{getInitials(user?.fullName ?? user?.email ?? 'U')}</AvatarFallback></Avatar>
                        <div className="overflow-hidden"><p className="text-sm font-bold truncate">{user?.fullName}</p><p className="text-xs text-gray-500 truncate">{user?.email}</p></div>
                      </div>
                      <Link href="/student" onClick={() => setIsMobileMenuOpen(false)}><Button variant="outline" className="w-full justify-start rounded-xl h-12 font-bold"><User className="mr-3 h-4 w-4" /> Bảng điều khiển</Button></Link>
                      <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 rounded-xl h-12 font-bold"><LogOut className="mr-3 h-4 w-4" /> Đăng xuất</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}><Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-bold uppercase tracking-wider">Đăng nhập</Button></Link>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}><Button variant="outline" className="w-full h-12 rounded-xl font-bold uppercase tracking-wider">Tạo tài khoản</Button></Link>
                    </div>
                  )
                )}
                <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-widest font-medium">© {new Date().getFullYear()} Mekong Skill Center</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer để nội dung không bị Header đè lên */}
      <div className="transition-all duration-300" style={{ height: isScrolled ? `${HEADER_SCROLLED_HEIGHT}px` : `${TOPBAR_HEIGHT + HEADER_BASE_HEIGHT}px` }} />
    </>
  )
}

export default Header