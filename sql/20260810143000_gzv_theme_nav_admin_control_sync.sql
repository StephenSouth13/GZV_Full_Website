begin;

alter table public.site_branding_settings
  add column if not exists topbar_email_label text,
  add column if not exists topbar_phone_label text,
  add column if not exists topbar_badge_label text;

delete from public.site_navigation
where href in ('/dao-tao', '/mentors', '/dong-hanh');

insert into public.site_navigation
  (href, label_vi, label_en, sort_order, is_visible, is_page_enabled)
values
  ('/gioi-thieu', 'GIỚI THIỆU', 'ABOUT', 10, true, true),
  ('/#dich-vu', 'DỊCH VỤ', 'SERVICES', 20, true, true),
  ('/du-an', 'DỰ ÁN', 'PROJECTS', 30, true, true),
  ('/gzver', 'GZVers', 'GZVers', 40, true, true),
  ('/tin-tuc', 'TIN TỨC', 'NEWS', 50, true, true),
  ('/lien-he', 'LIÊN HỆ', 'CONTACT', 60, true, true)
on conflict (href) do update set
  label_vi = excluded.label_vi,
  label_en = excluded.label_en,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible,
  is_page_enabled = excluded.is_page_enabled;

delete from public.site_page_blocks where page_slug = 'dao-tao';
delete from public.site_pages where slug = 'dao-tao';

insert into public.site_home_sections
  (section_key, title, subtitle, description, button_label, button_url, sort_order, item_limit, is_visible, content_html)
values
  ('mission', 'SỨ MỆNH - TẦM NHÌN - GIÁ TRỊ CỐT LÕI', null, 'Ba trụ cột nhận diện GZV: thực chiến, minh bạch và tăng trưởng thế hệ mới.', null, null, 15, 3, true, null),
  ('services', 'DỊCH VỤ GZV', 'Marketing | Sales | Digital Transformation', 'Ba mũi triển khai chính giúp doanh nghiệp xây dựng thương hiệu, tăng doanh thu và vận hành bằng công nghệ.', 'Liên hệ tư vấn', '/lien-he', 25, 3, true, null),
  ('why_choose', 'SẮC CẠNH TRONG TƯ DUY, CHẮC TAY TRONG TRIỂN KHAI', null, 'GZV kết hợp mô hình mentoring với năng lực triển khai dịch vụ để tạo ra môi trường học, làm và tăng trưởng cùng nhau.', null, null, 45, 3, true, null),
  ('about_cta', 'MENTORING MODEL, PROJECT NETWORK, NEXT-GEN GROWTH.', null, 'Lộ trình phát triển của GZV, mô hình mentoring và hệ sinh thái GZVers.', 'Tìm hiểu thêm', '/gioi-thieu', 75, 1, true, null)
on conflict (section_key) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  button_label = excluded.button_label,
  button_url = excluded.button_url,
  sort_order = excluded.sort_order,
  item_limit = excluded.item_limit,
  is_visible = excluded.is_visible,
  content_html = excluded.content_html;

update public.site_footer_settings
set
  background_color = '#050505',
  bottom_background_color = '#050505',
  newsletter_title = 'Đăng ký nhận tin mới',
  newsletter_description = 'Nhận thông tin sự kiện, dự án và tin tức mới nhất từ GZV.',
  links = jsonb_build_array(
    jsonb_build_object('label', 'Chính sách bảo mật', 'href', '/chinh-sach-bao-mat', 'visible', true),
    jsonb_build_object('label', 'Điều khoản sử dụng', 'href', '/dieu-khoan-su-dung', 'visible', true),
    jsonb_build_object('label', 'Sơ đồ trang web', 'href', '/so-do-trang-web', 'visible', true)
  )
where id = 1;

update public.site_branding_settings
set
  topbar_badge_label = 'THE NEXT-GEN COMPANY',
  default_keywords = 'GZV, marketing, sales, digital transformation, mentoring, coaching'
where id = 1;

commit;
