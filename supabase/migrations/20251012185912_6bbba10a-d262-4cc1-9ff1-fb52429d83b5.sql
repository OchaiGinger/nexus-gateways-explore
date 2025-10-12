-- Fix function search path security issue
DROP FUNCTION IF EXISTS public.cleanup_stale_presence();

CREATE OR REPLACE FUNCTION public.cleanup_stale_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_presence
  WHERE updated_at < NOW() - INTERVAL '30 seconds';
END;
$$;