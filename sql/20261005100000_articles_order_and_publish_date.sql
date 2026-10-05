begin;

alter table public.articles add column if not exists sort_order integer default 0;

with ranked as (
  select id, row_number() over (
    order by coalesce(published_at, created_at) desc nulls last, id
  ) * 10 as next_order
  from public.articles
)
update public.articles a
set sort_order = ranked.next_order
from ranked
where a.id = ranked.id and coalesce(a.sort_order, 0) = 0;

alter table public.articles alter column sort_order set default 0;
alter table public.articles alter column sort_order set not null;
create index if not exists articles_sort_order_idx on public.articles(sort_order, published_at desc);

create or replace function public.gzv_assign_article_sort_order() returns trigger
language plpgsql set search_path = '' as $$
begin
  if coalesce(new.sort_order, 0) = 0 then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('public.articles.sort_order'));
    select coalesce(max(a.sort_order), 0) + 10 into new.sort_order from public.articles a;
  end if;
  return new;
end $$;
revoke all on function public.gzv_assign_article_sort_order() from public, anon, authenticated;
drop trigger if exists gzv_assign_article_sort_order on public.articles;
create trigger gzv_assign_article_sort_order before insert on public.articles
for each row execute function public.gzv_assign_article_sort_order();

alter table public.articles enable row level security;
drop policy if exists gzv_staff_write on public.articles;
drop policy if exists gzv_guard_insert on public.articles;
drop policy if exists gzv_guard_update on public.articles;
drop policy if exists gzv_guard_delete on public.articles;
create policy gzv_staff_write on public.articles for all to authenticated
  using (public.gzv_can_edit_cms()) with check (public.gzv_can_edit_cms());
create policy gzv_guard_insert on public.articles as restrictive for insert to public
  with check (public.gzv_can_edit_cms());
create policy gzv_guard_update on public.articles as restrictive for update to public
  using (public.gzv_can_edit_cms()) with check (public.gzv_can_edit_cms());
create policy gzv_guard_delete on public.articles as restrictive for delete to public
  using (public.gzv_can_edit_cms());

create or replace function public.reorder_articles(p_items jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
declare requested integer; changed integer;
begin
  if not public.gzv_can_edit_cms() then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 10000 then
    raise exception 'Invalid order payload';
  end if;
  select count(*) into requested
  from jsonb_to_recordset(p_items) as x(id uuid, sort_order integer);
  if exists(
    select 1 from jsonb_to_recordset(p_items) as x(id uuid, sort_order integer)
    where id is null or sort_order is null
  ) or (
    select count(distinct id)
    from jsonb_to_recordset(p_items) as x(id uuid, sort_order integer)
  ) <> requested then
    raise exception 'Invalid or duplicate article';
  end if;
  perform a.id
  from public.articles a
  join jsonb_to_recordset(p_items) as x(id uuid, sort_order integer) on a.id = x.id
  order by a.id
  for update of a;
  update public.articles a
  set sort_order = x.sort_order
  from jsonb_to_recordset(p_items) as x(id uuid, sort_order integer)
  where a.id = x.id;
  get diagnostics changed = row_count;
  if changed <> requested then
    raise exception 'Article missing or not writable';
  end if;
end $$;
revoke all on function public.reorder_articles(jsonb) from public, anon;
grant execute on function public.reorder_articles(jsonb) to authenticated;

create or replace view public.allblogposts as
select
  a.id,
  a.title,
  a.slug,
  a.excerpt,
  a.content,
  a.category,
  a.featured,
  a.status,
  a.thumbnail_url,
  a.published_at,
  a.created_at,
  a.author_id,
  first_author.full_name as author_name,
  first_author.avatar_url as author_avatar,
  a.image,
  coalesce(a.thumbnail_url, a.image) as display_image,
  a.published_at as publish_date,
  a.updated_at,
  a.views,
  a.likes,
  a.author_ids,
  coalesce(
    jsonb_agg(
      distinct jsonb_build_object(
        'id', au.id,
        'full_name', au.full_name,
        'avatar_url', au.avatar_url,
        'slug', au.slug,
        'title', coalesce(au.title, au.position, au.company)
      )
    ) filter (where au.id is not null),
    '[]'::jsonb
  ) as authors_details,
  a.image_position_x,
  a.image_position_y,
  a.image_scale,
  a.sort_order
from public.articles a
left join lateral (
  select coalesce(nullif(a.author_ids, '{}'::uuid[]), array_remove(array[a.author_id], null::uuid)) as ids
) article_author_ids on true
left join public.authors au on au.id = any(article_author_ids.ids)
left join lateral (
  select fa.full_name, fa.avatar_url
  from public.authors fa
  where fa.id = any(article_author_ids.ids)
  order by array_position(article_author_ids.ids, fa.id) nulls last, fa.full_name
  limit 1
) first_author on true
group by
  a.id, a.title, a.slug, a.excerpt, a.content, a.category, a.featured, a.status,
  a.thumbnail_url, a.image, a.published_at, a.created_at, a.updated_at, a.views,
  a.likes, a.author_id, a.author_ids, a.image_position_x, a.image_position_y,
  a.image_scale, a.sort_order, first_author.full_name, first_author.avatar_url;

grant select on public.allblogposts to anon, authenticated;
notify pgrst, 'reload schema';

commit;
