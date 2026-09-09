export type NavItem = {
  id?: string
  href: string
  label_vi: string
  label_en?: string | null
  parent_href?: string | null
  sort_order: number
  is_visible: boolean
  is_page_enabled: boolean
  is_external?: boolean | null
  children?: NavItem[]
}

export type PageContent = {
  id?: string
  slug: string
  title: string
  menu_title?: string | null
  banner_badge?: string | null
  banner_title?: string | null
  banner_subtitle?: string | null
  banner_description?: string | null
  banner_image_url?: string | null
  show_badge?: boolean | null
  show_title?: boolean | null
  show_subtitle?: boolean | null
  content_html?: string | null
  is_visible: boolean
  seo_title?: string | null
  seo_description?: string | null
}

export type HomeSection = {
  id?: string
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

export type LoadingSettings = {
  id: number
  logo_url: string
  title: string
  subtitle: string
  effect: "orbit" | "pulse" | "bars"
  background_from: string
  background_to: string
  accent_color: string
  enabled: boolean
  minimum_duration_ms: number
}

export type FooterSettings = {
  id: number
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
  contact_person?: string | null
  contact_person_phone?: string | null
  contact_person_email?: string | null
  social_facebook?: string | null
  social_youtube?: string | null
  social_instagram?: string | null
  social_tiktok?: string | null
  terms_url?: string | null
  privacy_url?: string | null
  show_terms?: boolean
  show_privacy?: boolean
  show_social?: boolean
  footer_text_color?: string | null
  footer_link_color?: string | null
  links: Array<{ label: string; href: string; visible?: boolean }>
  social_links: Array<{ label?: string; href?: string; icon?: string; visible?: boolean; _meta?: string }>
}

export type FloatingAction = {
  id?: string
  action_key: string
  label: string
  href?: string | null
  icon_url?: string | null
  action_type: "link" | "chatbot"
  sort_order: number
  is_visible: boolean
}

export type BrandingSettings = {
  id: number
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
  show_topbar?: boolean
  show_topbar_email?: boolean
  show_topbar_phone?: boolean
  show_topbar_badge?: boolean
  topbar_bg_color?: string | null
  topbar_text_color?: string | null
  header_bg_color?: string | null
  header_text_color?: string | null
  header_site_name?: string | null
  show_logo?: boolean
  author?: string | null
  canonical_url?: string | null
  og_title?: string | null
  og_description?: string | null
  og_url?: string | null
}

export type SectionTemplate = {
  id?: string
  template_key: string
  name: string
  category: string
  component_type: string
  default_props: any
  sort_order: number
  is_active: boolean
}

export type PageBlock = {
  id?: string
  page_slug: string
  block_key: string
  component_type: string
  title?: string | null
  props: any
  content_html?: string | null
  sort_order: number
  is_visible: boolean
  responsive?: any
  seo?: any
}
