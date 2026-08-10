create table if not exists public.site_auth_page_settings (
  page_key text primary key check (page_key in ('login', 'register', 'forgot-password')),
  eyebrow text not null default 'GZV ACCESS',
  title text not null,
  subtitle text not null default '',
  side_title text not null default '',
  side_description text not null default '',
  submit_label text not null default '',
  footer_text text not null default '',
  footer_link_label text not null default '',
  footer_link_href text not null default '',
  hrm_label text not null default '',
  hrm_url text not null default '',
  hero_points jsonb not null default '[]'::jsonb,
  show_social_login boolean not null default false,
  is_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.site_auth_page_settings enable row level security;

drop policy if exists "site_auth_page_settings_public_read" on public.site_auth_page_settings;
create policy "site_auth_page_settings_public_read"
on public.site_auth_page_settings
for select
using (is_enabled = true);

drop policy if exists "site_auth_page_settings_authenticated_manage" on public.site_auth_page_settings;
create policy "site_auth_page_settings_authenticated_manage"
on public.site_auth_page_settings
for all
to authenticated
using (true)
with check (true);

grant select on public.site_auth_page_settings to anon, authenticated;
grant insert, update, delete on public.site_auth_page_settings to authenticated;

create or replace function public.touch_site_auth_page_settings()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_auth_page_settings_touch on public.site_auth_page_settings;
create trigger site_auth_page_settings_touch
before update on public.site_auth_page_settings
for each row execute function public.touch_site_auth_page_settings();

insert into public.site_auth_page_settings (
  page_key, eyebrow, title, subtitle, side_title, side_description, submit_label,
  footer_text, footer_link_label, footer_link_href, hrm_label, hrm_url, hero_points,
  show_social_login, is_enabled
) values
  (
    'login',
    'GZV ACCESS',
    'Đăng nhập',
    'Tiếp tục hành trình cùng GZV.',
    'Đồng hành cùng thế hệ tiếp theo',
    'GZV kết nối học tập, dự án và cộng đồng để tạo năng lực thực chiến.',
    'Đăng nhập',
    'Chưa có tài khoản?',
    'Đăng ký ngay',
    '/register',
    'Đăng nhập hệ thống HRM',
    'https://gzver.gzv.one/',
    '["Nội dung học tập được cá nhân hóa", "Theo dõi tiến độ và hoạt động", "Kết nối với cộng đồng GZVers"]'::jsonb,
    false,
    true
  ),
  (
    'register',
    'GZV COMMUNITY',
    'Tạo tài khoản',
    'Gia nhập cộng đồng GZV.',
    'Bắt đầu hành trình phát triển',
    'Tạo hồ sơ để theo dõi học tập, kết nối mentor và tham gia hoạt động GZV.',
    'Tạo tài khoản',
    'Đã có tài khoản?',
    'Đăng nhập',
    '/login',
    'Hệ thống nội bộ HRM',
    'https://gzver.gzv.one/',
    '["Tạo hồ sơ cá nhân", "Theo dõi hoạt động GZV", "Sẵn sàng tham gia các dự án thực chiến"]'::jsonb,
    false,
    true
  ),
  (
    'forgot-password',
    'GZV SUPPORT',
    'Quên mật khẩu',
    'Nhập email để nhận hướng dẫn đặt lại mật khẩu.',
    'Khôi phục quyền truy cập',
    'GZV sẽ gửi email hướng dẫn nếu tài khoản tồn tại trong hệ thống.',
    'Gửi hướng dẫn',
    'Nhớ mật khẩu?',
    'Quay lại đăng nhập',
    '/login',
    '',
    '',
    '["Bảo mật tài khoản", "Gửi hướng dẫn qua email", "Quay lại học tập trong vài phút"]'::jsonb,
    false,
    true
  )
on conflict (page_key) do update set
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  subtitle = excluded.subtitle,
  side_title = excluded.side_title,
  side_description = excluded.side_description,
  submit_label = excluded.submit_label,
  footer_text = excluded.footer_text,
  footer_link_label = excluded.footer_link_label,
  footer_link_href = excluded.footer_link_href,
  hrm_label = excluded.hrm_label,
  hrm_url = excluded.hrm_url,
  hero_points = excluded.hero_points,
  show_social_login = excluded.show_social_login,
  is_enabled = excluded.is_enabled;
