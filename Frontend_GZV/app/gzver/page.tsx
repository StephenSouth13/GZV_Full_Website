import PageBanner from "@/components/sections/common/PageBanner"
import StatsBar from "@/components/sections/common/StatsBar"
import BuilderPageGate from "@/components/BuilderPageGate"
import GzversGrid from "@/components/sections/home/GzversGrid"
import CtaBand from "@/components/sections/common/CtaBand"
import { getSupabaseServer } from "@/lib/supabase-server"
import type { PageBlock, SitePageContent } from "@/lib/site-content"

export const dynamic = "force-dynamic"

async function getInitialGzverData() {
  const supabase = getSupabaseServer()

  const [blocksResult, pageResult, brandingResult] = await Promise.all([
    supabase
      .from("site_page_blocks")
      .select("*")
      .eq("page_slug", "gzver")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true }),
    supabase.from("site_pages").select("*").eq("slug", "gzver").maybeSingle(),
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

export default async function GzverPage() {
  const initialData = await getInitialGzverData()

  return (
    <>
      <PageBanner
        badge="GZV ORGANIZATION"
        title="GZVers"
        subtitle="He sinh thai nhan su GZV duoc chia theo tung ban de the hien ro vai tro, trach nhiem va nang luc trien khai."
        initialPage={initialData.initialPage}
        initialGlobalBanner={initialData.initialGlobalBanner}
        initialSyncAllBanners={initialData.initialSyncAllBanners}
      />
      <BuilderPageGate slug="gzver" initialBlocks={initialData.initialBlocks}>
        <StatsBar
          stats={[
            { value: "50+", label: "GZVers", description: "Nhan su tre trung, nhiet huyet" },
            { value: "10+", label: "Co van & Mentor", description: "Chuyen gia dau nganh" },
            { value: "5+", label: "Ban chuyen mon", description: "Van hanh chuyen nghiep" },
            { value: "100%", label: "Thuc chien", description: "Cam ket dong hanh" },
          ]}
        />
        <GzversGrid title="DOI NGU NHAN SU GZV" subtitle="Doi ngu nhan su, co van va chuyen gia dong hanh" />
        <CtaBand
          title="GIA NHAP GZV"
          subtitle="Tro thanh mot phan cua cong dong tre nang dong, sang tao va but pha gioi han."
          button_label="Ung tuyen ngay"
          button_url="/lien-he"
          background_from="#050505"
          background_to="#ed1c24"
        />
      </BuilderPageGate>
    </>
  )
}
