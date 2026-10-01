"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/admin/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Bot, CalendarClock, CheckCircle2, Link2, Save, ShieldCheck, Sparkles, Plus, RefreshCw } from "lucide-react"

const platforms = [
  { key: "facebook", label: "Facebook", note: "Pages API / Meta Business" },
  { key: "instagram", label: "Instagram", note: "Instagram Graph API" },
  { key: "tiktok", label: "TikTok", note: "Content Posting API" },
  { key: "youtube", label: "YouTube", note: "YouTube Data API" },
  { key: "linkedin", label: "LinkedIn", note: "Organization API" },
]

export default function AutomationPage() {
  const [settings, setSettings] = useState<any>({ is_enabled: false, timezone: "Asia/Ho_Chi_Minh", ai_provider: "openai", approval_required: true, default_prompt: "", default_hashtags: "" })
  const [connections, setConnections] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [job, setJob] = useState({ title: "", scheduled_at: "", platforms: ["facebook", "instagram"], seo_title: "", seo_description: "", caption: "", hashtags: "" })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [{ data: saved }, { data: connected }, { data: scheduled }] = await Promise.all([
      supabase.from("social_automation_settings").select("*").order("id", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("social_automation_connections").select("*").order("platform"),
      supabase.from("social_automation_jobs").select("*").order("scheduled_at", { ascending: true, nullsFirst: false }).limit(50),
    ])
    if (saved) setSettings(saved)
    setConnections(connected || [])
    setJobs(scheduled || [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from("social_automation_settings").upsert({ id: settings.id || undefined, ...settings, updated_at: new Date().toISOString() })
    setSaving(false)
    if (error) toast.error(error.message)
    else toast.success("Đã lưu cấu hình tự động hóa")
  }

  const connect = async (platform: string) => {
    const existing = connections.find((item) => item.platform === platform)
    const payload = { ...(existing || {}), platform, status: existing?.status === "connected" ? "disconnected" : "pending", account_label: existing?.account_label || "Chưa kết nối OAuth" }
    const { data, error } = await supabase.from("social_automation_connections").upsert(payload, { onConflict: "platform,external_account_id" }).select().single()
    if (error) toast.error("Chưa thể tạo phiên kết nối: " + error.message)
    else setConnections((items) => [...items.filter((item) => item.platform !== platform), data])
  }

  const createJob = async () => {
    if (!job.title.trim() || !job.platforms.length) return toast.error("Cần tiêu đề và ít nhất một kênh")
    const { data, error } = await supabase.from("social_automation_jobs").insert({
      title: job.title.trim(), source_type: "custom", platforms: job.platforms,
      scheduled_at: job.scheduled_at ? new Date(job.scheduled_at).toISOString() : null,
      status: job.scheduled_at ? "scheduled" : "draft",
      payload: { seo_title: job.seo_title, seo_description: job.seo_description, caption: job.caption, hashtags: job.hashtags },
    }).select().single()
    if (error) return toast.error(error.message)
    setJobs((items) => [...items, data].sort((a, b) => String(a.scheduled_at || "").localeCompare(String(b.scheduled_at || ""))))
    setJob({ title: "", scheduled_at: "", platforms: ["facebook", "instagram"], seo_title: "", seo_description: "", caption: "", hashtags: "" })
    toast.success("Đã tạo lịch nội dung")
  }

  const togglePlatform = (platform: string) => setJob((current) => ({ ...current, platforms: current.platforms.includes(platform) ? current.platforms.filter((item) => item !== platform) : [...current.platforms, platform] }))

  return <ProtectedRoute>
    <div className="space-y-6 p-4 md:p-8">
      <div className="border-l-4 border-[#ed1c24] bg-white p-5 shadow-sm dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ed1c24]">GZV Control / Automation</p><h1 className="mt-2 text-2xl font-black uppercase text-slate-950 dark:text-white">Tự động hóa nội dung</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Quản lý kết nối mạng xã hội, lịch đăng, quy trình duyệt, AI tạo nội dung và đo lường xu hướng trong một nơi.</p></div>
          <Button onClick={save} disabled={saving} className="rounded-none bg-[#ed1c24] font-black uppercase"><Save className="mr-2 h-4 w-4" />{saving ? "Đang lưu" : "Lưu cấu hình"}</Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-none border-slate-200 dark:border-white/10 dark:bg-slate-900"><CardHeader><CardTitle className="flex items-center gap-2 text-sm font-black uppercase"><Bot className="h-4 w-4 text-[#ed1c24]" />Trung tâm vận hành</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between border p-3"><div><Label className="font-black">Bật tự động hóa</Label><p className="text-xs text-slate-500">Cho phép job chạy theo lịch</p></div><Switch checked={settings.is_enabled} onCheckedChange={(value) => setSettings({ ...settings, is_enabled: value })} /></div>
          <div className="flex items-center justify-between border p-3"><div><Label className="font-black">Duyệt trước khi đăng</Label><p className="text-xs text-slate-500">Khuyến nghị cho nội dung AI</p></div><Switch checked={settings.approval_required !== false} onCheckedChange={(value) => setSettings({ ...settings, approval_required: value })} /></div>
          <div><Label>Múi giờ lịch đăng</Label><Input value={settings.timezone || ""} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="mt-2 rounded-none" /></div>
          <div><Label>AI provider</Label><Input value={settings.ai_provider || "openai"} onChange={(e) => setSettings({ ...settings, ai_provider: e.target.value })} className="mt-2 rounded-none" /></div>
          <div className="sm:col-span-2"><Label>Prompt mặc định cho AI</Label><textarea value={settings.default_prompt || ""} onChange={(e) => setSettings({ ...settings, default_prompt: e.target.value })} className="mt-2 min-h-24 w-full border border-slate-200 bg-transparent p-3 text-sm dark:border-white/10" placeholder="Tạo caption ngắn, đúng giọng GZV..." /></div>
          <div className="sm:col-span-2"><Label>Hashtag mặc định</Label><Input value={settings.default_hashtags || ""} onChange={(e) => setSettings({ ...settings, default_hashtags: e.target.value })} className="mt-2 rounded-none" placeholder="#GZV #TheVoiceOfGenzers" /></div>
        </CardContent></Card>

        <Card className="rounded-none border-slate-200 dark:border-white/10 dark:bg-slate-900"><CardHeader><CardTitle className="flex items-center gap-2 text-sm font-black uppercase"><Link2 className="h-4 w-4 text-[#ed1c24]" />Kênh xuất bản</CardTitle></CardHeader><CardContent className="space-y-2">{platforms.map((platform) => { const item = connections.find((connection) => connection.platform === platform.key); const connected = item?.status === "connected"; return <div key={platform.key} className="flex items-center justify-between border p-3"><div><p className="text-sm font-black">{platform.label}</p><p className="text-[11px] text-slate-500">{connected ? item.account_label : platform.note}</p></div><Button type="button" variant="outline" onClick={() => connect(platform.key)} className="rounded-none text-xs font-black uppercase">{connected ? <><CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-500" />Đã nối</> : "Kết nối"}</Button></div> })}</CardContent></Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3"><Card className="rounded-none dark:bg-slate-900"><CardContent className="p-5"><CalendarClock className="h-5 w-5 text-[#ed1c24]" /><h2 className="mt-3 font-black uppercase">Lịch đăng</h2><p className="mt-1 text-xs text-slate-500">Chuẩn bị lịch đăng theo từng nền tảng và múi giờ GZV.</p></CardContent></Card><Card className="rounded-none dark:bg-slate-900"><CardContent className="p-5"><Sparkles className="h-5 w-5 text-[#ed1c24]" /><h2 className="mt-3 font-black uppercase">SEO & AI</h2><p className="mt-1 text-xs text-slate-500">Sinh caption, hashtag, tiêu đề và mô tả theo nội dung gốc.</p></CardContent></Card><Card className="rounded-none dark:bg-slate-900"><CardContent className="p-5"><ShieldCheck className="h-5 w-5 text-[#ed1c24]" /><h2 className="mt-3 font-black uppercase">Phê duyệt an toàn</h2><p className="mt-1 text-xs text-slate-500">Lưu log, retry và yêu cầu duyệt trước khi gọi API xuất bản.</p></CardContent></Card></div>

      <Card className="rounded-none border-slate-200 dark:border-white/10 dark:bg-slate-900"><CardHeader><CardTitle className="flex items-center justify-between text-sm font-black uppercase"><span className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-[#ed1c24]" />Tạo lịch đăng & nội dung SEO</span><Button type="button" variant="outline" size="sm" onClick={load} className="rounded-none"><RefreshCw className="mr-2 h-3.5 w-3.5" />Làm mới</Button></CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2"><div><Label>Tiêu đề nội dung</Label><Input value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} className="mt-2 rounded-none" placeholder="Ví dụ: GAB - Bài giới thiệu dự án" /></div><div><Label>Thời gian đăng</Label><Input type="datetime-local" value={job.scheduled_at} onChange={(e) => setJob({ ...job, scheduled_at: e.target.value })} className="mt-2 rounded-none" /></div></div>
        <div><Label>Kênh đăng</Label><div className="mt-2 flex flex-wrap gap-2">{platforms.map((platform) => <button type="button" key={platform.key} onClick={() => togglePlatform(platform.key)} className={`border px-3 py-2 text-xs font-black uppercase ${job.platforms.includes(platform.key) ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-slate-200 text-slate-500 dark:border-white/10"}`}>{platform.label}</button>)}</div></div>
        <div className="grid gap-3 md:grid-cols-2"><div><Label>SEO title</Label><Input value={job.seo_title} onChange={(e) => setJob({ ...job, seo_title: e.target.value })} className="mt-2 rounded-none" placeholder="GZV - The Voice of Genzers" /></div><div><Label>SEO description</Label><Input value={job.seo_description} onChange={(e) => setJob({ ...job, seo_description: e.target.value })} className="mt-2 rounded-none" /></div><div className="md:col-span-2"><Label>Caption / nội dung AI</Label><textarea value={job.caption} onChange={(e) => setJob({ ...job, caption: e.target.value })} className="mt-2 min-h-24 w-full border border-slate-200 bg-transparent p-3 text-sm dark:border-white/10" placeholder="Để AI tạo tự động hoặc nhập nội dung đã duyệt..." /></div><div className="md:col-span-2"><Label>Hashtag</Label><Input value={job.hashtags} onChange={(e) => setJob({ ...job, hashtags: e.target.value })} className="mt-2 rounded-none" /></div></div>
        <Button type="button" onClick={createJob} className="rounded-none bg-[#ed1c24] font-black uppercase"><Plus className="mr-2 h-4 w-4" />Tạo lịch đăng</Button>
        <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-white/10">{jobs.length === 0 ? <p className="text-sm text-slate-500">Chưa có lịch đăng nào.</p> : jobs.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border p-3"><div><p className="text-sm font-black text-slate-900 dark:text-white">{item.title}</p><p className="text-[11px] text-slate-500">{item.scheduled_at ? new Date(item.scheduled_at).toLocaleString("vi-VN") : "Chưa lên lịch"} · {(item.platforms || []).join(", ")}</p></div><span className="border border-slate-200 px-2 py-1 text-[10px] font-black uppercase text-slate-500 dark:border-white/10">{item.status}</span></div>)}</div>
      </CardContent></Card>
    </div>
  </ProtectedRoute>
}
