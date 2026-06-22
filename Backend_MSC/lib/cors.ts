import { NextRequest, NextResponse } from 'next/server'

// Configure allowed origins for CORS
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  const defaultOrigins = [
    'https://msc.edu.vn',
    'https://www.msc.edu.vn',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ]
  
  // In development, allow all localhost origins
  if (process.env.NODE_ENV === 'development') {
    return [...defaultOrigins, ...envOrigins]
  }
  
  // In production, only allow explicitly configured origins
  return envOrigins.length > 0 ? envOrigins : defaultOrigins.filter(o => o.includes('msc.edu.vn') || o.includes('localhost'))
}

export const corsHeaders = (origin?: string): Record<string, string> => {
  const allowedOrigins = getAllowedOrigins()
  const isAllowed = !origin || allowedOrigins.includes(origin) || 
    allowedOrigins.some(ao => origin?.includes(ao.replace('https://', '').replace('http://', '')))
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Request-ID',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}

export function applyCors(response: NextResponse, origin?: string) {
  const headers = corsHeaders(origin)
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value)
    }
  })
  return response
}

export function handleCorsPrelight(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(origin),
  })
}

export function isCorsPreflightRequest(request: NextRequest): boolean {
  return request.method === 'OPTIONS'
}

export function getOriginFromRequest(request: NextRequest): string | undefined {
  return request.headers.get('origin') || undefined
}
