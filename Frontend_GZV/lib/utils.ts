import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mô tả ngắn cho thẻ tin tức/dự án: lấy trường đầu tiên có nội dung, bỏ thẻ HTML/markdown, cắt gọn theo từ
export function summarize(values: Array<string | null | undefined>, max = 180) {
  const source = values.find((value) => value && String(value).trim()) || ""
  const text = String(source)
    .replace(/<(figure|iframe|video|script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>~]+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text
}
