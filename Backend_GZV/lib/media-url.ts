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
  const media =
    embed.kind === "video"
      ? `<video src="${src}" controls playsinline preload="metadata"></video>`
      : `<iframe src="${src}" title="${escapeAttr(title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
  return `<figure class="gzv-embed" data-provider="${embed.provider}">${media}</figure>`
}
