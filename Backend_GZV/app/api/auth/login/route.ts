import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { apiResponse, apiError, parseRequestBody } from '@/lib/api-auth'
import { applyCors, getOriginFromRequest, isCorsPreflightRequest, handleCorsPrelight } from '@/lib/cors'

// Force dynamic rendering for auth endpoints
export const dynamic = 'force-dynamic'

interface LoginRequest {
  email: string
  password: string
}

export async function OPTIONS(request: NextRequest) {
  const origin = getOriginFromRequest(request)
  return applyCors(handleCorsPrelight(origin), origin)
}

export async function POST(request: NextRequest) {
  const origin = getOriginFromRequest(request)

  try {
    const body = await parseRequestBody<LoginRequest>(request)
    
    if (!body?.email || !body?.password) {
      const response = apiError(400, 'Email and password are required', 'MISSING_FIELDS')
      return applyCors(response, origin)
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (error) {
      const response = apiError(401, error.message, 'AUTH_FAILED')
      return applyCors(response, origin)
    }

    if (!data.session) {
      const response = apiError(401, 'No session created', 'AUTH_FAILED')
      return applyCors(response, origin)
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, avatar_url')
      .eq('id', data.user.id)
      .single()

    const response = apiResponse(
      {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.full_name,
          role: profile?.role,
          avatar: profile?.avatar_url,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
          expires_at: data.session.expires_at,
        },
      },
      200,
      'Login successful'
    )
    return applyCors(response, origin)
  } catch (error) {
    console.error('Login error:', error)
    const response = apiError(500, 'Internal server error', 'SERVER_ERROR')
    return applyCors(response, origin)
  }
}
