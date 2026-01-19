-- Fix mutable search_path on all functions by setting search_path to public

-- cleanup_expired_posts
ALTER FUNCTION public.cleanup_expired_posts() SET search_path = public;

-- create_post
ALTER FUNCTION public.create_post(
  DOUBLE PRECISION, DOUBLE PRECISION, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) SET search_path = public;

-- get_or_create_anonymous_id
ALTER FUNCTION public.get_or_create_anonymous_id(TEXT) SET search_path = public;

-- find_subscriptions_for_post
ALTER FUNCTION public.find_subscriptions_for_post(DOUBLE PRECISION, DOUBLE PRECISION) SET search_path = public;

-- can_user_post
ALTER FUNCTION public.can_user_post(TEXT, INTEGER) SET search_path = public;

-- generate_anonymous_id
ALTER FUNCTION public.generate_anonymous_id() SET search_path = public;

-- record_post
ALTER FUNCTION public.record_post(TEXT) SET search_path = public;

-- get_post_vote_count
ALTER FUNCTION public.get_post_vote_count(UUID) SET search_path = public;

-- cleanup_old_rate_limits
ALTER FUNCTION public.cleanup_old_rate_limits() SET search_path = public;

-- get_posts_in_bounds (if it exists)
DO $$
BEGIN
  ALTER FUNCTION public.get_posts_in_bounds(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) SET search_path = public;
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;
