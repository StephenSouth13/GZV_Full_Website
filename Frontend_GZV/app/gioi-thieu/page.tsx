import AboutPageClient from "./AboutPageClient"
import { getSupabaseServer } from "@/lib/supabase-server"
import type { PageBlock, SitePageContent } from "@/lib/site-content"

export const dynamic = "force-dynamic"

async function getInitialAboutData() {
  const supabase = getSupabaseServer()

  const [blocksResult, pageResult, brandingResult] = await Promise.all([
    supabase
      .from("site_page_blocks")
      .select("*")
      .eq("page_slug", "gioi-thieu")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true }),
    supabase.from("site_pages").select("*").eq("slug", "gioi-thieu").maybeSingle(),
    supabase.from("site_branding_settings").select("*").eq("id", 1).maybeSingle(),
  ])

  let globalBanner: Record<string, any> | null = null
  let syncAllBanners = true
  const branding = brandingResult.data as any

  try {
    if (branding?.default_keywords?.startsWith("{")) {
      const meta = JSON.parse(branding.default_keywords)
      globalBanner = meta.global_banner || null
      if (typeof meta.sync_all_banners === "boolean") {
        syncAllBanners = meta.sync_all_banners
      }
    }
  } catch {
    globalBanner = null
  }

  return {
    initialBlocks: (blocksResult.data || []) as PageBlock[],
    initialPage: (pageResult.data || null) as SitePageContent | null,
    initialGlobalBanner: globalBanner,
    initialSyncAllBanners: syncAllBanners,
  }
}

export default async function AboutPage() {
  const initialData = await getInitialAboutData()
  return <AboutPageClient {...initialData} />
}
