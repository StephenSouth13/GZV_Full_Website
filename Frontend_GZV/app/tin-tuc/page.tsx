import NewsPageClient from "./NewsPageClient"
import { getInitialBlogPosts, getManagedPageInitialData } from "@/lib/site-content-server"
import { getSupabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export default async function NewsPage() {
  const [articles, managed, section] = await Promise.all([
    getInitialBlogPosts(),
    getManagedPageInitialData("tin-tuc"),
    getSupabaseServer().from("site_home_sections").select("settings").eq("section_key", "news").maybeSingle(),
  ])

  return <NewsPageClient initialArticles={articles} initialNewsSettings={section.data?.settings} {...managed} />
}
