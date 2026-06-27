-- Frontend/backend sync fixes for public pages.
-- Safe to run multiple times in Supabase SQL editor.

alter table public.courses
  add column if not exists short_description text,
  add column if not exists detailed_content text,
  add column if not exists highlights jsonb default '[]'::jsonb,
  add column if not exists estimated_duration text,
  add column if not exists total_lessons integer default 0,
  add column if not exists price_original numeric,
  add column if not exists price_sale numeric,
  add column if not exists theme_color text default '#0077B6',
  add column if not exists is_featured boolean default false,
  add column if not exists updated_at timestamptz default now();

create or replace view public.programs as
select
  id,
  title,
  slug,
  description,
  video_url,
  modules,
  level,
  price,
  featured,
  status,
  thumbnail_url,
  created_at,
  thumbnail_url as image,
  modules as content,
  short_description,
  detailed_content,
  highlights,
  estimated_duration,
  total_lessons,
  price_original,
  price_sale,
  theme_color,
  coalesce(is_featured, featured, false) as is_featured,
  updated_at
from public.courses
where status = 'published';

grant select on public.programs to anon, authenticated;

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
