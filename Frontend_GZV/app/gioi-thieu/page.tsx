import type { Metadata } from "next"
import AboutPageClient from "./AboutPageClient"

export const metadata: Metadata = {
  title: "Giới thiệu - GZV",
  description: "Câu chuyện, sứ mệnh, tầm nhìn, giá trị cốt lõi và mô hình mentoring của GZV.",
}

export default function AboutPage() {
  return <AboutPageClient />
}
