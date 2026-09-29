-- Two-sided GZVer member card (card visit) shown on public profiles.
-- Empty front/back image URLs fall back to the auto-generated GZV template.
alter table public.gzvers
  add column if not exists member_card jsonb not null default '{}'::jsonb;

update public.gzvers
set member_card = '{}'::jsonb
where member_card is null
   or jsonb_typeof(member_card) <> 'object';
