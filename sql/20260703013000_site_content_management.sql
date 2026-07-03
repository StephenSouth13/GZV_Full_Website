create extension if not exists pgcrypto;

create table if not exists public.site_navigation (
  id uuid primary key default gen_random_uuid(),
  href text not null unique,
  label_vi text not null,
  label_en text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  is_page_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  menu_title text,
  banner_badge text,
  banner_title text,
  banner_subtitle text,
  banner_description text,
  banner_image_url text,
  content_html text,
  content_blocks jsonb not null default '[]'::jsonb,
  is_visible boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_loading_settings (
  id integer primary key default 1,
  logo_url text not null default '/logo.webp',
  title text not null default 'GZV',
  subtitle text not null default 'Dang tai du lieu...',
  effect text not null default 'orbit',
  background_from text not null default '#031b3f',
  background_to text not null default '#0f766e',
  accent_color text not null default '#38bdf8',
  enabled boolean not null default true,
  minimum_duration_ms integer not null default 900,
  updated_at timestamptz not null default now(),
  constraint site_loading_settings_singleton check (id = 1),
  constraint site_loading_settings_duration check (minimum_duration_ms between 0 and 6000)
);

create table if not exists public.site_home_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text not null,
  subtitle text,
  description text,
  button_label text,
  button_url text,
  sort_order integer not null default 0,
  item_limit integer not null default 6,
  is_visible boolean not null default true,
  content_html text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_footer_settings (
  id integer primary key default 1,
  logo_url text not null default '/logo.webp',
  intro_text text not null default 'GZV - The Voice of Genzers',
  background_color text not null default '#095095',
  bottom_background_color text not null default '#074070',
  facebook_page_url text default 'https://www.facebook.com/gzv.one',
  address text default '279 Nguyễn Tri Phương, Phường Diên Hồng, TP.Hồ Chí Minh',
  phone_label text default 'Điện Thoại: (+84) 329 381 489',
  phone_url text default 'tel:+84329381489',
  email_label text default 'Email: gzv.one@gmail.com',
  email_url text default 'mailto:gzv.one@gmail.com',
  newsletter_title text default 'Kết nối với chúng tôi',
  newsletter_description text default 'Đăng ký để nhận thông tin về các khóa học và sự kiện mới nhất.',
  copyright_text text default 'gzv Center. Phát triển bởi Phòng Công nghệ thông tin.',
  links jsonb not null default '[]'::jsonb,
  social_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_footer_settings_singleton check (id = 1)
);

create table if not exists public.site_floating_actions (
  id uuid primary key default gen_random_uuid(),
  action_key text not null unique,
  label text not null,
  href text,
  icon_url text,
  action_type text not null default 'link',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  style jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

drop trigger if exists set_site_navigation_updated_at on public.site_navigation;
create trigger set_site_navigation_updated_at
before update on public.site_navigation
for each row execute function public.set_updated_at();

drop trigger if exists set_site_pages_updated_at on public.site_pages;
create trigger set_site_pages_updated_at
before update on public.site_pages
for each row execute function public.set_updated_at();

drop trigger if exists set_site_loading_settings_updated_at on public.site_loading_settings;
create trigger set_site_loading_settings_updated_at
before update on public.site_loading_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_site_home_sections_updated_at on public.site_home_sections;
create trigger set_site_home_sections_updated_at
before update on public.site_home_sections
for each row execute function public.set_updated_at();

drop trigger if exists set_site_footer_settings_updated_at on public.site_footer_settings;
create trigger set_site_footer_settings_updated_at
before update on public.site_footer_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_site_floating_actions_updated_at on public.site_floating_actions;
create trigger set_site_floating_actions_updated_at
before update on public.site_floating_actions
for each row execute function public.set_updated_at();

insert into public.site_navigation (href, label_vi, label_en, sort_order, is_visible, is_page_enabled)
values
  ('/gioi-thieu', 'Giới thiệu', 'About', 10, true, true),
  ('/dao-tao', 'Đào tạo', 'Training', 20, true, true),
  ('/du-an', 'Dự án', 'Projects', 30, true, true),
  ('/mentors', 'Mentors', 'Mentors', 40, true, true),
  ('/gzver', 'GZVers', 'GZVers', 50, true, true),
  ('/dong-hanh', 'Đồng hành', 'Partners', 60, true, true),
  ('/tin-tuc', 'Tin tức', 'News', 70, true, true),
  ('/lien-he', 'Liên hệ', 'Contact', 80, true, true)
on conflict (href) do update
set label_vi = excluded.label_vi,
    label_en = excluded.label_en,
    sort_order = excluded.sort_order;

insert into public.site_pages (slug, title, menu_title, banner_badge, banner_title, banner_subtitle, is_visible)
values
  ('gioi-thieu', 'Giới thiệu', 'Giới thiệu', 'Về GZV', 'Giới thiệu', 'Tìm hiểu về GZV Center', true),
  ('dao-tao', 'Đào tạo', 'Đào tạo', 'Đào tạo', 'Chương trình Đào tạo', 'Các chương trình đào tạo chuyên nghiệp của GZV.', true),
  ('du-an', 'Dự án', 'Dự án', 'Những dự án tiêu biểu', 'Dự án đã triển khai', 'Các dự án Mentoring & Coaching thực tế mà GZV đã triển khai.', true),
  ('mentors', 'Mentors', 'Mentors', 'Ban giảng huấn', 'Mentors', 'Đội ngũ chuyên gia đồng hành cùng học viên.', true),
  ('gzver', 'GZVers', 'GZVers', 'Cộng đồng GZV', 'GZVers', 'Những gương mặt nổi bật của cộng đồng GZV.', true),
  ('dong-hanh', 'Đồng hành', 'Đồng hành', 'Đối tác', 'Đồng hành cùng GZV', 'Mạng lưới đối tác và đơn vị đồng hành.', true),
  ('tin-tuc', 'Tin tức', 'Tin tức', 'Tin tức', 'Tin tức & Góc nhìn', 'Cập nhật kiến thức, câu chuyện và sự kiện mới.', true),
  ('lien-he', 'Liên hệ', 'Liên hệ', 'Liên hệ', 'Kết nối với GZV', 'Để lại thông tin để được tư vấn.', true)
on conflict (slug) do update
set title = excluded.title,
    menu_title = excluded.menu_title,
    banner_badge = excluded.banner_badge,
    banner_title = excluded.banner_title,
    banner_subtitle = excluded.banner_subtitle;

insert into public.site_loading_settings (id)
values (1)
on conflict (id) do nothing;

insert into public.site_home_sections
  (section_key, title, subtitle, description, button_label, button_url, sort_order, item_limit, is_visible)
values
  ('projects', 'Dự án tiêu biểu', null, 'Khám phá các dự án đào tạo thực tế tiêu biểu nhất do GZV Center triển khai.', 'Xem tất cả dự án', '/du-an', 20, 6, true),
  ('mentors', 'Ban Giảng Huấn', 'Đội ngũ Ban giảng huấn Mentoring & Coaching của GZV Center', null, 'Xem tất cả mentors', '/mentors', 30, 6, true),
  ('directors', 'Ban Chủ Nhiệm', 'Đội ngũ lãnh đạo nòng cốt định hướng chiến lược tại GZV Center.', null, 'Xem hồ sơ', '/gzver', 40, 6, true),
  ('gzvers', 'Đội Ngũ GZVer', 'Hành trình trưởng thành từ GZV Center', null, null, null, 50, 6, true),
  ('news', 'Tin Tức Mới Nhất', 'Cập nhật những góc nhìn chuyên sâu và giải pháp đào tạo đột phá từ đội ngũ chuyên gia GZV.', null, 'Khám phá tất cả tin tức', '/tin-tuc', 60, 3, true),
  ('partners', 'Đơn Vị Đồng Hành', 'Những đối tác tin cậy đồng hành cùng GZV Center trong hành trình phát triển giáo dục', null, null, null, 70, 40, false)
on conflict (section_key) do update
set sort_order = excluded.sort_order;

insert into public.site_footer_settings
  (id, links, social_links)
values
  (
    1,
    '[
      {"label":"Chính sách bảo mật","href":"/chinh-sach-bao-mat","visible":true},
      {"label":"Điều khoản sử dụng","href":"/dieu-khoan-su-dung","visible":true},
      {"label":"Sơ đồ trang web","href":"/so-do-trang-web","visible":true}
    ]'::jsonb,
    '[
      {"label":"Facebook","href":"https://www.facebook.com/gzv.one","icon":"facebook","visible":true},
      {"label":"YouTube","href":"https://www.youtube.com/@gzvLifeLongLearning","icon":"youtube","visible":true},
      {"label":"Zalo","href":"https://zalo.me/g/acumou501","icon":"zalo","visible":true}
    ]'::jsonb
  )
on conflict (id) do nothing;

insert into public.site_floating_actions
  (action_key, label, href, icon_url, action_type, sort_order, is_visible)
values
  ('chatbot', 'Chat với GZV Assistant', null, null, 'chatbot', 10, true),
  ('facebook', 'Facebook', 'https://www.facebook.com/gzv.one', '/icons/facebook.png', 'link', 20, true),
  ('linkedin', 'LinkedIn', '', '/icons/linkedin.png', 'link', 30, false),
  ('youtube', 'YouTube', 'https://www.youtube.com/@gzvLifeLongLearning', '/icons/youtube.png', 'link', 40, true),
  ('zalo', 'Zalo', 'https://zalo.me/g/acumou501', '/icons/zalo.png', 'link', 50, true)
on conflict (action_key) do update
set label = excluded.label,
    sort_order = excluded.sort_order;

alter table public.site_navigation enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_loading_settings enable row level security;
alter table public.site_home_sections enable row level security;
alter table public.site_footer_settings enable row level security;
alter table public.site_floating_actions enable row level security;

drop policy if exists "Public read site navigation" on public.site_navigation;
create policy "Public read site navigation"
on public.site_navigation for select
using (true);

drop policy if exists "Authenticated manage site navigation" on public.site_navigation;
create policy "Authenticated manage site navigation"
on public.site_navigation for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public read visible site pages" on public.site_pages;
create policy "Public read visible site pages"
on public.site_pages for select
using (is_visible = true);

drop policy if exists "Authenticated manage site pages" on public.site_pages;
create policy "Authenticated manage site pages"
on public.site_pages for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public read site loading settings" on public.site_loading_settings;
create policy "Public read site loading settings"
on public.site_loading_settings for select
using (true);

drop policy if exists "Authenticated manage site loading settings" on public.site_loading_settings;
create policy "Authenticated manage site loading settings"
on public.site_loading_settings for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public read site home sections" on public.site_home_sections;
create policy "Public read site home sections"
on public.site_home_sections for select
using (is_visible = true);

drop policy if exists "Authenticated manage site home sections" on public.site_home_sections;
create policy "Authenticated manage site home sections"
on public.site_home_sections for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public read site footer settings" on public.site_footer_settings;
create policy "Public read site footer settings"
on public.site_footer_settings for select
using (true);

drop policy if exists "Authenticated manage site footer settings" on public.site_footer_settings;
create policy "Authenticated manage site footer settings"
on public.site_footer_settings for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public read site floating actions" on public.site_floating_actions;
create policy "Public read site floating actions"
on public.site_floating_actions for select
using (is_visible = true);

drop policy if exists "Authenticated manage site floating actions" on public.site_floating_actions;
create policy "Authenticated manage site floating actions"
on public.site_floating_actions for all
to authenticated
using (true)
with check (true);

grant select on public.site_navigation to anon, authenticated;
grant select on public.site_pages to anon, authenticated;
grant select on public.site_loading_settings to anon, authenticated;
grant select on public.site_home_sections to anon, authenticated;
grant select on public.site_footer_settings to anon, authenticated;
grant select on public.site_floating_actions to anon, authenticated;
grant insert, update, delete on public.site_navigation to authenticated;
grant insert, update, delete on public.site_pages to authenticated;
grant insert, update, delete on public.site_loading_settings to authenticated;
grant insert, update, delete on public.site_home_sections to authenticated;
grant insert, update, delete on public.site_footer_settings to authenticated;
grant insert, update, delete on public.site_floating_actions to authenticated;
