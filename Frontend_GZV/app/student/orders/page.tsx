"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"

export default function OrdersPage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
      <Card>
        <CardContent className="p-6 text-center text-gray-600">
          Chưa có đơn hàng nào.
        </CardContent>
      </Card>
    </div>
  )
}
