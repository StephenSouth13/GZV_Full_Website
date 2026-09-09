import React, { useState } from "react"
import { DndContext, closestCenter, type SensorDescriptor, type SensorOptions } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { RotateCcw, Save, Plus, Trash2, Video, Image as ImageIcon, Move, ZoomIn, Filter, Link2, Palette, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { HomeSection } from "../types"
import { SortableHomeSectionRow } from "../helpers/SortableRows"
import { Field, SwitchLine } from "../helpers/BasicHelpers"
import { RawJsonEditor } from "../helpers/RawJsonEditor"
import { HomePartnersEditor } from "../helpers/HomePartnersEditor"

export function HomeSectionsTab({
  homeSections,
  orderedHomeSections,
  selectedSection,
  selectedSectionKey,
  setSelectedSectionKey,
  setHomeSections,
  sensors,
  onHomeDragEnd,
  onAddHomeSection,
  onResetHomeSectionsToDefault,
  onDeleteHomeSection,
  onSaveHomeSections,
  onBackToMenu,
  onPickMedia,
  saving,
}: {
  homeSections: HomeSection[]
  orderedHomeSections: Array<{ section: HomeSection; index: number }>
  selectedSection: HomeSection | undefined
  selectedSectionKey: string
  setSelectedSectionKey: (key: string) => void
  setHomeSections: React.Dispatch<React.SetStateAction<HomeSection[]>>
  sensors: SensorDescriptor<SensorOptions>[]
  onHomeDragEnd: (event: any) => void
  onAddHomeSection: () => void
  onResetHomeSectionsToDefault: () => void
  onDeleteHomeSection: (sectionKey: string) => void
  onSaveHomeSections: () => void
  onBackToMenu: () => void
  onPickMedia: (target: string) => void
  saving: boolean
}) {
  const [showAdvancedJson, setShowAdvancedJson] = useState(false)

  const updateSection = (patch: Partial<HomeSection>) => {
    setHomeSections((items) => items.map((item) => item.section_key === selectedSectionKey ? { ...item, ...patch } : item))
  }

  const updateSectionSettings = (patch: Record<string, any>) => {
    setHomeSections((items) => items.map((item) => item.section_key === selectedSectionKey ? { ...item, settings: { ...(item.settings || {}), ...patch } } : item))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-3.5 border border-slate-200 shadow-xs dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBackToMenu}
            className="rounded-none border-slate-300 text-xs font-black uppercase text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:text-white"
          >
            ← Quay lại Menu
          </Button>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
          <span className="text-xs font-black text-[#ed1c24] uppercase tracking-wide">
            Đang chỉnh sửa: Section Trang Chủ (/)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetHomeSectionsToDefault}
            className="rounded-none border-slate-300 text-xs font-black uppercase text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:text-white"
            title="Nạp lại toàn bộ dữ liệu gốc từ các component Home"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-[#ed1c24]" /> Nạp dữ liệu gốc từ Home
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSaveHomeSections}
            disabled={saving}
            className="rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white text-xs font-black uppercase"
          >
            <Save className="mr-1.5 h-4 w-4" /> {saving ? "Đang lưu..." : "Lưu Section Trang Chủ"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left Sidebar: List of Home Sections with Drag & Drop */}
        <div className="space-y-4">
          <Card className="rounded-none border-slate-200 dark:border-white/10 shadow-xs">
            <CardHeader className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Danh sách Section ({orderedHomeSections.length})
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-none text-[11px] font-black uppercase h-7 border-[#ed1c24] text-[#ed1c24] hover:bg-[#ed1c24] hover:text-white transition"
                  onClick={onAddHomeSection}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Thêm Section
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onHomeDragEnd}>
                <SortableContext
                  items={orderedHomeSections.map((item) => item.section.section_key)}
                  strategy={verticalListSortingStrategy}
                >
                  {orderedHomeSections.map(({ section }) => (
                    <SortableHomeSectionRow
                      key={section.section_key}
                      id={section.section_key}
                      section={section}
                      isSelected={selectedSectionKey === section.section_key}
                      onSelect={() => setSelectedSectionKey(section.section_key)}
                      onToggleVisible={() => {
                        const updated = homeSections.map((s) =>
                          s.section_key === section.section_key ? { ...s, is_visible: !s.is_visible } : s
                        )
                        setHomeSections(updated)
                      }}
                      onDelete={() => onDeleteHomeSection(section.section_key)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        {selectedSection && (
          <Card className="rounded-none border-slate-200 dark:border-white/10">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <CardTitle className="text-lg font-black uppercase">Chỉnh section: <span className="text-[#ed1c24]">{selectedSection.title}</span></CardTitle>
                <CardDescription className="text-xs font-semibold">Bật tắt, đổi tiêu đề, mô tả, nút và số lượng item trên trang chủ.</CardDescription>
              </div>
              <Button type="button" variant="destructive" size="sm" className="rounded-none font-bold uppercase text-xs" onClick={() => onDeleteHomeSection(selectedSection.section_key)}>
                <Trash2 className="mr-2 h-4 w-4" /> Xóa section
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tiêu đề chính Section">
                  <Input value={selectedSection.title || ""} onChange={(e) => updateSection({ title: e.target.value })} className="rounded-none font-bold" />
                </Field>
                {(selectedSection.section_key === "hero" || selectedSection.section_key === "about_gzv") && (
                  <>
                    <Field label="Tên nút bấm (CTA Label)"><Input value={selectedSection.button_label || ""} onChange={(e) => updateSection({ button_label: e.target.value })} placeholder="Ví dụ: Xem chi tiết" className="rounded-none" /></Field>
                    <Field label="Link nút bấm (CTA URL)"><Input value={selectedSection.button_url || ""} onChange={(e) => updateSection({ button_url: e.target.value })} placeholder="/gioi-thieu hoặc /dich-vu" className="rounded-none font-mono text-xs" /></Field>
                  </>
                )}
              </div>
              <Field label="Phụ đề / Slogan ngắn"><Input value={selectedSection.subtitle || ""} onChange={(e) => updateSection({ subtitle: e.target.value })} placeholder="Ví dụ: THE NEXT-GEN COMPANY" className="rounded-none text-xs" /></Field>

              {selectedSection.section_key === "hero" && (
                <Field label="Mô tả ngắn banner"><Textarea rows={3} value={selectedSection.description || ""} onChange={(e) => updateSection({ description: e.target.value })} placeholder="Đoạn mô tả ngắn hiển thị trên banner..." className="rounded-none text-xs" /></Field>
              )}

              {selectedSection.section_key === "about_gzv" && (
                <Field label="Nội dung chi tiết câu chuyện GZV"><Textarea rows={5} value={selectedSection.description || ""} onChange={(e) => updateSection({ description: e.target.value })} placeholder="Đoạn văn câu chuyện GZV..." className="rounded-none text-xs" /></Field>
              )}

              {/* 1. HERO VIDEO CONTROLS */}
              {selectedSection.section_key === "hero" && (
                <div className="space-y-4 border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                    <Video className="h-5 w-5 text-[#ed1c24]" />
                    <div>
                      <p className="text-sm font-black uppercase text-slate-950 dark:text-white">Cấu hình Video Banner</p>
                      <p className="text-xs text-slate-500">Video giới thiệu hiển thị trên màn hình đầu trang.</p>
                    </div>
                  </div>
                  <Field label="Video URL (mp4, webm hoặc YouTube/Vimeo)">
                    <div className="flex gap-2">
                      <Input
                        value={selectedSection.settings?.video_url || ""}
                        onChange={(e) => updateSectionSettings({ video_url: e.target.value })}
                        placeholder="/Intro.mp4 hoặc https://youtube.com/watch?v=..."
                        className="rounded-none font-mono text-xs"
                      />
                      <Button type="button" variant="outline" className="rounded-none shrink-0" onClick={() => onPickMedia("heroVideo")}>
                        <Video className="mr-2 h-4 w-4" /> Chọn video
                      </Button>
                    </div>
                  </Field>
                </div>
              )}

              {/* 2. ABOUT GZV CONTROLS */}
              {selectedSection.section_key === "about_gzv" && (
                <div className="space-y-4 border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                    <ImageIcon className="h-5 w-5 text-[#ed1c24]" />
                    <div>
                      <p className="text-sm font-black uppercase text-slate-950 dark:text-white">Ảnh & Căn chỉnh câu chuyện GZV</p>
                      <p className="text-xs text-slate-500">Cấu hình hình ảnh minh họa bên phải và vị trí hiển thị.</p>
                    </div>
                  </div>
                  <Field label="Đường dẫn ảnh minh họa (Image URL)">
                    <div className="flex gap-2">
                      <Input
                        value={selectedSection.settings?.image_url || "/gioi-thieu/19.webp"}
                        onChange={(e) => updateSectionSettings({ image_url: e.target.value })}
                        placeholder="/gioi-thieu/19.webp"
                        className="rounded-none font-mono text-xs"
                      />
                      <Button type="button" variant="outline" className="rounded-none shrink-0" onClick={() => onPickMedia("aboutImage")}>
                        <ImageIcon className="mr-2 h-4 w-4" /> Chọn ảnh
                      </Button>
                    </div>
                  </Field>
                  {/* Interactive Drag & Drop / Click Focal Point Alignment */}
                  {selectedSection.settings?.image_url && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Move className="h-3.5 w-3.5 text-[#ed1c24]" /> Kéo thả / Nhấp chuột vào ảnh để căn chỉnh trọng tâm:
                        </span>
                        <span className="font-mono text-[11px] text-[#ed1c24] font-black">
                          X: {selectedSection.settings?.position_x ?? 50}% | Y: {selectedSection.settings?.position_y ?? 50}%
                        </span>
                      </div>

                      <div
                        className="relative h-64 w-full cursor-crosshair overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 select-none dark:border-white/20 dark:bg-slate-900 group"
                        onMouseDown={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const updateCoords = (clientX: number, clientY: number) => {
                            const x = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)))
                            const y = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)))
                            updateSectionSettings({ position_x: x, position_y: y })
                          }
                          updateCoords(e.clientX, e.clientY)

                          const handleMouseMove = (moveEvent: MouseEvent) => {
                            updateCoords(moveEvent.clientX, moveEvent.clientY)
                          }
                          const handleMouseUp = () => {
                            window.removeEventListener("mousemove", handleMouseMove)
                            window.removeEventListener("mouseup", handleMouseUp)
                          }
                          window.addEventListener("mousemove", handleMouseMove)
                          window.addEventListener("mouseup", handleMouseUp)
                        }}
                      >
                        <img
                          src={selectedSection.settings.image_url}
                          alt="About preview"
                          className="pointer-events-none h-full w-full object-cover select-none"
                          style={{
                            objectPosition: `${selectedSection.settings?.position_x ?? 50}% ${selectedSection.settings?.position_y ?? 50}%`,
                            transform: `scale(${(selectedSection.settings?.image_size ?? 100) / 100})`,
                          }}
                        />

                        {/* Crosshair Target Indicator */}
                        <div
                          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                          style={{
                            left: `${selectedSection.settings?.position_x ?? 50}%`,
                            top: `${selectedSection.settings?.position_y ?? 50}%`,
                          }}
                        >
                          <div className="h-7 w-7 rounded-full border-2 border-[#ed1c24] bg-white/40 shadow-[0_0_10px_rgba(237,28,36,0.8)]" />
                          <div className="absolute h-2 w-2 rounded-full bg-[#ed1c24]" />
                        </div>

                        <div className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                          🖱️ Kéo hoặc nhấp chuột để di chuyển góc nhìn
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zoom Slider Control */}
                  <div className="space-y-1.5 rounded border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="h-3.5 w-3.5 text-[#ed1c24]" /> Thanh phóng to / thu nhỏ ảnh (Zoom):
                      </span>
                      <span className="font-mono text-[#ed1c24] text-xs font-black">
                        {selectedSection.settings?.image_size ?? 100}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400">50%</span>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="1"
                        value={selectedSection.settings?.image_size ?? 100}
                        onChange={(e) => updateSectionSettings({ image_size: Number(e.target.value) })}
                        className="h-2 w-full cursor-pointer accent-[#ed1c24]"
                      />
                      <span className="text-[10px] font-bold text-slate-400">200%</span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Tọa độ ngang X (%)">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={selectedSection.settings?.position_x ?? 50}
                        onChange={(e) => updateSectionSettings({ position_x: Number(e.target.value) })}
                        className="rounded-none text-xs"
                      />
                    </Field>
                    <Field label="Tọa độ dọc Y (%)">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={selectedSection.settings?.position_y ?? 50}
                        onChange={(e) => updateSectionSettings({ position_y: Number(e.target.value) })}
                        className="rounded-none text-xs"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* 3. SERVICES THREE CONTROLS */}
              {selectedSection.section_key === "services_three" && (
                <div className="space-y-4 border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                    <div>
                      <p className="text-sm font-black uppercase text-slate-950 dark:text-white">Danh sách 3 Khối Dịch Vụ Chính</p>
                      <p className="text-xs text-slate-500">Chỉnh sửa tiêu đề, mô tả và liên kết cho từng dịch vụ.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-none text-xs h-7"
                      onClick={() => {
                        const currentServices = Array.isArray(selectedSection.settings?.services) ? [...selectedSection.settings.services] : []
                        updateSectionSettings({
                          services: [...currentServices, { title: "DỊCH VỤ MỚI", description: "Mô tả ngắn cho dịch vụ.", link: "/dich-vu", icon: "megaphone" }]
                        })
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Thêm dịch vụ
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(Array.isArray(selectedSection.settings?.services) ? selectedSection.settings.services : [
                      { title: "MARKETING & BRANDING", description: "Giải pháp xây dựng và phát triển thương hiệu toàn diện.", link: "/dich-vu/marketing", icon: "megaphone" },
                      { title: "SALES & PHÁT TRIỂN", description: "Tối ưu hóa doanh số và mở rộng kênh tiếp cận khách hàng.", link: "/dich-vu", icon: "trend" },
                      { title: "DIGITAL TRANSFORMATION", description: "Chuyển đổi số và ứng dụng công nghệ hiệu quả.", link: "/dich-vu", icon: "cpu" }
                    ]).map((srv: any, srvIdx: number) => (
                      <div key={srvIdx} className="border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900 space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[#ed1c24]">Dịch vụ #{srvIdx + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:bg-red-50"
                            onClick={() => {
                              const currentServices = Array.isArray(selectedSection.settings?.services) ? [...selectedSection.settings.services] : []
                              updateSectionSettings({ services: currentServices.filter((_, idx) => idx !== srvIdx) })
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Field label="Tiêu đề dịch vụ">
                            <Input
                              value={srv.title || ""}
                              onChange={(e) => {
                                const currentServices = Array.isArray(selectedSection.settings?.services) ? [...selectedSection.settings.services] : []
                                currentServices[srvIdx] = { ...(currentServices[srvIdx] || {}), title: e.target.value }
                                updateSectionSettings({ services: currentServices })
                              }}
                              className="rounded-none text-xs font-bold"
                            />
                          </Field>
                          <Field label="Đường dẫn liên kết">
                            <Input
                              value={srv.link || ""}
                              onChange={(e) => {
                                const currentServices = Array.isArray(selectedSection.settings?.services) ? [...selectedSection.settings.services] : []
                                currentServices[srvIdx] = { ...(currentServices[srvIdx] || {}), link: e.target.value }
                                updateSectionSettings({ services: currentServices })
                              }}
                              className="rounded-none text-xs font-mono"
                            />
                          </Field>
                        </div>
                        <Field label="Mô tả dịch vụ">
                          <Textarea
                            rows={2}
                            value={srv.description || ""}
                            onChange={(e) => {
                              const currentServices = Array.isArray(selectedSection.settings?.services) ? [...selectedSection.settings.services] : []
                              currentServices[srvIdx] = { ...(currentServices[srvIdx] || {}), description: e.target.value }
                              updateSectionSettings({ services: currentServices })
                            }}
                            className="rounded-none text-xs"
                          />
                        </Field>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. PROJECTS CONTROLS ON HOME */}
              {selectedSection.section_key === "projects" && (
                <div className="space-y-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                    <Filter className="h-4 w-4 text-[#ed1c24]" />
                    <div>
                      <p className="text-xs font-black uppercase text-slate-950 dark:text-white">Cấu hình Bộ lọc & Tìm kiếm Dự án</p>
                      <p className="text-[11px] text-slate-500">Tùy chọn ẩn/hiện thanh tìm kiếm, bộ lọc danh mục và số lượng dự án trên Trang Chủ.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between border border-slate-100 p-3 bg-slate-50/50 dark:border-white/5 dark:bg-slate-950">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Hiện thanh tìm kiếm</p>
                        <p className="text-[10px] text-slate-400">Ô gõ tìm kiếm tên dự án</p>
                      </div>
                      <Switch
                        checked={selectedSection.settings?.show_search !== false && selectedSection.settings?.showSearch !== false}
                        onCheckedChange={(checked) => updateSectionSettings({ show_search: checked, showSearch: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between border border-slate-100 p-3 bg-slate-50/50 dark:border-white/5 dark:bg-slate-950">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Hiện bộ lọc danh mục</p>
                        <p className="text-[10px] text-slate-400">Các nút: Marketing, Sales, v.v.</p>
                      </div>
                      <Switch
                        checked={selectedSection.settings?.show_categories !== false && selectedSection.settings?.showCategories !== false && selectedSection.settings?.show_filter !== false}
                        onCheckedChange={(checked) => updateSectionSettings({ show_categories: checked, showCategories: checked, show_filter: checked })}
                      />
                    </div>
                  </div>

                  <Field label="Số lượng dự án hiển thị (Limit)">
                    <Input
                      type="number"
                      value={selectedSection.settings?.limit ?? 6}
                      onChange={(e) => updateSectionSettings({ limit: Number(e.target.value) })}
                      placeholder="6"
                      className="rounded-none text-xs w-full sm:w-48"
                    />
                  </Field>
                </div>
              )}

              {/* 4.1. PARTNERS MARQUEE CONTROLS ON HOME */}
              {selectedSection.section_key === "partners" && (
                <HomePartnersEditor
                  settings={selectedSection.settings || {}}
                  updateSectionSettings={updateSectionSettings}
                  title={selectedSection.title}
                  subtitle={selectedSection.subtitle || ""}
                  onTitleChange={(newTitle) => updateSection({ title: newTitle })}
                  onSubtitleChange={(newSubtitle) => updateSection({ subtitle: newSubtitle })}
                />
              )}

              {/* 5. CTA SECTION CONTROLS ON HOME */}
              {(selectedSection.section_key === "cta" || selectedSection.section_key === "cta_band") && (
                <div className="space-y-4">
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
                          value={selectedSection.settings?.button_label || selectedSection.settings?.buttonLabel || ""}
                          onChange={(e) => updateSectionSettings({ button_label: e.target.value, buttonLabel: e.target.value })}
                          placeholder="Ví dụ: Đăng ký tư vấn miễn phí"
                          className="rounded-none text-xs font-bold"
                        />
                      </Field>
                      <Field label="Đường dẫn nút bấm (CTA URL)">
                        <Input
                          value={selectedSection.settings?.button_url || selectedSection.settings?.buttonUrl || ""}
                          onChange={(e) => updateSectionSettings({ button_url: e.target.value, buttonUrl: e.target.value })}
                          placeholder="Ví dụ: /lien-he hoặc https://..."
                          className="rounded-none text-xs font-mono"
                        />
                      </Field>
                    </div>
                  </div>

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
                            value={selectedSection.settings?.background_from || selectedSection.settings?.backgroundFrom || "#ed1c24"}
                            onChange={(e) => updateSectionSettings({ background_from: e.target.value, backgroundFrom: e.target.value })}
                            className="w-14 h-9 p-1 rounded-none cursor-pointer shrink-0 border-slate-300"
                          />
                          <Input
                            value={selectedSection.settings?.background_from || selectedSection.settings?.backgroundFrom || "#ed1c24"}
                            onChange={(e) => updateSectionSettings({ background_from: e.target.value, backgroundFrom: e.target.value })}
                            className="rounded-none font-mono text-xs"
                            placeholder="#ed1c24"
                          />
                        </div>
                      </Field>

                      <Field label="Màu nền / Gradient Kết thúc (To)">
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={selectedSection.settings?.background_to || selectedSection.settings?.backgroundTo || "#ed1c24"}
                            onChange={(e) => updateSectionSettings({ background_to: e.target.value, backgroundTo: e.target.value })}
                            className="w-14 h-9 p-1 rounded-none cursor-pointer shrink-0 border-slate-300"
                          />
                          <Input
                            value={selectedSection.settings?.background_to || selectedSection.settings?.backgroundTo || "#ed1c24"}
                            onChange={(e) => updateSectionSettings({ background_to: e.target.value, backgroundTo: e.target.value })}
                            className="rounded-none font-mono text-xs"
                            placeholder="#ed1c24"
                          />
                        </div>
                      </Field>
                    </div>

                    <div
                      className="h-10 w-full flex items-center justify-center text-xs font-bold text-white rounded-none shadow-inner select-none transition-all"
                      style={{
                        background: `linear-gradient(90deg, ${selectedSection.settings?.background_from || selectedSection.settings?.backgroundFrom || "#ed1c24"}, ${selectedSection.settings?.background_to || selectedSection.settings?.backgroundTo || "#ed1c24"})`,
                      }}
                    >
                      Xem trước màu nền Section
                    </div>
                  </div>
                </div>
              )}

              {selectedSection.section_key !== "hero" && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedJson(!showAdvancedJson)}
                    className="rounded-none text-xs font-bold uppercase border-slate-300 dark:border-white/10 flex items-center gap-1.5"
                  >
                    <Code2 className="h-4 w-4 text-[#ed1c24]" />
                    {showAdvancedJson ? "▲ Thu gọn cấu hình JSON nâng cao" : "▼ Mở cấu hình JSON nâng cao (Settings)"}
                  </Button>
                  {showAdvancedJson && (
                    <Field label="Cấu hình JSON nâng cao (Raw JSON)">
                      <RawJsonEditor value={selectedSection.settings || {}} onChange={(settings) => updateSection({ settings })} />
                    </Field>
                  )}
                </div>
              )}

              <Button onClick={onSaveHomeSections} disabled={saving} className="gap-2 rounded-none bg-[#ed1c24] hover:bg-[#c91218] text-white uppercase text-xs font-black w-full sm:w-auto">
                <Save className="h-4 w-4" /> {saving ? "Đang lưu..." : "Lưu tất cả thay đổi Section"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
