import type { Metadata } from "next"
import ManagedPageClient from "@/components/ManagedPageClient"
import { getManagedPageInitialData } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Liên hệ - GZV Center",
  description: "Liên hệ với GZV Center để được tư vấn về các chương trình đào tạo và giải pháp phù hợp",
}

export default async function ContactPage() {
  const initialData = await getManagedPageInitialData("lien-he")
  return <ManagedPageClient slug="lien-he" {...initialData} />
}
