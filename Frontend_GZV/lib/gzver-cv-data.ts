"use client"

import { supabase } from "@/lib/api-supabase"
import { RequestCache } from "../../shared/data/request-cache"
import { CV_PROJECT_FIELDS, mergeCvProjects } from "../../shared/gzver/cv-model"

export type CvSnapshot = { profile_id: string; slug: string; updated_at: string; is_active: boolean; payload: { schema_version?: number; person: any; projects: any[] }; legacy?: boolean }
const cache = new RequestCache(12, () => typeof window !== "undefined" ? window.sessionStorage : undefined, "gzv-cv-v3:")
const PUBLIC_PROJECT_FIELDS = CV_PROJECT_FIELDS
let legacyUntil = 0

export async function getGzverCvSnapshot(slug: string): Promise<CvSnapshot | null> {
  return cache.get(slug, async () => {
    if (Date.now() >= legacyUntil) {
      const result = await supabase.from("gzver_cv_snapshots").select("profile_id,slug,is_active,updated_at,payload").eq("slug", slug).eq("is_active", true).maybeSingle()
      if (!result.error) return result.data as CvSnapshot | null
      if (!["PGRST205", "42P01"].includes(result.error.code)) throw result.error
      legacyUntil = Date.now() + 60000
    }
    // Safe compatibility path while the snapshot migration is being installed.
    const { data: person, error } = await supabase.from("gzvers").select("*").eq("slug", slug).eq("is_active", true).maybeSingle()
    if (error) throw error
    if (!person) return null
    const highlights = await supabase.from("gzver_project_highlights").select("project_id,contribution,image_urls,is_visible,sort_order").eq("gzver_id", person.id)
    if (highlights.error) throw highlights.error
    const all: any[] = []
    for (let from = 0; ; from += 250) {
      const response = await supabase.from("projects").select(PUBLIC_PROJECT_FIELDS).overlaps("author_ids", [person.id, person.linked_author_id].filter(Boolean)).order("order_index").order("id").range(from, from + 249)
      if (response.error) throw response.error
      all.push(...(response.data || []))
      if (!response.data || response.data.length < 250) break
    }
    const missingIds = (highlights.data || []).filter((row) => row.is_visible !== false && !all.some((project) => project.id === row.project_id)).map((row) => row.project_id)
    for (let offset = 0; offset < missingIds.length; offset += 100) {
      const extra = await supabase.from("projects").select(PUBLIC_PROJECT_FIELDS).in("id", missingIds.slice(offset, offset + 100))
      if (extra.error) throw extra.error
      all.push(...(extra.data || []))
    }
    return { profile_id: person.id, slug, is_active: true, updated_at: person.updated_at || "", payload: { person, projects: mergeCvProjects(person, all, highlights.data || []) }, legacy: true }
  }, 60000)
}

type Listener = (snapshot: CvSnapshot | null, error?: string) => void
type Watch = { listeners: Set<Listener>; channel?: ReturnType<typeof supabase.channel>; source?: "legacy" | "snapshot" | "wait"; timer?: ReturnType<typeof setTimeout>; cleanup?: ReturnType<typeof setTimeout>; snapshot?: CvSnapshot | null; sequence: number }
const watches = new Map<string, Watch>()

/** One channel per viewed profile. A snapshot UPDATE carries the new CV: no refetch storm. */
export function watchGzverCv(slug: string, listener: Listener) {
  let watch = watches.get(slug)
  if (!watch) { watch = { listeners: new Set(), sequence: 0 }; watches.set(slug, watch) }
  const current = watch
  clearTimeout(current.cleanup)
  current.listeners.add(listener)
  if (current.snapshot !== undefined) listener(current.snapshot)
  const notify = (value: CvSnapshot | null, error?: string) => { current.snapshot = value; current.listeners.forEach((callback) => callback(value, error)) }
  const refresh = async (invalidate = false) => {
    const sequence = ++current.sequence
    if (invalidate) cache.invalidate(slug)
    try {
      const snapshot = await getGzverCvSnapshot(slug)
      if (sequence !== current.sequence || !current.listeners.size) return
      notify(snapshot)
      if (snapshot && current.channel && current.source !== (snapshot.legacy ? "legacy" : "snapshot")) {
        void supabase.removeChannel(current.channel); current.channel = undefined
      }
      if (snapshot?.legacy && !current.channel) {
        current.source = "legacy"
        const schedule = () => { clearTimeout(current.timer); current.timer = setTimeout(() => { void refresh(true) }, 250) }
        current.channel = supabase.channel(`gzver-cv-legacy:${snapshot.profile_id}`)
          .on("postgres_changes", { event: "*", schema: "public", table: "gzvers", filter: `id=eq.${snapshot.profile_id}` }, schedule)
          .on("postgres_changes", { event: "*", schema: "public", table: "gzver_project_highlights", filter: `gzver_id=eq.${snapshot.profile_id}` }, schedule)
          .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, (event) => {
            const row = event.new as any
            const previous = event.old as any
            const person = current.snapshot?.payload.person
            const ids = [person?.id, person?.linked_author_id].filter(Boolean)
            if (current.snapshot?.payload.projects.some((project) => project.id === row.id || project.id === previous.id) || row.author_ids?.some((id: string) => ids.includes(id))) schedule()
          }).subscribe()
      }
      if (!current.channel && snapshot) {
        current.source = "snapshot"
        current.channel = supabase.channel(`gzver-cv:${snapshot.profile_id}`)
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "gzver_cv_snapshots", filter: `profile_id=eq.${snapshot.profile_id}` }, (event) => {
            const row = event.new as CvSnapshot
            ++current.sequence
            cache.invalidate(slug)
            const value = row.is_active && row.slug === slug ? row : null
            cache.put(slug, value)
            notify(value)
          }).subscribe((status) => {
            if (status === "SUBSCRIBED") {
              // Small version-only check closes the gap between initial read and subscription,
              // and catches missed updates after a connection resumes.
              void supabase.from("gzver_cv_snapshots").select("updated_at,is_active,slug").eq("profile_id", snapshot.profile_id).maybeSingle().then(({ data, error }) => {
                if (error || !current.listeners.size) return
                if (!data?.is_active || data.slug !== slug) { cache.invalidate(slug); notify(null) }
                else if (data.updated_at !== current.snapshot?.updated_at) void refresh(true)
              })
            }
          })
      }
      if (!snapshot && !current.channel) {
        current.source = "wait"
        current.channel = supabase.channel(`gzver-cv-wait:${slug}`)
          .on("postgres_changes", { event: "*", schema: "public", table: Date.now() >= legacyUntil ? "gzver_cv_snapshots" : "gzvers", filter: `slug=eq.${slug}` }, () => { void refresh(true) }).subscribe()
      }
      if (snapshot?.legacy) {
        // Only migration compatibility mode polls; the installed snapshot path uses events.
        clearTimeout(current.timer)
        current.timer = setTimeout(() => { void refresh(true) }, 60000)
      }
    } catch (error: any) { if (sequence === current.sequence) current.listeners.forEach((callback) => callback(current.snapshot ?? null, error.message || "Không tải được hồ sơ.")) }
  }
  if (current.listeners.size === 1) void refresh()
  return () => {
    current.listeners.delete(listener)
    if (!current.listeners.size) current.cleanup = setTimeout(() => {
      ++current.sequence; clearTimeout(current.timer)
      if (current.channel) void supabase.removeChannel(current.channel)
      watches.delete(slug)
    }, 1000)
  }
}
