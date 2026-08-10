begin;

create table if not exists public.gzver_departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  color text not null default '#ed1c24',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gzvers
  add column if not exists department_id uuid references public.gzver_departments(id) on delete set null,
  add column if not exists department_name text,
  add column if not exists role_level text;

create index if not exists idx_gzvers_department_id on public.gzvers(department_id);
create index if not exists idx_gzver_departments_sort_order on public.gzver_departments(sort_order);

drop trigger if exists set_gzver_departments_updated_at on public.gzver_departments;
create trigger set_gzver_departments_updated_at
before update on public.gzver_departments
for each row execute function public.set_updated_at();

insert into public.gzver_departments (name, slug, description, color, sort_order, is_active)
values
  ('BAN CỐ VẤN', 'ban-co-van', 'Định hướng chiến lược, cố vấn chuyên môn và kết nối nguồn lực cho hệ sinh thái GZV.', '#ed1c24', 10, true),
  ('BAN ĐIỀU HÀNH', 'ban-dieu-hanh', 'Điều phối vận hành, quản trị dự án và bảo đảm chất lượng triển khai.', '#050505', 20, true),
  ('BAN THỰC THI', 'ban-thuc-thi', 'Đội ngũ triển khai trực tiếp các hoạt động Marketing, Sales và Digital Transformation.', '#00539b', 30, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

update public.gzvers g
set
  department_id = d.id,
  department_name = d.name
from public.gzver_departments d
where g.department_id is null
  and (
    (coalesce(g.is_director, false) = true and d.slug = 'ban-dieu-hanh')
    or (coalesce(g.is_director, false) = false and d.slug = 'ban-thuc-thi')
  );

alter table public.gzver_departments enable row level security;

drop policy if exists "Public read gzver departments" on public.gzver_departments;
create policy "Public read gzver departments"
on public.gzver_departments for select
using (is_active = true);

drop policy if exists "Authenticated manage gzver departments" on public.gzver_departments;
create policy "Authenticated manage gzver departments"
on public.gzver_departments for all
to authenticated
using (true)
with check (true);

grant select on public.gzver_departments to anon, authenticated;
grant insert, update, delete on public.gzver_departments to authenticated;

commit;
