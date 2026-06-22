import { NextRequest, NextResponse } from 'next/server'
import { applyCors, getOriginFromRequest, handleCorsPrelight } from '@/lib/cors'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: NextRequest) {
  const origin = getOriginFromRequest(request)
  return applyCors(handleCorsPrelight(origin), origin)
}

export async function GET(request: NextRequest) {
  const origin = getOriginFromRequest(request)

  const response = new NextResponse(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )

  return applyCors(response, origin)
}
