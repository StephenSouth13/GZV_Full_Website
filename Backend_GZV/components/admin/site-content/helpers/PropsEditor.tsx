import React, { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import {
  Filter,
  Link2,
  Palette,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Users,
  LayoutGrid,
  Sparkles,
  Milestone,
  CheckCircle2,
  BarChart3,
  Layers,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PageBlock } from "../types"
import { Field } from "./BasicHelpers"
import { ImagePositionAndZoomEditor } from "./ImagePositionAndZoomEditor"
import { PartnersSectionEditor } from "./PartnersSectionEditor"

function GzversGridPropsEditor({
  value = {},
  updateKey,
}: {
  value: Record<string, any>
  updateKey: (key: string, nextValue: any) => void
}) {
  const [activeDepts, setActiveDepts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    supabase
      .from("gzver_departments")
      .select("id, name, slug, description, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return
        if (error) console.error("Error fetching active departments:", error)
        setActiveDepts(data || [])
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const orderedDepts = useMemo(() => {
    const configuredOrder: string[] = Array.isArray(value.department_order)
      ? value.department_order
      : []

    const deptMap = new Map(activeDepts.map((d) => [d.slug || d.id, d]))
    const result: any[] = []
    const visited = new Set<string>()

    configuredOrder.forEach((key) => {
      const d = deptMap.get(key) || activeDepts.find((item) => item.slug === key || item.id === key)
      if (d && !visited.has(d.slug || d.id)) {
        result.push(d)
        visited.add(d.slug || d.id)
      }
    })

    activeDepts.forEach((d) => {
      const key = d.slug || d.id
      if (!visited.has(key)) {
        result.push(d)
        visited.add(key)
      }
    })

    return result
  }, [activeDepts, value.department_order])

  const selectedKeys = useMemo(() => {
    if (Array.isArray(value.selected_departments)) {
      return new Set(value.selected_departments)
    }
    // Default: all active departments are selected
    return new Set(activeDepts.map((d) => d.slug || d.id))
  }, [activeDepts, value.selected_departments])

  const [dragDeptIndex, setDragDeptIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleToggleDept = (deptKey: string, checked: boolean) => {
    const nextSet = new Set(selectedKeys)
    if (checked) {
      nextSet.add(deptKey)
    } else {
      nextSet.delete(deptKey)
    }
    updateKey("selected_departments", Array.from(nextSet))
  }

  const handleDropDept = (targetIndex: number) => {
    if (dragDeptIndex === null || dragDeptIndex === targetIndex) {
      setDragDeptIndex(null)
      setDragOverIndex(null)
      return
    }
    const nextList = [...orderedDepts]
    const [moved] = nextList.splice(dragDeptIndex, 1)
    nextList.splice(targetIndex, 0, moved)
    const nextOrder = nextList.map((d) => d.slug || d.id)
    updateKey("department_order", nextOrder)
    setDragDeptIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <Layers className="h-4 w-4 text-[#ed1c24]" />
        <div>
          <p className="text-xs font-black uppercase text-slate-950 dark:text-white">
            Cấu hình Cơ cấu Ban & Thứ tự Bộ lọc (GZVers Grid)
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-3">Đang tải danh sách phòng ban hoạt động...</p>
      ) : activeDepts.length === 0 ? (
        <div className="p-4 border border-dashed border-red-200 bg-red-50/50 text-center text-xs text-red-600 dark:border-red-900/30 dark:bg-red-950/20">
          Chưa có phòng ban nào đang bật trong module GZVers. Vui lòng vào <strong>GZVers &gt; Cơ cấu ban</strong> để bật ít nhất một ban.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Danh sách Ban ({orderedDepts.length} ban đang bật — Kéo thả sắp xếp)</span>
            <span>Trạng thái</span>
          </div>

          <div className="space-y-1.5">
            {orderedDepts.map((dept, index) => {
              const deptKey = dept.slug || dept.id
              const isSelected = selectedKeys.has(deptKey)
              const isDragging = dragDeptIndex === index
              const isDragOver = dragOverIndex === index

              return (
                <div
                  key={deptKey}
                  draggable
                  onDragStart={(e) => {
                    setDragDeptIndex(index)
                    e.dataTransfer.effectAllowed = "move"
                    e.dataTransfer.setData("text/plain", String(index))
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = "move"
                    if (dragOverIndex !== index) {
                      setDragOverIndex(index)
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverIndex === index) {
                      setDragOverIndex(null)
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDropDept(index)
                  }}
                  onDragEnd={() => {
                    setDragDeptIndex(null)
                    setDragOverIndex(null)
                  }}
                  className={`flex items-center justify-between p-2.5 border transition-all select-none ${isDragging
                    ? "opacity-40 border-[#ed1c24] bg-red-50/20"
                    : isDragOver
                      ? "border-t-2 border-t-[#ed1c24] bg-slate-100 dark:bg-slate-800"
                      : isSelected
                        ? "border-slate-200 bg-slate-50/80 hover:border-slate-300 dark:border-white/10 dark:bg-slate-950 dark:hover:border-white/20"
                        : "border-slate-200/50 bg-slate-100/40 opacity-60 dark:border-white/5 dark:bg-slate-950/30"
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
                      title="Kéo thả để đổi thứ tự"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-slate-200 text-[10px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {index + 1}
                    </span>

                    <Switch
                      checked={isSelected}
                      onCheckedChange={(checked) => handleToggleDept(deptKey, checked)}
                    />

                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate block">
                        {dept.name}
                      </span>
                      {dept.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-1 truncate">
                          {dept.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider shrink-0 pl-2">
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase ${isSelected
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                        }`}
                    >
                      {isSelected ? "Hiển thị" : "Ẩn"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Additional options */}
      <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between border border-slate-100 p-3 bg-slate-50/50 dark:border-white/5 dark:bg-slate-950">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Hiện tab &quot;Tất cả&quot;</p>
            <p className="text-[10px] text-slate-400">Xem toàn thể nhân sự</p>
          </div>
          <Switch
            checked={value?.show_all_tab !== false}
            onCheckedChange={(checked) => updateKey("show_all_tab", checked)}
          />
        </div>

        <Field label="Số lượng nhân sự tối đa (Limit)">
          <Input
            type="number"
            value={value.limit ?? 50}
            onChange={(e) => updateKey("limit", Number(e.target.value) || 50)}
            placeholder="50"
            className="rounded-none text-xs"
          />
        </Field>
      </div>
    </div>
  )
}

function ContactSectionPropsEditor({
  value = {},
  updateKey,
  onChange,
}: {
  value: Record<string, any>
  updateKey: (key: string, nextValue: any) => void
  onChange: (patch: Record<string, any>) => void
}) {
  return (
    <div className="space-y-6">
      {/* 1. Thông tin liên hệ (Cột trái) */}
      <div className="border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 shadow-2xs">
        <div className="border-b border-slate-200 pb-3 mb-4 dark:border-white/10 flex items-center gap-2">
          <div className="h-4 w-1 bg-[#ed1c24]" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            1. Cột Thông Tin Liên Hệ (Bên trái)
          </h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tiêu đề khối">
            <Input
              value={value.info_title ?? value.title ?? "THÔNG TIN LIÊN HỆ"}
              onChange={(e) => updateKey("info_title", e.target.value)}
              className="rounded-none h-9 text-xs font-bold"
            />
          </Field>

          <Field label="Mô tả phụ">
            <Input
              value={value.info_subtitle ?? value.subtitle ?? "Phản hồi nhanh trong vòng 24 giờ làm việc."}
              onChange={(e) => updateKey("info_subtitle", e.target.value)}
              className="rounded-none h-9 text-xs"
            />
          </Field>

          <Field label="Email liên hệ">
            <Input
              value={value.email ?? "vsm.org.vn@gmail.com"}
              onChange={(e) => updateKey("email", e.target.value)}
              placeholder="vsm.org.vn@gmail.com"
              className="rounded-none h-9 text-xs font-mono font-bold"
            />
          </Field>

          <Field label="Hotline / Số điện thoại">
            <Input
              value={value.phone ?? "0329 381 489"}
              onChange={(e) => updateKey("phone", e.target.value)}
              placeholder="0329 381 489"
              className="rounded-none h-9 text-xs font-bold"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Địa chỉ trụ sở">
              <Input
                value={value.address ?? "139 Nguyễn Thị Thập, Tân Hưng, Q.7, TP.HCM"}
                onChange={(e) => updateKey("address", e.target.value)}
                placeholder="139 Nguyễn Thị Thập, Tân Hưng, Q.7, TP.HCM"
                className="rounded-none h-9 text-xs font-semibold"
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Giờ làm việc">
              <Input
                value={value.working_hours ?? "Thứ 2 – Thứ 6: 8:00 – 18:00"}
                onChange={(e) => updateKey("working_hours", e.target.value)}
                placeholder="Thứ 2 – Thứ 6: 8:00 – 18:00"
                className="rounded-none h-9 text-xs"
              />
            </Field>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            Liên kết Mạng xã hội
          </Label>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Facebook URL">
              <Input
                value={value.social_facebook ?? "https://www.facebook.com/gzv.one"}
                onChange={(e) => updateKey("social_facebook", e.target.value)}
                placeholder="https://facebook.com/..."
                className="rounded-none h-9 text-xs font-mono"
              />
            </Field>
            <Field label="YouTube URL">
              <Input
                value={value.social_youtube ?? "https://youtube.com"}
                onChange={(e) => updateKey("social_youtube", e.target.value)}
                placeholder="https://youtube.com/..."
                className="rounded-none h-9 text-xs font-mono"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* 2. Biểu mẫu gửi tin nhắn (Cột phải) */}
      <div className="border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 shadow-2xs">
        <div className="border-b border-slate-200 pb-3 mb-4 dark:border-white/10 flex items-center gap-2">
          <div className="h-4 w-1 bg-[#ed1c24]" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            2. Cột Biểu Mẫu Gửi Tin Nhắn (Bên phải)
          </h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tiêu đề Form">
            <Input
              value={value.form_title ?? "GỬI TIN NHẮN"}
              onChange={(e) => updateKey("form_title", e.target.value)}
              className="rounded-none h-9 text-xs font-bold"
            />
          </Field>

          <Field label="Nút gửi Form">
            <Input
              value={value.submit_label ?? "GỬI TIN NHẮN"}
              onChange={(e) => updateKey("submit_label", e.target.value)}
              className="rounded-none h-9 text-xs font-bold text-[#ed1c24]"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Mô tả dưới tiêu đề form">
              <Input
                value={value.form_description ?? "Chúng tôi sẽ phản hồi qua email bạn cung cấp."}
                onChange={(e) => updateKey("form_description", e.target.value)}
                className="rounded-none h-9 text-xs"
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Thông báo gửi thành công">
              <Input
                value={value.success_message ?? "Cảm ơn bạn! Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất."}
                onChange={(e) => updateKey("success_message", e.target.value)}
                className="rounded-none h-9 text-xs text-emerald-600 font-bold"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* 3. Bản đồ Google Maps */}
      <div className="border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 shadow-2xs">
        <div className="border-b border-slate-200 pb-3 mb-4 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-[#ed1c24]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              3. Bản Đồ Google Maps
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={value.map_enabled !== false}
              onCheckedChange={(v) => updateKey("map_enabled", v)}
            />
            <span className="text-[10px] font-black uppercase text-slate-500">
              {value.map_enabled !== false ? "Bật" : "Tắt"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Tiêu đề khối bản đồ">
            <Input
              value={value.map_title ?? "Tìm chúng tôi trên bản đồ"}
              onChange={(e) => updateKey("map_title", e.target.value)}
              className="rounded-none h-9 text-xs font-bold"
            />
          </Field>

          <Field label="Google Maps iframe Embed URL (src)">
            <Textarea
              rows={3}
              value={value.map_embed_url ?? ""}
              onChange={(e) => updateKey("map_embed_url", e.target.value)}
              placeholder="Dán mã nhúng iframe src từ Google Maps (VD: https://www.google.com/maps/embed?pb=...)"
              className="rounded-none text-xs font-mono resize-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Lưu ý: Lấy link từ Google Maps &gt; Chia sẻ &gt; Nhúng bản đồ (chọn sao chép HTML hoặc link src). Không dùng link trang chủ Google thông thường để tránh lỗi bảo mật X-Frame-Options.
            </p>
          </Field>
        </div>
      </div>
    </div>
  )
}

function GoogleMapPropsEditor({
  value = {},
  updateKey,
}: {
  value: Record<string, any>
  updateKey: (key: string, nextValue: any) => void
}) {
  return (
    <div className="space-y-4">
      <div className="border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 shadow-2xs">
        <div className="border-b border-slate-200 pb-3 mb-4 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-[#ed1c24]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Cấu hình Bản Đồ Google Maps
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={value.map_enabled !== false}
              onCheckedChange={(v) => updateKey("map_enabled", v)}
            />
            <span className="text-[10px] font-black uppercase text-slate-500">
              {value.map_enabled !== false ? "Bật" : "Tắt"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tiêu đề khối bản đồ">
              <Input
                value={value.title ?? value.map_title ?? "Tìm chúng tôi trên bản đồ"}
                onChange={(e) => {
                  updateKey("title", e.target.value)
                  updateKey("map_title", e.target.value)
                }}
                className="rounded-none h-9 text-xs font-bold"
              />
            </Field>

            <Field label="Chiều cao bản đồ">
              <Select
                value={value.height || "medium"}
                onValueChange={(v) => updateKey("height", v)}
              >
                <SelectTrigger className="rounded-none h-9 text-xs">
                  <SelectValue placeholder="Chọn chiều cao..." />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="small" className="text-xs">Nhỏ (300px)</SelectItem>
                  <SelectItem value="medium" className="text-xs">Vừa (420px - Mặc định)</SelectItem>
                  <SelectItem value="large" className="text-xs">Lớn (550px)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Địa chỉ hiển thị dưới tiêu đề">
            <Input
              value={value.address ?? "139 Nguyễn Thị Thập, Tân Hưng, Q.7, TP.HCM"}
              onChange={(e) => updateKey("address", e.target.value)}
              placeholder="139 Nguyễn Thị Thập, Tân Hưng, Q.7, TP.HCM"
              className="rounded-none h-9 text-xs font-semibold"
            />
          </Field>

          <Field label="Google Maps iframe Embed URL (src)">
            <Textarea
              rows={3}
              value={value.map_embed_url ?? ""}
              onChange={(e) => updateKey("map_embed_url", e.target.value)}
              placeholder="Dán mã nhúng iframe src từ Google Maps (VD: https://www.google.com/maps/embed?pb=...)"
              className="rounded-none text-xs font-mono resize-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Lưu ý: Lấy link từ Google Maps &gt; Chia sẻ &gt; Nhúng bản đồ (chọn sao chép HTML hoặc link src). Không dùng link trang chủ Google thông thường để tránh lỗi bảo mật X-Frame-Options.
            </p>
          </Field>
        </div>
      </div>
    </div>
  )
}

export function PropsEditor({
  value = {},
  onChange,
  onPickSingleImage,
  componentType = "",
}: {
  value: Record<string, any>
  onChange: (value: Record<string, any>) => void
  onPickSingleImage?: () => void
  componentType?: string
}) {
  const updateKey = (key: string, nextValue: any) => {
    onChange({ ...(value || {}), [key]: nextValue })
  }

  const typeLower = (componentType || "").toLowerCase().trim()

  const isMap =
    typeLower === "google_map" ||
    typeLower === "map_block" ||
    typeLower === "map_section" ||
    typeLower.includes("google_map") ||
    typeLower.includes("google-map")

  if (isMap) {
    return <GoogleMapPropsEditor value={value} updateKey={updateKey} />
  }

  const isContact =
    (typeLower.includes("contact") ||
      typeLower.includes("lien-he") ||
      typeLower.includes("lien_he")) &&
    !isMap

  if (isContact) {
    return (
      <ContactSectionPropsEditor
        value={value}
        updateKey={updateKey}
        onChange={onChange}
      />
    )
  }

  // Detection flags for component categories
  const isGzversGrid = typeLower === "gzvers_grid" || typeLower.includes("gzvers") || typeLower.includes("gzver")
  const isMentoring = typeLower.includes("mentor") || typeLower.includes("step")
  const isTimeline = typeLower.includes("timeline") || typeLower.includes("roadmap")
  const isPeople = (typeLower.includes("people") || typeLower.includes("director") || typeLower.includes("team")) && !isGzversGrid
  const isCore = typeLower.includes("core")
  const isFeatureGrid = (typeLower.includes("feature") || (typeLower.includes("grid") && !isPeople && !isGzversGrid && !typeLower.includes("project") && !typeLower.includes("partner") && !typeLower.includes("news") && !typeLower.includes("mentor")))
  const isStats = typeLower.includes("stat")
  const isProjects = typeLower.includes("project") || typeLower.includes("du-an") || typeLower.includes("du_an")
  const isPartners = typeLower.includes("partner") || typeLower.includes("doi-tac")
  const isNews = typeLower.includes("news") || typeLower.includes("tin-tuc")
  const isAboutBoxes = typeLower.includes("about_box") || typeLower.includes("about-box")
  const isWhyColumns = typeLower.includes("why")
  const isServices = typeLower.includes("service")
  const isCta = typeLower.includes("cta") || typeLower.includes("band") || value?.buttonLabel !== undefined || value?.button_label !== undefined || value?.buttonUrl !== undefined || value?.button_url !== undefined
  const isBgConfigurable = !isStats && (isCta || value?.backgroundFrom !== undefined || value?.background_from !== undefined || value?.backgroundColor !== undefined || value?.background_color !== undefined)

  // Content flags
  const hasBody = value?.body !== undefined || value?.description !== undefined || typeLower.includes("story") || typeLower.includes("about_gzv")
  const hasImage = value?.image_url !== undefined || value?.image !== undefined || value?.position_x !== undefined || typeLower.includes("story") || typeLower.includes("about_gzv")
  const hasStatsArray = Array.isArray(value?.stats) || isStats || typeLower.includes("story")

  return (
    <div className="space-y-6 rounded-none border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-slate-950">

      {/* 0. GZVers Grid Department Order & Selection Config */}
      {isGzversGrid && (
        <GzversGridPropsEditor value={value} updateKey={updateKey} />
      )}

      {/* 0.1. Partners Grid Configuration */}
      {isPartners && (
        <PartnersSectionEditor value={value} updateKey={updateKey} onChange={onChange} />
      )}

      {/* 1. Projects Grid Config */}
      {isProjects && (
        <div className="space-y-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            <Filter className="h-4 w-4 text-[#ed1c24]" />
            <div>
              <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Cấu hình Bộ lọc & Tìm kiếm Dự án</p>
              <p className="text-[11px] text-slate-500">Tùy chọn ẩn/hiện thanh tìm kiếm, bộ lọc danh mục và số lượng dự án.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between border border-slate-100 p-3 bg-slate-50/50 dark:border-white/5 dark:bg-slate-950">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Hiện thanh tìm kiếm</p>
                <p className="text-[10px] text-slate-400">Ô gõ tìm kiếm tên dự án</p>
              </div>
              <Switch
                checked={value?.show_search !== false && value?.showSearch !== false}
                onCheckedChange={(checked) => {
                  updateKey("show_search", checked)
                  if (value.showSearch !== undefined) updateKey("showSearch", checked)
                }}
              />
            </div>

            <div className="flex items-center justify-between border border-slate-100 p-3 bg-slate-50/50 dark:border-white/5 dark:bg-slate-950">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Hiện bộ lọc danh mục</p>
                <p className="text-[10px] text-slate-400">Các nút: Marketing, Sales, v.v.</p>
              </div>
              <Switch
                checked={value?.show_categories !== false && value?.showCategories !== false && value?.show_filter !== false}
                onCheckedChange={(checked) => {
                  updateKey("show_categories", checked)
                  if (value.showCategories !== undefined) updateKey("showCategories", checked)
                }}
              />
            </div>
          </div>

          <Field label="Số lượng dự án hiển thị tối đa (Limit)">
            <Input
              type="number"
              value={value.limit ?? 6}
              onChange={(e) => updateKey("limit", Number(e.target.value))}
              placeholder="6"
              className="rounded-none text-xs w-full sm:w-48"
            />
          </Field>
        </div>
      )}

      {/* 2. People Grid Config (Ban điều hành / GZVers) */}
      {isPeople && (
        <div className="space-y-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            <Users className="h-4 w-4 text-[#ed1c24]" />
            <div>
              <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Cấu hình Hiển thị Nhân sự (People Grid)</p>
              <p className="text-[11px] text-slate-500">Chọn nhóm nhân sự và số lượng hiển thị từ hệ thống GZVers.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nhóm nhân sự hiển thị">
              <Select
                value={value.type || "directors"}
                onValueChange={(val) => updateKey("type", val)}
              >
                <SelectTrigger className="rounded-none text-xs">
                  <SelectValue placeholder="Chọn nhóm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="directors">Ban điều hành (Directors)</SelectItem>
                  <SelectItem value="all">Toàn bộ GZVers</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Số lượng nhân sự tối đa (Limit)">
              <Input
                type="number"
                value={value.limit ?? 6}
                onChange={(e) => updateKey("limit", Number(e.target.value))}
                placeholder="6"
                className="rounded-none text-xs"
              />
            </Field>
          </div>
        </div>
      )}

      {/* 3. Mentoring Model / Steps Editor */}
      {isMentoring && (
        <div className="space-y-3 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Milestone className="h-4 w-4 text-[#ed1c24]" />
              <div>
                <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Các bước Mô hình Mentoring</p>
                <p className="text-[11px] text-slate-500">Chỉnh sửa nội dung các giai đoạn hoặc bước hướng dẫn.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none text-[11px] font-black uppercase h-7 border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white"
              onClick={() => {
                const current = Array.isArray(value.steps) ? [...value.steps] : []
                updateKey("steps", [...current, { title: "Bước mới", description: "Mô tả chi tiết bước này..." }])
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Thêm bước
            </Button>
          </div>

          <div className="space-y-3">
            {(Array.isArray(value.steps) ? value.steps : []).map((step: any, idx: number) => (
              <div key={idx} className="border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-[#ed1c24]">Bước {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:bg-red-50"
                    onClick={() => {
                      const current = Array.isArray(value.steps) ? [...value.steps] : []
                      updateKey("steps", current.filter((_: any, i: number) => i !== idx))
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Field label="Tiêu đề bước">
                  <Input
                    value={step.title || ""}
                    onChange={(e) => {
                      const current = Array.isArray(value.steps) ? [...value.steps] : []
                      current[idx] = { ...(current[idx] || {}), title: e.target.value }
                      updateKey("steps", current)
                    }}
                    placeholder="Ví dụ: Đánh giá năng lực"
                    className="rounded-none text-xs font-bold bg-white dark:bg-slate-900"
                  />
                </Field>
                <Field label="Mô tả bước">
                  <Textarea
                    rows={2}
                    value={step.description || ""}
                    onChange={(e) => {
                      const current = Array.isArray(value.steps) ? [...value.steps] : []
                      current[idx] = { ...(current[idx] || {}), description: e.target.value }
                      updateKey("steps", current)
                    }}
                    placeholder="Mô tả nội dung chi tiết bước này..."
                    className="rounded-none text-xs bg-white dark:bg-slate-900"
                  />
                </Field>
              </div>
            ))}
            {(!Array.isArray(value.steps) || value.steps.length === 0) && (
              <p className="text-center text-xs text-slate-400 py-3">Chưa có bước nào. Bấm &quot;Thêm bước&quot; để tạo.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. Timeline / Roadmap Editor */}
      {isTimeline && (
        <div className="space-y-3 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Milestone className="h-4 w-4 text-[#ed1c24]" />
              <div>
                <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Lộ trình Phát triển (Timeline)</p>
                <p className="text-[11px] text-slate-500">Chỉnh sửa các mốc thời gian hoặc giai đoạn phát triển.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none text-[11px] font-black uppercase h-7 border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white"
              onClick={() => {
                const current = Array.isArray(value.items) ? [...value.items] : []
                updateKey("items", [...current, { year: `Giai đoạn ${current.length + 1}`, title: "Mốc mới", description: "Mô tả mốc này..." }])
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Thêm mốc
            </Button>
          </div>

          <div className="space-y-3">
            {(Array.isArray(value.items) ? value.items : []).map((item: any, idx: number) => (
              <div key={idx} className="border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-[#ed1c24]">Mốc #{idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:bg-red-50"
                    onClick={() => {
                      const current = Array.isArray(value.items) ? [...value.items] : []
                      updateKey("items", current.filter((_: any, i: number) => i !== idx))
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Giai đoạn / Thời gian">
                    <Input
                      value={item.year || item.label || ""}
                      onChange={(e) => {
                        const current = Array.isArray(value.items) ? [...value.items] : []
                        current[idx] = { ...(current[idx] || {}), year: e.target.value }
                        updateKey("items", current)
                      }}
                      placeholder="Ví dụ: Giai đoạn 1, 2024..."
                      className="rounded-none text-xs font-black text-[#ed1c24] bg-white dark:bg-slate-900"
                    />
                  </Field>
                  <Field label="Tiêu đề mốc">
                    <Input
                      value={item.title || ""}
                      onChange={(e) => {
                        const current = Array.isArray(value.items) ? [...value.items] : []
                        current[idx] = { ...(current[idx] || {}), title: e.target.value }
                        updateKey("items", current)
                      }}
                      placeholder="Ví dụ: Xây nền cộng đồng"
                      className="rounded-none text-xs font-bold bg-white dark:bg-slate-900"
                    />
                  </Field>
                </div>
                <Field label="Mô tả chi tiết">
                  <Textarea
                    rows={2}
                    value={item.description || ""}
                    onChange={(e) => {
                      const current = Array.isArray(value.items) ? [...value.items] : []
                      current[idx] = { ...(current[idx] || {}), description: e.target.value }
                      updateKey("items", current)
                    }}
                    placeholder="Mô tả nội dung mốc thời gian này..."
                    className="rounded-none text-xs bg-white dark:bg-slate-900"
                  />
                </Field>
              </div>
            ))}
            {(!Array.isArray(value.items) || value.items.length === 0) && (
              <p className="text-center text-xs text-slate-400 py-3">Chưa có mốc thời gian nào. Bấm &quot;Thêm mốc&quot; để tạo.</p>
            )}
          </div>
        </div>
      )}

      {/* 5. Core Showcase (Sứ mệnh, Tầm nhìn, Giá trị cốt lõi) */}
      {isCore && (
        <div className="space-y-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            <Sparkles className="h-4 w-4 text-[#ed1c24]" />
            <div>
              <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Cấu hình Sứ mệnh, Tầm nhìn, Giá trị cốt lõi</p>
              <p className="text-[11px] text-slate-500">Chỉnh sửa các điểm nhấn và các mục nội dung chi tiết.</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
              3 Điểm nhấn nổi bật (Highlights)
            </Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {[0, 1, 2].map((idx) => {
                const highlights = Array.isArray(value.highlights) ? [...value.highlights] : ["Thực chiến", "Minh bạch", "Học hỏi liên tục"]
                return (
                  <Input
                    key={idx}
                    value={highlights[idx] || ""}
                    onChange={(e) => {
                      const next = [...highlights]
                      next[idx] = e.target.value
                      updateKey("highlights", next)
                    }}
                    placeholder={`Điểm nhấn ${idx + 1}`}
                    className="rounded-none text-xs font-bold"
                  />
                )
              })}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-1">
              <Label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
                Các khối nội dung (Sứ mệnh / Tầm nhìn / Giá trị)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none text-[11px] font-black uppercase h-7 border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white"
                onClick={() => {
                  const current = Array.isArray(value.items) ? [...value.items] : []
                  updateKey("items", [...current, { label: `0${current.length + 1}`, title: "Tiêu đề mới", description: "Mô tả..." }])
                }}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Thêm mục
              </Button>
            </div>

            <div className="space-y-3">
              {(Array.isArray(value.items) ? value.items : []).map((item: any, idx: number) => (
                <div key={idx} className="border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-[#ed1c24]">Mục #{idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:bg-red-50"
                      onClick={() => {
                        const current = Array.isArray(value.items) ? [...value.items] : []
                        updateKey("items", current.filter((_: any, i: number) => i !== idx))
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[80px_1fr]">
                    <Field label="Số thứ tự">
                      <Input
                        value={item.label || `0${idx + 1}`}
                        onChange={(e) => {
                          const current = Array.isArray(value.items) ? [...value.items] : []
                          current[idx] = { ...(current[idx] || {}), label: e.target.value }
                          updateKey("items", current)
                        }}
                        placeholder="01"
                        className="rounded-none text-xs font-black text-center bg-white dark:bg-slate-900"
                      />
                    </Field>
                    <Field label="Tiêu đề">
                      <Input
                        value={item.title || ""}
                        onChange={(e) => {
                          const current = Array.isArray(value.items) ? [...value.items] : []
                          current[idx] = { ...(current[idx] || {}), title: e.target.value }
                          updateKey("items", current)
                        }}
                        placeholder="Ví dụ: Sứ mệnh"
                        className="rounded-none text-xs font-bold bg-white dark:bg-slate-900"
                      />
                    </Field>
                  </div>
                  <Field label="Mô tả">
                    <Textarea
                      rows={2}
                      value={item.description || item.text || ""}
                      onChange={(e) => {
                        const current = Array.isArray(value.items) ? [...value.items] : []
                        current[idx] = { ...(current[idx] || {}), description: e.target.value }
                        updateKey("items", current)
                      }}
                      placeholder="Mô tả chi tiết..."
                      className="rounded-none text-xs bg-white dark:bg-slate-900"
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Feature Grid Editor (Sứ mệnh, Tầm nhìn, Giá trị cốt lõi đơn lẻ) */}
      {isFeatureGrid && !isCore && (
        <div className="space-y-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-[#ed1c24]" />
              <div>
                <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Cấu hình Danh sách Tính năng / Thẻ (Feature Grid)</p>
                <p className="text-[11px] text-slate-500">Chỉnh sửa số cột hiển thị và danh sách các thẻ nội dung kèm icon.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none text-[11px] font-black uppercase h-7 border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white"
              onClick={() => {
                const current = Array.isArray(value.items) ? [...value.items] : []
                updateKey("items", [...current, { title: "Tiêu đề thẻ", description: "Mô tả nội dung thẻ...", icon: "target", color: "#ed1c24" }])
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Thêm thẻ
            </Button>
          </div>

          <Field label="Số cột hiển thị trên Desktop">
            <Select
              value={String(value.columns ?? 3)}
              onValueChange={(val) => updateKey("columns", Number(val))}
            >
              <SelectTrigger className="rounded-none text-xs w-full sm:w-48">
                <SelectValue placeholder="Số cột" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Cột (Rộng tràn viền)</SelectItem>
                <SelectItem value="2">2 Cột</SelectItem>
                <SelectItem value="3">3 Cột</SelectItem>
                <SelectItem value="4">4 Cột</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="space-y-3">
            {(Array.isArray(value.items) ? value.items : []).map((item: any, idx: number) => (
              <div key={idx} className="border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-[#ed1c24]">Thẻ #{idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:bg-red-50"
                    onClick={() => {
                      const current = Array.isArray(value.items) ? [...value.items] : []
                      updateKey("items", current.filter((_: any, i: number) => i !== idx))
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_140px_140px]">
                  <Field label="Tiêu đề">
                    <Input
                      value={item.title || ""}
                      onChange={(e) => {
                        const current = Array.isArray(value.items) ? [...value.items] : []
                        current[idx] = { ...(current[idx] || {}), title: e.target.value }
                        updateKey("items", current)
                      }}
                      placeholder="Ví dụ: Thực chiến"
                      className="rounded-none text-xs font-bold bg-white dark:bg-slate-900"
                    />
                  </Field>
                  <Field label="Icon biểu tượng">
                    <Select
                      value={item.icon || "target"}
                      onValueChange={(val) => {
                        const current = Array.isArray(value.items) ? [...value.items] : []
                        current[idx] = { ...(current[idx] || {}), icon: val }
                        updateKey("items", current)
                      }}
                    >
                      <SelectTrigger className="rounded-none text-xs bg-white dark:bg-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="target">Target (Mục tiêu)</SelectItem>
                        <SelectItem value="compass">Compass (Định hướng)</SelectItem>
                        <SelectItem value="rocket">Rocket (Bứt phá)</SelectItem>
                        <SelectItem value="shield">Shield (Bảo vệ)</SelectItem>
                        <SelectItem value="book">Book (Tri thức)</SelectItem>
                        <SelectItem value="award">Award (Giải thưởng)</SelectItem>
                        <SelectItem value="users">Users (Đội ngũ)</SelectItem>
                        <SelectItem value="cpu">CPU (Công nghệ)</SelectItem>
                        <SelectItem value="trend">Trend (Tăng trưởng)</SelectItem>
                        <SelectItem value="megaphone">Megaphone (Truyền thông)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Màu sắc icon">
                    <div className="flex gap-1">
                      <Input
                        type="color"
                        value={item.color || "#ed1c24"}
                        onChange={(e) => {
                          const current = Array.isArray(value.items) ? [...value.items] : []
                          current[idx] = { ...(current[idx] || {}), color: e.target.value }
                          updateKey("items", current)
                        }}
                        className="w-10 h-8 p-1 rounded-none cursor-pointer shrink-0"
                      />
                      <Input
                        value={item.color || "#ed1c24"}
                        onChange={(e) => {
                          const current = Array.isArray(value.items) ? [...value.items] : []
                          current[idx] = { ...(current[idx] || {}), color: e.target.value }
                          updateKey("items", current)
                        }}
                        className="rounded-none font-mono text-[11px] h-8 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Mô tả nội dung thẻ">
                  <Textarea
                    rows={2}
                    value={item.description || ""}
                    onChange={(e) => {
                      const current = Array.isArray(value.items) ? [...value.items] : []
                      current[idx] = { ...(current[idx] || {}), description: e.target.value }
                      updateKey("items", current)
                    }}
                    placeholder="Mô tả nội dung chi tiết..."
                    className="rounded-none text-xs bg-white dark:bg-slate-900"
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Services / Why Columns / About Boxes Editor */}
      {(isServices || isWhyColumns || isAboutBoxes) && (
        <div className="space-y-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#ed1c24]" />
              <div>
                <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Danh sách Khối / Cột nội dung</p>
                <p className="text-[11px] text-slate-500">Tùy chỉnh các mục hiển thị trong section.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none text-[11px] font-black uppercase h-7 border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white"
              onClick={() => {
                const arrayKey = isAboutBoxes ? "boxes" : isWhyColumns ? "columns" : "items"
                const current = Array.isArray(value[arrayKey]) ? [...value[arrayKey]] : []
                updateKey(arrayKey, [...current, { title: "Tiêu đề mới", description: "Mô tả nội dung...", href: "/" }])
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Thêm mục
            </Button>
          </div>

          <div className="space-y-3">
            {(() => {
              const arrayKey = isAboutBoxes ? "boxes" : isWhyColumns ? "columns" : "items"
              const itemsList = Array.isArray(value[arrayKey]) ? value[arrayKey] : []
              return itemsList.map((item: any, idx: number) => (
                <div key={idx} className="border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-[#ed1c24]">Mục #{idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:bg-red-50"
                      onClick={() => {
                        const current = Array.isArray(value[arrayKey]) ? [...value[arrayKey]] : []
                        updateKey(arrayKey, current.filter((_: any, i: number) => i !== idx))
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Field label="Tiêu đề mục">
                      <Input
                        value={item.title || ""}
                        onChange={(e) => {
                          const current = Array.isArray(value[arrayKey]) ? [...value[arrayKey]] : []
                          current[idx] = { ...(current[idx] || {}), title: e.target.value }
                          updateKey(arrayKey, current)
                        }}
                        placeholder="Tiêu đề..."
                        className="rounded-none text-xs font-bold bg-white dark:bg-slate-900"
                      />
                    </Field>
                    {item.href !== undefined && (
                      <Field label="Đường dẫn liên kết (Link)">
                        <Input
                          value={item.href || ""}
                          onChange={(e) => {
                            const current = Array.isArray(value[arrayKey]) ? [...value[arrayKey]] : []
                            current[idx] = { ...(current[idx] || {}), href: e.target.value }
                            updateKey(arrayKey, current)
                          }}
                          placeholder="/dich-vu, /du-an..."
                          className="rounded-none text-xs font-mono bg-white dark:bg-slate-900"
                        />
                      </Field>
                    )}
                  </div>
                  <Field label="Mô tả nội dung">
                    <Textarea
                      rows={2}
                      value={item.description || ""}
                      onChange={(e) => {
                        const current = Array.isArray(value[arrayKey]) ? [...value[arrayKey]] : []
                        current[idx] = { ...(current[idx] || {}), description: e.target.value }
                        updateKey(arrayKey, current)
                      }}
                      placeholder="Mô tả nội dung..."
                      className="rounded-none text-xs bg-white dark:bg-slate-900"
                    />
                  </Field>
                </div>
              ))
            })()}
          </div>
        </div>
      )}

      {/* 8. Body / Description Field (StorySplit / AboutGzv / v.v.) */}
      {hasBody && !isProjects && (
        <div className="space-y-2 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <Label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
            Nội dung chi tiết / Đoạn văn bản (Body / Description)
          </Label>
          <Textarea
            rows={4}
            value={value.body ?? value.description ?? ""}
            onChange={(e) => {
              if (value.description !== undefined) {
                updateKey("description", e.target.value)
              } else {
                updateKey("body", e.target.value)
              }
            }}
            className="rounded-none text-xs leading-relaxed border-slate-300 bg-white dark:bg-slate-900 dark:border-white/10"
            placeholder="Nhập nội dung mô tả chi tiết của section..."
          />
        </div>
      )}

      {/* 9. Image Editor with Drag-to-align & Zoom */}
      {hasImage && (
        <ImagePositionAndZoomEditor
          imageUrl={value.image_url || value.image || ""}
          positionX={value.position_x ?? 50}
          positionY={value.position_y ?? 50}
          imageSize={value.image_size ?? 100}
          onChange={(patch) => onChange({ ...(value || {}), ...patch })}
          onPickImage={onPickSingleImage}
          title="Ảnh minh họa Section"
        />
      )}

      {/* 10. Stats Field (Số liệu thống kê) */}
      {hasStatsArray && (
        <div className="space-y-3 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#ed1c24]" />
              <div>
                <Label className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  Chỉ số thống kê (Stats)
                </Label>
                <p className="text-[11px] text-slate-500">Các khối số liệu nổi bật hiển thị kèm theo section.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none text-[11px] font-black uppercase h-7 border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white transition"
              onClick={() => {
                const current = Array.isArray(value.stats) ? [...value.stats] : []
                updateKey("stats", [...current, { label: "Nhãn mới", value: "10+", description: "Mô tả ngắn" }])
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Thêm chỉ số
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(value.stats || []).map((st: any, idx: number) => (
              <div
                key={idx}
                className="border border-slate-200 bg-slate-50 p-3 shadow-2xs dark:border-white/10 dark:bg-slate-950 space-y-2 relative"
              >
                <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#ed1c24]">
                    Chỉ số #{idx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => {
                      const current = Array.isArray(value.stats) ? [...value.stats] : []
                      updateKey("stats", current.filter((_, i) => i !== idx))
                    }}
                    title="Xóa chỉ số"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Field label="Số liệu hiển thị">
                  <Input
                    value={st.value || ""}
                    onChange={(e) => {
                      const current = Array.isArray(value.stats) ? [...value.stats] : []
                      current[idx] = { ...(current[idx] || {}), value: e.target.value }
                      updateKey("stats", current)
                    }}
                    placeholder="Ví dụ: 50+, 5000+, 95%..."
                    className="h-8 text-xs font-black rounded-none font-mono bg-white dark:bg-slate-900"
                  />
                </Field>

                <Field label="Nhãn mô tả chính">
                  <Input
                    value={st.label || ""}
                    onChange={(e) => {
                      const current = Array.isArray(value.stats) ? [...value.stats] : []
                      current[idx] = { ...(current[idx] || {}), label: e.target.value }
                      updateKey("stats", current)
                    }}
                    placeholder="Ví dụ: Doanh nghiệp, Học viên..."
                    className="h-8 text-xs font-bold rounded-none bg-white dark:bg-slate-900"
                  />
                </Field>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Bật mô tả phụ
                  </span>
                  <Switch
                    checked={Boolean(st.description !== undefined && st.description !== "" && st.show_description !== false)}
                    onCheckedChange={(checked) => {
                      const current = Array.isArray(value.stats) ? [...value.stats] : []
                      current[idx] = {
                        ...(current[idx] || {}),
                        show_description: checked,
                        description: checked ? (st.description || "Mô tả ngắn...") : "",
                      }
                      updateKey("stats", current)
                    }}
                  />
                </div>

                {Boolean(st.description !== undefined && st.description !== "" && st.show_description !== false) && (
                  <Field label="Nội dung mô tả phụ">
                    <Input
                      value={st.description || ""}
                      onChange={(e) => {
                        const current = Array.isArray(value.stats) ? [...value.stats] : []
                        current[idx] = { ...(current[idx] || {}), description: e.target.value }
                        updateKey("stats", current)
                      }}
                      placeholder="Ví dụ: Đối tác chiến lược..."
                      className="h-8 text-xs rounded-none bg-white dark:bg-slate-900"
                    />
                  </Field>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. CTA Button & Link Config */}
      {isCta && (
        <div className="space-y-3 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            <Link2 className="h-4 w-4 text-[#ed1c24]" />
            <div>
              <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Cấu hình Nút bấm & Liên kết (CTA Button)</p>
              <p className="text-[11px] text-slate-500">Tên hiển thị trên nút và đường dẫn khi người dùng nhấp vào.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tên nút bấm (CTA Label)">
              <Input
                value={value.buttonLabel ?? value.button_label ?? value.button_text ?? ""}
                onChange={(e) => {
                  if (value.button_label !== undefined) {
                    updateKey("button_label", e.target.value)
                  } else {
                    updateKey("buttonLabel", e.target.value)
                  }
                }}
                placeholder="Ví dụ: Liên hệ ngay"
                className="rounded-none text-xs font-bold"
              />
            </Field>
            <Field label="Đường dẫn nút bấm (CTA URL)">
              <Input
                value={value.buttonUrl ?? value.button_url ?? value.button_link ?? ""}
                onChange={(e) => {
                  if (value.button_url !== undefined) {
                    updateKey("button_url", e.target.value)
                  } else {
                    updateKey("buttonUrl", e.target.value)
                  }
                }}
                placeholder="Ví dụ: /lien-he hoặc https://..."
                className="rounded-none text-xs font-mono"
              />
            </Field>
          </div>
        </div>
      )}

      {/* 12. Background Color / Gradient Config */}
      {isBgConfigurable && (
        <div className="space-y-3 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
            <Palette className="h-4 w-4 text-[#ed1c24]" />
            <div>
              <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Màu nền Section (Background Color / Gradient)</p>
              <p className="text-[11px] text-slate-500">Tùy chỉnh màu sắc nền đơn sắc hoặc gradient trải dài.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Màu nền / Gradient Bắt đầu (From)">
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={value.backgroundFrom || value.background_from || value.backgroundColor || value.background_color || "#050505"}
                  onChange={(e) => {
                    if (value.background_from !== undefined) {
                      updateKey("background_from", e.target.value)
                    } else {
                      updateKey("backgroundFrom", e.target.value)
                    }
                  }}
                  className="w-14 h-9 p-1 rounded-none cursor-pointer shrink-0 border-slate-300"
                />
                <Input
                  value={value.backgroundFrom || value.background_from || value.backgroundColor || value.background_color || "#050505"}
                  onChange={(e) => {
                    if (value.background_from !== undefined) {
                      updateKey("background_from", e.target.value)
                    } else {
                      updateKey("backgroundFrom", e.target.value)
                    }
                  }}
                  className="rounded-none font-mono text-xs"
                  placeholder="#050505"
                />
              </div>
            </Field>

            <Field label="Màu nền / Gradient Kết thúc (To)">
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={value.backgroundTo || value.background_to || value.backgroundColor || value.background_color || "#ed1c24"}
                  onChange={(e) => {
                    if (value.background_to !== undefined) {
                      updateKey("background_to", e.target.value)
                    } else {
                      updateKey("backgroundTo", e.target.value)
                    }
                  }}
                  className="w-14 h-9 p-1 rounded-none cursor-pointer shrink-0 border-slate-300"
                />
                <Input
                  value={value.backgroundTo || value.background_to || value.backgroundColor || value.background_color || "#ed1c24"}
                  onChange={(e) => {
                    if (value.background_to !== undefined) {
                      updateKey("background_to", e.target.value)
                    } else {
                      updateKey("backgroundTo", e.target.value)
                    }
                  }}
                  className="rounded-none font-mono text-xs"
                  placeholder="#ed1c24"
                />
              </div>
            </Field>
          </div>

          {/* Live Gradient Preview Strip */}
          <div
            className="h-10 w-full flex items-center justify-center text-xs font-bold text-white rounded-none shadow-inner select-none transition-all"
            style={{
              background: `linear-gradient(90deg, ${value.backgroundFrom || value.background_from || value.backgroundColor || value.background_color || "#050505"}, ${value.backgroundTo || value.background_to || value.backgroundColor || value.background_color || "#ed1c24"})`,
            }}
          >
            Xem trước màu nền Section
          </div>
        </div>
      )}

    </div>
  )
}

export function BlockPropsEditor({
  block,
  blockIndex,
  onChange,
  onPickImage,
  onPickSingleImage,
}: {
  block: PageBlock
  blockIndex: number
  onChange: (value: Record<string, any>) => void
  onPickImage: (imageIndex: number) => void
  onPickSingleImage?: () => void
}) {
  const [dragImageIndex, setDragImageIndex] = useState<number | null>(null)
  if (block.component_type !== "image_gallery") {
    return (
      <PropsEditor
        value={block.props || {}}
        onChange={onChange}
        onPickSingleImage={onPickSingleImage}
        componentType={block.component_type || block.block_key || ""}
      />
    )
  }

  const props = block.props || {}
  const images = Array.isArray(props.images) ? props.images : []
  const updateImage = (imageIndex: number, patch: Record<string, any>) => {
    const nextImages = images.map((image: any, idx: number) => idx === imageIndex ? { ...image, ...patch } : image)
    onChange({ ...props, images: nextImages })
  }
  const moveImage = (imageIndex: number, direction: -1 | 1) => {
    const swapIndex = imageIndex + direction
    if (swapIndex < 0 || swapIndex >= images.length) return
    const nextImages = [...images]
      ;[nextImages[imageIndex], nextImages[swapIndex]] = [nextImages[swapIndex], nextImages[imageIndex]]
    onChange({ ...props, images: nextImages })
  }
  const dropImage = (targetIndex: number) => {
    if (dragImageIndex === null || dragImageIndex === targetIndex) {
      setDragImageIndex(null)
      return
    }
    const nextImages = [...images]
    const [moved] = nextImages.splice(dragImageIndex, 1)
    nextImages.splice(targetIndex, 0, moved)
    onChange({ ...props, images: nextImages })
    setDragImageIndex(null)
  }

  return (
    <div className="space-y-4 rounded-none border bg-slate-50 p-4 dark:bg-slate-950">
      <div>
        <Label className="text-xs font-bold">Image Gallery Props</Label>
        <p className="mt-1 text-xs text-slate-500">Chỉnh ảnh trong Media Library hoặc dán URL trực tiếp.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Tiêu đề gallery">
          <Input value={props.title || ""} onChange={(e) => onChange({ ...props, title: e.target.value })} className="rounded-none" />
        </Field>
        <Field label="Phụ đề gallery">
          <Input value={props.subtitle || ""} onChange={(e) => onChange({ ...props, subtitle: e.target.value })} className="rounded-none" />
        </Field>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Danh sách ảnh ({images.length})</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => onChange({ ...props, images: [...images, { src: "/placeholder.jpg", title: `Ảnh ${images.length + 1}`, category: "GZV", description: "", alt: "GZV" }] })}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm ảnh
          </Button>
        </div>
        {images.map((image: any, imgIdx: number) => (
          <div
            key={imgIdx}
            draggable
            onDragStart={() => setDragImageIndex(imgIdx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dropImage(imgIdx)}
            className="border bg-white p-3 dark:bg-slate-900"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 cursor-grab">
                <GripVertical className="h-3.5 w-3.5" /> Ảnh #{imgIdx + 1}
              </span>
              <div className="flex gap-1">
                <Button type="button" variant="outline" size="icon" className="h-7 w-7 rounded-none" disabled={imgIdx === 0} onClick={() => moveImage(imgIdx, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                <Button type="button" variant="outline" size="icon" className="h-7 w-7 rounded-none" disabled={imgIdx === images.length - 1} onClick={() => moveImage(imgIdx, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                <Button type="button" variant="destructive" size="icon" className="h-7 w-7 rounded-none" onClick={() => onChange({ ...props, images: images.filter((_: any, i: number) => i !== imgIdx) })}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <Field label="URL ảnh">
                <div className="flex gap-2">
                  <Input value={image.src || ""} onChange={(e) => updateImage(imgIdx, { src: e.target.value })} className="rounded-none font-mono text-xs" />
                  <Button type="button" variant="outline" size="sm" className="rounded-none shrink-0" onClick={() => onPickImage(imgIdx)}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
              <Field label="Tiêu đề ảnh"><Input value={image.title || ""} onChange={(e) => updateImage(imgIdx, { title: e.target.value })} className="rounded-none" /></Field>
              <Field label="Danh mục"><Input value={image.category || ""} onChange={(e) => updateImage(imgIdx, { category: e.target.value })} className="rounded-none" /></Field>
              <Field label="Alt text"><Input value={image.alt || ""} onChange={(e) => updateImage(imgIdx, { alt: e.target.value })} className="rounded-none" /></Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
