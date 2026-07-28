//D:\gzv\Backend_gzv\app\admin\layout.tsx
"use client"

import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminAuthProvider } from '@/components/auth/AdminAuthProvider'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <ProtectedRoute allowedRoles={["admin", "collab"]}>
        <AdminLayout>
          {children}
        </AdminLayout>
      </ProtectedRoute>
    </AdminAuthProvider>
  )
}
