"use client"

import { useEffect, useMemo, useState } from "react"
import type React from "react"
import { ProtectedRoute } from "@/components/admin/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Eye, Loader2, Save, ShieldCheck } from "lucide-react"

type PageKey = "login" | "register" | "forgot-password"

type AuthPageSettings = {
  page_key: PageKey
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

const defaults: Record<PageKey, AuthPageSettings> = {
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

const pageLabels: Record<PageKey, string> = {
  login: "Đăng nhập",
  register: "Đăng ký",
  "forgot-password": "Quên mật khẩu",
}

function AuthPagesManager() {
  const [rows, setRows] = useState<Record<PageKey, AuthPageSettings>>(defaults)
  const [active, setActive] = useState<PageKey>("login")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const current = rows[active]
  const stats = useMemo(() => Object.values(rows), [rows])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("site_auth_page_settings").select("*")
        if (error) throw error

        const next = { ...defaults }
        for (const item of data || []) {
          const key = item.page_key as PageKey
          if (next[key]) {
            next[key] = {
              ...next[key],
              ...item,
              hero_points: Array.isArray(item.hero_points) ? item.hero_points : next[key].hero_points,
            }
          }
        }
        setRows(next)
      } catch (error: any) {
        toast.error(error.message || "Không tải được cấu hình trang auth. Hãy chạy SQL mới trước.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const update = (patch: Partial<AuthPageSettings>) => {
    setRows((items) => ({ ...items, [active]: { ...items[active], ...patch } }))
  }

  const save = async () => {
    try {
      setSaving(true)
      const payload = Object.values(rows).map((row) => ({
        ...row,
        hero_points: row.hero_points.filter(Boolean),
      }))
      const { error } = await supabase.from("site_auth_page_settings").upsert(payload, { onConflict: "page_key" })
      if (error) throw error
      toast.success("Đã lưu cấu hình trang đăng nhập.")
    } catch (error: any) {
      toast.error(error.message || "Không lưu được cấu hình.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ed1c24]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 border-l-4 border-[#ed1c24] pl-3 text-xs font-black uppercase tracking-[0.2em] text-[#ed1c24]">Auth Pages</p>
          <h1 className="text-3xl font-black uppercase tracking-normal text-slate-950">Điều khiển Login / Register</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-500">Chỉnh toàn bộ nội dung public auth pages. Google/Facebook đang được ẩn cho đến khi kết nối chính thức.</p>
        </div>
        <Button onClick={save} disabled={saving} className="h-11 rounded-none bg-[#ed1c24] px-6 font-black uppercase text-white hover:bg-[#c91218]">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Lưu tất cả
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.page_key} className="border bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{pageLabels[item.page_key]}</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{item.title}</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <ShieldCheck className="h-4 w-4 text-[#ed1c24]" />
              {item.is_enabled ? "Đang bật" : "Đang tắt"}
            </div>
          </div>
        ))}
      </div>

      <Tabs value={active} onValueChange={(value) => setActive(value as PageKey)} className="space-y-5">
        <TabsList className="h-auto w-full justify-start rounded-none border bg-white p-0">
          {(Object.keys(defaults) as PageKey[]).map((key) => (
            <TabsTrigger key={key} value={key} className="flex-1 rounded-none px-4 py-3 font-black data-[state=active]:bg-[#050505] data-[state=active]:text-white">
              {pageLabels[key]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={active}>
          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="uppercase">Nội dung trang {pageLabels[active]}</CardTitle>
                <CardDescription>Nhập nội dung sạch, ngắn gọn để tránh lỗi tràn chữ và layout rối.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="Eyebrow"><Input value={current.eyebrow} onChange={(e) => update({ eyebrow: e.target.value })} /></Field>
                <Field label="Tiêu đề form"><Input value={current.title} onChange={(e) => update({ title: e.target.value })} /></Field>
                <div className="md:col-span-2"><Field label="Mô tả form"><Textarea rows={3} value={current.subtitle} onChange={(e) => update({ subtitle: e.target.value })} /></Field></div>
                <Field label="Nút submit"><Input value={current.submit_label} onChange={(e) => update({ submit_label: e.target.value })} /></Field>
                <Field label="Footer text"><Input value={current.footer_text} onChange={(e) => update({ footer_text: e.target.value })} /></Field>
                <Field label="Footer link label"><Input value={current.footer_link_label} onChange={(e) => update({ footer_link_label: e.target.value })} /></Field>
                <Field label="Footer link href"><Input value={current.footer_link_href} onChange={(e) => update({ footer_link_href: e.target.value })} /></Field>
                <Field label="Nhãn HRM"><Input value={current.hrm_label} onChange={(e) => update({ hrm_label: e.target.value })} placeholder="Để trống nếu muốn ẩn" /></Field>
                <Field label="URL HRM"><Input value={current.hrm_url} onChange={(e) => update({ hrm_url: e.target.value })} placeholder="https://..." /></Field>
                <div className="md:col-span-2"><Field label="Tiêu đề panel trái"><Input value={current.side_title} onChange={(e) => update({ side_title: e.target.value })} /></Field></div>
                <div className="md:col-span-2"><Field label="Mô tả panel trái"><Textarea rows={4} value={current.side_description} onChange={(e) => update({ side_description: e.target.value })} /></Field></div>
                <div className="md:col-span-2"><Field label="Điểm nổi bật, mỗi dòng một ý"><Textarea rows={5} value={current.hero_points.join("\n")} onChange={(e) => update({ hero_points: e.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })} /></Field></div>
                <SwitchLine label="Hiển thị trang" checked={current.is_enabled} onChange={(is_enabled) => update({ is_enabled })} />
                <SwitchLine label="Hiển thị Google/Facebook" checked={current.show_social_login} onChange={(show_social_login) => update({ show_social_login })} />
              </CardContent>
            </Card>

            <Card className="rounded-none border-[#050505]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 uppercase"><Eye className="h-5 w-5 text-[#ed1c24]" /> Preview nội dung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border bg-[#050505] p-5 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ed1c24]">{current.eyebrow}</p>
                  <h3 className="mt-4 text-3xl font-black uppercase leading-tight">{current.side_title}</h3>
                  <p className="mt-4 text-sm leading-6 text-white/70">{current.side_description}</p>
                  <div className="mt-5 space-y-2">
                    {current.hero_points.map((point) => <div key={point} className="border border-white/10 px-3 py-2 text-sm font-bold">{point}</div>)}
                  </div>
                </div>
                <div className="mt-4 border p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ed1c24]">{current.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-black uppercase">{current.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{current.subtitle}</p>
                  <Button className="mt-5 h-11 w-full rounded-none bg-[#ed1c24] font-black uppercase">{current.submit_label}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}

function SwitchLine({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border p-3">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export default function AuthPagesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "collab"]}>
      <AuthPagesManager />
    </ProtectedRoute>
  )
}
