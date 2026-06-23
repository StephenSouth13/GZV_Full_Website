//D:\gzv\Backend_gzv\lib\api-auth.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from './supabase'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
  }
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Verify and extract user from Authorization header
 * Supports: Bearer <JWT>
 */
export async function verifyAuth(request: NextRequest): Promise<{ id: string; email: string; role: string } | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.slice(7)
    
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token)
    
    if (error || !data.user) {
      return null
    }

    // Get user profile from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    return {
      id: data.user.id,
      email: data.user.email || '',
      role: profile?.role || 'user',
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user) {
    return new NextResponse(
      JSON.stringify({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
        message: 'Valid authentication token required',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
  return user
}

/**
 * Middleware to require specific role
 */
export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const user = await verifyAuth(request)
  
  if (!user) {
    return new NextResponse(
      JSON.stringify({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
        message: 'Valid authentication token required',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  if (!allowedRoles.includes(user.role)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Forbidden',
        code: 'FORBIDDEN',
        message: `This endpoint requires one of the following roles: ${allowedRoles.join(', ')}`,
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  return user
}

/**
 * API response helper
 */
export function apiResponse<T>(
  data: T,
  status: number = 200,
  message?: string
) {
  return new NextResponse(
    JSON.stringify({
      success: status < 400,
      data,
      message,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

/**
 * API error response helper
 */
export function apiError(
  statusCode: number,
  message: string,
  code?: string
) {
  return new NextResponse(
    JSON.stringify({
      success: false,
      error: message,
      code: code || 'ERROR',
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

/**
 * Validate request body
 */
export async function parseRequestBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return await request.json()
  } catch (error) {
    throw new ApiError(400, 'Invalid JSON in request body', 'INVALID_JSON')
  }
}

/**
 * Get pagination params from query string
 */
export function getPaginationParams(request: NextRequest): { page: number; limit: number } {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '10'))
  return { page, limit }
}

/**
 * Get sort params from query string
 */
export function getSortParams(request: NextRequest): { sortBy?: string; sortOrder?: 'asc' | 'desc' } {
  const { searchParams } = new URL(request.url)
  return {
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
  }
}
