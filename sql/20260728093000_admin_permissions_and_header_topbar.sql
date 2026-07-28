-- Admin/site CMS hardening and editable public header topbar fields.

alter table public.site_branding_settings
  add column if not exists topbar_email_label text default 'gzv.one@gmail.com',
  add column if not exists topbar_phone_label text default '(+84) 329 381 489',
  add column if not exists topbar_badge_label text default 'GZV';

update public.site_branding_settings
set topbar_email_label = coalesce(topbar_email_label, 'gzv.one@gmail.com'),
    topbar_phone_label = coalesce(topbar_phone_label, '(+84) 329 381 489'),
    topbar_badge_label = coalesce(topbar_badge_label, site_name, 'GZV')
where id = 1;

create or replace function public.is_site_admin_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'collab')
  );
$$;

grant execute on function public.is_site_admin_role() to authenticated;

drop policy if exists "Authenticated manage site navigation" on public.site_navigation;
create policy "Authenticated manage site navigation"
on public.site_navigation for all
to authenticated
using (public.is_site_admin_role())
with check (public.is_site_admin_role());

drop policy if exists "Authenticated manage site pages" on public.site_pages;
create policy "Authenticated manage site pages"
on public.site_pages for all
to authenticated
using (public.is_site_admin_role())
with check (public.is_site_admin_role());

drop policy if exists "Authenticated manage site loading settings" on public.site_loading_settings;
create policy "Authenticated manage site loading settings"
on public.site_loading_settings for all
to authenticated
using (public.is_site_admin_role())
with check (public.is_site_admin_role());

drop policy if exists "Authenticated manage site home sections" on public.site_home_sections;
create policy "Authenticated manage site home sections"
on public.site_home_sections for all
to authenticated
using (public.is_site_admin_role())
with check (public.is_site_admin_role());

drop policy if exists "Authenticated manage site footer settings" on public.site_footer_settings;
create policy "Authenticated manage site footer settings"
on public.site_footer_settings for all
to authenticated
using (public.is_site_admin_role())
with check (public.is_site_admin_role());

drop policy if exists "Authenticated manage site floating actions" on public.site_floating_actions;
create policy "Authenticated manage site floating actions"
on public.site_floating_actions for all
to authenticated
using (public.is_site_admin_role())
with check (public.is_site_admin_role());

drop policy if exists "Authenticated manage site branding settings" on public.site_branding_settings;
create policy "Authenticated manage site branding settings"
on public.site_branding_settings for all
to authenticated
using (public.is_site_admin_role())
with check (public.is_site_admin_role());

drop policy if exists "Authenticated manage section templates" on public.site_section_templates;
create policy "Authenticated manage section templates"
on public.site_section_templates for all
to authenticated
using (public.is_site_admin_role())
with check (public.is_site_admin_role());

drop policy if exists "Authenticated manage page blocks" on public.site_page_blocks;
create policy "Authenticated manage page blocks"
on public.site_page_blocks for all
to authenticated
using (public.is_site_admin_role())
with check (public.is_site_admin_role());
