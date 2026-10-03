import { supabase } from './supabase'

/** Attach the current session without caching tokens or replacing multipart headers. */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  const headers = new Headers(input instanceof Request ? input.headers : undefined)
  new Headers(init.headers).forEach((value, key) => headers.set(key, value))
  headers.set('Authorization', `Bearer ${session.access_token}`)
  return fetch(input, { ...init, headers })
}
