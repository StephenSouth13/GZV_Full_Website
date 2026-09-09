"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Laptop, Smartphone, Sparkles } from "lucide-react"

interface ColorsTabProps {
  primary: string
  setPrimary: (val: string) => void
  secondary: string
  setSecondary: (val: string) => void
  accent: string
  setAccent: (val: string) => void
  applyPreset: (preset: any) => void
}

const COLOR_PRESETS = [
  {
    name: "GZV Red & Black (Gốc)",
    primary: "#ed1c24",
    secondary: "#050505",
    accent: "#ffffff",
    description: "Bộ màu thương hiệu GZV chuẩn: Đỏ rực rỡ, Đen sắc cạnh và Trắng tinh tế.",
  },
  {
    name: "Modern Dark",
    primary: "#ed1c24",
    secondary: "#0f172a",
    accent: "#38bdf8",
    description: "Tông tối hiện đại với Đỏ tạo điểm nhấn và Xanh Slate chiều sâu.",
  },
  {
    name: "Ocean Blue",
    primary: "#0284c7",
    secondary: "#0f172a",
    accent: "#38bdf8",
    description: "Xanh đại dương công nghệ, tạo cảm giác chuyên nghiệp & vững chắc.",
  },
  {
    name: "Sunset Warmth",
    primary: "#f97316",
    secondary: "#431407",
    accent: "#fbbf24",
    description: "Tông ấm áp nhiệt huyết, phù hợp cho sự kiện & phong cách năng động.",
  },
  {
    name: "Emerald Green",
    primary: "#10b981",
    secondary: "#064e3b",
    accent: "#34d399",
    description: "Xanh bảo ngọc sang trọng và phát triển bền vững.",
  },
  {
    name: "Minimalist Light",
    primary: "#050505",
    secondary: "#f8fafc",
    accent: "#ed1c24",
    description: "Tối giản hiện đại: Nền sáng cao cấp kết hợp Đen và Đỏ nhấn nhá.",
  },
  {
    name: "Cyberpunk Neon",
    primary: "#ec4899",
    secondary: "#18181b",
    accent: "#8b5cf6",
    description: "Táo bạo & cá tính với Hồng Neon và Tím Cyberpunk rực rỡ.",
  },
]

export function ColorsTab({
  primary,
  setPrimary,
  secondary,
  setSecondary,
  accent,
  setAccent,
  applyPreset,
}: ColorsTabProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")

  return (
    <div className="space-y-6">
      {/* 1. Predefined Color Presets */}
      <div className="border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#ed1c24]" /> Mẫu Phối Màu Có Sẵn (Presets)
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Bấm chọn một phối màu bên dưới để áp dụng nhanh lên giao diện website.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_PRESETS.map((preset) => {
            const isSelected =
              primary.toLowerCase() === preset.primary.toLowerCase() &&
              secondary.toLowerCase() === preset.secondary.toLowerCase()

            return (
              <div
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`group relative cursor-pointer border p-3.5 transition-all ${
                  isSelected
                    ? "border-[#ed1c24] bg-red-50/40 dark:bg-red-950/20 shadow-xs"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-400 dark:border-white/10 dark:bg-slate-950/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                    {preset.name}
                  </span>
                  {isSelected && (
                    <Badge className="bg-[#ed1c24] text-white rounded-none text-[9px] font-black uppercase px-1.5 py-0">
                      Đang dùng
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-12 border border-slate-200" style={{ backgroundColor: preset.primary }} />
                  <div className="h-6 w-12 border border-slate-200" style={{ backgroundColor: preset.secondary }} />
                  <div className="h-6 w-12 border border-slate-200" style={{ backgroundColor: preset.accent }} />
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {preset.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Custom Color Pickers & Live UI Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Custom Color Inputs */}
        <div className="space-y-4 lg:col-span-5 border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 pb-3 dark:border-white/10">
            Tùy Chỉnh Màu Sắc Trực Tiếp
          </h4>

          {/* Primary Color */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-900 dark:text-white">
              1. Màu Chủ Đạo (Primary Color)
            </Label>
            <p className="text-[10px] text-slate-400">
              Dùng cho Nút bấm chính, Badge, Highlight và đường viền thương hiệu.
            </p>
            <div className="flex gap-2">
              <Input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="w-10 h-10 p-0.5 rounded-none cursor-pointer border-slate-200 shrink-0"
              />
              <Input
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="font-mono text-xs uppercase h-10 rounded-none border-slate-200 dark:border-white/10"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/10">
            <Label className="text-xs font-bold text-slate-900 dark:text-white">
              2. Màu Nền Nút / Khối Phụ (Secondary Color)
            </Label>
            <p className="text-[10px] text-slate-400">
              Dùng cho Header, Footer, Hero Background và các card nền đậm.
            </p>
            <div className="flex gap-2">
              <Input
                type="color"
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                className="w-10 h-10 p-0.5 rounded-none cursor-pointer border-slate-200 shrink-0"
              />
              <Input
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                className="font-mono text-xs uppercase h-10 rounded-none border-slate-200 dark:border-white/10"
              />
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/10">
            <Label className="text-xs font-bold text-slate-900 dark:text-white">
              3. Màu Nhấn Chi Tiết (Accent Color)
            </Label>
            <p className="text-[10px] text-slate-400">
              Dùng cho các điểm nhấn nhỏ, chữ phản quang và trạng thái chủ chốt.
            </p>
            <div className="flex gap-2">
              <Input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-10 h-10 p-0.5 rounded-none cursor-pointer border-slate-200 shrink-0"
              />
              <Input
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="font-mono text-xs uppercase h-10 rounded-none border-slate-200 dark:border-white/10"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Preview Box */}
        <div className="space-y-3 lg:col-span-7 border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Xem Trước Phối Màu UI (Live Color Preview)
            </h4>
            <div className="flex items-center gap-1 bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("desktop")}
                className={`p-1 text-xs transition ${
                  viewMode === "desktop" ? "bg-white shadow-xs text-slate-900 dark:bg-slate-700 dark:text-white" : "text-slate-500"
                }`}
              >
                <Laptop className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className={`p-1 text-xs transition ${
                  viewMode === "mobile" ? "bg-white shadow-xs text-slate-900 dark:bg-slate-700 dark:text-white" : "text-slate-500"
                }`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            className={`mx-auto transition-all overflow-hidden border border-slate-200 shadow-md ${
              viewMode === "mobile" ? "max-w-xs" : "w-full"
            }`}
            style={{ backgroundColor: secondary }}
          >
            {/* Header mockup */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 flex items-center justify-center font-black text-white text-xs" style={{ backgroundColor: primary }}>
                  G
                </div>
                <span className="text-xs font-black uppercase text-white">GZV CENTER</span>
              </div>
              <Button size="sm" className="h-7 text-[10px] font-black uppercase rounded-none text-white" style={{ backgroundColor: primary }}>
                Đăng ký
              </Button>
            </div>

            {/* Hero Card mockup */}
            <div className="p-6 text-center text-white space-y-3">
              <Badge className="rounded-none text-[9px] font-black uppercase px-2 py-0.5 text-white" style={{ backgroundColor: primary }}>
                Mentoring & Coaching
              </Badge>
              <h3 className="text-2xl font-black uppercase leading-tight" style={{ color: accent }}>
                Kiến Tạo Thế Hệ Dẫn Đầu
              </h3>
              <p className="text-xs text-white/80 max-w-md mx-auto">
                Mô phỏng phối màu thực tế của giao diện website với bộ màu chủ đạo, màu nền và màu điểm nhấn bạn đang thiết lập.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button className="h-9 px-4 text-xs font-black uppercase rounded-none text-white" style={{ backgroundColor: primary }}>
                  Khám phá ngay
                </Button>
                <Button variant="outline" className="h-9 px-4 text-xs font-black uppercase rounded-none border-white/20 text-white hover:bg-white/10">
                  Xem chi tiết
                </Button>
              </div>
            </div>

            {/* Feature Cards mockup */}
            <div className="p-4 bg-white/5 border-t border-white/10 grid grid-cols-2 gap-3 text-left">
              <div className="p-3 border border-white/10 bg-white/5 space-y-1">
                <div className="h-2 w-10" style={{ backgroundColor: primary }} />
                <p className="text-xs font-bold text-white">Khóa học thực chiến</p>
                <p className="text-[10px] text-white/60">Đào tạo chuẩn doanh nghiệp</p>
              </div>
              <div className="p-3 border border-white/10 bg-white/5 space-y-1">
                <div className="h-2 w-10" style={{ backgroundColor: accent }} />
                <p className="text-xs font-bold text-white">Mạng lưới Mentor</p>
                <p className="text-[10px] text-white/60">20+ Chuyên gia hàng đầu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
