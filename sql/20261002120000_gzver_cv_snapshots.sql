begin;

-- Compile public CV data once per write, instead of joining projects on every visit.
create schema if not exists gzv_private;
revoke all on schema gzv_private from public, anon, authenticated;

create table if not exists public.gzver_cv_snapshots (
  profile_id uuid primary key,
  slug text not null,
  is_active boolean not null default false,
  payload jsonb not null,
  updated_at timestamptz not null default clock_timestamp()
);
create unique index if not exists gzver_cv_snapshots_active_slug on public.gzver_cv_snapshots(slug) where is_active;
create index if not exists gzver_cv_snapshots_slug on public.gzver_cv_snapshots(slug);
create index if not exists gzver_cv_projects_authors on public.projects using gin(author_ids);
create index if not exists gzver_cv_highlights_project on public.gzver_project_highlights(project_id, gzver_id);

alter table public.gzver_cv_snapshots enable row level security;
revoke all on public.gzver_cv_snapshots from anon, authenticated;
grant select on public.gzver_cv_snapshots to anon, authenticated;
drop policy if exists "Public CV snapshots" on public.gzver_cv_snapshots;
-- Inactive/deleted profiles contain only a tombstone, enabling realtime withdrawal.
create policy "Public CV snapshots" on public.gzver_cv_snapshots for select to anon, authenticated using (true);

create or replace function gzv_private.rebuild_cv(p_id uuid, p_slug text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare
  member public.gzvers%rowtype;
  doc jsonb;
  project_data jsonb;
  current_slug text;
  active boolean;
begin
  select * into member from public.gzvers where id = p_id;
  active := found and coalesce(member.is_active, false);
  current_slug := coalesce(member.slug, p_slug, (select slug from public.gzver_cv_snapshots where profile_id = p_id));
  if current_slug is null then return; end if;
  if active then
    select coalesce(jsonb_agg(
      jsonb_strip_nulls(jsonb_build_object(
        'id', p.id, 'title', p.title, 'slug', p.slug, 'description', p.description,
        'detailproject', p.detailproject, 'image', p.image, 'thumbnail_url', p.thumbnail_url,
        'gallery', p.gallery, 'category', p.category, 'status', p.status,
        'tech_stack', p.tech_stack, 'hashtags', p.hashtags, 'external_url', p.external_url,
        'demo_url', p.demo_url, 'video_url', p.video_url, 'order_index', p.order_index,
        'author_ids', p.author_ids, 'updated_at', p.updated_at,
        'image_position_x', p.image_position_x, 'image_position_y', p.image_position_y,
        'image_scale', p.image_scale, 'contribution', coalesce(h.contribution, ''),
        'profile_contribution', coalesce(h.contribution, ''), 'image_urls', coalesce(h.image_urls, '[]'::jsonb)
      )) order by coalesce(h.sort_order, p.order_index, 0), p.id
    ), '[]'::jsonb) into project_data
    from public.projects p
    left join public.gzver_project_highlights h on h.project_id = p.id and h.gzver_id = p_id
    where p.status is distinct from 'draft'
      and coalesce(h.is_visible, true)
      and (h.id is not null or p.author_ids && array_remove(array[member.id, member.linked_author_id], null::uuid));

    doc := jsonb_build_object('schema_version', 1,
      'person', to_jsonb(member) || jsonb_build_object('department_name', coalesce(
        (select name from public.gzver_departments where id = member.department_id), member.department_name)),
      'projects', project_data);
  else
    doc := jsonb_build_object('schema_version', 1, 'person', null, 'projects', '[]'::jsonb);
  end if;
  insert into public.gzver_cv_snapshots(profile_id, slug, is_active, payload, updated_at)
    values(p_id, current_slug, active, doc, clock_timestamp())
  on conflict(profile_id) do update
    set slug = excluded.slug, is_active = excluded.is_active, payload = excluded.payload, updated_at = excluded.updated_at
    where (gzver_cv_snapshots.slug, gzver_cv_snapshots.is_active, gzver_cv_snapshots.payload)
      is distinct from (excluded.slug, excluded.is_active, excluded.payload);
end;
$$;
revoke all on function gzv_private.rebuild_cv(uuid,text) from public, anon, authenticated;

-- Statement-level transition tables deduplicate affected profiles in bulk saves.
create or replace function gzv_private.refresh_cv_snapshots()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  changed jsonb := '[]'::jsonb;
  rows_data jsonb;
  target record;
begin
  if tg_op <> 'INSERT' then
    select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) into rows_data from cv_old_rows r;
    changed := changed || rows_data;
  end if;
  if tg_op <> 'DELETE' then
    select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) into rows_data from cv_new_rows r;
    changed := changed || rows_data;
  end if;
  if tg_table_name = 'gzvers' then
    for target in select distinct (r->>'id')::uuid as id, r->>'slug' as slug from jsonb_array_elements(changed) r loop
      perform gzv_private.rebuild_cv(target.id, target.slug);
    end loop;
  elsif tg_table_name = 'gzver_project_highlights' then
    for target in select distinct (r->>'gzver_id')::uuid as id from jsonb_array_elements(changed) r loop
      perform gzv_private.rebuild_cv(target.id);
    end loop;
  elsif tg_table_name = 'projects' then
    for target in
      select distinct g.id from public.gzvers g
      where exists (select 1 from jsonb_array_elements(changed) r
        where coalesce(r->'author_ids','[]'::jsonb) ? g.id::text
           or coalesce(r->'author_ids','[]'::jsonb) ? g.linked_author_id::text
           or exists (select 1 from public.gzver_project_highlights h where h.gzver_id = g.id and h.project_id = (r->>'id')::uuid))
    loop perform gzv_private.rebuild_cv(target.id); end loop;
  elsif tg_table_name = 'gzver_departments' then
    for target in select g.id from public.gzvers g
      where g.department_id in (select (r->>'id')::uuid from jsonb_array_elements(changed) r)
    loop perform gzv_private.rebuild_cv(target.id); end loop;
  end if;
  return null;
end;
$$;
revoke all on function gzv_private.refresh_cv_snapshots() from public, anon, authenticated;

do $$
declare t text; g record;
begin
  foreach t in array array['gzvers','projects','gzver_project_highlights','gzver_departments'] loop
    execute format('drop trigger if exists gzv_cv_insert on public.%I',t);
    execute format('drop trigger if exists gzv_cv_update on public.%I',t);
    execute format('drop trigger if exists gzv_cv_delete on public.%I',t);
    execute format('create trigger gzv_cv_insert after insert on public.%I referencing new table as cv_new_rows for each statement execute function gzv_private.refresh_cv_snapshots()',t);
    execute format('create trigger gzv_cv_update after update on public.%I referencing old table as cv_old_rows new table as cv_new_rows for each statement execute function gzv_private.refresh_cv_snapshots()',t);
    execute format('create trigger gzv_cv_delete after delete on public.%I referencing old table as cv_old_rows for each statement execute function gzv_private.refresh_cv_snapshots()',t);
  end loop;
  for g in select id from public.gzvers loop perform gzv_private.rebuild_cv(g.id); end loop;
  if exists(select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists(select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'gzver_cv_snapshots') then
    alter publication supabase_realtime add table public.gzver_cv_snapshots;
  end if;
end;
$$;

commit;
