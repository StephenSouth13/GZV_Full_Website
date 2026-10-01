-- Per-project label for the people / learning section.
alter table public.projects
  add column if not exists authors_section_title text not null default 'MENTORING & COACHING';

-- Additional SEO controls used by the CMS and public head metadata.
alter table public.site_branding_settings
  add column if not exists seo_keywords text,
  add column if not exists robots_index boolean not null default true,
  add column if not exists robots_follow boolean not null default true,
  add column if not exists twitter_card text not null default 'summary_large_image',
  add column if not exists twitter_title text,
  add column if not exists twitter_description text,
  add column if not exists twitter_image_url text,
  add column if not exists og_image_alt text,
  add column if not exists og_image_width integer not null default 1200,
  add column if not exists og_image_height integer not null default 630,
  add column if not exists seo_schema_json jsonb;
