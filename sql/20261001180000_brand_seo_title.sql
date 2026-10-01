-- Keep the canonical brand title consistent across Google, Open Graph and Twitter.
update public.site_branding_settings
set
  default_title = 'GZV - The Voice of Genzers',
  title_template = '%s | GZV - The Voice of Genzers',
  default_description = coalesce(nullif(default_description, ''), 'GZV - The Voice of Genzers'),
  default_keywords = 'GZV, The Voice of Genzers, đào tạo, mentoring, coaching',
  twitter_title = coalesce(nullif(twitter_title, ''), 'GZV - The Voice of Genzers'),
  updated_at = now()
where id = 1;
