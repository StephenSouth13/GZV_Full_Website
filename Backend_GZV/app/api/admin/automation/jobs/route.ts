import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!token) throw new Error("UNAUTHORIZED")
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) throw new Error("UNAUTHORIZED")
  const { data: profile } = await admin.from("profiles").select("role").eq("id", data.user.id).maybeSingle()
  if (profile?.role !== "admin") throw new Error("FORBIDDEN")
}

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "INTERNAL_ERROR"
  return NextResponse.json({ error: message }, { status: message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500 })
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { data, error } = await admin.from("social_automation_jobs").select("*").order("scheduled_at", { ascending: true, nullsFirst: false }).limit(100)
    if (error) throw error
    return NextResponse.json({ jobs: data || [] })
  } catch (error) { return fail(error) }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const title = String(body.title || "").trim()
    if (!title) return NextResponse.json({ error: "Thiếu tiêu đề job" }, { status: 400 })
    const { data, error } = await admin.from("social_automation_jobs").insert({ title, source_type: body.source_type || "custom", source_id: body.source_id || null, payload: body.payload || {}, platforms: body.platforms || [], scheduled_at: body.scheduled_at || null, status: body.scheduled_at ? "scheduled" : "draft" }).select().single()
    if (error) throw error
    return NextResponse.json({ job: data })
  } catch (error) { return fail(error) }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    if (!body.id) return NextResponse.json({ error: "Thiếu id job" }, { status: 400 })
    const { data, error } = await admin.from("social_automation_jobs").update({ ...body, id: undefined, updated_at: new Date().toISOString() }).eq("id", body.id).select().single()
    if (error) throw error
    return NextResponse.json({ job: data })
  } catch (error) { return fail(error) }
}
