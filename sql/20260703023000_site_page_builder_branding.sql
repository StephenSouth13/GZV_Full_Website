create extension if not exists pgcrypto;

create table if not exists public.site_branding_settings (
  id integer primary key default 1,
  site_name text not null default 'GZV',
  header_logo_url text not null default '/logo.webp',
  footer_logo_url text not null default '/logo.webp',
  favicon_url text not null default '/logo/favicon.ico',
  default_title text not null default 'GZV - The Voice of Genzers',
  title_template text not null default '%s | GZV',
  default_description text,
  default_keywords text,
  og_image_url text,
  updated_at timestamptz not null default now(),
  constraint site_branding_settings_singleton check (id = 1)
);

create table if not exists public.site_section_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  name text not null,
  category text not null default 'content',
  component_type text not null,
  preview_image_url text,
  default_props jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  block_key text not null,
  component_type text not null,
  title text,
  props jsonb not null default '{}'::jsonb,
  content_html text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  responsive jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page_slug, block_key)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_branding_settings_updated_at on public.site_branding_settings;
create trigger set_site_branding_settings_updated_at
before update on public.site_branding_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_site_section_templates_updated_at on public.site_section_templates;
create trigger set_site_section_templates_updated_at
before update on public.site_section_templates
for each row execute function public.set_updated_at();

drop trigger if exists set_site_page_blocks_updated_at on public.site_page_blocks;
create trigger set_site_page_blocks_updated_at
before update on public.site_page_blocks
for each row execute function public.set_updated_at();

insert into public.site_branding_settings (id)
values (1)
on conflict (id) do nothing;

insert into public.site_section_templates
  (template_key, name, category, component_type, default_props, sort_order)
values
  ('hero_stats_gradient', 'Hero gradient + stats', 'hero', 'hero_stats', '{"title":"Tiêu đề trang","subtitle":"Mô tả ngắn","stats":[{"value":"50+","label":"Chỉ số"}],"backgroundFrom":"#1e3a8a","backgroundTo":"#0f766e"}'::jsonb, 10),
  ('msc_words', 'Mentoring Skills Coaching words', 'text', 'msc_words', '{"lines":["Mentoring For Success","Skills For Success","Coaching For Success"],"accentLetters":["M","S","C"],"accentColor":"#f97316"}'::jsonb, 20),
  ('feature_grid', 'Feature card grid', 'cards', 'feature_grid', '{"title":"Tiêu đề section","subtitle":"Mô tả section","items":[{"title":"Card 1","description":"Mô tả","icon":"award"}]}'::jsonb, 30),
  ('programs_grid', 'Programs grid từ database', 'data', 'programs_grid', '{"title":"Chương trình đào tạo","subtitle":"Các khóa học được thiết kế chuyên nghiệp","limit":12}'::jsonb, 40),
  ('image_gallery', 'Image gallery', 'media', 'image_gallery', '{"title":"Thư viện ảnh","subtitle":"Mô tả thư viện","images":[{"src":"/placeholder.jpg","alt":"Ảnh","title":"Ảnh"}]}'::jsonb, 50),
  ('cta_band', 'CTA full-width band', 'cta', 'cta_band', '{"title":"Sẵn sàng bắt đầu?","description":"Để lại thông tin để được tư vấn.","buttonLabel":"Liên hệ","buttonUrl":"/lien-he","backgroundFrom":"#2563eb","backgroundTo":"#0f766e"}'::jsonb, 60),
  ('html_rich', 'Nội dung rich text', 'content', 'html_rich', '{"maxWidth":"960px"}'::jsonb, 70),
  ('projects_grid', 'Projects grid từ database', 'data', 'projects_grid', '{"title":"Dự án tiêu biểu","limit":6}'::jsonb, 80),
  ('mentors_grid', 'Mentors grid từ database', 'data', 'mentors_grid', '{"title":"Mentors","limit":6}'::jsonb, 90),
  ('partners_grid', 'Partners grid từ database', 'data', 'partners_grid', '{"title":"Đối tác","limit":24}'::jsonb, 100)
on conflict (template_key) do update
set name = excluded.name,
    category = excluded.category,
    component_type = excluded.component_type,
    default_props = excluded.default_props,
    sort_order = excluded.sort_order;

insert into public.site_page_blocks
  (page_slug, block_key, component_type, title, props, sort_order, is_visible)
values
  ('dao-tao', 'hero', 'hero_stats', 'Hero đào tạo', '{"title":"Chương trình Đào tạo","subtitle":"Khám phá các chương trình đào tạo chuyên nghiệp được thiết kế để phát triển kỹ năng và nâng cao năng lực cạnh tranh trong thời đại số.","stats":[{"value":"50+","label":"Chương trình"},{"value":"5000+","label":"Học viên"},{"value":"95%","label":"Hài lòng"},{"value":"85%","label":"Thăng tiến"}],"backgroundFrom":"#1e3a8a","backgroundTo":"#164e63"}'::jsonb, 10, true),
  ('dao-tao', 'msc', 'msc_words', 'MSC words', '{"lines":["Mentoring For Success","Skills For Success","Coaching For Success"],"accentLetters":["M","S","C"],"accentColor":"#f97316"}'::jsonb, 20, true),
  ('dao-tao', 'core-values', 'feature_grid', 'Core values', '{"title":"","subtitle":"","columns":3,"items":[{"title":"Mentoring & Coaching kỹ năng Marketing và Sales","description":"Định hình tư duy thị trường, nâng cao kỹ năng truyền thông - bán hàng thông qua các chương trình mentoring & coaching thực chiến.","icon":"target","color":"#0077B6"},{"title":"Đào tạo kỹ năng Nghiên cứu, Thẩm định & Đánh giá dự án","description":"Trang bị phương pháp tiếp cận và phân tích dự án theo mô hình Holding: Sản phẩm - Con người - Tài chính.","icon":"book","color":"#2A9D8F"},{"title":"Đào tạo Quản lý dự án (Trước-Trong-Sau)","description":"Phát triển năng lực lãnh đạo dự án qua toàn bộ vòng đời, kết hợp thực hành và công cụ quản trị hiện đại.","icon":"award","color":"#F4A261"}]}'::jsonb, 30, true),
  ('dao-tao', 'benefits', 'feature_grid', 'Benefits', '{"title":"Tại sao chọn GZV Center?","subtitle":"Những lợi ích vượt trội khi học tập tại GZV Center","columns":4,"items":[{"title":"Chứng chỉ uy tín","description":"Nhận chứng chỉ được công nhận trong nước và quốc tế.","icon":"award"},{"title":"Học từ chuyên gia","description":"Đội ngũ giảng viên giàu kinh nghiệm thực tiễn.","icon":"users"},{"title":"Thực hành thực tế","description":"70% thời gian dành cho thực hành và case study.","icon":"target"},{"title":"Tài liệu độc quyền","description":"Bộ tài liệu học tập được biên soạn riêng.","icon":"book"}]}'::jsonb, 40, true),
  ('dao-tao', 'programs', 'programs_grid', 'Programs', '{"title":"Chương trình đào tạo","subtitle":"Các khóa học được thiết kế chuyên nghiệp, phù hợp thực tế","limit":12}'::jsonb, 50, true),
  ('dao-tao', 'gallery', 'image_gallery', 'Gallery', '{"title":"Thư viện ảnh","subtitle":"Hình ảnh đào tạo tại các dự án","images":[{"src":"/dao-tao/1.webp","alt":"Đào tạo 1"},{"src":"/dao-tao/2.webp","alt":"Đào tạo 2"},{"src":"/dao-tao/3.webp","alt":"Đào tạo 3"},{"src":"/dao-tao/4.webp","alt":"Đào tạo 4"},{"src":"/dao-tao/5.webp","alt":"Đào tạo 5"},{"src":"/dao-tao/6.webp","alt":"Đào tạo 6"}]}'::jsonb, 60, true),
  ('dao-tao', 'cta', 'cta_band', 'CTA', '{"title":"Sẵn sàng bắt đầu hành trình?","description":"Để lại thông tin để được đội ngũ GZV tư vấn lộ trình phát triển phù hợp nhất.","buttonLabel":"Đăng ký tư vấn miễn phí","buttonUrl":"/lien-he","backgroundFrom":"#2563eb","backgroundTo":"#0f766e"}'::jsonb, 70, true)
on conflict (page_slug, block_key) do nothing;

alter table public.site_branding_settings enable row level security;
alter table public.site_section_templates enable row level security;
alter table public.site_page_blocks enable row level security;

drop policy if exists "Public read site branding settings" on public.site_branding_settings;
create policy "Public read site branding settings"
on public.site_branding_settings for select
using (true);

drop policy if exists "Authenticated manage site branding settings" on public.site_branding_settings;
create policy "Authenticated manage site branding settings"
on public.site_branding_settings for all
to authenticated
using (true)
with check (true);

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

drop policy if exists "Public read visible page blocks" on public.site_page_blocks;
create policy "Public read visible page blocks"
on public.site_page_blocks for select
using (is_visible = true);

drop policy if exists "Authenticated manage page blocks" on public.site_page_blocks;
create policy "Authenticated manage page blocks"
on public.site_page_blocks for all
to authenticated
using (true)
with check (true);

grant select on public.site_branding_settings to anon, authenticated;
grant select on public.site_section_templates to anon, authenticated;
grant select on public.site_page_blocks to anon, authenticated;
grant insert, update, delete on public.site_branding_settings to authenticated;
grant insert, update, delete on public.site_section_templates to authenticated;
grant insert, update, delete on public.site_page_blocks to authenticated;
