-- Make every CMS-controlled public surface publish realtime change events.
-- The product app can then update header, footer, page content and controls
-- immediately after an editor saves from /admin/site-content.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_navigation',
    'site_pages',
    'site_loading_settings',
    'site_home_sections',
    'site_footer_settings',
    'site_floating_actions',
    'site_branding_settings',
    'site_section_templates',
    'site_page_blocks',
    'site_contact_settings'
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
