create table if not exists public.gzver_positions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gzver_positions_name_unique unique (name),
  constraint gzver_positions_name_not_blank check (length(trim(name)) > 0)
);

alter table public.gzver_positions enable row level security;
grant usage on schema public to anon, authenticated, service_role;
grant select on public.gzver_positions to anon, authenticated, service_role;
grant insert, update, delete on public.gzver_positions to authenticated;

drop policy if exists "Public read active GZVer positions" on public.gzver_positions;
create policy "Public read active GZVer positions" on public.gzver_positions for select using (is_active or auth.role() = 'authenticated');

drop policy if exists "Authenticated manage GZVer positions" on public.gzver_positions;
create policy "Authenticated manage GZVer positions" on public.gzver_positions for all to authenticated using (true) with check (true);

drop trigger if exists set_gzver_positions_updated_at on public.gzver_positions;
create trigger set_gzver_positions_updated_at before update on public.gzver_positions
for each row execute function public.set_updated_at();

insert into public.gzver_positions(name, sort_order)
select distinct trim(position), row_number() over(order by trim(position)) * 10
from public.gzvers where nullif(trim(position), '') is not null
on conflict (name) do nothing;

notify pgrst, 'reload schema';
