'use client'

import { supabase } from '@/lib/api-supabase'

export type SiteNavItem = {
  id?: string
  href: string
  label_vi: string
  label_en?: string | null
  sort_order: number
  is_visible: boolean
  is_page_enabled: boolean
}

export type SitePageContent = {
  id?: string
  slug: string
  title: string
  menu_title?: string | null
  banner_badge?: string | null
  banner_title?: string | null
  banner_subtitle?: string | null
  banner_description?: string | null
  banner_image_url?: string | null
  content_html?: string | null
  is_visible: boolean
  seo_title?: string | null
  seo_description?: string | null
}

export type SiteLoadingSettings = {
  logo_url: string
  title: string
  subtitle: string
  effect: 'orbit' | 'pulse' | 'bars'
  background_from: string
  background_to: string
  accent_color: string
  enabled: boolean
  minimum_duration_ms: number
}

export type HomeSectionConfig = {
  section_key: string
  title: string
  subtitle?: string | null
  description?: string | null
  button_label?: string | null
  button_url?: string | null
  sort_order: number
  item_limit: number
  is_visible: boolean
  content_html?: string | null
  settings?: Record<string, any>
}

export type FooterSettings = {
  logo_url: string
  intro_text: string
  background_color: string
  bottom_background_color: string
  facebook_page_url?: string | null
  address?: string | null
  phone_label?: string | null
  phone_url?: string | null
  email_label?: string | null
  email_url?: string | null
  newsletter_title?: string | null
  newsletter_description?: string | null
  copyright_text?: string | null
  links: Array<{ label: string; href: string; visible?: boolean }>
  social_links: Array<{ label: string; href: string; icon?: string; visible?: boolean }>
}

export type FloatingAction = {
  action_key: string
  label: string
  href?: string | null
  icon_url?: string | null
  action_type: 'link' | 'chatbot'
  sort_order: number
  is_visible: boolean
  style?: Record<string, any>
}

export type BrandingSettings = {
  site_name: string
  header_logo_url: string
  footer_logo_url: string
  favicon_url: string
  default_title: string
  title_template: string
  default_description?: string | null
  default_keywords?: string | null
  og_image_url?: string | null
  topbar_email_label?: string | null
  topbar_phone_label?: string | null
  topbar_badge_label?: string | null
}

export type PageBlock = {
  id?: string
  page_slug: string
  block_key: string
  component_type: string
  title?: string | null
  props: Record<string, any>
  content_html?: string | null
  sort_order: number
  is_visible: boolean
  responsive?: Record<string, any>
  seo?: Record<string, any>
}

export type SectionTemplate = {
  id?: string
  template_key: string
  name: string
  category: string
  component_type: string
  preview_image_url?: string | null
  default_props: Record<string, any>
  sort_order: number
  is_active: boolean
}

export const defaultNavigation: SiteNavItem[] = [
  { href: '/gioi-thieu', label_vi: 'GIỚI THIỆU', label_en: 'ABOUT', sort_order: 10, is_visible: true, is_page_enabled: true },
  { href: '/#dich-vu', label_vi: 'DỊCH VỤ', label_en: 'SERVICES', sort_order: 20, is_visible: true, is_page_enabled: true },
  { href: '/du-an', label_vi: 'DỰ ÁN', label_en: 'PROJECTS', sort_order: 30, is_visible: true, is_page_enabled: true },
  { href: '/gzver', label_vi: 'GZVers', label_en: 'GZVers', sort_order: 40, is_visible: true, is_page_enabled: true },
  { href: '/tin-tuc', label_vi: 'TIN TỨC', label_en: 'NEWS', sort_order: 50, is_visible: true, is_page_enabled: true },
  { href: '/lien-he', label_vi: 'LIÊN HỆ', label_en: 'CONTACT', sort_order: 60, is_visible: true, is_page_enabled: true },
]

export const defaultLoadingSettings: SiteLoadingSettings = {
  logo_url: '/logo.webp',
  title: 'GZV',
  subtitle: 'Đang tải dữ liệu...',
  effect: 'orbit',
  background_from: '#050505',
  background_to: '#161616',
  accent_color: '#ed1c24',
  enabled: true,
  minimum_duration_ms: 900,
}

export const defaultFooterSettings: FooterSettings = {
  logo_url: '/logo.webp',
  intro_text: 'GZV - The Voice of Genzers',
  background_color: '#050505',
  bottom_background_color: '#111111',
  facebook_page_url: 'https://www.facebook.com/gzv.one',
  address: '279 Nguyễn Tri Phương, Phường Diên Hồng, TP.Hồ Chí Minh',
  phone_label: 'Điện Thoại: (+84) 329 381 489',
  phone_url: 'tel:+84329381489',
  email_label: 'Email: gzv.one@gmail.com',
  email_url: 'mailto:gzv.one@gmail.com',
  newsletter_title: 'Kết nối với chúng tôi',
  newsletter_description: 'Đăng ký để nhận thông tin về các khóa học và sự kiện mới nhất.',
  copyright_text: 'gzv Center. Phát triển bởi Phòng Công nghệ thông tin.',
  links: [
    { label: 'GIỚI THIỆU', href: '/gioi-thieu', visible: true },
    { label: 'DỊCH VỤ', href: '/#dich-vu', visible: true },
    { label: 'DỰ ÁN', href: '/du-an', visible: true },
    { label: 'GZVers', href: '/gzver', visible: true },
    { label: 'TIN TỨC', href: '/tin-tuc', visible: true },
    { label: 'LIÊN HỆ', href: '/lien-he', visible: true },
  ],
  social_links: [
    { label: 'Facebook', href: 'https://www.facebook.com/gzv.one', icon: 'facebook', visible: true },
    { label: 'YouTube', href: 'https://www.youtube.com/@gzvLifeLongLearning', icon: 'youtube', visible: true },
    { label: 'Zalo', href: 'https://zalo.me/g/acumou501', icon: 'zalo', visible: true },
  ],
}

export const defaultBrandingSettings: BrandingSettings = {
  site_name: 'GZV',
  header_logo_url: '/logo.webp',
  footer_logo_url: '/logo.webp',
  favicon_url: '/logo/favicon.ico',
  default_title: 'GZV - The Voice of Genzers',
  title_template: '%s | GZV',
  default_description: 'GZV Center',
  default_keywords: 'GZV, đào tạo, mentoring, coaching',
  og_image_url: '/og-image.jpg',
  topbar_email_label: 'gzv.one@gmail.com',
  topbar_phone_label: '(+84) 329 381 489',
  topbar_badge_label: 'GZV',
}

export const getPageSlugFromPath = (pathname: string) => pathname.split('/').filter(Boolean)[0] || 'home'

export async function getSiteNavigation() {
  try {
    const { data, error } = await supabase
      .from('site_navigation')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data && data.length ? data : defaultNavigation) as SiteNavItem[]
  } catch (error) {
    console.warn('Using default navigation because site_navigation is unavailable.', error)
    return defaultNavigation
  }
}

export async function getSiteLoadingSettings() {
  try {
    const { data, error } = await supabase
      .from('site_loading_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error) throw error
    return { ...defaultLoadingSettings, ...(data || {}) } as SiteLoadingSettings
  } catch (error) {
    console.warn('Using default loading settings because site_loading_settings is unavailable.', error)
    return defaultLoadingSettings
  }
}

export async function getSitePageContent(slug: string) {
  try {
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw error
    return data as SitePageContent | null
  } catch (error) {
    console.warn(`No managed content loaded for ${slug}.`, error)
    return null
  }
}

export async function getHomeSectionConfig(sectionKey: string) {
  try {
    const { data, error } = await supabase
      .from('site_home_sections')
      .select('*')
      .eq('section_key', sectionKey)
      .maybeSingle()

    if (error) throw error
    return data as HomeSectionConfig | null
  } catch (error) {
    console.warn(`No managed home section loaded for ${sectionKey}.`, error)
    return null
  }
}

export async function getHomeSections() {
  try {
    const { data, error } = await supabase
      .from('site_home_sections')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data || []) as HomeSectionConfig[]
  } catch (error) {
    console.warn('No managed home sections loaded.', error)
    return []
  }
}

export async function getFooterSettings() {
  try {
    const { data, error } = await supabase
      .from('site_footer_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error) throw error
    return { ...defaultFooterSettings, ...(data || {}) } as FooterSettings
  } catch (error) {
    console.warn('Using default footer settings because site_footer_settings is unavailable.', error)
    return defaultFooterSettings
  }
}

export async function getFloatingActions() {
  try {
    const { data, error } = await supabase
      .from('site_floating_actions')
      .select('*')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data || []) as FloatingAction[]
  } catch (error) {
    console.warn('Floating actions are unavailable.', error)
    return []
  }
}

export async function getActivePartners(limit = 40) {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('id, name, logo_url, website_url, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.warn('Partners are unavailable.', error)
    return []
  }
}

export async function getBrandingSettings() {
  try {
    const { data, error } = await supabase
      .from('site_branding_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error) throw error
    return { ...defaultBrandingSettings, ...(data || {}) } as BrandingSettings
  } catch (error) {
    console.warn('Using default branding settings because site_branding_settings is unavailable.', error)
    return defaultBrandingSettings
  }
}

export async function getPageBlocks(slug: string) {
  try {
    const { data, error } = await supabase
      .from('site_page_blocks')
      .select('*')
      .eq('page_slug', slug)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data || []) as PageBlock[]
  } catch (error) {
    console.warn(`No page blocks loaded for ${slug}.`, error)
    return []
  }
}

export async function getSectionTemplates() {
  try {
    const { data, error } = await supabase
      .from('site_section_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return (data || []) as SectionTemplate[]
  } catch (error) {
    console.warn('No section templates loaded.', error)
    return []
  }
}
