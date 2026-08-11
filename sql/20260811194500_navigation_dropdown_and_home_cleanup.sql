alter table public.site_navigation
  add column if not exists parent_href text,
  add column if not exists is_external boolean not null default false;

create index if not exists site_navigation_parent_href_idx
on public.site_navigation(parent_href);

update public.site_page_blocks
set is_visible = false
where page_slug = 'home'
  and (
    block_key in ('why-choose', 'why_choose')
    or lower(coalesce(title, '')) like '%tại sao nên chọn%'
    or component_type = 'why_columns'
  );

update public.site_home_sections
set is_visible = false
where section_key = 'why_choose';

insert into public.site_navigation
  (href, label_vi, label_en, parent_href, sort_order, is_visible, is_page_enabled, is_external)
values
  ('https://marketing.gzv.one/', 'Marketing', 'Marketing', '/dich-vu', 21, true, true, true),
  ('https://store.gzv.one/', 'Cửa hàng', 'Store', '/dich-vu', 22, true, true, true)
on conflict (href) do update set
  label_vi = excluded.label_vi,
  label_en = excluded.label_en,
  parent_href = excluded.parent_href,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible,
  is_page_enabled = excluded.is_page_enabled,
  is_external = excluded.is_external,
  updated_at = now();
