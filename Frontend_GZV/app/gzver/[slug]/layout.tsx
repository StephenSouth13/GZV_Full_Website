import type { Metadata } from "next"
import { getSupabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: member } = await getSupabaseServer()
    .from("gzvers")
    .select("full_name, slug, position, headline, achievement_summary, avatar_url, cover_image_url")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!member) return { title: "GZVer" }

  const title = `${member.full_name} - GZVer`
  const description = member.headline || member.achievement_summary || member.position || "Hồ sơ thành viên GZV LTD"
  const image = member.cover_image_url || member.avatar_url || "/og-cover.jpg"
  const url = `/gzver/${member.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "GZV LTD",
      type: "profile",
      images: [{ url: image, alt: member.full_name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}

export default function GzverDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
