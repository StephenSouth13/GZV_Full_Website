import { contactInput, readContactBody, acceptContactAttempt } from '@/lib/contact-input'
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

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const response = (body: object, status: number) => NextResponse.json(body, { status, headers: { 'X-Request-ID': requestId } })
  try {
    // Configure the reverse proxy to overwrite this header, never forward client values.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    if (!acceptContactAttempt(ip)) return response({ error: 'Too many requests', code: 'RATE_LIMITED' }, 429)
    const parsed = contactInput.safeParse(await readContactBody(request))
    if (!parsed.success) return response({ error: 'Invalid contact information', code: 'INVALID_INPUT' }, 400)
    if (!client) return response({ error: 'Contact service unavailable', code: 'UNAVAILABLE' }, 503)
    const { error } = await client.from('contact_messages').insert({
      ...parsed.data,
      data: parsed.data.data || {},
      source: parsed.data.source || 'lien-he',
      user_agent: (request.headers.get('user-agent') || '').slice(0, 500),
    })
    if (error) {
      console.error('Contact write failed', { requestId, code: error.code })
      return response({ error: 'Unable to send message', code: 'WRITE_FAILED' }, 500)
    }
    return response({ ok: true }, 200)
  } catch (error) {
    if (error instanceof RangeError) return response({ error: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' }, 413)
    if (error instanceof SyntaxError) return response({ error: 'Invalid JSON', code: 'INVALID_JSON' }, 400)
    console.error('Contact request failed', { requestId })
    return response({ error: 'Unable to send message', code: 'INTERNAL_ERROR' }, 500)
  }
}
