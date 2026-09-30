export type MediaUrlKind = "image" | "video" | "embed"

const DRIVE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/?#]+)/i,
  /drive\.google\.com\/open\?id=([^&#]+)/i,
  /drive\.google\.com\/uc\?(?:.*&)?id=([^&#]+)/i,
  /drive\.google\.com\/thumbnail\?(?:.*&)?id=([^&#]+)/i,
]

export function getGoogleDriveFileId(url: string) {
  const cleanUrl = url.trim()
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = cleanUrl.match(pattern)
    if (match?.[1]) return decodeURIComponent(match[1])
  }
  return null
}

export function normalizeMediaUrl(url: string, kind: MediaUrlKind = "image") {
  const cleanUrl = url.trim()
  if (!cleanUrl) return ""

  const driveId = getGoogleDriveFileId(cleanUrl)
  if (driveId) {
    if (kind === "video" || kind === "embed") return `https://drive.google.com/file/d/${driveId}/preview`
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`
  }

  return cleanUrl
}

export function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) || /drive\.google\.com\/file\/d\/[^/?#]+\/preview/i.test(url)
}

export function looksLikeHtml(value: string) {
  return /<\/?(p|h[1-6]|ul|ol|li|blockquote|strong|em|span|figure|img|iframe|video|br|div)\b/i.test(value)
}


export type VideoProvider = "youtube" | "vimeo" | "tiktok" | "facebook" | "drive" | "file"

export type VideoEmbed = {
  provider: VideoProvider
  kind: "iframe" | "video"
  src: string
  id?: string
}

// "90", "90s", "1m30s", "1h2m3s" -> giây
const parseStartTime = (value: string | null) => {
  if (!value) return 0
  if (/^\d+$/.test(value)) return Number(value)
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!match) return 0
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0)
}

// Nhận diện link video (link xem, link chia sẻ, link embed) và trả về URL nhúng chuẩn của nền tảng
export function getVideoEmbed(input: string): VideoEmbed | null {
  const raw = (input || "").trim().replace(/&amp;/g, "&")
  if (!/^https?:\/\//i.test(raw)) return null
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m|mobile)\./i, "").toLowerCase()

  let youtubeId: string | null = null
  if (host === "youtu.be") youtubeId = url.pathname.split("/")[1] || null
  else if (host === "youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") youtubeId = url.searchParams.get("v")
    else youtubeId = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)?.[1] || null
  }
  if (youtubeId && /^[\w-]{6,20}$/.test(youtubeId)) {
    const start = parseStartTime(url.searchParams.get("t") || url.searchParams.get("start"))
    return { provider: "youtube", kind: "iframe", id: youtubeId, src: `https://www.youtube.com/embed/${youtubeId}?rel=0${start ? `&start=${start}` : ""}` }
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.match(/(\d{6,})/)?.[1]
    if (id) return { provider: "vimeo", kind: "iframe", id, src: `https://player.vimeo.com/video/${id}` }
  }

  if (host.endsWith("tiktok.com")) {
    const id = url.pathname.match(/\/(?:video|v2)\/(\d+)/)?.[1]
    if (id) return { provider: "tiktok", kind: "iframe", id, src: `https://www.tiktok.com/embed/v2/${id}` }
  }

  if (host === "facebook.com" && url.pathname.startsWith("/plugins/video.php")) {
    return { provider: "facebook", kind: "iframe", src: raw }
  }
  if (host === "fb.watch" || (host === "facebook.com" && /\/(videos|reel|watch)\b/.test(url.pathname + url.search))) {
    return { provider: "facebook", kind: "iframe", src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(raw)}&show_text=false` }
  }

  const driveId = getGoogleDriveFileId(raw)
  if (driveId) return { provider: "drive", kind: "iframe", id: driveId, src: `https://drive.google.com/file/d/${driveId}/preview` }

  if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(url.pathname)) return { provider: "file", kind: "video", src: raw }

  return null
}

const escapeAttr = (value: string) => value.replace(/&(?!amp;)/g, "&amp;").replace(/"/g, "&quot;")

export function videoEmbedHtml(embed: VideoEmbed, title = "Video") {
  const src = escapeAttr(embed.src)
  const style = `display:block;width:100%;aspect-ratio:${embed.provider === "tiktok" ? "9/16" : "16/9"};border:0;border-radius:16px;background:#050505;`
  const media =
    embed.kind === "video"
      ? `<video src="${src}" style="${style}" controls playsinline preload="metadata"></video>`
      : `<iframe src="${src}" width="100%" style="${style}" title="${escapeAttr(title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
  return `<figure class="gzv-embed" data-provider="${embed.provider}">${media}</figure>`
}

const decodeEntities = (value: string) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")

// Chuẩn hóa nội dung bài viết/dự án trước khi render:
// - đoạn chỉ chứa 1 link video (YouTube, Vimeo, TikTok, Facebook, Drive, mp4) -> khung video
// - đoạn chứa mã nhúng bị lưu thành chữ (&lt;iframe ...&gt;) -> khung video thật
// - iframe dùng link xem (youtube.com/watch, youtu.be) -> link embed hợp lệ
export function prepareRichContent(content: string) {
  if (!content) return ""
  let html = content.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (paragraph, inner: string) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, "")).trim()
    if (!text) return paragraph
    if (/^https?:\/\/\S+$/i.test(text)) {
      const embed = getVideoEmbed(text)
      return embed ? videoEmbedHtml(embed) : paragraph
    }
    if (/^<(figure|iframe|video)\b[\s\S]*>$/i.test(text)) {
      const src = text.match(/\bsrc=["']([^"']+)["']/i)?.[1]
      if (!src) return paragraph
      const embed = getVideoEmbed(src) || { provider: "file" as const, kind: /<video\b/i.test(text) ? ("video" as const) : ("iframe" as const), src }
      return videoEmbedHtml(embed)
    }
    return paragraph
  })
  html = html.replace(/(<iframe\b[^>]*\bsrc=["'])([^"']+)(["'])/gi, (match, before: string, src: string, after: string) => {
    const embed = getVideoEmbed(src)
    return embed && embed.kind === "iframe" ? `${before}${embed.src.replace(/&/g, "&amp;")}${after}` : match
  })
  return html
}
