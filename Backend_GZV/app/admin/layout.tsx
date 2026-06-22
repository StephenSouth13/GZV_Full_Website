//D:\MSC\Backend_MSC\app\admin\layout.tsx
"use client"

import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminAuthProvider } from '@/components/auth/AdminAuthProvider'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminAuthProvider>
  )
}