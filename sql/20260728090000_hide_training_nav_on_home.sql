-- Hide the /dao-tao entry from the public header/navigation while keeping
-- the training page itself enabled for direct links and admin editing.

update public.site_navigation
set is_visible = false,
    is_page_enabled = true,
    updated_at = now()
where href = '/dao-tao';

insert into public.site_navigation
  (href, label_vi, label_en, sort_order, is_visible, is_page_enabled)
select
  '/dao-tao',
  'Đào tạo',
  'Training',
  20,
  false,
  true
where not exists (
  select 1 from public.site_navigation where href = '/dao-tao'
);
