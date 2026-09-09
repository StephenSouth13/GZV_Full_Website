update public.site_loading_settings
set
  title = coalesce(nullif(title, ''), 'GZV'),
  subtitle = coalesce(nullif(subtitle, ''), 'Dang tai du lieu...'),
  effect = coalesce(nullif(effect, ''), 'orbit'),
  background_from = coalesce(nullif(background_from, ''), '#050505'),
  background_to = coalesce(nullif(background_to, ''), '#ed1c24'),
  accent_color = coalesce(nullif(accent_color, ''), '#ffffff'),
  enabled = coalesce(enabled, true),
  minimum_duration_ms = least(greatest(coalesce(minimum_duration_ms, 650), 250), 900)
where id = 1;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_loading_settings',
    'site_home_sections',
    'articles',
    'authors',
    'gzvers',
    'gzver_departments'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null
      and not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = table_name
      )
    then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;
