import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!token) throw new Error("UNAUTHORIZED")
  const { data: auth, error } = await admin.auth.getUser(token)
  if (error || !auth.user) throw new Error("UNAUTHORIZED")
  const { data: profile } = await admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle()
  if (profile?.role !== "admin") throw new Error("FORBIDDEN")
  return auth.user
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "INTERNAL_ERROR"
  return NextResponse.json({ error: message }, { status: message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 500 })
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const [{ data: profiles, error: profileError }, { data: authUsers, error: authError }] = await Promise.all([
      admin.from("profiles").select("id,full_name,avatar_url,role,created_at,phone").order("created_at", { ascending: false }),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ])
    if (profileError) throw profileError
    if (authError) throw authError
    const byId = new Map((authUsers.users || []).map((user) => [user.id, user]))
    const users = (profiles || []).map((profile) => {
      const auth = byId.get(profile.id)
      return {
        ...profile,
        email: auth?.email || "",
        status: auth?.banned_until && new Date(auth.banned_until) > new Date() ? "suspended" : "active",
        updated_at: auth?.updated_at,
        last_sign_in_at: auth?.last_sign_in_at,
      }
    })
    return NextResponse.json({ users })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const email = String(body.email || "").trim().toLowerCase()
    const fullName = String(body.full_name || body.name || "").trim()
    const role = ["admin", "editor", "collab", "user"].includes(body.role) ? body.role : "user"
    if (!email || !fullName || !email.includes("@")) return NextResponse.json({ error: "Email và họ tên là bắt buộc" }, { status: 400 })

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, role },
    })
    if (inviteError) throw inviteError
    if (!invited.user) throw new Error("Không tạo được tài khoản")
    const { error: profileError } = await admin.from("profiles").upsert({
      id: invited.user.id,
      full_name: fullName,
      role,
      avatar_url: body.avatar_url || null,
      phone: body.phone || null,
    }, { onConflict: "id" })
    if (profileError) throw profileError
    return NextResponse.json({ user: { id: invited.user.id, email, full_name: fullName, role, status: "active", created_at: invited.user.created_at } })
  } catch (error) {
    return failure(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireAdmin(request)
    const body = await request.json()
    const id = String(body.id || "")
    if (!id) return NextResponse.json({ error: "Thiếu id tài khoản" }, { status: 400 })
    if (id === actor.id && body.role && body.role !== "admin") return NextResponse.json({ error: "Không thể tự hạ quyền tài khoản đang đăng nhập" }, { status: 400 })
    const profilePatch: Record<string, unknown> = {}
    for (const key of ["full_name", "role", "avatar_url", "phone"]) if (body[key] !== undefined) profilePatch[key] = body[key]
    if (Object.keys(profilePatch).length) {
      const { error } = await admin.from("profiles").update(profilePatch).eq("id", id)
      if (error) throw error
    }
    if (body.status) {
      const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: body.status === "suspended" ? "876000h" : "none" })
      if (error) throw error
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requireAdmin(request)
    const id = String((await request.json()).id || "")
    if (!id || id === actor.id) return NextResponse.json({ error: "Không thể xóa tài khoản đang đăng nhập" }, { status: 400 })
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error)
  }
}
