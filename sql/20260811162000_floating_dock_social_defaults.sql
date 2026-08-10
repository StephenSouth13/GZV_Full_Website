insert into public.site_floating_actions
  (action_key, label, href, icon_url, action_type, sort_order, is_visible)
values
  ('chatbot', 'Chat với GZV', null, null, 'chatbot', 10, true),
  ('facebook', 'Facebook', 'https://www.facebook.com/gzv.one', '/icons/facebook.png', 'link', 20, true),
  ('youtube', 'YouTube', 'https://www.youtube.com/@gzvLifeLongLearning', '/icons/youtube.png', 'link', 30, true),
  ('zalo', 'Zalo', 'https://zalo.me/g/acumou501', '/icons/zalo.png', 'link', 40, true)
on conflict (action_key) do update set
  label = excluded.label,
  href = excluded.href,
  icon_url = excluded.icon_url,
  action_type = excluded.action_type,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible;

update public.site_floating_actions
set sort_order = 50
where action_key not in ('chatbot', 'facebook', 'youtube', 'zalo')
  and sort_order < 50;
