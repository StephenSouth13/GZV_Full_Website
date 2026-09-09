import React, { useRef, useState } from "react"
import { Image as ImageIcon, Link2, Loader2, Move, Upload, Video, ZoomIn } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { isVideoUrl, normalizeMediaUrl } from "@/lib/media-url"
import { toast } from "@/hooks/use-toast"
import { Field } from "./BasicHelpers"

type MediaPatch = {
  image_url?: string
  video_url?: string
  media_type?: "image" | "video"
  position_x?: number
  position_y?: number
  image_size?: number
}

export function ImagePositionAndZoomEditor({
  imageUrl,
  positionX = 50,
  positionY = 50,
  imageSize = 100,
  onChange,
  onPickImage,
  title = "Anh minh hoa Section",
}: {
  imageUrl: string
  positionX?: number
  positionY?: number
  imageSize?: number
  onChange: (patch: MediaPatch) => void
  onPickImage?: () => void
  title?: string
}) {
  const [uploading, setUploading] = useState<"image" | "video" | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const mediaUrl = imageUrl || ""
  const video = isVideoUrl(mediaUrl)

  const normalizeCurrentUrl = (kind: "image" | "video" = video ? "video" : "image") => {
    const normalized = normalizeMediaUrl(mediaUrl, kind)
    if (!normalized || normalized === mediaUrl) return
    onChange({
      image_url: normalized,
      video_url: kind === "video" ? normalized : undefined,
      media_type: kind,
    })
  }

  const uploadFile = async (file: File, kind: "image" | "video") => {
    if (!file) return
    setUploading(kind)
    try {
      const safe = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "")
      const path = `site-content/${kind}s/${Date.now()}_${safe}`
      const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path)
      onChange({
        image_url: publicUrl,
        video_url: kind === "video" ? publicUrl : undefined,
        media_type: kind,
        position_x: kind === "image" ? positionX : undefined,
        position_y: kind === "image" ? positionY : undefined,
        image_size: kind === "image" ? imageSize : undefined,
      })
      toast({ title: kind === "video" ? "Da upload video" : "Da upload anh" })
    } catch (error: any) {
      toast({ title: "Loi upload media", description: error.message, variant: "destructive" })
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-4 border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-white/10">
        {video ? <Video className="h-4 w-4 text-[#ed1c24]" /> : <ImageIcon className="h-4 w-4 text-[#ed1c24]" />}
        <div>
          <p className="text-xs font-black uppercase text-slate-950 dark:text-white">{title}</p>
          <p className="text-[11px] text-slate-500">
            Nhap URL anh/video, link Google Drive, upload file va can chinh trong tam anh.
          </p>
        </div>
      </div>

      <Field label="URL anh / video / Google Drive">
        <div className="grid gap-2 lg:grid-cols-[1fr_auto]">
          <Input
            value={mediaUrl}
            onChange={(e) => {
              const nextUrl = e.target.value
              const nextKind = isVideoUrl(nextUrl) ? "video" : "image"
              onChange({
                image_url: nextUrl,
                video_url: nextKind === "video" ? nextUrl : undefined,
                media_type: nextKind,
              })
            }}
            onBlur={() => normalizeCurrentUrl()}
            placeholder="/gioi-thieu/19.webp hoặc link Google Drive"
            className="rounded-none font-mono text-xs"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-none shrink-0 text-xs font-bold" onClick={() => normalizeCurrentUrl()}>
              <Link2 className="mr-1.5 h-3.5 w-3.5" /> Chuan URL
            </Button>
            {onPickImage && (
              <Button type="button" variant="outline" className="rounded-none shrink-0 text-xs font-bold" onClick={onPickImage}>
                <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Thu vien
              </Button>
            )}
            <Button type="button" variant="outline" className="rounded-none shrink-0 text-xs font-bold" onClick={() => imageInputRef.current?.click()}>
              {uploading === "image" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
              Anh
            </Button>
            <Button type="button" variant="outline" className="rounded-none shrink-0 text-xs font-bold" onClick={() => videoInputRef.current?.click()}>
              {uploading === "video" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Video className="mr-1.5 h-3.5 w-3.5" />}
              Video
            </Button>
          </div>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) uploadFile(file, "image")
            event.target.value = ""
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) uploadFile(file, "video")
            event.target.value = ""
          }}
        />
      </Field>

      {mediaUrl && (
        <div className="space-y-3">
          {video ? (
            <div className="overflow-hidden border border-slate-200 bg-slate-950 dark:border-white/10">
              {/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(mediaUrl) ? (
                <video src={normalizeMediaUrl(mediaUrl, "video")} className="aspect-video w-full bg-black" controls playsInline />
              ) : (
                <iframe
                  src={normalizeMediaUrl(mediaUrl, "video")}
                  className="aspect-video w-full bg-black"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Move className="h-3.5 w-3.5 text-[#ed1c24]" /> Keo tha / nhap chuot de can chinh trong tam:
                  </span>
                  <span className="font-mono text-[11px] font-black text-[#ed1c24]">
                    X: {positionX}% | Y: {positionY}%
                  </span>
                </div>

                <div
                  className="group relative h-60 w-full cursor-crosshair select-none overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 dark:border-white/20 dark:bg-slate-900"
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
                    src={normalizeMediaUrl(mediaUrl, "image")}
                    alt="Preview"
                    className="pointer-events-none h-full w-full select-none object-cover"
                    style={{
                      objectPosition: `${positionX}% ${positionY}%`,
                      transform: `scale(${imageSize / 100})`,
                    }}
                  />

                  <div
                    className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                    style={{ left: `${positionX}%`, top: `${positionY}%` }}
                  >
                    <div className="h-7 w-7 rounded-full border-2 border-[#ed1c24] bg-white/40 shadow-[0_0_10px_rgba(237,28,36,0.8)]" />
                    <div className="absolute h-2 w-2 rounded-full bg-[#ed1c24]" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 rounded border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <ZoomIn className="h-3.5 w-3.5 text-[#ed1c24]" /> Phong to / thu nho anh
                  </span>
                  <span className="font-mono text-xs font-black text-[#ed1c24]">{imageSize}%</span>
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
            </>
          )}
        </div>
      )}
    </div>
  )
}

