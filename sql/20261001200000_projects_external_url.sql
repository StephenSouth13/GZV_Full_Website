alter table public.projects
  add column if not exists external_url text;

comment on column public.projects.external_url is 'Optional partner/client website opened from the project image.';
