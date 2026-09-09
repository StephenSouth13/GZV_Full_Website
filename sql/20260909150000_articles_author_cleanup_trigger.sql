-- Fix: publishing an article could fail with PostgREST 409 Conflict
-- (foreign_key_violation on articles_author_id_fkey) whenever an author
-- referenced by articles.author_id / articles.author_ids had already been
-- deleted from public.authors. This adds a trigger so deleting an author
-- automatically scrubs the dangling reference instead of leaving it behind
-- for the next publish to trip over.

create or replace function public.cleanup_deleted_author_from_articles()
returns trigger
language plpgsql
as $$
begin
  update public.articles
  set author_ids = array_remove(author_ids, old.id)
  where old.id = any(author_ids);

  return old;
end;
$$;

drop trigger if exists trg_cleanup_deleted_author_from_articles on public.authors;

create trigger trg_cleanup_deleted_author_from_articles
after delete on public.authors
for each row
execute function public.cleanup_deleted_author_from_articles();

-- One-off backfill for rows already left dangling before this trigger existed.
update public.articles a
set author_ids = (
  select coalesce(array_agg(aid), '{}')
  from unnest(a.author_ids) aid
  where exists (select 1 from public.authors x where x.id = aid)
)
where exists (
  select 1 from unnest(a.author_ids) aid
  where not exists (select 1 from public.authors x where x.id = aid)
);
