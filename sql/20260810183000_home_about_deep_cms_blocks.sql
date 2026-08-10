begin;

update public.site_home_sections
set settings = jsonb_build_object(
  'pillars', jsonb_build_array(
    jsonb_build_object('title', 'Sứ mệnh', 'icon', 'target', 'text', 'Kết nối tri thức, chuyên gia và doanh nghiệp để tạo ra năng lực tăng trưởng có thể đo lường.'),
    jsonb_build_object('title', 'Tầm nhìn', 'icon', 'compass', 'text', 'Trở thành hệ sinh thái mentoring, coaching và triển khai dự án thế hệ mới tại Việt Nam.'),
    jsonb_build_object('title', 'Giá trị cốt lõi', 'icon', 'shield', 'text', 'Thực chiến, minh bạch, học hỏi liên tục và cam kết tạo tác động thật cho đối tác.')
  )
)
where section_key = 'mission';

update public.site_home_sections
set settings = jsonb_build_object(
  'services', jsonb_build_array(
    jsonb_build_object('title', 'Marketing', 'icon', 'megaphone', 'text', 'Chiến lược thương hiệu, nội dung, chiến dịch tăng trưởng và hệ thống truyền thông đa kênh.'),
    jsonb_build_object('title', 'Sales', 'icon', 'chart', 'text', 'Thiết kế pipeline, kịch bản bán hàng, đào tạo đội ngũ và tối ưu chuyển đổi doanh thu.'),
    jsonb_build_object('title', 'Digital Transformation', 'icon', 'cpu', 'text', 'Chuẩn hóa quy trình, dữ liệu, tự động hóa và công cụ vận hành cho doanh nghiệp.')
  )
)
where section_key = 'services';

update public.site_home_sections
set settings = jsonb_build_object(
  'image_url', '/gioi-thieu/19.webp',
  'reasons', jsonb_build_array(
    'Đội ngũ mentor và chuyên gia có kinh nghiệm triển khai thực tế.',
    'Cách làm sắc cạnh, rõ mục tiêu, ưu tiên hiệu quả kinh doanh.',
    'Mạng lưới đối tác, GZVers và dự án giúp tăng tốc kết nối thị trường.'
  )
)
where section_key = 'why_choose';

update public.site_pages
set
  banner_badge = 'Về GZV',
  banner_title = 'GIỚI THIỆU',
  banner_subtitle = 'The Next-Gen Company',
  banner_description = 'GZV xây dựng hệ sinh thái Marketing, Sales và Digital Transformation theo tư duy thực chiến, kết nối chuyên gia, doanh nghiệp và thế hệ trẻ.',
  seo_title = 'Giới thiệu GZV',
  seo_description = 'Tìm hiểu GZV Ltd - The Next-Gen Company, mô hình mentoring, triển khai dự án và cộng đồng GZVers.'
where slug = 'gioi-thieu';

insert into public.site_page_blocks
  (page_slug, block_key, component_type, title, props, content_html, sort_order, is_visible)
values
  (
    'gioi-thieu',
    'about-banner',
    'page_banner',
    'Banner giới thiệu',
    '{"badge":"Về GZV","title":"GIỚI THIỆU","subtitle":"The Next-Gen Company","description":"GZV xây dựng hệ sinh thái Marketing, Sales và Digital Transformation theo tư duy thực chiến.","stats":[{"value":"10+","label":"Lĩnh vực"},{"value":"50+","label":"Doanh nghiệp"},{"value":"5000+","label":"Học viên"},{"value":"100%","label":"Thực chiến"}]}'::jsonb,
    null,
    10,
    true
  ),
  (
    'gioi-thieu',
    'about-intro',
    'html_rich',
    'Nội dung giới thiệu',
    '{"maxWidth":"980px"}'::jsonb,
    '<h2>GZV Ltd - The Next-Gen Company</h2><p>GZV đồng hành cùng doanh nghiệp và thế hệ trẻ thông qua năng lực Marketing, Sales và Digital Transformation. Chúng tôi tập trung vào tư duy triển khai, đo lường hiệu quả và xây dựng đội ngũ có khả năng hành động trong môi trường thật.</p><p>Mỗi chương trình, dự án và hoạt động cộng đồng đều được thiết kế để kết nối chuyên gia, mentor, đối tác và GZVers thành một hệ sinh thái tăng trưởng bền vững.</p>',
    20,
    true
  ),
  (
    'gioi-thieu',
    'about-principles',
    'feature_grid',
    'Triết lý vận hành',
    '{"title":"TRIẾT LÝ VẬN HÀNH","subtitle":"Ba nguyên tắc giúp GZV giữ sự sắc cạnh trong tư duy và chắc tay trong triển khai.","columns":3,"items":[{"title":"YOLO","description":"Dám thử, dám học và dám chịu trách nhiệm với kết quả.","icon":"target","color":"#ed1c24"},{"title":"PDCA","description":"Lập kế hoạch, triển khai, đo lường, cải tiến liên tục.","icon":"book","color":"#050505"},{"title":"KAIZEN","description":"Cải tiến từng ngày để tạo giá trị bền vững hơn.","icon":"award","color":"#00539b"}]}'::jsonb,
    null,
    30,
    true
  ),
  (
    'gioi-thieu',
    'about-gallery',
    'image_gallery',
    'Bộ ảnh giới thiệu',
    '{"title":"THƯ VIỆN HÌNH ẢNH","subtitle":"Admin có thể thêm, xóa, đổi ảnh và mô tả từng khoảnh khắc trong block này.","images":[{"src":"/gioi-thieu/4.webp","title":"Không gian đào tạo","category":"Cơ sở","description":"Không gian học tập và trao đổi chuyên môn tại GZV.","alt":"Không gian đào tạo GZV"},{"src":"/gioi-thieu/8.webp","title":"Sự kiện cộng đồng","category":"Sự kiện","description":"Các khoảnh khắc kết nối học viên, mentor và đối tác.","alt":"Sự kiện GZV"},{"src":"/gioi-thieu/6.webp","title":"Hội thảo chuyên gia","category":"Mentoring","description":"Các buổi chia sẻ chuyên sâu với chuyên gia thực chiến.","alt":"Hội thảo GZV"},{"src":"/gioi-thieu/19.webp","title":"Mentoring trực tiếp","category":"Đào tạo","description":"Đồng hành sát sao trong quá trình phát triển năng lực.","alt":"Mentoring GZV"},{"src":"/gioi-thieu/9.webp","title":"Kết nối doanh nghiệp","category":"Đối tác","description":"Mở rộng cơ hội hợp tác và triển khai dự án thật.","alt":"Kết nối doanh nghiệp GZV"},{"src":"/gioi-thieu/1.webp","title":"Văn hóa GZV","category":"Văn hóa","description":"Tinh thần học hỏi, trách nhiệm và phát triển cùng nhau.","alt":"Văn hóa GZV"}]}'::jsonb,
    null,
    40,
    true
  ),
  (
    'gioi-thieu',
    'about-cta',
    'cta_band',
    'CTA giới thiệu',
    '{"title":"Sẵn sàng đồng hành cùng GZV?","description":"Kết nối với đội ngũ GZV để trao đổi về dự án, dịch vụ hoặc cơ hội tham gia hệ sinh thái GZVers.","buttonLabel":"Liên hệ GZV","buttonUrl":"/lien-he","backgroundFrom":"#050505","backgroundTo":"#ed1c24"}'::jsonb,
    null,
    50,
    true
  )
on conflict (page_slug, block_key) do update set
  component_type = excluded.component_type,
  title = excluded.title,
  props = excluded.props,
  content_html = excluded.content_html,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible;

commit;
