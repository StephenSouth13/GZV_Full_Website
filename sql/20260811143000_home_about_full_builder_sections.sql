insert into public.site_section_templates
  (template_key, name, category, component_type, default_props, sort_order, is_active)
values
  ('gzv-story-split', 'Câu chuyện + ảnh lớn', 'about', 'story_split', '{"eyebrow":"Câu chuyện GZV","title":"Câu chuyện GZV","subtitle":"Từ một cộng đồng học hỏi đến hệ sinh thái triển khai thực chiến.","body":"GZV được xây dựng để kết nối thế hệ trẻ, chuyên gia và doanh nghiệp trong cùng một môi trường học tập - làm thật - tạo tác động thật.","image_url":"/gioi-thieu/19.webp","image_alt":"Câu chuyện GZV","position_x":50,"position_y":50,"image_size":100,"stats":[{"value":"50+","label":"Doanh nghiệp"},{"value":"5000+","label":"Học viên"},{"value":"10+","label":"Lĩnh vực"}]}'::jsonb, 70, true),
  ('gzv-timeline', 'Lộ trình phát triển', 'about', 'timeline', '{"eyebrow":"Growth Roadmap","title":"Lộ trình phát triển của GZV","subtitle":"Các chặng phát triển được thiết kế để mở rộng năng lực cộng đồng và năng lực triển khai.","items":[{"year":"Giai đoạn 1","title":"Xây nền cộng đồng","description":"Kết nối GZVers, mentor và doanh nghiệp đối tác."},{"year":"Giai đoạn 2","title":"Chuẩn hóa mô hình","description":"Hoàn thiện mentoring, coaching và project-based learning."},{"year":"Giai đoạn 3","title":"Triển khai dự án","description":"Đưa đội ngũ vào các bài toán Marketing, Sales, Digital Transformation."},{"year":"Giai đoạn 4","title":"Mở rộng hệ sinh thái","description":"Phát triển mạng lưới đối tác, chuyên gia và dự án liên ngành."}]}'::jsonb, 80, true),
  ('gzv-mentoring-model', 'Mô hình Mentoring', 'about', 'mentoring_model', '{"eyebrow":"Mentoring Model","title":"Mô hình Mentoring","subtitle":"GZV kết hợp định hướng cá nhân, huấn luyện kỹ năng và triển khai dự án thật.","steps":[{"title":"Đánh giá năng lực","description":"Xác định điểm mạnh, mục tiêu và khoảng trống kỹ năng."},{"title":"Mentoring cá nhân hóa","description":"Kết nối mentor phù hợp để định hướng lộ trình phát triển."},{"title":"Dự án thực chiến","description":"Thực hành trên bài toán thật để tạo năng lực có thể đo lường."}]}'::jsonb, 90, true),
  ('gzv-services-three', 'Services 3 mảng', 'home', 'services_three', '{"eyebrow":"Services","title":"SERVICES","subtitle":"Marketing | Sales | Digital Transformation","items":[{"title":"Marketing","icon":"megaphone","description":"Xây dựng chiến lược thương hiệu, nội dung, chiến dịch tăng trưởng và truyền thông đa kênh."},{"title":"Sales","icon":"trend","description":"Thiết kế pipeline, kịch bản bán hàng, đào tạo đội ngũ và tối ưu chuyển đổi doanh thu."},{"title":"Digital Transformation","icon":"cpu","description":"Chuẩn hóa quy trình, dữ liệu, tự động hóa và công cụ vận hành cho doanh nghiệp."}]}'::jsonb, 100, true),
  ('gzv-why-columns', 'Tại sao chọn chúng tôi', 'home', 'why_columns', '{"eyebrow":"Why GZV","title":"TẠI SAO NÊN CHỌN CHÚNG TÔI","subtitle":"Ba trụ cột giúp GZV triển khai sắc cạnh và tạo kết quả rõ ràng.","columns":[{"title":"Cột 1","description":"Đội ngũ mentor và chuyên gia có kinh nghiệm triển khai thực tế."},{"title":"Cột 2","description":"Phương pháp làm việc rõ mục tiêu, đo lường được và bám sát hiệu quả kinh doanh."},{"title":"Cột 3","description":"Mạng lưới đối tác, dự án và GZVers giúp tăng tốc kết nối thị trường."}]}'::jsonb, 110, true),
  ('gzv-about-boxes', 'Về chúng tôi 3 box', 'home', 'about_boxes', '{"eyebrow":"Về chúng tôi","title":"VỀ CHÚNG TÔI","subtitle":"Khám phá các nhóm nhân sự và cộng đồng đang tạo nên GZV.","boxes":[{"title":"BAN ĐIỀU HÀNH","description":"Nhóm định hướng chiến lược và điều phối triển khai.","href":"/gzver"},{"title":"BAN CỐ VẤN","description":"Mạng lưới mentor, chuyên gia và cố vấn đồng hành.","href":"/mentors"},{"title":"GZVer","description":"Cộng đồng thế hệ trẻ học tập, làm dự án và phát triển cùng nhau.","href":"/gzver"}]}'::jsonb, 120, true),
  ('gzv-people-grid', 'People grid từ GZVers', 'people', 'people_grid', '{"eyebrow":"Team","title":"BAN ĐIỀU HÀNH","subtitle":"Lấy dữ liệu tự động từ GZVers đã đánh dấu ban điều hành.","type":"directors","limit":6}'::jsonb, 130, true)
on conflict (template_key) do update set
  name = excluded.name,
  category = excluded.category,
  component_type = excluded.component_type,
  default_props = excluded.default_props,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.site_pages
  (slug, title, menu_title, banner_badge, banner_title, banner_subtitle, banner_description, is_visible, seo_title, seo_description)
values
  ('home', 'Trang chủ', 'Trang chủ', 'GZV', 'GZV Ltd', 'The Next-Gen Company', 'Trang chủ GZV điều khiển bằng Page Builder.', true, 'GZV - The Next-Gen Company', 'Marketing, Sales, Digital Transformation và hệ sinh thái mentoring của GZV.'),
  ('gioi-thieu', 'Giới thiệu', 'GIỚI THIỆU', 'ABOUT GZV', 'Giới thiệu GZV', 'Câu chuyện, sứ mệnh, tầm nhìn và mô hình mentoring.', 'Tìm hiểu hệ sinh thái GZV.', true, 'Giới thiệu - GZV', 'Câu chuyện, sứ mệnh, tầm nhìn, giá trị cốt lõi và mô hình mentoring của GZV.')
on conflict (slug) do update set
  title = excluded.title,
  menu_title = excluded.menu_title,
  banner_badge = excluded.banner_badge,
  banner_title = excluded.banner_title,
  banner_subtitle = excluded.banner_subtitle,
  banner_description = excluded.banner_description,
  is_visible = excluded.is_visible,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;

insert into public.site_home_sections
  (section_key, title, subtitle, description, button_label, button_url, sort_order, item_limit, is_visible, settings)
values
  ('hero', 'GZV Ltd', 'The Next-Gen Company', 'Đồng hành cùng doanh nghiệp và thế hệ trẻ qua Marketing, Sales và Digital Transformation với tư duy triển khai thực chiến.', 'Khám phá dịch vụ', '/#dich-vu', 1, 1, true, '{"video_url":"/Intro.mp4","poster_url":"/og-image.jpg"}'::jsonb)
on conflict (section_key) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  button_label = excluded.button_label,
  button_url = excluded.button_url,
  sort_order = excluded.sort_order,
  item_limit = excluded.item_limit,
  is_visible = excluded.is_visible,
  settings = public.site_home_sections.settings || excluded.settings;

delete from public.site_page_blocks
where page_slug = 'gioi-thieu'
  and block_key not in ('story', 'mission', 'vision', 'core-values', 'directors', 'timeline', 'mentoring-model');

insert into public.site_page_blocks
  (page_slug, block_key, component_type, title, props, content_html, sort_order, is_visible)
values
  ('home', 'mission-vision-values', 'feature_grid', 'Sứ mệnh - Tầm nhìn - Giá trị cốt lõi', '{"title":"SỨ MỆNH - TẦM NHÌN - GIÁ TRỊ CỐT LÕI","subtitle":"Ba nền tảng định hướng mọi hoạt động của GZV.","columns":3,"items":[{"title":"Sứ mệnh","description":"Kết nối tri thức, chuyên gia và doanh nghiệp để tạo năng lực tăng trưởng có thể đo lường.","icon":"target","color":"#ed1c24"},{"title":"Tầm nhìn","description":"Trở thành hệ sinh thái mentoring, coaching và triển khai dự án thế hệ mới tại Việt Nam.","icon":"compass","color":"#050505"},{"title":"Giá trị cốt lõi","description":"Thực chiến, minh bạch, học hỏi liên tục và cam kết tạo tác động thật cho đối tác.","icon":"shield","color":"#ed1c24"}]}'::jsonb, null, 10, true),
  ('home', 'projects', 'projects_grid', 'Dự án đã triển khai', '{"title":"DỰ ÁN ĐÃ TRIỂN KHAI","subtitle":"Các dự án Mentoring, Coaching và triển khai thực tế mà GZV đồng hành.","limit":6,"background":"#ffffff"}'::jsonb, null, 20, true),
  ('home', 'services', 'services_three', 'Services', '{"eyebrow":"Services","title":"SERVICES","subtitle":"Marketing | Sales | Digital Transformation","items":[{"title":"Marketing","icon":"megaphone","description":"Xây dựng chiến lược thương hiệu, nội dung, chiến dịch tăng trưởng và truyền thông đa kênh."},{"title":"Sales","icon":"trend","description":"Thiết kế pipeline, kịch bản bán hàng, đào tạo đội ngũ và tối ưu chuyển đổi doanh thu."},{"title":"Digital Transformation","icon":"cpu","description":"Chuẩn hóa quy trình, dữ liệu, tự động hóa và công cụ vận hành cho doanh nghiệp."}]}'::jsonb, null, 30, true),
  ('home', 'why-choose', 'why_columns', 'Tại sao nên chọn chúng tôi', '{"eyebrow":"Why GZV","title":"TẠI SAO NÊN CHỌN CHÚNG TÔI","subtitle":"Ba trụ cột giúp GZV triển khai sắc cạnh và tạo kết quả rõ ràng.","columns":[{"title":"Cột 1","description":"Đội ngũ mentor và chuyên gia có kinh nghiệm triển khai thực tế."},{"title":"Cột 2","description":"Phương pháp làm việc rõ mục tiêu, đo lường được và bám sát hiệu quả kinh doanh."},{"title":"Cột 3","description":"Mạng lưới đối tác, dự án và GZVers giúp tăng tốc kết nối thị trường."}]}'::jsonb, null, 40, true),
  ('home', 'about-boxes', 'about_boxes', 'Về chúng tôi', '{"eyebrow":"Về chúng tôi","title":"VỀ CHÚNG TÔI","subtitle":"Khám phá các nhóm nhân sự và cộng đồng đang tạo nên GZV.","boxes":[{"title":"BAN ĐIỀU HÀNH","description":"Nhóm định hướng chiến lược và điều phối triển khai.","href":"/gzver"},{"title":"BAN CỐ VẤN","description":"Mạng lưới mentor, chuyên gia và cố vấn đồng hành.","href":"/mentors"},{"title":"GZVer","description":"Cộng đồng thế hệ trẻ học tập, làm dự án và phát triển cùng nhau.","href":"/gzver"}]}'::jsonb, null, 50, true),
  ('home', 'partners', 'partners_grid', 'Đối tác', '{"title":"ĐỐI TÁC","subtitle":"Các đơn vị đồng hành cùng hệ sinh thái GZV.","limit":40,"background":"#050505"}'::jsonb, null, 60, true),
  ('home', 'news', 'news_grid', 'Tin tức', '{"title":"TIN TỨC","subtitle":"Cập nhật hoạt động, góc nhìn và câu chuyện phát triển từ GZV.","limit":6,"background":"#ffffff"}'::jsonb, null, 70, true),
  ('gioi-thieu', 'story', 'story_split', 'Câu chuyện GZV', '{"eyebrow":"Câu chuyện GZV","title":"CÂU CHUYỆN GZV","subtitle":"Từ một cộng đồng học hỏi đến hệ sinh thái triển khai thực chiến.","body":"GZV được xây dựng để kết nối thế hệ trẻ, chuyên gia và doanh nghiệp trong cùng một môi trường học tập - làm thật - tạo tác động thật. Chúng tôi tin rằng năng lực chỉ bền vững khi được rèn trong dự án thực tế, dưới sự đồng hành của những người có kinh nghiệm.","image_url":"/gioi-thieu/19.webp","image_alt":"Câu chuyện GZV","position_x":50,"position_y":50,"image_size":100,"stats":[{"value":"50+","label":"Doanh nghiệp"},{"value":"5000+","label":"Học viên"},{"value":"10+","label":"Lĩnh vực"}]}'::jsonb, null, 10, true),
  ('gioi-thieu', 'mission', 'feature_grid', 'Sứ mệnh', '{"title":"SỨ MỆNH","subtitle":"Kết nối tri thức, chuyên gia và doanh nghiệp để tạo năng lực tăng trưởng có thể đo lường.","columns":1,"items":[{"title":"Tạo năng lực thực chiến","description":"GZV giúp người trẻ và doanh nghiệp phát triển thông qua mentoring, coaching và dự án thực tế.","icon":"target","color":"#ed1c24"}]}'::jsonb, null, 20, true),
  ('gioi-thieu', 'vision', 'feature_grid', 'Tầm nhìn', '{"title":"TẦM NHÌN","subtitle":"Trở thành hệ sinh thái mentoring, coaching và triển khai dự án thế hệ mới tại Việt Nam.","columns":1,"items":[{"title":"Hệ sinh thái Next-Gen","description":"Xây dựng mạng lưới chuyên gia, GZVers và đối tác cùng tạo giá trị bền vững.","icon":"compass","color":"#050505"}]}'::jsonb, null, 30, true),
  ('gioi-thieu', 'core-values', 'feature_grid', 'Giá trị cốt lõi', '{"title":"GIÁ TRỊ CỐT LÕI","subtitle":"Những nguyên tắc giúp GZV vận hành sắc cạnh và đáng tin cậy.","columns":4,"items":[{"title":"Thực chiến","description":"Tập trung vào kết quả và bài toán thật.","icon":"rocket","color":"#ed1c24"},{"title":"Minh bạch","description":"Rõ mục tiêu, rõ dữ liệu, rõ trách nhiệm.","icon":"shield","color":"#050505"},{"title":"Học hỏi liên tục","description":"Luôn cải tiến từ phản hồi và thực nghiệm.","icon":"book","color":"#ed1c24"},{"title":"Tạo tác động","description":"Ưu tiên giá trị đo lường được cho cộng đồng và đối tác.","icon":"award","color":"#050505"}]}'::jsonb, null, 40, true),
  ('gioi-thieu', 'directors', 'people_grid', 'Ban điều hành', '{"eyebrow":"Leadership","title":"BAN ĐIỀU HÀNH","subtitle":"Lấy dữ liệu tự động từ GZVers đã đánh dấu ban điều hành.","type":"directors","limit":6}'::jsonb, null, 50, true),
  ('gioi-thieu', 'timeline', 'timeline', 'Lộ trình phát triển của GZV', '{"eyebrow":"Growth Roadmap","title":"LỘ TRÌNH PHÁT TRIỂN CỦA GZV","subtitle":"Các chặng phát triển được thiết kế để mở rộng năng lực cộng đồng và năng lực triển khai.","items":[{"year":"Giai đoạn 1","title":"Xây nền cộng đồng","description":"Kết nối GZVers, mentor và doanh nghiệp đối tác."},{"year":"Giai đoạn 2","title":"Chuẩn hóa mô hình","description":"Hoàn thiện mentoring, coaching và project-based learning."},{"year":"Giai đoạn 3","title":"Triển khai dự án","description":"Đưa đội ngũ vào các bài toán Marketing, Sales, Digital Transformation."},{"year":"Giai đoạn 4","title":"Mở rộng hệ sinh thái","description":"Phát triển mạng lưới đối tác, chuyên gia và dự án liên ngành."}]}'::jsonb, null, 60, true),
  ('gioi-thieu', 'mentoring-model', 'mentoring_model', 'Mô hình Mentoring', '{"eyebrow":"Mentoring Model","title":"MÔ HÌNH MENTORING","subtitle":"GZV kết hợp định hướng cá nhân, huấn luyện kỹ năng và triển khai dự án thật.","steps":[{"title":"Đánh giá năng lực","description":"Xác định điểm mạnh, mục tiêu và khoảng trống kỹ năng."},{"title":"Mentoring cá nhân hóa","description":"Kết nối mentor phù hợp để định hướng lộ trình phát triển."},{"title":"Dự án thực chiến","description":"Thực hành trên bài toán thật để tạo năng lực có thể đo lường."}]}'::jsonb, null, 70, true)
on conflict (page_slug, block_key) do update set
  component_type = excluded.component_type,
  title = excluded.title,
  props = excluded.props,
  content_html = excluded.content_html,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible;
