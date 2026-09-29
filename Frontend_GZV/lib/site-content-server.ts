import { getSupabaseServer } from "@/lib/supabase-server"
import type { PageBlock, SitePageContent } from "@/lib/site-content"

export type ManagedPageInitialData = {
  initialBlocks: PageBlock[]
  initialPage: SitePageContent | null
  initialGlobalBanner: Record<string, any> | null
  initialSyncAllBanners: boolean
}

export async function getManagedPageInitialData(slug: string): Promise<ManagedPageInitialData> {
  const supabase = getSupabaseServer()

  const [blocksResult, pageResult, brandingResult] = await Promise.all([
    supabase
      .from("site_page_blocks")
      .select("*")
      .eq("page_slug", slug)
      .eq("is_visible", true)
      .order("sort_order", { ascending: true }),
    supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle(),
    supabase.from("site_branding_settings").select("*").eq("id", 1).maybeSingle(),
  ])

  let initialGlobalBanner: Record<string, any> | null = null
  let initialSyncAllBanners = true
  const branding = brandingResult.data as any

  try {
    if (branding?.default_keywords?.startsWith("{")) {
      const meta = JSON.parse(branding.default_keywords)
      initialGlobalBanner = meta.global_banner || null
      if (typeof meta.sync_all_banners === "boolean") {
        initialSyncAllBanners = meta.sync_all_banners
      }
    }
  } catch {
    initialGlobalBanner = null
  }

  return {
    initialBlocks: (blocksResult.data || []) as PageBlock[],
    initialPage: (pageResult.data || null) as SitePageContent | null,
    initialGlobalBanner,
    initialSyncAllBanners,
  }
}

export async function getInitialPartners(limit = 200) {
  const supabase = getSupabaseServer()
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(limit)

  return data || []
}

function publicMediaUrl(path?: string | null) {
  if (!path) return "/placeholder-avatar.jpg"
  const value = String(path).trim()
  if (/^(https?:|data:|blob:)/i.test(value) || value.startsWith("/")) return value
  const normalized = value.replace(/^media\//, "").replace(/^\/+/, "")
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${normalized}`
}

function normalizePost(post: any) {
  return {
    ...post,
    id: String(post.id),
    authors: post.authors_details || [],
    publish_date: post.publish_date || post.created_at,
    read_time: post.read_time || "5 phút đọc",
    image: publicMediaUrl(post.thumbnail_url || post.image),
  }
}

export async function getInitialBlogPosts() {
  const { data } = await getSupabaseServer()
    .from("allblogposts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("publish_date", { ascending: false })
  return (data || []).map(normalizePost)
}

export async function getInitialBlogPost(slug: string) {
  const { data } = await getSupabaseServer()
    .from("allblogposts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle()
  return data ? normalizePost(data) : null
}

export async function getArticleSlugRedirect(slug: string) {
  const supabase = getSupabaseServer()
  const { data: redirectRow } = await supabase
    .from("article_slug_redirects")
    .select("article_id")
    .eq("old_slug", slug)
    .maybeSingle()

  if (!redirectRow?.article_id) return null

  const { data: article } = await supabase
    .from("allblogposts")
    .select("slug")
    .eq("id", redirectRow.article_id)
    .eq("status", "published")
    .maybeSingle()

  return article?.slug || null
}

async function getProjectAuthors(authorIds: string[] = []) {
  if (!authorIds.length) return []
  const { data } = await getSupabaseServer()
    .from("authors")
    .select("id, full_name, avatar_url, slug, title, position")
    .in("id", authorIds)
  return authorIds
    .map(id => (data || []).find((author: any) => author.id === id))
    .filter(Boolean)
    .map((author: any) => ({
      name: author.full_name,
      avatar: publicMediaUrl(author.avatar_url),
      profile_link: `/mentors/${author.slug}`,
      title: author.title || author.position,
    }))
}

async function normalizeProject(project: any) {
  return {
    ...project,
    image: publicMediaUrl(project.image || project.thumbnail_url),
    technologies: project.tech_stack || project.technologies || [],
    project_authors: await getProjectAuthors(project.author_ids || []),
  }
}

export async function getInitialProjects() {
  const { data } = await getSupabaseServer()
    .from("projects")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false })
  return Promise.all((data || []).map(normalizeProject))
}

export async function getInitialProject(slug: string) {
  const { data } = await getSupabaseServer()
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  return data ? normalizeProject(data) : null
}
