import PageBanner from "@/components/sections/common/PageBanner"
import StatsBar from "@/components/sections/common/StatsBar"
import BuilderPageGate from "@/components/BuilderPageGate"
import GzversGrid from "@/components/sections/home/GzversGrid"
import CtaBand from "@/components/sections/common/CtaBand"
import { getSupabaseServer } from "@/lib/supabase-server"
import type { PageBlock, SitePageContent } from "@/lib/site-content"
import { getInitialGzverGridData } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

async function getInitialGzverData() {
  const supabase = getSupabaseServer()

  const [blocksResult, pageResult, brandingResult, gzverSectionResult, gzverData] = await Promise.all([
    supabase
      .from("site_page_blocks")
      .select("*")
      .eq("page_slug", "gzver")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true }),
    supabase.from("site_pages").select("*").eq("slug", "gzver").maybeSingle(),
    supabase.from("site_branding_settings").select("*").eq("id", 1).maybeSingle(),
    // Load cấu hình section gzvers từ site_home_sections để SSR truyền vào component
    supabase.from("site_home_sections").select("*").eq("section_key", "gzvers").maybeSingle(),
    getInitialGzverGridData(),
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
    initialGzversSection: gzverSectionResult.data || null,
    initialGzverData: { items: gzverData.items, departments: gzverData.departments, config: gzverSectionResult.data || null },
  }
}

export default async function GzverPage() {
  const initialData = await getInitialGzverData()
  const gzverSection = initialData.initialGzversSection as any

  // Đọc stats từ section settings nếu có, fallback về mặc định
  const statsConfig = gzverSection?.settings?.stats || null

  return (
    <>
      <PageBanner
        badge="GZV ORGANIZATION"
        title="GZVers"
        subtitle="Hệ sinh thái nhân sự GZV được chia theo từng ban để thể hiện rõ vai trò, trách nhiệm và năng lực triển khai."
        initialPage={initialData.initialPage}
        initialGlobalBanner={initialData.initialGlobalBanner}
        initialSyncAllBanners={initialData.initialSyncAllBanners}
      />
      <BuilderPageGate slug="gzver" initialBlocks={initialData.initialBlocks} initialGzverData={initialData.initialGzverData}>
        <StatsBar
          stats={
            statsConfig || [
              { value: "50+", label: "GZVers", description: "Nhân sự trẻ trung, nhiệt huyết" },
              { value: "10+", label: "Cố vấn & Mentor", description: "Chuyên gia đầu ngành" },
              { value: "5+", label: "Ban chuyên môn", description: "Vận hành chuyên nghiệp" },
              { value: "100%", label: "Thực chiến", description: "Cam kết đồng hành" },
            ]
          }
        />
        {/* Không truyền title/subtitle cứng — component tự đọc từ site_home_sections (section_key = "gzvers") */}
        <GzversGrid initialItems={initialData.initialGzverData.items} initialDepartments={initialData.initialGzverData.departments} initialConfig={initialData.initialGzverData.config} />
        <CtaBand
          title={gzverSection?.settings?.cta_title || "GIA NHẬP GZV"}
          subtitle={
            gzverSection?.settings?.cta_subtitle ||
            "Trở thành một phần của cộng đồng trẻ năng động, sáng tạo và bứt phá giới hạn."
          }
          button_label={gzverSection?.settings?.cta_button_label || "Ứng tuyển ngay"}
          button_url={gzverSection?.settings?.cta_button_url || "/lien-he"}
          background_from={gzverSection?.settings?.cta_bg_from || "#050505"}
          background_to={gzverSection?.settings?.cta_bg_to || "#ed1c24"}
        />
      </BuilderPageGate>
    </>
  )
}
