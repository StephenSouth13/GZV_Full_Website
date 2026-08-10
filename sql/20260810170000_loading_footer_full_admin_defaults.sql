begin;

insert into public.site_loading_settings
  (id, logo_url, title, subtitle, effect, background_from, background_to, accent_color, enabled, minimum_duration_ms)
values
  (1, '/logo.webp', 'GZV', 'Đang tải dữ liệu...', 'orbit', '#050505', '#161616', '#ed1c24', true, 900)
on conflict (id) do update set
  logo_url = excluded.logo_url,
  title = excluded.title,
  subtitle = excluded.subtitle,
  effect = excluded.effect,
  background_from = excluded.background_from,
  background_to = excluded.background_to,
  accent_color = excluded.accent_color,
  enabled = excluded.enabled,
  minimum_duration_ms = excluded.minimum_duration_ms;

update public.site_footer_settings
set
  logo_url = coalesce(nullif(logo_url, ''), '/logo.webp'),
  intro_text = 'GZV Ltd - The Next-Gen Company. Marketing, Sales và Digital Transformation triển khai thực chiến.',
  background_color = '#050505',
  bottom_background_color = '#050505',
  newsletter_title = 'Đăng ký nhận tin mới',
  newsletter_description = 'Nhận thông tin sự kiện, dự án và tin tức mới nhất từ GZV.',
  copyright_text = 'Copyright of www.gzv.one',
  links = jsonb_build_array(
    jsonb_build_object('label', 'GIỚI THIỆU', 'href', '/gioi-thieu', 'visible', true),
    jsonb_build_object('label', 'DỊCH VỤ', 'href', '/#dich-vu', 'visible', true),
    jsonb_build_object('label', 'DỰ ÁN', 'href', '/du-an', 'visible', true),
    jsonb_build_object('label', 'GZVers', 'href', '/gzver', 'visible', true),
    jsonb_build_object('label', 'TIN TỨC', 'href', '/tin-tuc', 'visible', true),
    jsonb_build_object('label', 'LIÊN HỆ', 'href', '/lien-he', 'visible', true)
  ),
  social_links = case
    when jsonb_array_length(coalesce(social_links, '[]'::jsonb)) > 0 then social_links
    else jsonb_build_array(
      jsonb_build_object('label', 'Facebook', 'href', 'https://www.facebook.com/gzv.one', 'icon', 'facebook', 'visible', true),
      jsonb_build_object('label', 'YouTube', 'href', 'https://www.youtube.com/@gzvLifeLongLearning', 'icon', 'youtube', 'visible', true),
      jsonb_build_object('label', 'Zalo', 'href', 'https://zalo.me/g/acumou501', 'icon', 'zalo', 'visible', true)
    )
  end
where id = 1;

commit;
