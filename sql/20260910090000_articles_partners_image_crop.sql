-- Feature: full crop (position + zoom) support for article thumbnails and
-- partner logos, matching the pattern already used on gzvers
-- (avatar_position_x/y, avatar_scale). Lets admin fine-tune framing instead
-- of relying on plain object-cover, and lets the frontend render the exact
-- same crop the admin previewed.

alter table public.articles
  add column if not exists image_position_x integer not null default 50,
  add column if not exists image_position_y integer not null default 50,
  add column if not exists image_scale integer not null default 100;

alter table public.partners
  add column if not exists logo_position_x integer not null default 50,
  add column if not exists logo_position_y integer not null default 50,
  add column if not exists logo_scale integer not null default 100;
