"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

type Props = {
  value: number
  // Gọi khi người dùng xác nhận (Enter hoặc rời ô) với số mới khác số cũ
  onCommit: (value: number) => void
  className?: string
  title?: string
}

// Ô số thứ tự: giữ giá trị đang gõ, chỉ lưu khi Enter/blur, Esc để hủy.
// Trước đây lưu theo từng phím gõ: gõ "25" thì "2" đã được lưu và danh sách sắp xếp lại ngay,
// ô nhảy chỗ nên mất phím tiếp theo -> số thứ tự sai, trông như mất dữ liệu.
export function OrderNumberInput({ value, onCommit, className = "", title = "Số thứ tự hiển thị (Enter để lưu)" }: Props) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commit = () => {
    const next = parseInt(draft, 10)
    if (Number.isNaN(next)) {
      setDraft(String(value))
      return
    }
    if (next !== value) onCommit(next)
  }

  return (
    <Input
      type="number"
      inputMode="numeric"
      value={draft}
      title={title}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          ;(event.target as HTMLInputElement).blur()
        } else if (event.key === "Escape") {
          setDraft(String(value))
          ;(event.target as HTMLInputElement).blur()
        }
      }}
      // Không để thao tác trong ô kích hoạt kéo-thả của dòng/thẻ chứa nó
      onPointerDown={(event) => event.stopPropagation()}
      className={className}
    />
  )
}
