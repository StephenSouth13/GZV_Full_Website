
-- 1. CREATE TABLE
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  category text NOT NULL DEFAULT 'corporate' CHECK (category IN ('corporate','education')),
  website_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. GRANTS
GRANT SELECT ON public.partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;

-- 3. RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
CREATE POLICY "Public can view active partners"
ON public.partners FOR SELECT
USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert partners"
ON public.partners FOR INSERT TO authenticated
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','collab')));

CREATE POLICY "Admins can update partners"
ON public.partners FOR UPDATE TO authenticated
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','collab')))
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','collab')));

CREATE POLICY "Admins can delete partners"
ON public.partners FOR DELETE TO authenticated
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin','collab')));

-- 5. updated_at trigger (reuse existing function)
CREATE TRIGGER trg_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Seed initial data
INSERT INTO public.partners (name, logo_url, category, sort_order) VALUES
('ASL', '/carousel/ASL.webp', 'corporate', 10),
('Binemo', '/carousel/Binemo.webp', 'corporate', 20),
('CP Group', '/carousel/CP.webp', 'corporate', 30),
('Greenfeed', '/carousel/Greenfeed.webp', 'corporate', 40),
('Happy Land', '/carousel/Happyland.webp', 'corporate', 50),
('HTO Group', '/carousel/HTOGroup.webp', 'corporate', 60),
('NAB', '/carousel/NAB.webp', 'corporate', 70),
('Richs Vietnam', '/carousel/Richs.webp', 'corporate', 80),
('Satra', '/carousel/Satra.webp', 'corporate', 90),
('Schindler', '/carousel/Schindler.webp', 'corporate', 100),
('SGC', '/carousel/SGC.webp', 'corporate', 110),
('SGF', '/carousel/SGF.webp', 'corporate', 120),
('SGGG', '/carousel/SGGG.webp', 'corporate', 130),
('SGL', '/carousel/SGL.webp', 'corporate', 140),
('Shinhan Bank', '/carousel/Shinhan.webp', 'corporate', 150),
('Smar', '/carousel/Smar.webp', 'corporate', 160),
('Smentor', '/carousel/Smentor.webp', 'corporate', 170),
('SP', '/carousel/SP.webp', 'corporate', 180),
('Tâm Châu', '/carousel/TC.webp', 'corporate', 190),
('VNPT', '/carousel/VNPT.webp', 'corporate', 200),
('WK', '/carousel/WK.webp', 'corporate', 210),
('YESCO', '/carousel/YESCO.webp', 'corporate', 220),
('BNI Vietnam', '/carousel/BNI.webp', 'education', 10),
('CSMO Vietnam', '/carousel/CSMO.webp', 'education', 20),
('HUIT', '/carousel/HUIT.webp', 'education', 30),
('Kỷ lục Quốc gia', '/carousel/KNQG.webp', 'education', 40),
('UEH', '/carousel/UEH.webp', 'education', 50),
('UFM', '/carousel/UFM.webp', 'education', 60),
('VCCI', '/carousel/VCCI.webp', 'education', 70),
('VK', '/carousel/VK.webp', 'education', 80),
('VRA', '/carousel/VRA.webp', 'education', 90),
('VSM', '/carousel/VSM.webp', 'education', 100),
('VTF', '/carousel/VTF.webp', 'education', 110);
