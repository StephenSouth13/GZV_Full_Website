export const CV_TEMPLATES = [
  { id: "executive", name: "Executive", caption: "Hồ sơ lãnh đạo · Hai cột", color: "#ed1c24", background: "#ffffff" },
  { id: "minimal", name: "Essential", caption: "Tinh gọn · Đọc rõ từng mục", color: "#334155", background: "#fafaf9" },
  { id: "midnight", name: "Midnight", caption: "Nền tối · Điểm nhấn sang trọng", color: "#d7b47b", background: "#101827" },
  { id: "editorial", name: "Editorial", caption: "Tạp chí · Typography thanh lịch", color: "#a34532", background: "#f7f3ed" },
  { id: "studio", name: "Studio", caption: "Sáng tạo · Bố cục bất đối xứng", color: "#5753df", background: "#f2f0ff" },
  { id: "portfolio", name: "Portfolio", caption: "Dự án nổi bật · Ảnh khổ lớn", color: "#0f766e", background: "#edf5f2" },
] as const

export type CvTemplate = typeof CV_TEMPLATES[number]["id"]
export const CV_PROJECT_FIELDS = "id,title,slug,description,detailproject,image,thumbnail_url,gallery,category,status,tech_stack,hashtags,external_url,demo_url,video_url,order_index,author_ids,updated_at,image_position_x,image_position_y,image_scale"
export const normalizeTemplate = (value: unknown): CvTemplate => CV_TEMPLATES.some((item) => item.id === value) ? value as CvTemplate : "executive"

function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}
export function cvContrastInk(accent: string) { return luminance(accent) > 0.179 ? "#172033" : "#ffffff" }
export function cvReadableAccent(accent: string, template: CvTemplate) {
  const background = template === "midnight" ? "#101827" : template === "editorial" ? "#f7f3ed" : "#ffffff"
  const a = luminance(accent), b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5 ? accent : template === "midnight" ? "#f2f5fb" : "#172033"
}

export function cvText(value: unknown): string {
  if (typeof value === "number") return String(value)
  if (Array.isArray(value)) return value.map(cvText).filter(Boolean).join("\n")
  if (value && typeof value === "object") {
    const node = value as any
    if (node.type === "text") return node.text || ""
    if (Array.isArray(node.content)) return node.content.map(cvText).filter(Boolean).join(node.type === "paragraph" || node.type === "heading" ? "" : "\n")
    return ""
  }
  if (typeof value !== "string") return ""
  return value.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/(?:p|div|h[1-6]|li|blockquote)>|<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:nbsp|amp|lt|gt|quot|apos);|&#(\d+);|&#x([\da-f]+);/gi, (entity, decimal, hex) => {
      if (decimal || hex) { const code = parseInt(decimal || hex, decimal ? 10 : 16); return code <= 0x10ffff ? String.fromCodePoint(code) : "" }
      return ({ "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" } as Record<string, string>)[entity.toLowerCase()] || entity
    }).replace(/\n[ \t]*\n[ \t]*\n/g, "\n\n").trim()
}

export function cvList(value: unknown): any[] {
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed } catch {}
    return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean)
  }
  return []
}

export const safeCvLink = (value: unknown): string => typeof value === "string" && (/^https?:\/\//i.test(value.trim()) || /^\/(?!\/)/.test(value.trim())) ? value.trim() : ""
export function safeCvImage(value: unknown): string {
  if (typeof value !== "string") return ""
  const source = value.trim()
  const dashboard = source.match(/supabase\.com\/dashboard\/project\/[^/]+\/storage\/files\/buckets\/media\/(.+)$/i)
  const direct = dashboard ? "" : safeCvLink(source)
  if (direct) return direct
  if (/^data:image\/(?:png|jpeg|webp);base64,/i.test(source)) return source
  let path = source
  try { if (dashboard) path = decodeURIComponent(dashboard[1]) } catch { return "" }
  path = path.replace(/^media\//, "")
  if (!/^[^:<>"]+\.(?:png|jpe?g|webp|gif|avif|svg)$/i.test(path) || path.startsWith("/") || path.split("/").some((segment) => segment === ".." || segment === ".")) return ""
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return base ? `${base}/storage/v1/object/public/media/${path.split("/").map(encodeURIComponent).join("/")}` : `/${path}`
}

export function projectImages(project: any): { src: string; caption: string }[] {
  const images: { src: string; caption: string }[] = []
  const add = (value: any) => {
    const src = safeCvImage(typeof value === "string" ? value : value?.src || value?.url || value?.image_url)
    if (src && !images.some((image) => image.src === src)) images.push({ src, caption: typeof value === "object" ? cvText(value.caption || value.alt || value.title) : "" })
  }
  add(project.image || project.thumbnail_url)
  cvList(project.image_urls).forEach(add)
  cvList(project.gallery).forEach(add)
  // Rich project content may contain portfolio images as well as text.
  for (const match of String(project.detailproject || "").matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)) add(match[1])
  return images
}

export function mergeCvProjects(person: any, projects: any[], highlights: any[]) {
  const overrides = new Map(highlights.map((row) => [row.project_id, row]))
  const identities = [person.id, person.linked_author_id].filter(Boolean)
  return projects.filter((project) => {
    if (project.status === "draft") return false
    const override = overrides.get(project.id)
    return override ? override.is_visible !== false : cvList(project.author_ids).some((id) => identities.includes(id))
  }).map((project) => {
    const override = overrides.get(project.id)
    return { ...project, contribution: override?.contribution || "", profile_contribution: override?.contribution || "", image_urls: override?.image_urls || [], cv_order: override?.sort_order ?? project.order_index ?? 0 }
  }).sort((a, b) => a.cv_order - b.cv_order || String(a.id).localeCompare(String(b.id)))
}
