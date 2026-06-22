import { NextRequest } from 'next/server'
import { verifyAuth, apiResponse, apiError } from '@/lib/api-auth'
import { applyCors, getOriginFromRequest, isCorsPreflightRequest, handleCorsPrelight } from '@/lib/cors'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: NextRequest) {
  const origin = getOriginFromRequest(request)
  return applyCors(handleCorsPrelight(origin), origin)
}

export async function GET(request: NextRequest) {
  const origin = getOriginFromRequest(request)

  try {
    const user = await verifyAuth(request)

    if (!user) {
      const response = apiError(401, 'Invalid or expired token', 'INVALID_TOKEN')
      return applyCors(response, origin)
    }

    const response = apiResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        valid: true,
      },
      200,
      'Token is valid'
    )
    return applyCors(response, origin)
  } catch (error) {
    console.error('Token verification error:', error)
    const response = apiError(500, 'Internal server error', 'SERVER_ERROR')
    return applyCors(response, origin)
  }
}
