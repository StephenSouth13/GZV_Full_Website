REVOKE ALL ON public.contact_form_fields FROM anon;
REVOKE ALL ON public.contact_messages FROM anon;
REVOKE ALL ON public.contact_form_fields FROM authenticated;
REVOKE ALL ON public.contact_messages FROM authenticated;

GRANT SELECT ON public.contact_form_fields TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_form_fields TO authenticated;
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_form_fields TO service_role;
GRANT ALL ON public.contact_messages TO service_role;