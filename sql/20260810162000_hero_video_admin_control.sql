begin;

alter table public.site_home_sections
  add column if not exists settings jsonb not null default '{}'::jsonb;

insert into public.site_home_sections
  (section_key, title, subtitle, description, button_label, button_url, sort_order, item_limit, is_visible, content_html, settings)
values
  (
    'hero',
    'GZV Ltd',
    'The Next-Gen Company',
    'Đồng hành cùng doanh nghiệp và thế hệ trẻ qua Marketing, Sales và Digital Transformation với tư duy triển khai thực chiến.',
    'Khám phá dịch vụ',
    '/#dich-vu',
    1,
    1,
    true,
    null,
    '{"video_url":"/Intro.mp4","poster_url":"/og-image.jpg"}'::jsonb
  )
on conflict (section_key) do update
set title = excluded.title,
    subtitle = excluded.subtitle,
    description = excluded.description,
    button_label = excluded.button_label,
    button_url = excluded.button_url,
    sort_order = excluded.sort_order,
    item_limit = excluded.item_limit,
    is_visible = excluded.is_visible,
    settings = public.site_home_sections.settings || excluded.settings;

commit;
