-- spatial_ref_sys is a PostGIS system table that we cannot enable RLS on
-- (owned by postgres/extension). Instead, we revoke direct access for anon role
-- while keeping it accessible for service role and authenticated users.

-- Revoke all permissions from anon role on spatial_ref_sys
REVOKE ALL ON spatial_ref_sys FROM anon;

-- Grant read-only access to authenticated role (if needed for client queries)
GRANT SELECT ON spatial_ref_sys TO authenticated;
