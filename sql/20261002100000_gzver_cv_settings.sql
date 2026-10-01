alter table public.gzvers
  add column if not exists cv_settings jsonb not null default '{"template":"executive","accent":"#ed1c24","show_contact":true,"show_projects":true}'::jsonb;

comment on column public.gzvers.cv_settings is 'Per-profile generated CV template and display preferences';

create table if not exists public.gzver_project_highlights (
  id uuid primary key default gen_random_uuid(),
  gzver_id uuid not null references public.gzvers(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  contribution text not null default '',
  image_urls jsonb not null default '[]'::jsonb,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(gzver_id, project_id)
);

alter table public.gzver_project_highlights enable row level security;
grant select on public.gzver_project_highlights to anon, authenticated;
grant insert, update, delete on public.gzver_project_highlights to authenticated;

drop policy if exists "public read GZVer project highlight settings" on public.gzver_project_highlights;
create policy "public read GZVer project highlight settings" on public.gzver_project_highlights
  for select to anon, authenticated using (true);
-- Tài khoản đăng nhập Admin được quản lý (giống các bảng CMS khác).
-- Không dùng profiles.role = 'admin' vì tài khoản admin hiện không có dòng role này.
drop policy if exists "admins manage GZVer project highlights" on public.gzver_project_highlights;
create policy "admins manage GZVer project highlights" on public.gzver_project_highlights
  for all to authenticated using (true) with check (true);
