-- Preserve inbound links when editors rename an article slug.
create table if not exists public.article_slug_redirects (
  old_slug text primary key,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists article_slug_redirects_article_id_idx
  on public.article_slug_redirects(article_id);

alter table public.article_slug_redirects enable row level security;

drop policy if exists "Public can read article slug redirects" on public.article_slug_redirects;
create policy "Public can read article slug redirects"
  on public.article_slug_redirects
  for select
  to anon, authenticated
  using (true);

grant select on public.article_slug_redirects to anon, authenticated;

create or replace function public.remember_article_slug_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.slug is distinct from new.slug and nullif(btrim(old.slug), '') is not null then
    insert into public.article_slug_redirects (old_slug, article_id)
    values (old.slug, new.id)
    on conflict (old_slug) do update
      set article_id = excluded.article_id,
          created_at = now();

    delete from public.article_slug_redirects
    where old_slug = new.slug;
  end if;
  return new;
end;
$$;

drop trigger if exists remember_article_slug_change on public.articles;
create trigger remember_article_slug_change
after update of slug on public.articles
for each row
when (old.slug is distinct from new.slug)
execute function public.remember_article_slug_change();
