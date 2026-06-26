
-- Dynamic contact form fields configuration
CREATE TABLE public.contact_form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  placeholder TEXT,
  help_text TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  width TEXT NOT NULL DEFAULT 'full',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contact_form_fields TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_form_fields TO authenticated;
GRANT ALL ON public.contact_form_fields TO service_role;
ALTER TABLE public.contact_form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active contact fields" ON public.contact_form_fields
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage contact fields" ON public.contact_form_fields
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER trg_contact_form_fields_updated_at
  BEFORE UPDATE ON public.contact_form_fields
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Submitted contact messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  is_read BOOLEAN NOT NULL DEFAULT false,
  admin_note TEXT,
  source TEXT DEFAULT 'lien-he',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a contact message" ON public.contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can read contact messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete contact messages" ON public.contact_messages
  FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);

-- Seed default fields matching the existing /lien-he form
INSERT INTO public.contact_form_fields (field_key, label, field_type, placeholder, is_required, sort_order, width)
VALUES
  ('name', 'Họ và tên', 'text', 'Nguyễn Văn A', true, 1, 'full'),
  ('email', 'Email', 'email', 'email@example.com', true, 2, 'half'),
  ('phone', 'Số điện thoại', 'tel', '090 xxx xxxx', false, 3, 'half'),
  ('message', 'Nội dung', 'textarea', 'Tôi cần tư vấn về khóa học...', true, 4, 'full');
