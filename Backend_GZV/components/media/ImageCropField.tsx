"use client"

import { Move, ZoomIn } from "lucide-react"

type Props = {
  imageUrl: string
  positionX: number
  positionY: number
  scale: number
  onChange: (patch: { position_x?: number; position_y?: number; scale?: number }) => void
  aspect?: string
  minScale?: number
  maxScale?: number
  label?: string
  cropHeightClassName?: string
}

/**
 * Ô chỉnh crop dùng chung: kéo chuột để đổi trọng tâm ảnh (object-position),
 * thanh trượt để zoom. Dùng cùng công thức object-position/scale với
 * ImagePositionAndZoomEditor (site-content) và GZVerModal (avatar/cover) để
 * mọi nơi crop-ra-sao thì hiển thị đúng y vậy ở frontend.
 */
export function ImageCropField({
  imageUrl,
  positionX = 50,
  positionY = 50,
  scale = 100,
  onChange,
  aspect = "1",
  minScale = 50,
  maxScale = 200,
  label = "Căn chỉnh khung ảnh",
  cropHeightClassName = "h-56",
}: Props) {
  if (!imageUrl) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <Move className="h-3.5 w-3.5 text-[#ed1c24]" /> {label}
        </span>
        <span className="font-mono text-[11px] font-black text-[#ed1c24]">
          X: {positionX}% · Y: {positionY}%
        </span>
      </div>

      <div
        className={`group relative w-full cursor-crosshair select-none overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 dark:border-white/20 dark:bg-slate-900 ${cropHeightClassName}`}
        style={{ aspectRatio: aspect }}
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const updateCoords = (clientX: number, clientY: number) => {
            const x = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)))
            const y = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)))
            onChange({ position_x: x, position_y: y })
          }
          updateCoords(e.clientX, e.clientY)

          const handleMouseMove = (moveEvent: MouseEvent) => updateCoords(moveEvent.clientX, moveEvent.clientY)
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
          alt="Crop preview"
          className="pointer-events-none h-full w-full select-none object-cover"
          style={{ objectPosition: `${positionX}% ${positionY}%`, transform: `scale(${scale / 100})` }}
        />
        <div
          className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          style={{ left: `${positionX}%`, top: `${positionY}%` }}
        >
          <div className="h-7 w-7 rounded-full border-2 border-[#ed1c24] bg-white/40 shadow-[0_0_10px_rgba(237,28,36,0.8)]" />
          <div className="absolute h-2 w-2 rounded-full bg-[#ed1c24]" />
        </div>
      </div>

      <div className="space-y-1.5 rounded border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <ZoomIn className="h-3.5 w-3.5 text-[#ed1c24]" /> Phóng to / thu nhỏ
          </span>
          <span className="font-mono text-xs font-black text-[#ed1c24]">{scale}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold text-slate-400">{minScale}%</span>
          <input
            type="range"
            min={minScale}
            max={maxScale}
            step={5}
            value={scale}
            onChange={(e) => onChange({ scale: Number(e.target.value) })}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#ed1c24] dark:bg-slate-700"
          />
          <span className="text-[10px] font-semibold text-slate-400">{maxScale}%</span>
        </div>
        {(positionX !== 50 || positionY !== 50 || scale !== 100) && (
          <button
            type="button"
            onClick={() => onChange({ position_x: 50, position_y: 50, scale: 100 })}
            className="text-[10px] font-bold uppercase text-slate-400 hover:text-[#ed1c24]"
          >
            Đặt lại mặc định
          </button>
        )}
      </div>
    </div>
  )
}
