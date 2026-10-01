"use client"

import { supabase } from "@/lib/api-supabase"
import { invalidatePublicTable, PUBLIC_CACHE_TABLES } from "./public-fetch-cache"

type Watcher = { tables: Set<string>; callback: () => void; timer?: ReturnType<typeof setTimeout> }
const watchers = new Set<Watcher>()
let channel: ReturnType<typeof supabase.channel> | undefined
let disconnect: ReturnType<typeof setTimeout> | undefined
let visibilityHandler: (() => void) | undefined

/** Header, footer, SEO and shell share one realtime connection and one cached request per query. */
export function watchPublicTables(tables: string[], callback: () => void) {
  const watcher: Watcher = { tables: new Set(tables), callback }
  watchers.add(watcher)
  clearTimeout(disconnect)
  const notify = (table: string) => {
    invalidatePublicTable(table)
    if (document.visibilityState === "hidden") return
    for (const item of watchers) if (item.tables.has(table)) {
      clearTimeout(item.timer)
      item.timer = setTimeout(item.callback, 150)
    }
  }
  if (!channel) {
    visibilityHandler = () => {
      if (document.visibilityState === "hidden") { for (const watcher of watchers) clearTimeout(watcher.timer) }
      else for (const table of PUBLIC_CACHE_TABLES) notify(table)
    }
    document.addEventListener("visibilitychange", visibilityHandler)
    channel = supabase.channel("public-cms-cache-v3")
    for (const table of PUBLIC_CACHE_TABLES) channel.on("postgres_changes", { event: "*", schema: "public", table }, () => notify(table))
    channel.subscribe((status) => { if (status === "SUBSCRIBED") for (const table of PUBLIC_CACHE_TABLES) notify(table) })
  }
  return () => {
    clearTimeout(watcher.timer)
    watchers.delete(watcher)
    if (!watchers.size) disconnect = setTimeout(() => {
      if (channel) void supabase.removeChannel(channel); channel = undefined
      if (visibilityHandler) document.removeEventListener("visibilitychange", visibilityHandler)
      visibilityHandler = undefined
    }, 1000)
  }
}
