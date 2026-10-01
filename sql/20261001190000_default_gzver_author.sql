-- A reusable author identity for content published by the GZVer team.
insert into public.authors (full_name, slug, title, avatar_url, bio)
values (
  'Đội ngũ GZVer',
  'doi-ngu-gzver',
  'Đội ngũ GZVer',
  '/logo.webp',
  'Đội ngũ GZVer đồng hành cùng các dự án, bài viết và hoạt động phát triển cộng đồng của GZV.'
)
on conflict (slug) do nothing;
