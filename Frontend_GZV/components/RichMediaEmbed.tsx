"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { getVideoEmbed } from "@/lib/media-url"

const spacing = (flush?: boolean) => (flush ? "" : "my-10")

const frameClass =
  "not-prose relative w-full overflow-hidden rounded-2xl bg-black shadow-[0_24px_60px_-20px_rgba(15,23,42,0.55)] ring-1 ring-slate-900/10 dark:ring-white/10"

function YouTubeFrame({ id, src, title, flush }: { id: string; src: string; title?: string; flush?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`)

  if (playing) {
    return (
      <div className={`${frameClass} ${spacing(flush)} aspect-video`}>
        <iframe
          src={`${src}${src.includes("?") ? "&" : "?"}autoplay=1`}
          title={title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    )
  }

  // Chỉ tải trình phát YouTube khi người đọc bấm play: trang nhẹ, ảnh bìa nét
  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label="Phát video" className={`${frameClass} ${spacing(flush)} group block aspect-video text-left`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt={title || "Video"}
        loading="lazy"
        onLoad={(event) => {
          // maxresdefault không tồn tại -> YouTube trả ảnh xám 120px, đổi sang hqdefault
          if (event.currentTarget.naturalWidth <= 120 && thumb.includes("maxresdefault")) setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)
        }}
        onError={() => setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 transition group-hover:from-black/60" />
      <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ed1c24] text-white shadow-[0_0_0_10px_rgba(237,28,36,0.25)] transition duration-300 group-hover:scale-110 group-hover:shadow-[0_0_0_16px_rgba(237,28,36,0.2)] md:h-24 md:w-24">
        <Play className="ml-1 h-9 w-9 fill-current md:h-10 md:w-10" />
      </span>
      <span className="absolute bottom-4 left-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-white/90">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#ed1c24]" /> Xem video
      </span>
    </button>
  )
}

export function RichIframe({ src, title, flush }: { src?: string; title?: string; flush?: boolean }) {
  if (!src) return null
  const embed = getVideoEmbed(src)
  if (embed?.provider === "youtube" && embed.id) return <YouTubeFrame id={embed.id} src={embed.src} title={title} flush={flush} />

  const finalSrc = embed?.kind === "iframe" ? embed.src : src
  const vertical = embed?.provider === "tiktok"
  return (
    <div className={`${frameClass} ${spacing(flush)} ${vertical ? "mx-auto aspect-[9/16] max-w-[360px]" : "aspect-video"}`}>
      <iframe
        src={finalSrc}
        title={title || "Video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  )
}

export function RichVideo({ src, poster, flush }: { src?: string; poster?: string; flush?: boolean }) {
  if (!src) return null
  return (
    <div className={`${frameClass} ${spacing(flush)}`}>
      <video src={src} poster={poster} controls playsInline preload="metadata" className="block aspect-video w-full bg-black" />
    </div>
  )
}

// Dùng cho ReactMarkdown (rehype-raw): figure.gzv-embed / iframe / video -> khung video đẹp
export const richMediaComponents = {
  figure: ({ node, className, children, ...props }: any) =>
    String(className || "").includes("gzv-embed") ? <>{children}</> : <figure className={className} {...props}>{children}</figure>,
  iframe: ({ src, title }: any) => <RichIframe src={src} title={title} />,
  video: ({ src, poster }: any) => <RichVideo src={src} poster={poster} />,
}
