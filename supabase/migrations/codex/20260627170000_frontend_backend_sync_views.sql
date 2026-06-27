-- Frontend/backend sync fixes for public pages.
-- Safe to run multiple times in Supabase SQL editor.

alter table public.programs
  add column if not exists detailed_content text,
  add column if not exists highlights jsonb default '[]'::jsonb;

alter table public.articles
  add column if not exists author_ids uuid[] default '{}'::uuid[];

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
  a.image,
  coalesce(a.thumbnail_url, a.image) as display_image,
  a.published_at,
  a.published_at as publish_date,
  a.created_at,
  a.updated_at,
  a.views,
  a.likes,
  a.author_id,
  a.author_ids,
  first_author.full_name as author_name,
  first_author.avatar_url as author_avatar,
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
  ) as authors_details
from public.articles a
left join lateral (
  select
    coalesce(nullif(a.author_ids, '{}'::uuid[]), array_remove(array[a.author_id], null::uuid)) as ids
) article_author_ids on true
left join public.authors au
  on au.id = any(article_author_ids.ids)
left join lateral (
  select fa.full_name, fa.avatar_url
  from public.authors fa
  where fa.id = any(article_author_ids.ids)
  order by array_position(article_author_ids.ids, fa.id) nulls last, fa.full_name
  limit 1
) first_author on true
group by
  a.id,
  a.title,
  a.slug,
  a.excerpt,
  a.content,
  a.category,
  a.featured,
  a.status,
  a.thumbnail_url,
  a.image,
  a.published_at,
  a.created_at,
  a.updated_at,
  a.views,
  a.likes,
  a.author_id,
  a.author_ids,
  first_author.full_name,
  first_author.avatar_url;

grant select on public.allblogposts to anon, authenticated;
