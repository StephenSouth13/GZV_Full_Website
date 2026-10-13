"use client"

export const safeBackupName = (value: unknown, fallback = "item") => String(value || fallback)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-zA-Z0-9._-]+/g, "-")
  .replace(/^-+|-+$/g, "") || fallback

export const downloadBackupBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const normalizeList = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value
  if (typeof value !== "string" || !value.trim()) return []
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : [] } catch { return [] }
}

export const collectAssetUrls = (value: unknown, urls = new Set<string>()): Set<string> => {
  if (typeof value === "string") {
    const candidates = value.match(/(?:https?:\/\/[^\s"'<>]+|\/[^\s"'<>]+\.(?:avif|gif|jpe?g|png|svg|webp)(?:\?[^\s"'<>]*)?)/gi) || []
    candidates.forEach((item) => urls.add(item.replace(/&amp;/g, "&")))
  } else if (Array.isArray(value)) value.forEach((item) => collectAssetUrls(item, urls))
  else if (value && typeof value === "object") Object.values(value as Record<string, unknown>).forEach((item) => collectAssetUrls(item, urls))
  return urls
}

const extensionFor = (url: string, contentType = "") => {
  const fromUrl = url.split("?")[0].match(/\.([a-z0-9]{2,5})$/i)?.[1]
  if (fromUrl) return fromUrl.toLowerCase()
  return ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" } as Record<string, string>)[contentType.split(";")[0]] || "bin"
}

export async function addRemoteAssetsToZip(zip: any, assets: { folder: string; url: string; label?: string }[]) {
  const unique = [...new Map(assets.filter((asset) => /^(?:https?:\/\/|\/)/i.test(asset.url)).map((asset) => [`${asset.folder}|${asset.url}`, asset])).values()]
  const failures: string[] = []
  let cursor = 0
  const workers = Array.from({ length: Math.min(6, unique.length) }, async () => {
    while (cursor < unique.length) {
      const asset = unique[cursor++]
      try {
        const response = await fetch(asset.url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const blob = await response.blob()
        const extension = extensionFor(asset.url, response.headers.get("content-type") || blob.type)
        zip.file(`${asset.folder}/${safeBackupName(asset.label || "image")}-${cursor}.${extension}`, blob)
      } catch (error: any) {
        failures.push(`${asset.url}\t${error?.message || "Không tải được"}`)
      }
    }
  })
  await Promise.all(workers)
  return failures
}

export const appendWorksheet = async (workbook: any, name: string, rows: Record<string, unknown>[]) => {
  const XLSX = await import("xlsx")
  const safeRows = rows.length ? rows : [{ "Không có dữ liệu": "" }]
  const sheet = XLSX.utils.json_to_sheet(safeRows)
  sheet["!autofilter"] = { ref: sheet["!ref"] || "A1:A1" }
  sheet["!freeze"] = { xSplit: 0, ySplit: 1 }
  sheet["!cols"] = Object.keys(safeRows[0]).map((key) => ({ wch: Math.min(60, Math.max(14, key.length + 4)) }))
  XLSX.utils.book_append_sheet(workbook, sheet, name.replace(/[\\/?*\[\]:]/g, "-").slice(0, 31))
}
