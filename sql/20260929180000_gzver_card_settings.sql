-- Shared template + default links for GZVer card visits (singleton row id = 1).
-- Per-member overrides live in gzvers.member_card.
create table if not exists public.gzver_card_settings (
  id integer primary key default 1 check (id = 1),
  company_line text not null default 'CÔNG TY TNHH GZV',
  top_tagline text not null default 'THE VOICE OF GENZ',
  card_title text not null default 'THẺ THÀNH VIÊN',
  card_subtitle text not null default 'GZVER',
  tagline text not null default 'THE VOICE OF GENZ',
  email text not null default 'one.gzv@gmail.com',
  hotline text not null default '0329 381 489',
  website_label text not null default 'WWW.GZV.ONE',
  website_url text not null default 'https://www.gzv.one',
  qr_caption text not null default 'QUÉT QR XÁC THỰC HỒ SƠ',
  template_front_image_url text,
  template_back_image_url text,
  template_overlay boolean not null default true,
  demo_notice text not null default 'Thẻ demo – bản xem trước tạm thời, chưa phải thẻ chính thức.',
  official_notice text not null default 'Thẻ thành viên chính thức do GZV LTD cấp.',
  links jsonb not null default '[{"label":"Website GZV","url":"https://www.gzv.one","icon":"website","visible":true,"sort_order":10},{"label":"Facebook GZV","url":"https://www.facebook.com/gzv.one","icon":"facebook","visible":true,"sort_order":20}]'::jsonb,
  show_vcard boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.gzver_card_settings (id) values (1) on conflict (id) do nothing;

alter table public.gzver_card_settings enable row level security;

drop policy if exists "Public read gzver card settings" on public.gzver_card_settings;
create policy "Public read gzver card settings" on public.gzver_card_settings
  for select using (true);

drop policy if exists "Authenticated manage gzver card settings" on public.gzver_card_settings;
create policy "Authenticated manage gzver card settings" on public.gzver_card_settings
  to authenticated using (true) with check (true);

create or replace function public.set_gzver_card_settings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_gzver_card_settings_updated_at on public.gzver_card_settings;
create trigger set_gzver_card_settings_updated_at
  before update on public.gzver_card_settings
  for each row execute function public.set_gzver_card_settings_updated_at();

grant select on public.gzver_card_settings to anon, authenticated;
grant insert, update on public.gzver_card_settings to authenticated;
