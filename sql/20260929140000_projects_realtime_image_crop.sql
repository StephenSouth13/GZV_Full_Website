-- Keep project media presentation consistent across admin and public pages.
alter table public.projects
  add column if not exists image_position_x integer not null default 50,
  add column if not exists image_position_y integer not null default 50,
  add column if not exists image_scale integer not null default 100;

update public.projects
set
  image_position_x = least(greatest(coalesce(image_position_x, 50), 0), 100),
  image_position_y = least(greatest(coalesce(image_position_y, 50), 0), 100),
  image_scale = least(greatest(coalesce(image_scale, 100), 100), 200);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_image_position_x_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_image_position_x_check check (image_position_x between 0 and 100);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_image_position_y_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_image_position_y_check check (image_position_y between 0 and 100);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_image_scale_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_image_scale_check check (image_scale between 100 and 200);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'projects'
  ) then
    alter publication supabase_realtime add table public.projects;
  end if;
end $$;
