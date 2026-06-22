import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client (read-only, anon key).
// Dùng trong Server Components để fetch dữ liệu công khai sẵn ở build/SSR time,
// trang render đầy đủ ngay, không cần state loading ở client.
export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
