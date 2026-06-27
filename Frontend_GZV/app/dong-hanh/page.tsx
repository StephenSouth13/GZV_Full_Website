import { getSupabaseServer } from "@/lib/supabase-server"
import PartnersClient, { type Partner } from "./PartnersClient"

// Revalidate mỗi 60s — dữ liệu luôn tươi nhưng không gây delay khi user mở trang.
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const FALLBACK_CORPORATE: Partner[] = [
  { id: 'f-1', name: 'ASL', logo_url: '/carousel/ASL.webp', category: 'corporate', sort_order: 10, website_url: null },
]

export default async function PartnersPage() {
  const supabase = getSupabaseServer()
  const toPartnerLogoUrl = (path?: string | null) => {
    if (!path) return '/placeholder-logo.png'
    const trimmed = String(path).trim()
    if (!trimmed) return '/placeholder-logo.png'
    if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed
    if (trimmed.startsWith('/')) return trimmed

    const storagePath = trimmed.replace(/^media\//, '').replace(/^\/+/, '')
    const { data } = supabase.storage.from('media').getPublicUrl(storagePath)
    return data.publicUrl
  }

  const { data } = await supabase
    .from('partners')
    .select('id, name, logo_url, category, sort_order, website_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  const partners = ((data as Partner[] | null) ?? FALLBACK_CORPORATE).map(partner => ({
    ...partner,
    logo_url: toPartnerLogoUrl(partner.logo_url),
  }))
  const corporate = partners.filter(p => p.category === 'corporate')
  const education = partners.filter(p => p.category === 'education')

  return <PartnersClient corporate={corporate} education={education} />
}
