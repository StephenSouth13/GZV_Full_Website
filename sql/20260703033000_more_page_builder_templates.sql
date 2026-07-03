create extension if not exists "pgcrypto";

create table if not exists public.site_section_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  name text not null,
  category text not null default 'General',
  component_type text not null,
  preview_image_url text,
  default_props jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_section_templates enable row level security;

drop policy if exists "Public read active section templates" on public.site_section_templates;
create policy "Public read active section templates"
on public.site_section_templates for select
using (is_active = true);

drop policy if exists "Authenticated manage section templates" on public.site_section_templates;
create policy "Authenticated manage section templates"
on public.site_section_templates for all
to authenticated
using (true)
with check (true);

grant select on public.site_section_templates to anon, authenticated;
grant insert, update, delete on public.site_section_templates to authenticated;

insert into public.site_section_templates
  (template_key, name, category, component_type, default_props, sort_order, is_active)
values
  (
    'page-banner',
    'Page banner',
    'Hero',
    'page_banner',
    '{
      "badge": "GZV",
      "title": "Tieu de trang",
      "subtitle": "Mo ta ngan cho trang",
      "stats": [
        { "value": "10+", "label": "Chi so" },
        { "value": "95%", "label": "Hai long" }
      ]
    }'::jsonb,
    5,
    true
  ),
  (
    'projects-grid',
    'Danh sach du an',
    'Data',
    'projects_grid',
    '{
      "title": "Du an tieu bieu",
      "subtitle": "Cac du an dang duoc cong bo tu database",
      "limit": 9,
      "background": "#f8fafc"
    }'::jsonb,
    70,
    true
  ),
  (
    'news-grid',
    'Danh sach tin tuc',
    'Data',
    'news_grid',
    '{
      "title": "Tin tuc moi nhat",
      "subtitle": "Bai viet duoc nap tu database",
      "limit": 9,
      "background": "#ffffff"
    }'::jsonb,
    80,
    true
  ),
  (
    'mentors-grid',
    'Danh sach mentors',
    'Data',
    'mentors_grid',
    '{
      "title": "Doi ngu mentors",
      "subtitle": "Mentors duoc quan ly trong database",
      "limit": 9,
      "background": "#f8fafc"
    }'::jsonb,
    90,
    true
  ),
  (
    'gzvers-grid',
    'Danh sach GZVers',
    'Data',
    'gzvers_grid',
    '{
      "title": "Doi ngu GZVers",
      "subtitle": "Thanh vien duoc nap tu database",
      "limit": 9,
      "background": "#ffffff"
    }'::jsonb,
    100,
    true
  ),
  (
    'partners-grid',
    'Danh sach doi tac',
    'Data',
    'partners_grid',
    '{
      "title": "Don vi dong hanh",
      "subtitle": "Logo doi tac duoc nap tu database",
      "limit": 12,
      "background": "#f8fafc"
    }'::jsonb,
    110,
    true
  ),
  (
    'contact-form',
    'Form lien he',
    'Conversion',
    'contact_form',
    '{
      "title": "Lien he GZV",
      "subtitle": "Gui thong tin de duoc tu van"
    }'::jsonb,
    120,
    true
  )
on conflict (template_key) do update set
  name = excluded.name,
  category = excluded.category,
  component_type = excluded.component_type,
  default_props = excluded.default_props,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
``