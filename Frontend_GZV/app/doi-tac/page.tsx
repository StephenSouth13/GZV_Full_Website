import ManagedPageClient from "@/components/ManagedPageClient"
import { getInitialPartners, getManagedPageInitialData } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export default async function DoiTacPage() {
  const [initialData, initialPartners] = await Promise.all([
    getManagedPageInitialData("doi-tac"),
    getInitialPartners(200),
  ])

  return <ManagedPageClient slug="doi-tac" {...initialData} initialPartners={initialPartners} />
}
