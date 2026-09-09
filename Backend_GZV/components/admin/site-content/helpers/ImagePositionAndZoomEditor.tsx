import React from "react"
import { Image as ImageIcon, Move, ZoomIn } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field } from "./BasicHelpers"

export function ImagePositionAndZoomEditor({
  imageUrl,
  positionX = 50,
  positionY = 50,
  imageSize = 100,
  onChange,
  onPickImage,
  title = "Ảnh minh họa & Căn chỉnh trọng tâm",
}: {
  imageUrl: string
  positionX?: number
  positionY?: number
  imageSize?: number
  onChange: (patch: { image_url?: string; position_x?: number; position_y?: number; image_size?: number }) => void
  onPickImage?: () => void
  title?: string
}) {
  return (
    <div className="space-y-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <ImageIcon className="h-4 w-4 text-[#ed1c24]" />
        <div>
          <p className="text-xs font-black uppercase text-slate-950 dark:text-white">{title}</p>
          <p className="text-[11px] text-slate-500">Cấu hình hình ảnh minh họa, căn chỉnh trọng tâm và tỷ lệ phóng to.</p>
        </div>
      </div>

      <Field label="Đường dẫn ảnh (Image URL)">
        <div className="flex gap-2">
          <Input
            value={imageUrl || ""}
            onChange={(e) => onChange({ image_url: e.target.value })}
            placeholder="/gioi-thieu/19.webp"
            className="rounded-none font-mono text-xs"
          />
          {onPickImage && (
            <Button type="button" variant="outline" className="rounded-none shrink-0 text-xs font-bold" onClick={onPickImage}>
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Chọn ảnh
            </Button>
          )}
        </div>
      </Field>

      {imageUrl && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Move className="h-3.5 w-3.5 text-[#ed1c24]" /> Kéo thả / Nhấp chuột vào ảnh để căn chỉnh trọng tâm:
              </span>
              <span className="font-mono text-[11px] text-[#ed1c24] font-black">
                X: {positionX}% | Y: {positionY}%
              </span>
            </div>

            <div
              className="relative h-60 w-full cursor-crosshair overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 select-none dark:border-white/20 dark:bg-slate-900 group"
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const updateCoords = (clientX: number, clientY: number) => {
                  const x = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)))
                  const y = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)))
                  onChange({ position_x: x, position_y: y })
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
                src={imageUrl}
                alt="Preview"
                className="pointer-events-none h-full w-full object-cover select-none"
                style={{
                  objectPosition: `${positionX}% ${positionY}%`,
                  transform: `scale(${imageSize / 100})`,
                }}
              />

              {/* Crosshair Target Indicator */}
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  left: `${positionX}%`,
                  top: `${positionY}%`,
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

          {/* Zoom Slider Control */}
          <div className="space-y-1.5 rounded border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <ZoomIn className="h-3.5 w-3.5 text-[#ed1c24]" /> Phóng to / Thu nhỏ ảnh (Zoom)
              </span>
              <span className="font-mono text-xs text-[#ed1c24] font-black">{imageSize}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold text-slate-400">50%</span>
              <input
                type="range"
                min={50}
                max={200}
                step={5}
                value={imageSize}
                onChange={(e) => onChange({ image_size: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#ed1c24] dark:bg-slate-700"
              />
              <span className="text-[10px] font-semibold text-slate-400">200%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
