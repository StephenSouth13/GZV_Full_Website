begin;

-- Keep public reads; constrain writes even when an older permissive policy exists.
create or replace function public.gzv_can_edit_cms() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','editor','collab'));
$$;
revoke all on function public.gzv_can_edit_cms() from public;
grant execute on function public.gzv_can_edit_cms() to anon, authenticated;

create or replace function public.gzv_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin');
$$;
revoke all on function public.gzv_is_admin() from public;
grant execute on function public.gzv_is_admin() to anon,authenticated;

do $$ declare t text; begin
  foreach t in array array['authors','partners','gzvers','gzver_project_highlights','media_files'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('drop policy if exists gzv_staff_write on public.%I',t);
    execute format('create policy gzv_staff_write on public.%I for all to authenticated using (public.gzv_can_edit_cms()) with check (public.gzv_can_edit_cms())',t);
    execute format('drop policy if exists gzv_guard_insert on public.%I',t);
    execute format('drop policy if exists gzv_guard_update on public.%I',t);
    execute format('drop policy if exists gzv_guard_delete on public.%I',t);
    execute format('create policy gzv_guard_insert on public.%I as restrictive for insert to public with check (public.gzv_can_edit_cms())',t);
    execute format('create policy gzv_guard_update on public.%I as restrictive for update to public using (public.gzv_can_edit_cms()) with check (public.gzv_can_edit_cms())',t);
    execute format('create policy gzv_guard_delete on public.%I as restrictive for delete to public using (public.gzv_can_edit_cms())',t);
  end loop;
end $$;

-- A user may edit their own profile, but not erase or rewrite somebody else's.
alter table public.profiles enable row level security;
drop policy if exists gzv_guard_profile_insert on public.profiles;
drop policy if exists gzv_guard_profile_update on public.profiles;
drop policy if exists gzv_guard_profile_delete on public.profiles;
create policy gzv_guard_profile_insert on public.profiles as restrictive for insert to public
  with check (id=auth.uid() or public.gzv_is_admin());
create policy gzv_guard_profile_update on public.profiles as restrictive for update to public
  using (id=auth.uid() or public.gzv_is_admin()) with check (id=auth.uid() or public.gzv_is_admin());
create policy gzv_guard_profile_delete on public.profiles as restrictive for delete to public
  using (public.gzv_is_admin() and id<>auth.uid());

-- Direct Storage REST calls must respect the same roles as the media API.
drop policy if exists gzv_media_insert on storage.objects;
drop policy if exists gzv_media_update on storage.objects;
drop policy if exists gzv_media_delete on storage.objects;
create policy gzv_media_insert on storage.objects as restrictive for insert to public
  with check (bucket_id<>'media' or public.gzv_can_edit_cms());
create policy gzv_media_update on storage.objects as restrictive for update to public
  using (bucket_id<>'media' or public.gzv_can_edit_cms()) with check (bucket_id<>'media' or public.gzv_can_edit_cms());
create policy gzv_media_delete on storage.objects as restrictive for delete to public
  using (bucket_id<>'media' or public.gzv_can_edit_cms());

-- A public user must never promote themselves through a permissive profile policy.
create or replace function public.gzv_guard_profile_role() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (auth.uid() is not null or auth.role() = 'anon') and
     ((TG_OP = 'INSERT' and coalesce(new.role,'user') <> 'user') or
      (TG_OP = 'UPDATE' and new.role is distinct from old.role)) and
     not exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Only administrators may change roles' using errcode = '42501';
  end if;
  return new;
end $$;
revoke all on function public.gzv_guard_profile_role() from public,anon,authenticated;
drop trigger if exists gzv_guard_profile_role on public.profiles;
create trigger gzv_guard_profile_role before insert or update of role on public.profiles
for each row execute function public.gzv_guard_profile_role();

alter table public.authors add column if not exists sort_order integer default 0;
create index if not exists authors_sort_order_idx on public.authors(sort_order);

create or replace function public.reorder_authors(p_items jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare requested integer; changed integer;
begin
  if not public.gzv_can_edit_cms() then raise exception 'Forbidden' using errcode='42501'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 10000 then raise exception 'Invalid order payload'; end if;
  select count(*) into requested from jsonb_to_recordset(p_items) as x(id uuid,sort_order integer);
  if exists(select 1 from jsonb_to_recordset(p_items) as x(id uuid,sort_order integer) where id is null or sort_order is null) or
     (select count(distinct id) from jsonb_to_recordset(p_items) as x(id uuid,sort_order integer)) <> requested then raise exception 'Invalid or duplicate author'; end if;
  -- Lock in a stable order to avoid interleaved bulk reorder writes.
  perform a.id from public.authors a join jsonb_to_recordset(p_items) as x(id uuid,sort_order integer) on a.id=x.id order by a.id for update of a;
  update public.authors a set sort_order=x.sort_order from jsonb_to_recordset(p_items) as x(id uuid,sort_order integer) where a.id=x.id;
  get diagnostics changed = row_count;
  if changed <> requested then raise exception 'Author missing or not writable'; end if;
end $$;
revoke all on function public.reorder_authors(jsonb) from public,anon;
grant execute on function public.reorder_authors(jsonb) to authenticated;

create or replace function public.save_gzver_profile(p_id uuid, p_profile jsonb, p_highlights jsonb, p_expected_updated_at timestamptz default null)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare columns_sql text; values_sql text; assignments_sql text; saved public.gzvers; previous public.gzvers; payload jsonb;
begin
  if not public.gzv_can_edit_cms() then raise exception 'Forbidden' using errcode='42501'; end if;
  if jsonb_typeof(p_profile) <> 'object' or jsonb_typeof(p_highlights) <> 'array' or jsonb_array_length(p_highlights)>10000 then raise exception 'Invalid profile payload'; end if;
  payload := (p_profile - array['id','created_at','updated_at']) || jsonb_build_object('updated_at',clock_timestamp());
  if exists(select 1 from jsonb_object_keys(payload) k where not exists(select 1 from pg_catalog.pg_attribute a where a.attrelid='public.gzvers'::regclass and a.attname=k and a.attnum>0 and not a.attisdropped)) then raise exception 'Unknown profile field'; end if;
  select string_agg(format('%I',k),',' order by k), string_agg(format('v.%I',k),',' order by k), string_agg(format('%I=v.%I',k,k),',' order by k)
    into columns_sql,values_sql,assignments_sql from jsonb_object_keys(payload) k;
  if p_id is null then
    execute format('insert into public.gzvers(%s) select %s from jsonb_populate_record(null::public.gzvers,$1) v returning *',columns_sql,values_sql) into saved using payload;
  else
    select * into previous from public.gzvers where id=p_id for update;
    if not found then raise exception 'Profile missing or not writable'; end if;
    if p_expected_updated_at is not null and previous.updated_at is distinct from p_expected_updated_at then raise exception 'Hồ sơ đã được cập nhật bởi người khác. Tải lại trước khi lưu.' using errcode='PT409'; end if;
    execute format('update public.gzvers g set %s from jsonb_populate_record(null::public.gzvers,$1) v where g.id=$2 returning g.*',assignments_sql) into saved using payload,p_id;
  end if;
  if saved.id is null then raise exception 'Profile not writable'; end if;
  insert into public.gzver_project_highlights(gzver_id,project_id,contribution,image_urls,is_visible,sort_order,updated_at)
  select saved.id,x.project_id,coalesce(x.contribution,''),coalesce(x.image_urls,'[]'::jsonb),coalesce(x.is_visible,true),coalesce(x.sort_order,0),clock_timestamp()
    from jsonb_to_recordset(p_highlights) as x(project_id uuid,contribution text,image_urls jsonb,is_visible boolean,sort_order integer)
  on conflict(gzver_id,project_id) do update set contribution=excluded.contribution,image_urls=excluded.image_urls,is_visible=excluded.is_visible,sort_order=excluded.sort_order,updated_at=excluded.updated_at;
  return jsonb_build_object('id',saved.id,'updated_at',saved.updated_at);
end $$;
revoke all on function public.save_gzver_profile(uuid,jsonb,jsonb,timestamptz) from public,anon;
grant execute on function public.save_gzver_profile(uuid,jsonb,jsonb,timestamptz) to authenticated;
notify pgrst,'reload schema';
commit;
