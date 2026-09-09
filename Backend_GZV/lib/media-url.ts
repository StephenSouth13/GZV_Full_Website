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

