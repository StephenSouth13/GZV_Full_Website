import type { Metadata } from "next"
import PageBuilderRenderer from "@/components/PageBuilderRenderer"

export const metadata: Metadata = {
  title: "Dịch vụ - GZV",
  description: "Marketing, Sales và Digital Transformation theo mô hình triển khai thực chiến của GZV.",
}

export default function ServicesPage() {
  return <PageBuilderRenderer slug="dich-vu" />
}
