"use client"

import { supabase } from "./supabase"
import { RequestCache } from "../../shared/data/request-cache"
import { CV_PROJECT_FIELDS } from "../../shared/gzver/cv-model"

const cache = new RequestCache(32)
let scope = ""
let channel: ReturnType<typeof supabase.channel> | undefined
let listening = false
const watchers = new Set<() => void>()
let timer: ReturnType<typeof setTimeout> | undefined

async function ensureScope() {
  const { data } = await supabase.auth.getSession()
  const next = data.session?.user.id || "anonymous"
  if (!listening) {
    listening = true
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (scope && session?.user.id && session.user.id !== scope)) {
        cache.invalidate(); scope = ""; clearTimeout(timer)
        if (channel) void supabase.removeChannel(channel)
        channel = undefined
      }
    })
  }
  if (scope !== next) { cache.invalidate(); scope = next }
  if (!channel && next !== "anonymous") {
    channel = supabase.channel("admin-gzver-catalog-v3")
    for (const table of ["projects", "authors", "gzver_project_highlights"]) channel.on("postgres_changes", { event: "*", schema: "public", table }, (event) => {
      cache.invalidate(table === "gzver_project_highlights" ? "highlights:" : `${table}:`)
      if (table === "gzver_project_highlights") return // Preserve the admin's unsaved selections.
      clearTimeout(timer); timer = setTimeout(() => watchers.forEach((callback) => callback()), 250)
    })
    channel.subscribe()
  }
  return scope
}

export function watchGzverCatalog(callback: () => void) { watchers.add(callback); return () => { watchers.delete(callback) } }
export const invalidateGzverHighlights = () => cache.invalidate("highlights:")

export async function getGzverAuthors() {
  const user = await ensureScope()
  return cache.get<any[]>(`authors:${user}`, async () => {
    const { data, error } = await supabase.from("authors").select("id,full_name,avatar_url,title,bio").order("full_name")
    if (error) throw error
    return data || []
  }, 300000)
}

export async function getGzverProjectCatalog() {
  const user = await ensureScope()
  return cache.get<any[]>(`projects:${user}`, async () => {
    const rows: any[] = []
    for (let from = 0; ; from += 250) {
      const result = await supabase.from("projects").select(CV_PROJECT_FIELDS).order("order_index").order("id").range(from, from + 249)
      if (result.error) throw result.error
      rows.push(...(result.data || []))
      if (!result.data || result.data.length < 250) break
    }
    return rows
  }, 300000)
}

export async function getGzverHighlights(id?: string) {
  if (!id) return []
  const user = await ensureScope()
  return cache.get<any[]>(`highlights:${user}:${id}`, async () => {
    const { data, error } = await supabase.from("gzver_project_highlights").select("project_id,contribution,image_urls,is_visible,sort_order").eq("gzver_id", id).order("sort_order")
    if (error) throw error
    return data || []
  }, 60000)
}
