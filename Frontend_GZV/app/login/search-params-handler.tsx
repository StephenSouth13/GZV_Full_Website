"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function SearchParamsHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'registration-success') {
      toast.success('Đăng ký thành công!', {
        description: 'Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ.',
        duration: 4000
      })
    }
  }, [searchParams])

  return null
}