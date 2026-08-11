delete from public.site_navigation where href = '/#dich-vu';

insert into public.site_navigation
  (href, label_vi, label_en, sort_order, is_visible, is_page_enabled)
values
  ('/gioi-thieu', 'GIỚI THIỆU', 'ABOUT', 10, true, true),
  ('/dich-vu', 'DỊCH VỤ', 'SERVICES', 20, true, true),
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

insert into public.site_pages
  (slug, title, menu_title, banner_badge, banner_title, banner_subtitle, banner_description, is_visible, seo_title, seo_description)
values
  ('dich-vu', 'Dịch vụ', 'DỊCH VỤ', 'SERVICES', 'Dịch vụ GZV', 'Marketing | Sales | Digital Transformation', 'Các gói dịch vụ triển khai thực chiến giúp doanh nghiệp tăng trưởng rõ ràng.', true, 'Dịch vụ - GZV', 'Marketing, Sales và Digital Transformation theo mô hình triển khai thực chiến của GZV.')
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

insert into public.site_page_blocks
  (page_slug, block_key, component_type, title, props, content_html, sort_order, is_visible)
values
  (
    'dich-vu',
    'hero',
    'hero_stats',
    'Hero dịch vụ',
    '{
      "title":"DỊCH VỤ GZV",
      "subtitle":"Marketing | Sales | Digital Transformation",
      "title_en":"GZV SERVICES",
      "subtitle_en":"Marketing | Sales | Digital Transformation",
      "stats":[{"value":"3","label":"Mũi triển khai","label_en":"Service pillars"},{"value":"50+","label":"Đối tác","label_en":"Partners"},{"value":"10+","label":"Lĩnh vực","label_en":"Sectors"},{"value":"100%","label":"Thực chiến","label_en":"Execution-focused"}],
      "backgroundFrom":"#050505",
      "backgroundTo":"#ed1c24"
    }'::jsonb,
    null,
    10,
    true
  ),
  (
    'dich-vu',
    'services',
    'services_three',
    'Services',
    '{
      "eyebrow":"Services",
      "title":"SERVICES",
      "subtitle":"Marketing | Sales | Digital Transformation",
      "en":{"title":"SERVICES","subtitle":"Marketing | Sales | Digital Transformation"},
      "items":[
        {"title":"Marketing","title_en":"Marketing","icon":"megaphone","description":"Xây dựng chiến lược thương hiệu, nội dung, chiến dịch tăng trưởng và truyền thông đa kênh.","description_en":"Brand strategy, content systems, growth campaigns and multi-channel communication."},
        {"title":"Sales","title_en":"Sales","icon":"trend","description":"Thiết kế pipeline, kịch bản bán hàng, đào tạo đội ngũ và tối ưu chuyển đổi doanh thu.","description_en":"Sales pipeline design, scripts, team training and revenue conversion optimization."},
        {"title":"Digital Transformation","title_en":"Digital Transformation","icon":"cpu","description":"Chuẩn hóa quy trình, dữ liệu, tự động hóa và công cụ vận hành cho doanh nghiệp.","description_en":"Process standardization, data workflows, automation and operating tools for businesses."}
      ]
    }'::jsonb,
    null,
    20,
    true
  ),
  (
    'dich-vu',
    'process',
    'mentoring_model',
    'Quy trình triển khai',
    '{
      "eyebrow":"Delivery Model",
      "title":"QUY TRÌNH TRIỂN KHAI",
      "subtitle":"Từ chẩn đoán đến vận hành, GZV giữ quy trình rõ ràng để kết quả có thể đo lường.",
      "title_en":"DELIVERY PROCESS",
      "subtitle_en":"From diagnosis to operation, GZV keeps the process clear so outcomes can be measured.",
      "steps":[
        {"title":"Chẩn đoán","title_en":"Diagnose","description":"Phân tích mục tiêu, nguồn lực, dữ liệu và điểm nghẽn hiện tại.","description_en":"Analyze goals, resources, data and current bottlenecks."},
        {"title":"Thiết kế giải pháp","title_en":"Design","description":"Xây dựng lộ trình, KPI, đội hình và hệ thống triển khai phù hợp.","description_en":"Build the roadmap, KPIs, team setup and operating system."},
        {"title":"Triển khai & tối ưu","title_en":"Execute & optimize","description":"Thực thi theo sprint, đo lường liên tục và tối ưu dựa trên dữ liệu.","description_en":"Execute in sprints, measure continuously and optimize with data."}
      ]
    }'::jsonb,
    null,
    30,
    true
  ),
  (
    'dich-vu',
    'why',
    'why_columns',
    'Tại sao chọn GZV',
    '{
      "eyebrow":"Why GZV",
      "title":"TẠI SAO NÊN CHỌN GZV",
      "subtitle":"Không chỉ tư vấn, GZV đồng hành đến khi hệ thống vận hành được.",
      "title_en":"WHY CHOOSE GZV",
      "subtitle_en":"Beyond consulting, GZV stays until the system can operate.",
      "columns":[
        {"title":"Thực chiến","title_en":"Execution-first","description":"Giải pháp được thiết kế từ bài toán thật, ngân sách thật và đội ngũ thật.","description_en":"Solutions are designed from real problems, real budgets and real teams."},
        {"title":"Đo lường rõ","title_en":"Measurable","description":"Mỗi hạng mục đều gắn với KPI, dữ liệu và nhịp kiểm tra định kỳ.","description_en":"Each initiative is linked to KPIs, data and review rhythms."},
        {"title":"Chuyển giao được","title_en":"Transferable","description":"Doanh nghiệp nhận lại quy trình, tài liệu và năng lực vận hành nội bộ.","description_en":"Businesses receive processes, documentation and internal operating capability."}
      ]
    }'::jsonb,
    null,
    40,
    true
  ),
  (
    'dich-vu',
    'cta',
    'cta_band',
    'CTA dịch vụ',
    '{
      "title":"SẴN SÀNG TRAO ĐỔI BÀI TOÁN TĂNG TRƯỞNG?",
      "description":"Gửi thông tin để đội ngũ GZV tư vấn hướng triển khai phù hợp.",
      "buttonLabel":"Liên hệ GZV",
      "buttonUrl":"/lien-he",
      "title_en":"READY TO DISCUSS YOUR GROWTH CHALLENGE?",
      "description_en":"Send your information and GZV will suggest a suitable execution path.",
      "buttonLabel_en":"Contact GZV",
      "backgroundFrom":"#050505",
      "backgroundTo":"#ed1c24"
    }'::jsonb,
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

update public.site_home_sections
set button_url = '/dich-vu'
where button_url = '/#dich-vu' or section_key = 'hero';

update public.site_footer_settings
set links = (
  select jsonb_agg(
    case
      when link_item->>'href' = '/#dich-vu'
        then jsonb_set(link_item, '{href}', to_jsonb('/dich-vu'::text))
      else link_item
    end
  )
  from jsonb_array_elements(coalesce(links, '[]'::jsonb)) as link_item
)
where id = 1;
