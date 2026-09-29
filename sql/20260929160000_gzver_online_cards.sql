-- Digital credentials shown on public GZVer profiles.
alter table public.gzvers
  add column if not exists online_cards jsonb not null default '[]'::jsonb;

update public.gzvers
set online_cards = '[]'::jsonb
where online_cards is null
   or jsonb_typeof(online_cards) <> 'array';
