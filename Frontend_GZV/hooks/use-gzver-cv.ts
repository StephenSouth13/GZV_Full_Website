"use client"

import { useEffect, useState } from "react"
import { watchGzverCv } from "@/lib/gzver-cv-data"

export function useGzverCv(slug: string) {
  const [state, setState] = useState<{ slug: string; person: any; projects: any[]; loading: boolean; error: string; updatedAt: string }>({ slug, person: null, projects: [], loading: true, error: "", updatedAt: "" })
  useEffect(() => {
    let stop: (() => void) | undefined
    let active = true
    setState({ slug, person: null, projects: [], loading: true, error: "", updatedAt: "" })
    const connect = () => {
      stop?.(); stop = undefined
      if (document.visibilityState === "hidden") return
      stop = watchGzverCv(slug, (snapshot, error) => {
        if (active) setState({ slug, person: snapshot?.payload.person || null, projects: snapshot?.payload.projects || [], loading: false, error: error || (snapshot?.payload.person ? "" : "Không tìm thấy hồ sơ hoặc hồ sơ đã được ẩn."), updatedAt: snapshot?.updated_at || "" })
      })
    }
    connect()
    document.addEventListener("visibilitychange", connect)
    return () => { active = false; stop?.(); document.removeEventListener("visibilitychange", connect) }
  }, [slug])
  return state.slug === slug ? state : { ...state, person: null, projects: [], loading: true, error: "" }
}
