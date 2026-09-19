import HomePageClient from "./HomePageClient"
import { getSupabaseServer } from "@/lib/supabase-server"
import { getInitialPartners } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = getSupabaseServer()

  const [sectionsResult, initialPartners] = await Promise.all([
    supabase
      .from("site_home_sections")
      .select("*")
      .order("sort_order", { ascending: true }),
    getInitialPartners(200),
  ])

  return <HomePageClient initialSections={sectionsResult.data || []} initialPartners={initialPartners} />
}
