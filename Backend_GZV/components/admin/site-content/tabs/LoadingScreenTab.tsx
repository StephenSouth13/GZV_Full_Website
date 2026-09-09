"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Sparkles, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import type { LoadingSettings } from "../types"

export function LoadingScreenTab({
  loadingSettings,
  setLoadingSettings,
}: {
  loadingSettings: LoadingSettings
  setLoadingSettings: (settings: LoadingSettings) => void
}) {
  const [saving, setSaving] = useState(false)

  const saveSettings = async (override?: Partial<LoadingSettings>) => {
    try {
      setSaving(true)
      const dataToSave = {
        ...loadingSettings,
        ...(override || {}),
      }

      const payload = {
        id: 1,
        enabled: dataToSave.enabled,
        title: dataToSave.title || "GZV",
        subtitle: dataToSave.subtitle || "Dang tai du lieu...",
        logo_url: dataToSave.logo_url || "/logo.webp",
        effect: dataToSave.effect || "orbit",
        background_from: dataToSave.background_from || "#031b3f",
        background_to: dataToSave.background_to || "#0f766e",
        accent_color: dataToSave.accent_color || "#38bdf8",
        minimum_duration_ms: Number(dataToSave.minimum_duration_ms) || 900,
      }

      const { error } = await supabase
        .from("site_loading_settings")
        .upsert([payload], { onConflict: "id" })

      if (error) throw error

      if (override) {
        setLoadingSettings(dataToSave)
      }
      toast.success(
        dataToSave.enabled
          ? "Đã bật màn hình loading và lưu vào Database!"
          : "Đã tắt màn hình loading thành công!"
      )
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu cấu hình Loading")
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (val: boolean) => {
    setLoadingSettings({ ...loadingSettings, enabled: val })
    await saveSettings({ enabled: val })
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-none border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-200 pb-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
                <Sparkles className="h-4 w-4 text-[#ed1c24]" /> Màn hình Loading Chờ Trang (Site Loading Screen)
              </CardTitle>
              <CardDescription className="text-xs font-semibold mt-1">
                Bật hoặc tắt màn hình chờ khi người dùng mới truy cập hoặc chuyển trang.
              </CardDescription>
            </div>
            <Button
              onClick={() => saveSettings()}
              disabled={saving}
              className="rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
            >
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
              Lưu Cấu Hình
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/40">
            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Trạng thái hiển thị Loading
              </Label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {loadingSettings.enabled
                  ? "Đang BẬT: Màn hình loading sẽ xuất hiện khi tải trang."
                  : "Đang TẮT: Trang web sẽ hiển thị ngay lập tức không qua màn hình chờ."}
              </p>
            </div>
            <Switch
              checked={loadingSettings.enabled}
              onCheckedChange={handleToggle}
              disabled={saving}
            />
          </div>

          {/* Detailed Config Options */}
          <div className={`space-y-4 transition-opacity ${!loadingSettings.enabled ? "opacity-40 pointer-events-none" : ""}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Tiêu đề chính (Title)</Label>
                <Input
                  value={loadingSettings.title || ""}
                  onChange={(e) => setLoadingSettings({ ...loadingSettings, title: e.target.value })}
                  placeholder="GZV"
                  className="rounded-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Phụ đề loading (Subtitle)</Label>
                <Input
                  value={loadingSettings.subtitle || ""}
                  onChange={(e) => setLoadingSettings({ ...loadingSettings, subtitle: e.target.value })}
                  placeholder="Đang tải dữ liệu..."
                  className="rounded-none text-xs"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Hiệu ứng Animation</Label>
                <Select
                  value={loadingSettings.effect || "orbit"}
                  onValueChange={(val) => setLoadingSettings({ ...loadingSettings, effect: val as any })}
                >
                  <SelectTrigger className="rounded-none text-xs">
                    <SelectValue placeholder="Chọn hiệu ứng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orbit">Quỹ đạo xoay (Orbit)</SelectItem>
                    <SelectItem value="pulse">Nhịp đập mờ dần (Pulse)</SelectItem>
                    <SelectItem value="bars">Thanh sóng âm (Bars)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Thời gian hiển thị tối thiểu (ms)</Label>
                <Input
                  type="number"
                  value={loadingSettings.minimum_duration_ms ?? 900}
                  onChange={(e) => setLoadingSettings({ ...loadingSettings, minimum_duration_ms: Number(e.target.value) })}
                  placeholder="900"
                  className="rounded-none text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Màu điểm nhấn (Accent Color)</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={loadingSettings.accent_color || "#38bdf8"}
                    onChange={(e) => setLoadingSettings({ ...loadingSettings, accent_color: e.target.value })}
                    className="h-9 w-9 rounded-none cursor-pointer border border-slate-200 shrink-0"
                  />
                  <Input
                    value={loadingSettings.accent_color || ""}
                    onChange={(e) => setLoadingSettings({ ...loadingSettings, accent_color: e.target.value })}
                    placeholder="#38bdf8"
                    className="rounded-none text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
