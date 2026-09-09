import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"

export function RawJsonEditor({
  value,
  onChange,
}: {
  value: Record<string, any>
  onChange: (value: Record<string, any>) => void
}) {
  const [rawJson, setRawJson] = useState(() => JSON.stringify(value || {}, null, 2))
  const [jsonError, setJsonError] = useState("")

  useEffect(() => {
    setRawJson(JSON.stringify(value || {}, null, 2))
    setJsonError("")
  }, [value])

  return (
    <div className="space-y-1.5">
      <Textarea
        className="min-h-[220px] font-mono text-xs rounded-none border-slate-300 bg-slate-900 text-slate-100 dark:bg-black dark:border-white/10"
        value={rawJson}
        onChange={(event) => {
          const text = event.target.value
          setRawJson(text)
          try {
            const parsed = JSON.parse(text || "{}")
            setJsonError("")
            onChange(parsed)
          } catch (error: any) {
            setJsonError(error.message || "JSON không hợp lệ")
          }
        }}
      />
      {jsonError && <p className="text-xs font-bold text-red-500">{jsonError}</p>}
    </div>
  )
}
