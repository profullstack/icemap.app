-- Lock down functions and anonymous-identity columns (2026-10-26 fleet audit).
--
-- The app talks to Supabase only with the service role (lib/supabase.ts), so
-- nothing needs anon/authenticated access beyond what PostgREST exposes by
-- default. Fixed here, as defence in depth:
-- * PostGIS st_estimatedextent (SECURITY DEFINER, in public) was executable
--   by anon and could read planner statistics of any table;
-- * every app function (create_post, record_post, cleanup_*...) was
--   executable by anon/authenticated; they are service-role only now;
-- * spatial_ref_sys has no RLS and anon/authenticated could INSERT, UPDATE
--   and DELETE it, which breaks every geography transform;
-- * posts.fingerprint and comments.fingerprint/anonymous_id were readable by
--   anon. They link a poster's reports together, so the public SELECT now
--   leaves them out.

revoke execute on function public.st_estimatedextent(text, text, text, boolean) from public, anon, authenticated;
revoke execute on function public.st_estimatedextent(text, text, text) from public, anon, authenticated;
revoke execute on function public.st_estimatedextent(text, text) from public, anon, authenticated;
grant execute on function public.st_estimatedextent(text, text, text, boolean) to service_role;
grant execute on function public.st_estimatedextent(text, text, text) to service_role;
grant execute on function public.st_estimatedextent(text, text) to service_role;

-- App functions (not PostGIS): service role only.
do $$
declare f regprocedure;
begin
  for f in
    select p.oid::regprocedure
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and not exists (select 1 from pg_depend d where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;

-- Trigger and event-trigger functions are never RPCs.
do $$
declare f regprocedure;
begin
  for f in
    select p.oid::regprocedure
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prorettype in ('trigger'::regtype, 'event_trigger'::regtype)
      and not exists (select 1 from pg_depend d where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
  end loop;
end $$;

-- New functions are not executable by PUBLIC/anon/authenticated by default.
-- A new function the browser calls (or an RLS policy uses) needs an explicit
-- GRANT EXECUTE ... TO anon, authenticated.
alter default privileges for role postgres revoke execute on functions from public;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

revoke insert, update, delete, truncate, references, trigger on public.spatial_ref_sys from anon, authenticated;

revoke select on public.posts from anon, authenticated;
grant select (id, location, city, state, cross_street, summary, incident_type, created_at, expires_at, links) on public.posts to anon, authenticated;
revoke select on public.comments from anon, authenticated;
grant select (id, post_id, content, created_at) on public.comments to anon, authenticated;
