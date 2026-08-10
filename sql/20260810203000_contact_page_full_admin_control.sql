create table if not exists public.site_contact_settings (
  id integer primary key default 1,
  hero_badge text not null default 'LIÊN HỆ GZV',
  hero_title text not null default 'KẾT NỐI VỚI GZV',
  hero_subtitle text not null default 'Để lại thông tin, đội ngũ GZV sẽ phản hồi và đồng hành cùng nhu cầu của bạn.',
  form_title text not null default 'Gửi lời nhắn cho chúng tôi',
  form_description text not null default 'Điền thông tin bên dưới, đội ngũ GZV sẽ phản hồi trong vòng 24 giờ làm việc.',
  submit_label text not null default 'Gửi tin nhắn',
  success_message text not null default 'Cảm ơn bạn! Tin nhắn đã được gửi thành công.',
  error_message text not null default 'Không gửi được tin nhắn. Vui lòng thử lại sau.',
  info_title text not null default 'Thông tin liên hệ',
  social_title text not null default 'Mạng xã hội',
  map_title text not null default 'Bản đồ GZV',
  map_embed_url text,
  map_enabled boolean not null default true,
  contact_items jsonb not null default '[]'::jsonb,
  social_links jsonb not null default '[]'::jsonb,
  stats jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_contact_settings_singleton check (id = 1)
);

create or replace function public.set_site_contact_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_contact_settings_updated_at on public.site_contact_settings;
create trigger set_site_contact_settings_updated_at
before update on public.site_contact_settings
for each row execute function public.set_site_contact_settings_updated_at();

insert into public.site_contact_settings (
  id,
  contact_items,
  social_links,
  stats,
  map_embed_url
) values (
  1,
  '[
    {"icon":"map","title":"Địa chỉ","lines":["279 Nguyễn Tri Phương, Phường Diên Hồng, TP. Hồ Chí Minh"]},
    {"icon":"phone","title":"Điện thoại","lines":["(+84) 329 381 489"],"href":"tel:+84329381489"},
    {"icon":"mail","title":"Email","lines":["gzv.one@gmail.com"],"href":"mailto:gzv.one@gmail.com"},
    {"icon":"clock","title":"Giờ làm việc","lines":["Thứ 2 - Thứ 7: 8:00 - 17:30","Chủ nhật: Nghỉ"]}
  ]'::jsonb,
  '[
    {"label":"Facebook","href":"https://www.facebook.com/gzv.one","icon":"facebook","visible":true},
    {"label":"Zalo","href":"https://zalo.me/g/acumou501","icon":"zalo","visible":true}
  ]'::jsonb,
  '[
    {"value":"+84","label":"Điện thoại"},
    {"value":"24h","label":"Phản hồi"},
    {"value":"100%","label":"Tin cậy"}
  ]'::jsonb,
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3547.0824622742025!2d106.66582407451699!3d10.761148759476423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fe01ccb37b3%3A0xb9b5223950251041!2sgzv%20Center!5e1!3m2!1svi!2s!4v1754099890700!5m2!1svi!2s'
) on conflict (id) do nothing;

alter table public.site_contact_settings enable row level security;

drop policy if exists "Public read site contact settings" on public.site_contact_settings;
create policy "Public read site contact settings"
on public.site_contact_settings for select
using (true);

drop policy if exists "Authenticated manage site contact settings" on public.site_contact_settings;
create policy "Authenticated manage site contact settings"
on public.site_contact_settings for all
to authenticated
using (true)
with check (true);

grant select on public.site_contact_settings to anon, authenticated;
grant insert, update, delete on public.site_contact_settings to authenticated;
