-- 1) Enable RLS on tables currently exposed without RLS (preserve public read behavior)
ALTER TABLE public.training_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_core_values ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.training_page_settings TO anon, authenticated;
GRANT ALL ON public.training_page_settings TO service_role;
GRANT SELECT ON public.training_core_values TO anon, authenticated;
GRANT ALL ON public.training_core_values TO service_role;

CREATE POLICY "Public read training settings"
  ON public.training_page_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage training settings"
  ON public.training_page_settings FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Public read training core values"
  ON public.training_core_values FOR SELECT
  USING (true);

CREATE POLICY "Admins manage training core values"
  ON public.training_core_values FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 2) Set search_path on functions (mutable search_path warning)
ALTER FUNCTION public.update_modified_column() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 3) SECURITY DEFINER function exposure: handle_new_user is only called by an auth trigger.
-- Revoke EXECUTE from PUBLIC/anon/authenticated so signed-in or anonymous clients cannot invoke it via PostgREST.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
