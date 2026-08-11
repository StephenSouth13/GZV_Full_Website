-- Keep GZVer profile JSON fields consistently as arrays and soften avatar
-- default crop so portrait heads are not cut off in public cards.

update public.gzvers
set social_links = case
  when social_links is null then '[]'::jsonb
  when jsonb_typeof(social_links::jsonb) = 'array' then social_links::jsonb
  when jsonb_typeof(social_links::jsonb) = 'object' then jsonb_build_array(social_links::jsonb)
  else '[]'::jsonb
end
where social_links is null or jsonb_typeof(social_links::jsonb) <> 'array';

update public.gzvers
set profile_tabs = '[]'::jsonb
where profile_tabs is not null
  and jsonb_typeof(profile_tabs::jsonb) <> 'array';

update public.gzvers
set profile_badges = '[]'::jsonb
where profile_badges is not null
  and jsonb_typeof(profile_badges::jsonb) <> 'array';

update public.gzvers
set avatar_position_y = 32
where avatar_position_y is null
   or avatar_position_y = 50;
