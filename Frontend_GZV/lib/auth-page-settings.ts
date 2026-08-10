"use client"

import { supabase } from "@/lib/api-supabase"

export type AuthPageKey = "login" | "register" | "forgot-password"

export type AuthPageSettings = {
  page_key: AuthPageKey
  eyebrow: string
  title: string
  subtitle: string
  side_title: string
  side_description: string
  submit_label: string
  footer_text: string
  footer_link_label: string
  footer_link_href: string
  hrm_label: string
  hrm_url: string
  hero_points: string[]
  show_social_login: boolean
  is_enabled: boolean
}

export const defaultAuthSettings: Record<AuthPageKey, AuthPageSettings> = {
  login: {
    page_key: "login",
    eyebrow: "GZV ACCESS",
    title: "Đăng nhập",
    subtitle: "Tiếp tục hành trình cùng GZV.",
    side_title: "Đồng hành cùng thế hệ tiếp theo",
    side_description: "GZV kết nối học tập, dự án và cộng đồng để tạo năng lực thực chiến.",
    submit_label: "Đăng nhập",
    footer_text: "Chưa có tài khoản?",
    footer_link_label: "Đăng ký ngay",
    footer_link_href: "/register",
    hrm_label: "Đăng nhập hệ thống HRM",
    hrm_url: "https://gzver.gzv.one/",
    hero_points: ["Nội dung học tập được cá nhân hóa", "Theo dõi tiến độ và hoạt động", "Kết nối với cộng đồng GZVers"],
    show_social_login: false,
    is_enabled: true,
  },
  register: {
    page_key: "register",
    eyebrow: "GZV COMMUNITY",
    title: "Tạo tài khoản",
    subtitle: "Gia nhập cộng đồng GZV.",
    side_title: "Bắt đầu hành trình phát triển",
    side_description: "Tạo hồ sơ để theo dõi học tập, kết nối mentor và tham gia hoạt động GZV.",
    submit_label: "Tạo tài khoản",
    footer_text: "Đã có tài khoản?",
    footer_link_label: "Đăng nhập",
    footer_link_href: "/login",
    hrm_label: "Hệ thống nội bộ HRM",
    hrm_url: "https://gzver.gzv.one/",
    hero_points: ["Tạo hồ sơ cá nhân", "Theo dõi hoạt động GZV", "Sẵn sàng tham gia các dự án thực chiến"],
    show_social_login: false,
    is_enabled: true,
  },
  "forgot-password": {
    page_key: "forgot-password",
    eyebrow: "GZV SUPPORT",
    title: "Quên mật khẩu",
    subtitle: "Nhập email để nhận hướng dẫn đặt lại mật khẩu.",
    side_title: "Khôi phục quyền truy cập",
    side_description: "GZV sẽ gửi email hướng dẫn nếu tài khoản tồn tại trong hệ thống.",
    submit_label: "Gửi hướng dẫn",
    footer_text: "Nhớ mật khẩu?",
    footer_link_label: "Quay lại đăng nhập",
    footer_link_href: "/login",
    hrm_label: "",
    hrm_url: "",
    hero_points: ["Bảo mật tài khoản", "Gửi hướng dẫn qua email", "Quay lại học tập trong vài phút"],
    show_social_login: false,
    is_enabled: true,
  },
}

export async function loadAuthPageSettings(pageKey: AuthPageKey) {
  const fallback = defaultAuthSettings[pageKey]
  const { data, error } = await supabase
    .from("site_auth_page_settings")
    .select("*")
    .eq("page_key", pageKey)
    .maybeSingle()

  if (error || !data) return fallback

  return {
    ...fallback,
    ...data,
    hero_points: Array.isArray(data.hero_points) ? data.hero_points : fallback.hero_points,
  } as AuthPageSettings
}
