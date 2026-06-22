import { getSupabaseServer } from "@/lib/supabase-server"
import PartnersClient, { type Partner } from "./PartnersClient"

// Revalidate mỗi 60s — dữ liệu luôn tươi nhưng không gây delay khi user mở trang.
export const revalidate = 60

const FALLBACK_CORPORATE: Partner[] = [
  { id: 'f-1', name: 'ASL', logo_url: '/carousel/ASL.webp', category: 'corporate', sort_order: 10, website_url: null },
]

export default async function PartnersPage() {
  const supabase = getSupabaseServer()
  const { data } = await supabase
    .from('partners')
    .select('id, name, logo_url, category, sort_order, website_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  const partners = (data as Partner[] | null) ?? FALLBACK_CORPORATE
  const corporate = partners.filter(p => p.category === 'corporate')
  const education = partners.filter(p => p.category === 'education')

  return <PartnersClient corporate={corporate} education={education} />
}
