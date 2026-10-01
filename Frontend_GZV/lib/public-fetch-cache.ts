import { RequestCache } from "../../shared/data/request-cache"

// Only public CMS configuration can persist. Authenticated or account requests bypass this cache.
export const PUBLIC_CACHE_TABLES = ["site_navigation", "site_loading_settings", "site_branding_settings", "site_footer_settings", "site_floating_actions", "site_pages", "site_page_blocks", "site_home_sections", "site_section_templates", "partners"] as const
const allowed = new Set<string>(PUBLIC_CACHE_TABLES)
const cache = new RequestCache(60, () => typeof window !== "undefined" ? window.sessionStorage : undefined, "gzv-settings-v3:")
type StoredResponse = { body: string; status: number; statusText: string; headers: [string, string][] }

export const invalidatePublicTable = (table: string) => cache.invalidate(`${table}:`)

export async function cachedPublicFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const nativeFetch = globalThis.fetch
  if (typeof window === "undefined") return nativeFetch(input, init)
  const request = input instanceof Request ? input : undefined
  const url = new URL(request?.url || String(input), window.location.origin)
  const table = decodeURIComponent(url.pathname.match(/\/rest\/v1\/([^/]+)$/)?.[1] || "")
  if (!allowed.has(table) || url.origin !== new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || window.location.origin).origin) return nativeFetch(input, init)
  const method = (init?.method || request?.method || "GET").toUpperCase()
  if (method !== "GET") {
    if (!["POST", "PATCH", "PUT", "DELETE"].includes(method)) return nativeFetch(input, init)
    invalidatePublicTable(table)
    const response = await nativeFetch(input, init)
    invalidatePublicTable(table)
    return response
  }
  const headers = new Headers(init?.headers || request?.headers)
  const authorization = headers.get("authorization") || ""
  if (authorization && authorization !== `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`) return nativeFetch(input, init)
  // Include representation/range/count so different PostgREST query shapes never collide.
  const key = `${table}:${url.search}:${headers.get("accept") || ""}:${headers.get("range") || ""}:${headers.get("prefer") || ""}`
  const result = await cache.get<StoredResponse>(key, async () => {
    const response = await nativeFetch(input, init)
    if (!response.ok) {
      // Return Supabase's normal error response, without caching an error as data.
      throw { response: { body: await response.text(), status: response.status, statusText: response.statusText, headers: Array.from(response.headers.entries()) } }
    }
    return { body: await response.text(), status: response.status, statusText: response.statusText, headers: Array.from(response.headers.entries()) }
  }, 300000).catch((error) => { if (error?.response) return error.response as StoredResponse; throw error })
  return new Response(result.body, { status: result.status, statusText: result.statusText, headers: result.headers })
}
