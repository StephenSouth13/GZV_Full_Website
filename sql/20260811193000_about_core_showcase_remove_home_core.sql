-- Move mission / vision / core values out of the home page and into a single
-- premium editable About page section.

delete from public.site_page_blocks
where page_slug = 'home'
  and block_key in ('mission-vision-values', 'mission', 'core-values');

delete from public.site_page_blocks
where page_slug = 'gioi-thieu'
  and block_key in ('mission', 'vision', 'core-values', 'mission-vision-values', 'core-showcase');

insert into public.site_page_blocks
  (page_slug, block_key, component_type, title, props, content_html, sort_order, is_visible)
values
  (
    'gioi-thieu',
    'core-showcase',
    'core_showcase',
    'Sứ mệnh - Tầm nhìn - Giá trị cốt lõi',
    '{
      "eyebrow": "GZV Core",
      "title": "Sứ mệnh. Tầm nhìn. Giá trị cốt lõi.",
      "subtitle": "GZV định hình một hệ sinh thái triển khai thực chiến, nơi tri thức, đội ngũ và doanh nghiệp cùng tăng trưởng bằng kết quả đo lường được.",
      "highlights": ["Thực chiến", "Minh bạch", "Tăng trưởng"],
      "items": [
        {
          "label": "01",
          "title": "Sứ mệnh",
          "description": "Kết nối tri thức, chuyên gia và doanh nghiệp để tạo ra năng lực tăng trưởng có thể đo lường."
        },
        {
          "label": "02",
          "title": "Tầm nhìn",
          "description": "Trở thành hệ sinh thái mentoring, coaching và triển khai dự án thế hệ mới tại Việt Nam."
        },
        {
          "label": "03",
          "title": "Giá trị cốt lõi",
          "description": "Thực chiến, minh bạch, học hỏi liên tục và cam kết tạo tác động thật cho đối tác."
        }
      ]
    }'::jsonb,
    null,
    20,
    true
  );
