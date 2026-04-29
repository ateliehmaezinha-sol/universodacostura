-- Revoke EXECUTE on SECURITY DEFINER functions from public/anon/authenticated
-- These are only intended to run via triggers / internal callers
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;