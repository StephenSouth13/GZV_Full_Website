import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FloatingActionsTab() {
  return (
    <Card className="rounded-none border-slate-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-lg font-black uppercase">Cấu hình Nút Floating</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-slate-500">Nút liên hệ nhanh, hotline, Messenger, Zalo trên màn hình.</p>
      </CardContent>
    </Card>
  )
}
