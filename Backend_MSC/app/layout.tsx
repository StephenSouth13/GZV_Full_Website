import "./globals.css";
import { Inter } from "next/font/google";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
});

export const metadata = {
  title: "MSC Backend System",
  description: "Hệ thống quản trị nội dung MSC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={`${inter.className} antialiased overflow-hidden bg-slate-50 text-slate-900`}
      >
        <AdminLayoutShell>
          {children}
        </AdminLayoutShell>
      </body>
    </html>
  );
}