-- Kho liên kết trong Admin → Thư viện media: Drive, Canva, Google Docs, mạng xã hội...
-- Dùng chung cho mọi admin (trước đây lưu localStorage theo từng trình duyệt).
create table if not exists public.media_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  kind text not null default 'website',
  note text,
  is_pinned boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_links_sort_idx on public.media_links (is_pinned desc, sort_order asc);

alter table public.media_links enable row level security;

drop policy if exists "Authenticated manage media links" on public.media_links;
create policy "Authenticated manage media links" on public.media_links
  to authenticated using (true) with check (true);

grant select, insert, update, delete on public.media_links to authenticated;

create or replace function public.set_media_links_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_media_links_updated_at on public.media_links;
create trigger set_media_links_updated_at
  before update on public.media_links
  for each row execute function public.set_media_links_updated_at();

-- Kho Drive trung tâm đang dùng làm mặc định
insert into public.media_links (title, url, kind, note, is_pinned, sort_order)
select 'Kho Drive trung tâm GZV', 'https://drive.google.com/drive/folders/1PEDTMRkPQeLNXh6qE-7SKM4woQup6-Ka', 'drive_folder', 'Ảnh, video, hồ sơ và tài liệu gốc của GZV', true, 10
where not exists (select 1 from public.media_links);
