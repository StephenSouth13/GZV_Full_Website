"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Catch-all route for invalid admin URLs
export default function AdminCatchAllPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin dashboard for any invalid admin URLs
    router.replace('/admin/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-gray-500">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}