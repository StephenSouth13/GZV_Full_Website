"use client"

import { useEffect, useState } from "react"
import { watchGzverCv } from "@/lib/gzver-cv-data"
import { safeCvImage } from "../../shared/gzver/cv-model"

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
        const raw = snapshot?.payload.person
        const person = raw ? { ...raw, avatar_url: safeCvImage(raw.avatar_url) || "/placeholder-user.jpg", cover_image_url: safeCvImage(raw.cover_image_url) || null } : null
        const projects = (snapshot?.payload.projects || []).map((project) => ({ ...project, image: safeCvImage(project.image || project.thumbnail_url), thumbnail_url: safeCvImage(project.thumbnail_url || project.image) }))
        if (active) setState({ slug, person, projects, loading: false, error: error || (person ? "" : "Không tìm thấy hồ sơ hoặc hồ sơ đã được ẩn."), updatedAt: snapshot?.updated_at || "" })
      })
    }
    connect()
    document.addEventListener("visibilitychange", connect)
    return () => { active = false; stop?.(); document.removeEventListener("visibilitychange", connect) }
  }, [slug])
  return state.slug === slug ? state : { ...state, person: null, projects: [], loading: true, error: "" }
}
