-- GZV cleanup and media upload support.
-- Safe to run more than once in Supabase SQL editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.media_files
  add column if not exists file_size_bytes bigint,
  add column if not exists mime_type text,
  add column if not exists folder_path text,
  add column if not exists storage_bucket text default 'media',
  add column if not exists is_public boolean default true,
  add column if not exists alt_text text,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists duration_seconds integer,
  add column if not exists updated_at timestamptz default now(),
  add column if not exists deleted_at timestamptz;

update public.media_files
set
  storage_bucket = coalesce(storage_bucket, 'media'),
  mime_type = coalesce(mime_type, file_type),
  file_type = coalesce(file_type, mime_type),
  folder_path = coalesce(folder_path, nullif(split_part(storage_path, '/', 1), ''))
where storage_path is not null;

create index if not exists idx_media_files_folder_path on public.media_files(folder_path);
create index if not exists idx_media_files_storage_bucket on public.media_files(storage_bucket);
create index if not exists idx_media_files_mime_type on public.media_files(mime_type);
create index if not exists idx_media_files_deleted_at on public.media_files(deleted_at);

drop policy if exists "GZV media public read" on storage.objects;
create policy "GZV media public read"
on storage.objects
for select
using (bucket_id = 'media');

drop policy if exists "GZV media authenticated insert" on storage.objects;
create policy "GZV media authenticated insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'media');

drop policy if exists "GZV media authenticated update" on storage.objects;
create policy "GZV media authenticated update"
on storage.objects
for update
to authenticated
using (bucket_id = 'media')
with check (bucket_id = 'media');

drop policy if exists "GZV media authenticated delete" on storage.objects;
create policy "GZV media authenticated delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'media');

drop policy if exists "GZV media anon insert" on storage.objects;
drop policy if exists "GZV media anon update" on storage.objects;
drop policy if exists "GZV media anon delete" on storage.objects;

update public.gzvers
set company = 'GZV'
where company = 'MSC';

alter table public.gzvers
  alter column company set default 'GZV';

update public.training_page_settings
set
  benefit_title = replace(benefit_title, 'MSC Center', 'GZV'),
  benefit_description = replace(benefit_description, 'MSC Center', 'GZV'),
  cta_description = replace(cta_description, 'MSC', 'GZV')
where
  benefit_title ilike '%MSC%'
  or benefit_description ilike '%MSC%'
  or cta_description ilike '%MSC%';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'mscers_pkey'
      and conrelid = 'public.gzvers'::regclass
  ) then
    alter table public.gzvers rename constraint mscers_pkey to gzvers_pkey;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'mscers_slug_key'
      and conrelid = 'public.gzvers'::regclass
  ) then
    alter table public.gzvers rename constraint mscers_slug_key to gzvers_slug_key;
  end if;

  if exists (
    select 1
    from pg_trigger
    where tgname = 'update_mscer_modtime'
      and tgrelid = 'public.gzvers'::regclass
  ) then
    alter trigger update_mscer_modtime on public.gzvers rename to update_gzver_modtime;
  end if;
end $$;
