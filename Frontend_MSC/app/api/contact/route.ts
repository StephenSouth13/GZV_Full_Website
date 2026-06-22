import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const client = supabaseUrl && (serviceRoleKey || anonKey)
  ? createClient(supabaseUrl, serviceRoleKey || anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

const cleanText = (value: unknown, max = 2000) => {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text ? text.slice(0, max) : null
}

export async function POST(request: NextRequest) {
  try {
    if (!client) {
      return NextResponse.json({ error: 'Supabase chưa được cấu hình.' }, { status: 500 })
    }

    const body = await request.json()
    const payload = {
      name: cleanText(body.name, 255),
      email: cleanText(body.email, 255),
      phone: cleanText(body.phone, 80),
      subject: cleanText(body.subject, 255),
      message: cleanText(body.message, 5000),
      data: typeof body.data === 'object' && body.data !== null ? body.data : {},
      source: cleanText(body.source, 120) || 'lien-he',
      user_agent: request.headers.get('user-agent') || cleanText(body.user_agent, 500),
    }

    if (!payload.name || !payload.email || !payload.message) {
      return NextResponse.json({ error: 'Vui lòng nhập họ tên, email và nội dung.' }, { status: 400 })
    }

    const { error } = await client.from('contact_messages').insert(payload)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Không gửi được tin nhắn.' }, { status: 500 })
  }
}