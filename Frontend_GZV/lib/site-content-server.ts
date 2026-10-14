import { getSupabaseServer } from "@/lib/supabase-server"
import type { PageBlock, SitePageContent } from "@/lib/site-content"
import type { TeamData } from "@/lib/home-data"

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
  const authorOrder = new Map<string, number>((post.author_ids || []).map((id: string, index: number) => [id, index]))
  const authors = [...(post.authors_details || [])]
    .sort((a: any, b: any) => (authorOrder.get(a.id) ?? 9999) - (authorOrder.get(b.id) ?? 9999))
    .map((author: any) => ({ ...author, avatar_url: publicMediaUrl(author.avatar_url) }))
  return {
    ...post,
    id: String(post.id),
    authors,
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
    .order("sort_order", { ascending: true })
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
  const supabase = getSupabaseServer()
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false })
  const projects = data || []
  const authorIds = [...new Set(projects.flatMap((project: any) => project.author_ids || []))]
  const { data: authors } = authorIds.length ? await supabase.from("authors").select("id,full_name,avatar_url,slug,title,position").in("id", authorIds) : { data: [] as any[] }
  const authorMap = new Map((authors || []).map((author: any) => [author.id, author]))
  return projects.map((project: any) => ({
    ...project,
    image: publicMediaUrl(project.image || project.thumbnail_url),
    technologies: project.tech_stack || project.technologies || [],
    project_authors: (project.author_ids || []).map((id: string) => authorMap.get(id)).filter(Boolean).map((author: any) => ({ name: author.full_name, avatar: publicMediaUrl(author.avatar_url), profile_link: `/mentors/${author.slug}`, title: author.title || author.position })),
  }))
}

export async function getInitialProject(slug: string) {
  const { data } = await getSupabaseServer()
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  return data ? normalizeProject(data) : null
}

// Đội ngũ theo ban (Ban điều hành, Ban cố vấn, GZVers...) cho khối "Về chúng tôi"
export async function getInitialTeam(): Promise<TeamData> {
  const supabase = getSupabaseServer()
  const [departmentsResult, membersResult] = await Promise.all([
    supabase.from("gzver_departments").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("gzvers").select("*").eq("is_active", true).order("order", { ascending: true }),
  ])
  return {
    departments: departmentsResult.data || [],
    members: (membersResult.data || []).map((member: any) => ({ ...member, avatar_url: publicMediaUrl(member.avatar_url || member.image) })),
  }
}

export async function getInitialGzverGridData() {
  const supabase = getSupabaseServer()
  const [departmentsResult, membersResult, mentorsResult] = await Promise.all([
    supabase.from("gzver_departments").select("id,name,slug,description,is_active,sort_order").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("gzvers").select("id,full_name,slug,company,position,avatar_url,is_active,is_director,order,department_id,department_name,headline,avatar_position_x,avatar_position_y,avatar_scale,achievement_summary,testimonial").eq("is_active", true).order("order", { ascending: true }),
    supabase.from("mentors").select("id,full_name,slug,title,avatar_url,organizations,order,description,is_active").eq("is_active", true).order("order", { ascending: true }),
  ])
  const members = (membersResult.data || []).map((member: any) => ({ ...member, avatar_url: publicMediaUrl(member.avatar_url) }))
  const existingSlugs = new Set(members.map((member: any) => member.slug))
  const mentors = (mentorsResult.data || []).filter((mentor: any) => !existingSlugs.has(mentor.slug)).map((mentor: any) => ({
    id: mentor.id, full_name: mentor.full_name, slug: mentor.slug, position: mentor.title || "Cố vấn chuyên môn", company: mentor.organizations?.[0] || "GZV Center", avatar_url: publicMediaUrl(mentor.avatar_url), department_name: "BAN CỐ VẤN", is_active: true, is_advisor: true, order: mentor.order || 0, testimonial: mentor.description || "",
  }))
  return { items: [...members, ...mentors], departments: departmentsResult.data || [], team: { members, departments: departmentsResult.data || [] } as TeamData }
}

const HOME_BLOCK_TYPES = ["services_three", "projects_grid", "news_grid", "about_boxes"]

// Toàn bộ dữ liệu trang chủ tải sẵn trên server -> trang hiện đúng nội dung ngay lần đầu
export async function getHomeInitialData() {
  const supabase = getSupabaseServer()
  const [sectionsResult, blocksResult, projectsResult, posts, gzverData, partners] = await Promise.all([
    supabase.from("site_home_sections").select("*").order("sort_order", { ascending: true }),
    supabase.from("site_page_blocks").select("component_type, props").in("component_type", HOME_BLOCK_TYPES),
    supabase.from("projects").select("*").order("order_index", { ascending: true }).order("created_at", { ascending: false }).limit(6),
    getInitialBlogPosts(),
    getInitialGzverGridData(),
    getInitialPartners(200),
  ])

  const blockProps: Record<string, any> = {}
  for (const block of blocksResult.data || []) {
    if (!(block.component_type in blockProps)) blockProps[block.component_type] = block.props
  }

  return {
    sections: sectionsResult.data || [],
    blockProps,
    projects: projectsResult.data || [],
    posts,
    team: gzverData.team,
    gzverData: { items: gzverData.items, departments: gzverData.departments },
    partners,
  }
}

// Trang builder có khối đội ngũ thì tải sẵn danh sách thành viên
export async function getTeamIfNeeded(blocks: PageBlock[]) {
  return blocks.some((block) => block.component_type === "about_boxes" || block.component_type === "people_grid") ? getInitialTeam() : undefined
}
