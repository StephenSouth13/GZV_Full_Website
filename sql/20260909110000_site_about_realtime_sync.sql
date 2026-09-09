do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'site_page_blocks'
  ) then
    alter publication supabase_realtime add table public.site_page_blocks;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'site_pages'
  ) then
    alter publication supabase_realtime add table public.site_pages;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'site_branding_settings'
  ) then
    alter publication supabase_realtime add table public.site_branding_settings;
  end if;
end $$;
