-- Let editors choose the first public profile presentation while visitors can
-- still switch between the full one-view and compact tabs.
alter table public.gzvers
  add column if not exists profile_view_mode text not null default 'one_view';

alter table public.gzvers
  drop constraint if exists gzvers_profile_view_mode_check;

alter table public.gzvers
  add constraint gzvers_profile_view_mode_check
  check (profile_view_mode in ('one_view', 'tabs'));
