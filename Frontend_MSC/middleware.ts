// middleware.ts - Supabase SSR middleware
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAIL_DOMAIN = '@msc.com';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Skipping Supabase middleware: ENV Vars not set')
    }
    return response
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({ name, value })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        request.cookies.delete(name)
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.delete({ name, ...options })
      },
    },
  })

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

    // If trying to access an admin route
    if (isAdminRoute) {
      // If user is not logged in, redirect to the general login page
      if (!user) {
        // Assuming your general login page is at '/login'
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // If user is logged in but is not an admin, redirect to homepage
      if (!user.email?.endsWith(ADMIN_EMAIL_DOMAIN)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

  } catch (err) {
    console.error('Supabase middleware error:', err)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
