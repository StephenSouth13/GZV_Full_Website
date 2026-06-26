-- Fix missing GRANTs on contact tables (PostgREST returned permission errors -> empty inbox / failed submits)
GRANT SELECT ON public.contact_form_fields TO anon, authenticated;
GRANT ALL ON public.contact_form_fields TO service_role;

GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

-- Ensure sequences (if any) usable by anon for inserts (using uuid pk, but safe)
DO $$ BEGIN
  PERFORM 1;
END $$;