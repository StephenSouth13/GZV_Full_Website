-- Feature: allow an "author" (bài viết) profile to be linked to a "gzver"
-- (thanh vien GZVer) profile and vice versa, so admin can pull/copy data
-- from one into the other when creating a new record. The two records stay
-- fully independent rows: deleting one only clears the link column on the
-- other side (ON DELETE SET NULL), it never deletes the linked record.

alter table public.authors
  add column if not exists linked_gzver_id uuid references public.gzvers(id) on delete set null;

alter table public.gzvers
  add column if not exists linked_author_id uuid references public.authors(id) on delete set null;

create index if not exists idx_authors_linked_gzver_id on public.authors(linked_gzver_id);
create index if not exists idx_gzvers_linked_author_id on public.gzvers(linked_author_id);
