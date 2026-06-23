
CREATE OR REPLACE FUNCTION add_gzver_admin(gzver_data jsonb)
RETURNS SETOF gzvers
AS $$
BEGIN
  -- SECURITY DEFINER allows this function to bypass RLS policies
  INSERT INTO public.gzvers (
    id, name, company, position, avatar, achievement, testimonial,
    "graduationYear", promotion, "socialImpact", course, skills,
    achievements, mentoring, background
  )
  VALUES (
    gzver_data->>'id',
    gzver_data->>'name',
    gzver_data->>'company',
    gzver_data->>'position',
    gzver_data->>'avatar',
    gzver_data->>'achievement',
    gzver_data->>'testimonial',
    gzver_data->>'graduationYear',
    gzver_data->>'promotion',
    gzver_data->>'socialImpact',
    gzver_data->>'course',
    -- Convert json array to text array
    ARRAY(SELECT jsonb_array_elements_text(gzver_data->'skills')),
    ARRAY(SELECT jsonb_array_elements_text(gzver_data->'achievements')),
    gzver_data->>'mentoring',
    gzver_data->'background'
  );

  -- Return the newly inserted row to confirm success
  RETURN QUERY SELECT * FROM public.gzvers WHERE id = (gzver_data->>'id');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution rights to the 'service_role'
-- This ensures that only requests with the service key can run this function.
GRANT EXECUTE ON FUNCTION add_gzver_admin(jsonb) TO service_role;
