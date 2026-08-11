alter table public.gzvers
  add column if not exists cover_image_url text,
  add column if not exists headline text,
  add column if not exists location text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists website_url text,
  add column if not exists profile_tabs jsonb not null default '[]'::jsonb,
  add column if not exists profile_badges jsonb not null default '[]'::jsonb,
  add column if not exists avatar_position_x integer not null default 50,
  add column if not exists avatar_position_y integer not null default 50,
  add column if not exists avatar_scale integer not null default 100,
  add column if not exists cover_position_x integer not null default 50,
  add column if not exists cover_position_y integer not null default 50,
  add column if not exists cover_scale integer not null default 100;

update public.gzvers
set profile_tabs = '[
  {"key":"overview","label":"Tổng quan","label_en":"Overview","type":"overview","source":"overview","sort_order":10,"visible":true},
  {"key":"journey","label":"Lộ trình","label_en":"Journey","type":"text","source":"promotion_path","sort_order":20,"visible":true},
  {"key":"achievements","label":"Thành tựu","label_en":"Achievements","type":"list","source":"achievements_list","sort_order":30,"visible":true},
  {"key":"experience","label":"Kinh nghiệm","label_en":"Experience","type":"background","source":"experience","sort_order":40,"visible":true},
  {"key":"impact","label":"Tác động","label_en":"Impact","type":"text","source":"social_impact","sort_order":50,"visible":true}
]'::jsonb
where profile_tabs = '[]'::jsonb or profile_tabs is null;

update public.gzvers
set profile_badges = jsonb_build_array(
  jsonb_build_object(
    'label', coalesce(nullif(role_level, ''), case when is_director then 'Ban điều hành' else 'GZVer' end),
    'icon', case when is_director then 'star' else 'shield' end,
    'color', '#ed1c24',
    'visible', true,
    'sort_order', 10
  )
)
where profile_badges = '[]'::jsonb or profile_badges is null;
