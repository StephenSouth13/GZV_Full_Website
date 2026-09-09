import React from "react"
import { Settings2, Palette, MoveVertical, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { PageContent } from "../types"
import { SharedPageHero } from "../SharedPageHero"

export function BannerHeroTab({
  globalBannerConfig,
  setGlobalBannerConfig,
  syncAllBanners,
  setSyncAllBanners,
  pages,
  setPages,
  selectedPageForPreview,
  setSelectedPageForPreview,
  previewBannerData,
  onSaveBannerConfig,
  onPickMedia,
  saving,
}: {
  globalBannerConfig: any
  setGlobalBannerConfig: (config: any) => void
  syncAllBanners: boolean
  setSyncAllBanners: (sync: boolean) => void
  pages: PageContent[]
  setPages: React.Dispatch<React.SetStateAction<PageContent[]>>
  selectedPageForPreview: string
  setSelectedPageForPreview: (slug: string) => void
  previewBannerData: any
  onSaveBannerConfig: (targetSlug?: string) => void
  onPickMedia: (target: string) => void
  saving: boolean
}) {
  const selectedPageObj = pages.find((p) => p.slug === selectedPageForPreview) || pages[0] || null

  return (
    <div className="space-y-6">
      {/* Top Live Preview Banner */}
      <div className="border border-slate-200 rounded-none overflow-hidden shadow-md bg-slate-950 dark:border-white/10">
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ed1c24] animate-pulse" />
            Xem trước trực tiếp (Live Preview)
            {selectedPageObj ? (
              <> — Đang xem trang: <strong className="text-[#ed1c24] uppercase font-black">{selectedPageObj.title || selectedPageObj.slug}</strong> (/{selectedPageObj.slug})</>
            ) : (
              <> — <strong className="text-[#ed1c24] uppercase">Banner Chung</strong></>
            )}
          </span>
        </div>

        <div className="w-full overflow-hidden relative select-none">
          <SharedPageHero
            badge={previewBannerData.badge}
            badgeColor={previewBannerData.badgeColor}
            title={previewBannerData.title}
            titleColor={previewBannerData.titleColor}
            description={previewBannerData.description}
            descriptionColor={previewBannerData.descriptionColor}
            showBadge={previewBannerData.showBadge}
            showTitle={previewBannerData.showTitle}
            showDescription={previewBannerData.showDescription}
            useImage={previewBannerData.useImage}
            backgroundImageUrl={previewBannerData.backgroundImageUrl}
            imagePositionY={previewBannerData.imagePositionY}
            imageOpacity={previewBannerData.imageOpacity}
            imageGrayscale={previewBannerData.imageGrayscale}
            bgColor={previewBannerData.bgColor}
            bgFrom={previewBannerData.bgFrom}
            bgTo={previewBannerData.bgTo}
            overlayEnabled={previewBannerData.overlayEnabled}
            overlayColor={previewBannerData.overlayColor}
            overlayOpacity={previewBannerData.overlayOpacity}
            titleAlignment={previewBannerData.titleAlignment}
            isPreviewMode={true}
          />
        </div>
      </div>

      {/* Split 2 Columns Below Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Banner Style Controls */}
        <div className="space-y-4 lg:col-span-5 border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
            <Label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Settings2 className="h-4 w-4 text-[#ed1c24]" /> Cấu hình Giao diện Banner Chung
            </Label>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3 border border-slate-200 dark:bg-slate-950/40 dark:border-white/10">
            <div>
              <Label className="text-xs font-bold text-slate-900 dark:text-white">Đồng bộ tất cả Banner</Label>
              <p className="text-[10px] text-slate-400">Bật để dùng chung mẫu Banner chuẩn cho toàn bộ các trang</p>
            </div>
            <Switch
              checked={syncAllBanners}
              onCheckedChange={(v) => setSyncAllBanners(v)}
            />
          </div>

          {/* Cấu hình hiển thị chữ (Title, Subtitle, Badge) */}
          <div className={`p-3 bg-slate-50 border border-slate-200 dark:bg-slate-950/40 dark:border-white/10 space-y-3 transition-opacity duration-200 ${!syncAllBanners ? "opacity-40 pointer-events-none select-none" : ""
            }`}>
            <div className="border-b border-slate-200/60 dark:border-white/10 pb-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlignLeft className="h-3.5 w-3.5 text-[#ed1c24]" /> Bật / Tắt Thành Phần Chữ (Chung)
                </Label>
                {!syncAllBanners && (
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded-none uppercase">
                    Đang tắt đồng bộ
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {syncAllBanners
                  ? "Áp dụng cho TOÀN BỘ các trang (do đang bật Đồng bộ Banner)."
                  : "Mỗi trang tự bật/tắt thành phần chữ riêng biệt ở cột bên phải."}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-slate-900 dark:text-white">Nhãn phụ (Badge)</Label>
                <p className="text-[10px] text-slate-400">Khối nhãn nhỏ phía trên tiêu đề</p>
              </div>
              <Switch
                disabled={!syncAllBanners}
                checked={globalBannerConfig.show_badge !== false}
                onCheckedChange={(v) => setGlobalBannerConfig({ ...globalBannerConfig, show_badge: v })}
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-white/10 pt-2">
              <div>
                <Label className="text-xs font-bold text-slate-900 dark:text-white">Tiêu đề chính (Title)</Label>
                <p className="text-[10px] text-slate-400">Dòng chữ tiêu đề lớn của Banner</p>
              </div>
              <Switch
                disabled={!syncAllBanners}
                checked={globalBannerConfig.show_title !== false}
                onCheckedChange={(v) => setGlobalBannerConfig({ ...globalBannerConfig, show_title: v })}
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-white/10 pt-2">
              <div>
                <Label className="text-xs font-bold text-slate-900 dark:text-white">Phụ đề / Mô tả (Subtitle / Description)</Label>
                <p className="text-[10px] text-slate-400">Đoạn văn bản mô tả ngắn gọn</p>
              </div>
              <Switch
                disabled={!syncAllBanners}
                checked={globalBannerConfig.show_subtitle !== false && globalBannerConfig.show_description !== false}
                onCheckedChange={(v) => setGlobalBannerConfig({ ...globalBannerConfig, show_subtitle: v, show_description: v })}
              />
            </div>
          </div>

          {/* Background Use Image Switch */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 dark:bg-slate-950/40 dark:border-white/10">
            <div>
              <Label className="text-xs font-bold text-slate-900 dark:text-white">Sử dụng ảnh làm nền</Label>
              <p className="text-[10px] text-slate-400">Bật để dùng ảnh bìa, tắt để dùng dải màu Gradient 2 màu</p>
            </div>
            <Switch
              checked={globalBannerConfig.use_image}
              onCheckedChange={(v) => setGlobalBannerConfig({ ...globalBannerConfig, use_image: v })}
            />
          </div>

          {globalBannerConfig.use_image ? (
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-900 dark:text-white">Ảnh bìa nền (Cover Image)</Label>
                <div className="flex gap-2">
                  <Input
                    value={globalBannerConfig.cover_url || ""}
                    onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, cover_url: e.target.value })}
                    placeholder="URL ảnh bìa"
                    className="flex-1 h-9 text-xs rounded-none border-slate-200 font-mono dark:border-white/10"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPickMedia("globalCover")}
                    className="h-9 rounded-none text-xs font-black uppercase border-slate-200 shrink-0 dark:border-white/10"
                  >
                    <ImageIcon className="h-4 w-4 mr-1 text-[#ed1c24]" /> Chọn ảnh
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <MoveVertical className="h-3 w-3 text-[#ed1c24]" /> Vị trí dọc (Y)
                    </Label>
                    <span className="text-[10px] font-mono text-slate-500">{globalBannerConfig.imagePositionY || "50%"}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={parseInt(globalBannerConfig.imagePositionY || "50", 10)}
                    onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, imagePositionY: `${e.target.value}%` })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#ed1c24] dark:bg-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-slate-900 dark:text-white">
                      Độ rõ ảnh nền
                    </Label>
                    <span className="text-[10px] font-mono text-slate-500">{globalBannerConfig.image_opacity ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={globalBannerConfig.image_opacity ?? 100}
                    onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, image_opacity: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#ed1c24] dark:bg-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950/40 dark:border-white/10">
                <div>
                  <Label className="text-[11px] font-bold text-slate-900 dark:text-white">Hiệu ứng Đen trắng (Grayscale)</Label>
                  <p className="text-[9px] text-slate-400">Chuyển ảnh nền thành đen trắng cổ điển</p>
                </div>
                <Switch
                  checked={!!globalBannerConfig.image_grayscale}
                  onCheckedChange={(v) => setGlobalBannerConfig({ ...globalBannerConfig, image_grayscale: v })}
                />
              </div>

              {/* Tinh chỉnh Lớp phủ màu (Overlay) */}
              <div className="p-3 bg-red-50/40 border border-red-200/60 dark:bg-red-950/20 dark:border-red-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5 text-[#ed1c24]" /> Lớp phủ màu (Overlay BG)
                    </Label>
                    <p className="text-[10px] text-slate-500">Giúp chữ trên Banner luôn nổi bật và dễ đọc</p>
                  </div>
                  <Switch
                    checked={globalBannerConfig.overlay_enabled !== false}
                    onCheckedChange={(v) => setGlobalBannerConfig({ ...globalBannerConfig, overlay_enabled: v })}
                  />
                </div>

                {globalBannerConfig.overlay_enabled !== false && (
                  <div className="space-y-3 pt-1 border-t border-slate-200/60 dark:border-white/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Màu lớp phủ</Label>
                        <div className="flex gap-1.5">
                          <Input
                            type="color"
                            value={globalBannerConfig.overlay_color || "#050505"}
                            onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, overlay_color: e.target.value })}
                            className="w-8 h-8 p-0.5 rounded-none cursor-pointer border-slate-300 shrink-0"
                          />
                          <Input
                            value={globalBannerConfig.overlay_color || "#050505"}
                            onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, overlay_color: e.target.value })}
                            className="font-mono text-[11px] uppercase h-8 rounded-none border-slate-300 dark:border-white/10"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Độ che phủ (Opacity)</Label>
                          <span className="text-[10px] font-mono text-[#ed1c24] font-bold">{globalBannerConfig.overlay_opacity ?? 60}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={globalBannerConfig.overlay_opacity ?? 60}
                          onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, overlay_opacity: parseInt(e.target.value, 10) })}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#ed1c24] dark:bg-slate-700 mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">Màu bắt đầu (From)</Label>
                  <div className="flex gap-1.5">
                    <Input
                      type="color"
                      value={globalBannerConfig.bg_from || globalBannerConfig.bg_color || "#050505"}
                      onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, bg_from: e.target.value, bg_color: e.target.value })}
                      className="w-9 h-9 p-0.5 rounded-none cursor-pointer border-slate-200 shrink-0"
                    />
                    <Input
                      value={globalBannerConfig.bg_from || globalBannerConfig.bg_color || "#050505"}
                      onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, bg_from: e.target.value, bg_color: e.target.value })}
                      className="font-mono text-xs uppercase h-9 rounded-none border-slate-200 dark:border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">Màu kết thúc (To)</Label>
                  <div className="flex gap-1.5">
                    <Input
                      type="color"
                      value={globalBannerConfig.bg_to || "#ed1c24"}
                      onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, bg_to: e.target.value })}
                      className="w-9 h-9 p-0.5 rounded-none cursor-pointer border-slate-200 shrink-0"
                    />
                    <Input
                      value={globalBannerConfig.bg_to || "#ed1c24"}
                      onChange={(e) => setGlobalBannerConfig({ ...globalBannerConfig, bg_to: e.target.value })}
                      className="font-mono text-xs uppercase h-9 rounded-none border-slate-200 dark:border-white/10"
                    />
                  </div>
                </div>
              </div>

              <div
                className="h-10 w-full flex items-center justify-center text-xs font-bold text-white shadow-inner select-none transition-all"
                style={{
                  background: `linear-gradient(90deg, ${globalBannerConfig.bg_from || globalBannerConfig.bg_color || "#050505"}, ${globalBannerConfig.bg_to || "#ed1c24"})`,
                }}
              >
                Xem trước dải màu Gradient Banner
              </div>
            </div>
          )}

          {/* Alignment */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
            <Label className="text-xs font-bold text-slate-900 dark:text-white">Căn lề Tiêu đề (Alignment)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGlobalBannerConfig({ ...globalBannerConfig, titleAlignment: "left" })}
                className={`rounded-none text-xs font-bold transition-all ${globalBannerConfig.titleAlignment === "left"
                    ? "bg-[#ed1c24] text-white border-[#ed1c24] hover:bg-[#c91218] hover:text-white"
                    : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
              >
                <AlignLeft className="h-4 w-4 mr-1.5" /> Trái
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGlobalBannerConfig({ ...globalBannerConfig, titleAlignment: "center" })}
                className={`rounded-none text-xs font-bold transition-all ${globalBannerConfig.titleAlignment === "center"
                    ? "bg-[#ed1c24] text-white border-[#ed1c24] hover:bg-[#c91218] hover:text-white"
                    : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
              >
                <AlignCenter className="h-4 w-4 mr-1.5" /> Giữa
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGlobalBannerConfig({ ...globalBannerConfig, titleAlignment: "right" })}
                className={`rounded-none text-xs font-bold transition-all ${globalBannerConfig.titleAlignment === "right"
                    ? "bg-[#ed1c24] text-white border-[#ed1c24] hover:bg-[#c91218] hover:text-white"
                    : "border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
              >
                <AlignRight className="h-4 w-4 mr-1.5" /> Phải
              </Button>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => onSaveBannerConfig()}
            disabled={saving}
            className="w-full mt-4 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
          >
            {saving ? "Đang lưu..." : "Lưu Giao diện Banner"}
          </Button>
        </div>

        {/* Right Column: Dynamic Pages & Text Editor */}
        <div className="space-y-5 lg:col-span-7">
          {/* Page Selection Grid */}
          <div className="p-4 bg-white border border-slate-200 rounded-none space-y-3 shadow-xs dark:border-white/10 dark:bg-slate-900">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center justify-between text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <AlignLeft className="h-4 w-4 text-[#ed1c24]" /> Danh sách các Trang ({pages.length})
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-normal">
                Bấm để chọn trang chỉnh sửa
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {pages.map((p) => {
                const isSelected = selectedPageForPreview === p.slug
                return (
                  <div
                    key={p.slug}
                    onClick={() => setSelectedPageForPreview(p.slug)}
                    className={`p-2.5 border cursor-pointer transition ${isSelected
                      ? "border-[#ed1c24] bg-red-50/50 text-[#ed1c24] font-black dark:bg-red-950/30"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300"
                      }`}
                  >
                    <p className="font-bold text-xs uppercase truncate">{p.title || p.slug}</p>
                    <p className="font-mono text-[9px] text-slate-400 truncate">/{p.slug}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Text Editor Form for Selected Page */}
          {selectedPageObj && (() => {
            const pageShowBadge = selectedPageObj.show_badge !== undefined && selectedPageObj.show_badge !== null
              ? selectedPageObj.show_badge
              : (globalBannerConfig.show_badge !== false)

            const pageShowTitle = selectedPageObj.show_title !== undefined && selectedPageObj.show_title !== null
              ? selectedPageObj.show_title
              : (globalBannerConfig.show_title !== false)

            const pageShowSubtitle = selectedPageObj.show_subtitle !== undefined && selectedPageObj.show_subtitle !== null
              ? selectedPageObj.show_subtitle
              : (globalBannerConfig.show_subtitle !== false && globalBannerConfig.show_description !== false)

            const isBadgeDisabled = syncAllBanners ? globalBannerConfig.show_badge === false : !pageShowBadge
            const isTitleDisabled = syncAllBanners ? globalBannerConfig.show_title === false : !pageShowTitle
            const isSubtitleDisabled = syncAllBanners
              ? (globalBannerConfig.show_subtitle === false || globalBannerConfig.show_description === false)
              : !pageShowSubtitle

            return (
              <div className="p-5 bg-white border border-slate-200 rounded-none space-y-4 shadow-xs dark:border-white/10 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
                  <div>
                    <Label className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                      <AlignLeft className="h-4 w-4 text-[#ed1c24]" />
                      Nội dung Banner: <span className="text-[#ed1c24] font-mono">/{selectedPageObj.slug}</span>
                    </Label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {syncAllBanners
                        ? "Đang ở chế độ Đồng bộ chung: Cài đặt bật/tắt chữ được điều khiển cho toàn bộ các trang từ cột bên trái."
                        : "Chế độ riêng từng trang: Bạn có thể bật / tắt từng thành phần chữ riêng biệt cho trang này."}
                    </p>
                  </div>
                </div>

                {/* 1. Badge */}
                <div className={`space-y-1.5 transition-opacity ${isBadgeDisabled ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">1. Nhãn phụ (Badge)</Label>
                    <div className="flex items-center gap-2">
                      {syncAllBanners ? (
                        isBadgeDisabled && (
                          <span className="text-[10px] font-bold text-[#ed1c24] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 border border-red-200 dark:border-red-900/40">
                            Đã tắt ở Cấu hình chung
                          </span>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {pageShowBadge ? "Đang hiện" : "Đang ẩn"}
                          </span>
                          <Switch
                            checked={pageShowBadge}
                            onCheckedChange={(checked) =>
                              setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, show_badge: checked } : p)))
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Input
                    disabled={isBadgeDisabled}
                    value={selectedPageObj.banner_badge || ""}
                    onChange={(e) =>
                      setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, banner_badge: e.target.value } : p)))
                    }
                    placeholder={isBadgeDisabled ? "Đã tắt hiển thị cho mục này" : "Ví dụ: GZV CENTER"}
                    className="h-9 text-xs rounded-none border-slate-200 dark:border-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"
                  />
                </div>

                {/* 2. Title */}
                <div className={`space-y-1.5 transition-opacity ${isTitleDisabled ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">2. Tiêu đề chính (Title)</Label>
                    <div className="flex items-center gap-2">
                      {syncAllBanners ? (
                        isTitleDisabled && (
                          <span className="text-[10px] font-bold text-[#ed1c24] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 border border-red-200 dark:border-red-900/40">
                            Đã tắt ở Cấu hình chung
                          </span>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {pageShowTitle ? "Đang hiện" : "Đang ẩn"}
                          </span>
                          <Switch
                            checked={pageShowTitle}
                            onCheckedChange={(checked) =>
                              setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, show_title: checked } : p)))
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Input
                    disabled={isTitleDisabled}
                    value={selectedPageObj.banner_title !== undefined && selectedPageObj.banner_title !== null ? selectedPageObj.banner_title : (selectedPageObj.title || "")}
                    onChange={(e) =>
                      setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, banner_title: e.target.value } : p)))
                    }
                    placeholder={isTitleDisabled ? "Đã tắt hiển thị cho mục này" : "Ví dụ: DỰ ÁN ĐÃ TRIỂN KHAI"}
                    className="h-9 text-xs rounded-none border-slate-200 dark:border-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"
                  />
                </div>

                {/* 3. Subtitle */}
                <div className={`space-y-1.5 transition-opacity ${isSubtitleDisabled ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">3. Mô tả phụ (Subtitle)</Label>
                    <div className="flex items-center gap-2">
                      {syncAllBanners ? (
                        isSubtitleDisabled && (
                          <span className="text-[10px] font-bold text-[#ed1c24] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 border border-red-200 dark:border-red-900/40">
                            Đã tắt ở Cấu hình chung
                          </span>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {pageShowSubtitle ? "Đang hiện" : "Đang ẩn"}
                          </span>
                          <Switch
                            checked={pageShowSubtitle}
                            onCheckedChange={(checked) =>
                              setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, show_subtitle: checked } : p)))
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Textarea
                    disabled={isSubtitleDisabled}
                    value={selectedPageObj.banner_subtitle !== undefined && selectedPageObj.banner_subtitle !== null ? selectedPageObj.banner_subtitle : (selectedPageObj.banner_description || "")}
                    onChange={(e) =>
                      setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, banner_subtitle: e.target.value, banner_description: e.target.value } : p)))
                    }
                    placeholder={isSubtitleDisabled ? "Đã tắt hiển thị cho mục này" : "Nhập mô tả ngắn cho trang này..."}
                    className="min-h-[80px] text-xs rounded-none border-slate-200 dark:border-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">Ảnh bìa riêng trang này (tùy chọn)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={selectedPageObj.banner_image_url || ""}
                      onChange={(e) =>
                        setPages(pages.map((p) => (p.slug === selectedPageObj.slug ? { ...p, banner_image_url: e.target.value } : p)))
                      }
                      placeholder="URL ảnh bìa riêng"
                      className="flex-1 h-9 text-xs rounded-none font-mono border-slate-200 dark:border-white/10"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onPickMedia("pageCover")}
                      className="h-9 rounded-none text-xs font-black uppercase shrink-0 border-slate-200 dark:border-white/10"
                    >
                      <ImageIcon className="h-4 w-4 mr-1 text-[#ed1c24]" /> Chọn ảnh
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => onSaveBannerConfig(selectedPageObj.slug)}
                  disabled={saving}
                  className="w-full mt-2 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
                >
                  {saving ? "Đang lưu..." : `Lưu nội dung trang ${selectedPageObj.title || selectedPageObj.slug}`}
                </Button>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
