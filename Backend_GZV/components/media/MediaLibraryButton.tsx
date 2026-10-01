"use client"

import { useState } from "react"
import { Images } from "lucide-react"
import { MediaPickerDialog, type MediaAccept } from "@/components/media/MediaPickerDialog"

type Props = {
  // Nhận URL đã chọn (từ thư viện /admin/images, ảnh vừa tải lên, hoặc URL dán vào)
  onSelect: (url: string) => void
  folder?: string
  accept?: MediaAccept
  label?: string
  className?: string
  disabled?: boolean
}

// Nút đặt cạnh nút "Tải lên": chọn ảnh có sẵn trong thư viện hoặc dán URL (Drive, CDN...)
export function MediaLibraryButton({ onSelect, folder = "site", accept = "image", label = "Thư viện / URL", className = "", disabled }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 border border-slate-300 bg-white px-3 text-[10px] font-black uppercase text-slate-700 transition hover:border-[#ed1c24] hover:text-[#ed1c24] disabled:opacity-50 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 ${className || "h-9"}`}
      >
        <Images className="h-3.5 w-3.5" /> {label}
      </button>
      <MediaPickerDialog
        open={open}
        onClose={() => setOpen(false)}
        defaultFolder={folder.split("/")[0]}
        mode="field"
        accept={accept}
        onSelect={(result) => onSelect(result.url)}
      />
    </>
  )
}
