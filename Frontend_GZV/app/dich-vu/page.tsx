import type { Metadata } from "next"
import ManagedPageClient from "@/components/ManagedPageClient"
import { getManagedPageInitialData } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dịch vụ - GZV",
  description: "Marketing, Sales và Digital Transformation theo mô hình triển khai thực chiến của GZV.",
}

export default async function ServicesPage() {
  const initialData = await getManagedPageInitialData("dich-vu")
  return <ManagedPageClient slug="dich-vu" {...initialData} />
}
