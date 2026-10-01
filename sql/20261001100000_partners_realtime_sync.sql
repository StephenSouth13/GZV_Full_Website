-- Keep partner logo, crop and visibility changes synchronized with the product site.
do $$
begin
  if to_regclass('public.partners') is not null
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'partners'
    )
  then
    alter publication supabase_realtime add table public.partners;
  end if;
end $$;
