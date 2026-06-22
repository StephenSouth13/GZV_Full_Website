
CREATE OR REPLACE FUNCTION add_mscer_admin(mscer_data jsonb)
RETURNS SETOF mscers
AS $$
BEGIN
  -- SECURITY DEFINER allows this function to bypass RLS policies
  INSERT INTO public.mscers (
    id, name, company, position, avatar, achievement, testimonial,
    "graduationYear", promotion, "socialImpact", course, skills,
    achievements, mentoring, background
  )
  VALUES (
    mscer_data->>'id',
    mscer_data->>'name',
    mscer_data->>'company',
    mscer_data->>'position',
    mscer_data->>'avatar',
    mscer_data->>'achievement',
    mscer_data->>'testimonial',
    mscer_data->>'graduationYear',
    mscer_data->>'promotion',
    mscer_data->>'socialImpact',
    mscer_data->>'course',
    -- Convert json array to text array
    ARRAY(SELECT jsonb_array_elements_text(mscer_data->'skills')),
    ARRAY(SELECT jsonb_array_elements_text(mscer_data->'achievements')),
    mscer_data->>'mentoring',
    mscer_data->'background'
  );

  -- Return the newly inserted row to confirm success
  RETURN QUERY SELECT * FROM public.mscers WHERE id = (mscer_data->>'id');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution rights to the 'service_role'
-- This ensures that only requests with the service key can run this function.
GRANT EXECUTE ON FUNCTION add_mscer_admin(jsonb) TO service_role;
