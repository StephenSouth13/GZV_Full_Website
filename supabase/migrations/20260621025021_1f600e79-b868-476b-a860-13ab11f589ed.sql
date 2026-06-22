GRANT SELECT ON public.contact_form_fields TO anon, authenticated;
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_form_fields TO service_role;
GRANT ALL ON public.contact_messages TO service_role;